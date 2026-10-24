import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk memberi apresiasi' },
        { status: 401 }
      );
    }

    const { submissionId } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    const subId = Number(submissionId);

    // Transaction to toggle like
    const toggleTx = db.transaction(() => {
      const existingLike = db.prepare(`
        SELECT 1 FROM submission_likes
        WHERE user_id = ? AND submission_id = ?
      `).get(user.id, subId);

      let liked = false;
      if (existingLike) {
        // Unlike (batalkan love)
        db.prepare('DELETE FROM submission_likes WHERE user_id = ? AND submission_id = ?').run(user.id, subId);
        db.prepare('UPDATE submissions SET likes = MAX(0, likes - 1) WHERE id = ?').run(subId);
        liked = false;
      } else {
        // Like (beri love)
        db.prepare('INSERT INTO submission_likes (user_id, submission_id) VALUES (?, ?)').run(user.id, subId);
        db.prepare('UPDATE submissions SET likes = likes + 1 WHERE id = ?').run(subId);
        liked = true;
      }

      const updated = db.prepare('SELECT likes FROM submissions WHERE id = ?').get(subId) as { likes: number } | undefined;
      return { liked, likes: updated?.likes ?? 0 };
    });

    const result = toggleTx();

    return NextResponse.json({
      success: true,
      liked: result.liked,
      likes: result.likes,
    });
  } catch (error: unknown) {
    console.error('Error toggling like:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
