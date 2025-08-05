// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, type ReactNode, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/auth';
import { getToken, removeToken, setToken } from '../utils/auth';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null; // Add token to the context
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Update the token setter to also update state
  const setTokenWrapper = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const loadUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      removeToken();
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { access_token } = await authService.login({ email, password });
      setTokenWrapper(access_token);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { access_token } = await authService.register({ email, password });
      setTokenWrapper(access_token);
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Now exposing token
        isAuthenticated: !!user,
        isLoading,
        isAuthLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}