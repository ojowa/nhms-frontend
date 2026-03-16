import api from '@/utils/api';
import { AuthResponse } from '@/types/auth';

export const login = async (credentials: any): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: { email: string; password: string; firstName: string; middleName?: string; lastName: string; nisNumber: string; phone: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const requestPasswordReset = async (emailOrNisNumber: string): Promise<void> => {
  await api.post('/auth/forgot-password', { emailOrNisNumber });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, newPassword });
};

export const logout = async (): Promise<void> => {
  await api.delete('/auth/logout');
};
