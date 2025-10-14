"use client";

import type React from "react";

import { useAuth } from "./auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("customer" | "admin" | "super-admin")[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ["customer", "admin", "super-admin"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }
      if (!allowedRoles.includes(user.role)) {
        if (user.role === "super-admin") router.push("/super-admin");
        else if (user.role === "admin") router.push("/admin");
        else router.push("/");
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
