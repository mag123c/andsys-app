import type { JSONContent } from "@tiptap/core";

export interface Synopsis {
  id: string;
  projectId: string;
  content: JSONContent;
  plainText: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSynopsisInput = Pick<Synopsis, "projectId"> &
  Partial<Pick<Synopsis, "content">>;

export type UpdateSynopsisInput = Partial<Pick<Synopsis, "content">>;
