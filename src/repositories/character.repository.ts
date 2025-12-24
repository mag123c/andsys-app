import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "./types";

export interface CharacterRepository {
  getById(id: string): Promise<Character | null>;
  getByProjectId(projectId: string): Promise<Character[]>;
  create(data: CreateCharacterInput): Promise<Character>;
  update(id: string, data: UpdateCharacterInput): Promise<Character>;
  delete(id: string): Promise<void>;
  reorder(projectId: string, characterIds: string[]): Promise<void>;
}
