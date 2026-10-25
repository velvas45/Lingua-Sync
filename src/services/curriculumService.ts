import { request } from './apiClient';
import { LevelTrack, GrammarLesson } from '@/lib/db';

export interface CurriculumResponse {
  success: boolean;
  levels: LevelTrack[];
  lessons: GrammarLesson[];
}

export const curriculumService = {
  async getCurriculum(lang: string = 'en', level?: string): Promise<CurriculumResponse> {
    const params = new URLSearchParams({ lang });
    if (level && level !== 'all') {
      params.set('level', level);
    }
    return request<CurriculumResponse>(`/api/curriculum?${params.toString()}`);
  },
};
