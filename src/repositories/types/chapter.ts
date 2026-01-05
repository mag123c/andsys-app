import type { JSONContent } from "@tiptap/core";

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  content: JSONContent;
  contentText: string | null;
  wordCount: number;
  order: number;
  status: "draft" | "published";
  plot: string | null;
  fontFamily: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChapterInput = Pick<Chapter, "projectId" | "title"> &
  Partial<Pick<Chapter, "content" | "plot" | "fontFamily">>;

export type UpdateChapterInput = Partial<
  Pick<Chapter, "title" | "content" | "status" | "plot" | "fontFamily">
>;
