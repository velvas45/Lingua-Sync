import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser, Card, UserStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    const languages = db.prepare('SELECT * FROM languages').all();
    const currentLang = db.prepare('SELECT * FROM languages WHERE code = ?').get(lang) || languages[0];

    // Cards scoping: authenticated user gets their own cards; guest gets 5 template cards
    let cards: Card[] = [];
    if (user) {
      cards = db.prepare(`
        SELECT * FROM cards
        WHERE user_id = ? AND language_code = ?
        ORDER BY id ASC
      `).all(user.id, lang) as Card[];

      // Fallback to default template cards if user doesn't have any yet in this language
      if (cards.length === 0) {
        cards = db.prepare(`
          SELECT * FROM cards
          WHERE user_id IS NULL AND language_code = ?
          ORDER BY id ASC
          LIMIT 5
        `).all(lang) as Card[];
      }
    } else {
      // Guest: only 5 initial default cards, no user-specific cards
      cards = db.prepare(`
        SELECT * FROM cards
        WHERE user_id IS NULL AND language_code = ?
        ORDER BY id ASC
        LIMIT 5
      `).all(lang) as Card[];
    }

    const prompt = db.prepare(`
      SELECT dp.*, c.primary_text as card_text
      FROM daily_prompts dp
      LEFT JOIN cards c ON dp.card_id = c.id
      WHERE dp.language_code = ?
      ORDER BY dp.id DESC
      LIMIT 1
    `).get(lang);

    // Submissions: include whether current user has liked each submission
    let recentSubmissions = [];
    if (user) {
      recentSubmissions = db.prepare(`
        SELECT s.*, dp.prompt_question,
               CASE WHEN sl.user_id IS NOT NULL THEN 1 ELSE 0 END as has_liked
        FROM submissions s
        JOIN daily_prompts dp ON s.prompt_id = dp.id
        LEFT JOIN submission_likes sl ON s.id = sl.submission_id AND sl.user_id = ?
        WHERE s.language_code = ?
        ORDER BY s.created_at DESC
        LIMIT 20
      `).all(user.id, lang);
    } else {
      recentSubmissions = db.prepare(`
        SELECT s.*, dp.prompt_question, 0 as has_liked
        FROM submissions s
        JOIN daily_prompts dp ON s.prompt_id = dp.id
        WHERE s.language_code = ?
        ORDER BY s.created_at DESC
        LIMIT 20
      `).all(lang);
    }

    const leaderboard = db.prepare(`
      SELECT * FROM user_stats
      ORDER BY xp_points DESC, total_submissions DESC
      LIMIT 5
    `).all();

    let userProfile = null;
    if (user) {
      const stats = db.prepare('SELECT current_streak, total_submissions, xp_points FROM user_stats WHERE user_name = ?').get(user.username) as UserStats | undefined;
      userProfile = {
        ...user,
        current_streak: stats?.current_streak ?? 1,
        total_submissions: stats?.total_submissions ?? 0,
        xp_points: stats?.xp_points ?? 0,
      };
    }

    return NextResponse.json({
      languages,
      currentLang,
      cards,
      prompt,
      recentSubmissions,
      leaderboard,
      currentUser: userProfile,
      isGuest: !user,
    });
  } catch (error: unknown) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
