'use client';

import React from 'react';
import { Languages, Flame, Zap, Plus, LogIn, Menu, Sun, Moon } from 'lucide-react';
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
  onOpenDrawer: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
  onOpenDrawer,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl px-4 sm:px-6 py-3 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Languages className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                LinguaSync
              </h1>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                Komunitas
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground hidden md:block">
              Latihan Harian Bahasa Inggris & Jepang untuk Semua Kalangan
            </p>
          </div>
        </div>

        {/* Center: Language Switcher Tabs */}
        <div className="flex rounded-xl border border-border/80 bg-secondary/60 p-1 backdrop-blur-sm">
          {languages.map((l) => {
            const isActive = l.code === currentLang.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLang(l.code)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="text-sm sm:text-base">{l.flag}</span>
                <span className="hidden xs:inline sm:inline">{l.native_name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Stats, Theme & Sidebar Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 sm:px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400"
            title="Streak Harian Belajar Anda"
          >
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{streakCount}d</span>
          </div>

          {/* XP Points */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 sm:px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            title="Total Experience Points"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{totalXp}</span>
          </div>

          {/* Theme Quick Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </Button>

          {/* User Account / Auth Trigger */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenDrawer}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary/80 py-1 px-2.5 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors"
              title="Buka Menu Akun & Profil"
            >
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">{currentUser.username}</span>
            </button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onOpenAuthModal}
              className="gap-1.5 font-semibold h-8 shadow-md shadow-primary/25 hidden xs:flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </Button>
          )}

          {/* Hamburger Menu / Sidebar Drawer Trigger */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenDrawer}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border-border bg-secondary/60 hover:bg-secondary text-foreground"
            title="Buka Menu Navigasi Samping"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
