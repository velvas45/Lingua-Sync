import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';
import { sanitizeFuriganaInput } from '@/lib/furigana';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk menambahkan kosakata' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      language_code,
      primary_text,
      phonetic,
      furigana_html,
      meaning_id,
      part_of_speech,
      level,
      example_source,
      example_meaning,
      audio_guide,
    } = body;

    if (!language_code || !primary_text || !meaning_id || !example_source || !example_meaning) {
      return NextResponse.json({ error: 'Field penting belum lengkap' }, { status: 400 });
    }

    const cleanPrimaryText = String(primary_text).trim();
    const cleanMeaningId = String(meaning_id).trim();
    const cleanExampleSource = String(example_source).trim();
    const cleanExampleMeaning = String(example_meaning).trim();
    const sanitizedFurigana = sanitizeFuriganaInput(furigana_html);

    const insert = db.prepare(`
      INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      user.id,
      String(language_code).trim(),
      cleanPrimaryText,
      phonetic ? String(phonetic).trim() : null,
      sanitizedFurigana,
      cleanMeaningId,
      part_of_speech ? String(part_of_speech).trim() : 'General',
      level ? String(level).trim() : 'Intermediate',
      cleanExampleSource,
      cleanExampleMeaning,
      audio_guide ? String(audio_guide).trim() : null
    );

    return NextResponse.json({ success: true, cardId: result.lastInsertRowid });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
