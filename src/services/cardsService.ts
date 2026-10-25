import { request } from './apiClient';

export interface CreateCardPayload {
  language_code: string;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech?: string;
  level?: string;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
}

export interface UpdateCardPayload {
  id: number;
  primary_text: string;
  phonetic: string | null;
  furigana_html: string | null;
  meaning_id: string;
  part_of_speech?: string;
  level?: string;
  example_source: string;
  example_meaning: string;
  audio_guide: string | null;
}

export const cardsService = {
  async createCard(payload: CreateCardPayload): Promise<{ success: boolean; cardId: number }> {
    return request<{ success: boolean; cardId: number }>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCard(payload: UpdateCardPayload): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/cards', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteCard(id: number): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/cards?id=${id}`, {
      method: 'DELETE',
    });
  },
};
