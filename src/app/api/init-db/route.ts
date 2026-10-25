import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// API endpoint untuk inisialisasi database
// Hanya untuk first-time setup di production
export async function GET() {
  try {
    // Check if running in production
    if (process.env.NODE_ENV === 'production') {
      // Optional: Add authentication/secret token check here
      const authToken = process.env.INIT_DB_SECRET;
      // For security, you might want to require a secret token
      // Uncomment below if you want to protect this endpoint:
      // const providedToken = request.headers.get('x-init-token');
      // if (providedToken !== authToken) {
      //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // }
    }

    await initDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
