import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser, VocabularyBankItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const batchParam = searchParams.get('batch');
    const batch = Math.min(50, Math.max(1, Number(batchParam || 20)));

    const excludeParam = searchParams.get('exclude');
    const excludeList = excludeParam
      ? excludeParam
          .split(',')
          .map((w) => decodeURIComponent(w.trim()))
          .filter(Boolean)
      : [];

    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = await getSessionUser(token);

    let items: VocabularyBankItem[] = [];

    if (user) {
      // Exclude words already saved in user's deck
      const userCardWordsResult = await db.execute({
        sql: 'SELECT primary_text FROM cards WHERE user_id = ?',
        args: [user.id],
      });
      const userCardWords = userCardWordsResult.rows as unknown as Array<{ primary_text: string }>;

      const allExcluded = Array.from(
        new Set([...userCardWords.map((c) => c.primary_text), ...excludeList])
      );

      if (allExcluded.length > 0) {
        const placeholders = allExcluded.map(() => '?').join(',');
        const itemsResult = await db.execute({
          sql: `
            SELECT * FROM vocabulary_bank
            WHERE language_code = ?
              AND primary_text NOT IN (${placeholders})
            ORDER BY RANDOM()
            LIMIT ?
          `,
          args: [lang, ...allExcluded, batch],
        });
        items = itemsResult.rows as unknown as VocabularyBankItem[];
      } else {
        const itemsResult = await db.execute({
          sql: `
            SELECT * FROM vocabulary_bank
            WHERE language_code = ?
            ORDER BY RANDOM()
            LIMIT ?
          `,
          args: [lang, batch],
        });
        items = itemsResult.rows as unknown as VocabularyBankItem[];
      }
    } else {
      // Guest: exclude session-seen words
      if (excludeList.length > 0) {
        const placeholders = excludeList.map(() => '?').join(',');
        const itemsResult = await db.execute({
          sql: `
            SELECT * FROM vocabulary_bank
            WHERE language_code = ?
              AND primary_text NOT IN (${placeholders})
            ORDER BY RANDOM()
            LIMIT ?
          `,
          args: [lang, ...excludeList, batch],
        });
        items = itemsResult.rows as unknown as VocabularyBankItem[];
      } else {
        const itemsResult = await db.execute({
          sql: `
            SELECT * FROM vocabulary_bank
            WHERE language_code = ?
            ORDER BY RANDOM()
            LIMIT ?
          `,
          args: [lang, batch],
        });
        items = itemsResult.rows as unknown as VocabularyBankItem[];
      }
    }

    // Fallback if all exclusions exhausted the pool
    if (items.length === 0) {
      const fallbackResult = await db.execute({
        sql: `
          SELECT * FROM vocabulary_bank
          WHERE language_code = ?
          ORDER BY RANDOM()
          LIMIT ?
        `,
        args: [lang, batch],
      });
      items = fallbackResult.rows as unknown as VocabularyBankItem[];
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Belum ada data kosakata di bank data untuk bahasa ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      items,
      item: items[0], // backward compatibility
      count: items.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching random vocabulary batch from bank:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
