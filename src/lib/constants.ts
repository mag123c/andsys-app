export const AUTOSAVE_DELAY = 2000; // 2초

export const SYNC_STATUS = {
  SYNCED: "synced",
  PENDING: "pending",
  CONFLICT: "conflict",
} as const;

export const PROJECT_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

export const CHAPTER_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;
