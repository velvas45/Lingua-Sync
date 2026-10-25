import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';
import { sanitizeFuriganaInput } from '@/lib/furigana';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = await getSessionUser(token);

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

    const result = await db.execute({
      sql: `
        INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        audio_guide ? String(audio_guide).trim() : null,
      ],
    });

    return NextResponse.json({ success: true, cardId: result.lastInsertRowid });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk mengubah kosakata' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
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

    if (!id || !primary_text || !meaning_id || !example_source || !example_meaning) {
      return NextResponse.json({ error: 'Field penting belum lengkap' }, { status: 400 });
    }

    const cleanPrimaryText = String(primary_text).trim();
    const cleanMeaningId = String(meaning_id).trim();
    const cleanExampleSource = String(example_source).trim();
    const cleanExampleMeaning = String(example_meaning).trim();
    const sanitizedFurigana = sanitizeFuriganaInput(furigana_html);

    const result = await db.execute({
      sql: `
        UPDATE cards
        SET primary_text = ?,
            phonetic = ?,
            furigana_html = ?,
            meaning_id = ?,
            part_of_speech = ?,
            level = ?,
            example_source = ?,
            example_meaning = ?,
            audio_guide = ?
        WHERE id = ? AND user_id = ?
      `,
      args: [
        cleanPrimaryText,
        phonetic ? String(phonetic).trim() : null,
        sanitizedFurigana,
        cleanMeaningId,
        part_of_speech ? String(part_of_speech).trim() : 'General',
        level ? String(level).trim() : 'Intermediate',
        cleanExampleSource,
        cleanExampleMeaning,
        audio_guide ? String(audio_guide).trim() : null,
        Number(id),
        user.id,
      ],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Kartu tidak ditemukan atau Anda tidak memiliki hak akses' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk terlebih dahulu untuk menghapus kosakata' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kartu wajib disertakan' }, { status: 400 });
    }

    const result = await db.execute({
      sql: `DELETE FROM cards WHERE id = ? AND user_id = ?`,
      args: [Number(id), user.id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Kartu tidak ditemukan atau Anda tidak memiliki hak akses' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
