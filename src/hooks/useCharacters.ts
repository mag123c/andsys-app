"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import { characterLocalRepository } from "@/storage/local/character.local";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";

interface UseCharactersReturn {
  characters: Character[];
  isLoading: boolean;
  error: Error | null;
  createCharacter: (
    data: Omit<CreateCharacterInput, "projectId">
  ) => Promise<Character>;
  updateCharacter: (
    id: string,
    data: UpdateCharacterInput
  ) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
  reorderCharacters: (characterIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCharacters(projectId: string): UseCharactersReturn {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await characterLocalRepository.getByProjectId(projectId);
      setCharacters(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch characters")
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const createCharacter = useCallback(
    async (
      data: Omit<CreateCharacterInput, "projectId">
    ): Promise<Character> => {
      const character = await characterLocalRepository.create({
        ...data,
        projectId,
      });
      setCharacters((prev) => [...prev, character]);
      return character;
    },
    [projectId]
  );

  const updateCharacter = useCallback(
    async (id: string, data: UpdateCharacterInput): Promise<Character> => {
      const updated = await characterLocalRepository.update(id, data);
      setCharacters((prev) =>
        prev.map((ch) => (ch.id === id ? updated : ch))
      );
      return updated;
    },
    []
  );

  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    // 해당 캐릭터와 연결된 관계들도 함께 삭제
    await relationshipLocalRepository.deleteByCharacterId(id);
    await characterLocalRepository.delete(id);
    setCharacters((prev) => prev.filter((ch) => ch.id !== id));
  }, []);

  const reorderCharacters = useCallback(
    async (characterIds: string[]): Promise<void> => {
      await characterLocalRepository.reorder(projectId, characterIds);
      setCharacters((prev) => {
        const characterMap = new Map(prev.map((ch) => [ch.id, ch]));
        return characterIds
          .map((id, index) => {
            const character = characterMap.get(id);
            return character ? { ...character, order: index + 1 } : null;
          })
          .filter((ch): ch is Character => ch !== null);
      });
    },
    [projectId]
  );

  return {
    characters,
    isLoading,
    error,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    reorderCharacters,
    refetch: fetchCharacters,
  };
}
