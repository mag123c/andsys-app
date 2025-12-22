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

interface AuthContextValue {
  auth: AuthState;
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

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await clearGuestId();
    const guestId = await getOrCreateGuestId();
    setAuth({ status: "guest", guestId });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, signOut }}>
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
