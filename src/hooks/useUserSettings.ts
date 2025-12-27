"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserSettings, UpdateUserSettingsInput } from "@/repositories/types";
import { DEFAULT_USER_SETTINGS } from "@/repositories/types";
import { settingsLocalRepository } from "@/storage/local/settings.local";
import { useAuth } from "@/hooks/useAuth";

interface UseUserSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (data: UpdateUserSettingsInput) => Promise<UserSettings>;
  resetSettings: () => Promise<UserSettings>;
}

export function useUserSettings(): UseUserSettingsReturn {
  const { auth } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    if (auth.status === "loading") return;

    setIsLoading(true);
    setError(null);

    try {
      const owner =
        auth.status === "authenticated"
          ? { userId: auth.user.id }
          : { guestId: auth.guestId };

      const result = await settingsLocalRepository.get(owner);
      setSettings(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch settings"));
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (data: UpdateUserSettingsInput): Promise<UserSettings> => {
      if (auth.status === "loading") {
        throw new Error("Auth is loading");
      }

      const owner =
        auth.status === "authenticated"
          ? { userId: auth.user.id }
          : { guestId: auth.guestId };

      const updated = await settingsLocalRepository.update(owner, data);
      setSettings(updated);
      return updated;
    },
    [auth]
  );

  const resetSettings = useCallback(async (): Promise<UserSettings> => {
    if (auth.status === "loading") {
      throw new Error("Auth is loading");
    }

    const owner =
      auth.status === "authenticated"
        ? { userId: auth.user.id }
        : { guestId: auth.guestId };

    const reset = await settingsLocalRepository.reset(owner);
    setSettings(reset);
    return reset;
  }, [auth]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
  };
}
