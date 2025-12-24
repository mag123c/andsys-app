import type { Synopsis, CreateSynopsisInput, UpdateSynopsisInput } from "./types";

export interface SynopsisRepository {
  getByProjectId(projectId: string): Promise<Synopsis | null>;
  create(data: CreateSynopsisInput): Promise<Synopsis>;
  update(id: string, data: UpdateSynopsisInput): Promise<Synopsis>;
  delete(id: string): Promise<void>;
}
