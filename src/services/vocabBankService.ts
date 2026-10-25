import { request } from './apiClient';

export interface VocabBankRandomItem {
  id: number;
  language_code: string;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech: string;
  level: string;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
}

export interface VocabBankResponse {
  items: VocabBankRandomItem[];
  count: number;
}

export const vocabBankService = {
  async getRandomVocab(
    lang: string,
    batch: number = 20,
    exclude: string[] = []
  ): Promise<VocabBankResponse> {
    const params = new URLSearchParams({
      lang,
      batch: String(batch),
    });

    if (exclude.length > 0) {
      params.set('exclude', exclude.slice(-30).map(encodeURIComponent).join(','));
    }

    return request<VocabBankResponse>(`/api/vocabulary-bank/random?${params.toString()}`);
  },
};
