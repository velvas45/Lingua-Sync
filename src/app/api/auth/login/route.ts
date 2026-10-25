import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { verifyPassword, createSession } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username dan Password wajib diisi' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const cleanPassword = String(password);

    // Look up user by email OR username
    const result = await db.execute({
      sql: `
        SELECT id, username, email, phone_number, password_hash, salt
        FROM users
        WHERE email = ? OR LOWER(username) = ?
      `,
      args: [cleanIdentifier, cleanIdentifier],
    });

    const user = result.rows[0] as unknown as {
      id: number;
      username: string;
      email: string;
      phone_number: string;
      password_hash: string;
      salt: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid (Email/Username salah)' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(cleanPassword, user.salt, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password yang Anda masukkan salah' },
        { status: 401 }
      );
    }

    // Create session
    const { token, expiresAt } = await createSession(user.id);

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
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
