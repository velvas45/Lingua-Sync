import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const languages = db.prepare('SELECT * FROM languages').all();
    const currentLang = db.prepare('SELECT * FROM languages WHERE code = ?').get(lang) || languages[0];

    const cards = db.prepare(`
      SELECT * FROM cards
      WHERE language_code = ?
      ORDER BY id ASC
    `).all(lang);

    const prompt = db.prepare(`
      SELECT dp.*, c.primary_text as card_text
      FROM daily_prompts dp
      LEFT JOIN cards c ON dp.card_id = c.id
      WHERE dp.language_code = ?
      ORDER BY dp.id DESC
      LIMIT 1
    `).get(lang);

    const recentSubmissions = db.prepare(`
      SELECT s.*, dp.prompt_question
      FROM submissions s
      JOIN daily_prompts dp ON s.prompt_id = dp.id
      WHERE s.language_code = ?
      ORDER BY s.created_at DESC
      LIMIT 20
    `).all(lang);

    const leaderboard = db.prepare(`
      SELECT * FROM user_stats
      ORDER BY xp_points DESC, total_submissions DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      languages,
      currentLang,
      cards,
      prompt,
      recentSubmissions,
      leaderboard
    });
  } catch (error: unknown) {
    console.error('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
