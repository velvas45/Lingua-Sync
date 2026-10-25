'use client';

import React, { useState, useRef } from 'react';
import { Pencil, Sparkles, Wand2, Lock, Unlock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardItem } from './FlashcardViewer';
import { generateHeuristicAudioGuide } from './AddCardModal';
import { toast } from './Toast';
import { cardsService } from '@/services/cardsService';
import { phoneticService } from '@/services/phoneticService';
import { generatePhonetic } from '@/lib/phoneticGenerator';
import { generateFuriganaHtml } from '@/lib/furigana';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardItem | null;
  langCode: string;
  onCardUpdated: () => void;
}

export default function EditCardModal({
  isOpen,
  onClose,
  card,
  langCode,
  onCardUpdated,
}: EditCardModalProps) {
  const [primaryText, setPrimaryText] = useState(card?.primary_text || '');
  const [phonetic, setPhonetic] = useState(card?.phonetic || '');
  const [furiganaHtml, setFuriganaHtml] = useState(card?.furigana_html || '');
  const [meaningId, setMeaningId] = useState(card?.meaning_id || '');
  const [exampleSource, setExampleSource] = useState(card?.example_source || '');
  const [exampleMeaning, setExampleMeaning] = useState(card?.example_meaning || '');
  const [audioGuide, setAudioGuide] = useState(card?.audio_guide || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManualPhonetic, setIsManualPhonetic] = useState(false);
  const [isManualFurigana, setIsManualFurigana] = useState(false);
  const debouncePhoneticRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrimaryTextChange = (val: string) => {
    setPrimaryText(val);

    if (!val.trim()) {
      if (!isManualPhonetic) setPhonetic('');
      if (!isManualFurigana) setFuriganaHtml('');
      return;
    }

    // 1. Instant local optimistic phonetic & furigana
    if (!isManualPhonetic) {
      const localGuess = generatePhonetic(val, langCode === 'ja' ? 'ja' : 'en');
      setPhonetic(localGuess);
    }

    if (langCode === 'ja' && !isManualFurigana) {
      const instantFurigana = generateFuriganaHtml(val);
      setFuriganaHtml(instantFurigana || '');
    }

    // 2. Debounced authentic dictionary lookup
    if (debouncePhoneticRef.current) {
      clearTimeout(debouncePhoneticRef.current);
    }

    debouncePhoneticRef.current = setTimeout(async () => {
      try {
        const res = await phoneticService.resolvePhonetic(val, langCode);
        if (res.phonetic && !isManualPhonetic) {
          setPhonetic(res.phonetic);
        }
        if (res.furigana_html !== undefined && !isManualFurigana && langCode === 'ja') {
          setFuriganaHtml(res.furigana_html || '');
        }
      } catch (err) {
        console.warn('Silent phonetic resolution error:', err);
      }
    }, 250);
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
    if (!card || !primaryText || !meaningId || !exampleSource || !exampleMeaning) {
      toast.error('Mohon lengkapi kata, arti, dan contoh kalimat!', 'Form Belum Lengkap');
      return;
    }

    setIsSubmitting(true);
    try {
      await cardsService.updateCard({
        id: card.id,
        primary_text: primaryText,
        phonetic: phonetic || null,
        furigana_html: furiganaHtml || null,
        meaning_id: meaningId,
        part_of_speech: card.part_of_speech || 'Vocabulary',
        level: card.level || 'Intermediate',
        example_source: exampleSource,
        example_meaning: exampleMeaning,
        audio_guide: audioGuide.trim() || null,
      });

      toast.success(`Kosakata "${primaryText}" berhasil diperbarui!`, 'Perubahan Tersimpan');
      onCardUpdated();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan saat mengubah kartu';
      toast.error(msg, 'Gagal Memperbarui');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Edit Kosakata: {card.primary_text}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Perbaiki ejaan, arti, atau contoh kalimat kartu kosakata Anda
              </p>
            </div>
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
              onChange={(e) => handlePrimaryTextChange(e.target.value)}
              required
            />
          </div>

          {langCode === 'ja' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span>Furigana HTML:</span>
                  {!isManualFurigana && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5 inline" /> Otomatis
                    </Badge>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualFurigana(!isManualFurigana)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
                  title={isManualFurigana ? "Kunci ke mode otomatis" : "Buka untuk mengedit manual"}
                >
                  {isManualFurigana ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  <span>{isManualFurigana ? "Kunci Otomatis" : "Ubah Manual"}</span>
                </button>
              </div>
              <Input
                type="text"
                value={furiganaHtml}
                onChange={(e) => setFuriganaHtml(e.target.value)}
                disabled={!isManualFurigana}
                className={`font-mono text-xs ${!isManualFurigana ? "bg-secondary/40 text-muted-foreground cursor-not-allowed" : ""}`}
                placeholder="<ruby>漢字<rt>かんじ</rt></ruby>"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <span>Fonetik / Romaji:</span>
                {!isManualPhonetic && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5 inline" /> Otomatis
                  </Badge>
                )}
              </label>
              <button
                type="button"
                onClick={() => setIsManualPhonetic(!isManualPhonetic)}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
                title={isManualPhonetic ? "Kunci ke mode otomatis" : "Buka untuk mengedit manual"}
              >
                {isManualPhonetic ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span>{isManualPhonetic ? "Kunci Otomatis" : "Ubah Manual"}</span>
              </button>
            </div>
            <Input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              disabled={!isManualPhonetic}
              className={!isManualPhonetic ? "bg-secondary/40 text-muted-foreground cursor-not-allowed" : ""}
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
                title="Hasilkan tips pengucapan otomatis berdasarkan kata"
              >
                <span>💡 Perbarui Tips Otomatis</span>
              </Button>
            </div>
            <Input
              type="text"
              value={audioGuide}
              onChange={(e) => setAudioGuide(e.target.value)}
              placeholder="Tips pengucapan / intonasi"
              className="text-xs border-cyan-500/30 focus-visible:ring-cyan-500/40"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
