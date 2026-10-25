import { request } from './apiClient';
import { KanjiVgData } from '@/app/api/kanjivg/route';

export const kanjiVgService = {
  async getKanjiVgData(char: string): Promise<KanjiVgData> {
    const params = new URLSearchParams({ char });
    return request<KanjiVgData>(`/api/kanjivg?${params.toString()}`);
  },
};
