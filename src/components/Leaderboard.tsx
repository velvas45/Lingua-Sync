'use client';

import React from 'react';
import { Trophy, Clock, Flame, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaderboardUser } from '@/services/dataService';

interface LeaderboardProps {
  board: LeaderboardUser[];
}

export default function Leaderboard({ board }: LeaderboardProps) {
  const getRankBadge = (idx: number) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  if (!board || board.length === 0) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur-md">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Trophy className="h-4 w-4 text-amber-500" /> Papan Peringkat Top 10
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
          Selesaikan kuis harian mulai pukul 08:00 untuk masuk ke jajaran Top 10!
        </CardContent>
      </Card>
    );
  }

  // Display maximum Top 10
  const top10 = board.slice(0, 10);

  return (
    <Card className="border-border bg-card/85 backdrop-blur-md shadow-lg">
      <CardHeader className="p-4 pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <Trophy className="h-4 w-4 text-amber-500" /> Papan Peringkat Top 10
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
            XP & Waktu Tercepat
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Diurutkan dari total XP terbanyak dan durasi waktu penginputan kuis tercepat.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 p-4 pt-3">
        {top10.map((user, idx) => {
          const isTop3 = idx < 3;
          const fastestSec = user.fastest_completion_seconds;
          const hasValidSpeed = typeof fastestSec === 'number' && fastestSec > 0 && fastestSec < 9999;

          return (
            <div
              key={user.user_name}
              className={`flex items-center justify-between rounded-xl p-2.5 transition-all ${
                idx === 0
                  ? 'border border-amber-500/30 bg-amber-500/10 shadow-sm'
                  : idx === 1
                  ? 'border border-slate-400/30 bg-slate-400/10'
                  : idx === 2
                  ? 'border border-amber-700/30 bg-amber-700/10'
                  : 'border border-border/60 bg-secondary/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                  isTop3 ? 'bg-background/80 shadow-sm' : 'text-muted-foreground'
                }`}>
                  {getRankBadge(idx)}
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {user.user_name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span>{user.total_submissions} kuis selesai</span>
                    {hasValidSpeed && (
                      <span className="flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                        <Clock className="h-3 w-3" /> {fastestSec}s
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  {user.xp_points} XP
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  <Flame className="h-3 w-3" /> {user.current_streak}d streak
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
