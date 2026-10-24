import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;

    const user = getSessionUser(token);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get user stats (streak, xp)
    const stats = db.prepare('SELECT current_streak, total_submissions, xp_points FROM user_stats WHERE user_name = ?').get(user.username) as {
      current_streak: number;
      total_submissions: number;
      xp_points: number;
    } | undefined;

    return NextResponse.json({
      user: {
        ...user,
        current_streak: stats?.current_streak ?? 1,
        total_submissions: stats?.total_submissions ?? 0,
        xp_points: stats?.xp_points ?? 0,
      },
    });
  } catch (error: unknown) {
    console.error('Session verification error:', error);
    return NextResponse.json({ user: null });
  }
}
