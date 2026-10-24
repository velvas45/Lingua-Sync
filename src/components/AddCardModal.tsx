'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  langCode: string;
  onCardAdded: () => void;
}

export function generateHeuristicAudioGuide(
  text: string,
  lang: string,
  phonetic?: string,
  example?: string
): string {
  const clean = text.trim();
  if (!clean) return '';

  if (lang === 'ja') {
    // 1. Katakana check
    const isKatakana = /^[\u30A0-\u30FF\uFF65-\uFF9Fー\s]+$/.test(clean);
    if (isKatakana) {
      if (clean.includes('ー')) {
        return 'Katakana tech term: Tahan vokal panjang (ー) selama 2 ketukan mora dengan ritme stabil.';
      }
      return 'Katakana loanword: Ucapkan setiap mora dengan durasi ketukan sama tanpa intonasi naik-turun tajam.';
    }

    // 2. Ending with です / ます
    if (clean.endsWith('です') || clean.endsWith('ます')) {
      return 'Pelemahan vokal (devoicing): Vokal "u" pada "su" diucapkan samar/desah, terdengar seperti "des/mas".';
    }

    // 3. Small tsu (sokuon: っ / ッ)
    if (clean.includes('っ') || clean.includes('ッ')) {
      return 'Konsonan ganda (sokuon): Tahan 1 ketukan jeda hening sebelum melafalkan konsonan berikutnya.';
    }

    // 4. Long vowels (おう, えい)
    if (/[おこそのとものよろごぞどぼぽ]う|[えけせてねへめれげぜでべぺ]い/.test(clean)) {
      return 'Vokal panjang (chouon): Lafalkan kombinasi vokal secara halus dan bersambung selama 2 mora.';
    }

    // 5. Sound nasalization (ん)
    if (clean.includes('ん')) {
      return 'Suku kata "n" (hatsuon): Tahan 1 ketukan penuh di rongga hidung sebelum berpindah ke mora berikutnya.';
    }

    return `Ucapkan dengan vokal jernih dan ritme datar per mora: ${clean}.`;
  }

  // English heuristics
  const words = clean.split(/\s+/);

  // 1. Compound terms (e.g. "Pull Request", "Edge Case")
  if (words.length >= 2) {
    return `Tekankan kata pertama "${words[0]}" (primary stress) dan sambungkan dengan jeda minimal ke kata kedua.`;
  }

  const lower = clean.toLowerCase();

  // 2. Suffix -tion, -sion
  if (/(tion|sion|cian)$/i.test(lower)) {
    return 'Penekanan suku kata jatuh tepat pada suku kata sebelum akhiran "-tion/-sion".';
  }

  // 3. Suffix -ic, -ical
  if (/(ic|ical)$/i.test(lower)) {
    return 'Penekanan suku kata (syllable stress) jatuh pada suku kata persis sebelum "-ic".';
  }

  // 4. Suffix -th
  if (lower.endsWith('th')) {
    return 'Bunyi "th": Letakkan ujung lidah di antara gigi atas dan bawah dengan hembusan udara lembut.';
  }

  // 5. Multi-syllable tech terms
  if (lower.length > 7) {
    return `Fokus pada penekanan suku kata utama dan pastikan konsonan penutup pada "${clean}" terdengar tegas.`;
  }

  return `Ucapkan dengan artikulasi percaya diri, pastikan konsonan akhir pada "${clean}" terdengar jelas.`;
}

export default function AddCardModal({
  isOpen,
  onClose,
  langCode,
  onCardAdded,
}: AddCardModalProps) {
  const [primaryText, setPrimaryText] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [furiganaHtml, setFuriganaHtml] = useState('');
  const [meaningId, setMeaningId] = useState('');
  const [exampleSource, setExampleSource] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [audioGuide, setAudioGuide] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutoGenerateGuide = () => {
    if (!primaryText.trim()) return;
    const generated = generateHeuristicAudioGuide(
      primaryText,
      langCode,
      phonetic,
      exampleSource
    );
    setAudioGuide(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryText || !meaningId || !exampleSource || !exampleMeaning) {
      alert('Mohon lengkapi kata, arti, dan contoh kalimat!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_code: langCode,
          primary_text: primaryText,
          phonetic: phonetic || null,
          furigana_html: furiganaHtml || null,
          meaning_id: meaningId,
          part_of_speech: 'Tech Vocabulary',
          level: 'Intermediate',
          example_source: exampleSource,
          example_meaning: exampleMeaning,
          audio_guide: audioGuide.trim() || null,
        }),
      });

      if (res.ok) {
        alert('Kosakata baru berhasil ditambahkan!');
        onCardAdded();
        onClose();
        // Reset form
        setPrimaryText('');
        setPhonetic('');
        setFuriganaHtml('');
        setMeaningId('');
        setExampleSource('');
        setExampleMeaning('');
        setAudioGuide('');
      } else {
        const data = await res.json();
        alert('Gagal menambahkan kartu: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('Error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">
              Tambah Kosakata Baru ({langCode.toUpperCase()})
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Kata / Frasa Asli:
            </label>
            <Input
              type="text"
              value={primaryText}
              onChange={(e) => setPrimaryText(e.target.value)}
              placeholder={langCode === 'en' ? "Misal: Tech Debt" : "Misal: 仕様書"}
              required
            />
          </div>

          {langCode === 'ja' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Furigana HTML (Opsional):
              </label>
              <Input
                type="text"
                value={furiganaHtml}
                onChange={(e) => setFuriganaHtml(e.target.value)}
                placeholder="<ruby>仕様書<rt>しようしょ</rt></ruby>"
                className="font-mono text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Fonetik / Romaji (Opsional):
            </label>
            <Input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder={langCode === 'en' ? "/tek det/" : "shiyousho"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Arti Bahasa Indonesia:
            </label>
            <Input
              type="text"
              value={meaningId}
              onChange={(e) => setMeaningId(e.target.value)}
              placeholder="Dokumen spesifikasi teknis"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Contoh Kalimat (Bahasa Target):
            </label>
            <Input
              type="text"
              value={exampleSource}
              onChange={(e) => setExampleSource(e.target.value)}
              placeholder={langCode === 'en' ? "Please check the technical debt in this module." : "仕様書を確認してください。"}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Arti Contoh Kalimat:
            </label>
            <Input
              type="text"
              value={exampleMeaning}
              onChange={(e) => setExampleMeaning(e.target.value)}
              placeholder="Tolong periksa dokumen spesifikasinya."
              required
            />
          </div>

          {/* Audio Guide (Tips Pengucapan / Artikulasi Heuristik) */}
          <div className="space-y-2 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" /> Tips Pengucapan (Audio Guide):
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoGenerateGuide}
                disabled={!primaryText.trim()}
                className="h-7 gap-1 px-2 text-[11px] font-semibold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15"
                title="Hasilkan tips pengucapan otomatis berdasarkan kata yang diketik"
              >
                <span>💡 Buat Tips Otomatis</span>
              </Button>
            </div>
            <Input
              type="text"
              value={audioGuide}
              onChange={(e) => setAudioGuide(e.target.value)}
              placeholder={
                langCode === 'en'
                  ? "Misal: Tekankan kata 'Pull' dan sambungkan dengan jeda minimal"
                  : "Misal: Ucapkan dengan ritme mora stabil, vokal panjang pada 'shuu'"
              }
              className="text-xs border-cyan-500/30 focus-visible:ring-cyan-500/40"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-muted-foreground font-medium">Saran Cepat:</span>
              {(langCode === 'ja'
                ? [
                    'Vokal panjang (chouon)',
                    'Pelemahan vokal "su"',
                    'Jeda sokuon (っ)',
                    'Ritme mora stabil',
                  ]
                : [
                    'Primary stress kata pertama',
                    'Sambungkan jeda minimal',
                    'Konsonan akhir tegas',
                    'Intonasi ramah/santun',
                  ]
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setAudioGuide((prev) =>
                      prev ? `${prev}. ${preset}.` : `${preset}.`
                    )
                  }
                  className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Tambah ke Koleksi'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
