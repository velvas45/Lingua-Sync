-- Turso Database Schema for Lingua Sync
-- Run this after creating your Turso database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag TEXT NOT NULL,
  speech_locale TEXT NOT NULL
);

-- Cards table (user flashcards)
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

-- Vocabulary bank (template cards)
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

-- Daily prompts
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

-- User submissions
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

-- Submission likes
CREATE TABLE IF NOT EXISTS submission_likes (
  user_id INTEGER NOT NULL,
  submission_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, submission_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- User statistics
CREATE TABLE IF NOT EXISTS user_stats (
  user_name TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 1,
  total_submissions INTEGER DEFAULT 0,
  last_active_date TEXT,
  xp_points INTEGER DEFAULT 0,
  fastest_completion_seconds INTEGER DEFAULT 9999
);

-- Level tracks
CREATE TABLE IF NOT EXISTS level_tracks (
  code TEXT PRIMARY KEY,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Grammar lessons
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

-- Japanese characters (hiragana, katakana, kanji)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_user_lang ON cards(user_id, language_code);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(language_code, created_at);
CREATE INDEX IF NOT EXISTS idx_vocab_bank_lang ON vocabulary_bank(language_code, category);
CREATE INDEX IF NOT EXISTS idx_grammar_lang_level ON grammar_lessons(language_code, level);
CREATE INDEX IF NOT EXISTS idx_levels_lang ON level_tracks(language_code, order_num);
CREATE INDEX IF NOT EXISTS idx_jap_chars_type ON japanese_characters(type);
CREATE INDEX IF NOT EXISTS idx_jap_chars_char ON japanese_characters(character);
CREATE INDEX IF NOT EXISTS idx_jap_chars_sub_cat ON japanese_characters(type, sub_category);

-- Insert default language (Japanese)
INSERT OR IGNORE INTO languages (code, name, native_name, flag, speech_locale) 
VALUES ('ja', 'Japanese', '日本語', '🇯🇵', 'ja-JP');
