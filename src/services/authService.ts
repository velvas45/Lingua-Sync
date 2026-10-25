import { request } from './apiClient';
import { AuthUser } from '@/components/AuthModal';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface UpdateProfilePayload {
  username: string;
  phone_number: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  error?: string;
}

export const authService = {
  async getMe(): Promise<{ user: AuthUser | null }> {
    return request<{ user: AuthUser | null }>('/api/auth/me', {
      cache: 'no-store',
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
