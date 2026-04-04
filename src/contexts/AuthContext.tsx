'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthCredentials } from '@/types/auth';
import { apiClient } from '@/utils/api-client';
import { setAuthCallbacks } from '@/utils/authUtils';
import { login as loginService, logout as logoutService } from '@/services/authService';
import { ApiError } from '@/utils/api-client';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<User>;
  logout: () => void;
  setAccessToken: (token: string) => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(token: string): Promise<User | null> {
  try {
    return await apiClient.get<User>('/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Failed to log out on backend:', error);
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    window.location.href = '/';
  }, []);

  const resetInactivityTimer = useCallback(() => {
    setInactivityTimeout((prevTimeout) => {
      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }
      if (accessToken) {
        return setTimeout(logout, INACTIVITY_LIMIT);
      }
      return null;
    });
  }, [accessToken, logout]);

  useEffect(() => {
    if (accessToken) {
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
      resetInactivityTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      setInactivityTimeout((prevTimeout) => {
        if (prevTimeout) {
          clearTimeout(prevTimeout);
        }
        return null;
      });
    };
  }, [accessToken, resetInactivityTimer]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken) {
        const fetchedUser = await fetchUserProfile(storedAccessToken);
        if (fetchedUser) {
          setUser(fetchedUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken ?? null);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const logoutCallback = async () => {
      await logout();
      window.location.href = '/';
    };
    setAuthCallbacks(setAccessToken, logoutCallback);
  }, [setAccessToken, logout]);

  const login = async (credentials: AuthCredentials) => {
    try {
      const { user, accessToken, refreshToken } = await loginService(credentials);
      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      const error = err as ApiError;
      console.error('[Frontend] Login failed in AuthContext:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, loading, login, logout, setAccessToken, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
