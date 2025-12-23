"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { AuthState, User } from "@/repositories/types/user";
import { createClient } from "@/storage/remote/client";
import { getOrCreateGuestId, clearGuestId } from "@/lib/guest";

interface SignInResult {
  success: boolean;
  error?: string;
}

interface SignUpResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<SignUpResult>;
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
          displayName: session.user.user_metadata?.display_name ?? null,
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
          displayName: session.user.user_metadata?.display_name ?? null,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(),
        };
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

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<SignUpResult> => {
    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // 이메일 확인이 필요한 경우
    const needsEmailConfirmation = !data.session;
    return { success: true, needsEmailConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await clearGuestId();
    const guestId = await getOrCreateGuestId();
    setAuth({ status: "guest", guestId });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, signIn, signUp, signOut }}>
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
