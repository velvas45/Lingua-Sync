import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { getSessionUser } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;
    const user = getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk terlebih dahulu untuk mengubah profil' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, phone_number } = body;

    if (!username || !phone_number) {
      return NextResponse.json(
        { error: 'Username dan Nomor HP wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanPhone = String(phone_number).trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (cleanPhone.length < 6) {
      return NextResponse.json(
        { error: 'Nomor HP tidak valid (minimal 6 digit)' },
        { status: 400 }
      );
    }

    // Check if new username is already used by someone else
    const duplicate = db
      .prepare(
        `
      SELECT id FROM users
      WHERE LOWER(username) = LOWER(?) AND id != ?
    `
      )
      .get(cleanUsername, user.id);

    if (duplicate) {
      return NextResponse.json(
        { error: 'Username sudah digunakan oleh akun lain' },
        { status: 409 }
      );
    }

    const oldUsername = user.username;

    // Atomic transaction across users, user_stats, and submissions
    const updateTx = db.transaction(() => {
      db.prepare(
        `
        UPDATE users
        SET username = ?, phone_number = ?
        WHERE id = ?
      `
      ).run(cleanUsername, cleanPhone, user.id);

      if (oldUsername !== cleanUsername) {
        // Update user_stats to maintain streak & XP
        db.prepare(
          `
          UPDATE user_stats
          SET user_name = ?
          WHERE user_name = ?
        `
        ).run(cleanUsername, oldUsername);

        // Update submissions author name
        db.prepare(
          `
          UPDATE submissions
          SET user_name = ?
          WHERE user_name = ?
        `
        ).run(cleanUsername, oldUsername);
      }
    });

    updateTx();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: cleanUsername,
        email: user.email,
        phone_number: cleanPhone,
      },
    });
  } catch (error: unknown) {
    console.error('Error updating user profile:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
