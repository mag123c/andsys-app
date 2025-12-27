"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/repositories/types";
import { projectLocalRepository } from "@/storage/local/project.local";
import { chapterLocalRepository } from "@/storage/local/chapter.local";
import { synopsisLocalRepository } from "@/storage/local/synopsis.local";
import { characterLocalRepository } from "@/storage/local/character.local";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";
import { versionLocalRepository } from "@/storage/local/version.local";
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
    // 관련 데이터 cascade delete
    await chapterLocalRepository.deleteByProjectId(id);
    await synopsisLocalRepository.deleteByProjectId(id);
    await versionLocalRepository.deleteByProjectId(id);
    await relationshipLocalRepository.deleteByProjectId(id);
    await characterLocalRepository.deleteByProjectId(id);
    await projectLocalRepository.delete(id);
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
