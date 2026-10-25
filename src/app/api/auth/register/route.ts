import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { hashPassword, createSession, cloneDefaultCardsForUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, phone_number, password } = body;

    if (!username || !email || !phone_number || !password) {
      return NextResponse.json(
        { error: 'Semua field (Username, Email, No. HP, Password) wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone_number).trim();
    const cleanPassword = String(password);

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if email or username already registered
    const existingResult = await db.execute({
      sql: `SELECT id FROM users WHERE email = ? OR LOWER(username) = ?`,
      args: [cleanEmail, cleanUsername.toLowerCase()],
    });

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email atau username sudah terdaftar' },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(cleanPassword);

    const result = await db.execute({
      sql: `INSERT INTO users (username, email, phone_number, password_hash, salt) VALUES (?, ?, ?, ?, ?)`,
      args: [cleanUsername, cleanEmail, cleanPhone, hash, salt],
    });

    const userId = Number(result.lastInsertRowid);

    // Seed 5 default flashcards per language for new user
    await cloneDefaultCardsForUser(userId);

    // Initialize user_stats row if not exists
    const statsResult = await db.execute({
      sql: 'SELECT user_name FROM user_stats WHERE user_name = ?',
      args: [cleanUsername],
    });
    
    if (statsResult.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO user_stats (user_name, current_streak, total_submissions, last_active_date, xp_points) VALUES (?, 1, 0, NULL, 0)`,
        args: [cleanUsername],
      });
    }

    // Create session
    const { token, expiresAt } = await createSession(userId);

    const cookieStore = await cookies();
    cookieStore.set('lingua_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: cleanUsername,
        email: cleanEmail,
        phone_number: cleanPhone,
      },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
