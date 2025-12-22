import Dexie, { type Table } from "dexie";
import type { JSONContent } from "@tiptap/core";

export type SyncStatus = "synced" | "pending" | "conflict";

export interface LocalProject {
  id: string;
  userId: string | null;
  guestId: string | null;
  title: string;
  description: string | null;
  genre: string | null;
  status: "active" | "archived" | "deleted";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export interface LocalChapter {
  id: string;
  projectId: string;
  title: string;
  content: JSONContent;
  contentText: string | null;
  wordCount: number;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export interface SyncQueueItem {
  id?: number;
  entityType: "project" | "chapter";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  attempts: number;
  lastAttemptAt: Date | null;
  createdAt: Date;
}

export interface LocalSettings {
  key: string;
  value: unknown;
}

export class AppDatabase extends Dexie {
  projects!: Table<LocalProject>;
  chapters!: Table<LocalChapter>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<LocalSettings>;

  constructor() {
    super("andsys");

    this.version(1).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });
  }
}

export const db = new AppDatabase();
