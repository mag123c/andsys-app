import { db } from "@/storage/local/db";

const GUEST_ID_KEY = "guestId";

export async function getGuestId(): Promise<string | null> {
  const setting = await db.settings.get(GUEST_ID_KEY);
  return (setting?.value as string) ?? null;
}

export async function getOrCreateGuestId(): Promise<string> {
  const existing = await getGuestId();
  if (existing) {
    return existing;
  }

  const guestId = crypto.randomUUID();
  await db.settings.put({ key: GUEST_ID_KEY, value: guestId });
  return guestId;
}

export async function clearGuestId(): Promise<void> {
  await db.settings.delete(GUEST_ID_KEY);
}
