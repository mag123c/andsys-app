"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ShareLinkList } from "@/components/features/share";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SharedChapterListItem } from "@/repositories/types";

interface ShareLinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareLinksModal({ open, onOpenChange }: ShareLinksModalProps) {
  const { auth } = useAuth();
  const [items, setItems] = useState<SharedChapterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = auth.status === "authenticated";

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
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
    if (open && isAuthenticated) {
      fetchItems();
    }
  }, [open, isAuthenticated, fetchItems]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>공유 링크 관리</DialogTitle>
          <DialogDescription>
            생성한 공유 링크를 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ShareLinkList items={items} onDelete={handleDelete} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
