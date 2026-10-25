// ----------------- KANA TO HEPBURN ROMAJI ENGINE -----------------

const DIGRAPHS_MAP: Record<string, string> = {
  // Hiragana Digraphs (Yoon)
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',

  // Katakana Digraphs
  キャ: 'kya', キュ: 'kyu', キョ: 'kyo',
  シャ: 'sha', シュ: 'shu', ショ: 'sho',
  チャ: 'cha', チュ: 'chu', チョ: 'cho',
  ニャ: 'nya', ニュ: 'nyu', ニョ: 'nyo',
  ヒャ: 'hya', ヒュ: 'hyu', ヒョ: 'hyo',
  ミャ: 'mya', ミュ: 'myu', ミョ: 'myo',
  リャ: 'rya', リュ: 'ryu', リョ: 'ryo',
  ギャ: 'gya', ギュ: 'gyu', ギョ: 'gyo',
  ジャ: 'ja', ジュ: 'ju', ジョ: 'jo',
  ビャ: 'bya', ビュ: 'byu', ビョ: 'byo',
  ピャ: 'pya', ピュ: 'pyu', ピョ: 'pyo',
  ティ: 'ti', ディ: 'di', ファ: 'fa', フィ: 'fi', フェ: 'fe', フォ: 'fo',
};

const SINGLE_KANA_MAP: Record<string, string> = {
  // Hiragana
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',

  // Katakana
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o',
  カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so',
  タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no',
  ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
  マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo',
  ヤ: 'ya', ユ: 'yu', ヨ: 'yo',
  ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro',
  ワ: 'wa', ヲ: 'o', ン: 'n',
  ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go',
  ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo',
  ダ: 'da', ヂ: 'ji', ヅ: 'zu', デ: 'de', ド: 'do',
  バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo',
  パ: 'pa', ピ: 'pi', プ: 'pu', ペ: 'pe', ポ: 'po',
};

// Common Core Kanji Lookup Map
const KANJI_CORE_LOOKUP: Record<string, string> = {
  私: 'watashi', 日本: 'nihon', 日本語: 'nihongo', 英語: 'eigo',
  学生: 'gakusei', 先生: 'sensei', 学校: 'gakkou', 友達: 'tomodachi',
  今日: 'kyou', 明日: 'ashita', 昨日: 'kinou', 毎日: 'mainichi',
  朝: 'asa', 昼: 'hiru', 夜: 'yoru', 時間: 'jikan',
  水: 'mizu', お茶: 'ocha', 食べる: 'taberu', 飲む: 'nomu',
  見る: 'miru', 聞く: 'kiku', 行く: 'iku', 来る: 'kuru',
  車: 'kuruma', 電車: 'densha', 駅: 'eki', 家: 'ie',
  本: 'hon', 勉強: 'benkyou', 練習: 'renshuu', 家族: 'kazoku',
  人: 'hito', 男: 'otoko', 女: 'on\'na', 子ども: 'kodomo',
};

export function convertJapaneseToRomaji(input: string): string {
  const text = input.trim();
  if (!text) return '';

  // Direct kanji vocabulary match
  if (KANJI_CORE_LOOKUP[text]) {
    return KANJI_CORE_LOOKUP[text];
  }

  let result = '';
  let i = 0;

  while (i < text.length) {
    // 1. Check digraphs (2 characters)
    const twoChars = text.slice(i, i + 2);
    if (DIGRAPHS_MAP[twoChars]) {
      result += DIGRAPHS_MAP[twoChars];
      i += 2;
      continue;
    }

    // 2. Check sokuon small tsu (っ / ッ)
    const currentChar = text[i];
    if (currentChar === 'っ' || currentChar === 'ッ') {
      const nextTwo = text.slice(i + 1, i + 3);
      const nextOne = text[i + 1] || '';
      let nextRomaji = '';

      if (DIGRAPHS_MAP[nextTwo]) {
        nextRomaji = DIGRAPHS_MAP[nextTwo];
      } else if (SINGLE_KANA_MAP[nextOne]) {
        nextRomaji = SINGLE_KANA_MAP[nextOne];
      }

      if (nextRomaji && nextRomaji.length > 0) {
        result += nextRomaji[0]; // double consonant
      }
      i += 1;
      continue;
    }

    // 3. Check long vowel mark in Katakana (ー)
    if (currentChar === 'ー') {
      const lastChar = result[result.length - 1];
      if (lastChar && /[aiueo]/i.test(lastChar)) {
        result += lastChar; // repeat last vowel (e.g. ko + ー -> koo)
      } else {
        result += '-';
      }
      i += 1;
      continue;
    }

    // 4. Single kana lookup
    if (SINGLE_KANA_MAP[currentChar]) {
      result += SINGLE_KANA_MAP[currentChar];
      i += 1;
      continue;
    }

    // 5. Preserved character (kanji without lookup, alphabet, space, punctuation)
    result += currentChar;
    i += 1;
  }

  return result.trim();
}

// ----------------- ENGLISH IPA PHONETIC ENGINE -----------------

const COMMON_ENGLISH_IPA: Record<string, string> = {
  mindset: '/ˈmaɪnd.set/',
  gratitude: '/ˈɡræt.ɪ.tʃuːd/',
  consistency: '/kənˈsɪs.tən.si/',
  facility: '/fəˈsɪl.ə.ti/',
  resilience: '/rɪˈzɪl.jəns/',
  empathy: '/ˈem.pə.θi/',
  milestone: '/ˈmaɪl.stəʊn/',
  breakthrough: '/ˈbreɪk.θruː/',
  dedication: '/ˌded.ɪˈkeɪ.ʃən/',
  momentum: '/məˈmen.təm/',
  discipline: '/ˈdɪs.ə.plɪn/',
  learning: '/ˈlɜː.nɪŋ/',
  language: '/ˈlæŋ.ɡwɪdʒ/',
  practice: '/ˈpræk.tɪs/',
  fluency: '/ˈfluː.ən.si/',
  vocabulary: '/vəˈkæb.jə.lər.i/',
  pronunciation: '/prəˌnʌn.siˈeɪ.ʃən/',
  conversation: '/ˌkɒn.vəˈseɪ.ʃən/',
  challenge: '/ˈtʃæl.ɪndʒ/',
  opportunity: '/ˌɒp.əˈtʃuː.nə.ti/',
  success: '/səkˈses/',
  inspire: '/ɪnˈspaɪər/',
  community: '/kəˈmjuː.nə.ti/',
  growth: '/ɡrəʊθ/',
  progress: '/ˈprəʊ.ɡres/',
  habit: '/ˈhæb.ɪt/',
};

export function convertEnglishToIpa(input: string): string {
  const clean = input.trim().toLowerCase();
  if (!clean) return '';

  // Direct lookup match
  if (COMMON_ENGLISH_IPA[clean]) {
    return COMMON_ENGLISH_IPA[clean];
  }

  // Heuristic IPA syllabification approximation
  // Creates a clean, standard phonetic transcription bracket
  const words = clean.split(/\s+/).filter(Boolean);
  const phonetics = words.map((w) => {
    if (COMMON_ENGLISH_IPA[w]) {
      return COMMON_ENGLISH_IPA[w].replace(/^\/|\/$/g, '');
    }

    // Algorithmic phoneme approximation:
    let approx = w
      .replace(/tion\b/g, 'ʃən')
      .replace(/sion\b/g, 'ʒən')
      .replace(/ing\b/g, 'ɪŋ')
      .replace(/ight\b/g, 'aɪt')
      .replace(/ight/g, 'aɪt')
      .replace(/ee/g, 'iː')
      .replace(/oo/g, 'uː')
      .replace(/th/g, 'θ')
      .replace(/sh/g, 'ʃ')
      .replace(/ch/g, 'tʃ')
      .replace(/ph/g, 'f')
      .replace(/qu/g, 'kw');

    // Add primary stress mark on multi-syllable word
    if (approx.length > 4 && !approx.startsWith('ˈ')) {
      approx = `ˈ${approx}`;
    }

    return approx;
  });

  return `/${phonetics.join(' ')}/`;
}

// ----------------- UNIFIED PHONETIC GENERATOR -----------------

export function generatePhonetic(text: string, lang: 'en' | 'ja'): string {
  if (!text || !text.trim()) return '';

  if (lang === 'ja') {
    return convertJapaneseToRomaji(text);
  }

  return convertEnglishToIpa(text);
}
