"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Provider } from "@supabase/supabase-js";
import type { AuthState, User } from "@/repositories/types/user";
import { createClient } from "@/storage/remote/client";
import { getOrCreateGuestId, clearGuestId, getGuestId, migrateGuestDataToUser } from "@/lib/guest";
import { syncEngine } from "@/sync";

type OAuthProvider = Extract<Provider, "google" | "discord">;

interface OAuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  auth: AuthState;
  signInWithOAuth: (provider: OAuthProvider) => Promise<OAuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();

    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? "",
          displayName: session.user.user_metadata?.full_name
            ?? session.user.user_metadata?.name
            ?? session.user.user_metadata?.global_name
            ?? session.user.user_metadata?.display_name
            ?? null,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(),
        };
        setAuth({ status: "authenticated", user });
      } else {
        const guestId = await getOrCreateGuestId();
        setAuth({ status: "guest", guestId });
      }
    }

    initAuth().catch(console.error);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? "",
          displayName: session.user.user_metadata?.full_name
            ?? session.user.user_metadata?.name
            ?? session.user.user_metadata?.global_name
            ?? session.user.user_metadata?.display_name
            ?? null,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(),
        };

        // 게스트 데이터 마이그레이션
        const currentGuestId = await getGuestId();
        if (currentGuestId) {
          const migrationResult = await migrateGuestDataToUser(currentGuestId, user.id);
          if (migrationResult.success && migrationResult.migratedProjects > 0) {
            // 마이그레이션된 데이터를 서버로 동기화
            syncEngine.syncAll().catch(console.error);
          }
        }

        setAuth({ status: "authenticated", user });
      } else if (event === "SIGNED_OUT") {
        const guestId = await getOrCreateGuestId();
        setAuth({ status: "guest", guestId });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider): Promise<OAuthResult> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await clearGuestId();
    const guestId = await getOrCreateGuestId();
    setAuth({ status: "guest", guestId });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
