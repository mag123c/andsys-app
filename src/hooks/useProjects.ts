"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    if (auth.status === "loading") return;

    setIsLoading(true);
    setError(null);

    try {
      let result: Project[];

      if (auth.status === "authenticated") {
        result = await projectLocalRepository.getByUserId(auth.user.id);
      } else {
        result = await projectLocalRepository.getByGuestId(auth.guestId);
      }

      setProjects(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch projects"));
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [auth]
  );

  const updateProject = useCallback(
    async (id: string, data: UpdateProjectInput): Promise<Project> => {
      const updated = await projectLocalRepository.update(id, data);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
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
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
