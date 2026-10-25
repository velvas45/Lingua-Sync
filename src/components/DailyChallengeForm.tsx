'use client';

import React, { useState, useRef, useSyncExternalStore } from 'react';
import {
  Send,
  Award,
  Flame,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  Clock,
  HelpCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import SpeechRecorder from './SpeechRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from './Toast';
import { useAuth } from '@/contexts/AuthContext';
import { communityService, SubmitChallengeResponse } from '@/services/communityService';

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
  hasCompletedToday?: boolean;
  todaySubmission?: {
    id: number;
    text_response: string;
    earned_xp: number;
    completion_seconds: number;
    created_at: string;
  } | null;
}

const subscribeClock = (callback: () => void) => {
  const timer = setInterval(callback, 60000);
  return () => clearInterval(timer);
};
const getClockSnapshot = () => new Date().getHours();
const getServerClockSnapshot = () => 8;

export default function DailyChallengeForm({
  prompt,
  languageCode,
  speechLocale,
  onSubmitted,
  hasCompletedToday = false,
  todaySubmission,
}: DailyChallengeFormProps) {
  const { user, isGuest, openAuthModal: onOpenAuthModal } = useAuth();

  const savedName = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem('lingua_user_name') || ''
        : '',
    () => ''
  );

  const [inputName, setInputName] = useState<string | null>(null);
  const userName = user?.username || (inputName !== null ? inputName : savedName);

  const [textResponse, setTextResponse] = useState('');
  const [speakingPracticed, setSpeakingPracticed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitChallengeResponse | null>(null);

  // Stopwatch tracking completion duration
  const startTimeRef = useRef<number | null>(null);

  // Check local user hour (strictly unlocked from 08:00 AM)
  const currentHour = useSyncExternalStore(subscribeClock, getClockSnapshot, getServerClockSnapshot);

  React.useEffect(() => {
    startTimeRef.current = Date.now();
  }, [prompt?.id]);

  const isBefore8AM = currentHour < 8;

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
      toast.error('Mohon lengkapi kalimat tantangan Anda!', 'Form Belum Lengkap');
      return;
    }

    const startTime = startTimeRef.current || Date.now();
    const durationSeconds = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const localHour = new Date().getHours();

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const data = await communityService.submitChallenge({
        userName: userName.trim(),
        languageCode,
        promptId: prompt.id,
        textResponse: textResponse.trim(),
        speakingPracticed,
        clientLocalHour: localHour,
        completionSeconds: durationSeconds,
      });

      setSubmissionResult(data);
      toast.success(
        `Tantangan harian selesai! +${data.earnedXp} XP (${data.timeTierLabel})`,
        'Kuis Berhasil Diselesaikan'
      );
      setTextResponse('');
      setSpeakingPracticed(false);
      onSubmitted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim jawaban';
      toast.error(msg, 'Gagal Mengirim Jawaban');
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
      </div>
    );
  }

  // 1. LOCKED BEFORE 08:00 AM LOCAL TIME
  if (isBefore8AM) {
    return (
      <Card className="rounded-2xl border border-amber-500/30 bg-card/90 p-7 text-center shadow-lg backdrop-blur-md space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-inner">
          <Clock className="h-6 w-6" />
        </div>
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
          Jadwal Kuis Harian: 08:00 Pagi
        </Badge>
        <h3 className="text-base font-extrabold text-foreground">
          Kuis Tantangan Hari Ini Dibuka Pukul 08:00 Pagi
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Waktu lokal perangkat Anda saat ini masih sebelum pukul 08:00. Kembali lagi pada jam 08:00 untuk memulai kuis dan raih bonus <strong>Early Bird 1.5x Multiplier</strong>!
        </p>
      </Card>
    );
  }

  // 2. STRICTLY 1X PER DAY: COMPLETED TODAY NOTICE
  if (hasCompletedToday && !submissionResult) {
    return (
      <Card className="rounded-2xl border border-emerald-500/30 bg-card/90 p-6 sm:p-7 text-center shadow-lg backdrop-blur-md space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-inner">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          Kuis 1x Sehari Selesai
        </Badge>
        <h3 className="text-base font-extrabold text-foreground">
          Tantangan Hari Ini Sudah Selesai!
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Hebat! Anda telah menyelesaikan kuis resmi hari ini. Tantangan berikutnya akan dibuka besok pukul 08:00 pagi.
        </p>

        {todaySubmission && (
          <div className="rounded-xl border border-border bg-secondary/40 p-3.5 text-xs max-w-md mx-auto text-left space-y-1.5 mt-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Jawaban Anda Hari Ini:
            </span>
            <p className="font-semibold text-foreground italic leading-relaxed">
              “{todaySubmission.text_response}”
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/60 text-muted-foreground">
              <span>Perolehan: <strong className="text-emerald-600 dark:text-emerald-400">+{todaySubmission.earned_xp} XP</strong></span>
              <span className="flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400">
                <Clock className="h-3 w-3" /> {todaySubmission.completion_seconds} detik
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="relative rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Guest Lock Overlay */}
      {isGuest && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-background/75 p-6 text-center backdrop-blur-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="mb-1 text-base sm:text-lg font-bold text-foreground">
            Latihan Praktik Terkunci
          </h4>
          <p className="mb-4 max-w-xs text-xs text-muted-foreground leading-relaxed">
            Masuk atau daftarkan akun LinguaSync untuk menyimpan progres latihan, mendapatkan XP, dan membangun streak harian!
          </p>
          <Button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto gap-2 font-semibold shadow-lg shadow-primary/30 text-xs sm:text-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Masuk / Buat Akun untuk Menjawab</span>
          </Button>
        </div>
      )}

      {/* Main Form */}
      <div className={isGuest ? 'filter blur-[3.5px] pointer-events-none select-none opacity-40' : ''}>
        {/* Header with Early Bird Live Indicator */}
        <div className="mb-3.5 sm:mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25 shrink-0">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                Latihan Praktik Harian (Daily Quiz)
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Batas 1x pengerjaan per hari. Dimulai jam 08:00 pagi.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
            {currentHour >= 8 && currentHour < 9
              ? '⚡ Early Bird 1.5x'
              : currentHour >= 9 && currentHour < 12
              ? '☀️ Morning 1.2x'
              : '🕒 Reguler 1.0x'}
          </Badge>
        </div>

        {/* Prompt Question Box */}
        <div className="mb-4 sm:mb-5 rounded-r-lg border-l-4 border-primary bg-secondary/30 p-3 sm:p-4">
          <p className="mb-1 text-sm sm:text-base font-semibold text-foreground leading-relaxed">
            {prompt.prompt_question}
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            💡 <strong className="text-foreground">Petunjuk / Target Kata:</strong> {prompt.hint}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* User Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Nama Pengguna:
            </label>
            <div className="relative">
              <Input
                type="text"
                value={userName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Helmi / Sarah / Budi"
                className="pl-9"
                disabled={Boolean(user?.username)}
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
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Bonus Speaking Aktif (+10 XP)
                </span>
              )}
            </div>

            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder={
                languageCode === 'en'
                  ? 'Write your sentence here (e.g., I reached a major milestone today...)'
                  : 'ここに文を書いてください (例: 今日は新しい挑戦に向けて準備を始めました...)'
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

          {/* Live Linguistic Grammar Analysis & Feedback Card */}
          {submissionResult && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-3 text-xs animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <span className="font-extrabold text-foreground flex items-center gap-1.5 text-sm">
                  <Award className="h-4 w-4 text-primary" /> Hasil Evaluasi Jawaban ({submissionResult.analysis.score}/100)
                </span>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold">
                  ⏱️ {submissionResult.durationSeconds} Detik
                </Badge>
              </div>

              <p className="text-foreground leading-relaxed font-medium">
                {submissionResult.analysis.grammarFeedback}
              </p>

              {/* XP Breakdown Pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="bg-background/60 p-2 rounded-lg border border-border">
                  <span className="text-muted-foreground block">Base XP</span>
                  <strong className="text-foreground">+{submissionResult.breakdown.base} XP</strong>
                </div>
                <div className="bg-background/60 p-2 rounded-lg border border-border">
                  <span className="text-muted-foreground block">Voice Bonus</span>
                  <strong className="text-emerald-500">+{submissionResult.breakdown.voice} XP</strong>
                </div>
                <div className="bg-background/60 p-2 rounded-lg border border-border">
                  <span className="text-muted-foreground block">Grammar Quality</span>
                  <strong className="text-indigo-500">+{submissionResult.breakdown.grammarBonus} XP</strong>
                </div>
                <div className="bg-background/60 p-2 rounded-lg border border-border">
                  <span className="text-muted-foreground block">Total XP ({submissionResult.timeTierLabel})</span>
                  <strong className="text-primary text-xs">+{submissionResult.earnedXp} XP</strong>
                </div>
              </div>

              {/* Suggestions / Tips if any */}
              {submissionResult.analysis.suggestions.length > 0 && (
                <div className="rounded-lg bg-background/50 p-2.5 border border-border space-y-1">
                  <span className="font-bold text-muted-foreground block text-[10px] uppercase">
                    Tips Perbaikan Bahasa:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                    {submissionResult.analysis.suggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <span>{isSubmitting ? 'Menganalisis & Mengirim...' : 'Kirim Jawaban Kuis'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
