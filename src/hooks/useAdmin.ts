"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { isAdminEmail } from "@/lib/admin";

/**
 * 현재 사용자가 어드민인지 확인하는 훅
 */
export function useAdmin() {
  const { auth } = useAuth();

  const isLoading = auth.status === "loading";
  const isAuthenticated = auth.status === "authenticated";
  const email = isAuthenticated ? auth.user.email : null;
  const isAdmin = isAuthenticated && isAdminEmail(email);

  return {
    isAdmin,
    isLoading,
    isAuthenticated,
  };
}
