import { createClient, Client } from '@libsql/client';
import crypto from 'node:crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

// Global defensive serializer to prevent JSON.stringify BigInt runtime crashes across all API routes
if (typeof BigInt !== 'undefined' && !(BigInt.prototype as unknown as { toJSON?: () => number }).toJSON) {
  (BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
    return Number(this);
  };
}

// Load .env.local first (for scripts), fallback to .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Initialize Turso client
let db: Client;

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  // Production/Turso mode
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} else {
  // Local development fallback
  console.warn('⚠️ Turso credentials not found. Using local SQLite file for development.');
  db = createClient({
    url: 'file:./data/lingua_drill.db',
  });
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  speech_locale: string;
}

export interface Card {
  id: number;
  user_id: number | null;
  language_code: string;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech: string | null;
  level: string | null;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
  created_at: string;
}

export interface VocabularyBankItem {
  id: number;
  language_code: string;
  category: string;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech: string | null;
  level: string | null;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
  created_at: string;
}

export interface DailyPrompt {
  id: number;
  language_code: string;
  card_id: number | null;
  prompt_question: string;
  hint: string;
  created_at: string;
}

export interface LevelTrack {
  code: string;
  language_code: string;
  name: string;
  description: string;
  order_num: number;
}

export interface GrammarLesson {
  id: number;
  language_code: string;
  level: string;
  title: string;
  formula: string;
  explanation: string;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
  created_at: string;
}

export interface JapaneseCharacterRecord {
  id: number;
  type: 'hiragana' | 'katakana' | 'kanji';
  sub_category?: string | null;
  character: string;
  romaji: string;
  meaning: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  strokes: number;
  jlpt_level: string | null;
  grade: number | null;
  origin: string | null;
  example_word: string | null;
  example_reading: string | null;
  example_meaning: string | null;
  created_at: string;
}

export interface Submission {
  id: number;
  user_name: string;
  language_code: string;
  prompt_id: number;
  text_response: string;
  speaking_practiced: number;
  completion_seconds?: number;
  earned_xp?: number;
  created_at: string;
  likes: number;
  has_liked?: boolean;
}

export interface UserStats {
  user_name: string;
  current_streak: number;
  total_submissions: number;
  last_active_date: string | null;
  xp_points: number;
  fastest_completion_seconds?: number;
}

// ----------------- Cryptographic & Auth Helpers -----------------

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await db.execute({
    sql: `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
    args: [token, userId, expiresAt.toISOString()],
  });
  
  return { token, expiresAt };
}

export async function getSessionUser(token: string | null | undefined): Promise<User | null> {
  if (!token) return null;
  
  const now = new Date().toISOString();
  const result = await db.execute({
    sql: `
      SELECT u.id, u.username, u.email, u.phone_number, u.created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > ?
    `,
    args: [token, now],
  });
  
  return result.rows.length > 0 ? (result.rows[0] as unknown as User) : null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM sessions WHERE id = ?',
    args: [token],
  });
}

export async function cloneDefaultCardsForUser(userId: number): Promise<void> {
  const templateCards = await db.execute({
    sql: `SELECT * FROM cards WHERE user_id IS NULL ORDER BY id ASC`,
    args: [],
  });

  const transaction = await db.transaction('write');
  
  try {
    for (const card of templateCards.rows) {
      const c = card as unknown as Card;
      await transaction.execute({
        sql: `
          INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          userId,
          c.language_code,
          c.primary_text,
          c.phonetic,
          c.furigana_html,
          c.meaning_id,
          c.part_of_speech,
          c.level,
          c.example_source,
          c.example_meaning,
          c.audio_guide,
        ],
      });
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ----------------- Database Initialization & Schema Migration -----------------

export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone_number TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS languages (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      flag TEXT NOT NULL,
      speech_locale TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      language_code TEXT NOT NULL,
      primary_text TEXT NOT NULL,
      phonetic TEXT,
      furigana_html TEXT,
      meaning_id TEXT NOT NULL,
      part_of_speech TEXT,
      level TEXT,
      example_source TEXT NOT NULL,
      example_meaning TEXT NOT NULL,
      audio_guide TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vocabulary_bank (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language_code TEXT NOT NULL,
      category TEXT NOT NULL,
      primary_text TEXT NOT NULL,
      phonetic TEXT,
      furigana_html TEXT,
      meaning_id TEXT NOT NULL,
      part_of_speech TEXT DEFAULT 'Vocabulary',
      level TEXT DEFAULT 'Intermediate',
      example_source TEXT NOT NULL,
      example_meaning TEXT NOT NULL,
      audio_guide TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(language_code, primary_text),
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS daily_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language_code TEXT NOT NULL,
      card_id INTEGER,
      prompt_question TEXT NOT NULL,
      hint TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (language_code) REFERENCES languages(code),
      FOREIGN KEY (card_id) REFERENCES cards(id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      language_code TEXT NOT NULL,
      prompt_id INTEGER,
      text_response TEXT NOT NULL,
      speaking_practiced INTEGER DEFAULT 0,
      completion_seconds INTEGER DEFAULT 60,
      earned_xp INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS submission_likes (
      user_id INTEGER NOT NULL,
      submission_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, submission_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_name TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      total_submissions INTEGER DEFAULT 0,
      last_active_date TEXT,
      xp_points INTEGER DEFAULT 0,
      fastest_completion_seconds INTEGER DEFAULT 9999
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS level_tracks (
      code TEXT PRIMARY KEY,
      language_code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      order_num INTEGER NOT NULL,
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS grammar_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language_code TEXT NOT NULL,
      level TEXT NOT NULL,
      title TEXT NOT NULL,
      formula TEXT NOT NULL,
      explanation TEXT NOT NULL,
      example_source TEXT NOT NULL,
      example_meaning TEXT NOT NULL,
      audio_guide TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (language_code) REFERENCES languages(code),
      FOREIGN KEY (level) REFERENCES level_tracks(code)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS japanese_characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      sub_category TEXT DEFAULT 'gojuon',
      character TEXT UNIQUE NOT NULL,
      romaji TEXT NOT NULL,
      meaning TEXT,
      onyomi TEXT,
      kunyomi TEXT,
      strokes INTEGER NOT NULL DEFAULT 1,
      jlpt_level TEXT,
      grade INTEGER,
      origin TEXT,
      example_word TEXT,
      example_reading TEXT,
      example_meaning TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_cards_user_lang ON cards(user_id, language_code);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(language_code, created_at);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_vocab_bank_lang ON vocabulary_bank(language_code, category);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_grammar_lang_level ON grammar_lessons(language_code, level);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_levels_lang ON level_tracks(language_code, order_num);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_jap_chars_type ON japanese_characters(type);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_jap_chars_char ON japanese_characters(character);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_jap_chars_sub_cat ON japanese_characters(type, sub_category);`);

  console.log('✅ Database schema initialized');
}

export default db;
