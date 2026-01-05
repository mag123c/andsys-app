"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function UpdatePrompt() {
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
              // 토스트 알림 후 1.5초 뒤 자동 리로드
              toast.info("새 버전으로 업데이트합니다...", {
                duration: 1500,
              });
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          });
        });
      })
      .catch(() => {
        // SW 미지원 환경에서 무시
      });
  }, []);

  // 자동 리로드이므로 UI 표시 불필요
  return null;
}
