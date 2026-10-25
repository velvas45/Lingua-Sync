import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { JapaneseCharacterRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type')?.trim();
    const subCategory = searchParams.get('sub_category')?.trim();
    const level = searchParams.get('level')?.trim(); // e.g. 'N5' | 'N4'
    const search = searchParams.get('search')?.trim();

    let query = 'SELECT * FROM japanese_characters WHERE 1=1';
    const params: unknown[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (subCategory && subCategory !== 'all') {
      query += ' AND sub_category = ?';
      params.push(subCategory);
    }

    if (level) {
      query += ' AND jlpt_level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (character LIKE ? OR romaji LIKE ? OR meaning LIKE ? OR example_word LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY grade ASC, strokes ASC, id ASC';

    const characters = db.prepare(query).all(...params) as JapaneseCharacterRecord[];

    return NextResponse.json({
      success: true,
      total: characters.length,
      characters,
    });
  } catch (error: unknown) {
    console.error('Error fetching japanese characters:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
