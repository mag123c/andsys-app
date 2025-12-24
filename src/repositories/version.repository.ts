import type { Version, VersionEntityType, CreateVersionInput } from "./types";

export interface VersionRepository {
  getByEntity(
    entityType: VersionEntityType,
    entityId: string
  ): Promise<Version[]>;
  getById(id: string): Promise<Version | null>;
  create(data: CreateVersionInput): Promise<Version>;
  deleteByEntity(entityType: VersionEntityType, entityId: string): Promise<void>;
  deleteOldVersions(
    entityType: VersionEntityType,
    entityId: string,
    keepCount: number
  ): Promise<void>;
}
