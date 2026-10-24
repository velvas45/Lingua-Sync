'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  GraduationCap,
} from 'lucide-react';
import AudioButton from './AudioButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GrammarLesson } from '@/lib/db';

interface GrammarViewerProps {
  lessons: GrammarLesson[];
  speechLocale: string;
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

export default function GrammarViewer({
  lessons,
  speechLocale,
}: GrammarViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!lessons || lessons.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-border bg-card/60">
        <GraduationCap className="mx-auto mb-2.5 h-8 w-8 opacity-40" />
        <p className="text-sm font-semibold text-foreground">
          Belum ada materi tata bahasa untuk level yang dipilih.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Pilih tingkatan level lain di atas untuk melihat pelajaran tata bahasa.
        </p>
      </Card>
    );
  }

  const safeIndex = currentIndex >= 0 && currentIndex < lessons.length ? currentIndex : 0;
  const currentLesson = lessons[safeIndex];

  if (!currentLesson) return null;

  const handleNext = () => {
    if (lessons.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % lessons.length);
  };

  const handlePrev = () => {
    if (lessons.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + lessons.length) % lessons.length);
  };

  const paginationItems = getPaginationWindow(safeIndex, lessons.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-bold tracking-wider text-xs">
            Pelajaran {safeIndex + 1} dari {lessons.length}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-bold text-primary border-primary/30 bg-primary/10"
          >
            Level {currentLesson.level}
          </Badge>
        </div>
      </div>

      {/* Main Grammar Lesson Card */}
      <Card className="relative overflow-hidden border-border bg-card shadow-lg backdrop-blur-xl transition-colors">
        <CardContent className="p-4 sm:p-7 space-y-5">
          {/* Title Header */}
          <div className="border-b border-border/80 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pola Tata Bahasa Esensial
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              {currentLesson.title}
            </h2>
          </div>

          {/* Formula Box */}
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3.5 sm:p-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1.5 uppercase tracking-wider">
              <Code2 className="h-4 w-4" /> Rumus / Formula Pola:
            </span>
            <div className="font-mono text-sm sm:text-base font-bold text-foreground bg-background/60 p-2.5 rounded-lg border border-border/80">
              {currentLesson.formula}
            </div>
          </div>

          {/* Explanation Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Penjelasan & Fungsi:
            </span>
            <p className="text-sm sm:text-base text-foreground leading-relaxed">
              {currentLesson.explanation}
            </p>
          </div>

          {/* Contextual Example Sentence */}
          <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <BookOpen className="h-4 w-4" /> Contoh Kalimat Nyata:
              </span>
              <AudioButton
                text={currentLesson.example_source}
                langLocale={speechLocale}
                size="sm"
                label="Dengar"
              />
            </div>

            <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
              “{currentLesson.example_source}”
            </p>

            <p className="text-xs sm:text-sm italic text-muted-foreground">
              Artinya: “{currentLesson.example_meaning}”
            </p>
          </div>

          {/* Audio & Usage Tips */}
          {currentLesson.audio_guide && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 text-xs text-cyan-800 dark:text-cyan-300">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
              <span>
                <strong className="text-cyan-900 dark:text-cyan-200">Tips Pengucapan & Intonasi:</strong>{' '}
                {currentLesson.audio_guide}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Responsive Windowed Pagination (Zero Horizontal Scrollbar) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          disabled={lessons.length <= 1}
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
                title={`Buka pelajaran ${pageIdx + 1}`}
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
          disabled={lessons.length <= 1}
          className="gap-1.5 border border-border font-semibold h-9 shrink-0"
        >
          <span className="hidden sm:inline">Selanjutnya</span> <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
