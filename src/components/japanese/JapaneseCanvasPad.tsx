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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STROKE_ORDER_RULES } from '@/lib/japaneseCharacters';

interface JapaneseCanvasPadProps {
  character: string;
  romaji: string;
  meaning?: string;
  strokes?: number;
}

export default function JapaneseCanvasPad({
  character,
  romaji,
  meaning,
  strokes,
}: JapaneseCanvasPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Redraw canvas background (Grid + Watermark)
  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Clear entire canvas
      ctx.clearRect(0, 0, width, height);

      // Draw 田 Kanji Quadrant Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)'; // slate-400 subtle
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Vertical midline
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Horizontal midline
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Outer boundary border
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();

      // Draw faint watermark character if enabled
      if (showWatermark && character) {
        ctx.save();
        ctx.font = `bold ${Math.floor(height * 0.65)}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.22)'; // faint tracing guide
        ctx.fillText(character, width / 2, height / 2 + height * 0.04);
        ctx.restore();
      }
    },
    [character, showWatermark]
  );

  // Initialize and scale canvas for Retina displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 280;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.scale(dpr, dpr);
    drawBackground(ctx, size, size);
    setHasDrawn(false);
  }, [character, showWatermark, drawBackground]);

  // Handle pointer down (mouse click or finger touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
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

    // Calligraphy stroke style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#0284c7'; // vibrant sky blue
  };

  // Handle pointer move (drawing stroke)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Handle pointer up / leave
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 280;

    drawBackground(ctx, size, size);
    setHasDrawn(false);
  };

  // Play audio pronunciation
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(character);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // slightly slower for clear learning

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/85 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Target Character Header */}
      <div className="flex w-full items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl border border-indigo-500/20">
            {character}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Romaji: {romaji}
              </span>
              {strokes && (
                <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">
                  {strokes} Goresan
                </Badge>
              )}
            </div>
            {meaning && (
              <span className="text-xs text-muted-foreground block">
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
          className="gap-1.5 text-xs font-semibold h-8 border border-border"
          title="Dengar pelafalan asli"
        >
          <Volume2 className={`h-4 w-4 text-primary ${isSpeaking ? 'animate-pulse' : ''}`} />
          <span>{isSpeaking ? 'Memutar...' : 'Dengar'}</span>
        </Button>
      </div>

      {/* Canvas Drawing Area with Cross Grid */}
      <div className="relative flex items-center justify-center">
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 bg-background/90 shadow-inner">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="touch-none cursor-crosshair block w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]"
            title="Gunakan mouse, stylus, atau sentuhan jari untuk menulis"
          />

          {/* Quick Tracing Watermark Status */}
          {showWatermark && !hasDrawn && (
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 text-center">
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm border border-border/80">
                ✍️ Jiplak huruf bayangan di atas grid
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-8 gap-1.5 text-xs font-semibold border-border"
            title="Bersihkan coretan di kanvas"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Hapus Kanvas</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowWatermark(!showWatermark)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Sembunyikan atau tampilkan bayangan huruf"
          >
            {showWatermark ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showWatermark ? 'Sembunyikan Bayangan' : 'Tampilkan Bayangan'}</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowRules(!showRules)}
          className="h-8 gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-medium"
        >
          <Info className="h-3.5 w-3.5" />
          <span>Aturan Goresan</span>
        </Button>
      </div>

      {/* Collapsible Stroke Order Guidance */}
      {showRules && (
        <div className="w-full rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-3.5 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
            <PenTool className="h-4 w-4" />
            <span>4 Aturan Emas Urutan Goresan (Kakujun):</span>
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
    </div>
  );
}
