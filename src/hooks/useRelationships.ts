"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Relationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from "@/repositories/types";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";

interface UseRelationshipsReturn {
  relationships: Relationship[];
  isLoading: boolean;
  error: Error | null;
  createRelationship: (
    data: Omit<CreateRelationshipInput, "projectId">
  ) => Promise<Relationship>;
  updateRelationship: (
    id: string,
    data: UpdateRelationshipInput
  ) => Promise<Relationship>;
  deleteRelationship: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRelationships(projectId: string): UseRelationshipsReturn {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRelationships = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        await relationshipLocalRepository.getByProjectId(projectId);
      setRelationships(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch relationships")
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const createRelationship = useCallback(
    async (
      data: Omit<CreateRelationshipInput, "projectId">
    ): Promise<Relationship> => {
      const relationship = await relationshipLocalRepository.create({
        ...data,
        projectId,
      });
      setRelationships((prev) => [...prev, relationship]);
      return relationship;
    },
    [projectId]
  );

  const updateRelationship = useCallback(
    async (id: string, data: UpdateRelationshipInput): Promise<Relationship> => {
      const updated = await relationshipLocalRepository.update(id, data);
      setRelationships((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      return updated;
    },
    []
  );

  const deleteRelationship = useCallback(async (id: string): Promise<void> => {
    await relationshipLocalRepository.delete(id);
    setRelationships((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    relationships,
    isLoading,
    error,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    refetch: fetchRelationships,
  };
}
