import { db } from "@/storage/local/db";

export interface DeleteProjectInput {
  projectId: string;
}

export interface DeleteProjectOutput {
  success: boolean;
  deletedCounts: {
    chapters: number;
    synopses: number;
    characters: number;
    relationships: number;
    versions: number;
  };
  error?: string;
}

/**
 * 프로젝트 삭제 UseCase
 *
 * 비즈니스 규칙:
 * - CASCADE_DELETE: 프로젝트 삭제 시 모든 하위 데이터 함께 삭제
 * - Soft Delete: 프로젝트는 status="deleted"로 마킹 (서버 동기화 위해)
 * - 트랜잭션: 원자성 보장
 *
 * @see ai-context/domain/rules.json#CASCADE_DELETE
 */
export async function deleteProjectUseCase(
  input: DeleteProjectInput
): Promise<DeleteProjectOutput> {
  const { projectId } = input;

  // 1. 프로젝트 존재 여부 확인
  const project = await db.projects.get(projectId);
  if (!project) {
    return {
      success: false,
      deletedCounts: {
        chapters: 0,
        synopses: 0,
        characters: 0,
        relationships: 0,
        versions: 0,
      },
    };
  }

  // 2. 관련 데이터 카운트 (결과 반환용)
  const chaptersCount = await db.chapters
    .where("projectId")
    .equals(projectId)
    .count();
  const synopsesCount = await db.synopses
    .where("projectId")
    .equals(projectId)
    .count();
  const charactersCount = await db.characters
    .where("projectId")
    .equals(projectId)
    .count();
  const relationshipsCount = await db.relationships
    .where("projectId")
    .equals(projectId)
    .count();
  const versionsCount = await db.versions
    .where("projectId")
    .equals(projectId)
    .count();

  // 3. 게스트 여부 확인 (syncStatus 결정용)
  const isGuest = project.guestId !== null;

  // 4. 트랜잭션으로 CASCADE DELETE 실행 (원자성 보장)
  try {
    await db.transaction(
      "rw",
      [
        db.projects,
        db.chapters,
        db.synopses,
        db.characters,
        db.relationships,
        db.versions,
      ],
      async () => {
        // 종속 데이터 삭제 (순서: 관계 → 캐릭터 → 버전 → 시놉시스 → 챕터)
        await db.relationships.where("projectId").equals(projectId).delete();
        await db.characters.where("projectId").equals(projectId).delete();
        await db.versions.where("projectId").equals(projectId).delete();
        await db.synopses.where("projectId").equals(projectId).delete();
        await db.chapters.where("projectId").equals(projectId).delete();

        // 프로젝트 Soft Delete
        const now = new Date();
        await db.projects.update(projectId, {
          status: "deleted",
          deletedAt: now,
          updatedAt: now,
          syncStatus: isGuest ? "synced" : "pending",
        });
      }
    );

    return {
      success: true,
      deletedCounts: {
        chapters: chaptersCount,
        synopses: synopsesCount,
        characters: charactersCount,
        relationships: relationshipsCount,
        versions: versionsCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      deletedCounts: {
        chapters: 0,
        synopses: 0,
        characters: 0,
        relationships: 0,
        versions: 0,
      },
      error: error instanceof Error ? error.message : "Transaction failed",
    };
  }
}
