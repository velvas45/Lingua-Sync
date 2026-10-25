import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import db from '../src/lib/db';

async function seedSampleCards() {
  console.log('🎴 Seeding sample cards (5 EN + 5 JA)...');
  
  const sampleCards = [
    // English sample cards
    {
      user_id: null,
      language_code: 'en',
      primary_text: 'Hello',
      phonetic: '/həˈloʊ/',
      furigana_html: null,
      meaning_id: 'Halo',
      part_of_speech: 'Interjection',
      level: 'Beginner',
      example_source: 'Hello, how are you?',
      example_meaning: 'Halo, apa kabar?',
      audio_guide: '/h/ + /ə/ + /ˈl/ + /oʊ/'
    },
    {
      user_id: null,
      language_code: 'en',
      primary_text: 'Thank you',
      phonetic: '/θæŋk juː/',
      furigana_html: null,
      meaning_id: 'Terima kasih',
      part_of_speech: 'Phrase',
      level: 'Beginner',
      example_source: 'Thank you for your help.',
      example_meaning: 'Terima kasih atas bantuanmu.',
      audio_guide: '/θ/ + /æ/ + /ŋk/ /j/ + /uː/'
    },
    {
      user_id: null,
      language_code: 'en',
      primary_text: 'Good morning',
      phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
      furigana_html: null,
      meaning_id: 'Selamat pagi',
      part_of_speech: 'Phrase',
      level: 'Beginner',
      example_source: 'Good morning! Did you sleep well?',
      example_meaning: 'Selamat pagi! Apakah kamu tidur nyenyak?',
      audio_guide: '/ɡ/ + /ʊ/ + /d/ /m/ + /ɔːr/ + /n/ + /ɪ/ + /ŋ/'
    },
    {
      user_id: null,
      language_code: 'en',
      primary_text: 'Beautiful',
      phonetic: '/ˈbjuːtɪfl/',
      furigana_html: null,
      meaning_id: 'Cantik, indah',
      part_of_speech: 'Adjective',
      level: 'Intermediate',
      example_source: 'The sunset is beautiful.',
      example_meaning: 'Matahari terbenam itu indah.',
      audio_guide: '/b/ + /juː/ + /t/ + /ɪ/ + /f/ + /l/'
    },
    {
      user_id: null,
      language_code: 'en',
      primary_text: 'Important',
      phonetic: '/ɪmˈpɔːrtnt/',
      furigana_html: null,
      meaning_id: 'Penting',
      part_of_speech: 'Adjective',
      level: 'Intermediate',
      example_source: 'This is an important meeting.',
      example_meaning: 'Ini adalah pertemuan penting.',
      audio_guide: '/ɪ/ + /m/ + /p/ + /ɔːr/ + /t/ + /n̩/ + /t/'
    },
    
    // Japanese sample cards
    {
      user_id: null,
      language_code: 'ja',
      primary_text: 'こんにちは',
      phonetic: 'konnichiwa',
      furigana_html: null,
      meaning_id: 'Halo (siang hari)',
      part_of_speech: 'Greeting',
      level: 'Beginner',
      example_source: 'こんにちは、元気ですか？',
      example_meaning: 'Halo, apa kabar?',
      audio_guide: 'ko-n-ni-chi-wa'
    },
    {
      user_id: null,
      language_code: 'ja',
      primary_text: 'ありがとう',
      phonetic: 'arigatou',
      furigana_html: null,
      meaning_id: 'Terima kasih',
      part_of_speech: 'Expression',
      level: 'Beginner',
      example_source: 'ありがとうございます。',
      example_meaning: 'Terima kasih banyak.',
      audio_guide: 'a-ri-ga-to-u'
    },
    {
      user_id: null,
      language_code: 'ja',
      primary_text: '食べる',
      phonetic: 'taberu',
      furigana_html: '<ruby>食<rt>た</rt></ruby>べる',
      meaning_id: 'Makan',
      part_of_speech: 'Verb',
      level: 'Beginner',
      example_source: 'りんごを食べる。',
      example_meaning: 'Memakan apel.',
      audio_guide: 'ta-be-ru'
    },
    {
      user_id: null,
      language_code: 'ja',
      primary_text: '美しい',
      phonetic: 'utsukushii',
      furigana_html: '<ruby>美<rt>うつく</rt></ruby>しい',
      meaning_id: 'Cantik, indah',
      part_of_speech: 'Adjective',
      level: 'Intermediate',
      example_source: '桜の花は美しいです。',
      example_meaning: 'Bunga sakura itu indah.',
      audio_guide: 'u-tsu-ku-shi-i'
    },
    {
      user_id: null,
      language_code: 'ja',
      primary_text: '勉強する',
      phonetic: 'benkyou suru',
      furigana_html: '<ruby>勉強<rt>べんきょう</rt></ruby>する',
      meaning_id: 'Belajar',
      part_of_speech: 'Verb',
      level: 'Beginner',
      example_source: '毎日日本語を勉強します。',
      example_meaning: 'Setiap hari belajar bahasa Jepang.',
      audio_guide: 'be-n-kyo-u su-ru'
    }
  ];
  
  for (const card of sampleCards) {
    try {
      await db.execute({
        sql: `INSERT INTO cards (user_id, language_code, primary_text, phonetic, furigana_html, meaning_id, 
              part_of_speech, level, example_source, example_meaning, audio_guide) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          card.user_id,
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
        ]
      });
      console.log(`✅ ${card.language_code.toUpperCase()}: ${card.primary_text}`);
    } catch (error: any) {
      console.error(`❌ Failed to seed card ${card.primary_text}:`, error.message);
    }
  }
  
  // Verify
  const result = await db.execute({ 
    sql: 'SELECT COUNT(*) as count, language_code FROM cards GROUP BY language_code', 
    args: [] 
  });
  console.log('\n📊 Sample cards seeded:');
  console.table(result.rows);
}

seedSampleCards().catch(console.error);
