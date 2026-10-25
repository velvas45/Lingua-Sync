export interface AnalysisResult {
  isValid: boolean;
  score: number; // 0 to 100
  qualityBonusXp: number; // 0 or 5
  grammarFeedback: string;
  keywordMatched: boolean;
  matchedKeyword?: string;
  politenessLevel: string;
  suggestions: string[];
}

// Extract expected keywords from prompt question or hint (e.g. from 「挨拶」 or 'word')
export function extractTargetKeywords(promptText: string, hintText?: string): string[] {
  const combined = `${promptText} ${hintText || ''}`;
  const keywords: string[] = [];

  // Match Japanese quotes: 「...」 or （...）
  const jaQuoteMatches = combined.match(/[「（]([^」）]+)[」）]/g);
  if (jaQuoteMatches) {
    jaQuoteMatches.forEach((m) => {
      const clean = m.replace(/[「」（）]/g, '').trim();
      if (clean.length >= 2) keywords.push(clean);
    });
  }

  // Match English quotes or key words: "..." or '...'
  const enQuoteMatches = combined.match(/["']([^"']+)["']/g);
  if (enQuoteMatches) {
    enQuoteMatches.forEach((m) => {
      const clean = m.replace(/["']/g, '').trim();
      if (clean.length >= 3) keywords.push(clean.toLowerCase());
    });
  }

  return Array.from(new Set(keywords));
}

export function analyzeAnswer(
  text: string,
  lang: string,
  promptQuestion: string,
  promptHint?: string
): AnalysisResult {
  const trimmed = text.trim();
  const suggestions: string[] = [];
  let score = 70; // baseline
  let politenessLevel = 'Standar';

  const targetKeywords = extractTargetKeywords(promptQuestion, promptHint);
  let keywordMatched = false;
  let matchedKeyword: string | undefined;

  // Check keyword alignment
  if (targetKeywords.length > 0) {
    const found = targetKeywords.find((kw) =>
      lang === 'en'
        ? trimmed.toLowerCase().includes(kw.toLowerCase())
        : trimmed.includes(kw)
    );
    if (found) {
      keywordMatched = true;
      matchedKeyword = found;
      score += 15;
    } else {
      suggestions.push(
        `Cobalah sertakan kata kunci target tantangan: "${targetKeywords[0]}" ke dalam kalimat Anda.`
      );
    }
  } else {
    // If no explicit quote keyword, keyword check is auto-passed
    keywordMatched = true;
  }

  // ----------------- JAPANESE LINGUISTIC CHECK -----------------
  if (lang === 'ja') {
    // Length check
    if (trimmed.length < 6) {
      return {
        isValid: false,
        score: 20,
        qualityBonusXp: 0,
        grammarFeedback: 'Kalimat terlalu singkat. Tuliskan minimal 6 karakter untuk menyusun kalimat utuh.',
        keywordMatched: false,
        politenessLevel: 'Tidak Lengkap',
        suggestions: ['Gunakan struktur dasar: Subjek + Partikel + Predikat (misal: 私は〜です).'],
      };
    }

    // Particle check: は, が, を, に, で, と, も, から, まで
    const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'から', 'まで'];
    const hasParticle = particles.some((p) => trimmed.includes(p));
    if (hasParticle) {
      score += 10;
    } else {
      suggestions.push('Kalimat belum memiliki partikel tata bahasa penghubung (seperti は, を, に, atau で).');
    }

    // Politeness check (Teineigo)
    const isPolite = /です[。]?$|ます[。]?$|でした[。]?$|ました[。]?$|ません[。]?$/.test(trimmed);
    if (isPolite) {
      politenessLevel = 'Sopan (丁寧語 / Teineigo)';
      score += 5;
    } else {
      politenessLevel = 'Kasual (普通形 / Plain Form)';
    }

    // Punctuation check
    if (!trimmed.endsWith('。') && !trimmed.endsWith('！') && !trimmed.endsWith('？')) {
      suggestions.push('Tambahkan tanda titik Jepang (。) di akhir kalimat agar penulisan lebih sempurna.');
    }
  }

  // ----------------- ENGLISH LINGUISTIC CHECK -----------------
  if (lang === 'en') {
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Minimum words check
    if (words.length < 3) {
      return {
        isValid: false,
        score: 20,
        qualityBonusXp: 0,
        grammarFeedback: 'Kalimat terlalu singkat. Tuliskan minimal 3 kata lengkap (Subjek + Kata Kerja + Objek/Keterangan).',
        keywordMatched: false,
        politenessLevel: 'Tidak Lengkap',
        suggestions: ['Contoh pola lengkap: "I practice English every morning."'],
      };
    }

    // Capitalization of first letter
    if (/^[a-z]/.test(trimmed)) {
      suggestions.push('Awali huruf pertama kalimat dengan huruf kapital.');
    } else {
      score += 5;
    }

    // Lone "i" pronoun check
    if (/\bi\b/.test(trimmed)) {
      suggestions.push('Kata ganti "I" (saya) dalam bahasa Inggris harus selalu ditulis dengan huruf kapital.');
      score -= 5;
    }

    // Subject-Verb common mistakes
    if (/\b(he|she|it)\s+(like|go|want|have|do)\b/i.test(trimmed)) {
      suggestions.push('Perhatikan Subject-Verb Agreement: Subjek he/she/it membutuhkan akhiran kata kerja -s/-es (contoh: likes, goes, wants, has).');
      score -= 10;
    }

    if (/\b(they|we|you)\s+is\b/i.test(trimmed)) {
      suggestions.push('Gunakan "are" (bukan "is") untuk subjek jamak they/we/you.');
      score -= 10;
    }

    // Punctuation check
    if (!/[.!?]$/.test(trimmed)) {
      suggestions.push('Sertakan tanda baca penutup (. atau !) di akhir kalimat.');
    } else {
      score += 5;
    }

    politenessLevel = words.length >= 6 ? 'Lengkap & Alami' : 'Cukup Ringkas';
  }

  const finalScore = Math.min(100, Math.max(30, score));
  const qualityBonusXp = finalScore >= 80 ? 5 : 0;

  let feedback = 'Kalimat tersusun dengan baik dan memenuhi standar tata bahasa.';
  if (finalScore >= 90) {
    feedback = 'Luar biasa! Kalimat sangat alami, gramatikal, dan tepat sasaran.';
  } else if (finalScore < 70) {
    feedback = 'Jawaban diterima, perhatikan beberapa saran perbaikan untuk meningkatkan ketepatan tata bahasa.';
  }

  return {
    isValid: true,
    score: finalScore,
    qualityBonusXp,
    grammarFeedback: feedback,
    keywordMatched,
    matchedKeyword,
    politenessLevel,
    suggestions,
  };
}
