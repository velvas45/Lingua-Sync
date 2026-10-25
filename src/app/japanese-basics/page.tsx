'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Volume2,
  HelpCircle,
  GraduationCap,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import JapaneseCanvasPad from '@/components/japanese/JapaneseCanvasPad';
import SidebarDrawer from '@/components/SidebarDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/Toast';
import {
  HIRAGANA_LIST,
  KATAKANA_LIST,
  KANJI_BASIC_LIST,
  SENTENCE_ANATOMY,
  CharacterItem,
  KanjiItem,
} from '@/lib/japaneseCharacters';

type WritingTab = 'hiragana' | 'katakana' | 'kanji' | 'guide';

const subscribeTheme = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getThemeSnapshot = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('lingua_theme') as 'dark' | 'light') || 'dark';
};

const getThemeServerSnapshot = (): 'dark' | 'light' => 'dark';

export default function JapaneseBasicsPage() {
  const router = useRouter();
  const { user, isGuest, isLoading, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<WritingTab>('hiragana');
  const [selectedHiragana, setSelectedHiragana] = useState<CharacterItem>(HIRAGANA_LIST[0]);
  const [selectedKatakana, setSelectedKatakana] = useState<CharacterItem>(KATAKANA_LIST[0]);
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem>(KANJI_BASIC_LIST[0]);
  const [highlightedComponentIndex, setHighlightedComponentIndex] = useState<number | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Theme synchronization
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

  // Route Guard: Redirect unauthenticated guest users back to '/' and trigger login modal
  useEffect(() => {
    if (!isLoading && isGuest) {
      toast.info(
        'Silakan masuk terlebih dahulu untuk mengakses modul aksara Jepang.',
        'Akses Khusus Pengguna'
      );
      router.replace('/');
      openAuthModal();
    }
  }, [isLoading, isGuest, router, openAuthModal]);

  // Loading state while verifying route guard
  if (isLoading || isGuest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-3">
        <div className="h-9 w-9 rounded-full border-3 border-border border-t-primary animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">
          {isLoading ? 'Memeriksa sesi akun...' : 'Mengarahkan ke halaman utama...'}
        </span>
      </div>
    );
  }

  // Play audio for the sample sentence
  const handlePlaySentenceAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(SENTENCE_ANATOMY.sentence);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Determine active character for the Canvas Pad
  const currentCanvasTarget =
    activeTab === 'katakana'
      ? {
          char: selectedKatakana.char,
          romaji: selectedKatakana.romaji,
          meaning: `Contoh: ${selectedKatakana.exampleWord} (${selectedKatakana.exampleMeaning})`,
          strokes: selectedKatakana.strokes,
        }
      : activeTab === 'kanji'
      ? {
          char: selectedKanji.kanji,
          romaji: `${selectedKanji.kunyomi} / ${selectedKanji.onyomi}`,
          meaning: selectedKanji.meaning,
          strokes: selectedKanji.strokes,
        }
      : {
          char: selectedHiragana.char,
          romaji: selectedHiragana.romaji,
          meaning: `Contoh: ${selectedHiragana.exampleWord} (${selectedHiragana.exampleMeaning})`,
          strokes: selectedHiragana.strokes,
        };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      {/* Top Header Navigation with Drawer & Theme Controls */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          {/* Left: Back Link & Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1.5 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
              <span className="sm:hidden">Kembali</span>
            </Link>

            <Badge
              variant="outline"
              className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs hidden md:inline-flex"
            >
              🇯🇵 Fondasi Aksara Jepang
            </Badge>
          </div>

          {/* Right Controls: Theme Quick Switch, Auth & Sidebar Drawer Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Quick Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </Button>

            {/* User Profile Button */}
            {user && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/80 py-1 px-2 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors"
                title="Buka Menu Akun & Profil"
              >
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
              </button>
            )}

            {/* Mobile / General Menu Drawer Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Buka Navigasi Drawer"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-3 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Section: Sentence Anatomy Breakdown */}
        <section className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/5 p-5 sm:p-7 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  Anatomi Membaca Kalimat Bahasa Jepang
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Bahasa Jepang menggabungkan <strong className="text-foreground">Kanji</strong>, <strong className="text-foreground">Hiragana</strong>, dan <strong className="text-foreground">Katakana</strong> dalam satu kalimat untuk membedakan konsep makna, tata bahasa, dan kata serapan asing.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePlaySentenceAudio}
              className="gap-1.5 text-xs font-semibold h-9 shrink-0 border border-border"
            >
              <Volume2 className="h-4 w-4 text-primary" />
              <span>Dengar Kalimat</span>
            </Button>
          </div>

          {/* Interactive Golden Sentence */}
          <div className="rounded-xl border border-border bg-card/90 p-4 sm:p-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Klik kata di bawah untuk melihat jenis aksaranya:
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-2xl sm:text-3xl font-extrabold tracking-wide">
              {SENTENCE_ANATOMY.components.map((comp, idx) => {
                const isSelected = highlightedComponentIndex === idx;
                const isKanji = comp.type === 'kanji';
                const isHiragana = comp.type === 'hiragana';
                const isKatakana = comp.type === 'katakana';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHighlightedComponentIndex(isSelected ? null : idx)}
                    className={`rounded-lg px-2 py-1 transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary scale-105 bg-primary/20'
                        : isKanji
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                        : isHiragana
                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                        : isKatakana
                        ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
                        : 'text-muted-foreground'
                    }`}
                    title={`${comp.label}: ${comp.desc}`}
                  >
                    {comp.text}
                  </button>
                );
              })}
            </div>

            {/* Reading and Translation */}
            <div className="pt-2 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-mono text-muted-foreground">
                Romaji: <strong className="text-foreground">{SENTENCE_ANATOMY.romaji}</strong>
              </span>
              <span className="text-foreground font-medium italic">
                Artinya: “{SENTENCE_ANATOMY.meaning}”
              </span>
            </div>

            {/* Selected Component Explanation Box */}
            {highlightedComponentIndex !== null && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs animate-in fade-in duration-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">
                    [{SENTENCE_ANATOMY.components[highlightedComponentIndex].label}] “
                    {SENTENCE_ANATOMY.components[highlightedComponentIndex].text}”:
                  </span>{' '}
                  <span className="text-muted-foreground">
                    {SENTENCE_ANATOMY.components[highlightedComponentIndex].desc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighlightedComponentIndex(null)}
                  className="text-muted-foreground hover:text-foreground text-[11px] font-semibold underline ml-2"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 2-Column Responsive Workspace: Interactive Character Grid + Sticky Canvas Pad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Character Selection Tabs & Grids (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
              <Button
                type="button"
                variant={activeTab === 'hiragana' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('hiragana')}
                className="gap-1.5 text-xs font-bold"
              >
                <span>Hiragana (平仮名)</span>
                <Badge variant="outline" className="text-[10px] ml-1 bg-background/20">46</Badge>
              </Button>

              <Button
                type="button"
                variant={activeTab === 'katakana' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('katakana')}
                className="gap-1.5 text-xs font-bold"
              >
                <span>Katakana (片仮名)</span>
                <Badge variant="outline" className="text-[10px] ml-1 bg-background/20">46</Badge>
              </Button>

              <Button
                type="button"
                variant={activeTab === 'kanji' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('kanji')}
                className="gap-1.5 text-xs font-bold"
              >
                <span>Kanji Dasar (漢字)</span>
                <Badge variant="outline" className="text-[10px] ml-1 bg-background/20">20 N5</Badge>
              </Button>

              <Button
                type="button"
                variant={activeTab === 'guide' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab('guide')}
                className="gap-1.5 text-xs font-bold"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Panduan Romaji</span>
              </Button>
            </div>

            {/* TAB 1: HIRAGANA GRID */}
            {activeTab === 'hiragana' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Klik karakter di bawah untuk memuat di papan kanvas:</span>
                  <span className="font-semibold text-primary">Karakter Terpilih: {selectedHiragana.char} ({selectedHiragana.romaji})</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {HIRAGANA_LIST.map((item) => {
                    const isSelected = selectedHiragana.char === item.char;
                    return (
                      <button
                        key={item.char}
                        type="button"
                        onClick={() => setSelectedHiragana(item)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/15 text-primary shadow-md ring-2 ring-primary scale-105'
                            : 'border-border bg-card/60 text-foreground hover:bg-secondary hover:border-border/80'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl font-extrabold">{item.char}</span>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{item.romaji}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: KATAKANA GRID */}
            {activeTab === 'katakana' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Klik karakter katakana untuk latihan kata serapan asing:</span>
                  <span className="font-semibold text-indigo-500">Karakter: {selectedKatakana.char} ({selectedKatakana.romaji})</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {KATAKANA_LIST.map((item) => {
                    const isSelected = selectedKatakana.char === item.char;
                    return (
                      <button
                        key={item.char}
                        type="button"
                        onClick={() => setSelectedKatakana(item)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-500 shadow-md ring-2 ring-indigo-500 scale-105'
                            : 'border-border bg-card/60 text-foreground hover:bg-secondary hover:border-border/80'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl font-extrabold">{item.char}</span>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{item.romaji}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Katakana Special Rule: Long Vowel Mark */}
                <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-4 text-xs space-y-1.5">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                    💡 Aturan Khas Katakana: Tanda Vokal Panjang (ー) Chōonpu
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Dalam katakana, vokal panjang tidak ditulis dengan huruf dobel, melainkan menggunakan garis strip horizontal <strong className="text-foreground">“ー”</strong>. Contoh: <strong className="text-foreground">コーヒー</strong> (Kōhī = Kopi), <strong className="text-foreground">ケーキ</strong> (Kēki = Kue), <strong className="text-foreground">メール</strong> (Mēru = Email).
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: BASIC KANJI N5 GRID */}
            {activeTab === 'kanji' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>20 Kanji Piktograf Alam & Fondasi Kehidupan (JLPT N5):</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Kanji: {selectedKanji.kanji}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {KANJI_BASIC_LIST.map((item) => {
                    const isSelected = selectedKanji.kanji === item.kanji;
                    return (
                      <button
                        key={item.kanji}
                        type="button"
                        onClick={() => setSelectedKanji(item)}
                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 shadow-md ring-2 ring-emerald-500 scale-[1.02]'
                            : 'border-border bg-card/60 hover:bg-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-2xl font-black text-foreground">{item.kanji}</span>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {item.strokes} Gores
                          </Badge>
                        </div>
                        <span className="text-xs font-bold text-foreground leading-tight">{item.meaning}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 truncate w-full">
                          K: {item.kunyomi}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Kanji Detail Banner */}
                <Card className="border-border bg-card/90 shadow-md">
                  <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-foreground">{selectedKanji.kanji}</span>
                        <div>
                          <span className="text-sm font-bold text-foreground block">{selectedKanji.meaning}</span>
                          <span className="text-[11px] text-muted-foreground">Asal Bentuk: {selectedKanji.origin}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-lg bg-secondary/50 p-2.5">
                        <span className="font-bold text-muted-foreground block text-[10px] uppercase">Kun&apos;yomi (Bacaan Asli Jepang):</span>
                        <span className="font-bold text-foreground text-xs">{selectedKanji.kunyomi}</span>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-2.5">
                        <span className="font-bold text-muted-foreground block text-[10px] uppercase">On&apos;yomi (Bacaan Serapan Cina):</span>
                        <span className="font-bold text-foreground text-xs">{selectedKanji.onyomi}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-background/50 p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Contoh Kata:</span>
                        <span className="text-xs font-bold text-foreground">
                          {selectedKanji.exampleWord} ({selectedKanji.exampleReading}) — {selectedKanji.exampleMeaning}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 4: ROMAJI & READING GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4 text-xs">
                <Card className="border-border bg-card/90">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">
                        Standar Transkripsi Romaji (Hepburn Modifikasi)
                      </h3>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      Bahasa Jepang menggunakan standar Hepburn dalam transkripsi alfabet internasional agar pembaca non-Jepang dapat membunyikannya secara akurat sesuai lafal aslinya:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border p-3 space-y-1 bg-secondary/30">
                        <span className="font-bold text-foreground block">1. Huruf dengan Bunyi Khusus:</span>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5 text-[11px]">
                          <li><strong className="text-foreground">し</strong> dilafalkan <em>“shi”</em> (bukan si).</li>
                          <li><strong className="text-foreground">ち</strong> dilafalkan <em>“chi”</em> (bukan ti).</li>
                          <li><strong className="text-foreground">つ</strong> dilafalkan <em>“tsu”</em> (bukan tu).</li>
                          <li><strong className="text-foreground">ふ</strong> dilafalkan <em>“fu”</em> (bukan hu kaku).</li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-border p-3 space-y-1 bg-secondary/30">
                        <span className="font-bold text-foreground block">2. Pengecualian Partikel Gramatikal:</span>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5 text-[11px]">
                          <li>Partikel <strong className="text-foreground">は</strong> ditulis <em>ha</em> tapi dibaca <strong>“wa”</strong>.</li>
                          <li>Partikel <strong className="text-foreground">へ</strong> ditulis <em>he</em> tapi dibaca <strong>“e”</strong>.</li>
                          <li>Partikel <strong className="text-foreground">を</strong> ditulis <em>wo</em> tapi dibaca <strong>“o”</strong> murni.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3.5 space-y-1">
                      <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                        3. Bunyi Sengau Konsonan Mati (ん / n)
                      </span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Huruf <strong className="text-foreground">ん</strong> adalah satu-satunya konsonan tanpa vokal. Bunyinya beradaptasi secara alami: menjadi <em>“m”</em> sebelum p/b/m (contoh: <em>shinbun</em> sering terdengar <em>shim-bun</em>), dan menjadi <em>“ng”</em> sebelum k/g.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Canvas Writing Pad (5 Cols on LG, Sticky) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-500" /> Papan Latihan Menulis
                </span>
                <span className="text-muted-foreground text-[11px]">Interaktif HTML5 Canvas</span>
              </div>

              {/* Mounted Canvas Pad */}
              <JapaneseCanvasPad
                character={currentCanvasTarget.char}
                romaji={currentCanvasTarget.romaji}
                meaning={currentCanvasTarget.meaning}
                strokes={currentCanvasTarget.strokes}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Navigation Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentLang={{
          code: 'ja',
          name: 'Bahasa Jepang',
          native_name: '日本語',
          flag: '🇯🇵',
        }}
        streakCount={user?.current_streak ?? 1}
        totalXp={user?.xp_points ?? 0}
        cardsCount={0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAddModal={() => {}}
        onOpenEditProfile={() => {}}
      />
    </div>
  );
}
