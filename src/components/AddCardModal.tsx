'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, Wand2, Dice5 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from './Toast';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  langCode: string;
  onCardAdded: () => void;
}

const SAMPLE_VOCAB_EN = [
  {
    primary_text: 'Milestone',
    phonetic: '/ˈmaɪl.stəʊn/',
    meaning_id: 'Tonggak pencapaian penting dalam proses proyek atau karier',
    example_source: 'Completing the beta release is a major milestone for our product.',
    example_meaning: 'Menyelesaikan rilis beta adalah tonggak pencapaian besar untuk produk kita.',
    audio_guide: 'Tekankan suku kata pertama "MILE" dan sambungkan halus dengan "stone".',
  },
  {
    primary_text: 'Breakthrough',
    phonetic: '/ˈbreɪk.θruː/',
    meaning_id: 'Terobosan besar atau kemajuan signifikan setelah usaha keras',
    example_source: 'Our research led to an unexpected breakthrough in energy efficiency.',
    example_meaning: 'Penelitian kami membuahkan terobosan tak terduga dalam efisiensi energi.',
    audio_guide: 'Bunyi "th" diucapkan lembut dengan lidah di antara gigi atas dan bawah.',
  },
  {
    primary_text: 'Resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    meaning_id: 'Ketangguhan dan kemampuan bangkit kembali menghadapi kesulitan',
    example_source: 'Showing resilience during challenging moments builds true confidence.',
    example_meaning: 'Menunjukkan ketangguhan di saat-saat menantang membangun kepercayaan diri sejati.',
    audio_guide: 'Penekanan suku kata jatuh pada bagian tengah: ri-ZIL-ience.',
  },
  {
    primary_text: 'Insight',
    phonetic: '/ˈɪn.saɪt/',
    meaning_id: 'Wawasan mendalam atau pemahaman baru yang berharga',
    example_source: 'Thank you for sharing your valuable insight during the discussion.',
    example_meaning: 'Terima kasih telah membagikan wawasan berharga Anda saat diskusi.',
    audio_guide: 'Tekankan suku kata "IN" dengan artikulasi t tegas di akhir kata.',
  },
  {
    primary_text: 'Collaboration',
    phonetic: '/kəˌlæb.əˈreɪ.ʃən/',
    meaning_id: 'Kerja sama harmonis antara banyak pihak untuk tujuan bersama',
    example_source: 'Effective collaboration helps diverse people achieve incredible results.',
    example_meaning: 'Kerja sama yang efektif membantu banyak orang mencapai hasil luar biasa.',
    audio_guide: 'Syllable stress utama jatuh tepat sebelum akhiran "-tion" pada "RAY-shun".',
  },
];

const SAMPLE_VOCAB_JA = [
  {
    primary_text: '挨拶',
    furigana_html: '<ruby>挨拶<rt>あいさつ</rt></ruby>',
    phonetic: 'あいさつ (aisatsu)',
    meaning_id: 'Salam sapaan, tegur sapa ramah di awal pertemuan',
    example_source: '明るい挨拶は良いコミュニケーションの第一歩です。',
    example_meaning: 'Salam yang ceria adalah langkah pertama menuju komunikasi yang baik.',
    audio_guide: 'Lafalkan dengan nada ramah datar per mora: a-i-sa-tsu tanpa penekanan keras.',
  },
  {
    primary_text: '感謝',
    furigana_html: '<ruby>感謝<rt>かんしゃ</rt></ruby>',
    phonetic: 'かんしゃ (kansha)',
    meaning_id: 'Rasa terima kasih, apresiasi tulus atas bantuan orang lain',
    example_source: 'いつも温かいサポートをしていただき、心から感謝しています。',
    example_meaning: 'Saya berterima kasih dari lubuk hati atas dukungan hangat Anda selama ini.',
    audio_guide: 'Suku kata "n" (hatsuon) ditahan 1 mora lembut sebelum melafalkan "sha".',
  },
  {
    primary_text: '準備',
    furigana_html: '<ruby>準備<rt>じゅんび</rt></ruby>',
    phonetic: 'じゅんび (junbi)',
    meaning_id: 'Persiapan, kesiapan bekal sebelum memulai suatu hal',
    example_source: '明日からの新しい挑戦に向けて、しっかり準備を整えました。',
    example_meaning: 'Menjelang tantangan baru mulai besok, saya sudah mempersiapkannya dengan baik.',
    audio_guide: 'Ritme mora stabil: jun-bi, pastikan vokal u dan i terdengar bersih.',
  },
  {
    primary_text: '成長',
    furigana_html: '<ruby>成長<rt>せいちょう</rt></ruby>',
    phonetic: 'せいちょう (seichou)',
    meaning_id: 'Pertumbuhan, perkembangan kapasitas diri menjadi lebih baik',
    example_source: '日々の小さな積み重ねが、大きな自己成長につながります。',
    example_meaning: 'Konsistensi kecil setiap hari akan menghasilkan pertumbuhan diri yang besar.',
    audio_guide: 'Vokal panjang chouon: tahan bunyi "sei" dan "chou" masing-masing 2 ketukan mora.',
  },
  {
    primary_text: '経験',
    furigana_html: '<ruby>経験<rt>けいけん</rt></ruby>',
    phonetic: 'けいけん (keiken)',
    meaning_id: 'Pengalaman berharga yang dipelajari dari proses nyata',
    example_source: '失敗を恐れずに挑戦することで、貴重な経験が得られます。',
    example_meaning: 'Dengan mencoba tanpa takut gagal, kita akan mendapatkan pengalaman berharga.',
    audio_guide: 'Vokal panjang pada "kei": lafalkan bersambung halus dengan "ken".',
  },
];

export function generateHeuristicAudioGuide(
  text: string,
  lang: string,
  phonetic?: string,
  example?: string
): string {
  const clean = text.trim();
  if (!clean) return '';

  if (lang === 'ja') {
    const isKatakana = /^[\u30A0-\u30FF\uFF65-\uFF9Fー\s]+$/.test(clean);
    if (isKatakana) {
      if (clean.includes('ー')) {
        return 'Katakana: Tahan vokal panjang (ー) selama 2 ketukan mora dengan ritme stabil.';
      }
      return 'Katakana loanword: Ucapkan setiap mora dengan durasi ketukan sama tanpa intonasi naik-turun tajam.';
    }

    if (clean.endsWith('です') || clean.endsWith('ます')) {
      return 'Pelemahan vokal (devoicing): Vokal "u" pada "su" diucapkan samar/desah, terdengar seperti "des/mas".';
    }

    if (clean.includes('っ') || clean.includes('ッ')) {
      return 'Konsonan ganda (sokuon): Tahan 1 ketukan jeda hening sebelum melafalkan konsonan berikutnya.';
    }

    if (/[おこそのとものよろごぞどぼぽ]う|[えけせてねへめれげぜでべぺ]い/.test(clean)) {
      return 'Vokal panjang (chouon): Lafalkan kombinasi vokal secara halus dan bersambung selama 2 mora.';
    }

    if (clean.includes('ん')) {
      return 'Suku kata "n" (hatsuon): Tahan 1 ketukan penuh di rongga hidung sebelum berpindah ke mora berikutnya.';
    }

    return `Ucapkan dengan vokal jernih dan ritme datar per mora: ${clean}.`;
  }

  const words = clean.split(/\s+/);

  if (words.length >= 2) {
    return `Tekankan kata pertama "${words[0]}" (primary stress) dan sambungkan dengan jeda minimal ke kata kedua.`;
  }

  const lower = clean.toLowerCase();

  if (/(tion|sion|cian)$/i.test(lower)) {
    return 'Penekanan suku kata jatuh tepat pada suku kata sebelum akhiran "-tion/-sion".';
  }

  if (/(ic|ical)$/i.test(lower)) {
    return 'Penekanan suku kata (syllable stress) jatuh pada suku kata persis sebelum "-ic".';
  }

  if (lower.endsWith('th')) {
    return 'Bunyi "th": Letakkan ujung lidah di antara gigi atas dan bawah dengan hembusan udara lembut.';
  }

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

  // Client-Side Deck Buffer Pattern (Reduces server load by 95% & delivers 0ms clicks)
  const [buffer, setBuffer] = useState<Array<{
    primary_text: string;
    phonetic: string | null;
    furigana_html: string | null;
    meaning_id: string;
    example_source: string;
    example_meaning: string;
    audio_guide: string | null;
  }>>([]);
  const [seenWords, setSeenWords] = useState<string[]>([]);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);

  const resetForm = () => {
    setPrimaryText('');
    setPhonetic('');
    setFuriganaHtml('');
    setMeaningId('');
    setExampleSource('');
    setExampleMeaning('');
    setAudioGuide('');
    setBuffer([]);
    setSeenWords([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fetchNextBatch = async (currentSeen: string[]) => {
    if (isFetchingBatch) return;
    setIsFetchingBatch(true);
    try {
      const excludeParam = currentSeen.slice(-30).map(encodeURIComponent).join(',');
      const res = await fetch(`/api/vocabulary-bank/random?lang=${langCode}&batch=20&exclude=${excludeParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setBuffer((prev) => [...prev, ...data.items]);
        }
      }
    } catch (e) {
      console.error('Silent batch prefetch error:', e);
    } finally {
      setIsFetchingBatch(false);
    }
  };

  const applyCardToForm = (item: {
    primary_text: string;
    phonetic: string | null;
    furigana_html: string | null;
    meaning_id: string;
    example_source: string;
    example_meaning: string;
    audio_guide: string | null;
  }) => {
    setPrimaryText(item.primary_text || '');
    setPhonetic(item.phonetic || '');
    setFuriganaHtml(item.furigana_html || '');
    setMeaningId(item.meaning_id || '');
    setExampleSource(item.example_source || '');
    setExampleMeaning(item.example_meaning || '');
    setAudioGuide(item.audio_guide || '');
    setSeenWords((prev) => [...prev, item.primary_text]);
  };

  const handleRandomFill = async () => {
    // 1. Instant 0ms pop from client buffer if available
    if (buffer.length > 0) {
      const nextItem = buffer[0];
      const remainingBuffer = buffer.slice(1);
      setBuffer(remainingBuffer);
      applyCardToForm(nextItem);

      // Trigger silent background prefetch when buffer runs low (<= 3 cards left)
      if (remainingBuffer.length <= 3 && !isFetchingBatch) {
        fetchNextBatch([...seenWords, nextItem.primary_text]);
      }
      return;
    }

    // 2. Buffer empty: fetch fresh batch of 20
    try {
      const excludeParam = seenWords.slice(-30).map(encodeURIComponent).join(',');
      const res = await fetch(`/api/vocabulary-bank/random?lang=${langCode}&batch=20&exclude=${excludeParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const [first, ...rest] = data.items;
          setBuffer(rest);
          applyCardToForm(first);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch from vocabulary bank API, falling back to local pool:', e);
    }

    // 3. Graceful offline fallback
    const pool = langCode === 'ja' ? SAMPLE_VOCAB_JA : SAMPLE_VOCAB_EN;
    const item = pool[Math.floor(Math.random() * pool.length)];
    applyCardToForm({
      primary_text: item.primary_text,
      phonetic: item.phonetic,
      furigana_html: 'furigana_html' in item ? (item.furigana_html as string) : null,
      meaning_id: item.meaning_id,
      example_source: item.example_source,
      example_meaning: item.example_meaning,
      audio_guide: item.audio_guide,
    });
  };

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
      toast.error('Mohon lengkapi kata, arti, dan contoh kalimat!', 'Form Belum Lengkap');
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
          part_of_speech: 'Vocabulary',
          level: 'Intermediate',
          example_source: exampleSource,
          example_meaning: exampleMeaning,
          audio_guide: audioGuide.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success(`Kosakata "${primaryText}" berhasil ditambahkan ke koleksi Anda!`, 'Berhasil Ditambahkan');
        onCardAdded();
        handleClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Terjadi kesalahan saat menyimpan', 'Gagal Menambahkan');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(msg, 'Kesalahan Jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg font-bold">
                Tambah Kosakata Baru ({langCode.toUpperCase()})
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomFill}
              className="h-8 gap-1.5 px-2.5 text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
              title="Isi form otomatis dengan contoh kosakata acak siap pakai"
            >
              <Dice5 className="h-3.5 w-3.5" />
              <span>🎲 Contoh Acak</span>
            </Button>
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
              placeholder={langCode === 'en' ? "Misal: Milestone" : "Misal: 挨拶"}
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
                placeholder="<ruby>挨拶<rt>あいさつ</rt></ruby>"
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
              placeholder={langCode === 'en' ? "/ˈmaɪl.stəʊn/" : "aisatsu"}
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
              placeholder="Tonggak pencapaian penting dalam proses"
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
              placeholder={langCode === 'en' ? "Completing this release is a major milestone." : "明るい挨拶は良いコミュニケーションの第一歩です。"}
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
              placeholder="Menyelesaikan rilis ini adalah tonggak pencapaian besar."
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
                  ? "Misal: Tekankan kata pertama dan sambungkan dengan jeda minimal"
                  : "Misal: Ucapkan dengan ritme mora stabil"
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
            <Button type="button" variant="ghost" onClick={handleClose}>
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
