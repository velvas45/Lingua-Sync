'use client';

import React, { useSyncExternalStore } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

let toasts: ToastItem[] = [];
let listeners: Array<() => void> = [];

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const EMPTY_TOASTS: ToastItem[] = [];

const getSnapshot = () => toasts;
const getServerSnapshot = () => EMPTY_TOASTS;

export const removeToast = (id: string) => {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
};

export const addToast = (type: ToastType, message: string, title?: string) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = { id, type, message, title };
  toasts = [...toasts, newToast];
  notify();

  // Auto-dismiss after 3.8 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3800);
};

export const toast = {
  success: (message: string, title?: string) => addToast('success', message, title),
  error: (message: string, title?: string) => addToast('error', message, title),
  info: (message: string, title?: string) => addToast('info', message, title),
};

export function ToastContainer() {
  const activeToasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {activeToasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isInfo = t.type === 'info';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? 'border-emerald-500/30 bg-card/95 text-foreground'
                : isError
                ? 'border-rose-500/30 bg-card/95 text-foreground'
                : 'border-cyan-500/30 bg-card/95 text-foreground'
            }`}
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {isInfo && <Info className="h-5 w-5 text-cyan-500" />}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-xs font-bold text-foreground mb-0.5">
                  {t.title}
                </h4>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed break-words">
                {t.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-secondary"
              title="Tutup pemberitahuan"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
