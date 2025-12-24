"use client";

import { useState, useEffect, useCallback } from "react";
import type { Version, VersionEntityType } from "@/repositories/types";
import { versionLocalRepository } from "@/storage/local/version.local";

interface UseVersionHistoryReturn {
  versions: Version[];
  isLoading: boolean;
  error: Error | null;
  selectedVersion: Version | null;
  selectVersion: (version: Version | null) => void;
  refresh: () => Promise<void>;
}

export function useVersionHistory(
  entityType: VersionEntityType,
  entityId: string | null
): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!entityId) {
      setVersions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await versionLocalRepository.getByEntity(
        entityType,
        entityId
      );
      setVersions(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch versions")
      );
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const selectVersion = useCallback((version: Version | null) => {
    setSelectedVersion(version);
  }, []);

  return {
    versions,
    isLoading,
    error,
    selectedVersion,
    selectVersion,
    refresh: fetchVersions,
  };
}

/**
 * 버전을 생성하는 유틸리티 함수
 */
export async function createVersion(
  projectId: string,
  entityType: VersionEntityType,
  entityId: string,
  snapshot: Record<string, unknown>,
  previousSnapshot?: Record<string, unknown>
): Promise<Version> {
  return versionLocalRepository.create({
    projectId,
    entityType,
    entityId,
    snapshot,
    previousSnapshot,
  });
}

/**
 * 엔티티의 모든 버전을 삭제하는 유틸리티 함수
 */
export async function deleteVersionsByEntity(
  entityType: VersionEntityType,
  entityId: string
): Promise<void> {
  return versionLocalRepository.deleteByEntity(entityType, entityId);
}
