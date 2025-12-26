"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * 현재 사용자가 어드민인지 확인하는 훅
 */
export function useAdmin() {
  const { auth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isAuthLoading = auth.status === "loading";
  const isAuthenticated = auth.status === "authenticated";

  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (!isAuthLoading) {
      checkAdmin();
    }
  }, [isAuthLoading, isAuthenticated]);

  return {
    isAdmin,
    isLoading: isAuthLoading || isChecking,
    isAuthenticated,
  };
}
