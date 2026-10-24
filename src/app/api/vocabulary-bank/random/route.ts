import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser, VocabularyBankItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    let randomItem: VocabularyBankItem | undefined;

    if (user) {
      // Prioritize words that user doesn't already have in their deck
      randomItem = db.prepare(`
        SELECT * FROM vocabulary_bank
        WHERE language_code = ?
          AND primary_text NOT IN (SELECT primary_text FROM cards WHERE user_id = ?)
        ORDER BY RANDOM()
        LIMIT 1
      `).get(lang, user.id) as VocabularyBankItem | undefined;

      // Fallback if user already collected all words in this language
      if (!randomItem) {
        randomItem = db.prepare(`
          SELECT * FROM vocabulary_bank
          WHERE language_code = ?
          ORDER BY RANDOM()
          LIMIT 1
        `).get(lang) as VocabularyBankItem | undefined;
      }
    } else {
      // Guest: purely random from the bank
      randomItem = db.prepare(`
        SELECT * FROM vocabulary_bank
        WHERE language_code = ?
        ORDER BY RANDOM()
        LIMIT 1
      `).get(lang) as VocabularyBankItem | undefined;
    }

    if (!randomItem) {
      return NextResponse.json(
        { error: 'Belum ada data kosakata di bank data untuk bahasa ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: randomItem,
    });
  } catch (error: unknown) {
    console.error('Error fetching random vocabulary from bank:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
