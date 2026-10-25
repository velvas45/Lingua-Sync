export interface RubySegment {
  type: 'ruby';
  base: string;
  reading: string;
}

export interface TextSegment {
  type: 'text';
  content: string;
}

export type FuriganaSegment = RubySegment | TextSegment;

/**
 * Checks if a string contains any Kanji characters (CJK Unified Ideographs)
 */
export function containsKanji(text: string): boolean {
  return /[\u4e00-\u9faf]/.test(text);
}

/**
 * Core Kanji vocabulary to canonical <ruby> HTML mappings
 */
const CORE_KANJI_FURIGANA_MAP: Record<string, string> = {
  日本語: '<ruby>日本<rt>にほん</rt></ruby><ruby>語<rt>ご</rt></ruby>',
  日本: '<ruby>日本<rt>にほん</rt></ruby>',
  私: '<ruby>私<rt>わたし</rt></ruby>',
  学生: '<ruby>学生<rt>がくせい</rt></ruby>',
  先生: '<ruby>先生<rt>せんせい</rt></ruby>',
  学校: '<ruby>学校<rt>がっこう</rt></ruby>',
  友達: '<ruby>友達<rt>ともだち</rt></ruby>',
  今日: '<ruby>今日<rt>きょう</rt></ruby>',
  明日: '<ruby>明日<rt>あした</rt></ruby>',
  昨日: '<ruby>昨日<rt>きのう</rt></ruby>',
  毎日: '<ruby>毎日<rt>まいにち</rt></ruby>',
  朝: '<ruby>朝<rt>あさ</rt></ruby>',
  昼: '<ruby>昼<rt>ひる</rt></ruby>',
  夜: '<ruby>夜<rt>よる</rt></ruby>',
  水: '<ruby>水<rt>みず</rt></ruby>',
  お茶: 'お<ruby>茶<rt>ちゃ</rt></ruby>',
  食べる: '<ruby>食<rt>た</rt></ruby>べる',
  飲む: '<ruby>飲<rt>の</rt></ruby>む',
  見る: '<ruby>見<rt>み</rt></ruby>る',
  聞く: '<ruby>聞<rt>き</rt></ruby>く',
  行く: '<ruby>行<rt>い</rt></ruby>く',
  来る: '<ruby>来<rt>く</rt></ruby>る',
  車: '<ruby>車<rt>くるま</rt></ruby>',
  電車: '<ruby>電車<rt>でんしゃ</rt></ruby>',
  駅: '<ruby>駅<rt>えき</rt></ruby>',
  家: '<ruby>家<rt>いえ</rt></ruby>',
  本: '<ruby>本<rt>ほん</rt></ruby>',
  勉強: '<ruby>勉強<rt>べんきょう</rt></ruby>',
  練習: '<ruby>練習<rt>れんしゅう</rt></ruby>',
  家族: '<ruby>家族<rt>かぞく</rt></ruby>',
  時間: '<ruby>時間<rt>じかん</rt></ruby>',
  生活: '<ruby>生活<rt>せいかつ</rt></ruby>',
  人: '<ruby>人<rt>ひと</rt></ruby>',
  男: '<ruby>男<rt>おとこ</rt></ruby>',
  女: '<ruby>女<rt>おんな</rt></ruby>',
  女性: '<ruby>女性<rt>じょせい</rt></ruby>',
  男性: '<ruby>男性<rt>だんせい</rt></ruby>',
  子ども: '<ruby>子<rt>こ</rt></ruby>ども',
  富士山: '<ruby>富士山<rt>ふじさん</rt></ruby>',
  挨拶: '<ruby>挨拶<rt>あいさつ</rt></ruby>',
  感謝: '<ruby>感謝<rt>かんしゃ</rt></ruby>',
  英語: '<ruby>英語<rt>えいご</rt></ruby>',
  会話: '<ruby>会話<rt>かいわ</rt></ruby>',
  読書: '<ruby>読書<rt>どくしょ</rt></ruby>',
  写真: '<ruby>写真<rt>しゃしん</rt></ruby>',
  料理: '<ruby>料理<rt>りょうり</rt></ruby>',
  旅行: '<ruby>旅行<rt>りょこう</rt></ruby>',
  仕事: '<ruby>仕事<rt>しごと</rt></ruby>',
  会社: '<ruby>会社<rt>かいしゃ</rt></ruby>',
  部屋: '<ruby>部屋<rt>へや</rt></ruby>',
  教室: '<ruby>教室<rt>きょうしつ</rt></ruby>',
};

/**
 * Automatically generates canonical <ruby> HTML for a Japanese input.
 * Returns null if the word is pure Kana (no Kanji) because Furigana is not needed.
 */
export function generateFuriganaHtml(text: string, knownReading?: string): string | null {
  const clean = text.trim();
  if (!clean) return null;

  // 1. If pure Kana (no Kanji), furigana is unnecessary
  if (!containsKanji(clean)) {
    return null;
  }

  // 2. Exact match in core lexicon
  if (CORE_KANJI_FURIGANA_MAP[clean]) {
    return CORE_KANJI_FURIGANA_MAP[clean];
  }

  // 3. If a known reading is provided, wrap kanji portion cleanly
  if (knownReading && knownReading.trim()) {
    const reading = knownReading.trim();
    // Handle okurigana (e.g. clean = 食べる, reading = たべる)
    if (clean.length > 1 && !containsKanji(clean.slice(-1))) {
      const okurigana = clean.slice(-1);
      if (reading.endsWith(okurigana)) {
        const kanjiPart = clean.slice(0, -1);
        const readingPart = reading.slice(0, -1);
        return `<ruby>${kanjiPart}<rt>${readingPart}</rt></ruby>${okurigana}`;
      }
    }
    return `<ruby>${clean}<rt>${reading}</rt></ruby>`;
  }

  return null;
}

/**
 * Parses a furigana HTML/string into safe structured segments.
 * Eliminates the need for dangerouslySetInnerHTML by converting
 * <ruby>kanji<rt>furigana</rt></ruby> patterns into safe React nodes.
 */
export function parseFurigana(input: string | null | undefined): FuriganaSegment[] {
  if (!input) return [];

  // Remove any dangerous or unwanted tags (script, img, style, etc.)
  // and keep only safe plain content and ruby tags
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<(?!\/?(ruby|rt|rp)\b)[^>]*>/gi, '');

  const segments: FuriganaSegment[] = [];
  const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt>(?:<rp>.*?<\/rp>)?<\/ruby>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = rubyRegex.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = sanitized.slice(lastIndex, match.index).replace(/<[^>]+>/g, '');
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    const base = match[1].replace(/<[^>]+>/g, '').trim();
    const reading = match[2].replace(/<[^>]+>/g, '').trim();

    if (base && reading) {
      segments.push({ type: 'ruby', base, reading });
    } else if (base) {
      segments.push({ type: 'text', content: base });
    }

    lastIndex = rubyRegex.lastIndex;
  }

  if (lastIndex < sanitized.length) {
    const remaining = sanitized.slice(lastIndex).replace(/<[^>]+>/g, '');
    if (remaining) {
      segments.push({ type: 'text', content: remaining });
    }
  }

  return segments;
}

/**
 * Sanitizes input furigana string before saving to database.
 * Ensures only standard <ruby>...</ruby> structure is persisted.
 */
export function sanitizeFuriganaInput(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parseFurigana(trimmed);
  if (parsed.length === 0) return null;

  // Re-encode into clean canonical ruby HTML
  return parsed
    .map(seg => {
      if (seg.type === 'ruby') {
        return `<ruby>${seg.base}<rt>${seg.reading}</rt></ruby>`;
      }
      return seg.content;
    })
    .join('');
}
