import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for Turso credentials
config({ path: resolve(process.cwd(), '.env.local') });

import db from '../src/lib/db';

async function seedLanguages() {
  console.log('🌍 Seeding base languages...');
  
  const languages = [
    { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', speech_locale: 'en-US' },
    { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', speech_locale: 'ja-JP' }
  ];
  
  for (const lang of languages) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO languages (code, name, native_name, flag, speech_locale) VALUES (?, ?, ?, ?, ?)',
        args: [lang.code, lang.name, lang.native_name, lang.flag, lang.speech_locale]
      });
      console.log(`✅ ${lang.name} (${lang.code})`);
    } catch (error: any) {
      console.error(`❌ Failed to seed ${lang.code}:`, error.message);
    }
  }
  
  // Verify
  const result = await db.execute({ sql: 'SELECT * FROM languages', args: [] });
  console.log(`\n📊 Total languages in database: ${result.rows.length}`);
  console.table(result.rows);
}

seedLanguages().catch(console.error);
