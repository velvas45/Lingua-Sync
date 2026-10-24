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
    const existing = db.prepare(`
      SELECT id FROM users
      WHERE email = ? OR LOWER(username) = ?
    `).get(cleanEmail, cleanUsername.toLowerCase());

    if (existing) {
      return NextResponse.json(
        { error: 'Email atau username sudah terdaftar' },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(cleanPassword);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, phone_number, password_hash, salt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(cleanUsername, cleanEmail, cleanPhone, hash, salt);
    const userId = Number(result.lastInsertRowid);

    // Seed 5 default flashcards per language for new user
    cloneDefaultCardsForUser(userId);

    // Initialize user_stats row if not exists
    const existingStats = db.prepare('SELECT user_name FROM user_stats WHERE user_name = ?').get(cleanUsername);
    if (!existingStats) {
      db.prepare(`
        INSERT INTO user_stats (user_name, current_streak, total_submissions, last_active_date, xp_points)
        VALUES (?, 1, 0, NULL, 0)
      `).run(cleanUsername);
    }

    // Create session
    const { token, expiresAt } = createSession(userId);

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
