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
