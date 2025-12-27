import { db } from "@/storage/local/db";

const GUEST_ID_KEY = "guestId";

export async function getGuestId(): Promise<string | null> {
  const setting = await db.settings.get(GUEST_ID_KEY);
  return (setting?.value as string) ?? null;
}

export async function getOrCreateGuestId(): Promise<string> {
  const existing = await getGuestId();
  if (existing) {
    return existing;
  }

  const guestId = crypto.randomUUID();
  await db.settings.put({ key: GUEST_ID_KEY, value: guestId });
  return guestId;
}

export async function clearGuestId(): Promise<void> {
  await db.settings.delete(GUEST_ID_KEY);
}

export interface MigrationResult {
  success: boolean;
  migratedProjects: number;
  migratedChapters: number;
  migratedSynopses: number;
  migratedCharacters: number;
  migratedRelationships: number;
  migratedVersions: number;
  error?: string;
}

/**
 * 게스트 데이터를 회원 데이터로 마이그레이션
 * - 게스트 프로젝트 및 모든 관련 데이터의 guestId를 userId로 변경
 * - syncStatus를 "pending"으로 설정하여 서버 동기화 대상으로 표시
 */
export async function migrateGuestDataToUser(
  guestId: string,
  userId: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedProjects: 0,
    migratedChapters: 0,
    migratedSynopses: 0,
    migratedCharacters: 0,
    migratedRelationships: 0,
    migratedVersions: 0,
  };

  try {
    // 게스트 프로젝트 조회
    const guestProjects = await db.projects
      .where("guestId")
      .equals(guestId)
      .toArray();

    if (guestProjects.length === 0) {
      return result;
    }

    const projectIds = guestProjects.map((p) => p.id);

    // 모든 관련 데이터 한 번에 조회 (N+1 방지)
    const allChapters = await db.chapters
      .where("projectId")
      .anyOf(projectIds)
      .toArray();

    const allSynopses = await db.synopses
      .where("projectId")
      .anyOf(projectIds)
      .toArray();

    const allCharacters = await db.characters
      .where("projectId")
      .anyOf(projectIds)
      .toArray();

    const allRelationships = await db.relationships
      .where("projectId")
      .anyOf(projectIds)
      .toArray();

    const allVersions = await db.versions
      .where("projectId")
      .anyOf(projectIds)
      .toArray();

    // 프로젝트 마이그레이션
    for (const project of guestProjects) {
      await db.projects.update(project.id, {
        userId: userId,
        guestId: null,
        syncStatus: "pending",
      });
      result.migratedProjects++;
    }

    // 챕터 마이그레이션
    for (const chapter of allChapters) {
      await db.chapters.update(chapter.id, {
        syncStatus: "pending",
      });
      result.migratedChapters++;
    }

    // 시놉시스 마이그레이션
    for (const synopsis of allSynopses) {
      await db.synopses.update(synopsis.id, {
        syncStatus: "pending",
      });
      result.migratedSynopses++;
    }

    // 캐릭터 마이그레이션
    for (const character of allCharacters) {
      await db.characters.update(character.id, {
        syncStatus: "pending",
      });
      result.migratedCharacters++;
    }

    // 관계 마이그레이션
    for (const relationship of allRelationships) {
      await db.relationships.update(relationship.id, {
        syncStatus: "pending",
      });
      result.migratedRelationships++;
    }

    // 버전 히스토리는 syncStatus가 없으므로 카운트만 (로컬 전용)
    result.migratedVersions = allVersions.length;

    // 마이그레이션 완료 후 게스트 ID 정리
    await clearGuestId();

    return result;
  } catch (error) {
    return {
      success: false,
      migratedProjects: 0,
      migratedChapters: 0,
      migratedSynopses: 0,
      migratedCharacters: 0,
      migratedRelationships: 0,
      migratedVersions: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
