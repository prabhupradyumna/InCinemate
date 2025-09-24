import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getMe, loginAdmin, loginSuperAdmin, logout, refreshToken } from '../services/apiClient';

type User = {
  userId: number;
  email: string;
  role: string;
  tenantId?: string | null;
} | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  login: (email: string, password: string, role?: 'admin' | 'super_admin') => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const bootstrap = useCallback(async () => {
    try {
      // try current access token; if fails, try refresh
      try {
        const res = await getMe();
        setUser(res?.data || null);
      } catch {
        const ok = await refreshToken();
        if (ok) {
          const res = await getMe();
          setUser(res?.data || null);
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Proactive background refresh every 14 minutes, skip if just refreshed in last 60s
  useEffect(() => {
    const INTERVAL_MS = 14 * 60 * 1000;
    let lastRefreshed = 0;
    const id = setInterval(async () => {
      if (!localStorage.getItem('accessToken')) return;
      if (Date.now() - lastRefreshed < 60 * 1000) return;
      try {
        const ok = await refreshToken();
        if (ok) lastRefreshed = Date.now();
      } catch {}
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const doLogin = useCallback(async (email: string, password: string, role: 'admin' | 'super_admin' = 'admin') => {
    setLoading(true);
    try {
      if (role === 'super_admin') {
        await loginSuperAdmin({ email, password });
      } else {
        await loginAdmin({ email, password });
      }
      const res = await getMe();
      setUser(res?.data || null);
      return (res?.data || null) as User;
    } finally {
      setLoading(false);
    }
  }, []);

  const doLogout = useCallback(async () => {
    await logout();
    setUser(null);
    try {
      delete (api.defaults.headers as any).common?.Authorization;
    } catch {}
    try {
      const base = (import.meta as any)?.env?.VITE_APP_BASE_NAME || '/';
      const target = `${base.replace(/\/$/, '/') }pages/login`;
      window.location.replace(target);
    } catch {
      window.location.href = '/pages/login';
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login: doLogin, logout: doLogout }), [user, loading, doLogin, doLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


