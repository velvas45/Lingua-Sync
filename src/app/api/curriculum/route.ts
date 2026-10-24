import { NextResponse } from 'next/server';
import db, { LevelTrack, GrammarLesson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const level = searchParams.get('level');

    // Get available level tracks for this language
    const levels = db
      .prepare(
        `
      SELECT * FROM level_tracks
      WHERE language_code = ?
      ORDER BY order_num ASC
    `
      )
      .all(lang) as LevelTrack[];

    // Get grammar lessons (filtered by level if provided)
    let lessons: GrammarLesson[] = [];
    if (level && level !== 'all') {
      lessons = db
        .prepare(
          `
        SELECT * FROM grammar_lessons
        WHERE language_code = ? AND level = ?
        ORDER BY id ASC
      `
        )
        .all(lang, level) as GrammarLesson[];
    } else {
      lessons = db
        .prepare(
          `
        SELECT * FROM grammar_lessons
        WHERE language_code = ?
        ORDER BY id ASC
      `
        )
        .all(lang) as GrammarLesson[];
    }

    return NextResponse.json({
      success: true,
      levels,
      lessons,
    });
  } catch (error: unknown) {
    console.error('Error fetching curriculum:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
