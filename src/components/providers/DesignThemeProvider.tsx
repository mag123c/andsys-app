"use client";

import { createContext, useContext, useEffect, useCallback } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { DesignTheme } from "@/repositories/types";

interface DesignThemeContextValue {
  designTheme: DesignTheme;
  setDesignTheme: (theme: DesignTheme) => Promise<void>;
  isLoading: boolean;
}

const DesignThemeContext = createContext<DesignThemeContextValue | null>(null);

interface DesignThemeProviderProps {
  children: React.ReactNode;
}

export function DesignThemeProvider({ children }: DesignThemeProviderProps) {
  const { settings, updateSettings, isLoading } = useUserSettings();

  // HTML 요소에 data-design-theme 속성 설정
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-design-theme", settings.designTheme);
  }, [settings.designTheme]);

  const setDesignTheme = useCallback(
    async (theme: DesignTheme) => {
      await updateSettings({ designTheme: theme });
    },
    [updateSettings]
  );

  return (
    <DesignThemeContext.Provider
      value={{
        designTheme: settings.designTheme,
        setDesignTheme,
        isLoading,
      }}
    >
      {children}
    </DesignThemeContext.Provider>
  );
}

export function useDesignTheme(): DesignThemeContextValue {
  const context = useContext(DesignThemeContext);
  if (!context) {
    throw new Error("useDesignTheme must be used within a DesignThemeProvider");
  }
  return context;
}
