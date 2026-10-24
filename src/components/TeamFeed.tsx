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
  prompt_question?: string;
}

interface TeamFeedProps {
  submissions: SubmissionItem[];
  speechLocale: string;
  onRefresh: () => void;
}

export default function TeamFeed({
  submissions,
  speechLocale,
  onRefresh,
}: TeamFeedProps) {
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const handleLike = async (id: number) => {
    if (likedIds.includes(id)) return;

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id }),
      });

      if (res.ok) {
        setLikedIds((prev) => [...prev, id]);
        onRefresh();
      }
    } catch (e: unknown) {
      console.error('Failed to like submission:', e);
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
    <div className="flex flex-col gap-3.5">
      {submissions.map((sub) => {
        const isLiked = likedIds.includes(sub.id);
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
                    onClick={() => handleLike(sub.id)}
                    className={`h-8 gap-1.5 px-2.5 text-xs font-semibold transition-all ${
                      isLiked
                        ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Beri apresiasi (Kudos)"
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{sub.likes}</span>
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
