"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, CreateProjectInput } from "@/repositories/types";
import { projectLocalRepository } from "@/storage/local/project.local";
import { useAuth } from "@/hooks/useAuth";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  createProject: (data: CreateProjectInput) => Promise<Project>;
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

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await projectLocalRepository.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
