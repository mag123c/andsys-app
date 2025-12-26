"use client";

import { db } from "@/storage/local/db";
import { generateChunhyangData, type MockupData } from "./chunhyang-data";

/**
 * 춘향전 목업 데이터를 IndexedDB에 저장
 * @param userId - 로그인한 사용자 ID (null이면 게스트)
 * @param guestId - 게스트 ID (userId가 있으면 null)
 */
export async function createChunhyangMockup(
  userId: string | null,
  guestId: string | null
): Promise<{ success: boolean; projectId: string | null; error?: string }> {
  try {
    const data: MockupData = generateChunhyangData();
    const now = new Date();

    // 트랜잭션으로 모든 데이터 저장
    await db.transaction(
      "rw",
      [db.projects, db.synopses, db.characters, db.relationships, db.chapters],
      async () => {
        // 1. 프로젝트 저장
        await db.projects.add({
          id: data.project.id,
          userId,
          guestId,
          title: data.project.title,
          description: data.project.description,
          genre: data.project.genre,
          coverImageUrl: null,
          coverImageBase64: null,
          status: "active",
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
          syncStatus: userId ? "pending" : "synced",
          lastSyncedAt: null,
        });

        // 2. 시놉시스 저장
        await db.synopses.add({
          id: data.synopsis.id,
          projectId: data.project.id,
          content: data.synopsis.content,
          plainText: data.synopsis.plainText,
          wordCount: data.synopsis.wordCount,
          createdAt: now,
          updatedAt: now,
          syncStatus: userId ? "pending" : "synced",
          lastSyncedAt: null,
        });

        // 3. 등장인물 저장
        for (const character of data.characters) {
          await db.characters.add({
            id: character.id,
            projectId: data.project.id,
            name: character.name,
            nickname: character.nickname,
            age: character.age,
            gender: character.gender,
            race: null,
            imageUrl: null,
            imageBase64: null,
            order: character.order,
            height: null,
            weight: null,
            appearance: null,
            mbti: null,
            personality: character.personality,
            education: null,
            occupation: null,
            affiliation: null,
            background: character.background,
            customFields: [],
            createdAt: now,
            updatedAt: now,
            syncStatus: userId ? "pending" : "synced",
            lastSyncedAt: null,
          });
        }

        // 4. 관계도 저장
        for (const relationship of data.relationships) {
          await db.relationships.add({
            id: relationship.id,
            projectId: data.project.id,
            fromCharacterId: relationship.fromCharacterId,
            toCharacterId: relationship.toCharacterId,
            type: relationship.type,
            description: relationship.description,
            bidirectional: relationship.bidirectional,
            createdAt: now,
            updatedAt: now,
            syncStatus: userId ? "pending" : "synced",
            lastSyncedAt: null,
          });
        }

        // 5. 회차 저장
        for (const chapter of data.chapters) {
          await db.chapters.add({
            id: chapter.id,
            projectId: data.project.id,
            title: chapter.title,
            content: chapter.content,
            contentText: chapter.contentText,
            wordCount: chapter.wordCount,
            order: chapter.order,
            status: "draft",
            createdAt: now,
            updatedAt: now,
            syncStatus: userId ? "pending" : "synced",
            lastSyncedAt: null,
          });
        }
      }
    );

    return { success: true, projectId: data.project.id };
  } catch (error) {
    console.error("목업 데이터 생성 실패:", error);
    return {
      success: false,
      projectId: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
