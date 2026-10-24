'use client';

import React from 'react';
import { Languages, Flame, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentLang: {
    code: string;
    name: string;
    native_name: string;
    flag: string;
    speech_locale: string;
  };
  languages: Array<{
    code: string;
    name: string;
    native_name: string;
    flag: string;
    speech_locale: string;
  }>;
  onSelectLang: (code: string) => void;
  onOpenAddModal: () => void;
  streakCount: number;
  totalXp: number;
}

export default function Header({
  currentLang,
  languages,
  onSelectLang,
  onOpenAddModal,
  streakCount,
  totalXp
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl px-6 py-3.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                LinguaSync
              </h1>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                Team MVP
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily Micro-Immersion for Tech Teams (English & 日本語)
            </p>
          </div>
        </div>

        {/* Language Switcher Tabs */}
        <div className="flex rounded-xl border border-border/80 bg-secondary/60 p-1 backdrop-blur-sm">
          {languages.map((l) => {
            const isActive = l.code === currentLang.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLang(l.code)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.native_name}</span>
              </button>
            );
          })}
        </div>

        {/* User Stats & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400"
            title="Streak Harian Tim"
          >
            <Flame className="h-4 w-4" />
            <span>{streakCount} Hari Streak</span>
          </div>

          {/* XP Points */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400"
            title="Total Experience Points"
          >
            <Zap className="h-4 w-4" />
            <span>{totalXp} XP</span>
          </div>

          {/* Add Vocabulary Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenAddModal}
            className="gap-1.5 border border-border font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kosakata</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
