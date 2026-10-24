'use client';

import React from 'react';
import { Languages, Flame, Zap, Plus, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/components/AuthModal';

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
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function Header({
  currentLang,
  languages,
  onSelectLang,
  onOpenAddModal,
  streakCount,
  totalXp,
  currentUser,
  onOpenAuthModal,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl px-4 sm:px-6 py-3.5">
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
                Komunitas Aktif
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Latihan Harian Bahasa Inggris & Jepang untuk Semua Kalangan
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
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${
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
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400"
            title="Streak Harian Tim"
          >
            <Flame className="h-4 w-4" />
            <span>{streakCount}d Streak</span>
          </div>

          {/* XP Points */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400"
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
            onClick={currentUser ? onOpenAddModal : onOpenAuthModal}
            className="gap-1.5 border border-border font-medium h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tambah Kosakata</span>
          </Button>

          {/* Authentication Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-border/80">
              <div
                className="flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-foreground border border-border"
                title={`Login sebagai: ${currentUser.email}`}
              >
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span>{currentUser.username}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                title="Keluar (Logout)"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onOpenAuthModal}
              className="gap-1.5 font-semibold h-8 shadow-md shadow-primary/25"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk / Daftar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
