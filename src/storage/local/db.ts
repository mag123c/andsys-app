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
  coverImageUrl: string | null;
  coverImageBase64: string | null;
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

export interface LocalSynopsis {
  id: string;
  projectId: string;
  content: JSONContent;
  plainText: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export interface LocalCustomField {
  key: string;
  value: string;
}

export interface LocalCharacter {
  id: string;
  projectId: string;

  // 기본 정보
  name: string;
  nickname: string | null;
  age: number | null;
  gender: string | null;
  race: string | null;
  imageUrl: string | null;
  imageBase64: string | null;
  order: number;

  // 외형
  height: number | null;
  weight: number | null;
  appearance: string | null;

  // 성격/배경
  mbti: string | null;
  personality: string | null;
  education: string | null;
  occupation: string | null;
  affiliation: string | null;
  background: string | null;

  // 확장
  customFields: LocalCustomField[];

  // 메타
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export type LocalRelationshipType =
  | "family"
  | "friend"
  | "lover"
  | "rival"
  | "enemy"
  | "colleague"
  | "master"
  | "custom";

export interface LocalRelationship {
  id: string;
  projectId: string;

  // 관계 당사자
  fromCharacterId: string;
  toCharacterId: string;

  // 관계 정보
  type: LocalRelationshipType;
  label: string;
  description: string | null;

  // 양방향 여부
  bidirectional: boolean;
  reverseLabel: string | null;

  // 메타
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export interface LocalSettings {
  key: string;
  value: unknown;
}

export type LocalVersionEntityType = "synopsis" | "character";

export interface LocalVersionDiff {
  fields?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  lines?: Array<{
    type: "added" | "removed" | "unchanged";
    content: string;
    lineNumber?: number;
  }>;
}

export interface LocalVersion {
  id: string;
  projectId: string;
  entityType: LocalVersionEntityType;
  entityId: string;
  snapshot: Record<string, unknown>;
  diff: LocalVersionDiff | null;
  createdAt: Date;
}

export class AppDatabase extends Dexie {
  projects!: Table<LocalProject>;
  chapters!: Table<LocalChapter>;
  synopses!: Table<LocalSynopsis>;
  characters!: Table<LocalCharacter>;
  relationships!: Table<LocalRelationship>;
  versions!: Table<LocalVersion>;
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

    // Version 2: Add cover image fields to projects
    this.version(2).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    }).upgrade((tx) => {
      // Add default null values for new fields
      return tx.table("projects").toCollection().modify((project) => {
        if (project.coverImageUrl === undefined) {
          project.coverImageUrl = null;
        }
        if (project.coverImageBase64 === undefined) {
          project.coverImageBase64 = null;
        }
      });
    });

    // Version 3: Add synopses table
    this.version(3).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      synopses: "id, projectId, updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });

    // Version 4: Add characters table
    this.version(4).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      synopses: "id, projectId, updatedAt, syncStatus",
      characters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });

    // Version 5: Add relationships table
    this.version(5).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      synopses: "id, projectId, updatedAt, syncStatus",
      characters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      relationships:
        "id, projectId, fromCharacterId, toCharacterId, updatedAt, syncStatus",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });

    // Version 6: Add versions table for history tracking
    this.version(6).stores({
      projects: "id, userId, guestId, updatedAt, syncStatus",
      chapters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      synopses: "id, projectId, updatedAt, syncStatus",
      characters: "id, projectId, [projectId+order], updatedAt, syncStatus",
      relationships:
        "id, projectId, fromCharacterId, toCharacterId, updatedAt, syncStatus",
      versions: "id, projectId, [entityType+entityId], createdAt",
      syncQueue: "++id, entityType, entityId, createdAt",
      settings: "key",
    });
  }
}

export const db = new AppDatabase();
