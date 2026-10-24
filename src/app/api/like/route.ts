import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    db.prepare(`
      UPDATE submissions
      SET likes = likes + 1
      WHERE id = ?
    `).run(submissionId);

    const updated = db.prepare('SELECT likes FROM submissions WHERE id = ?').get(submissionId) as { likes: number } | undefined;

    return NextResponse.json({ success: true, likes: updated?.likes ?? 0 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
