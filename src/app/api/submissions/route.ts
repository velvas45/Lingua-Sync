import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, languageCode, promptId, textResponse, speakingPracticed } = body;

    if (!userName || !languageCode || !promptId || !textResponse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanName = userName.trim();
    const cleanResponse = textResponse.trim();

    // Insert submission
    const insert = db.prepare(`
      INSERT INTO submissions (user_name, language_code, prompt_id, text_response, speaking_practiced)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(cleanName, languageCode, promptId, cleanResponse, speakingPracticed ? 1 : 0);

    // Update user stats / streak
    const existingUser = db.prepare('SELECT * FROM user_stats WHERE user_name = ?').get(cleanName) as {
      user_name: string;
      current_streak: number;
      total_submissions: number;
      last_active_date: string | null;
      xp_points: number;
    } | undefined;
    const today = new Date().toISOString().split('T')[0];
    const earnedXp = speakingPracticed ? 25 : 15;

    if (!existingUser) {
      db.prepare(`
        INSERT INTO user_stats (user_name, current_streak, total_submissions, last_active_date, xp_points)
        VALUES (?, 1, 1, ?, ?)
      `).run(cleanName, today, earnedXp);
    } else {
      let streak = existingUser.current_streak;
      if (existingUser.last_active_date !== today) {
        // If last active was yesterday, increment streak, otherwise reset to 1
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        streak = existingUser.last_active_date === yesterday ? streak + 1 : 1;
      }

      db.prepare(`
        UPDATE user_stats
        SET current_streak = ?,
            total_submissions = total_submissions + 1,
            last_active_date = ?,
            xp_points = xp_points + ?
        WHERE user_name = ?
      `).run(streak, today, earnedXp, cleanName);
    }

    return NextResponse.json({
      success: true,
      submissionId: result.lastInsertRowid,
      earnedXp
    });
  } catch (error: unknown) {
    console.error('Error submitting response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
