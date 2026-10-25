import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lingua_session')?.value;

    if (token) {
      await deleteSession(token);
    }

    cookieStore.delete('lingua_session');

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
