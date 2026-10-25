import { request } from './apiClient';
import { JapaneseCharacterRecord } from '@/lib/db';

export interface JapaneseCharactersResponse {
  success: boolean;
  total: number;
  characters: JapaneseCharacterRecord[];
}

export const japaneseCharactersService = {
  async getCharacters(params?: {
    type?: 'hiragana' | 'katakana' | 'kanji';
    sub_category?: string;
    level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    search?: string;
  }): Promise<JapaneseCharactersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.sub_category) searchParams.set('sub_category', params.sub_category);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<JapaneseCharactersResponse>(`/api/japanese-characters${query}`);
  },
};
