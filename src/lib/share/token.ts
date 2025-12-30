import { nanoid } from "nanoid";

export function generateShareToken(): string {
  return nanoid(21);
}

export function getShareUrl(token: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://4ndsys.net");
  return `${baseUrl}/s/${token}`;
}
