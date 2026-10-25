import { request } from './apiClient';
import { AnalysisResult } from '@/lib/grammarAnalyzer';

export interface SubmitChallengePayload {
  userName: string;
  languageCode: string;
  promptId: number;
  textResponse: string;
  speakingPracticed: boolean;
  clientLocalHour?: number;
  completionSeconds?: number;
}

export interface SubmitChallengeResponse {
  success: boolean;
  submissionId: number;
  earnedXp: number;
  durationSeconds: number;
  timeTierLabel: string;
  breakdown: {
    base: number;
    voice: number;
    grammarBonus: number;
    multiplier: number;
  };
  analysis: AnalysisResult;
  streak: number;
  error?: string;
  suggestions?: string[];
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
