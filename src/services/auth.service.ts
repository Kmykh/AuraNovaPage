import { apiClient } from '../lib/api-client';
import { LoginRequest, AuthResponse } from '../types/auth';

export const AuthService = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/Auth/login', request);
    return data;
  }
};
