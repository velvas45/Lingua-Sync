export interface CharacterItem {
  char: string;
  romaji: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
  strokes: number;
  category?: string;
}

export interface KanjiItem {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: number;
  origin: string; // asal muasal piktograf
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
}

// 46 Huruf Hiragana Standar (Gojūon)
export const HIRAGANA_LIST: CharacterItem[] = [
  // Vokal A I U E O
  { char: 'あ', romaji: 'a', exampleWord: 'あさ', exampleReading: 'asa', exampleMeaning: 'Pagi', strokes: 3, category: 'vowel' },
  { char: 'い', romaji: 'i', exampleWord: 'いえ', exampleReading: 'ie', exampleMeaning: 'Rumah', strokes: 2, category: 'vowel' },
  { char: 'う', romaji: 'u', exampleWord: 'うみ', exampleReading: 'umi', exampleMeaning: 'Laut', strokes: 2, category: 'vowel' },
  { char: 'え', romaji: 'e', exampleWord: 'えき', exampleReading: 'eki', exampleMeaning: 'Stasiun', strokes: 2, category: 'vowel' },
  { char: 'お', romaji: 'o', exampleWord: 'お茶', exampleReading: 'ocha', exampleMeaning: 'Teh', strokes: 3, category: 'vowel' },

  // Baris K (Ka, Ki, Ku, Ke, Ko)
  { char: 'か', romaji: 'ka', exampleWord: 'かさ', exampleReading: 'kasa', exampleMeaning: 'Payung', strokes: 3, category: 'k' },
  { char: 'き', romaji: 'ki', exampleWord: 'き', exampleReading: 'ki', exampleMeaning: 'Pohon', strokes: 4, category: 'k' },
  { char: 'く', romaji: 'ku', exampleWord: 'くるま', exampleReading: 'kuruma', exampleMeaning: 'Mobil', strokes: 1, category: 'k' },
  { char: 'け', romaji: 'ke', exampleWord: 'けさ', exampleReading: 'kesa', exampleMeaning: 'Pagi ini', strokes: 3, category: 'k' },
  { char: 'こ', romaji: 'ko', exampleWord: 'こども', exampleReading: 'kodomo', exampleMeaning: 'Anak', strokes: 2, category: 'k' },

  // Baris S (Sa, Shi, Su, Se, So)
  { char: 'さ', romaji: 'sa', exampleWord: 'さかな', exampleReading: 'sakana', exampleMeaning: 'Ikan', strokes: 3, category: 's' },
  { char: 'し', romaji: 'shi', exampleWord: 'しお', exampleReading: 'shio', exampleMeaning: 'Garam', strokes: 1, category: 's' },
  { char: 'す', romaji: 'su', exampleWord: 'すし', exampleReading: 'sushi', exampleMeaning: 'Sushi', strokes: 2, category: 's' },
  { char: 'せ', romaji: 'se', exampleWord: 'せんせい', exampleReading: 'sensei', exampleMeaning: 'Guru', strokes: 3, category: 's' },
  { char: 'そ', romaji: 'so', exampleWord: 'そら', exampleReading: 'sora', exampleMeaning: 'Langit', strokes: 1, category: 's' },

  // Baris T (Ta, Chi, Tsu, Te, To)
  { char: 'た', romaji: 'ta', exampleWord: 'たまご', exampleReading: 'tamago', exampleMeaning: 'Telur', strokes: 4, category: 't' },
  { char: 'ち', romaji: 'chi', exampleWord: 'ちず', exampleReading: 'chizu', exampleMeaning: 'Peta', strokes: 2, category: 't' },
  { char: 'つ', romaji: 'tsu', exampleWord: 'つくえ', exampleReading: 'tsukue', exampleMeaning: 'Meja', strokes: 1, category: 't' },
  { char: 'て', romaji: 'te', exampleWord: 'て', exampleReading: 'te', exampleMeaning: 'Tangan', strokes: 1, category: 't' },
  { char: 'と', romaji: 'to', exampleWord: 'ともだち', exampleReading: 'tomodachi', exampleMeaning: 'Teman', strokes: 2, category: 't' },

  // Baris N (Na, Ni, Nu, Ne, No)
  { char: 'な', romaji: 'na', exampleWord: 'なつ', exampleReading: 'natsu', exampleMeaning: 'Musim panas', strokes: 4, category: 'n' },
  { char: 'に', romaji: 'ni', exampleWord: 'にく', exampleReading: 'niku', exampleMeaning: 'Daging', strokes: 3, category: 'n' },
  { char: 'ぬ', romaji: 'nu', exampleWord: 'いぬ', exampleReading: 'inu', exampleMeaning: 'Anjing', strokes: 2, category: 'n' },
  { char: 'ね', romaji: 'ne', exampleWord: 'ねこ', exampleReading: 'neko', exampleMeaning: 'Kucing', strokes: 2, category: 'n' },
  { char: 'の', romaji: 'no', exampleWord: 'のみもの', exampleReading: 'nomimono', exampleMeaning: 'Minuman', strokes: 1, category: 'n' },

  // Baris H (Ha, Hi, Fu, He, Ho)
  { char: 'は', romaji: 'ha', exampleWord: 'はな', exampleReading: 'hana', exampleMeaning: 'Bunga', strokes: 3, category: 'h' },
  { char: 'ひ', romaji: 'hi', exampleWord: 'ひと', exampleReading: 'hito', exampleMeaning: 'Orang', strokes: 1, category: 'h' },
  { char: 'ふ', romaji: 'fu', exampleWord: 'ふね', exampleReading: 'fune', exampleMeaning: 'Kapal', strokes: 4, category: 'h' },
  { char: 'へ', romaji: 'he', exampleWord: 'へや', exampleReading: 'heya', exampleMeaning: 'Kamar', strokes: 1, category: 'h' },
  { char: 'ほ', romaji: 'ho', exampleWord: 'ほん', exampleReading: 'hon', exampleMeaning: 'Buku', strokes: 4, category: 'h' },

  // Baris M (Ma, Mi, Mu, Me, Mo)
  { char: 'ま', romaji: 'ma', exampleWord: 'まち', exampleReading: 'machi', exampleMeaning: 'Kota', strokes: 3, category: 'm' },
  { char: 'み', romaji: 'mi', exampleWord: 'みず', exampleReading: 'mizu', exampleMeaning: 'Air', strokes: 2, category: 'm' },
  { char: 'む', romaji: 'mu', exampleWord: 'むし', exampleReading: 'mushi', exampleMeaning: 'Serangga', strokes: 3, category: 'm' },
  { char: 'め', romaji: 'me', exampleWord: 'め', exampleReading: 'me', exampleMeaning: 'Mata', strokes: 2, category: 'm' },
  { char: 'も', romaji: 'mo', exampleWord: 'もり', exampleReading: 'mori', exampleMeaning: 'Hutan', strokes: 3, category: 'm' },

  // Baris Y (Ya, Yu, Yo)
  { char: 'や', romaji: 'ya', exampleWord: 'やま', exampleReading: 'yama', exampleMeaning: 'Gunung', strokes: 3, category: 'y' },
  { char: 'ゆ', romaji: 'yu', exampleWord: 'ゆき', exampleReading: 'yuki', exampleMeaning: 'Salju', strokes: 2, category: 'y' },
  { char: 'よ', romaji: 'yo', exampleWord: 'よる', exampleReading: 'yoru', exampleMeaning: 'Malam', strokes: 2, category: 'y' },

  // Baris R (Ra, Ri, Ru, Re, Ro)
  { char: 'ら', romaji: 'ra', exampleWord: 'らいしゅう', exampleReading: 'raishuu', exampleMeaning: 'Pekan depan', strokes: 2, category: 'r' },
  { char: 'り', romaji: 'ri', exampleWord: 'りんご', exampleReading: 'ringo', exampleMeaning: 'Apel', strokes: 2, category: 'r' },
  { char: 'る', romaji: 'ru', exampleWord: 'よる', exampleReading: 'yoru', exampleMeaning: 'Malam', strokes: 1, category: 'r' },
  { char: 'れ', romaji: 're', exampleWord: 'れきし', exampleReading: 'rekishi', exampleMeaning: 'Sejarah', strokes: 2, category: 'r' },
  { char: 'ろ', romaji: 'ro', exampleWord: 'ろうそく', exampleReading: 'rousoku', exampleMeaning: 'Lilin', strokes: 1, category: 'r' },

  // Baris W & N (Wa, Wo, N)
  { char: 'わ', romaji: 'wa', exampleWord: 'わたし', exampleReading: 'watashi', exampleMeaning: 'Saya', strokes: 2, category: 'w' },
  { char: 'を', romaji: 'wo (o)', exampleWord: '〜を', exampleReading: 'o', exampleMeaning: 'Partikel penanda objek', strokes: 3, category: 'w' },
  { char: 'ん', romaji: 'n', exampleWord: 'にほん', exampleReading: 'nihon', exampleMeaning: 'Jepang', strokes: 1, category: 'n_alone' },
];

// 46 Huruf Katakana Standar (Gojūon)
export const KATAKANA_LIST: CharacterItem[] = [
  // Vokal A I U E O
  { char: 'ア', romaji: 'a', exampleWord: 'アメリカ', exampleReading: 'Amerika', exampleMeaning: 'Amerika Serikat', strokes: 2, category: 'vowel' },
  { char: 'イ', romaji: 'i', exampleWord: 'インドネシア', exampleReading: 'Indoneshia', exampleMeaning: 'Indonesia', strokes: 2, category: 'vowel' },
  { char: 'ウ', romaji: 'u', exampleWord: 'ウェブ', exampleReading: 'webu', exampleMeaning: 'Web / Situs', strokes: 3, category: 'vowel' },
  { char: 'エ', romaji: 'e', exampleWord: 'エレベーター', exampleReading: 'erebeetaa', exampleMeaning: 'Elevator / Lift', strokes: 3, category: 'vowel' },
  { char: 'オ', romaji: 'o', exampleWord: 'オフィス', exampleReading: 'ofisu', exampleMeaning: 'Kantor', strokes: 3, category: 'vowel' },

  // Baris K
  { char: 'カ', romaji: 'ka', exampleWord: 'カフェ', exampleReading: 'kafe', exampleMeaning: 'Kafe', strokes: 2, category: 'k' },
  { char: 'キ', romaji: 'ki', exampleWord: 'キッチン', exampleReading: 'kicchin', exampleMeaning: 'Dapur', strokes: 3, category: 'k' },
  { char: 'ク', romaji: 'ku', exampleWord: 'クラス', exampleReading: 'kurasu', exampleMeaning: 'Kelas', strokes: 2, category: 'k' },
  { char: 'ケ', romaji: 'ke', exampleWord: 'ケーキ', exampleReading: 'keeki', exampleMeaning: 'Kue', strokes: 3, category: 'k' },
  { char: 'コ', romaji: 'ko', exampleWord: 'コーヒー', exampleReading: 'koohii', exampleMeaning: 'Kopi', strokes: 2, category: 'k' },

  // Baris S
  { char: 'サ', romaji: 'sa', exampleWord: 'サラダ', exampleReading: 'sarada', exampleMeaning: 'Salad', strokes: 3, category: 's' },
  { char: 'シ', romaji: 'shi', exampleWord: 'シャツ', exampleReading: 'shatsu', exampleMeaning: 'Kemeja', strokes: 3, category: 's' },
  { char: 'ス', romaji: 'su', exampleWord: 'スポーツ', exampleReading: 'supootsu', exampleMeaning: 'Olahraga', strokes: 2, category: 's' },
  { char: 'セ', romaji: 'se', exampleWord: 'セーター', exampleReading: 'seetaa', exampleMeaning: 'Sweater', strokes: 2, category: 's' },
  { char: 'ソ', romaji: 'so', exampleWord: 'ソファ', exampleReading: 'sofa', exampleMeaning: 'Sofa', strokes: 2, category: 's' },

  // Baris T
  { char: 'タ', romaji: 'ta', exampleWord: 'タクシー', exampleReading: 'takushii', exampleMeaning: 'Taksi', strokes: 3, category: 't' },
  { char: 'チ', romaji: 'chi', exampleWord: 'チーズ', exampleReading: 'chiizu', exampleMeaning: 'Keju', strokes: 3, category: 't' },
  { char: 'ツ', romaji: 'tsu', exampleWord: 'ツアー', exampleReading: 'tsuaa', exampleMeaning: 'Tur perjalanan', strokes: 3, category: 't' },
  { char: 'テ', romaji: 'te', exampleWord: 'テーブル', exampleReading: 'teeburu', exampleMeaning: 'Meja makan', strokes: 3, category: 't' },
  { char: 'ト', romaji: 'to', exampleWord: 'トイレ', exampleReading: 'toire', exampleMeaning: 'Toilet', strokes: 2, category: 't' },

  // Baris N
  { char: 'ナ', romaji: 'na', exampleWord: 'ナイフ', exampleReading: 'naifu', exampleMeaning: 'Pisau', strokes: 2, category: 'n' },
  { char: 'ニ', romaji: 'ni', exampleWord: 'ニュース', exampleReading: 'nyuusu', exampleMeaning: 'Berita', strokes: 2, category: 'n' },
  { char: 'ヌ', romaji: 'nu', exampleWord: 'カヌー', exampleReading: 'kanuu', exampleMeaning: 'Kano', strokes: 2, category: 'n' },
  { char: 'ネ', romaji: 'ne', exampleWord: 'ネクタイ', exampleReading: 'nekutai', exampleMeaning: 'Dasi', strokes: 4, category: 'n' },
  { char: 'ノ', romaji: 'no', exampleWord: 'ノート', exampleReading: 'nooto', exampleMeaning: 'Buku catatan', strokes: 1, category: 'n' },

  // Baris H
  { char: 'ハ', romaji: 'ha', exampleWord: 'ハンバーガー', exampleReading: 'hanbaagaa', exampleMeaning: 'Hamburger', strokes: 2, category: 'h' },
  { char: 'ヒ', romaji: 'hi', exampleWord: 'ヒーター', exampleReading: 'hiitaa', exampleMeaning: 'Pemanas ruangan', strokes: 2, category: 'h' },
  { char: 'フ', romaji: 'fu', exampleWord: 'フォーク', exampleReading: 'fooku', exampleMeaning: 'Garpu', strokes: 1, category: 'h' },
  { char: 'ヘ', romaji: 'he', exampleWord: 'ヘルメット', exampleReading: 'herumetto', exampleMeaning: 'Helm', strokes: 1, category: 'h' },
  { char: 'ホ', romaji: 'ho', exampleWord: 'ホテル', exampleReading: 'hoteru', exampleMeaning: 'Hotel', strokes: 4, category: 'h' },

  // Baris M
  { char: 'マ', romaji: 'ma', exampleWord: 'マスク', exampleReading: 'masuku', exampleMeaning: 'Masker', strokes: 2, category: 'm' },
  { char: 'ミ', romaji: 'mi', exampleWord: 'ミルク', exampleReading: 'miruku', exampleMeaning: 'Susu', strokes: 3, category: 'm' },
  { char: 'ム', romaji: 'mu', exampleWord: 'ムービー', exampleReading: 'muubii', exampleMeaning: 'Film', strokes: 2, category: 'm' },
  { char: 'メ', romaji: 'me', exampleWord: 'メール', exampleReading: 'meeru', exampleMeaning: 'Email / Surat elektronik', strokes: 2, category: 'm' },
  { char: 'モ', romaji: 'mo', exampleWord: 'モデル', exampleReading: 'moderu', exampleMeaning: 'Model', strokes: 3, category: 'm' },

  // Baris Y
  { char: 'ヤ', romaji: 'ya', exampleWord: 'ヤシ', exampleReading: 'yashi', exampleMeaning: 'Kelapa', strokes: 2, category: 'y' },
  { char: 'ユ', romaji: 'yu', exampleWord: 'ユーザー', exampleReading: 'yuuzaa', exampleMeaning: 'Pengguna', strokes: 2, category: 'y' },
  { char: 'ヨ', romaji: 'yo', exampleWord: 'ヨーグルト', exampleReading: 'yooguruto', exampleMeaning: 'Yogurt', strokes: 3, category: 'y' },

  // Baris R
  { char: 'ラ', romaji: 'ra', exampleWord: 'ラジオ', exampleReading: 'rajio', exampleMeaning: 'Radio', strokes: 2, category: 'r' },
  { char: 'リ', romaji: 'ri', exampleWord: 'リーダー', exampleReading: 'riidaa', exampleMeaning: 'Pemimpin', strokes: 2, category: 'r' },
  { char: 'ル', romaji: 'ru', exampleWord: 'ルール', exampleReading: 'ruuru', exampleMeaning: 'Aturan', strokes: 2, category: 'r' },
  { char: 'レ', romaji: 're', exampleWord: 'レストラン', exampleReading: 'resutoran', exampleMeaning: 'Restoran', strokes: 1, category: 'r' },
  { char: 'ロ', romaji: 'ro', exampleWord: 'ロボット', exampleReading: 'robotto', exampleMeaning: 'Robot', strokes: 3, category: 'r' },

  // Baris W & N
  { char: 'ワ', romaji: 'wa', exampleWord: 'ワイン', exampleReading: 'wain', exampleMeaning: 'Anggur (Wine)', strokes: 2, category: 'w' },
  { char: 'ヲ', romaji: 'wo', exampleWord: 'ヲタク (slang)', exampleReading: 'otaku', exampleMeaning: 'Penggemar antusias', strokes: 3, category: 'w' },
  { char: 'ン', romaji: 'n', exampleWord: 'パン', exampleReading: 'pan', exampleMeaning: 'Roti', strokes: 2, category: 'n_alone' },
];

// 20 Kanji Dasar Fondasi JLPT N5 (Piktograf Alam & Kehidupan)
export const KANJI_BASIC_LIST: KanjiItem[] = [
  {
    kanji: '日',
    meaning: 'Matahari / Hari',
    onyomi: 'NICHI, JITSU',
    kunyomi: 'hi, bi, ka',
    strokes: 4,
    origin: 'Bentuk lingkaran matahari dengan titik di tengahnya.',
    exampleWord: '日本',
    exampleReading: 'Nihon',
    exampleMeaning: 'Negara Jepang (Asal Matahari)',
  },
  {
    kanji: '月',
    meaning: 'Bulan (Moon / Month)',
    onyomi: 'GETSU, GATSU',
    kunyomi: 'tsuki',
    strokes: 4,
    origin: 'Bentuk bulan sabit di langit malam.',
    exampleWord: '月曜日',
    exampleReading: 'Getsuyoubi',
    exampleMeaning: 'Hari Senin',
  },
  {
    kanji: '木',
    meaning: 'Pohon / Kayu',
    onyomi: 'MOKU, BOKU',
    kunyomi: 'ki',
    strokes: 4,
    origin: 'Pohon dengan batang dan dahan rantingnya.',
    exampleWord: '木曜日',
    exampleReading: 'Mokuyoubi',
    exampleMeaning: 'Hari Kamis',
  },
  {
    kanji: '山',
    meaning: 'Gunung',
    onyomi: 'SAN',
    kunyomi: 'yama',
    strokes: 3,
    origin: 'Tiga puncak gunung yang menjulang tinggi.',
    exampleWord: '富士山',
    exampleReading: 'Fujisan',
    exampleMeaning: 'Gunung Fuji',
  },
  {
    kanji: '川',
    meaning: 'Sungai',
    onyomi: 'SEN',
    kunyomi: 'kawa, gawa',
    strokes: 3,
    origin: 'Tiga aliran garis air sungai yang mengalir.',
    exampleWord: 'ナイル川',
    exampleReading: 'Nairugawa',
    exampleMeaning: 'Sungai Nil',
  },
  {
    kanji: '田',
    meaning: 'Sawah / Ladang Padi',
    onyomi: 'DEN',
    kunyomi: 'ta, da',
    strokes: 5,
    origin: 'Petak sawah bersekat empat.',
    exampleWord: '水田',
    exampleReading: 'suiden',
    exampleMeaning: 'Sawah terairi',
  },
  {
    kanji: '人',
    meaning: 'Orang / Manusia',
    onyomi: 'JIN, NIN',
    kunyomi: 'hito',
    strokes: 2,
    origin: 'Manusia berdiri dengan dua kaki menopang.',
    exampleWord: '日本人',
    exampleReading: 'Nihonjin',
    exampleMeaning: 'Orang Jepang',
  },
  {
    kanji: '口',
    meaning: 'Mulut / Pintu Masuk',
    onyomi: 'KOU, KU',
    kunyomi: 'kuchi, guchi',
    strokes: 3,
    origin: 'Bentuk mulut yang terbuka lebar.',
    exampleWord: '出口',
    exampleReading: 'deguchi',
    exampleMeaning: 'Pintu keluar',
  },
  {
    kanji: '車',
    meaning: 'Mobil / Roda Kendaraan',
    onyomi: 'SHA',
    kunyomi: 'kuruma',
    strokes: 7,
    origin: 'Kereta kuda roda dua dilihat dari atas.',
    exampleWord: '電車',
    exampleReading: 'densha',
    exampleMeaning: 'Kereta listrik',
  },
  {
    kanji: '門',
    meaning: 'Gerbang / Pintu Gerbang',
    onyomi: 'MON',
    kunyomi: 'kado',
    strokes: 8,
    origin: 'Sepasang daun pintu gerbang kayu tradisional.',
    exampleWord: '正門',
    exampleReading: 'seimon',
    exampleMeaning: 'Gerbang utama',
  },
  {
    kanji: '火',
    meaning: 'Api',
    onyomi: 'KA',
    kunyomi: 'hi',
    strokes: 4,
    origin: 'Kobaran api yang membakar ke atas.',
    exampleWord: '火曜日',
    exampleReading: 'Kayoubi',
    exampleMeaning: 'Hari Selasa',
  },
  {
    kanji: '水',
    meaning: 'Air',
    onyomi: 'SUI',
    kunyomi: 'mizu',
    strokes: 4,
    origin: 'Percikan aliran air yang bergejolak.',
    exampleWord: '水曜日',
    exampleReading: 'Suiyoubi',
    exampleMeaning: 'Hari Rabu',
  },
  {
    kanji: '金',
    meaning: 'Emas / Uang / Logam',
    onyomi: 'KIN, KON',
    kunyomi: 'kane',
    strokes: 8,
    origin: 'Bongkahan emas yang terpendam di perut bumi.',
    exampleWord: 'お金',
    exampleReading: 'okane',
    exampleMeaning: 'Uang',
  },
  {
    kanji: '土',
    meaning: 'Tanah / Bumi',
    onyomi: 'DO, TO',
    kunyomi: 'tsuchi',
    strokes: 3,
    origin: 'Gundukan tanah liat di atas permukaan bumi.',
    exampleWord: '土曜日',
    exampleReading: 'Doyoubi',
    exampleMeaning: 'Hari Sabtu',
  },
  {
    kanji: '子',
    meaning: 'Anak',
    onyomi: 'SHI, SU',
    kunyomi: 'ko',
    strokes: 3,
    origin: 'Bayi yang merentangkan kedua tangannya.',
    exampleWord: '子ども',
    exampleReading: 'kodomo',
    exampleMeaning: 'Anak-anak',
  },
  {
    kanji: '女',
    meaning: 'Wanita / Perempuan',
    onyomi: 'JO, NYO',
    kunyomi: 'on\'na',
    strokes: 3,
    origin: 'Sosok perempuan yang sedang duduk santun.',
    exampleWord: '女性',
    exampleReading: 'josei',
    exampleMeaning: 'Kaum wanita',
  },
  {
    kanji: '学',
    meaning: 'Belajar / Ilmu Pengetahuan',
    onyomi: 'GAKU',
    kunyomi: 'mana(bu)',
    strokes: 8,
    origin: 'Anak (子) di bawah atap sekolah menuntut ilmu.',
    exampleWord: '学生',
    exampleReading: 'gakusei',
    exampleMeaning: 'Pelajar / Mahasiswa',
  },
  {
    kanji: '校',
    meaning: 'Gedung Sekolah',
    onyomi: 'KOU',
    kunyomi: '-',
    strokes: 10,
    origin: 'Pohon (木) dan bangunan tempat berkumpul.',
    exampleWord: '学校',
    exampleReading: 'gakkou',
    exampleMeaning: 'Sekolah',
  },
  {
    kanji: '先',
    meaning: 'Terdahulu / Di Depan',
    onyomi: 'SEN',
    kunyomi: 'saki',
    strokes: 6,
    origin: 'Orang yang melangkah terlebih dahulu di depan.',
    exampleWord: '先生',
    exampleReading: 'sensei',
    exampleMeaning: 'Guru / Dosen',
  },
  {
    kanji: '生',
    meaning: 'Hidup / Lahir',
    onyomi: 'SEI, SHOU',
    kunyomi: 'i(kiru), u(mareru)',
    strokes: 5,
    origin: 'Tunas tanaman baru yang tumbuh bersemi hidup.',
    exampleWord: '生活',
    exampleReading: 'seikatsu',
    exampleMeaning: 'Kehidupan sehari-hari',
  },
];

// Dekonstruksi Anatomi Kalimat Jepang Utuh
export const SENTENCE_ANATOMY = {
  sentence: '私は毎朝、カフェでコーヒーを飲みます。',
  romaji: 'Watashi wa maiasa, kafe de koohii o nomimasu.',
  meaning: 'Saya meminum kopi di kafe setiap pagi.',
  components: [
    { text: '私', type: 'kanji', label: 'Kanji', desc: 'Kata ganti "Saya" (Menyimpan arti konsep)', color: 'emerald' },
    { text: 'は', type: 'hiragana', label: 'Hiragana', desc: 'Partikel topik tata bahasa (Dibaca "wa")', color: 'amber' },
    { text: '毎朝', type: 'kanji', label: 'Kanji', desc: 'Kata keterangan "Setiap Pagi"', color: 'emerald' },
    { text: '、', type: 'punctuation', label: 'Tanda Baca', desc: 'Koma Jepang (Tou-ten)', color: 'slate' },
    { text: 'カフェ', type: 'katakana', label: 'Katakana', desc: 'Kata serapan asing "Cafe"', color: 'indigo' },
    { text: 'で', type: 'hiragana', label: 'Hiragana', desc: 'Partikel lokasi aksi', color: 'amber' },
    { text: 'コーヒー', type: 'katakana', label: 'Katakana', desc: 'Kata serapan asing "Coffee" + vokal panjang ー', color: 'indigo' },
    { text: 'を', type: 'hiragana', label: 'Hiragana', desc: 'Partikel penanda objek (Dibaca "o")', color: 'amber' },
    { text: '飲', type: 'kanji', label: 'Kanji', desc: 'Akar kata kerja "Minum"', color: 'emerald' },
    { text: 'みます', type: 'hiragana', label: 'Hiragana', desc: 'Okurigana & konjugasi sopan (-masu)', color: 'amber' },
    { text: '。', type: 'punctuation', label: 'Tanda Baca', desc: 'Titik Jepang (Kuten)', color: 'slate' },
  ],
};

// 4 Aturan Emas Urutan Goresan Kaligrafi (Stroke Order)
export const STROKE_ORDER_RULES = [
  {
    rule: 'Atas ke Bawah (上から下へ)',
    desc: 'Goresan dimulai dari bagian puncak karakter menuju bagian dasar bawah (contoh: 三, 二, 一).',
  },
  {
    rule: 'Kiri ke Kanan (左から右へ)',
    desc: 'Elemen di sisi kiri digoreskan terlebih dahulu sebelum sisi kanan (contoh: 川, 州).',
  },
  {
    rule: 'Garis Horizontal Sebelum Vertikal (横から縦へ)',
    desc: 'Jika ada garis yang saling bersilangan, tarik garis mendatar dahulu lalu garis tegak (contoh: 十, 木).',
  },
  {
    rule: 'Buka Kotak, Isi Dalam, Lalu Tutup (外側から内側、そして閉じる)',
    desc: 'Buat bingkai luar terlebih dahulu, gores elemen di dalam kotak, baru tutup garis bawah (contoh: 日, 田, 回).',
  },
];
