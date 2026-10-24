'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          audio_guide: null,
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
      } else {
        alert('Gagal menambahkan kartu.');
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-border bg-card/95">
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
              Fonetik / Romaji:
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
