"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage 값을 안전하게 읽고 쓰는 훅
 * SSR/hydration 안전 - useSyncExternalStore 사용
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return JSON.stringify(defaultValue);
    const stored = localStorage.getItem(key);
    return stored ?? JSON.stringify(defaultValue);
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(defaultValue);
  }, [defaultValue]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          onStoreChange();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    },
    [key]
  );

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: T) => {
      localStorage.setItem(key, JSON.stringify(value));
      // 같은 탭에서는 storage 이벤트가 발생하지 않으므로 수동 dispatch
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key]
  );

  return [JSON.parse(storedValue) as T, setValue];
}

/**
 * boolean 값 전용 간소화 버전
 */
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean
): [boolean, (value: boolean) => void] {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored === "true";
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback(() => {
    return defaultValue;
  }, [defaultValue]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          onStoreChange();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    },
    [key]
  );

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: boolean) => {
      localStorage.setItem(key, String(value));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key]
  );

  return [storedValue, setValue];
}
