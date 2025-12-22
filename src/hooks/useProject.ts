"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, UpdateProjectInput } from "@/repositories/types";
import { projectLocalRepository } from "@/storage/local/project.local";

interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
  updateProject: (data: UpdateProjectInput) => Promise<Project>;
  refetch: () => Promise<void>;
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await projectLocalRepository.getById(projectId);
      setProject(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch project")
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const updateProject = useCallback(
    async (data: UpdateProjectInput): Promise<Project> => {
      const updated = await projectLocalRepository.update(projectId, data);
      setProject(updated);
      return updated;
    },
    [projectId]
  );

  return {
    project,
    isLoading,
    error,
    updateProject,
    refetch: fetchProject,
  };
}
