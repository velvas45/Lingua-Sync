import { request } from './apiClient';

export interface PhoneticResponse {
  success: boolean;
  text: string;
  phonetic: string;
  furigana_html?: string | null;
  source?: string;
}

export const phoneticService = {
  async resolvePhonetic(text: string, lang: string = 'en'): Promise<PhoneticResponse> {
    const params = new URLSearchParams({
      text,
      lang,
    });
    return request<PhoneticResponse>(`/api/phonetic?${params.toString()}`);
  },
};
