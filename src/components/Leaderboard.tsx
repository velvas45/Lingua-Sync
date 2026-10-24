'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LeaderboardProps {
  board: Array<{
    user_name: string;
    current_streak: number;
    total_submissions: number;
    xp_points: number;
  }>;
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
      <Card className="border-border/80 bg-card/80 backdrop-blur-md">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Trophy className="h-4 w-4 text-amber-400" /> Papan Peringkat Pembelajar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
          Selesaikan tantangan harian untuk masuk ke papan peringkat!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur-md">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Trophy className="h-4 w-4 text-amber-400" /> Papan Peringkat Pembelajar (Leaderboard)
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 p-4 pt-0">
        {board.map((user, idx) => (
          <div
            key={user.user_name}
            className={`flex items-center justify-between rounded-lg p-2.5 transition-all ${
              idx === 0
                ? 'border border-amber-500/20 bg-amber-500/10'
                : 'border border-border/40 bg-secondary/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{getRankBadge(idx)}</span>
              <div>
                <span className="text-xs font-semibold text-foreground">
                  {user.user_name}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {user.total_submissions} latihan selesai
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {user.xp_points} XP
              </span>
              <span className="block text-[11px] font-medium text-amber-700 dark:text-amber-400">
                🔥 {user.current_streak}d
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
