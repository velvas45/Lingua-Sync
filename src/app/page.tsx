'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Header from '@/components/Header';
import FlashcardViewer, { CardItem } from '@/components/FlashcardViewer';
import GrammarViewer from '@/components/GrammarViewer';
import DailyChallengeForm from '@/components/DailyChallengeForm';
import TeamFeed, { SubmissionItem } from '@/components/TeamFeed';
import Leaderboard from '@/components/Leaderboard';
import AddCardModal from '@/components/AddCardModal';
import SidebarDrawer from '@/components/SidebarDrawer';
import EditProfileModal from '@/components/EditProfileModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LevelTrack, GrammarLesson } from '@/lib/db';
import { dataService, AppDataResponse } from '@/services/dataService';
import { curriculumService } from '@/services/curriculumService';
import {
  Sparkles,
  Compass,
  MessageSquareQuote,
  Layers,
  GraduationCap,
  BookOpen,
  Lock,
  LogIn,
} from 'lucide-react';

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
  const { user: currentUser, isGuest, openAuthModal, updateUser } = useAuth();

  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [learningTab, setLearningTab] = useState<'vocab' | 'grammar'>('vocab');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppDataResponse | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [levelTracks, setLevelTracks] = useState<LevelTrack[]>([]);
  const [grammarLessons, setGrammarLessons] = useState<GrammarLesson[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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

  // Fetch core app data
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const json = await dataService.getAppData(selectedLang);
        if (!ignore) {
          setData(json);
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

  // Fetch curriculum & grammar lessons
  useEffect(() => {
    let ignore = false;

    async function loadCurriculum() {
      try {
        const json = await curriculumService.getCurriculum(selectedLang, selectedLevel);
        if (!ignore) {
          setLevelTracks(json.levels || []);
          setGrammarLessons(json.lessons || []);
        }
      } catch (e) {
        console.error('Failed to load curriculum:', e);
      }
    }

    loadCurriculum();

    return () => {
      ignore = true;
    };
  }, [selectedLang, selectedLevel]);

  const handleLangChange = (code: string) => {
    setSelectedLang(code);
    setSelectedLevel('all'); // reset level filter when language changes
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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

  // Filter cards by level if level filter is active and matching cards exist
  const displayedCards =
    selectedLevel === 'all'
      ? data.cards
      : data.cards.filter((c) =>
          (c.level || '').toUpperCase().includes(selectedLevel.toUpperCase())
        ).length > 0
      ? data.cards.filter((c) =>
          (c.level || '').toUpperCase().includes(selectedLevel.toUpperCase())
        )
      : data.cards;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Header */}
      <Header
        currentLang={data.currentLang}
        languages={data.languages}
        onSelectLang={handleLangChange}
        streakCount={streakCount}
        totalXp={totalXp}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-3 sm:px-6 py-4 sm:py-8 pb-16">
        {/* Welcome Banner */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 p-4 sm:p-7 shadow-lg backdrop-blur-md">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Target Belajar: {data.currentLang.name} ({data.currentLang.flag})
              </h2>
            </div>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Metode <strong className="text-foreground">Hybrid Micro-Drill</strong>: Pelajari kosakata praktis & pola tata bahasa berstandar internasional, lalu selesaikan tantangan harian!
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-around sm:justify-center gap-4 rounded-xl border border-border bg-card/90 px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm backdrop-blur-sm shrink-0">
            <div className="text-center">
              <span className="text-base sm:text-lg font-extrabold text-cyan-700 dark:text-cyan-400">
                {displayedCards.length}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                {isGuest ? 'Kartu Publik' : 'Koleksi Kartu'}
              </span>
            </div>
            <div className="h-7 w-px bg-border" />
            <div className="text-center">
              <span className="text-base sm:text-lg font-extrabold text-indigo-700 dark:text-indigo-400">
                {grammarLessons.length}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                Tata Bahasa
              </span>
            </div>
            <div className="h-7 w-px bg-border" />
            <div className="text-center">
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {data.recentSubmissions.length}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                Komunitas
              </span>
            </div>
          </div>
        </div>

        {/* Level Track Selector Bar */}
        <div className="relative mb-6 rounded-2xl border border-border bg-card/60 p-3.5 sm:p-4 backdrop-blur-md overflow-hidden">
          <div className={`flex flex-wrap items-center justify-between gap-3 ${isGuest ? 'blur-[3px] opacity-35 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Target Tingkatan ({data.currentLang.code === 'ja' ? 'Standar Resmi JLPT' : 'Standar Resmi CEFR'}):
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Pilih tingkatan untuk memfilter kosakata dan pelajaran tata bahasa
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedLevel('all')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  selectedLevel === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua Level
              </button>
              {levelTracks.map((lvl) => {
                const isActive = selectedLevel === lvl.code;
                return (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.code)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                    }`}
                    title={lvl.description}
                  >
                    {lvl.code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Lock Overlay */}
          {isGuest && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Target Tingkatan JLPT & CEFR Terkunci</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={openAuthModal}
                  className="h-7 text-xs font-semibold px-3 shadow-md"
                >
                  Masuk untuk Buka Filter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left Column: Flashcards / Grammar & Daily Challenge */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* View Switcher: Flashcard vs Grammar Lessons */}
            <section className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLearningTab('vocab')}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      learningTab === 'vocab'
                        ? 'bg-secondary text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-400" />
                    <span>Flashcard Kosakata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isGuest) {
                        openAuthModal();
                      } else {
                        setLearningTab('grammar');
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      learningTab === 'grammar'
                        ? 'bg-secondary text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Tata Bahasa ({grammarLessons.length})</span>
                    {isGuest && <Lock className="h-3 w-3 text-amber-500 ml-0.5" />}
                  </button>
                </div>

                {learningTab === 'vocab' && isGuest && (
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                    5 Kartu Dasar
                  </span>
                )}
              </div>

              {learningTab === 'vocab' ? (
                <FlashcardViewer
                  key={`${data.currentLang.code}-${selectedLevel}`}
                  cards={displayedCards}
                  speechLocale={data.currentLang.speech_locale}
                  langCode={data.currentLang.code}
                  onCardMutated={handleRefresh}
                />
              ) : isGuest ? (
                <div className="rounded-2xl border border-border bg-card/90 p-8 text-center shadow-lg backdrop-blur-md space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Akses Tata Bahasa Terkunci
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Pelajari 362+ pola rumus kalimat resmi JLPT (N5–N1) dan CEFR (A1–C2) lengkap dengan contoh nyata dan audio tips. Masuk sekarang untuk membuka modul ini!
                  </p>
                  <div className="pt-2 flex justify-center">
                    <Button
                      type="button"
                      variant="default"
                      onClick={openAuthModal}
                      className="gap-2 font-bold text-xs shadow-md"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Masuk untuk Membuka Tata Bahasa</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <GrammarViewer
                  key={`grammar-${data.currentLang.code}-${selectedLevel}`}
                  lessons={grammarLessons}
                  speechLocale={data.currentLang.speech_locale}
                />
              )}
            </section>

            {/* Daily Challenge Form */}
            <section>
              <div className="mb-3.5 flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  2. Latihan Output (Tulis & Ucapkan)
                </h3>
              </div>
              <DailyChallengeForm
                key={data.currentLang.code}
                prompt={data.prompt}
                languageCode={data.currentLang.code}
                speechLocale={data.currentLang.speech_locale}
                onSubmitted={handleRefresh}
              />
            </section>
          </div>

          {/* Right Column: Leaderboard & Team Feed */}
          <div className="flex flex-col gap-6 sm:gap-7">
            {/* Team Leaderboard Widget */}
            <Leaderboard board={data.leaderboard} />

            {/* Team Feed Section */}
            <section>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
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

      {/* Sidebar Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentLang={data.currentLang}
        streakCount={streakCount}
        totalXp={totalXp}
        cardsCount={data.cards.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Edit User Profile Modal */}
      {currentUser && (
        <EditProfileModal
          key={currentUser.id}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={currentUser}
          onProfileUpdated={(updated) => {
            updateUser(updated);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
