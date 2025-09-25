"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, loginAdmin, loginSuperAdmin, logoutApi, refreshToken } from "@/lib/api";

type Role = "customer" | "admin" | "super-admin";

interface User {
  id: string | number;
  email: string;
  role: Role;
  tenantId?: string | number | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUser(u: any): User {
  const roleMap: Record<string, Role> = { super_admin: "super-admin", admin: "admin", customer: "customer" };
  return {
    id: u.userId ?? u.id,
    email: u.email,
    role: roleMap[u.role] ?? (u.role as Role),
    tenantId: u.tenantId ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      try {
        const res: any = await getMe();
        if (res?.data) {
          setUser(mapBackendUser(res.data));
          return;
        }
      } catch {}
      const ok = await refreshToken();
      if (ok) {
        try {
          const res2: any = await getMe();
          if (res2?.data) setUser(mapBackendUser(res2.data));
        } catch {}
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string, role: Role) => {
    if (role === "super-admin") {
      await loginSuperAdmin({ email, password });
    } else if (role === "admin") {
      await loginAdmin({ email, password });
    } else {
      await refreshToken();
    }
    const res: any = await getMe();
    if (res?.data) {
      const mapped = mapBackendUser(res.data);
      setUser(mapped);
      try { localStorage.setItem("screenlease_user", JSON.stringify(mapped)); } catch {}
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    try { localStorage.removeItem("screenlease_user"); } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
