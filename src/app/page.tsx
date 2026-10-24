'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Header from '@/components/Header';
import FlashcardViewer, { CardItem } from '@/components/FlashcardViewer';
import DailyChallengeForm from '@/components/DailyChallengeForm';
import TeamFeed, { SubmissionItem } from '@/components/TeamFeed';
import Leaderboard from '@/components/Leaderboard';
import AddCardModal from '@/components/AddCardModal';
import AuthModal, { AuthUser } from '@/components/AuthModal';
import SidebarDrawer from '@/components/SidebarDrawer';
import EditProfileModal from '@/components/EditProfileModal';
import { Sparkles, Compass, MessageSquareQuote, Layers } from 'lucide-react';

interface LanguageItem {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  speech_locale: string;
}

interface PromptItem {
  id: number;
  language_code: string;
  card_id: number | null;
  prompt_question: string;
  hint: string;
  card_text?: string;
}

interface LeaderboardUser {
  user_name: string;
  current_streak: number;
  total_submissions: number;
  last_active_date: string | null;
  xp_points: number;
}

interface AppData {
  languages: LanguageItem[];
  currentLang: LanguageItem;
  cards: CardItem[];
  prompt: PromptItem | null;
  recentSubmissions: SubmissionItem[];
  leaderboard: LeaderboardUser[];
  currentUser: AuthUser | null;
  isGuest: boolean;
}

const subscribeTheme = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getThemeSnapshot = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('lingua_theme') as 'dark' | 'light') || 'dark';
};

const getThemeServerSnapshot = (): 'dark' | 'light' => 'dark';

export default function Home() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Idiomatic React 19 theme synchronization
  const storedTheme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [themeOverride, setThemeOverride] = useState<'dark' | 'light' | null>(null);
  const theme = themeOverride ?? storedTheme;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeOverride(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingua_theme', nextTheme);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await fetch(`/api/data?lang=${selectedLang}`, { cache: 'no-store' });
        if (res.ok) {
          const json: AppData = await res.json();
          if (!ignore) {
            setData(json);
            setCurrentUser(json.currentUser);
          }
        }
      } catch (e: unknown) {
        if (!ignore) {
          console.error('Failed to load data:', e);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [selectedLang, refreshTrigger]);

  const handleLangChange = (code: string) => {
    setSelectedLang(code);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      handleRefresh();
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    handleRefresh();
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-3">
        <div className="h-9 w-9 rounded-full border-3 border-border border-t-primary animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground">
          Memuat LinguaSync...
        </span>
      </div>
    );
  }

  const streakCount = currentUser?.current_streak ?? 1;
  const totalXp = currentUser?.xp_points ?? 0;
  const isGuest = !currentUser;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Header */}
      <Header
        currentLang={data.currentLang}
        languages={data.languages}
        onSelectLang={handleLangChange}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        streakCount={streakCount}
        totalXp={totalXp}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 sm:px-6 py-8 pb-16">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 p-6 sm:p-7 shadow-lg backdrop-blur-md">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Target Belajar Harian: {data.currentLang.name} ({data.currentLang.flag})
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Metode <strong className="text-foreground">Hybrid Micro-Drill</strong>: Pelajari kartu kosakata praktis di bawah, dengarkan pelafalannya, lalu selesaikan tantangan kalimat aktif hari ini!
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card/90 px-5 py-3 shadow-sm backdrop-blur-sm">
            <div className="text-center">
              <span className="text-lg font-extrabold text-cyan-700 dark:text-cyan-400">{data.cards.length}</span>
              <span className="block text-[11px] font-medium text-muted-foreground">
                {isGuest ? 'Kartu Publik' : 'Koleksi Kartu'}
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{data.recentSubmissions.length}</span>
              <span className="block text-[11px] font-medium text-muted-foreground">Aktivitas Komunitas</span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Flashcards & Daily Challenge */}
          <div className="flex flex-col gap-8">
            {/* Flashcard Section */}
            <section>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                  <h3 className="text-lg font-bold text-foreground">
                    1. Flashcard Kosakata & Audio Pelafalan
                  </h3>
                </div>
                {isGuest && (
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                    5 Kartu Dasar
                  </span>
                )}
              </div>
              <FlashcardViewer
                key={data.currentLang.code}
                cards={data.cards}
                speechLocale={data.currentLang.speech_locale}
                langCode={data.currentLang.code}
                isLoggedIn={!isGuest}
                onCardMutated={handleRefresh}
              />
            </section>

            {/* Daily Challenge Form */}
            <section>
              <div className="mb-3.5 flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  2. Latihan Output (Tulis & Ucapkan)
                </h3>
              </div>
              <DailyChallengeForm
                key={data.currentLang.code}
                prompt={data.prompt}
                languageCode={data.currentLang.code}
                speechLocale={data.currentLang.speech_locale}
                onSubmitted={handleRefresh}
                isGuest={isGuest}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                currentUsername={currentUser?.username}
              />
            </section>
          </div>

          {/* Right Column: Leaderboard & Team Feed */}
          <div className="flex flex-col gap-7">
            {/* Team Leaderboard Widget */}
            <Leaderboard board={data.leaderboard} />

            {/* Team Feed Section */}
            <section>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-foreground">
                    Aktivitas & Tulisan Komunitas Hari Ini
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.recentSubmissions.length} Entri
                </span>
              </div>

              <TeamFeed
                submissions={data.recentSubmissions}
                speechLocale={data.currentLang.speech_locale}
                onRefresh={handleRefresh}
                isGuest={isGuest}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-6 text-center text-xs text-muted-foreground">
        <p>LinguaSync • Platform Pembelajar Bahasa Komunitas • English (🇺🇸) & 日本語 (🇯🇵)</p>
      </footer>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        langCode={data.currentLang.code}
        onCardAdded={handleRefresh}
      />

      {/* Auth Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Sidebar Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        currentLang={data.currentLang}
        streakCount={streakCount}
        totalXp={totalXp}
        cardsCount={data.cards.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Edit User Profile Modal */}
      {currentUser && (
        <EditProfileModal
          key={currentUser.id}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
