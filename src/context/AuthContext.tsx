import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, clearStoredAuth, getStoredToken, storeAuth } from '@/services/api';
import {
  getProfile,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  register as registerRequest,
  type AuthUser,
} from '@/services/authService';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);
        storeAuth(token, profile);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredAuth();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onAuthExpired = () => {
      clearStoredAuth();
      setUser(null);
    };
    window.addEventListener('speakora:auth-expired', onAuthExpired);
    return () => window.removeEventListener('speakora:auth-expired', onAuthExpired);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const result = await loginRequest(email, password);
      setUser(result.user);
    },
    async loginWithGoogle(credential) {
      const result = await loginWithGoogleRequest(credential);
      setUser(result.user);
    },
    async register(name, email, password) {
      const result = await registerRequest(name, email, password);
      setUser(result.user);
    },
    logout() {
      clearStoredAuth();
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
