import { db, type LocalVersion } from "./db";
import type {
  Version,
  VersionEntityType,
  CreateVersionInput,
} from "@/repositories/types";
import type { VersionRepository } from "@/repositories/version.repository";
import { computeVersionDiff, isDiffEmpty } from "@/lib/diff-utils";

function toVersion(local: LocalVersion): Version {
  return {
    id: local.id,
    projectId: local.projectId,
    entityType: local.entityType,
    entityId: local.entityId,
    snapshot: local.snapshot,
    diff: local.diff,
    createdAt: local.createdAt,
  };
}

// 버전당 최대 보관 개수
const MAX_VERSIONS_PER_ENTITY = 50;

export class VersionLocalRepository implements VersionRepository {
  async getByEntity(
    entityType: VersionEntityType,
    entityId: string
  ): Promise<Version[]> {
    const locals = await db.versions
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .reverse()
      .sortBy("createdAt");

    return locals.map(toVersion);
  }

  async getById(id: string): Promise<Version | null> {
    const local = await db.versions.get(id);
    if (!local) {
      return null;
    }
    return toVersion(local);
  }

  async create(data: CreateVersionInput): Promise<Version> {
    // diff 계산
    const diff = computeVersionDiff(
      data.previousSnapshot || null,
      data.snapshot,
      data.entityType
    );

    // diff가 비어있으면 버전 생성 스킵 (변경사항 없음)
    if (isDiffEmpty(diff)) {
      // 이전 버전이 있으면 그것을 반환, 없으면 현재 스냅샷으로 버전 생성
      const existingVersions = await this.getByEntity(
        data.entityType,
        data.entityId
      );
      if (existingVersions.length > 0) {
        return existingVersions[0];
      }
    }

    const now = new Date();

    const local: LocalVersion = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      entityType: data.entityType,
      entityId: data.entityId,
      snapshot: data.snapshot,
      diff: isDiffEmpty(diff) ? null : diff,
      createdAt: now,
    };

    await db.versions.add(local);

    // 오래된 버전 자동 삭제
    await this.deleteOldVersions(
      data.entityType,
      data.entityId,
      MAX_VERSIONS_PER_ENTITY
    );

    return toVersion(local);
  }

  async deleteByEntity(
    entityType: VersionEntityType,
    entityId: string
  ): Promise<void> {
    await db.versions
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .delete();
  }

  async deleteOldVersions(
    entityType: VersionEntityType,
    entityId: string,
    keepCount: number
  ): Promise<void> {
    const versions = await db.versions
      .where("[entityType+entityId]")
      .equals([entityType, entityId])
      .reverse()
      .sortBy("createdAt");

    if (versions.length <= keepCount) {
      return;
    }

    // keepCount 이후의 버전들 삭제
    const toDelete = versions.slice(keepCount);
    const idsToDelete = toDelete.map((v) => v.id);

    await db.versions.bulkDelete(idsToDelete);
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await db.versions.where("projectId").equals(projectId).delete();
  }
}

export const versionLocalRepository = new VersionLocalRepository();
