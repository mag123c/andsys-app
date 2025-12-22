import type { Chapter, CreateChapterInput, UpdateChapterInput } from "./types";

export interface ChapterRepository {
  getById(id: string): Promise<Chapter | null>;
  getByProjectId(projectId: string): Promise<Chapter[]>;
  create(data: CreateChapterInput): Promise<Chapter>;
  update(id: string, data: UpdateChapterInput): Promise<Chapter>;
  delete(id: string): Promise<void>;
  reorder(projectId: string, chapterIds: string[]): Promise<void>;
}
