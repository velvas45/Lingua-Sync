'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Send, Award, Flame, User, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import SpeechRecorder from './SpeechRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DailyChallengeFormProps {
  prompt: {
    id: number;
    prompt_question: string;
    hint: string;
    card_text?: string;
  } | null;
  languageCode: string;
  speechLocale: string;
  onSubmitted: () => void;
  isGuest?: boolean;
  onOpenAuthModal?: () => void;
  currentUsername?: string;
}

export default function DailyChallengeForm({
  prompt,
  languageCode,
  speechLocale,
  onSubmitted,
  isGuest = false,
  onOpenAuthModal,
  currentUsername,
}: DailyChallengeFormProps) {
  const savedName = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => (typeof window !== 'undefined' ? localStorage.getItem('lingua_user_name') || '' : ''),
    () => ''
  );

  const [inputName, setInputName] = useState<string | null>(null);
  const userName = currentUsername || (inputName !== null ? inputName : savedName);

  const [textResponse, setTextResponse] = useState('');
  const [speakingPracticed, setSpeakingPracticed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setInputName(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingua_user_name', val);
    }
  };

  const handleSpeechTranscript = (spokenText: string) => {
    setSpeakingPracticed(true);
    setTextResponse((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenAuthModal?.();
      return;
    }

    if (!userName.trim() || !textResponse.trim() || !prompt) {
      alert('Mohon lengkapi kalimat tantangan Anda!');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName.trim(),
          languageCode,
          promptId: prompt.id,
          textResponse: textResponse.trim(),
          speakingPracticed,
        }),
      });

      const data = (await res.json()) as { earnedXp?: number; error?: string };
      if (res.ok) {
        setSuccessMsg(
          `Tantangan harian berhasil tersimpan! +${data.earnedXp ?? 15} XP ditambahkan ke profil Anda.`
        );
        setTextResponse('');
        setSpeakingPracticed(false);
        onSubmitted();
        setTimeout(() => setSuccessMsg(null), 6000);
      } else {
        alert('Gagal mengirim: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Gagal mengirim jawaban: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!prompt) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-7 text-center text-muted-foreground backdrop-blur-md">
        <p className="text-sm font-semibold text-foreground">
          Belum ada tantangan harian untuk bahasa ini.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Silakan beralih ke bahasa lain atau kembali lagi nanti!
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-card/80 p-7 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
      {/* Blurred Overlay for Guest Users */}
      {isGuest && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-background/75 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/30 mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-foreground mb-1">
            Tantangan Harian Eksklusif Anggota
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">
            Selesaikan tantangan harian untuk menguji pemahaman, melatih speaking audio native, dan mengumpulkan XP untuk tim!
          </p>
          <Button
            type="button"
            onClick={onOpenAuthModal}
            size="default"
            className="gap-2 font-semibold shadow-lg shadow-primary/30"
          >
            <Sparkles className="h-4 w-4" />
            <span>Masuk / Buat Akun untuk Menjawab</span>
          </Button>
        </div>
      )}

      {/* Actual Form (Blurred when guest) */}
      <div className={isGuest ? 'filter blur-[3.5px] pointer-events-none select-none opacity-40' : ''}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Daily Micro-Output Challenge (Tantangan Hari Ini)
            </h3>
            <p className="text-xs text-muted-foreground">
              Latih kemampuan aktifmu. Buat 1-2 kalimat langsung dalam bahasa target!
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-r-lg border-l-4 border-primary bg-secondary/30 p-4">
          <p className="mb-1 text-base font-semibold text-foreground">
            {prompt.prompt_question}
          </p>
          <p className="text-xs text-muted-foreground">
            💡 <strong className="text-foreground">Petunjuk / Inspirasi:</strong> {prompt.hint}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Nama Anda (Akun Tim):
            </label>
            <div className="relative">
              <Input
                type="text"
                value={userName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Helmi / Rizky / Sarah"
                className="pl-9"
                disabled={Boolean(currentUsername)}
                required
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Text Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Tulis Kalimat Anda ({languageCode === 'en' ? 'Bahasa Inggris' : 'Bahasa Jepang'}):
              </label>
              {speakingPracticed && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Bonus Speaking Aktif (+10 XP)
                </span>
              )}
            </div>

            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder={
                languageCode === 'en'
                  ? "Write your sentence here (e.g., I created a pull request to optimize database queries...)"
                  : "ここに文を書いてください (例: 今日のタスクの進捗を確認しました...)"
              }
              rows={3}
              className="w-full rounded-md border border-input bg-background/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              required
            />
          </div>

          {/* Speech Practice Section */}
          <div className="border-t border-border/80 pt-3">
            <SpeechRecorder
              langLocale={speechLocale}
              onTranscript={handleSpeechTranscript}
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-3 text-sm text-emerald-400">
              <Award className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="gap-2 font-semibold shadow-lg shadow-primary/20"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Kirim Jawaban Harian (+15 XP)'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
