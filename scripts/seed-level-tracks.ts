import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for Turso credentials
config({ path: resolve(process.cwd(), '.env.local') });

import db from '../src/lib/db';

async function seedLevelTracks() {
  console.log('📚 Seeding level tracks...');
  
  const tracks = [
    // Japanese JLPT levels
    { code: 'N5', language_code: 'ja', name: 'JLPT N5', description: 'Beginner Japanese', order_num: 1 },
    { code: 'N4', language_code: 'ja', name: 'JLPT N4', description: 'Elementary Japanese', order_num: 2 },
    { code: 'N3', language_code: 'ja', name: 'JLPT N3', description: 'Intermediate Japanese', order_num: 3 },
    { code: 'N2', language_code: 'ja', name: 'JLPT N2', description: 'Upper Intermediate Japanese', order_num: 4 },
    { code: 'N1', language_code: 'ja', name: 'JLPT N1', description: 'Advanced Japanese', order_num: 5 },
    
    // English CEFR levels
    { code: 'A1', language_code: 'en', name: 'CEFR A1', description: 'Beginner English', order_num: 1 },
    { code: 'A2', language_code: 'en', name: 'CEFR A2', description: 'Elementary English', order_num: 2 },
    { code: 'B1', language_code: 'en', name: 'CEFR B1', description: 'Intermediate English', order_num: 3 },
    { code: 'B2', language_code: 'en', name: 'CEFR B2', description: 'Upper Intermediate English', order_num: 4 },
    { code: 'C1', language_code: 'en', name: 'CEFR C1', description: 'Advanced English', order_num: 5 },
    { code: 'C2', language_code: 'en', name: 'CEFR C2', description: 'Proficiency English', order_num: 6 }
  ];
  
  for (const track of tracks) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO level_tracks (code, language_code, name, description, order_num) VALUES (?, ?, ?, ?, ?)',
        args: [track.code, track.language_code, track.name, track.description, track.order_num]
      });
      console.log(`✅ ${track.name} (${track.code})`);
    } catch (error: any) {
      console.error(`❌ Failed to seed ${track.code}:`, error.message);
    }
  }
  
  // Verify
  const result = await db.execute({ sql: 'SELECT * FROM level_tracks ORDER BY language_code, order_num', args: [] });
  console.log(`\n📊 Total level tracks: ${result.rows.length}`);
  console.table(result.rows);
}

seedLevelTracks().catch(console.error);
