"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import type { SharedChapterView as SharedChapterViewType } from "@/repositories/types";
import {
  SharedChapterView,
  SharePasswordForm,
  ShareExpiredView,
} from "@/components/features/share";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

type PageState =
  | { type: "loading" }
  | { type: "password_required" }
  | { type: "expired" }
  | { type: "not_found" }
  | { type: "success"; data: SharedChapterViewType };

export default function SharePage({ params }: SharePageProps) {
  const { token } = use(params);
  const [state, setState] = useState<PageState>({ type: "loading" });

  const fetchData = useCallback(async (password?: string) => {
    try {
      const url = `/api/share/${token}`;
      const options: RequestInit = {
        method: password ? "POST" : "GET",
        headers: password
          ? { "Content-Type": "application/json" }
          : undefined,
        body: password ? JSON.stringify({ password }) : undefined,
      };

      const response = await fetch(url, options);
      const result = await response.json();

      if (result.success) {
        setState({
          type: "success",
          data: {
            ...result.data,
            expiresAt: result.data.expiresAt
              ? new Date(result.data.expiresAt)
              : null,
            createdAt: new Date(result.data.createdAt),
          },
        });
        return true;
      }

      switch (result.error) {
        case "PASSWORD_REQUIRED":
          setState({ type: "password_required" });
          return false;
        case "INVALID_PASSWORD":
          return false;
        case "LINK_EXPIRED":
          setState({ type: "expired" });
          return false;
        default:
          setState({ type: "not_found" });
          return false;
      }
    } catch {
      setState({ type: "not_found" });
      return false;
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    return await fetchData(password);
  };

  if (state.type === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.type === "password_required") {
    return <SharePasswordForm onSubmit={handlePasswordSubmit} />;
  }

  if (state.type === "expired" || state.type === "not_found") {
    return <ShareExpiredView />;
  }

  return (
    <SharedChapterView
      projectTitle={state.data.projectTitle}
      chapterTitle={state.data.chapterTitle}
      chapterNumber={state.data.chapterNumber}
      content={state.data.content}
      characterCount={state.data.characterCount}
      expiresAt={state.data.expiresAt}
      createdAt={state.data.createdAt}
    />
  );
}
