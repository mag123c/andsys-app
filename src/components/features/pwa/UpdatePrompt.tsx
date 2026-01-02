"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setShowUpdate(true);
            }
          });
        });
      })
      .catch(() => {
        // SW 미지원 환경에서 무시
      });
  }, []);

  const handleUpdate = () => {
    // skipWaiting: true 설정으로 자동 활성화됨 (sw.ts)
    // postMessage 불필요
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-3 z-50">
      <RefreshCw className="h-4 w-4" />
      <span className="text-sm">새 버전이 있습니다</span>
      <Button size="sm" variant="secondary" onClick={handleUpdate}>
        업데이트
      </Button>
    </div>
  );
}
