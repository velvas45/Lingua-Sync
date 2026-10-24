'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioButtonProps {
  text: string;
  langLocale: string; // 'en-US' or 'ja-JP'
  size?: 'sm' | 'md' | 'lg';
  rate?: number;
  label?: string;
}

const subscribeNoop = () => () => {};

export default function AudioButton({
  text,
  langLocale,
  size = 'md',
  rate = 0.85,
  label,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Idiomatic React 19 check for browser capability without synchronous setState in effect
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    () => true
  );

  const cleanTextForAudio = (raw: string) => {
    return raw.replace(/<rt>[^<]*<\/rt>/g, '').replace(/<[^>]*>/g, '').trim();
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const textToSpeak = cleanTextForAudio(text);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langLocale;
    utterance.rate = rate;

    // Load available voices
    const voices = window.speechSynthesis.getVoices();
    const prefix = langLocale.split('-')[0].toLowerCase();
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(prefix)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Web Speech tidak didukung di browser ini"
        disabled
        className="h-8 w-8 cursor-not-allowed opacity-40"
      >
        <VolumeX className="h-4 w-4" />
      </Button>
    );
  }

  const iconClass =
    size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Button
      type="button"
      variant="secondary"
      size={size === 'lg' ? 'default' : 'sm'}
      onClick={handleSpeak}
      title={`Dengarkan audio (${langLocale})`}
      className={`gap-1.5 border border-border font-medium transition-all ${
        isPlaying
          ? 'border-indigo-500 bg-indigo-500/20 text-cyan-400'
          : 'hover:border-primary/50'
      }`}
    >
      <Volume2
        className={`${iconClass} ${isPlaying ? 'animate-pulse text-cyan-400' : ''}`}
      />
      {label && <span>{label}</span>}
    </Button>
  );
}
