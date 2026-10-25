import { request } from './apiClient';

export interface SubmitChallengePayload {
  userName: string;
  languageCode: string;
  promptId: number;
  textResponse: string;
  speakingPracticed: boolean;
}

export interface SubmitChallengeResponse {
  success: boolean;
  earnedXp: number;
  isRepeat: boolean;
  streak: number;
  error?: string;
}

export interface ToggleLikeResponse {
  success: boolean;
  liked: boolean;
  likes: number;
}

export const communityService = {
  async submitChallenge(payload: SubmitChallengePayload): Promise<SubmitChallengeResponse> {
    return request<SubmitChallengeResponse>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async toggleLike(submissionId: number): Promise<ToggleLikeResponse> {
    return request<ToggleLikeResponse>('/api/like', {
      method: 'POST',
      body: JSON.stringify({ submissionId }),
    });
  },
};
