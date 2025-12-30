import type { ShareExpiration } from "@/repositories/types";

export function getExpirationDate(expiresIn: ShareExpiration): Date | null {
  const now = new Date();

  switch (expiresIn) {
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "never":
      return null;
  }
}

export function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

export function formatTimeRemaining(expiresAt: Date | null): string {
  if (!expiresAt) return "무제한";

  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return "만료됨";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 후 만료`;
  }
  if (hours > 0) {
    return `${hours}시간 후 만료`;
  }

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}분 후 만료`;
}

export const EXPIRATION_OPTIONS: { value: ShareExpiration; label: string }[] = [
  { value: "1h", label: "1시간" },
  { value: "24h", label: "24시간" },
  { value: "7d", label: "7일" },
  { value: "30d", label: "30일" },
  { value: "never", label: "무제한" },
];
