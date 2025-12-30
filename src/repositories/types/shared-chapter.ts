import type { JSONContent } from "@tiptap/core";

export type ShareExpiration = "1h" | "24h" | "7d" | "30d" | "never";

export interface SharedChapter {
  id: string;
  userId: string;
  projectId: string;
  chapterId: string;
  shareToken: string;
  hasPassword: boolean;
  projectTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  content: JSONContent;
  characterCount: number;
  expiresAt: Date | null;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSharedChapterInput {
  chapterId: string;
  expiresIn: ShareExpiration;
  password?: string;
}

export interface SharedChapterListItem {
  id: string;
  projectTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  shareToken: string;
  shareUrl: string;
  expiresAt: Date | null;
  viewCount: number;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: Date;
}

export interface SharedChapterView {
  projectTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  content: JSONContent;
  characterCount: number;
  expiresAt: Date | null;
  createdAt: Date;
}

export type SharedChapterError =
  | "NOT_FOUND"
  | "LINK_EXPIRED"
  | "PASSWORD_REQUIRED"
  | "INVALID_PASSWORD";
