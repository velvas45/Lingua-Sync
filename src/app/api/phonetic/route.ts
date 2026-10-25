import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { convertJapaneseToRomaji, convertEnglishToIpa } from '@/lib/phoneticGenerator';
import { generateFuriganaHtml } from '@/lib/furigana';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text')?.trim() || '';
    const lang = searchParams.get('lang')?.trim() || 'en';

    if (!text) {
      return NextResponse.json({ success: true, text: '', phonetic: '', furigana_html: null });
    }

    // 1. Check local SQLite vocabulary_bank for exact match
    const dbMatch = db
      .prepare(
        `
      SELECT phonetic, furigana_html FROM vocabulary_bank
      WHERE language_code = ? AND lower(primary_text) = lower(?)
      LIMIT 1
    `
      )
      .get(lang, text) as { phonetic: string | null; furigana_html: string | null } | undefined;

    if (dbMatch) {
      return NextResponse.json({
        success: true,
        text,
        phonetic: dbMatch.phonetic || '',
        furigana_html: dbMatch.furigana_html || null,
        source: 'database',
      });
    }

    // 2. Japanese Language Resolution (Kana/Kanji -> Hepburn Romaji & Furigana HTML)
    if (lang === 'ja') {
      const romaji = convertJapaneseToRomaji(text);
      const furigana = generateFuriganaHtml(text);
      return NextResponse.json({
        success: true,
        text,
        phonetic: romaji,
        furigana_html: furigana,
        source: 'japanese_engine',
      });
    }

    // 3. English Language Resolution via Datamuse Authentic IPA Dictionary
    try {
      const datamuseRes = await fetch(
        `https://api.datamuse.com/words?sp=${encodeURIComponent(text)}&qe=sp&md=r&ipa=1`,
        { cache: 'no-store' }
      );

      if (datamuseRes.ok) {
        const results = (await datamuseRes.json()) as Array<{
          word: string;
          tags?: string[];
        }>;

        const exactMatch = results.find(
          (r) => r.word.toLowerCase() === text.toLowerCase()
        ) || results[0];

        if (exactMatch && exactMatch.tags) {
          const ipaTag = exactMatch.tags.find((t) => t.startsWith('ipa_pron:'));
          if (ipaTag) {
            const rawIpa = ipaTag.replace('ipa_pron:', '').trim();
            const formattedIpa = `/${rawIpa}/`;
            return NextResponse.json({
              success: true,
              text,
              phonetic: formattedIpa,
              furigana_html: null,
              source: 'datamuse_ipa',
            });
          }
        }
      }
    } catch (apiErr) {
      console.warn('Datamuse API fallback triggered:', apiErr);
    }

    // 4. Fallback to local heuristic engine if API is unreachable
    const fallbackIpa = convertEnglishToIpa(text);
    return NextResponse.json({
      success: true,
      text,
      phonetic: fallbackIpa,
      furigana_html: null,
      source: 'fallback_engine',
    });
  } catch (error: unknown) {
    console.error('Error resolving phonetic:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
