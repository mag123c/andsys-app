"use client";

import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import { characterLocalRepository } from "@/storage/local/character.local";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";
import { db } from "@/storage/local/db";
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
  /** 히스토리에서 복원 시 사용. 버전 생성 완료 후 반환 */
  restoreCharacter: (
    id: string,
    data: UpdateCharacterInput
  ) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
  reorderCharacters: (characterIds: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCharacters(projectId: string): UseCharactersReturn {
  const [error, setError] = useState<Error | null>(null);

  // useLiveQuery: IndexedDB 변경 시 자동으로 re-render
  const characters = useLiveQuery(
    async () => {
      try {
        setError(null);
        const localCharacters = await db.characters
          .where("projectId")
          .equals(projectId)
          .sortBy("order");

        // LocalCharacter를 Character 타입으로 변환
        return localCharacters.map((ch) => ({
          id: ch.id,
          projectId: ch.projectId,
          name: ch.name,
          nickname: ch.nickname,
          age: ch.age,
          gender: ch.gender,
          race: ch.race,
          imageUrl: ch.imageUrl,
          height: ch.height,
          weight: ch.weight,
          appearance: ch.appearance,
          mbti: ch.mbti,
          personality: ch.personality,
          education: ch.education,
          occupation: ch.occupation,
          affiliation: ch.affiliation,
          background: ch.background,
          customFields: ch.customFields,
          order: ch.order,
          createdAt: ch.createdAt,
          updatedAt: ch.updatedAt,
        }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch characters"));
        return [];
      }
    },
    [projectId]
  );

  const isLoading = characters === undefined;

  const createCharacter = useCallback(
    async (
      data: Omit<CreateCharacterInput, "projectId">
    ): Promise<Character> => {
      const character = await characterLocalRepository.create({
        ...data,
        projectId,
      });
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
      return character;
    },
    [projectId]
  );

  const updateCharacter = useCallback(
    async (id: string, data: UpdateCharacterInput): Promise<Character> => {
      // 이전 스냅샷 저장 (IndexedDB에서 직접 조회)
      const existing = await characterLocalRepository.getById(id);
      const previousSnapshot = existing
        ? characterToSnapshot(existing)
        : undefined;

      const updated = await characterLocalRepository.update(id, data);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요

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
    [projectId]
  );

  /**
   * 히스토리 복원 전용. 버전 생성 완료 대기.
   */
  const restoreCharacter = useCallback(
    async (id: string, data: UpdateCharacterInput): Promise<Character> => {
      // 이전 스냅샷 저장 (IndexedDB에서 직접 조회)
      const existing = await characterLocalRepository.getById(id);
      const previousSnapshot = existing
        ? characterToSnapshot(existing)
        : undefined;

      const updated = await characterLocalRepository.update(id, data);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요

      // 버전 생성 완료 대기 (복원 기록)
      await createVersion(
        projectId,
        "character",
        id,
        characterToSnapshot(updated),
        previousSnapshot
      );

      return updated;
    },
    [projectId]
  );

  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    // 해당 캐릭터와 연결된 관계들 및 버전들도 함께 삭제
    await relationshipLocalRepository.deleteByCharacterId(id);
    await deleteVersionsByEntity("character", id);
    await characterLocalRepository.delete(id);
    // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
  }, []);

  const reorderCharacters = useCallback(
    async (characterIds: string[]): Promise<void> => {
      await characterLocalRepository.reorder(projectId, characterIds);
      // useLiveQuery가 자동으로 업데이트하므로 setState 불필요
    },
    [projectId]
  );

  // refetch는 useLiveQuery에서는 불필요하지만 인터페이스 호환성 유지
  const refetch = useCallback(async () => {
    // useLiveQuery가 자동으로 데이터를 동기화하므로 no-op
  }, []);

  return {
    characters: characters ?? [],
    isLoading,
    error,
    createCharacter,
    updateCharacter,
    restoreCharacter,
    deleteCharacter,
    reorderCharacters,
    refetch,
  };
}
