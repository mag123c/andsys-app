"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ShareLinkList } from "@/components/features/share";
import type { SharedChapterListItem } from "@/repositories/types";

export default function SharesSettingsPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [items, setItems] = useState<SharedChapterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = auth.status === "authenticated";
  const isAuthLoading = auth.status === "loading";

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/share/chapters");
      const result = await response.json();

      if (result.success) {
        setItems(
          result.data.map((item: SharedChapterListItem) => ({
            ...item,
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
            createdAt: new Date(item.createdAt),
          }))
        );
      }
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, isAuthLoading, router, fetchItems]);

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/share/chapters/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      throw new Error("Failed to delete");
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto">
      <nav className="mb-4">
        <Link
          href="/settings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          설정
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="text-xl font-bold">공유 링크 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          생성한 공유 링크를 관리합니다.
        </p>
      </header>

      <ShareLinkList items={items} onDelete={handleDelete} />
    </div>
  );
}
