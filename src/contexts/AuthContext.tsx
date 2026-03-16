'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthCredentials } from '@/types/auth';
import api from '@/utils/api';
import { setAuthCallbacks } from '@/utils/authUtils';
import { login as loginService, logout as logoutService } from '@/services/authService';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<User>;
  logout: () => void;
  setAccessToken: (token: string) => void;
  resetInactivityTimer: () => void; // New: Function to reset the inactivity timer
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(token: string): Promise<User | null> {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/profile/me');
    return response.data;
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

  const logout = useCallback(async () => { // Make it async
    // Attempt to call backend logout service, but don't block frontend logout if it fails
    try {
      await logoutService();
    } catch (error) {
      console.error('Failed to log out on backend:', error);
      // Optionally show a snackbar message here that backend logout failed
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Also remove user from localStorage
    delete api.defaults.headers.common['Authorization'];
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    // Redirect to login page after logout
    window.location.href = '/'; 
  }, []);  const resetInactivityTimer = useCallback(() => {
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
    // Only set up listeners if user is logged in
    if (accessToken) {
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      window.addEventListener('click', resetInactivityTimer);
      // Initial start of the timer
      resetInactivityTimer();
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      // Clear timeout on unmount or accessToken change
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


            localStorage.setItem('user', JSON.stringify(fetchedUser)); // Store user in localStorage


            api.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;


          } else {


            // The token is invalid, so log the user out by clearing the state


            logout();


          }


        }


        setLoading(false);


      };


  


      initializeAuth();


    }, []);  // Set the auth callbacks for non-component files
  useEffect(() => {
    const logoutCallback = async () => { // Make this async too
      await logout(); // Call the updated async logout
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
      localStorage.setItem('user', JSON.stringify(user)); // Store user in localStorage
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return user;
    } catch (err) {
      const error = err as AxiosError;
      console.error('[Frontend] Login failed in AuthContext:', error);
      // Let the component handle the error display
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
