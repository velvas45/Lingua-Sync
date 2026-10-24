import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'lingua_drill.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

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

export interface Submission {
  id: number;
  user_name: string;
  language_code: string;
  prompt_id: number;
  text_response: string;
  speaking_practiced: number;
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

export function createSession(userId: number): { token: string; expiresAt: Date } {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt.toISOString());
  return { token, expiresAt };
}

export function getSessionUser(token: string | null | undefined): User | null {
  if (!token) return null;
  const now = new Date().toISOString();
  const row = db.prepare(`
    SELECT u.id, u.username, u.email, u.phone_number, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(token, now) as User | undefined;
  return row || null;
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}

export function cloneDefaultCardsForUser(userId: number): void {
  const templateCards = db.prepare(`
    SELECT * FROM cards
    WHERE user_id IS NULL
    ORDER BY id ASC
  `).all() as Card[];

  const insertCard = db.prepare(`
    INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((cards: Card[]) => {
    for (const card of cards) {
      insertCard.run(
        userId,
        card.language_code,
        card.primary_text,
        card.phonetic,
        card.furigana_html,
        card.meaning_id,
        card.part_of_speech,
        card.level,
        card.example_source,
        card.example_meaning,
        card.audio_guide
      );
    }
  });

  tx(templateCards);
}

// ----------------- Database Initialization & Schema Migration -----------------

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone_number TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS languages (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT NOT NULL,
      flag TEXT NOT NULL,
      speech_locale TEXT NOT NULL
    );

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
      prompt_id INTEGER,
      text_response TEXT NOT NULL,
      speaking_practiced INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      likes INTEGER DEFAULT 0,
      FOREIGN KEY (language_code) REFERENCES languages(code)
    );

    CREATE TABLE IF NOT EXISTS submission_likes (
      user_id INTEGER NOT NULL,
      submission_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, submission_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_name TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      total_submissions INTEGER DEFAULT 0,
      last_active_date TEXT,
      xp_points INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_cards_user_lang ON cards(user_id, language_code);
    CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(language_code, created_at);
    CREATE INDEX IF NOT EXISTS idx_vocab_bank_lang ON vocabulary_bank(language_code, category);
  `);

  // Non-destructive check for prompt_id foreign key constraint in submissions
  try {
    const fkList = db.prepare("PRAGMA foreign_key_list(submissions)").all() as Array<{ table: string; from: string }>;
    const hasPromptFk = fkList.some((fk) => fk.table === 'daily_prompts');
    if (hasPromptFk) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE submissions_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_name TEXT NOT NULL,
          language_code TEXT NOT NULL,
          prompt_id INTEGER,
          text_response TEXT NOT NULL,
          speaking_practiced INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          likes INTEGER DEFAULT 0,
          FOREIGN KEY (language_code) REFERENCES languages(code)
        );
        INSERT INTO submissions_temp SELECT id, user_name, language_code, prompt_id, text_response, speaking_practiced, created_at, likes FROM submissions;
        DROP TABLE submissions;
        ALTER TABLE submissions_temp RENAME TO submissions;
        CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(language_code, created_at);
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (e) {
    console.error('Error migrating submissions table constraint:', e);
  }

  // Non-destructive check for user_id column on cards
  const cardColumns = db.prepare("PRAGMA table_info(cards)").all() as Array<{ name: string }>;
  const hasUserId = cardColumns.some((col) => col.name === 'user_id');
  if (!hasUserId) {
    db.exec('ALTER TABLE cards ADD COLUMN user_id INTEGER REFERENCES users(id)');
  }

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
      INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide)
      VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  // Seed vocabulary_bank if empty
  const countVocab = db.prepare('SELECT COUNT(*) as count FROM vocabulary_bank').get() as { count: number };
  if (countVocab.count === 0) {
    const insertVocab = db.prepare(`
      INSERT OR IGNORE INTO vocabulary_bank (
        language_code, category, primary_text, phonetic, furigana_html, meaning_id, part_of_speech, level, example_source, example_meaning, audio_guide
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const enBank = [
      // Daily & Growth
      { cat: 'daily', text: 'Milestone', pho: '/ˈmaɪl.stəʊn/', fur: null, mean: 'Tonggak pencapaian penting dalam proses proyek atau karier', pos: 'Noun', lvl: 'Intermediate', ex: 'Completing the beta release is a major milestone for our product.', exm: 'Menyelesaikan rilis beta adalah tonggak pencapaian besar untuk produk kita.', g: 'Tekankan suku kata pertama "MILE" dan sambungkan halus dengan "stone".' },
      { cat: 'daily', text: 'Breakthrough', pho: '/ˈbreɪk.θruː/', fur: null, mean: 'Terobosan besar atau kemajuan signifikan setelah usaha keras', pos: 'Noun', lvl: 'Intermediate', ex: 'Our research led to an unexpected breakthrough in energy efficiency.', exm: 'Penelitian kami membuahkan terobosan tak terduga dalam efisiensi energi.', g: 'Bunyi "th" diucapkan lembut dengan lidah di antara gigi atas dan bawah.' },
      { cat: 'daily', text: 'Resilience', pho: '/rɪˈzɪl.jəns/', fur: null, mean: 'Ketangguhan dan kemampuan bangkit kembali menghadapi kesulitan', pos: 'Noun', lvl: 'Advanced', ex: 'Showing resilience during challenging moments builds true confidence.', exm: 'Menunjukkan ketangguhan di saat-saat menantang membangun kepercayaan diri sejati.', g: 'Penekanan suku kata jatuh pada bagian tengah: ri-ZIL-ience.' },
      { cat: 'daily', text: 'Perspective', pho: '/pəˈspek.tɪv/', fur: null, mean: 'Sudut pandang atau cara memandang suatu persoalan secara jernih', pos: 'Noun', lvl: 'Intermediate', ex: 'Listening to different opinions gives us a broader perspective on life.', exm: 'Mendengarkan beragam opini memberi kita sudut pandang yang lebih luas dalam hidup.', g: 'Tekankan suku kata kedua: per-SPEC-tive.' },
      { cat: 'daily', text: 'Gratitude', pho: '/ˈɡræt.ɪ.tʃuːd/', fur: null, mean: 'Rasa syukur dan penghargaan mendalam atas kebaikan yang diterima', pos: 'Noun', lvl: 'Daily', ex: 'Expressing gratitude each morning fosters a joyful mindset.', exm: 'Mengungkapkan rasa syukur setiap pagi menumbuhkan pola pikir yang bahagia.', g: 'Lafalkan "gra" pendek dan bersih, diakhiri dengan tude lembut.' },
      { cat: 'daily', text: 'Empathy', pho: '/ˈem.pə.θi/', fur: null, mean: 'Kemampuan memahami dan ikut merasakan perasaan orang lain', pos: 'Noun', lvl: 'Daily', ex: 'Active empathy helps bridge gaps between differing viewpoints.', exm: 'Empati aktif membantu menjembatani jurang pemisah antara sudut pandang yang berbeda.', g: 'Tekankan suku kata awal "EM" dan akhiri dengan thi lembut.' },
      { cat: 'daily', text: 'Curiosity', pho: '/ˌkjʊə.riˈɒs.ə.ti/', fur: null, mean: 'Rasa ingin tahu yang mendorong eksplorasi dan pembelajaran aktif', pos: 'Noun', lvl: 'Intermediate', ex: 'Curiosity is the fundamental engine that powers lifelong learning.', exm: 'Rasa ingin tahu adalah mesin dasar yang menggerakkan pembelajaran seumur hidup.', g: 'Tekankan suku kata: cu-ri-OS-i-ty.' },
      { cat: 'daily', text: 'Mindset', pho: '/ˈmaɪnd.set/', fur: null, mean: 'Pola pikir atau sikap mental dalam menyikapi suatu keadaan', pos: 'Noun', lvl: 'Daily', ex: 'Adopting a continuous learning mindset turns failures into wisdom.', exm: 'Mengadopsi pola pikir terus belajar mengubah kegagalan menjadi kebijaksanaan.', g: 'Sambungkan kata "mind" dan "set" dengan artikulasi tegas pada d dan t.' },
      { cat: 'daily', text: 'Consistency', pho: '/kənˈsɪs.tən.si/', fur: null, mean: 'Konsistensi dan keteraturan tindakan dalam jangka waktu panjang', pos: 'Noun', lvl: 'Intermediate', ex: 'Consistency in daily practice is far more powerful than sporadic intensity.', exm: 'Konsistensi latihan harian jauh lebih dahsyat dibanding usaha intens yang jarang.', g: 'Syllable stress jatuh pada suku kata kedua: con-SIS-ten-cy.' },
      { cat: 'daily', text: 'Balance', pho: '/ˈbæl.əns/', fur: null, mean: 'Keseimbangan harmonis antara berbagai prioritas hidup', pos: 'Noun', lvl: 'Daily', ex: 'Finding balance between ambition and rest prevents chronic burnout.', exm: 'Menemukan keseimbangan antara ambisi dan istirahat mencegah kejenuhan kronis.', g: 'Tekankan suku kata pertama: BAL-ance.' },

      // Work & Communication
      { cat: 'work', text: 'Collaboration', pho: '/kəˌlæb.əˈreɪ.ʃən/', fur: null, mean: 'Kerja sama harmonis antara banyak pihak untuk tujuan bersama', pos: 'Noun', lvl: 'Intermediate', ex: 'Effective collaboration helps diverse people achieve incredible results.', exm: 'Kerja sama yang efektif membantu banyak orang mencapai hasil luar biasa.', g: 'Syllable stress utama jatuh tepat sebelum akhiran "-tion" pada "RAY-shun".' },
      { cat: 'work', text: 'Insight', pho: '/ˈɪn.saɪt/', fur: null, mean: 'Wawasan mendalam atau pemahaman baru yang berharga', pos: 'Noun', lvl: 'Intermediate', ex: 'Thank you for sharing your valuable insight during the discussion.', exm: 'Terima kasih telah membagikan wawasan berharga Anda saat diskusi.', g: 'Tekankan suku kata "IN" dengan artikulasi t tegas di akhir kata.' },
      { cat: 'work', text: 'Deadline', pho: '/ˈded.laɪn/', fur: null, mean: 'Batas waktu akhir penyelesaian suatu tugas atau kewajiban', pos: 'Noun', lvl: 'Daily', ex: 'We submitted all deliverables two days ahead of the scheduled deadline.', exm: 'Kami mengumpulkan seluruh hasil pekerjaan dua hari sebelum batas waktu yang dijadwalkan.', g: 'Tekankan suku kata awal "DEAD" dengan jelas.' },
      { cat: 'work', text: 'Feasibility', pho: '/ˌfiː.zəˈbɪl.ə.ti/', fur: null, mean: 'Kelayakan atau kemungkinan terlaksananya suatu rencana', pos: 'Noun', lvl: 'Advanced', ex: 'We conducted a quick feasibility study before launching the initiative.', exm: 'Kami melakukan studi kelayakan singkat sebelum meluncurkan inisiatif tersebut.', g: 'Tekankan suku kata: fea-si-BIL-i-ty.' },
      { cat: 'work', text: 'Prioritize', pho: '/praɪˈɒr.ɪ.taɪz/', fur: null, mean: 'Menentukan dan mendahulukan hal-hal yang paling krusial', pos: 'Verb', lvl: 'Intermediate', ex: 'It is essential to prioritize high-value tasks during busy weeks.', exm: 'Sangat penting untuk memprioritaskan tugas bernilai tinggi saat pekan sibuk.', g: 'Tekankan suku kata awal: pri-OR-i-tize.' },
      { cat: 'work', text: 'Roadmap', pho: '/ˈrəʊd.mæp/', fur: null, mean: 'Peta jalan atau rencana strategis jangka panjang pencapaian tujuan', pos: 'Noun', lvl: 'Intermediate', ex: 'Our product roadmap outlines the key releases planned for this quarter.', exm: 'Peta jalan produk kami menguraikan rilis-rilis kunci yang direncanakan kuartal ini.', g: 'Ucapkan road dan map bersambung halus.' },
      { cat: 'work', text: 'Streamline', pho: '/ˈstriːm.laɪn/', fur: null, mean: 'Menyederhanakan proses agar lebih efisien, hemat waktu, dan rapi', pos: 'Verb', lvl: 'Intermediate', ex: 'Automation allows us to streamline everyday administrative tasks.', exm: 'Otomatisasi memungkinkan kita menyederhanakan tugas-tugas administratif harian.', g: 'Lafalkan stream dan line tanpa jeda.' },
      { cat: 'work', text: 'Accountability', pho: '/əˌkaʊn.təˈbɪl.ə.ti/', fur: null, mean: 'Tanggung jawab penuh dan transparansi atas hasil keputusan', pos: 'Noun', lvl: 'Advanced', ex: 'Holding personal accountability builds strong professional trust.', exm: 'Memegang tanggung jawab pribadi membangun kepercayaan profesional yang kuat.', g: 'Tekankan suku kata: ac-coun-ta-BIL-i-ty.' },
      { cat: 'work', text: 'Feedback', pho: '/ˈfiːd.bæk/', fur: null, mean: 'Masukan konstruktif untuk evaluasi dan pengembangan kualitas', pos: 'Noun', lvl: 'Daily', ex: 'Regular feedback helps every learner fine-tune their practice.', exm: 'Masukan berkala membantu setiap pembelajar menyempurnakan latihan mereka.', g: 'Tekankan suku kata awal "FEED".' },
      { cat: 'work', text: 'Consensus', pho: '/kənˈsen.səs/', fur: null, mean: 'Kesepakatan bersama yang disetujui secara mufakat oleh semua pihak', pos: 'Noun', lvl: 'Advanced', ex: 'After a productive debate, the team reached a clear consensus.', exm: 'Setelah debat yang produktif, tim mencapai mufakat yang jelas.', g: 'Tekankan suku kata tengah: con-SEN-sus.' },

      // Expressions & Socializing
      { cat: 'expression', text: 'Catch up', pho: '/kætʃ ʌp/', fur: null, mean: 'Mengobrol santai untuk mengetahui kabar terbaru seseorang', pos: 'Phrasal Verb', lvl: 'Daily', ex: 'Let us grab a coffee tomorrow and catch up on everything.', exm: 'Mari minum kopi besok dan mengobrol tentang kabar terbaru kita.', g: 'Sambungkan bunyi "ch" pada catch langsung ke "up".' },
      { cat: 'expression', text: 'Touch base', pho: '/tʌtʃ beɪs/', fur: null, mean: 'Menghubungi singkat seseorang untuk konfirmasi kabar atau status', pos: 'Idiom', lvl: 'Daily', ex: 'I will touch base with you on Friday to see how things are going.', exm: 'Saya akan menghubungi Anda hari Jumat untuk melihat bagaimana perkembangan semuanya.', g: 'Idiom umum untuk "kontak singkat".' },
      { cat: 'expression', text: 'On the same page', pho: '/ɒn ðə seɪm peɪdʒ/', fur: null, mean: 'Memiliki pemahaman dan kesepakatan yang selaras satu sama lain', pos: 'Idiom', lvl: 'Daily', ex: 'A quick sync ensures all contributors are on the same page.', exm: 'Sinkronisasi singkat memastikan semua kontributor berada pada pemahaman yang sama.', g: 'Intonasi mengalir dengan penekanan pada "same page".' },
      { cat: 'expression', text: 'Call it a day', pho: '/kɔːl ɪt ə deɪ/', fur: null, mean: 'Menyudahi kegiatan untuk hari ini dan melanjutkannya besok', pos: 'Idiom', lvl: 'Daily', ex: 'We accomplished all goals today, so let us call it a day.', exm: 'Kita menyelesaikan semua target hari ini, jadi mari kita sudahi hari ini.', g: 'Sambungkan call-it-a-day secara mengalir.' },
      { cat: 'expression', text: 'Think outside the box', pho: '/θɪŋk ˌaʊtˈsaɪd ðə bɒks/', fur: null, mean: 'Berpikir kreatif dan inovatif melampaui batasan kebiasaan lama', pos: 'Idiom', lvl: 'Intermediate', ex: 'To overcome unusual obstacles, we must think outside the box.', exm: 'Untuk mengatasi rintangan yang tak biasa, kita harus berpikir kreatif di luar kebiasaan.', g: 'Bunyi "th" interdental lembut pada think.' }
    ];

    const jaBank = [
      // Daily & Life
      { cat: 'daily', text: '挨拶', pho: 'あいさつ (aisatsu)', fur: '<ruby>挨拶<rt>あいさつ</rt></ruby>', mean: 'Salam sapaan ramah di awal pertemuan', pos: 'Noun / Suru-Verb', lvl: 'N5 / Daily', ex: '明るい挨拶は良いコミュニケーションの第一歩です。', exm: 'Salam yang ceria adalah langkah pertama menuju komunikasi yang baik.', g: 'Lafalkan dengan nada ramah datar per mora: a-i-sa-tsu tanpa penekanan keras.' },
      { cat: 'daily', text: '感謝', pho: 'かんしゃ (kansha)', fur: '<ruby>感謝<rt>かんしゃ</rt></ruby>', mean: 'Rasa terima kasih dan apresiasi tulus atas dukungan orang lain', pos: 'Noun / Suru-Verb', lvl: 'N4 / Daily', ex: 'いつも温かいサポートをしていただき、心から感謝しています。', exm: 'Saya berterima kasih dari lubuk hati atas dukungan hangat Anda selama ini.', g: 'Suku kata "n" (hatsuon) ditahan 1 mora lembut sebelum melafalkan "sha".' },
      { cat: 'daily', text: '準備', pho: 'じゅんび (junbi)', fur: '<ruby>準備<rt>じゅんび</rt></ruby>', mean: 'Persiapan matang sebelum memulai suatu hal atau aktivitas', pos: 'Noun / Suru-Verb', lvl: 'N5 / Daily', ex: '明日からの新しい挑戦に向けて、しっかり準備を整えました。', exm: 'Menjelang tantangan baru mulai besok, saya sudah mempersiapkannya dengan baik.', g: 'Ritme mora stabil: jun-bi, pastikan vokal u dan i terdengar bersih.' },
      { cat: 'daily', text: '成長', pho: 'せいちょう (seichou)', fur: '<ruby>成長<rt>せいちょう</rt></ruby>', mean: 'Pertumbuhan dan perkembangan kapasitas diri menjadi lebih baik', pos: 'Noun / Suru-Verb', lvl: 'N4 / Daily', ex: '日々の小さな積み重ねが、大きな自己成長につながります。', exm: 'Konsistensi kecil setiap hari akan menghasilkan pertumbuhan diri yang besar.', g: 'Vokal panjang chouon: tahan bunyi "sei" dan "chou" masing-masing 2 ketukan mora.' },
      { cat: 'daily', text: '経験', pho: 'けいけん (keiken)', fur: '<ruby>経験<rt>けいけん</rt></ruby>', mean: 'Pengalaman berharga yang dipelajari dari proses nyata', pos: 'Noun / Suru-Verb', lvl: 'N4 / Daily', ex: '失敗を恐れずに挑戦することで、貴重な経験が得られます。', exm: 'Dengan mencoba tanpa takut gagal, kita akan mendapatkan pengalaman berharga.', g: 'Vokal panjang pada "kei": lafalkan bersambung halus dengan "ken".' },
      { cat: 'daily', text: '習慣', pho: 'しゅうかん (shuukan)', fur: '<ruby>習慣<rt>しゅうかん</rt></ruby>', mean: 'Kebiasaan rutin yang dilakukan secara teratur dan konsisten', pos: 'Noun', lvl: 'N4 / Daily', ex: '毎朝の散歩と読書が良い生活習慣になりました。', exm: 'Jalan santai dan membaca setiap pagi telah menjadi kebiasaan hidup yang baik.', g: 'Vokal panjang pada "shuu" tahan 2 ketukan mora.' },
      { cat: 'daily', text: '安心', pho: 'あんしん (anshin)', fur: '<ruby>安心<rt>あんしん</rt></ruby>', mean: 'Rasa tenang, aman, damai, dan bebas dari kekhawatiran', pos: 'Noun / Suru-Verb', lvl: 'N4 / Daily', ex: '無事に目的地に到着した知らせを聞いて、とても安心しました。', exm: 'Mendengar kabar bahwa mereka telah tiba dengan selamat, saya merasa sangat lega.', g: 'Ucapkan an-shin dengan getaran lembut di rongga hidung.' },
      { cat: 'daily', text: '理解', pho: 'りかい (rikai)', fur: '<ruby>理解<rt>りかい</rt></ruby>', mean: 'Pemahaman mendalam mengenai suatu konsep atau perasaan orang lain', pos: 'Noun / Suru-Verb', lvl: 'N4 / Daily', ex: 'お互いの背景を理解することが、円滑な関係の鍵です。', exm: 'Memahami latar belakang satu sama lain adalah kunci hubungan yang harmonis.', g: 'Ucapkan ri-ka-i dengan ketukan ritme datar per mora.' },
      { cat: 'daily', text: '柔軟', pho: 'じゅうなん (juunan)', fur: '<ruby>柔軟<rt>じゅうなん</rt></ruby>', mean: 'Fleksibel, luwes, dan dapat beradaptasi dengan perubahan', pos: 'Na-Adj / Noun', lvl: 'N3 / Daily', ex: '状況の変化に合わせて、柔軟に行動することが大切です。', exm: 'Sangat penting untuk bertindak secara luwes menyesuaikan perubahan situasi.', g: 'Vokal panjang pada "juu".' },
      { cat: 'daily', text: '継続', pho: 'けいぞく (keizoku)', fur: '<ruby>継続<rt>けいぞく</rt></ruby>', mean: 'Keberlanjutan dan konsistensi terus menerus tanpa putus', pos: 'Noun / Suru-Verb', lvl: 'N3 / Daily', ex: '継続は力なりという言葉通り、毎日少しずつ学びましょう。', exm: 'Sesuai pepatah bahwa konsistensi adalah kekuatan, mari belajar sedikit demi sedikit setiap hari.', g: 'Vokal panjang halus pada "kei" berlanjut ke "zoku".' },

      // Work & Cooperation
      { cat: 'work', text: '相談', pho: 'そうだん (soudan)', fur: '<ruby>相談<rt>そうだん</rt></ruby>', mean: 'Konsultasi, berdiskusi untuk meminta saran atau pertimbangan', pos: 'Noun / Suru-Verb', lvl: 'N4 / Business', ex: '分からないことがあれば、いつでも気軽に相談してください。', exm: 'Jika ada hal yang belum dipahami, jangan ragu untuk berkonsultasi kapan saja.', g: 'Vokal panjang pada "sou" tahan 2 ketukan mora.' },
      { cat: 'work', text: '連絡', pho: 'れんらく (renraku)', fur: '<ruby>連絡<rt>れんらく</rt></ruby>', mean: 'Menghubungi, memberi kabar, atau berkabar kabar terbaru', pos: 'Noun / Suru-Verb', lvl: 'N4 / Business', ex: 'スケジュールに変更が生じた際は、速やかに連絡します。', exm: 'Jika terjadi perubahan jadwal, saya akan segera memberi kabar.', g: 'Lafalkan ren-ra-ku secara berirama dan lancar.' },
      { cat: 'work', text: '報告', pho: 'ほうこく (houkoku)', fur: '<ruby>報告<rt>ほうこく</rt></ruby>', mean: 'Laporan resmi mengenai hasil kemajuan, status, atau temuan', pos: 'Noun / Suru-Verb', lvl: 'N4 / Business', ex: '本日の打ち合わせの結果について、上司に報告を行いました。', exm: 'Saya telah menyampaikan laporan kepada atasan mengenai hasil pertemuan hari ini.', g: 'Vokal panjang pada "hou" tahan 2 ketukan mora.' },
      { cat: 'work', text: '効率', pho: 'こうりつ (kouritsu)', fur: '<ruby>効率<rt>こうりつ</rt></ruby>', mean: 'Efisiensi dan ketepatan alur kerja dalam mencapai hasil optimal', pos: 'Noun', lvl: 'N3 / Business', ex: '新しい工夫を取り入れて、毎日の作業効率を大きく高めました。', exm: 'Dengan menerapkan inovasi baru, kami meningkatkan efisiensi kerja harian secara signifikan.', g: 'Sokuon pada "tsu": tahan sejenak sebelum suku kata berikutnya.' },
      { cat: 'work', text: '挑戦', pho: 'ちょうせん (chousen)', fur: '<ruby>挑戦<rt>ちょうせん</rt></ruby>', mean: 'Menghadapi tantangan baru dengan tekad dan semangat maju', pos: 'Noun / Suru-Verb', lvl: 'N3 / Business', ex: '未知の分野であっても、情熱を持って挑戦し続けたいです。', exm: 'Meskipun di bidang yang belum dikenal, saya ingin terus berusaha menghadapinya dengan antusias.', g: 'Vokal panjang pada "chou" (2 mora).' },
      { cat: 'work', text: '丁寧', pho: 'ていねい (teinei)', fur: '<ruby>丁寧<rt>ていねい</rt></ruby>', mean: 'Sopan santun, cermat, teliti, dan berhati-hati dalam bertindak', pos: 'Na-Adj / Noun', lvl: 'N4 / Business', ex: 'お客様からの問い合わせには、いつも丁寧な対応を心がけています。', exm: 'Saya selalu berupaya merespons pertanyaan dari pelanggan dengan sopan dan ramah.', g: 'Vokal panjang halus pada "tei" dan "nei".' },
      { cat: 'work', text: '共有', pho: 'きょうゆう (kyouyuu)', fur: '<ruby>共有<rt>きょうゆう</rt></ruby>', mean: 'Berbagi informasi, wawasan, atau pemahaman bersama', pos: 'Noun / Suru-Verb', lvl: 'N3 / Business', ex: 'ミーティングの決定事項をチーム全体に共有しました。', exm: 'Saya telah membagikan poin-poin keputusan rapat kepada seluruh anggota.', g: 'Vokal panjang pada "kyou" dan "yuu".' },
      { cat: 'work', text: '優先', pho: 'ゆうせん (yuusen)', fur: '<ruby>優先<rt>ゆうせん</rt></ruby>', mean: 'Mendahulukan hal-hal penting atau prioritas utama', pos: 'Noun / Suru-Verb', lvl: 'N3 / Business', ex: '緊急度の高い案件から優先して取り組む方針です。', exm: 'Kebijakan kami adalah memprioritaskan penyelesaian dari hal yang paling mendesak.', g: 'Vokal panjang pada "yuu".' },
      { cat: 'work', text: '納得', pho: 'なっとく (nattoku)', fur: '<ruby>納得<rt>なっとく</rt></ruby>', mean: 'Puas, mengerti, dan dapat menerima penjelasan dengan lapang dada', pos: 'Noun / Suru-Verb', lvl: 'N3 / Business', ex: '理由を丁寧に説明してもらい、全員が深く納得しました。', exm: 'Setelah alasannya dijelaskan secara cermat, semua orang memahaminya dengan puas.', g: 'Sokuon (っ) pada "nat": tahan sejenak sebelum toku.' },
      { cat: 'work', text: '工夫', pho: 'くふう (kufuu)', fur: '<ruby>工夫<rt>くふう</rt></ruby>', mean: 'Mencari akal cerdik atau cara kreatif untuk menyempurnakan hal', pos: 'Noun / Suru-Verb', lvl: 'N3 / Business', ex: '限られた予算の中で、様々な工夫を凝らして成功させました。', exm: 'Dalam anggaran terbatas, kami menggunakan berbagai cara kreatif hingga sukses.', g: 'Vokal panjang pada "fuu" (2 mora).' },

      // Expressions & Etiquette
      { cat: 'expression', text: 'お疲れ様です', pho: 'おつかれさまです (otsukaresama desu)', fur: 'お<ruby>疲<rt>つか</rt></ruby>れ<ruby>様<rt>さま</rt></ruby>です', mean: 'Ungkapan salam apresiasi terima kasih atas kerja keras', pos: 'Phrase', lvl: 'Daily / Business', ex: '今日も一日お疲れ様でした！明日も頑張りましょう。', exm: 'Terima kasih atas kerja keras hari ini! Mari bersemangat lagi besok.', g: 'Pelemahan vokal "u" pada "su" di akhir kalimat (des).' },
      { cat: 'expression', text: 'よろしくお願いします', pho: 'よろしくおねがいします (yoroshiku onegaishimasu)', fur: 'よろしくお<ruby>願<rt>ねが</rt></ruby>いします', mean: 'Ungkapan mohon kerja sama, bimbingan, dan perkenalan yang baik', pos: 'Phrase', lvl: 'Daily / Business', ex: '新しいプロジェクトでも、どうぞよろしくお願いします。', exm: 'Dalam proyek baru ini pun, mohon kerja sama dan dukungannya.', g: 'Salam paling mendasar dalam kebudayaan sosial Jepang.' },
      { cat: 'expression', text: '遠慮', pho: 'えんりょ (enryo)', fur: '<ruby>遠慮<rt>えんりょ</rt></ruby>', mean: 'Rasa sungkan, segan, atau menahan diri karena kesopanan', pos: 'Noun / Suru-Verb', lvl: 'N3 / Daily', ex: '分からない点があれば、遠慮なくいつでも質問してください。', exm: 'Jika ada hal yang belum dimengerti, jangan sungkan untuk bertanya kapan saja.', g: 'Sering dipakai dalam bentuk "enryo naku" (jangan sungkan).' },
      { cat: 'expression', text: '大丈夫', pho: 'だいじょうぶ (daijoubu)', fur: '<ruby>大丈夫<rt>だいじょうぶ</rt></ruby>', mean: 'Baik-baik saja, tidak apa-apa, aman terkendali', pos: 'Na-Adj / Phrase', lvl: 'N5 / Daily', ex: '少し失敗しても、私たちがサポートするから大丈夫ですよ。', exm: 'Meskipun sedikit gagal, kami akan membantu jadi semuanya akan baik-baik saja.', g: 'Vokal panjang pada "jou".' },
      { cat: 'expression', text: '共感', pho: 'きょうかん (kyoukan)', fur: '<ruby>共感<rt>きょうかん</rt></ruby>', mean: 'Rasa empati, simpati, atau sepemikiran dengan orang lain', pos: 'Noun / Suru-Verb', lvl: 'N3 / Daily', ex: '仲間と共感し合うことで、モチベーションが自然と高まります。', exm: 'Saling berempati dengan rekan membuat motivasi bertumbuh secara alami.', g: 'Vokal panjang pada "kyou".' }
    ];

    const insertTx = db.transaction(() => {
      for (const item of enBank) {
        insertVocab.run(
          'en',
          item.cat,
          item.text,
          item.pho,
          item.fur,
          item.mean,
          item.pos,
          item.lvl,
          item.ex,
          item.exm,
          item.g
        );
      }
      for (const item of jaBank) {
        insertVocab.run(
          'ja',
          item.cat,
          item.text,
          item.pho,
          item.fur,
          item.mean,
          item.pos,
          item.lvl,
          item.ex,
          item.exm,
          item.g
        );
      }
    });

    insertTx();
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
      'Write 1 sentence about what feature or goal you are currently working on using the word "Milestone" or "Breakthrough".',
      'Example: "Reaching our user onboarding target is a major milestone for this quarter."'
    );

    insertPrompt.run(
      'ja',
      6,
      '今日のタスクや目標について、短い日本語で1文書いてみましょう。（「準備」または「進捗」を使って）',
      'Contoh: 今日のタスクの準備は万全です。確認をお願いします。'
    );
  }
}

initDatabase();

export default db;
