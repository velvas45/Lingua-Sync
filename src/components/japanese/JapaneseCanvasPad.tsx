'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  PenTool,
  Info,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  STROKE_ORDER_RULES,
  getStrokeTrajectories,
} from '@/lib/japaneseCharacters';
import { kanjiVgService } from '@/services/kanjiVgService';
import { KanjiVgData } from '@/app/api/kanjivg/route';

interface JapaneseCanvasPadProps {
  character: string;
  romaji: string;
  meaning?: string;
  strokes?: number;
}

type PadMode = 'practice' | 'animation';

// ----------------- SUB-COMPONENT: KANJIVG VECTOR STROKE ANIMATOR -----------------
function KanjiVgAnimatedViewer({
  character,
  onSwitchToPractice,
  onOpenStepDialog,
}: {
  character: string;
  onSwitchToPractice: () => void;
  onOpenStepDialog: () => void;
}) {
  const [data, setData] = useState<KanjiVgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(1);
  const [currentStrokeProgress, setCurrentStrokeProgress] = useState(0);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fetch true vector stroke data from KanjiVG service
  useEffect(() => {
    let ignore = false;

    kanjiVgService
      .getKanjiVgData(character)
      .then((res) => {
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('KanjiVG fetch failed for character:', character, err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [character]);

  // Sequential SVG Stroke Animation Loop
  const startLoop = useCallback(() => {
    if (!data || data.strokes.length === 0) return;

    const totalStrokes = data.strokes.length;
    const strokeDuration = 1100; // 1.1 seconds per stroke
    const pauseDuration = 2000; // 2 seconds pause after character completes
    const totalCycle = totalStrokes * strokeDuration + pauseDuration;

    startTimeRef.current = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTimeRef.current) % totalCycle;

      if (elapsed < totalStrokes * strokeDuration) {
        const activeIdx = Math.floor(elapsed / strokeDuration) + 1;
        const progress = (elapsed % strokeDuration) / strokeDuration;
        setCurrentStrokeIndex(activeIdx);
        setCurrentStrokeProgress(progress);
      } else {
        // Pausing state: all strokes completed cleanly
        setCurrentStrokeIndex(totalStrokes);
        setCurrentStrokeProgress(1);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, [data]);

  useEffect(() => {
    if (data && data.strokes.length > 0) {
      startLoop();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [data, startLoop]);

  const handleReplay = () => {
    startTimeRef.current = performance.now();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-2xl border-2 border-indigo-500/30 bg-background/90 shadow-inner gap-3">
        <div className="h-8 w-8 rounded-full border-3 border-indigo-500/20 border-t-indigo-600 animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground">
          Memuat Vektor KanjiVG &ldquo;{character}&rdquo;...
        </span>
      </div>
    );
  }

  if (!data || data.strokes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-2xl border-2 border-dashed border-border bg-background/50 p-4 text-center">
        <p className="text-xs text-muted-foreground mb-3">
          Animasi vektor sedang dipersiapkan untuk karakter ini.
        </p>
        <Button size="sm" variant="default" onClick={onSwitchToPractice} className="gap-1.5 text-xs">
          <Pencil className="h-3.5 w-3.5" />
          <span>Latihan Tulis Mandiri</span>
        </Button>
      </div>
    );
  }

  const totalStrokes = data.strokes.length;
  const isFinishedCycle = currentStrokeProgress === 1 && currentStrokeIndex === totalStrokes;

  return (
    <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-200">
      {/* Dynamic SVG Vector Stage */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-background/95 shadow-inner">
        <svg
          viewBox="0 0 109 109"
          className="block w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] select-none"
        >
          {/* 1. Dotted 田 Kanji Quadrant Grid */}
          <g stroke="rgba(148, 163, 184, 0.28)" strokeWidth="0.8" strokeDasharray="3,3">
            <line x1="54.5" y1="0" x2="54.5" y2="109" />
            <line x1="0" y1="54.5" x2="109" y2="54.5" />
          </g>
          <rect x="0" y="0" width="109" height="109" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />

          {/* 2. Faint Background Silhouette of ALL Strokes (Watermark) */}
          <g fill="none" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            {data.strokes.map((s) => (
              <path key={`bg-${s.id}`} d={s.d} transform={s.transform} />
            ))}
          </g>

          {/* 3. True Sequential Calligraphy Stroke Vector Animation */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {data.strokes.map((s) => {
              const strokeIdx = s.index;
              const isCompleted = isFinishedCycle || strokeIdx < currentStrokeIndex;
              const isCurrent = strokeIdx === currentStrokeIndex;

              if (isCompleted) {
                // Completed Stroke: Solid Deep Indigo Line (Transition to sky blue on celebration)
                return (
                  <path
                    key={`done-${s.id}`}
                    d={s.d}
                    transform={s.transform}
                    stroke={isFinishedCycle ? '#0284c7' : '#4f46e5'}
                    strokeWidth={isFinishedCycle ? '5' : '4.5'}
                    className="transition-colors duration-300"
                  />
                );
              }

              if (isCurrent) {
                // Active Stroke: Progressively Drawn Line with SVG Dashoffset
                const dashLen = 160;
                const offset = dashLen * (1 - currentStrokeProgress);
                return (
                  <path
                    key={`active-${s.id}`}
                    d={s.d}
                    transform={s.transform}
                    stroke="#0284c7"
                    strokeWidth="5"
                    strokeDasharray={dashLen}
                    strokeDashoffset={offset}
                  />
                );
              }

              return null;
            })}
          </g>

          {/* 4. Number Badges at Stroke Origins (Only show active stroke origin while drawing, hide on completion to keep character pristine) */}
          {!isFinishedCycle && (
            <g>
              {data.numbers
                .filter((n) => n.num === currentStrokeIndex)
                .map((n) => (
                  <g key={`num-${n.num}`}>
                    <circle
                      cx={n.x + 3.5}
                      cy={n.y - 3.5}
                      r={4.8}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text
                      x={n.x + 3.5}
                      y={n.y - 1.5}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {n.num}
                    </text>
                  </g>
                ))}
            </g>
          )}
        </svg>

        {/* Live Indicator Badges */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <Badge
            className={`text-[10px] font-bold shadow-md transition-colors ${
              isFinishedCycle ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {isFinishedCycle ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Selesai ({totalStrokes} Goresan)
              </span>
            ) : (
              `Goresan #${currentStrokeIndex} dari ${totalStrokes}`
            )}
          </Badge>
          <span className="rounded-full bg-background/85 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
            Vektor KanjiVG Presisi
          </span>
        </div>
      </div>

      {/* Animation Controls Bar */}
      <div className="flex w-full items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReplay}
          className="h-8 gap-1.5 text-xs font-semibold border-border"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Putar Ulang</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenStepDialog}
            className="h-8 gap-1.5 text-xs font-semibold border border-border"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Diagram Langkah</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSwitchToPractice}
            className="h-8 gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Pencil className="h-3 w-3" />
            <span>Coba Tulis</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ----------------- MAIN COMPONENT -----------------
export default function JapaneseCanvasPad({
  character,
  romaji,
  meaning,
  strokes = 3,
}: JapaneseCanvasPadProps) {
  const [activeMode, setActiveMode] = useState<PadMode>('practice');

  // Clean Practice Canvas
  const practiceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  // Guidance Modals
  const [showRules, setShowRules] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const trajectories = getStrokeTrajectories(character, strokes);

  // 1. PRACTICE CANVAS: 100% CLEAN & UNOBSTRUCTED
  const drawPracticeBackground = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.clearRect(0, 0, size, size);

      // Draw 田 Kanji Quadrant Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Vertical & horizontal midlines
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();

      // Outer boundary border
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.strokeRect(0, 0, size, size);
      ctx.restore();

      // Faint watermark for natural tracing (Zero obstruction, zero arrows)
      if (showWatermark && character) {
        ctx.save();
        const fontSize = character.length > 1 ? Math.floor(size * 0.42) : Math.floor(size * 0.65);
        ctx.font = `bold ${fontSize}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.fillText(character, size / 2, size / 2 + size * 0.04);
        ctx.restore();
      }
    },
    [character, showWatermark]
  );

  const initPracticeCanvas = useCallback(() => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 280;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    drawPracticeBackground(ctx, size);
    setHasDrawn(false);
  }, [drawPracticeBackground]);

  useEffect(() => {
    if (activeMode === 'practice') {
      initPracticeCanvas();
    }
  }, [character, activeMode, showWatermark, initPracticeCanvas]);

  // Pointer drawing handlers for practice canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#0284c7'; // clean sky blue calligraphy ink
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = practiceCanvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const handleClearPractice = () => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 280;
    drawPracticeBackground(ctx, size);
    setHasDrawn(false);
  };

  // Play audio pronunciation
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(character);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl w-full">
      {/* 1. Header Information Bar */}
      <div className="flex w-full items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 min-w-[44px] px-2.5 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-500/20 shadow-sm shrink-0 ${
              character.length > 1 ? 'text-lg tracking-tight' : 'text-2xl'
            }`}
          >
            {character}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Romaji: {romaji}
              </span>
              <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">
                {strokes} Goresan
              </Badge>
            </div>
            {meaning && (
              <span className="text-xs text-muted-foreground block truncate max-w-[180px] sm:max-w-[240px]">
                Arti: <strong className="text-foreground">{meaning}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Audio Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="gap-1.5 text-xs font-semibold h-8 border border-border shrink-0"
          title="Dengar pelafalan asli"
        >
          <Volume2 className={`h-4 w-4 text-primary ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span>{isSpeaking ? 'Memutar...' : 'Dengar'}</span>
        </Button>
      </div>

      {/* 2. Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1.5 w-full bg-secondary/50 p-1 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setActiveMode('practice')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'practice'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Pencil className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Papan Latihan Tulis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('animation')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'animation'
              ? 'bg-background text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Play className="h-3.5 w-3.5 fill-current text-indigo-600 dark:text-indigo-400" />
          <span>Animasi Urutan Goresan</span>
        </button>
      </div>

      {/* 3. CENTER STAGE CANVAS VIEW */}
      {activeMode === 'practice' ? (
        /* MODE 1: PRACTICE CANVAS (100% CLEAN & UNOBSTRUCTED) */
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 bg-background/90 shadow-inner">
            <canvas
              ref={practiceCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="touch-none cursor-crosshair block w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]"
              title="Gunakan mouse, stylus, atau sentuhan jari untuk menulis dengan bebas tanpa halangan"
            />

            {showWatermark && !hasDrawn && (
              <div className="pointer-events-none absolute bottom-2.5 left-2 right-2 text-center">
                <span className="rounded-full bg-background/85 px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-sm border border-border">
                  ✍️ Jiplak huruf bayangan di atas kanvas dengan bebas
                </span>
              </div>
            )}
          </div>

          {/* Practice Toolbar */}
          <div className="flex w-full items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearPractice}
                className="h-8 gap-1.5 text-xs font-semibold border-border"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Hapus Coretan</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowWatermark(!showWatermark)}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {showWatermark ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showWatermark ? 'Sembunyikan' : 'Tampilkan'}</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setActiveMode('animation')}
              className="h-8 gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-border"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Lihat Demo</span>
            </Button>
          </div>
        </div>
      ) : (
        /* MODE 2: KANJIVG VECTOR STROKE ANIMATOR (100% GLYPH ACCURATE) */
        <KanjiVgAnimatedViewer
          character={character}
          onSwitchToPractice={() => setActiveMode('practice')}
          onOpenStepDialog={() => {
            setActiveStepTab(1);
            setIsStepDialogOpen(true);
          }}
        />
      )}

      {/* 4. Footer Help & Rules Trigger */}
      <div className="flex w-full items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
        <span className="text-[11px] flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Standar Vektor Resmi KanjiVG (筆順)
        </span>
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          <span>{showRules ? 'Tutup Aturan' : '4 Aturan Emas'}</span>
        </button>
      </div>

      {/* Collapsible Stroke Order Rules */}
      {showRules && (
        <div className="w-full rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3.5 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
            <PenTool className="h-4 w-4" />
            <span>4 Aturan Emas Urutan Goresan Kaligrafi:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground text-[11px] leading-relaxed">
            {STROKE_ORDER_RULES.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">{rule.rule}</strong>
                  <span>{rule.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Textbook Stroke Order Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 min-w-[36px] px-2 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-500/25 shrink-0 ${
                  character.length > 1 ? 'text-sm tracking-tight' : 'text-lg'
                }`}
              >
                {character}
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Diagram Langkah Demi Langkah: &ldquo;{character}&rdquo;
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Tahapan urutan goresan satu per satu ({strokes} goresan)
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper Navigation Pills */}
          <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border">
            {trajectories.map((traj) => {
              const isActive = activeStepTab === traj.strokeNumber;
              return (
                <button
                  key={traj.strokeNumber}
                  type="button"
                  onClick={() => setActiveStepTab(traj.strokeNumber)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600 ring-offset-1'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Goresan #{traj.strokeNumber}
                </button>
              );
            })}
          </div>

          {/* Active Stroke Detail Card */}
          {trajectories[activeStepTab - 1] && (
            <div className="rounded-2xl border border-indigo-500/25 bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-sm">
                    {activeStepTab}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Tahap Goresan ke-{activeStepTab} dari {strokes}
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Arah: {trajectories[activeStepTab - 1].directionLabel}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="border-indigo-500/30 text-[10px] font-bold">
                  Langkah {activeStepTab}/{strokes}
                </Badge>
              </div>

              <div className="rounded-xl border border-border bg-background/80 p-3 text-xs space-y-1">
                <span className="font-bold text-muted-foreground block text-[10px] uppercase">
                  Instruksi Tarikan Pena:
                </span>
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {trajectories[activeStepTab - 1].instruction}
                </p>
              </div>

              {/* Prev / Next Stepper Controls */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStepTab((prev) => Math.max(1, prev - 1))}
                  disabled={activeStepTab <= 1}
                  className="text-xs font-semibold"
                >
                  Goresan Sebelumnya
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setActiveStepTab((prev) => Math.min(strokes, prev + 1))}
                  disabled={activeStepTab >= strokes}
                  className="gap-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <span>Goresan Selanjutnya</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
