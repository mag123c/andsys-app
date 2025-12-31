"use client";

import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/repositories/types";
import { db } from "@/storage/local/db";
import { projectLocalRepository } from "@/storage/local/project.local";
import { useAuth } from "@/hooks/useAuth";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  createProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const { auth } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  // useLiveQuery: IndexedDB 변경 시 자동으로 re-render
  // pullFromServer()가 IndexedDB에 데이터를 추가하면 자동으로 UI 갱신
  const projects = useLiveQuery(
    async () => {
      if (auth.status === "loading") {
        return undefined; // 로딩 중
      }

      try {
        setError(null);
        let result: Project[];

        if (auth.status === "authenticated") {
          result = await projectLocalRepository.getByUserId(auth.user.id);
        } else {
          result = await projectLocalRepository.getByGuestId(auth.guestId);
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch projects"));
        return [];
      }
    },
    [auth] // auth 변경 시 재실행
  );

  const isLoading = projects === undefined;

  const createProject = useCallback(
    async (data: CreateProjectInput): Promise<Project> => {
      if (auth.status === "loading") {
        throw new Error("Auth is loading");
      }

      const owner =
        auth.status === "authenticated"
          ? { userId: auth.user.id }
          : { guestId: auth.guestId };

      const project = await projectLocalRepository.create(data, owner);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return project;
    },
    [auth]
  );

  const updateProject = useCallback(
    async (id: string, data: UpdateProjectInput): Promise<Project> => {
      const updated = await projectLocalRepository.update(id, data);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return updated;
    },
    []
  );

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    // 트랜잭션으로 관련 데이터 cascade delete (원자성 보장)
    await db.transaction(
      "rw",
      [db.projects, db.chapters, db.synopses, db.characters, db.relationships, db.versions],
      async () => {
        await db.chapters.where("projectId").equals(id).delete();
        await db.synopses.where("projectId").equals(id).delete();
        await db.versions.where("projectId").equals(id).delete();
        await db.relationships.where("projectId").equals(id).delete();
        await db.characters.where("projectId").equals(id).delete();

        // soft delete
        await db.projects.update(id, {
          status: "deleted",
          deletedAt: new Date(),
          updatedAt: new Date(),
          syncStatus: "pending",
        });
      }
    );
    // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
  }, []);

  // refetch는 useLiveQuery에서는 불필요하지만 인터페이스 호환성 유지
  const refetch = useCallback(async () => {
    // useLiveQuery가 자동으로 데이터를 동기화하므로 no-op
  }, []);

  return {
    projects: projects ?? [],
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  };
}
