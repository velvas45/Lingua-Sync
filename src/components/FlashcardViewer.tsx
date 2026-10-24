"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
} from "lucide-react";
import AudioButton from "./AudioButton";
import RubyText from "./RubyText";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface CardItem {
  id: number;
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
}

export default function FlashcardViewer({
  cards,
  speechLocale,
  langCode,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFurigana, setShowFurigana] = useState(true);

  if (!cards || cards.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Belum ada kartu kosakata untuk bahasa ini.
      </Card>
    );
  }

  // Clamped safe index prevents any out-of-bounds access
  const safeIndex =
    currentIndex >= 0 && currentIndex < cards.length ? currentIndex : 0;
  const currentCard = cards[safeIndex];

  if (!currentCard) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
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

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className="font-bold uppercase tracking-wider"
          >
            Kartu {safeIndex + 1} dari {cards.length}
          </Badge>
          {currentCard.level && (
            <Badge variant="outline" className="text-muted-foreground">
              {currentCard.level}
            </Badge>
          )}
        </div>

        {langCode === "ja" && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowFurigana(!showFurigana)}
            className="gap-1.5 text-xs border border-border"
            title="Toggle Furigana (Hiragana di atas Kanji)"
          >
            {showFurigana ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span>
              {showFurigana ? "Sembunyikan Furigana" : "Tampilkan Furigana"}
            </span>
          </Button>
        )}
      </div>

      {/* Main Flashcard Card */}
      <Card className="relative overflow-hidden border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {currentCard.part_of_speech || "Vocabulary"}
              </span>

              {/* Main Word / Expression */}
              <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                <RubyText
                  text={currentCard.primary_text}
                  furiganaHtml={currentCard.furigana_html}
                  showFurigana={showFurigana}
                />
              </h2>

              {/* Phonetic / Romaji */}
              {currentCard.phonetic && (
                <p className="mt-1.5 font-mono text-base text-amber-400">
                  {currentCard.phonetic}
                </p>
              )}
            </div>

            <AudioButton
              text={currentCard.primary_text}
              langLocale={speechLocale}
              size="lg"
              label="Dengar Kata"
            />
          </div>

          {/* Meaning in Indonesian */}
          <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <span className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              ARTI DALAM BAHASA INDONESIA:
            </span>
            <p className="text-lg font-medium text-foreground">
              {currentCard.meaning_id}
            </p>
          </div>

          {/* Real-World Engineering / Practical Example */}
          <div className="flex flex-col gap-2.5 border-t border-dashed border-border/80 pt-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <BookOpen className="h-4 w-4" /> Contoh Kalimat Konteks Kerja:
              </span>
              <AudioButton
                text={currentCard.example_source}
                langLocale={speechLocale}
                size="sm"
              />
            </div>

            <p className="text-lg font-medium text-emerald-400 leading-relaxed">
              “{currentCard.example_source}”
            </p>

            <p className="text-sm italic text-muted-foreground">
              Artinya: “{currentCard.example_meaning}”
            </p>

            {currentCard.audio_guide && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  <strong className="text-cyan-300">Tips Pengucapan:</strong>{" "}
                  {currentCard.audio_guide}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          className="gap-1.5 border border-border font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>

        <div className="flex items-center gap-1.5">
          {cards.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === safeIndex
                  ? "w-6 bg-primary"
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
              title={`Ke kartu ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleNext}
          className="gap-1.5 border border-border font-semibold"
        >
          Selanjutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
