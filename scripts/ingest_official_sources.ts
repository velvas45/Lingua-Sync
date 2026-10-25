import db from '../src/lib/db';
import { HIRAGANA_LIST, KATAKANA_LIST, KANJI_BASIC_LIST } from '../src/lib/japaneseCharacters';
import fs from 'fs';
import path from 'path';

interface KanjiApiDetail {
  kanji: string;
  grade: number;
  stroke_count: number;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jlpt: number | null;
  unicode: string;
  heisig_en?: string;
}

interface GrammarLessonSeed {
  language_code: string;
  level: string;
  title: string;
  formula: string;
  explanation: string;
  example_source: string;
  example_meaning: string;
  audio_guide?: string | null;
}

// Indonesian translations for common Grade 1 Kanji
const KANJI_ID_TRANSLATIONS: Record<string, string> = {
  一: 'Satu',
  二: 'Dua',
  三: 'Tiga',
  四: 'Empat',
  五: 'Lima',
  六: 'Enam',
  七: 'Tujuh',
  八: 'Delapan',
  九: 'Sembilan',
  十: 'Sepuluh',
  百: 'Ratus / Ratusan',
  千: 'Ribu / Ribuan',
  上: 'Atas / Naik',
  下: 'Bawah / Turun',
  左: 'Kiri',
  右: 'Kanan',
  中: 'Tengah / Di dalam',
  大: 'Besar',
  小: 'Kecil',
  月: 'Bulan / Rembulan',
  日: 'Matahari / Hari',
  年: 'Tahun',
  早: 'Pagi-pagi / Cepat',
  木: 'Pohon / Kayu',
  林: 'Hutan kecil / Rimbun',
  山: 'Gunung',
  川: 'Sungai',
  土: 'Tanah / Bumi',
  空: 'Langit / Hampa',
  田: 'Sawah / Ladang padi',
  天: 'Langit / Surga',
  生: 'Hidup / Lahir / Mentah',
  花: 'Bunga',
  草: 'Rumput',
  白: 'Putih',
  赤: 'Merah',
  青: 'Biru / Hijau alami',
  犬: 'Anjing',
  虫: 'Serangga',
  町: 'Kota / Kawasan perumahan',
  村: 'Desa',
  男: 'Pria / Laki-laki',
  女: 'Wanita / Perempuan',
  子: 'Anak',
  目: 'Mata',
  耳: 'Telinga',
  手: 'Tangan',
  足: 'Kaki',
  雨: 'Hujan',
  竹: 'Bambu',
  車: 'Mobil / Roda kendaraan',
  何: 'Apa',
  学: 'Belajar / Menuntut ilmu',
  校: 'Sekolah',
  先: 'Sebelumnya / Mendahului',
  水: 'Air',
  火: 'Api',
  金: 'Emas / Uang / Logam',
  本: 'Buku / Asal mula',
  文: 'Kalimat / Tulisan sastra',
  字: 'Karakter / Huruf aksara',
  名: 'Nama / Terkenal',
  正: 'Benar / Lurus',
  気: 'Energi / Pikiran / Perasaan',
  立: 'Berdiri',
  休: 'Istirahat / Libur',
  見: 'Melihat',
  入: 'Masuk',
  出: 'Keluar',
  口: 'Mulut',
  力: 'Kekuatan / Tenaga',
  夕: 'Sore / Senja',
  玉: 'Permata / Bola bundar',
  石: 'Batu',
  貝: 'Kerang',
  糸: 'Benang',
  森: 'Hutan lebat',
  音: 'Suara / Nada bunyi',
};

async function fetchKanjiDetails(kanjiList: string[]): Promise<KanjiApiDetail[]> {
  console.log(`🌐 Mengambil ${kanjiList.length} data Kanji resmi dari KanjiAPI.dev (EDRDG Monash University)...`);
  const results: KanjiApiDetail[] = [];
  const batchSize = 8;

  for (let i = 0; i < kanjiList.length; i += batchSize) {
    const chunk = kanjiList.slice(i, i + batchSize);
    const promises = chunk.map(async (k) => {
      try {
        const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(k)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          return (await res.json()) as KanjiApiDetail;
        }
      } catch (err) {
        console.warn(`Gagal fetch kanji ${k}:`, err);
      }
      return null;
    });

    const chunkResults = await Promise.all(promises);
    chunkResults.forEach((r) => {
      if (r) results.push(r);
    });

    process.stdout.write(`\r   ⏳ Kemajuan: ${Math.min(i + batchSize, kanjiList.length)}/${kanjiList.length} kanji terambil`);
  }

  console.log(`\n✅ Berhasil mengunduh ${results.length} data detail Kanji resmi.`);
  return results;
}

async function runOfficialIngestion() {
  console.log('========================================================================');
  console.log('🚀 LINGUASYNC OFFICIAL BASE KNOWLEDGE INGESTION ENGINE');
  console.log('   Source 1: KanjiAPI.dev (EDRDG Monash University KANJIDIC)');
  console.log('   Source 2: JLPT (Japan Foundation) & CEFR (Cambridge) Standard Curriculum');
  console.log('========================================================================\n');

  // 1. Prepare SQLite Tables
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_jap_chars_type ON japanese_characters(type);
    CREATE INDEX IF NOT EXISTS idx_jap_chars_char ON japanese_characters(character);
    CREATE INDEX IF NOT EXISTS idx_jap_chars_sub_cat ON japanese_characters(type, sub_category);
  `);

  // 2. Fetch Official Kanji List (Grade 1 & Grade 2 Joyo Kanji -> JLPT N5 & N4)
  let grade1List: string[] = [];
  let grade2List: string[] = [];

  try {
    const [resG1, resG2] = await Promise.all([
      fetch('https://kanjiapi.dev/v1/kanji/grade-1'),
      fetch('https://kanjiapi.dev/v1/kanji/grade-2'),
    ]);
    if (resG1.ok) grade1List = (await resG1.json()) as string[];
    if (resG2.ok) grade2List = (await resG2.json()) as string[];
  } catch (e) {
    console.warn('Fallback offline kanji list due to network error:', e);
    grade1List = KANJI_BASIC_LIST.map((k) => k.kanji);
  }

  const allKanjiTargets = [...new Set([...grade1List, ...grade2List])];
  const kanjiDetails = await fetchKanjiDetails(allKanjiTargets);

  // 3. Upsert Japanese Characters (Hiragana, Katakana, Kanji)
  const upsertChar = db.prepare(`
    INSERT OR REPLACE INTO japanese_characters (
      type, sub_category, character, romaji, meaning, onyomi, kunyomi, strokes, jlpt_level, grade, origin, example_word, example_reading, example_meaning
    ) VALUES (
      @type, @sub_category, @character, @romaji, @meaning, @onyomi, @kunyomi, @strokes, @jlpt_level, @grade, @origin, @example_word, @example_reading, @example_meaning
    )
  `);

  console.log('\n📦 Memulai transaksi penyimpanan karakter ke SQLite (lingua_drill.db)...');

  const ingestCharactersTx = db.transaction(() => {
    // 1. Idempotent purge to prevent duplicate/stale records
    db.exec('DELETE FROM japanese_characters;');

    let countHira = 0;
    let countKata = 0;
    let countKanji = 0;

    // A. Hiragana
    for (const h of HIRAGANA_LIST) {
      upsertChar.run({
        type: 'hiragana',
        sub_category: h.subCategory || 'gojuon',
        character: h.char,
        romaji: h.romaji,
        meaning: null,
        onyomi: null,
        kunyomi: null,
        strokes: h.strokes,
        jlpt_level: 'N5',
        grade: null,
        origin: null,
        example_word: h.exampleWord || null,
        example_reading: h.exampleReading || null,
        example_meaning: h.exampleMeaning || null,
      });
      countHira++;
    }

    // B. Katakana
    for (const k of KATAKANA_LIST) {
      upsertChar.run({
        type: 'katakana',
        sub_category: k.subCategory || 'gojuon',
        character: k.char,
        romaji: k.romaji,
        meaning: null,
        onyomi: null,
        kunyomi: null,
        strokes: k.strokes,
        jlpt_level: 'N5',
        grade: null,
        origin: null,
        example_word: k.exampleWord || null,
        example_reading: k.exampleReading || null,
        example_meaning: k.exampleMeaning || null,
      });
      countKata++;
    }

    // C. Official KANJIDIC Kanji (Grade 1 N5 + Grade 2 N4)
    const curatedKanjiMap = new Map(KANJI_BASIC_LIST.map((k) => [k.kanji, k]));

    for (const detail of kanjiDetails) {
      const curated = curatedKanjiMap.get(detail.kanji);
      const meaningId = KANJI_ID_TRANSLATIONS[detail.kanji] || detail.meanings.slice(0, 3).join(', ');
      const kunStr = detail.kun_readings.join(', ');
      const onStr = detail.on_readings.join(', ');
      const primaryRomaji = detail.kun_readings[0] || detail.on_readings[0] || '';
      const isN5 = (detail.grade === 1 || detail.jlpt === 5);
      const levelLabel = isN5 ? 'N5' : 'N4';
      const subCat = isN5 ? 'kanji_n5' : 'kanji_n4';

      upsertChar.run({
        type: 'kanji',
        sub_category: subCat,
        character: detail.kanji,
        romaji: primaryRomaji,
        meaning: meaningId,
        onyomi: onStr || null,
        kunyomi: kunStr || null,
        strokes: detail.stroke_count,
        jlpt_level: levelLabel,
        grade: detail.grade || (isN5 ? 1 : 2),
        origin: curated?.origin || `Kanji resmi KANJIDIC kelas ${detail.grade || 1} (JLPT ${levelLabel}).`,
        example_word: curated?.exampleWord || detail.kanji,
        example_reading: curated?.exampleReading || primaryRomaji,
        example_meaning: curated?.exampleMeaning || meaningId,
      });
      countKanji++;
    }

    return { countHira, countKata, countKanji };
  });

  const charStats = ingestCharactersTx();
  console.log(`   ✨ Hiragana tersimpan : ${charStats.countHira} karakter`);
  console.log(`   ✨ Katakana tersimpan : ${charStats.countKata} karakter`);
  console.log(`   ✨ Kanji tersimpan     : ${charStats.countKanji} karakter resmi KANJIDIC`);

  // 4. Ingest & Enrich Grammar Lessons
  console.log('\n📚 Mengimpor & memvalidasi kurikulum tata bahasa (JLPT N5-N1 & CEFR A1-C2)...');
  const curriculumPath = path.join(process.cwd(), 'data/seeds/grammar_curriculum.json');

  if (fs.existsSync(curriculumPath)) {
    const rawData = fs.readFileSync(curriculumPath, 'utf8');
    const grammarLessons = JSON.parse(rawData) as GrammarLessonSeed[];

    const upsertGrammar = db.prepare(`
      INSERT OR REPLACE INTO grammar_lessons (
        language_code, level, title, formula, explanation, example_source, example_meaning, audio_guide
      ) VALUES (
        @language_code, @level, @title, @formula, @explanation, @example_source, @example_meaning, @audio_guide
      )
    `);

    const ingestGrammarTx = db.transaction(() => {
      // Idempotent purge to prevent duplicate lessons
      db.exec('DELETE FROM grammar_lessons;');

      let countJa = 0;
      let countEn = 0;

      for (const lesson of grammarLessons) {
        upsertGrammar.run({
          language_code: lesson.language_code,
          level: lesson.level,
          title: lesson.title,
          formula: lesson.formula,
          explanation: lesson.explanation,
          example_source: lesson.example_source,
          example_meaning: lesson.example_meaning,
          audio_guide: lesson.audio_guide || null,
        });

        if (lesson.language_code === 'ja') countJa++;
        if (lesson.language_code === 'en') countEn++;
      }

      return { countJa, countEn };
    });

    const grammarStats = ingestGrammarTx();
    console.log(`   ✨ Tata Bahasa Jepang (JLPT N5–N1) : ${grammarStats.countJa} modul pelajaran`);
    console.log(`   ✨ Tata Bahasa Inggris (CEFR A1–C2)  : ${grammarStats.countEn} modul pelajaran`);
  }

  // 5. Verification Final Output
  const totalCharacters = db.prepare('SELECT count(*) as count FROM japanese_characters').get() as { count: number };
  const totalGrammar = db.prepare('SELECT count(*) as count FROM grammar_lessons').get() as { count: number };
  const totalVocab = db.prepare('SELECT count(*) as count FROM vocabulary_bank').get() as { count: number };

  console.log('\n========================================================================');
  console.log('🎉 INGESTION SUMMARY: STATUS DATABASE LINGUASYNC (lingua_drill.db)');
  console.log('========================================================================');
  console.log(`📊 Total Aksara Jepang (japanese_characters) : ${totalCharacters.count} entri`);
  console.log(`📊 Total Modul Tata Bahasa (grammar_lessons)   : ${totalGrammar.count} modul`);
  console.log(`📊 Total Bank Kosakata Terkurasi (vocabulary)   : ${totalVocab.count} entri`);
  console.log('========================================================================\n');
}

runOfficialIngestion()
  .then(() => {
    console.log('✅ Eksekusi selesai dengan sukses!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Gagal menjalankan ingestion:', err);
    process.exit(1);
  });
