import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import db from '../src/lib/db';

async function check() {
  const vocab = await db.execute({ sql: 'SELECT COUNT(*) as count FROM vocabulary_bank', args: [] });
  const chars = await db.execute({ sql: 'SELECT COUNT(*) as count FROM japanese_characters', args: [] });
  const grammar = await db.execute({ sql: 'SELECT COUNT(*) as count FROM grammar_lessons', args: [] });
  const cards = await db.execute({ sql: 'SELECT COUNT(*) as count FROM cards', args: [] });
  const langs = await db.execute({ sql: 'SELECT COUNT(*) as count FROM languages', args: [] });
  
  console.log('📊 Turso Database Status:');
  console.log(`   Languages: ${(langs.rows[0] as any).count}`);
  console.log(`   Vocabulary Bank: ${(vocab.rows[0] as any).count}`);
  console.log(`   Sample Cards: ${(cards.rows[0] as any).count}`);
  console.log(`   Japanese Characters: ${(chars.rows[0] as any).count}`);
  console.log(`   Grammar Lessons: ${(grammar.rows[0] as any).count}`);
}

check().catch(console.error);
