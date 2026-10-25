import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';
import { analyzeAnswer } from '@/lib/grammarAnalyzer';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk menyelesaikan tantangan harian' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      languageCode,
      promptId,
      textResponse,
      speakingPracticed,
      clientLocalHour,
      completionSeconds,
    } = body;

    if (!languageCode || !promptId || !textResponse) {
      return NextResponse.json({ error: 'Data tantangan belum lengkap' }, { status: 400 });
    }

    // Timezone check: Quiz is strictly unlocked from 08:00 AM local time
    const localHour = typeof clientLocalHour === 'number' ? clientLocalHour : new Date().getHours();
    if (localHour < 8) {
      return NextResponse.json(
        {
          error: 'Tantangan harian ini baru dibuka pukul 08:00 pagi waktu lokal Anda. Silakan kembali lagi pukul 08:00!',
        },
        { status: 403 }
      );
    }

    const cleanName = user.username;
    const cleanResponse = String(textResponse).trim();
    const today = new Date().toISOString().split('T')[0];

    // Strictly 1x attempt per day: check if user already completed this language today
    const existingTodaySubmission = db.prepare(`
      SELECT id FROM submissions
      WHERE user_name = ? AND language_code = ? AND date(created_at) = ?
    `).get(cleanName, languageCode, today);

    if (existingTodaySubmission) {
      return NextResponse.json(
        {
          error: 'Anda sudah menyelesaikan kuis tantangan hari ini untuk bahasa ini! Tantangan berikutnya akan dibuka besok pukul 08:00.',
        },
        { status: 409 }
      );
    }

    // Retrieve prompt to perform linguistic & keyword analysis
    const prompt = db.prepare('SELECT * FROM daily_prompts WHERE id = ?').get(promptId) as {
      id: number;
      prompt_question: string;
      hint: string;
    } | undefined;

    const analysis = analyzeAnswer(
      cleanResponse,
      languageCode,
      prompt?.prompt_question || '',
      prompt?.hint || ''
    );

    if (!analysis.isValid) {
      return NextResponse.json(
        {
          error: analysis.grammarFeedback,
          suggestions: analysis.suggestions,
        },
        { status: 422 }
      );
    }

    // Sanitize completion seconds (minimum 5s, max 3600s)
    const validDurationSeconds = Math.max(5, Math.min(3600, Number(completionSeconds) || 60));

    // Dynamic Scoring Engine:
    // Base XP: 15
    // Voice Bonus: +10 if Web Speech API used
    // Quality/Grammar Bonus: +5 if analysis score >= 80
    // Time Multiplier: 1.5x (08:00-09:00), 1.2x (09:00-12:00), 1.0x (12:00+)
    const baseXp = 15;
    const voiceXp = speakingPracticed ? 10 : 0;
    const grammarBonusXp = analysis.qualityBonusXp;

    let timeMultiplier = 1.0;
    let timeTierLabel = 'Reguler (1.0x)';

    if (localHour >= 8 && localHour < 9) {
      timeMultiplier = 1.5;
      timeTierLabel = 'Early Bird Golden Hour (1.5x)';
    } else if (localHour >= 9 && localHour < 12) {
      timeMultiplier = 1.2;
      timeTierLabel = 'Morning Focus (1.2x)';
    }

    const calculatedXp = Math.round((baseXp + voiceXp + grammarBonusXp) * timeMultiplier);

    // Insert submission
    const insert = db.prepare(`
      INSERT INTO submissions (user_name, language_code, prompt_id, text_response, speaking_practiced, completion_seconds, earned_xp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      cleanName,
      languageCode,
      promptId,
      cleanResponse,
      speakingPracticed ? 1 : 0,
      validDurationSeconds,
      calculatedXp
    );

    // Update user stats, streak, and fastest completion time
    const existingUser = db.prepare('SELECT * FROM user_stats WHERE user_name = ?').get(cleanName) as {
      user_name: string;
      current_streak: number;
      total_submissions: number;
      last_active_date: string | null;
      xp_points: number;
      fastest_completion_seconds?: number;
    } | undefined;

    let currentStreak = 1;

    if (!existingUser) {
      db.prepare(`
        INSERT INTO user_stats (user_name, current_streak, total_submissions, last_active_date, xp_points, fastest_completion_seconds)
        VALUES (?, 1, 1, ?, ?, ?)
      `).run(cleanName, today, calculatedXp, validDurationSeconds);
    } else {
      currentStreak = existingUser.current_streak;
      if (existingUser.last_active_date !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        currentStreak = existingUser.last_active_date === yesterday ? currentStreak + 1 : 1;
      }

      const prevFastest = existingUser.fastest_completion_seconds ?? 9999;
      const newFastest = Math.min(prevFastest > 0 ? prevFastest : 9999, validDurationSeconds);

      db.prepare(`
        UPDATE user_stats
        SET current_streak = ?,
            total_submissions = total_submissions + 1,
            last_active_date = ?,
            xp_points = xp_points + ?,
            fastest_completion_seconds = ?
        WHERE user_name = ?
      `).run(currentStreak, today, calculatedXp, newFastest, cleanName);
    }

    return NextResponse.json({
      success: true,
      submissionId: result.lastInsertRowid,
      earnedXp: calculatedXp,
      durationSeconds: validDurationSeconds,
      timeTierLabel,
      breakdown: {
        base: baseXp,
        voice: voiceXp,
        grammarBonus: grammarBonusXp,
        multiplier: timeMultiplier,
      },
      analysis,
      streak: currentStreak,
    });
  } catch (error: unknown) {
    console.error('Error submitting response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
