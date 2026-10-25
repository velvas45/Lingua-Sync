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
    const user = await getSessionUser(token);

    const languagesResult = await db.execute({ sql: 'SELECT * FROM languages', args: [] });
    const languages = languagesResult.rows;
    
    const currentLangResult = await db.execute({
      sql: 'SELECT * FROM languages WHERE code = ?',
      args: [lang],
    });
    const currentLang = currentLangResult.rows[0] || languages[0];

    // Cards scoping: authenticated user gets their own cards; guest gets 5 template cards
    let cards: Card[] = [];
    if (user) {
      const userCardsResult = await db.execute({
        sql: `
        SELECT * FROM cards
        WHERE user_id = ? AND language_code = ?
        ORDER BY id ASC
      `,
        args: [user.id, lang],
      });
      cards = userCardsResult.rows as unknown as Card[];

      // Fallback to default template cards if user doesn't have any yet in this language
      if (cards.length === 0) {
        const templateCardsResult = await db.execute({
          sql: `
          SELECT * FROM cards
          WHERE user_id IS NULL AND language_code = ?
          ORDER BY id ASC
          LIMIT 5
        `,
          args: [lang],
        });
        cards = templateCardsResult.rows as unknown as Card[];
      }
    } else {
      // Guest: only 5 initial default cards, no user-specific cards
      const guestCardsResult = await db.execute({
        sql: `
        SELECT * FROM cards
        WHERE user_id IS NULL AND language_code = ?
        ORDER BY id ASC
        LIMIT 5
      `,
        args: [lang],
      });
      cards = guestCardsResult.rows as unknown as Card[];
    }

    // Dynamic Daily Challenge Prompt based on user's personal cards
    let prompt: {
      id: number;
      language_code: string;
      card_id: number | null;
      prompt_question: string;
      hint: string;
      card_text?: string;
    } | null = null;

    if (user && cards.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const dateHash = todayStr.split('-').reduce((acc, part) => (acc * 31 + Number(part)) & 0xffff, 0);
      const daySeed = Math.abs(dateHash + user.id) % cards.length;
      const dailyWord = cards[daySeed];

      prompt = {
        id: dailyWord.id,
        language_code: lang,
        card_id: dailyWord.id,
        prompt_question: `Buat 1-2 kalimat aktif menggunakan kata "${dailyWord.primary_text}" (${dailyWord.meaning_id}).`,
        hint: `Contoh konteks: "${dailyWord.example_source}" (${dailyWord.example_meaning})`,
        card_text: dailyWord.primary_text,
      };
    } else {
      // Fallback prompt for guest or empty deck
      const promptResult = await db.execute({
        sql: `
        SELECT dp.*, c.primary_text as card_text
        FROM daily_prompts dp
        LEFT JOIN cards c ON dp.card_id = c.id
        WHERE dp.language_code = ?
        ORDER BY dp.id DESC
        LIMIT 1
      `,
        args: [lang],
      });
      prompt = promptResult.rows[0] as unknown as typeof prompt;
    }

    // Submissions: community feed up to 50 items with like statuses
    let recentSubmissions = [];
    if (user) {
      const submissionsResult = await db.execute({
        sql: `
        SELECT s.*, COALESCE(dp.prompt_question, 'Tantangan Harian Kosakata') as prompt_question,
               CASE WHEN sl.user_id IS NOT NULL THEN 1 ELSE 0 END as has_liked
        FROM submissions s
        LEFT JOIN daily_prompts dp ON s.prompt_id = dp.id
        LEFT JOIN submission_likes sl ON s.id = sl.submission_id AND sl.user_id = ?
        WHERE s.language_code = ?
        ORDER BY s.created_at DESC
        LIMIT 50
      `,
        args: [user.id, lang],
      });
      recentSubmissions = submissionsResult.rows;
    } else {
      const submissionsResult = await db.execute({
        sql: `
        SELECT s.*, COALESCE(dp.prompt_question, 'Tantangan Harian Kosakata') as prompt_question, 0 as has_liked
        FROM submissions s
        LEFT JOIN daily_prompts dp ON s.prompt_id = dp.id
        WHERE s.language_code = ?
        ORDER BY s.created_at DESC
        LIMIT 50
      `,
        args: [lang],
      });
      recentSubmissions = submissionsResult.rows;
    }

    const leaderboardResult = await db.execute({
      sql: `
      SELECT user_name, current_streak, total_submissions, last_active_date, xp_points,
             COALESCE(fastest_completion_seconds, 9999) as fastest_completion_seconds
      FROM user_stats
      ORDER BY xp_points DESC,
               (CASE WHEN fastest_completion_seconds > 0 THEN fastest_completion_seconds ELSE 9999 END) ASC,
               current_streak DESC
      LIMIT 10
    `,
      args: [],
    });
    const leaderboard = leaderboardResult.rows;

    let userProfile = null;
    let hasCompletedToday = false;
    let todaySubmission = null;

    if (user) {
      const statsResult = await db.execute({
        sql: 'SELECT current_streak, total_submissions, xp_points, fastest_completion_seconds FROM user_stats WHERE user_name = ?',
        args: [user.username],
      });
      const stats = statsResult.rows[0] as unknown as UserStats | undefined;
      userProfile = {
        ...user,
        current_streak: stats?.current_streak ?? 1,
        total_submissions: stats?.total_submissions ?? 0,
        xp_points: stats?.xp_points ?? 0,
        fastest_completion_seconds: stats?.fastest_completion_seconds ?? 9999,
      };

      const today = new Date().toISOString().split('T')[0];
      const existingResult = await db.execute({
        sql: `
        SELECT id, text_response, earned_xp, completion_seconds, created_at
        FROM submissions
        WHERE user_name = ? AND language_code = ? AND date(created_at) = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
        args: [user.username, lang, today],
      });
      const existing = existingResult.rows[0] as unknown as { id: number; text_response: string; earned_xp: number; completion_seconds: number; created_at: string } | undefined;

      if (existing) {
        hasCompletedToday = true;
        todaySubmission = existing;
      }
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
      hasCompletedToday,
      todaySubmission,
    });
  } catch (error: unknown) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
