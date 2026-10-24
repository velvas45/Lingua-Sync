'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  Pencil,
  Trash2,
} from 'lucide-react';
import AudioButton from './AudioButton';
import RubyText from './RubyText';
import EditCardModal from './EditCardModal';
import ConfirmDialog from './ConfirmDialog';
import { toast } from './Toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface CardItem {
  id: number;
  user_id?: number | null;
  language_code: string;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech: string | null;
  level: string | null;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
}

interface FlashcardViewerProps {
  cards: CardItem[];
  speechLocale: string;
  langCode: string;
  isLoggedIn?: boolean;
  onCardMutated?: () => void;
}

function getPaginationWindow(currentIndex: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [0];

  if (currentIndex > 2) {
    pages.push('ellipsis-start');
  }

  const start = Math.max(1, currentIndex - 1);
  const end = Math.min(total - 2, currentIndex + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentIndex < total - 3) {
    pages.push('ellipsis-end');
  }

  pages.push(total - 1);
  return pages;
}

export default function FlashcardViewer({
  cards,
  speechLocale,
  langCode,
  isLoggedIn = false,
  onCardMutated,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-border/80 bg-card/60">
        Belum ada kartu kosakata untuk bahasa ini.
      </Card>
    );
  }

  // Clamped safe index prevents any out-of-bounds access
  const safeIndex = currentIndex >= 0 && currentIndex < cards.length ? currentIndex : 0;
  const currentCard = cards[safeIndex];

  if (!currentCard) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-border/80 bg-card/60">
        Belum ada kartu kosakata untuk bahasa ini.
      </Card>
    );
  }

  const handleNext = () => {
    if (cards.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const executeDeleteCard = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards?id=${currentCard.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Kosakata "${currentCard.primary_text}" berhasil dihapus.`);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
        onCardMutated?.();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menghapus kartu.');
      }
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const paginationItems = getPaginationWindow(safeIndex, cards.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-bold uppercase tracking-wider text-xs">
            Kartu {safeIndex + 1} dari {cards.length}
          </Badge>
          {currentCard.level && (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              {currentCard.level}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {langCode === 'ja' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowFurigana(!showFurigana)}
              className="gap-1.5 text-xs border border-border h-8"
              title="Toggle Furigana (Hiragana di atas Kanji)"
            >
              {showFurigana ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showFurigana ? 'Sembunyikan Furigana' : 'Tampilkan Furigana'}</span>
            </Button>
          )}

          {/* Edit & Delete Action Buttons (Active for logged-in user) */}
          {isLoggedIn && (
            <div className="flex items-center gap-1 pl-1 border-l border-border/80">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                title="Edit kosakata ini"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                title="Hapus kosakata ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Flashcard Card */}
      <Card className="relative overflow-hidden border-border bg-card shadow-lg backdrop-blur-xl transition-colors">
        <CardContent className="p-4 sm:p-7">
          <div className="mb-4 sm:mb-5 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                {currentCard.part_of_speech || 'Vocabulary'}
              </span>

              {/* Main Word / Expression */}
              <h2 className="mt-1.5 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground break-words leading-tight">
                <RubyText
                  text={currentCard.primary_text}
                  furiganaHtml={currentCard.furigana_html}
                  showFurigana={showFurigana}
                />
              </h2>

              {/* Phonetic / Romaji */}
              {currentCard.phonetic && (
                <p className="mt-1 font-mono text-xs sm:text-base text-amber-700 dark:text-amber-400">
                  {currentCard.phonetic}
                </p>
              )}
            </div>

            <div className="shrink-0 pt-1">
              <AudioButton
                text={currentCard.primary_text}
                langLocale={speechLocale}
                size="md"
                label="Dengar"
              />
            </div>
          </div>

          {/* Meaning in Indonesian */}
          <div className="mb-4 sm:mb-6 rounded-xl border border-border bg-secondary/50 p-3 sm:p-4">
            <span className="mb-1 block text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              ARTI DALAM BAHASA INDONESIA:
            </span>
            <p className="text-sm sm:text-lg font-medium text-foreground leading-relaxed">
              {currentCard.meaning_id}
            </p>
          </div>

          {/* Practical Example Sentence */}
          <div className="flex flex-col gap-2.5 border-t border-dashed border-border/80 pt-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Contoh Kalimat Kontekstual:
              </span>
              <AudioButton
                text={currentCard.example_source}
                langLocale={speechLocale}
                size="sm"
              />
            </div>

            <p className="text-base sm:text-lg font-medium text-emerald-700 dark:text-emerald-400 leading-relaxed">
              “{currentCard.example_source}”
            </p>

            <p className="text-sm italic text-muted-foreground">
              Artinya: “{currentCard.example_meaning}”
            </p>

            {currentCard.audio_guide && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-800 dark:text-cyan-300">
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <span>
                  <strong className="text-cyan-900 dark:text-cyan-200">Tips Pengucapan:</strong>{' '}
                  {currentCard.audio_guide}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Responsive Windowed Pagination (Zero Horizontal Scrollbar) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          disabled={cards.length <= 1}
          className="gap-1.5 border border-border font-semibold h-9 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        {/* Windowed Page Pill Navigation */}
        <div className="flex items-center justify-center gap-1 py-1 overflow-hidden">
          {paginationItems.map((item, idx) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <span key={`el-${idx}`} className="px-1 text-xs text-muted-foreground select-none">
                  •••
                </span>
              );
            }

            const pageIdx = item as number;
            const isActive = pageIdx === safeIndex;

            return (
              <button
                key={pageIdx}
                type="button"
                onClick={() => setCurrentIndex(pageIdx)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
                title={`Buka kartu ${pageIdx + 1}`}
              >
                {pageIdx + 1}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="gap-1.5 border border-border font-semibold h-9 shrink-0"
        >
          <span className="hidden sm:inline">Selanjutnya</span> <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Card Modal Dialog */}
      <EditCardModal
        key={currentCard.id}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        card={currentCard}
        langCode={langCode}
        onCardUpdated={() => onCardMutated?.()}
      />

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={executeDeleteCard}
        title="Hapus Kosakata Ini?"
        description={`Apakah Anda yakin ingin menghapus kosakata "${currentCard.primary_text}" dari koleksi kartu pribadi Anda? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Kartu"
        cancelLabel="Batal"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
