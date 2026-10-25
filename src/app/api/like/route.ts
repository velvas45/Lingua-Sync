import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = await getSessionUser(token);

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
    const transaction = await db.transaction('write');
    
    try {
      const existingLikeResult = await transaction.execute({
        sql: `
        SELECT 1 FROM submission_likes
        WHERE user_id = ? AND submission_id = ?
      `,
        args: [user.id, subId],
      });

      let liked = false;
      if (existingLikeResult.rows.length > 0) {
        // Unlike (batalkan love)
        await transaction.execute({
          sql: 'DELETE FROM submission_likes WHERE user_id = ? AND submission_id = ?',
          args: [user.id, subId],
        });
        await transaction.execute({
          sql: 'UPDATE submissions SET likes = MAX(0, likes - 1) WHERE id = ?',
          args: [subId],
        });
        liked = false;
      } else {
        // Like (beri love)
        await transaction.execute({
          sql: 'INSERT INTO submission_likes (user_id, submission_id) VALUES (?, ?)',
          args: [user.id, subId],
        });
        await transaction.execute({
          sql: 'UPDATE submissions SET likes = likes + 1 WHERE id = ?',
          args: [subId],
        });
        liked = true;
      }

      const updatedResult = await transaction.execute({
        sql: 'SELECT likes FROM submissions WHERE id = ?',
        args: [subId],
      });
      const likes = (updatedResult.rows[0] as unknown as { likes: number })?.likes ?? 0;
      
      await transaction.commit();
      
      return NextResponse.json({
        success: true,
        liked,
        likes,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error toggling like:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
