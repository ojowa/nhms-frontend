/**
 * Authentication Service
 * Aligned with backend auth routes and validation schemas
 */

import { apiClient } from '@/utils/api-client';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  AuthResponse,
  User,
} from '@/types/auth';

/**
 * Login user with email/NIS and password
 * POST /api/auth/login
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/login', credentials);
};

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * Validation rules:
 * - nisNumber: min 6 characters
 * - email: valid email format
 * - password: min 8 characters
 * - firstName: min 1, max 50 characters
 * - lastName: min 1, max 50 characters
 * - phone: valid international phone format
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/register', userData);
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/auth/forgot-password', data);
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 * 
 * Validation rules:
 * - newPassword: min 8 characters
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/auth/reset-password', data);
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 * 
 * Validation rules:
 * - refreshToken: valid UUID format
 */
export const refreshAccessToken = async (data: RefreshTokenRequest): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/refresh-token', data);
};

/**
 * Logout user
 * DELETE /api/auth/logout
 */
export const logout = async (): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>('/auth/logout');
};

/**
 * Get current user profile
 * GET /api/profile/me
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiClient.get<User>('/profile/me');
};

/**
 * Store tokens in localStorage
 */
export const storeAuthTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

/**
 * Clear stored tokens
 */
export const clearAuthTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};
