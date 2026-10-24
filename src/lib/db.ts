import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'lingua_drill.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  speech_locale: string;
}

export interface Card {
  id: number;
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

export interface DailyPrompt {
  id: number;
  language_code: string;
  card_id: number | null;
  prompt_question: string;
  hint: string;
  created_at: string;
}

export interface Submission {
  id: number;
  user_name: string;
  language_code: string;
  prompt_id: number;
  text_response: string;
  speaking_practiced: number;
  created_at: string;
  likes: number;
}

export interface UserStats {
  user_name: string;
  current_streak: number;
  total_submissions: number;
  last_active_date: string | null;
  xp_points: number;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS languages (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      flag TEXT NOT NULL,
      speech_locale TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );

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

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      language_code TEXT NOT NULL,
      prompt_id INTEGER NOT NULL,
      text_response TEXT NOT NULL,
      speaking_practiced INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      FOREIGN KEY (language_code) REFERENCES languages(code),
      FOREIGN KEY (prompt_id) REFERENCES daily_prompts(id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_name TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      total_submissions INTEGER DEFAULT 0,
      last_active_date TEXT,
      xp_points INTEGER DEFAULT 0
    );
  `);

  const countLang = db.prepare('SELECT COUNT(*) as count FROM languages').get() as { count: number };
  if (countLang.count === 0) {
    const insertLang = db.prepare(`
      INSERT INTO languages (code, name, native_name, flag, speech_locale)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertLang.run('en', 'English', 'English', '🇺🇸', 'en-US');
    insertLang.run('ja', 'Japanese', '日本語', '🇯🇵', 'ja-JP');
  }

  const countCards = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
  if (countCards.count === 0) {
    const insertCard = db.prepare(`
      INSERT INTO cards (language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const enCards = [
      {
        lang: 'en',
        text: 'Pull Request (PR)',
        phonetic: '/pʊl rɪˈkwest/',
        furigana: null,
        meaning: 'Permintaan penggabungan cabang kode ke repositori utama',
        pos: 'Noun',
        level: 'Business / Tech',
        example: 'Could you please review my pull request when you have a moment?',
        exampleMeaning: 'Bisakah Anda meninjau pull request saya saat Anda ada waktu luang?',
        guide: 'Tekankan kata "Pull" dan gunakan intonasi ramah pada "when you have a moment"'
      },
      {
        lang: 'en',
        text: 'Edge Case',
        phonetic: '/edʒ keɪs/',
        furigana: null,
        meaning: 'Skenario langka atau kasus batas yang jarang terjadi namun harus diantisipasi',
        pos: 'Noun',
        level: 'Engineering Concept',
        example: 'We need to handle the edge case where the network drops mid-transaction.',
        exampleMeaning: 'Kita perlu menangani skenario batas di mana koneksi terputus saat transaksi berjalan.',
        guide: 'Bunyi "dg" diucapkan seperti "j" tebal (/edʒ/)'
      },
      {
        lang: 'en',
        text: 'Trade-off',
        phonetic: '/ˈtreɪd.ɒf/',
        furigana: null,
        meaning: 'Kompromi atau pertukaran konsekuensi antara dua pilihan teknis',
        pos: 'Noun',
        level: 'Architecture',
        example: 'We made a conscious trade-off between quick delivery and architectural purity.',
        exampleMeaning: 'Kami mengambil kompromi sadar antara pengiriman cepat dan kemurnian arsitektur.',
        guide: 'Sambungkan kata "trade" dan "off" dengan jeda minimal'
      },
      {
        lang: 'en',
        text: 'Heads-up',
        phonetic: '/ˌhedz ˈʌp/',
        furigana: null,
        meaning: 'Pemberitahuan awal atau peringatan santai sebelum sesuatu terjadi',
        pos: 'Idiom / Noun',
        level: 'Daily Work',
        example: 'Just a quick heads-up: our database migration starts at 8 PM tonight.',
        exampleMeaning: 'Sekadar pemberitahuan singkat: migrasi database kita dimulai jam 8 malam ini.',
        guide: 'Sering dipakai dalam bentuk frasa "give someone a heads-up"'
      },
      {
        lang: 'en',
        text: 'Bottleneck',
        phonetic: '/ˈbɒt.əl.nek/',
        furigana: null,
        meaning: 'Menyumbat atau memperlambat aliran keseluruhan proses / kinerja sistem',
        pos: 'Verb / Noun',
        level: 'Performance',
        example: 'The synchronous logging call was bottlenecking our API throughput.',
        exampleMeaning: 'Pemanggilan log sinkron menyumbat throughput API kami.',
        guide: 'Fokus pada penekanan suku kata pertama: BOT-tl-nek'
      }
    ];

    for (const card of enCards) {
      insertCard.run(
        card.lang,
        card.text,
        card.phonetic,
        card.furigana,
        card.meaning,
        card.pos,
        card.level,
        card.example,
        card.exampleMeaning,
        card.guide
      );
    }

    const jaCards = [
      {
        lang: 'ja',
        text: '確認',
        phonetic: 'かくにん (kakunin)',
        furigana: '<ruby>確認<rt>かくにん</rt></ruby>',
        meaning: 'Konfirmasi, pemeriksaan, pengecekan',
        pos: 'Noun / Suru-Verb',
        level: 'JLPT N4 / Business',
        example: 'コードの確認をお願いできますか？',
        exampleMeaning: 'Bisakah saya meminta Anda untuk memeriksa kode ini?',
        guide: 'Ucapkan dengan vokal jernih: ka-ku-nin, hindari memanjangkan u'
      },
      {
        lang: 'ja',
        text: '進捗',
        phonetic: 'しんちょく (shinchoku)',
        furigana: '<ruby>進捗<rt>しんちょく</rt></ruby>',
        meaning: 'Progress, kemajuan perkembangan tugas atau proyek',
        pos: 'Noun',
        level: 'JLPT N3 / Business',
        example: '現在の進捗状況を教えてください。',
        exampleMeaning: 'Tolong beri tahu saya status progres saat ini.',
        guide: 'Sering dipasangkan dengan 状況 (joukyou) menjadi 進捗状況'
      },
      {
        lang: 'ja',
        text: '修正',
        phonetic: 'しゅうせい (shuusei)',
        furigana: '<ruby>修正<rt>しゅうせい</rt></ruby>',
        meaning: 'Perbaikan, revisi, koreksi bug atau kesalahan',
        pos: 'Noun / Suru-Verb',
        level: 'JLPT N3 / Business',
        example: 'バグを修正して新しいPRを作成しました。',
        exampleMeaning: 'Saya telah memperbaiki bug dan membuat PR baru.',
        guide: 'Vokal panjang pada "shuu" dan "sei"'
      },
      {
        lang: 'ja',
        text: '了解です',
        phonetic: 'りょうかいです (ryoukai desu)',
        furigana: '<ruby>了解<rt>りょうかい</rt></ruby>です',
        meaning: 'Dimengerti / Diterima (Paham instruksi rekan kerja)',
        pos: 'Phrase',
        level: 'Colloquial Work',
        example: '了解です！すぐに対応いたします。',
        exampleMeaning: 'Dimengerti! Saya akan segera menanganinya.',
        guide: 'Digunakan ke rekan sejawat. Ke atasan gunakan 承知いたしました (shouchi itashimashita)'
      },
      {
        lang: 'ja',
        text: 'デプロイ',
        phonetic: 'でぷろい (depuroi)',
        furigana: 'デプロイ',
        meaning: 'Deploy (Peluncuran aplikasi ke server)',
        pos: 'Katakana / Loanword',
        level: 'IT Katakana',
        example: 'ステージング環境へデプロイが完了しました。',
        exampleMeaning: 'Deployment ke lingkungan staging telah selesai.',
        guide: 'Katakana standar tech di Jepang, sering digabung dengan する (suru)'
      }
    ];

    for (const card of jaCards) {
      insertCard.run(
        card.lang,
        card.text,
        card.phonetic,
        card.furigana,
        card.meaning,
        card.pos,
        card.level,
        card.example,
        card.exampleMeaning,
        card.guide
      );
    }
  }

  const countPrompts = db.prepare('SELECT COUNT(*) as count FROM daily_prompts').get() as { count: number };
  if (countPrompts.count === 0) {
    const insertPrompt = db.prepare(`
      INSERT INTO daily_prompts (language_code, card_id, prompt_question, hint)
      VALUES (?, ?, ?, ?)
    `);

    insertPrompt.run(
      'en',
      1,
      'Write 1 sentence about what feature or bug you are currently working on using the word "Pull Request" or "Edge Case".',
      'Example: "I am opening a pull request today to fix the edge case in login flow."'
    );

    insertPrompt.run(
      'ja',
      6,
      '今日のタスクや進捗について、短い日本語で1文書いてみましょう。（「確認」または「進捗」を使って）',
      'Contoh: 今日のタスクの進捗は80%です。確認をお願いします。'
    );
  }
}

initDatabase();

export default db;
