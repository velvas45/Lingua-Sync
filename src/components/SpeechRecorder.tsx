'use client';

import React, { useState, useRef, useSyncExternalStore } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from './Toast';

interface SpeechRecorderProps {
  langLocale: string; // 'en-US' or 'ja-JP'
  onTranscript: (text: string) => void;
}

interface ISpeechRecognition {
  start(): void;
  stop(): void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

const subscribeNoop = () => () => {};

export default function SpeechRecorder({ langLocale, onTranscript }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const isSupported = useSyncExternalStore(
    subscribeNoop,
    () => {
      if (typeof window === 'undefined') return true;
      const windowObj = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      return Boolean(windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition);
    },
    () => true
  );

  const toggleRecording = () => {
    if (!isSupported) {
      toast.info('Browser belum mendukung Web Speech Recognition. Gunakan Google Chrome atau Edge untuk fitur rekam suara.', 'Fitur Tidak Didukung');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const windowObj = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const RecognitionClass = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

      if (!RecognitionClass) return;

      const recognition = new RecognitionClass();
      recognition.lang = langLocale;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setFeedback('Mendengarkan... Ucapkan kalimat Anda sekarang.');
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
          setFeedback(`Terekam: "${transcript}"`);
        }
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setFeedback('Izin mikrofon ditolak browser.');
        } else {
          setFeedback('Suara tidak terdengar jelas. Coba ulangi kembali.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.error(err);
      setIsRecording(false);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setFeedback('Error mikrofon: ' + msg);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={toggleRecording}
          variant={isRecording ? 'destructive' : 'secondary'}
          size="sm"
          className={`gap-2 font-semibold ${isRecording ? 'animate-pulse' : 'border border-border'}`}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          <span>{isRecording ? 'Sedang Merekam... (Klik untuk Berhenti)' : '🎙️ Ucapkan / Latihan Speaking'}</span>
        </Button>

        {!isSupported && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" /> Gunakan Chrome/Edge untuk input suara native
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border border-border/60 bg-black/30 px-3 py-2 text-xs ${
            isRecording ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {isRecording ? <Mic className="h-3.5 w-3.5 animate-pulse" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
