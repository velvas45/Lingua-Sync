'use client';

import React, { useState } from 'react';
import { Heart, MessageSquare, Mic, Clock } from 'lucide-react';
import AudioButton from './AudioButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SubmissionItem {
  id: number;
  user_name: string;
  language_code: string;
  text_response: string;
  speaking_practiced: number;
  created_at: string;
  likes: number;
  has_liked?: boolean | number;
  prompt_question?: string;
}

interface TeamFeedProps {
  submissions: SubmissionItem[];
  speechLocale: string;
  onRefresh: () => void;
  isGuest?: boolean;
  onOpenAuthModal?: () => void;
}

export default function TeamFeed({
  submissions,
  speechLocale,
  onRefresh,
  isGuest = false,
  onOpenAuthModal,
}: TeamFeedProps) {
  // Local optimistic overrides: map of submissionId -> { liked: boolean, count: number }
  const [likeOverrides, setLikeOverrides] = useState<Record<number, { liked: boolean; count: number }>>({});
  const [pendingIds, setPendingIds] = useState<number[]>([]);

  const handleLike = async (id: number, currentLiked: boolean, currentLikes: number) => {
    if (isGuest) {
      onOpenAuthModal?.();
      return;
    }

    if (pendingIds.includes(id)) return;

    // Optimistic update
    const nextLiked = !currentLiked;
    const nextCount = nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    setLikeOverrides((prev) => ({
      ...prev,
      [id]: { liked: nextLiked, count: nextCount },
    }));
    setPendingIds((prev) => [...prev, id]);

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikeOverrides((prev) => ({
          ...prev,
          [id]: { liked: data.liked, count: data.likes },
        }));
        onRefresh();
      } else {
        // Revert on error
        setLikeOverrides((prev) => ({
          ...prev,
          [id]: { liked: currentLiked, count: currentLikes },
        }));
      }
    } catch (e: unknown) {
      console.error('Failed to toggle like:', e);
      // Revert on error
      setLikeOverrides((prev) => ({
        ...prev,
        [id]: { liked: currentLiked, count: currentLikes },
      }));
    } finally {
      setPendingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground border-border/70 bg-card/60">
        <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-40" />
        <p className="text-base font-semibold text-foreground">
          Belum ada anggota tim yang menyelesaikan tantangan hari ini.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Jadilah yang pertama menulis kalimat hari ini!
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-1.5 focus:outline-none">
      {submissions.map((sub) => {
        const override = likeOverrides[sub.id];
        const isLiked = override ? override.liked : Boolean(sub.has_liked);
        const displayLikes = override ? override.count : sub.likes;

        return (
          <Card
            key={sub.id}
            className="border-border/80 bg-card/85 transition-all hover:border-primary/40 shadow-sm"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-bold text-sm text-primary border border-border">
                    {sub.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground text-sm">
                      {sub.user_name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatTime(sub.created_at)}
                      </span>
                      {sub.speaking_practiced === 1 && (
                        <Badge variant="success" className="gap-1 text-[10px] py-0 px-1.5">
                          <Mic className="h-2.5 w-2.5" /> Spoke Aloud
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AudioButton
                    text={sub.text_response}
                    langLocale={speechLocale}
                    size="sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(sub.id, isLiked, displayLikes)}
                    className={`h-8 gap-1.5 px-2.5 text-xs font-semibold transition-all ${
                      isLiked
                        ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={
                      isGuest
                        ? 'Masuk untuk memberi love'
                        : isLiked
                        ? 'Klik untuk batalkan apresiasi'
                        : 'Beri apresiasi (Kudos)'
                    }
                  >
                    <Heart
                      className="h-3.5 w-3.5 transition-transform active:scale-125"
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{displayLikes}</span>
                  </Button>
                </div>
              </div>

              {/* Response Text */}
              <div className="rounded-lg border-l-2 border-cyan-400 bg-secondary/30 px-3.5 py-2.5 text-sm font-medium text-foreground">
                “{sub.text_response}”
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
