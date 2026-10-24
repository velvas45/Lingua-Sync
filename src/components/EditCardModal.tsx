'use client';

import React, { useState } from 'react';
import { Pencil, Sparkles, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardItem } from './FlashcardViewer';
import { generateHeuristicAudioGuide } from './AddCardModal';

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
      alert('Mohon lengkapi kata, arti, dan contoh kalimat!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });

      if (res.ok) {
        alert('Kosakata berhasil diperbarui!');
        onCardUpdated();
        onClose();
      } else {
        const data = await res.json();
        alert('Gagal mengubah kartu: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('Error: ' + msg);
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
              onChange={(e) => setPrimaryText(e.target.value)}
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
                placeholder="<ruby>漢字<rt>かんじ</rt></ruby>"
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
