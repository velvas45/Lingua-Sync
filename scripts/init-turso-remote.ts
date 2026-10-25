import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for Turso credentials
config({ path: resolve(process.cwd(), '.env.local') });

import db from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function initSchema() {
  console.log('🚀 Initializing Turso database schema...');
  
  const schemaPath = path.join(__dirname, 'init-turso-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split SQL statements (separated by semicolon + newline)
  const statements = schema
    .split(';\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📄 Found ${statements.length} SQL statements`);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await db.execute({ sql: statements[i], args: [] });
      console.log(`✅ [${i + 1}/${statements.length}] Statement executed`);
    } catch (error: any) {
      // Ignore "table already exists" errors
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  [${i + 1}/${statements.length}] Table already exists, skipping`);
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] Failed:`, error.message);
        throw error;
      }
    }
  }
  
  console.log('\n🎉 Schema initialization complete!');
}

initSchema().catch(console.error);
