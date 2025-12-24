import type {
  Relationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from "./types";

export interface RelationshipRepository {
  getById(id: string): Promise<Relationship | null>;
  getByProjectId(projectId: string): Promise<Relationship[]>;
  getByCharacterId(characterId: string): Promise<Relationship[]>;
  create(data: CreateRelationshipInput): Promise<Relationship>;
  update(id: string, data: UpdateRelationshipInput): Promise<Relationship>;
  delete(id: string): Promise<void>;
  deleteByCharacterId(characterId: string): Promise<void>;
}
