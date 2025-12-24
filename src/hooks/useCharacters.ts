"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import { characterLocalRepository } from "@/storage/local/character.local";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";
import { createVersion, deleteVersionsByEntity } from "./useVersionHistory";

function characterToSnapshot(character: Character): Record<string, unknown> {
  return {
    name: character.name,
    nickname: character.nickname,
    age: character.age,
    gender: character.gender,
    race: character.race,
    imageUrl: character.imageUrl,
    height: character.height,
    weight: character.weight,
    appearance: character.appearance,
    mbti: character.mbti,
    personality: character.personality,
    education: character.education,
    occupation: character.occupation,
    affiliation: character.affiliation,
    background: character.background,
    customFields: character.customFields,
  };
}

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
      // 이전 스냅샷 저장
      const existing = characters.find((ch) => ch.id === id);
      const previousSnapshot = existing
        ? characterToSnapshot(existing)
        : undefined;

      const updated = await characterLocalRepository.update(id, data);
      setCharacters((prev) =>
        prev.map((ch) => (ch.id === id ? updated : ch))
      );

      // 버전 생성 (백그라운드에서 실행, 에러 무시)
      createVersion(
        projectId,
        "character",
        id,
        characterToSnapshot(updated),
        previousSnapshot
      ).catch(() => {
        // 버전 생성 실패는 무시
      });

      return updated;
    },
    [characters, projectId]
  );

  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    // 해당 캐릭터와 연결된 관계들 및 버전들도 함께 삭제
    await relationshipLocalRepository.deleteByCharacterId(id);
    await deleteVersionsByEntity("character", id);
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
