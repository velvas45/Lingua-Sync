'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Sun,
  Moon,
  Plus,
  LogOut,
  LogIn,
  Flame,
  Zap,
  Globe,
  Pencil,
  Phone,
  Mail,
  Compass,
  PenTool,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthUser } from './AuthModal';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  currentLang: {
    code: string;
    name: string;
    native_name: string;
    flag: string;
  };
  streakCount: number;
  totalXp: number;
  cardsCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenEditProfile: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function SidebarDrawer({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  streakCount,
  totalXp,
  cardsCount,
  theme,
  onToggleTheme,
  onOpenAddModal,
  onOpenEditProfile,
  onOpenAuthModal,
  onLogout,
}: SidebarDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card/95 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Menu Navigasi</h2>
              <p className="text-[11px] text-muted-foreground">LinguaSync Community Hub</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Tutup Menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* User Profile Card */}
          {currentUser ? (
            <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-md shadow-indigo-500/25">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {currentUser.username}
                  </h3>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <Mail className="h-3 w-3 shrink-0" /> {currentUser.email}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <Phone className="h-3 w-3 shrink-0" /> {currentUser.phone_number}
                  </p>
                </div>
              </div>

              {/* Badges Streak & XP */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="h-3.5 w-3.5" />
                  <span>{streakCount}d Streak</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{totalXp} XP</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                className="w-full gap-1.5 text-xs font-semibold h-8 border-border"
              >
                <Pencil className="h-3 w-3" />
                <span>Edit Profil Saya</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-violet-600/10 p-5 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Akses Akun Pembelajar</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Masuk untuk melacak streak, kumpulkan poin XP, dan kelola kosakata pribadi.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full gap-2 text-xs font-semibold shadow-md shadow-primary/25"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk / Daftar Akun</span>
              </Button>
            </div>
          )}

          {/* Quick Learning Stats */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Status Belajar Aktif
            </span>
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/30 p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-xs font-semibold text-foreground">
                  {currentLang.native_name} ({currentLang.name})
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {cardsCount} Kosakata
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Aksi Cepat
            </span>
            <div className="space-y-2">
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="flex items-center justify-start gap-2.5 h-10 px-3 text-xs font-semibold rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-colors w-full text-left"
                >
                  <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>Belajar Aksara Jepang (Perlu Masuk)</span>
                </button>
              ) : (
                <Link
                  href="/japanese-basics"
                  onClick={onClose}
                  className="flex items-center justify-start gap-2.5 h-10 px-3 text-xs font-semibold rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-colors w-full"
                >
                  <PenTool className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>Belajar Aksara Jepang (Canvas Pad)</span>
                </Link>
              )}

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onClose();
                  if (currentUser) {
                    onOpenAddModal();
                  } else {
                    onOpenAuthModal();
                  }
                }}
                className="w-full justify-start gap-2.5 h-10 text-xs font-semibold border border-border"
              >
                <Plus className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Tambah Kosakata Baru</span>
              </Button>
            </div>
          </div>

          {/* Appearance / Theme Toggle */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tampilan & Tema
            </span>
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/30 p-3">
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Mode {theme === 'dark' ? 'Gelap (Dark Mode)' : 'Terang (Light Mode)'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Klik tombol untuk beralih tema
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleTheme}
                className="h-8 gap-1.5 px-2.5 text-xs font-semibold border-border"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Gelap</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border/80 pt-4 space-y-3">
          {currentUser && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full justify-start gap-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar dari Akun (Logout)</span>
            </Button>
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" /> LinguaSync v0.2.0
            </span>
            <span>Micro-Drills</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
