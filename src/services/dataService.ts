import { request } from './apiClient';
import { CardItem } from '@/components/FlashcardViewer';
import { SubmissionItem } from '@/components/TeamFeed';
import { AuthUser } from '@/components/AuthModal';

export interface LanguageItem {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  speech_locale: string;
}

export interface PromptItem {
  id: number;
  language_code: string;
  card_id: number | null;
  prompt_question: string;
  hint: string;
  card_text?: string;
}

export interface LeaderboardUser {
  user_name: string;
  current_streak: number;
  total_submissions: number;
  last_active_date: string | null;
  xp_points: number;
}

export interface AppDataResponse {
  languages: LanguageItem[];
  currentLang: LanguageItem;
  cards: CardItem[];
  prompt: PromptItem | null;
  recentSubmissions: SubmissionItem[];
  leaderboard: LeaderboardUser[];
  currentUser: AuthUser | null;
  isGuest: boolean;
}

export const dataService = {
  async getAppData(lang: string = 'en'): Promise<AppDataResponse> {
    return request<AppDataResponse>(`/api/data?lang=${lang}`, {
      cache: 'no-store',
    });
  },
};
