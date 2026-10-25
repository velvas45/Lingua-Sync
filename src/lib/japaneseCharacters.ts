export type KanaSubCategory = 'gojuon' | 'dakuon' | 'handakuon' | 'yoon' | 'special';

export interface CharacterItem {
  char: string;
  romaji: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
  strokes: number;
  category?: string;
  subCategory?: KanaSubCategory;
}

export interface KanjiItem {
  kanji: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: number;
  origin: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
}

// ----------------- HIRAGANA FULL SPECTRUM (Gojuon, Dakuon, Handakuon, Yoon, Sokuon) -----------------
export const HIRAGANA_LIST: CharacterItem[] = [
  // 1. Gojūon (46 Dasar)
  { char: 'あ', romaji: 'a', exampleWord: 'あさ', exampleReading: 'asa', exampleMeaning: 'Pagi', strokes: 3, category: 'vowel', subCategory: 'gojuon' },
  { char: 'い', romaji: 'i', exampleWord: 'いえ', exampleReading: 'ie', exampleMeaning: 'Rumah', strokes: 2, category: 'vowel', subCategory: 'gojuon' },
  { char: 'う', romaji: 'u', exampleWord: 'うみ', exampleReading: 'umi', exampleMeaning: 'Laut', strokes: 2, category: 'vowel', subCategory: 'gojuon' },
  { char: 'え', romaji: 'e', exampleWord: 'えき', exampleReading: 'eki', exampleMeaning: 'Stasiun', strokes: 2, category: 'vowel', subCategory: 'gojuon' },
  { char: 'お', romaji: 'o', exampleWord: 'お茶', exampleReading: 'ocha', exampleMeaning: 'Teh', strokes: 3, category: 'vowel', subCategory: 'gojuon' },

  { char: 'か', romaji: 'ka', exampleWord: 'かさ', exampleReading: 'kasa', exampleMeaning: 'Payung', strokes: 3, category: 'k', subCategory: 'gojuon' },
  { char: 'き', romaji: 'ki', exampleWord: 'き', exampleReading: 'ki', exampleMeaning: 'Pohon', strokes: 4, category: 'k', subCategory: 'gojuon' },
  { char: 'く', romaji: 'ku', exampleWord: 'くるま', exampleReading: 'kuruma', exampleMeaning: 'Mobil', strokes: 1, category: 'k', subCategory: 'gojuon' },
  { char: 'け', romaji: 'ke', exampleWord: 'けさ', exampleReading: 'kesa', exampleMeaning: 'Pagi ini', strokes: 3, category: 'k', subCategory: 'gojuon' },
  { char: 'こ', romaji: 'ko', exampleWord: 'こども', exampleReading: 'kodomo', exampleMeaning: 'Anak', strokes: 2, category: 'k', subCategory: 'gojuon' },

  { char: 'さ', romaji: 'sa', exampleWord: 'さかな', exampleReading: 'sakana', exampleMeaning: 'Ikan', strokes: 3, category: 's', subCategory: 'gojuon' },
  { char: 'し', romaji: 'shi', exampleWord: 'しお', exampleReading: 'shio', exampleMeaning: 'Garam', strokes: 1, category: 's', subCategory: 'gojuon' },
  { char: 'す', romaji: 'su', exampleWord: 'すし', exampleReading: 'sushi', exampleMeaning: 'Sushi', strokes: 2, category: 's', subCategory: 'gojuon' },
  { char: 'せ', romaji: 'se', exampleWord: 'せんせい', exampleReading: 'sensei', exampleMeaning: 'Guru', strokes: 3, category: 's', subCategory: 'gojuon' },
  { char: 'そ', romaji: 'so', exampleWord: 'そら', exampleReading: 'sora', exampleMeaning: 'Langit', strokes: 1, category: 's', subCategory: 'gojuon' },

  { char: 'た', romaji: 'ta', exampleWord: 'たまご', exampleReading: 'tamago', exampleMeaning: 'Telur', strokes: 4, category: 't', subCategory: 'gojuon' },
  { char: 'ち', romaji: 'chi', exampleWord: 'ちず', exampleReading: 'chizu', exampleMeaning: 'Peta', strokes: 2, category: 't', subCategory: 'gojuon' },
  { char: 'つ', romaji: 'tsu', exampleWord: 'つくえ', exampleReading: 'tsukue', exampleMeaning: 'Meja', strokes: 1, category: 't', subCategory: 'gojuon' },
  { char: 'て', romaji: 'te', exampleWord: 'て', exampleReading: 'te', exampleMeaning: 'Tangan', strokes: 1, category: 't', subCategory: 'gojuon' },
  { char: 'と', romaji: 'to', exampleWord: 'ともだち', exampleReading: 'tomodachi', exampleMeaning: 'Teman', strokes: 2, category: 't', subCategory: 'gojuon' },

  { char: 'な', romaji: 'na', exampleWord: 'なつ', exampleReading: 'natsu', exampleMeaning: 'Musim panas', strokes: 4, category: 'n', subCategory: 'gojuon' },
  { char: 'に', romaji: 'ni', exampleWord: 'にく', exampleReading: 'niku', exampleMeaning: 'Daging', strokes: 3, category: 'n', subCategory: 'gojuon' },
  { char: 'ぬ', romaji: 'nu', exampleWord: 'いぬ', exampleReading: 'inu', exampleMeaning: 'Anjing', strokes: 2, category: 'n', subCategory: 'gojuon' },
  { char: 'ね', romaji: 'ne', exampleWord: 'ねこ', exampleReading: 'neko', exampleMeaning: 'Kucing', strokes: 2, category: 'n', subCategory: 'gojuon' },
  { char: 'の', romaji: 'no', exampleWord: 'のみもの', exampleReading: 'nomimono', exampleMeaning: 'Minuman', strokes: 1, category: 'n', subCategory: 'gojuon' },

  { char: 'は', romaji: 'ha', exampleWord: 'はな', exampleReading: 'hana', exampleMeaning: 'Bunga', strokes: 3, category: 'h', subCategory: 'gojuon' },
  { char: 'ひ', romaji: 'hi', exampleWord: 'ひと', exampleReading: 'hito', exampleMeaning: 'Orang', strokes: 1, category: 'h', subCategory: 'gojuon' },
  { char: 'ふ', romaji: 'fu', exampleWord: 'ふね', exampleReading: 'fune', exampleMeaning: 'Kapal', strokes: 4, category: 'h', subCategory: 'gojuon' },
  { char: 'へ', romaji: 'he', exampleWord: 'へや', exampleReading: 'heya', exampleMeaning: 'Kamar', strokes: 1, category: 'h', subCategory: 'gojuon' },
  { char: 'ほ', romaji: 'ho', exampleWord: 'ほん', exampleReading: 'hon', exampleMeaning: 'Buku', strokes: 4, category: 'h', subCategory: 'gojuon' },

  { char: 'ま', romaji: 'ma', exampleWord: 'まち', exampleReading: 'machi', exampleMeaning: 'Kota', strokes: 3, category: 'm', subCategory: 'gojuon' },
  { char: 'み', romaji: 'mi', exampleWord: 'みず', exampleReading: 'mizu', exampleMeaning: 'Air', strokes: 2, category: 'm', subCategory: 'gojuon' },
  { char: 'む', romaji: 'mu', exampleWord: 'むし', exampleReading: 'mushi', exampleMeaning: 'Serangga', strokes: 3, category: 'm', subCategory: 'gojuon' },
  { char: 'め', romaji: 'me', exampleWord: 'め', exampleReading: 'me', exampleMeaning: 'Mata', strokes: 2, category: 'm', subCategory: 'gojuon' },
  { char: 'も', romaji: 'mo', exampleWord: 'もり', exampleReading: 'mori', exampleMeaning: 'Hutan', strokes: 3, category: 'm', subCategory: 'gojuon' },

  { char: 'や', romaji: 'ya', exampleWord: 'やま', exampleReading: 'yama', exampleMeaning: 'Gunung', strokes: 3, category: 'y', subCategory: 'gojuon' },
  { char: 'ゆ', romaji: 'yu', exampleWord: 'ゆき', exampleReading: 'yuki', exampleMeaning: 'Salju', strokes: 2, category: 'y', subCategory: 'gojuon' },
  { char: 'よ', romaji: 'yo', exampleWord: 'よる', exampleReading: 'yoru', exampleMeaning: 'Malam', strokes: 2, category: 'y', subCategory: 'gojuon' },

  { char: 'ら', romaji: 'ra', exampleWord: 'らいしゅう', exampleReading: 'raishuu', exampleMeaning: 'Pekan depan', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'り', romaji: 'ri', exampleWord: 'りんご', exampleReading: 'ringo', exampleMeaning: 'Apel', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'る', romaji: 'ru', exampleWord: 'よる', exampleReading: 'yoru', exampleMeaning: 'Malam', strokes: 1, category: 'r', subCategory: 'gojuon' },
  { char: 'れ', romaji: 're', exampleWord: 'れきし', exampleReading: 'rekishi', exampleMeaning: 'Sejarah', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'ろ', romaji: 'ro', exampleWord: 'ろうそく', exampleReading: 'rousoku', exampleMeaning: 'Lilin', strokes: 1, category: 'r', subCategory: 'gojuon' },

  { char: 'わ', romaji: 'wa', exampleWord: 'わたし', exampleReading: 'watashi', exampleMeaning: 'Saya', strokes: 2, category: 'w', subCategory: 'gojuon' },
  { char: 'を', romaji: 'wo (o)', exampleWord: '〜を', exampleReading: 'o', exampleMeaning: 'Partikel objek', strokes: 3, category: 'w', subCategory: 'gojuon' },
  { char: 'ん', romaji: 'n', exampleWord: 'にほん', exampleReading: 'nihon', exampleMeaning: 'Jepang', strokes: 1, category: 'n_alone', subCategory: 'gojuon' },

  // 2. Dakuon (20 Suara Tenten ゛)
  { char: 'が', romaji: 'ga', exampleWord: 'がいこく', exampleReading: 'gaikoku', exampleMeaning: 'Luar negeri', strokes: 4, category: 'g', subCategory: 'dakuon' },
  { char: 'ぎ', romaji: 'gi', exampleWord: 'ぎんこう', exampleReading: 'ginkou', exampleMeaning: 'Bank', strokes: 5, category: 'g', subCategory: 'dakuon' },
  { char: 'ぐ', romaji: 'gu', exampleWord: 'ぐらい', exampleReading: 'gurai', exampleMeaning: 'Kira-kira', strokes: 2, category: 'g', subCategory: 'dakuon' },
  { char: 'げ', romaji: 'ge', exampleWord: 'げんき', exampleReading: 'genki', exampleMeaning: 'Sehat', strokes: 4, category: 'g', subCategory: 'dakuon' },
  { char: 'ご', romaji: 'go', exampleWord: 'ごはん', exampleReading: 'gohan', exampleMeaning: 'Nasi / Makanan', strokes: 3, category: 'g', subCategory: 'dakuon' },

  { char: 'ざ', romaji: 'za', exampleWord: 'ざっし', exampleReading: 'zasshi', exampleMeaning: 'Majalah', strokes: 4, category: 'z', subCategory: 'dakuon' },
  { char: 'じ', romaji: 'ji', exampleWord: 'じかん', exampleReading: 'jikan', exampleMeaning: 'Waktu', strokes: 2, category: 'z', subCategory: 'dakuon' },
  { char: 'ず', romaji: 'zu', exampleWord: 'ちず', exampleReading: 'chizu', exampleMeaning: 'Peta', strokes: 3, category: 'z', subCategory: 'dakuon' },
  { char: 'ぜ', romaji: 'ze', exampleWord: 'ぜんぶ', exampleReading: 'zenbu', exampleMeaning: 'Semuanya', strokes: 4, category: 'z', subCategory: 'dakuon' },
  { char: 'ぞ', romaji: 'zo', exampleWord: 'かぞく', exampleReading: 'kazoku', exampleMeaning: 'Keluarga', strokes: 2, category: 'z', subCategory: 'dakuon' },

  { char: 'だ', romaji: 'da', exampleWord: 'だいがく', exampleReading: 'daigaku', exampleMeaning: 'Universitas', strokes: 5, category: 'd', subCategory: 'dakuon' },
  { char: 'ぢ', romaji: 'ji (di)', exampleWord: 'はなぢ', exampleReading: 'hanaji', exampleMeaning: 'Mimisan', strokes: 3, category: 'd', subCategory: 'dakuon' },
  { char: 'づ', romaji: 'zu (du)', exampleWord: 'つづく', exampleReading: 'tsuzuku', exampleMeaning: 'Berlanjut', strokes: 2, category: 'd', subCategory: 'dakuon' },
  { char: 'で', romaji: 'de', exampleWord: 'でんしゃ', exampleReading: 'densha', exampleMeaning: 'Kereta listrik', strokes: 2, category: 'd', subCategory: 'dakuon' },
  { char: 'ど', romaji: 'do', exampleWord: 'どこ', exampleReading: 'doko', exampleMeaning: 'Di mana', strokes: 3, category: 'd', subCategory: 'dakuon' },

  { char: 'ば', romaji: 'ba', exampleWord: 'ばんごう', exampleReading: 'bangou', exampleMeaning: 'Nomor', strokes: 5, category: 'b', subCategory: 'dakuon' },
  { char: 'び', romaji: 'bi', exampleWord: 'びょういん', exampleReading: 'byouin', exampleMeaning: 'Rumah sakit', strokes: 2, category: 'b', subCategory: 'dakuon' },
  { char: 'ぶ', romaji: 'bu', exampleWord: 'ぶんか', exampleReading: 'bunka', exampleMeaning: 'Budaya', strokes: 5, category: 'b', subCategory: 'dakuon' },
  { char: 'べ', romaji: 'be', exampleWord: 'べんきょう', exampleReading: 'benkyou', exampleMeaning: 'Belajar', strokes: 2, category: 'b', subCategory: 'dakuon' },
  { char: 'ぼ', romaji: 'bo', exampleWord: 'ぼうし', exampleReading: 'boushi', exampleMeaning: 'Topi', strokes: 5, category: 'b', subCategory: 'dakuon' },

  // 3. Handakuon (5 Suara Maru ゜)
  { char: 'ぱ', romaji: 'pa', exampleWord: 'ぱん', exampleReading: 'pan', exampleMeaning: 'Roti', strokes: 4, category: 'p', subCategory: 'handakuon' },
  { char: 'ぴ', romaji: 'pi', exampleWord: 'ぴかぴか', exampleReading: 'pikapika', exampleMeaning: 'Berkilau', strokes: 2, category: 'p', subCategory: 'handakuon' },
  { char: 'ぷ', romaji: 'pu', exampleWord: 'ぷれぜんと', exampleReading: 'purezento', exampleMeaning: 'Hadiah', strokes: 5, category: 'p', subCategory: 'handakuon' },
  { char: 'ぺ', romaji: 'pe', exampleWord: 'ぺん', exampleReading: 'pen', exampleMeaning: 'Pena', strokes: 2, category: 'p', subCategory: 'handakuon' },
  { char: 'ぽ', romaji: 'po', exampleWord: 'ぽけっと', exampleReading: 'poketto', exampleMeaning: 'Saku', strokes: 5, category: 'p', subCategory: 'handakuon' },

  // 4. Yōon (33 Suara Kombinasi)
  { char: 'きゃ', romaji: 'kya', exampleWord: 'きゃく', exampleReading: 'kyaku', exampleMeaning: 'Tamu', strokes: 6, category: 'yoon_k', subCategory: 'yoon' },
  { char: 'きゅ', romaji: 'kyu', exampleWord: 'きゅう', exampleReading: 'kyuu', exampleMeaning: 'Sembilan', strokes: 6, category: 'yoon_k', subCategory: 'yoon' },
  { char: 'きょ', romaji: 'kyo', exampleWord: 'きょう', exampleReading: 'kyou', exampleMeaning: 'Hari ini', strokes: 5, category: 'yoon_k', subCategory: 'yoon' },

  { char: 'しゃ', romaji: 'sha', exampleWord: 'しゃしん', exampleReading: 'shashin', exampleMeaning: 'Foto', strokes: 3, category: 'yoon_s', subCategory: 'yoon' },
  { char: 'しゅ', romaji: 'shu', exampleWord: 'しゅくだい', exampleReading: 'shukudai', exampleMeaning: 'PR', strokes: 3, category: 'yoon_s', subCategory: 'yoon' },
  { char: 'しょ', romaji: 'sho', exampleWord: 'しょくどう', exampleReading: 'shokudou', exampleMeaning: 'Kantin', strokes: 2, category: 'yoon_s', subCategory: 'yoon' },

  { char: 'ちゃ', romaji: 'cha', exampleWord: 'おちゃ', exampleReading: 'ocha', exampleMeaning: 'Teh', strokes: 4, category: 'yoon_t', subCategory: 'yoon' },
  { char: 'ちゅ', romaji: 'chu', exampleWord: 'ちゅうごく', exampleReading: 'chuugoku', exampleMeaning: 'Tiongkok', strokes: 4, category: 'yoon_t', subCategory: 'yoon' },
  { char: 'ちょ', romaji: 'cho', exampleWord: 'ちょっと', exampleReading: 'chotto', exampleMeaning: 'Sebentar', strokes: 3, category: 'yoon_t', subCategory: 'yoon' },

  { char: 'にゃ', romaji: 'nya', exampleWord: 'にゃー', exampleReading: 'nyaa', exampleMeaning: 'Suara kucing', strokes: 5, category: 'yoon_n', subCategory: 'yoon' },
  { char: 'にゅ', romaji: 'nyu', exampleWord: 'にゅうがく', exampleReading: 'nyuugaku', exampleMeaning: 'Masuk sekolah', strokes: 5, category: 'yoon_n', subCategory: 'yoon' },
  { char: 'にょ', romaji: 'nyo', exampleWord: 'にょきにょき', exampleReading: 'nyokinyoki', exampleMeaning: 'Tumbuh cepat', strokes: 4, category: 'yoon_n', subCategory: 'yoon' },

  { char: 'ひゃ', romaji: 'hya', exampleWord: 'ひゃく', exampleReading: 'hyaku', exampleMeaning: 'Seratus', strokes: 3, category: 'yoon_h', subCategory: 'yoon' },
  { char: 'ひゅ', romaji: 'hyu', exampleWord: 'ひゅうひゅう', exampleReading: 'hyuuhyuu', exampleMeaning: 'Desau angin', strokes: 3, category: 'yoon_h', subCategory: 'yoon' },
  { char: 'ひょ', romaji: 'hyo', exampleWord: 'ひょう', exampleReading: 'hyou', exampleMeaning: 'Tabel grafis', strokes: 2, category: 'yoon_h', subCategory: 'yoon' },

  { char: 'みゃ', romaji: 'mya', exampleWord: 'みゃく', exampleReading: 'myaku', exampleMeaning: 'Denyut nadi', strokes: 4, category: 'yoon_m', subCategory: 'yoon' },
  { char: 'みゅ', romaji: 'myu', exampleWord: 'みゅーじかる', exampleReading: 'myuujikaru', exampleMeaning: 'Musikal', strokes: 4, category: 'yoon_m', subCategory: 'yoon' },
  { char: 'みょ', romaji: 'myo', exampleWord: 'みょうじ', exampleReading: 'myouji', exampleMeaning: 'Nama keluarga', strokes: 3, category: 'yoon_m', subCategory: 'yoon' },

  { char: 'りゃ', romaji: 'rya', exampleWord: 'りゃくご', exampleReading: 'ryakugo', exampleMeaning: 'Singkatan kata', strokes: 4, category: 'yoon_r', subCategory: 'yoon' },
  { char: 'りゅ', romaji: 'ryu', exampleWord: 'りゅうがく', exampleReading: 'ryuugaku', exampleMeaning: 'Studi di luar negeri', strokes: 4, category: 'yoon_r', subCategory: 'yoon' },
  { char: 'りょ', romaji: 'ryo', exampleWord: 'りょこう', exampleReading: 'ryokou', exampleMeaning: 'Wisata', strokes: 3, category: 'yoon_r', subCategory: 'yoon' },

  { char: 'ぎゃ', romaji: 'gya', exampleWord: 'ぎゃく', exampleReading: 'gyaku', exampleMeaning: 'Kebalikan', strokes: 7, category: 'yoon_g', subCategory: 'yoon' },
  { char: 'ぎゅ', romaji: 'gyu', exampleWord: 'ぎゅうにゅう', exampleReading: 'gyuunyuu', exampleMeaning: 'Susu sapi', strokes: 7, category: 'yoon_g', subCategory: 'yoon' },
  { char: 'ぎょ', romaji: 'gyo', exampleWord: 'ぎょうざ', exampleReading: 'gyouza', exampleMeaning: 'Gyoza', strokes: 6, category: 'yoon_g', subCategory: 'yoon' },

  { char: 'じゃ', romaji: 'ja', exampleWord: 'じゃがいも', exampleReading: 'jagaimo', exampleMeaning: 'Kentang', strokes: 4, category: 'yoon_z', subCategory: 'yoon' },
  { char: 'じゅ', romaji: 'ju', exampleWord: 'じゅぎょう', exampleReading: 'jugyou', exampleMeaning: 'Pelajaran', strokes: 4, category: 'yoon_z', subCategory: 'yoon' },
  { char: 'じょ', romaji: 'jo', exampleWord: 'じょせい', exampleReading: 'josei', exampleMeaning: 'Wanita', strokes: 3, category: 'yoon_z', subCategory: 'yoon' },

  { char: 'びゃ', romaji: 'bya', exampleWord: 'さんびゃく', exampleReading: 'sanbyaku', exampleMeaning: 'Tiga ratus', strokes: 4, category: 'yoon_b', subCategory: 'yoon' },
  { char: 'びゅ', romaji: 'byu', exampleWord: 'びゅうびゅう', exampleReading: 'byuubyuu', exampleMeaning: 'Desau kencang', strokes: 4, category: 'yoon_b', subCategory: 'yoon' },
  { char: 'びょ', romaji: 'byo', exampleWord: 'びょういん', exampleReading: 'byouin', exampleMeaning: 'Rumah sakit', strokes: 3, category: 'yoon_b', subCategory: 'yoon' },

  { char: 'ぴゃ', romaji: 'pya', exampleWord: 'ろっぴゃく', exampleReading: 'roppyaku', exampleMeaning: 'Enam ratus', strokes: 4, category: 'yoon_p', subCategory: 'yoon' },
  { char: 'ぴゅ', romaji: 'pyu', exampleWord: 'ぴゅうぴゅう', exampleReading: 'pyuupyuu', exampleMeaning: 'Tiupan peluit', strokes: 4, category: 'yoon_p', subCategory: 'yoon' },
  { char: 'ぴょ', romaji: 'pyo', exampleWord: 'ぴょんぴょん', exampleReading: 'pyonpyon', exampleMeaning: 'Lompat-lompat', strokes: 3, category: 'yoon_p', subCategory: 'yoon' },

  // 5. Special Signs (Sokuon)
  { char: 'っ', romaji: '(konsonan ganda)', exampleWord: 'がっこう', exampleReading: 'gakkou', exampleMeaning: 'Sekolah (pause sokuon)', strokes: 1, category: 'special', subCategory: 'special' },
];

// ----------------- KATAKANA FULL SPECTRUM (Gojuon, Dakuon, Handakuon, Yoon, Sokuon, Choon) -----------------
export const KATAKANA_LIST: CharacterItem[] = [
  // 1. Gojūon (46 Dasar)
  { char: 'ア', romaji: 'a', exampleWord: 'アメリカ', exampleReading: 'Amerika', exampleMeaning: 'Amerika Serikat', strokes: 2, category: 'vowel', subCategory: 'gojuon' },
  { char: 'イ', romaji: 'i', exampleWord: 'インドネシア', exampleReading: 'Indoneshia', exampleMeaning: 'Indonesia', strokes: 2, category: 'vowel', subCategory: 'gojuon' },
  { char: 'ウ', romaji: 'u', exampleWord: 'ウェブ', exampleReading: 'webu', exampleMeaning: 'Web / Situs', strokes: 3, category: 'vowel', subCategory: 'gojuon' },
  { char: 'エ', romaji: 'e', exampleWord: 'エレベーター', exampleReading: 'erebeetaa', exampleMeaning: 'Elevator / Lift', strokes: 3, category: 'vowel', subCategory: 'gojuon' },
  { char: 'オ', romaji: 'o', exampleWord: 'オフィス', exampleReading: 'ofisu', exampleMeaning: 'Kantor', strokes: 3, category: 'vowel', subCategory: 'gojuon' },

  { char: 'カ', romaji: 'ka', exampleWord: 'カフェ', exampleReading: 'kafe', exampleMeaning: 'Kafe', strokes: 2, category: 'k', subCategory: 'gojuon' },
  { char: 'キ', romaji: 'ki', exampleWord: 'キッチン', exampleReading: 'kicchin', exampleMeaning: 'Dapur', strokes: 3, category: 'k', subCategory: 'gojuon' },
  { char: 'ク', romaji: 'ku', exampleWord: 'クラス', exampleReading: 'kurasu', exampleMeaning: 'Kelas', strokes: 2, category: 'k', subCategory: 'gojuon' },
  { char: 'ケ', romaji: 'ke', exampleWord: 'ケーキ', exampleReading: 'keeki', exampleMeaning: 'Kue', strokes: 3, category: 'k', subCategory: 'gojuon' },
  { char: 'コ', romaji: 'ko', exampleWord: 'コーヒー', exampleReading: 'koohii', exampleMeaning: 'Kopi', strokes: 2, category: 'k', subCategory: 'gojuon' },

  { char: 'サ', romaji: 'sa', exampleWord: 'サラダ', exampleReading: 'sarada', exampleMeaning: 'Salad', strokes: 3, category: 's', subCategory: 'gojuon' },
  { char: 'シ', romaji: 'shi', exampleWord: 'シャツ', exampleReading: 'shatsu', exampleMeaning: 'Kemeja', strokes: 3, category: 's', subCategory: 'gojuon' },
  { char: 'ス', romaji: 'su', exampleWord: 'スポーツ', exampleReading: 'supootsu', exampleMeaning: 'Olahraga', strokes: 2, category: 's', subCategory: 'gojuon' },
  { char: 'セ', romaji: 'se', exampleWord: 'セーター', exampleReading: 'seetaa', exampleMeaning: 'Sweater', strokes: 2, category: 's', subCategory: 'gojuon' },
  { char: 'ソ', romaji: 'so', exampleWord: 'ソファ', exampleReading: 'sofa', exampleMeaning: 'Sofa', strokes: 2, category: 's', subCategory: 'gojuon' },

  { char: 'タ', romaji: 'ta', exampleWord: 'タクシー', exampleReading: 'takushii', exampleMeaning: 'Taksi', strokes: 3, category: 't', subCategory: 'gojuon' },
  { char: 'チ', romaji: 'chi', exampleWord: 'チーズ', exampleReading: 'chiizu', exampleMeaning: 'Keju', strokes: 3, category: 't', subCategory: 'gojuon' },
  { char: 'ツ', romaji: 'tsu', exampleWord: 'ツアー', exampleReading: 'tsuaa', exampleMeaning: 'Tur perjalanan', strokes: 3, category: 't', subCategory: 'gojuon' },
  { char: 'テ', romaji: 'te', exampleWord: 'テーブル', exampleReading: 'teeburu', exampleMeaning: 'Meja makan', strokes: 3, category: 't', subCategory: 'gojuon' },
  { char: 'ト', romaji: 'to', exampleWord: 'トイレ', exampleReading: 'toire', exampleMeaning: 'Toilet', strokes: 2, category: 't', subCategory: 'gojuon' },

  { char: 'ナ', romaji: 'na', exampleWord: 'ナイフ', exampleReading: 'naifu', exampleMeaning: 'Pisau', strokes: 2, category: 'n', subCategory: 'gojuon' },
  { char: 'ニ', romaji: 'ni', exampleWord: 'ニュース', exampleReading: 'nyuusu', exampleMeaning: 'Berita', strokes: 2, category: 'n', subCategory: 'gojuon' },
  { char: 'ヌ', romaji: 'nu', exampleWord: 'カヌー', exampleReading: 'kanuu', exampleMeaning: 'Kano', strokes: 2, category: 'n', subCategory: 'gojuon' },
  { char: 'ネ', romaji: 'ne', exampleWord: 'ネクタイ', exampleReading: 'nekutai', exampleMeaning: 'Dasi', strokes: 4, category: 'n', subCategory: 'gojuon' },
  { char: 'ノ', romaji: 'no', exampleWord: 'ノート', exampleReading: 'nooto', exampleMeaning: 'Buku catatan', strokes: 1, category: 'n', subCategory: 'gojuon' },

  { char: 'ハ', romaji: 'ha', exampleWord: 'ハンバーガー', exampleReading: 'hanbaagaa', exampleMeaning: 'Hamburger', strokes: 2, category: 'h', subCategory: 'gojuon' },
  { char: 'ヒ', romaji: 'hi', exampleWord: 'ヒーター', exampleReading: 'hiitaa', exampleMeaning: 'Pemanas ruangan', strokes: 2, category: 'h', subCategory: 'gojuon' },
  { char: 'フ', romaji: 'fu', exampleWord: 'フォーク', exampleReading: 'fooku', exampleMeaning: 'Garpu', strokes: 1, category: 'h', subCategory: 'gojuon' },
  { char: 'ヘ', romaji: 'he', exampleWord: 'ヘルメット', exampleReading: 'herumetto', exampleMeaning: 'Helm', strokes: 1, category: 'h', subCategory: 'gojuon' },
  { char: 'ホ', romaji: 'ho', exampleWord: 'ホテル', exampleReading: 'hoteru', exampleMeaning: 'Hotel', strokes: 4, category: 'h', subCategory: 'gojuon' },

  { char: 'マ', romaji: 'ma', exampleWord: 'マスク', exampleReading: 'masuku', exampleMeaning: 'Masker', strokes: 2, category: 'm', subCategory: 'gojuon' },
  { char: 'ミ', romaji: 'mi', exampleWord: 'ミルク', exampleReading: 'miruku', exampleMeaning: 'Susu', strokes: 3, category: 'm', subCategory: 'gojuon' },
  { char: 'ム', romaji: 'mu', exampleWord: 'ムービー', exampleReading: 'muubii', exampleMeaning: 'Film', strokes: 2, category: 'm', subCategory: 'gojuon' },
  { char: 'メ', romaji: 'me', exampleWord: 'メール', exampleReading: 'meeru', exampleMeaning: 'Email', strokes: 2, category: 'm', subCategory: 'gojuon' },
  { char: 'モ', romaji: 'mo', exampleWord: 'モデル', exampleReading: 'moderu', exampleMeaning: 'Model', strokes: 3, category: 'm', subCategory: 'gojuon' },

  { char: 'ヤ', romaji: 'ya', exampleWord: 'ヤシ', exampleReading: 'yashi', exampleMeaning: 'Kelapa', strokes: 2, category: 'y', subCategory: 'gojuon' },
  { char: 'ユ', romaji: 'yu', exampleWord: 'ユーザー', exampleReading: 'yuuzaa', exampleMeaning: 'Pengguna', strokes: 2, category: 'y', subCategory: 'gojuon' },
  { char: 'ヨ', romaji: 'yo', exampleWord: 'ヨーグルト', exampleReading: 'yooguruto', exampleMeaning: 'Yogurt', strokes: 3, category: 'y', subCategory: 'gojuon' },

  { char: 'ラ', romaji: 'ra', exampleWord: 'ラジオ', exampleReading: 'rajio', exampleMeaning: 'Radio', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'リ', romaji: 'ri', exampleWord: 'リーダー', exampleReading: 'riidaa', exampleMeaning: 'Pemimpin', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'ル', romaji: 'ru', exampleWord: 'ルール', exampleReading: 'ruuru', exampleMeaning: 'Aturan', strokes: 2, category: 'r', subCategory: 'gojuon' },
  { char: 'レ', romaji: 're', exampleWord: 'レストラン', exampleReading: 'resutoran', exampleMeaning: 'Restoran', strokes: 1, category: 'r', subCategory: 'gojuon' },
  { char: 'ロ', romaji: 'ro', exampleWord: 'ロボット', exampleReading: 'robotto', exampleMeaning: 'Robot', strokes: 3, category: 'r', subCategory: 'gojuon' },

  { char: 'ワ', romaji: 'wa', exampleWord: 'ワイン', exampleReading: 'wain', exampleMeaning: 'Anggur (Wine)', strokes: 2, category: 'w', subCategory: 'gojuon' },
  { char: 'ヲ', romaji: 'wo', exampleWord: 'ヲタク (slang)', exampleReading: 'otaku', exampleMeaning: 'Penggemar antusias', strokes: 3, category: 'w', subCategory: 'gojuon' },
  { char: 'ン', romaji: 'n', exampleWord: 'パン', exampleReading: 'pan', exampleMeaning: 'Roti', strokes: 2, category: 'n_alone', subCategory: 'gojuon' },

  // 2. Dakuon (20 Suara Tenten ゛)
  { char: 'ガ', romaji: 'ga', exampleWord: 'ガラス', exampleReading: 'garasu', exampleMeaning: 'Kaca', strokes: 4, category: 'g', subCategory: 'dakuon' },
  { char: 'ギ', romaji: 'gi', exampleWord: 'ギター', exampleReading: 'gitaa', exampleMeaning: 'Gitar', strokes: 5, category: 'g', subCategory: 'dakuon' },
  { char: 'グ', romaji: 'gu', exampleWord: 'グラス', exampleReading: 'gurasu', exampleMeaning: 'Gelas kaca', strokes: 4, category: 'g', subCategory: 'dakuon' },
  { char: 'ゲ', romaji: 'ge', exampleWord: 'ゲーム', exampleReading: 'geemu', exampleMeaning: 'Game / Permainan', strokes: 5, category: 'g', subCategory: 'dakuon' },
  { char: 'ゴ', romaji: 'go', exampleWord: 'ゴルフ', exampleReading: 'gorufu', exampleMeaning: 'Golf', strokes: 4, category: 'g', subCategory: 'dakuon' },

  { char: 'ザ', romaji: 'za', exampleWord: 'デザイン', exampleReading: 'dezain', exampleMeaning: 'Desain', strokes: 5, category: 'z', subCategory: 'dakuon' },
  { char: 'ジ', romaji: 'ji', exampleWord: 'ジュース', exampleReading: 'juusu', exampleMeaning: 'Jus', strokes: 5, category: 'z', subCategory: 'dakuon' },
  { char: 'ズ', romaji: 'zu', exampleWord: 'ズボン', exampleReading: 'zubon', exampleMeaning: 'Celana', strokes: 4, category: 'z', subCategory: 'dakuon' },
  { char: 'ゼ', romaji: 'ze', exampleWord: 'ゼロ', exampleReading: 'zero', exampleMeaning: 'Nol', strokes: 4, category: 'z', subCategory: 'dakuon' },
  { char: 'ゾ', romaji: 'zo', exampleWord: 'ゾーン', exampleReading: 'zoon', exampleMeaning: 'Zona wilayah', strokes: 4, category: 'z', subCategory: 'dakuon' },

  { char: 'ダ', romaji: 'da', exampleWord: 'ダンス', exampleReading: 'dansu', exampleMeaning: 'Tarian', strokes: 5, category: 'd', subCategory: 'dakuon' },
  { char: 'ヂ', romaji: 'ji (di)', exampleWord: 'ラジオヂャック', exampleReading: 'rajiojakku', exampleMeaning: 'Colokan radio', strokes: 5, category: 'd', subCategory: 'dakuon' },
  { char: 'ヅ', romaji: 'zu (du)', exampleWord: 'キッズヅ', exampleReading: 'kizzu', exampleMeaning: 'Anak-anak', strokes: 5, category: 'd', subCategory: 'dakuon' },
  { char: 'デ', romaji: 'de', exampleWord: 'デスク', exampleReading: 'desuku', exampleMeaning: 'Meja kerja', strokes: 5, category: 'd', subCategory: 'dakuon' },
  { char: 'ド', romaji: 'do', exampleWord: 'ドア', exampleReading: 'doa', exampleMeaning: 'Pintu', strokes: 4, category: 'd', subCategory: 'dakuon' },

  { char: 'バ', romaji: 'ba', exampleWord: 'バス', exampleReading: 'basu', exampleMeaning: 'Bus', strokes: 4, category: 'b', subCategory: 'dakuon' },
  { char: 'ビ', romaji: 'bi', exampleWord: 'ビル', exampleReading: 'biru', exampleMeaning: 'Gedung bertingkat', strokes: 4, category: 'b', subCategory: 'dakuon' },
  { char: 'ブ', romaji: 'bu', exampleWord: 'ブーツ', exampleReading: 'buutsu', exampleMeaning: 'Sepatu bot', strokes: 3, category: 'b', subCategory: 'dakuon' },
  { char: 'ベ', romaji: 'be', exampleWord: 'ベッド', exampleReading: 'beddo', exampleMeaning: 'Tempat tidur', strokes: 3, category: 'b', subCategory: 'dakuon' },
  { char: 'ボ', romaji: 'bo', exampleWord: 'ボタン', exampleReading: 'botan', exampleMeaning: 'Tombol', strokes: 6, category: 'b', subCategory: 'dakuon' },

  // 3. Handakuon (5 Suara Maru ゜)
  { char: 'パ', romaji: 'pa', exampleWord: 'パン', exampleReading: 'pan', exampleMeaning: 'Roti', strokes: 3, category: 'p', subCategory: 'handakuon' },
  { char: 'ピ', romaji: 'pi', exampleWord: 'ピアノ', exampleReading: 'piano', exampleMeaning: 'Piano', strokes: 3, category: 'p', subCategory: 'handakuon' },
  { char: 'プ', romaji: 'pu', exampleWord: 'プール', exampleReading: 'puuru', exampleMeaning: 'Kolam renang', strokes: 2, category: 'p', subCategory: 'handakuon' },
  { char: 'ペ', romaji: 'pe', exampleWord: 'ペン', exampleReading: 'pen', exampleMeaning: 'Pena', strokes: 2, category: 'p', subCategory: 'handakuon' },
  { char: 'ポ', romaji: 'po', exampleWord: 'ポスト', exampleReading: 'posuto', exampleMeaning: 'Kotak pos', strokes: 5, category: 'p', subCategory: 'handakuon' },

  // 4. Yōon (33 Suara Kombinasi)
  { char: 'キャ', romaji: 'kya', exampleWord: 'キャンプ', exampleReading: 'kyanpu', exampleMeaning: 'Berkemah', strokes: 5, category: 'yoon_k', subCategory: 'yoon' },
  { char: 'キュ', romaji: 'kyu', exampleWord: 'キューブ', exampleReading: 'kyuubu', exampleMeaning: 'Kubus', strokes: 5, category: 'yoon_k', subCategory: 'yoon' },
  { char: 'キョ', romaji: 'kyo', exampleWord: 'キロ', exampleReading: 'kiro', exampleMeaning: 'Kilometer / Kilogram', strokes: 6, category: 'yoon_k', subCategory: 'yoon' },

  { char: 'シャ', romaji: 'sha', exampleWord: 'シャツ', exampleReading: 'shatsu', exampleMeaning: 'Kemeja', strokes: 5, category: 'yoon_s', subCategory: 'yoon' },
  { char: 'シュ', romaji: 'shu', exampleWord: 'シュークリーム', exampleReading: 'shuukuriimu', exampleMeaning: 'Kue sus krim', strokes: 5, category: 'yoon_s', subCategory: 'yoon' },
  { char: 'ショ', romaji: 'sho', exampleWord: 'ショップ', exampleReading: 'shoppu', exampleMeaning: 'Toko belanja', strokes: 6, category: 'yoon_s', subCategory: 'yoon' },

  { char: 'チャ', romaji: 'cha', exampleWord: 'チャット', exampleReading: 'chatto', exampleMeaning: 'Obrolan / Chat', strokes: 5, category: 'yoon_t', subCategory: 'yoon' },
  { char: 'チュ', romaji: 'chu', exampleWord: 'チューブ', exampleReading: 'chuubu', exampleMeaning: 'Tabung', strokes: 5, category: 'yoon_t', subCategory: 'yoon' },
  { char: 'チョ', romaji: 'cho', exampleWord: 'チョコ', exampleReading: 'choko', exampleMeaning: 'Cokelat', strokes: 6, category: 'yoon_t', subCategory: 'yoon' },

  { char: 'ニャ', romaji: 'nya', exampleWord: 'ニャー', exampleReading: 'nyaa', exampleMeaning: 'Meong (suara kucing)', strokes: 4, category: 'yoon_n', subCategory: 'yoon' },
  { char: 'ニュ', romaji: 'nyu', exampleWord: 'ニュース', exampleReading: 'nyuusu', exampleMeaning: 'Berita', strokes: 4, category: 'yoon_n', subCategory: 'yoon' },
  { char: 'ニョ', romaji: 'nyo', exampleWord: 'ニョッキ', exampleReading: 'nyokki', exampleMeaning: 'Gnocchi (makanan)', strokes: 5, category: 'yoon_n', subCategory: 'yoon' },

  { char: 'ヒャ', romaji: 'hya', exampleWord: 'ヒャッホー', exampleReading: 'hyahhoo', exampleMeaning: 'Sorakan gembira', strokes: 4, category: 'yoon_h', subCategory: 'yoon' },
  { char: 'ヒュ', romaji: 'hyu', exampleWord: 'ヒューズ', exampleReading: 'hyuuzu', exampleMeaning: 'Sekring listrik', strokes: 4, category: 'yoon_h', subCategory: 'yoon' },
  { char: 'ヒョ', romaji: 'hyo', exampleWord: 'ヒョウ', exampleReading: 'hyou', exampleMeaning: 'Macan tutul', strokes: 5, category: 'yoon_h', subCategory: 'yoon' },

  { char: 'ミャ', romaji: 'mya', exampleWord: 'ミャンマー', exampleReading: 'Myanmaa', exampleMeaning: 'Negara Myanmar', strokes: 5, category: 'yoon_m', subCategory: 'yoon' },
  { char: 'ミュ', romaji: 'myu', exampleWord: 'ミュージカル', exampleReading: 'myuujikaru', exampleMeaning: 'Drama musikal', strokes: 5, category: 'yoon_m', subCategory: 'yoon' },
  { char: 'ミョ', romaji: 'myo', exampleWord: 'ミョウバン', exampleReading: 'myouban', exampleMeaning: 'Tawas', strokes: 6, category: 'yoon_m', subCategory: 'yoon' },

  { char: 'リャ', romaji: 'rya', exampleWord: 'リャマ', exampleReading: 'ryama', exampleMeaning: 'Llama (hewan)', strokes: 4, category: 'yoon_r', subCategory: 'yoon' },
  { char: 'リュ', romaji: 'ryu', exampleWord: 'リュック', exampleReading: 'ryukku', exampleMeaning: 'Ransel tas', strokes: 4, category: 'yoon_r', subCategory: 'yoon' },
  { char: 'リョ', romaji: 'ryo', exampleWord: 'リョクトウ', exampleReading: 'ryokutou', exampleMeaning: 'Kacang hijau', strokes: 5, category: 'yoon_r', subCategory: 'yoon' },

  { char: 'ギャ', romaji: 'gya', exampleWord: 'ギャング', exampleReading: 'gyangu', exampleMeaning: 'Gengster', strokes: 6, category: 'yoon_g', subCategory: 'yoon' },
  { char: 'ギュ', romaji: 'gyu', exampleWord: 'ギュッと', exampleReading: 'gyutto', exampleMeaning: 'Erat-erat', strokes: 6, category: 'yoon_g', subCategory: 'yoon' },
  { char: 'ギョ', romaji: 'gyo', exampleWord: 'ギョーザ', exampleReading: 'gyooza', exampleMeaning: 'Gyoza panggang', strokes: 8, category: 'yoon_g', subCategory: 'yoon' },

  { char: 'ジャ', romaji: 'ja', exampleWord: 'ジャケット', exampleReading: 'jaketto', exampleMeaning: 'Jaket', strokes: 7, category: 'yoon_z', subCategory: 'yoon' },
  { char: 'ジュ', romaji: 'ju', exampleWord: 'ジュース', exampleReading: 'juusu', exampleMeaning: 'Minuman jus', strokes: 7, category: 'yoon_z', subCategory: 'yoon' },
  { char: 'ジョ', romaji: 'jo', exampleWord: 'ジョギング', exampleReading: 'jogingu', exampleMeaning: 'Joging lari santai', strokes: 8, category: 'yoon_z', subCategory: 'yoon' },

  { char: 'ビャ', romaji: 'bya', exampleWord: 'ビャンビャン麺', exampleReading: 'byanbyanmen', exampleMeaning: 'Mie Biang Biang', strokes: 6, category: 'yoon_b', subCategory: 'yoon' },
  { char: 'ビュ', romaji: 'byu', exampleWord: 'ビュッフェ', exampleReading: 'byuffe', exampleMeaning: 'Prasmanan', strokes: 6, category: 'yoon_b', subCategory: 'yoon' },
  { char: 'ビョ', romaji: 'byo', exampleWord: 'ビョウ', exampleReading: 'byou', exampleMeaning: 'Paku payung', strokes: 7, category: 'yoon_b', subCategory: 'yoon' },

  { char: 'ピャ', romaji: 'pya', exampleWord: 'ピャー', exampleReading: 'pyaa', exampleMeaning: 'Pekikan riang', strokes: 5, category: 'yoon_p', subCategory: 'yoon' },
  { char: 'ピュ', romaji: 'pyu', exampleWord: 'ピューマ', exampleReading: 'pyuuma', exampleMeaning: 'Puma (kucing liar)', strokes: 5, category: 'yoon_p', subCategory: 'yoon' },
  { char: 'ピョ', romaji: 'pyo', exampleWord: 'ピョコピョコ', exampleReading: 'pyokopyoko', exampleMeaning: 'Berjalan terantuk', strokes: 6, category: 'yoon_p', subCategory: 'yoon' },

  // 5. Special Signs (Sokuon & Choonpu)
  { char: 'ッ', romaji: '(konsonan ganda)', exampleWord: 'チケット', exampleReading: 'chiketto', exampleMeaning: 'Tiket (pause sokuon)', strokes: 3, category: 'special', subCategory: 'special' },
  { char: 'ー', romaji: '(vokal panjang)', exampleWord: 'コーヒー', exampleReading: 'koohii', exampleMeaning: 'Kopi (chōonpu)', strokes: 1, category: 'special', subCategory: 'special' },
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

export interface StrokeTrajectory {
  strokeNumber: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  directionLabel: string;
  instruction: string;
}

const CURATED_TRAJECTORIES: Record<string, StrokeTrajectory[]> = {
  'あ': [
    { strokeNumber: 1, startX: 25, startY: 30, endX: 75, endY: 30, directionLabel: '──▶ Kiri ke Kanan', instruction: 'Tarik garis horizontal di bagian atas secara mendatar.' },
    { strokeNumber: 2, startX: 50, startY: 18, endX: 45, endY: 82, directionLabel: '│▼ Atas ke Bawah', instruction: 'Tarik garis melengkung tegak lurus menembus garis pertama.' },
    { strokeNumber: 3, startX: 38, startY: 46, endX: 78, endY: 72, directionLabel: '⤵ Melingkar Penuh', instruction: 'Mulai dari tengah-kiri, buat lingkaran melengkung besar ke kanan bawah.' },
  ],
  'い': [
    { strokeNumber: 1, startX: 30, startY: 28, endX: 32, endY: 75, directionLabel: '│▼ Melengkung + Kait', instruction: 'Tarik garis melengkung di sisi kiri, beri sedikit sentakan kait ke atas di ujungnya.' },
    { strokeNumber: 2, startX: 70, startY: 36, endX: 68, endY: 65, directionLabel: '│▼ Tarikan Kanan', instruction: 'Tarik garis pendek sejajar di sisi kanan lebih rendah dan lebih pendek.' },
  ],
  'う': [
    { strokeNumber: 1, startX: 46, startY: 22, endX: 58, endY: 32, directionLabel: '╲▼ Titik Diagonal', instruction: 'Buat goresan aksen miring pendek di bagian atas.' },
    { strokeNumber: 2, startX: 34, startY: 42, endX: 42, endY: 80, directionLabel: '⤵ Busur Melengkung', instruction: 'Tarik lengkungan kubah dari kiri atas melingkar lembut ke bawah.' },
  ],
  'え': [
    { strokeNumber: 1, startX: 46, startY: 20, endX: 56, endY: 30, directionLabel: '╲▼ Titik Atas', instruction: 'Buat goresan aksen pendek di bagian puncak.' },
    { strokeNumber: 2, startX: 32, startY: 42, endX: 75, endY: 82, directionLabel: '⚡ Zigzag Bergelombang', instruction: 'Garis mendatar, turun diagonal tajam ke kiri, lalu sapuan gelombang ke kanan.' },
  ],
  'お': [
    { strokeNumber: 1, startX: 25, startY: 32, endX: 65, endY: 32, directionLabel: '──▶ Kiri ke Kanan', instruction: 'Tarik garis horizontal pendek di sisi atas.' },
    { strokeNumber: 2, startX: 45, startY: 20, endX: 60, endY: 78, directionLabel: '⤵ Tegak lalu Melingkar', instruction: 'Tarik garis tegak turun, lalu bentuk lingkaran simpul ke kiri dan kanan.' },
    { strokeNumber: 3, startX: 72, startY: 28, endX: 78, endY: 38, directionLabel: '╲▼ Titik Aksen', instruction: 'Beri titik aksen di pojok kanan atas.' },
  ],
  'ア': [
    { strokeNumber: 1, startX: 28, startY: 32, endX: 72, endY: 48, directionLabel: '──▶ Sudut Menekuk', instruction: 'Tarik garis horizontal lalu tekuk miring ke kiri bawah.' },
    { strokeNumber: 2, startX: 42, startY: 46, endX: 35, endY: 82, directionLabel: '│▼ Sapuan Melengkung', instruction: 'Tarik sapuan kurva melengkung ke kiri bawah.' },
  ],
  'イ': [
    { strokeNumber: 1, startX: 48, startY: 22, endX: 32, endY: 55, directionLabel: '╱▼ Sapuan Kiri', instruction: 'Tarik garis sapuan diagonal dari kanan atas ke kiri tengah.' },
    { strokeNumber: 2, startX: 44, startY: 42, endX: 44, endY: 82, directionLabel: '│▼ Tegak Lurus', instruction: 'Tarik garis vertikal tegak lurus dari tengah ke bawah.' },
  ],
  '日': [
    { strokeNumber: 1, startX: 30, startY: 25, endX: 30, endY: 78, directionLabel: '│▼ Sisi Kiri', instruction: 'Tarik garis vertikal sisi kiri bingkai dari atas ke bawah.' },
    { strokeNumber: 2, startX: 30, startY: 25, endX: 70, endY: 78, directionLabel: '──▶ Sudut Bingkai Kanan', instruction: 'Mulai dari atas, tarik mendatar lalu tekuk vertikal ke bawah.' },
    { strokeNumber: 3, startX: 30, startY: 50, endX: 70, endY: 50, directionLabel: '──▶ Garis Tengah', instruction: 'Tarik garis horizontal penyekat di bagian tengah.' },
    { strokeNumber: 4, startX: 30, startY: 78, endX: 70, endY: 78, directionLabel: '──▶ Garis Penutup Bawah', instruction: 'Tutup bingkai dengan garis horizontal di bagian dasar.' },
  ],
  '人': [
    { strokeNumber: 1, startX: 50, startY: 20, endX: 28, endY: 80, directionLabel: '╱▼ Sapuan Kiri', instruction: 'Tarik garis sapuan melengkung dari puncak ke kiri bawah.' },
    { strokeNumber: 2, startX: 46, startY: 42, endX: 74, endY: 80, directionLabel: '╲▼ Penopang Kanan', instruction: 'Dari tengah garis pertama, tarik garis melandai kokoh ke kanan bawah.' },
  ],
};

export function getStrokeTrajectories(char: string, totalStrokes: number = 3): StrokeTrajectory[] {
  if (CURATED_TRAJECTORIES[char]) {
    return CURATED_TRAJECTORIES[char];
  }

  const count = Math.max(1, totalStrokes);
  const trajectories: StrokeTrajectory[] = [];

  for (let i = 1; i <= count; i++) {
    const ratio = (i - 1) / Math.max(1, count - 1);
    const startY = Math.round(24 + ratio * 44);
    const endY = Math.round(startY + 15);
    const startX = Math.round(25 + (i % 2 === 1 ? 0 : 15));
    const endX = Math.round(75 - (i % 2 === 0 ? 0 : 10));

    let directionLabel = '──▶ Kiri ke Kanan';
    let instruction = `Goresan ke-${i}: Tarik garis mendatar secara seimbang.`;

    if (i === 1) {
      directionLabel = '──▶ Tarikan Awal Puncak';
      instruction = 'Awali dari bagian atas atau sisi kiri atas karakter.';
    } else if (i === count) {
      directionLabel = '──▶ Tarikan Penutup';
      instruction = 'Tutup karakter dengan goresan akhir yang stabil dan tuntas.';
    } else if (i % 2 === 0) {
      directionLabel = '│▼ Menembus Vertikal';
      instruction = 'Tarik garis penyeimbang vertikal dari atas ke bawah.';
    }

    trajectories.push({
      strokeNumber: i,
      startX,
      startY,
      endX,
      endY,
      directionLabel,
      instruction,
    });
  }

  return trajectories;
}
