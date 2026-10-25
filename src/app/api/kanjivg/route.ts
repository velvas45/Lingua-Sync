import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface KanjiVgStroke {
  index: number;
  id: string;
  d: string;
}

export interface KanjiVgNumber {
  num: number;
  x: number;
  y: number;
}

export interface KanjiVgData {
  success: boolean;
  character: string;
  hex: string;
  viewBox: string;
  strokes: KanjiVgStroke[];
  numbers: KanjiVgNumber[];
}

// In-memory server-side LRU cache to ensure 0ms repeat accesses
const kanjiVgMemoryCache = new Map<string, KanjiVgData>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const char = searchParams.get('char')?.trim() || '';

    if (!char) {
      return NextResponse.json({ error: 'Parameter char wajib diisi' }, { status: 400 });
    }

    // Check in-memory cache first
    if (kanjiVgMemoryCache.has(char)) {
      return NextResponse.json(kanjiVgMemoryCache.get(char)!);
    }

    const codePoint = char.codePointAt(0);
    if (!codePoint) {
      return NextResponse.json({ error: 'Karakter tidak valid' }, { status: 400 });
    }

    const hex = codePoint.toString(16).padStart(5, '0');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hex}.svg`;

    const res = await fetch(cdnUrl, { cache: 'force-cache' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Data goresan vektor tidak ditemukan untuk karakter ${char}` },
        { status: 404 }
      );
    }

    const svgText = await res.text();

    // Extract paths
    const pathRegex = /<path[^>]*id="([^"]+)"[^>]*d="([^"]+)"/g;
    const strokes: KanjiVgStroke[] = [];
    let match: RegExpExecArray | null;
    let idx = 1;

    while ((match = pathRegex.exec(svgText)) !== null) {
      strokes.push({
        index: idx++,
        id: match[1],
        d: match[2],
      });
    }

    // Extract numbers and their coordinates
    const numRegex = /<text[^>]*matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)[^>]*>(\d+)<\/text>/g;
    const numbers: KanjiVgNumber[] = [];

    while ((match = numRegex.exec(svgText)) !== null) {
      numbers.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2]),
        num: parseInt(match[3], 10),
      });
    }

    const data: KanjiVgData = {
      success: true,
      character: char,
      hex,
      viewBox: '0 0 109 109',
      strokes,
      numbers,
    };

    kanjiVgMemoryCache.set(char, data);

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching KanjiVG stroke data:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
