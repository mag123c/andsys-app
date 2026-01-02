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

export const RELATIONSHIP_TYPES = [
  { value: "family", label: "가족" },
  { value: "friend", label: "친구" },
  { value: "lover", label: "연인" },
  { value: "rival", label: "라이벌" },
  { value: "enemy", label: "적" },
  { value: "colleague", label: "동료" },
  { value: "master", label: "사제" },
  { value: "custom", label: "기타" },
] as const;

export const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  family: "가족",
  friend: "친구",
  lover: "연인",
  rival: "라이벌",
  enemy: "적",
  colleague: "동료",
  master: "사제",
  custom: "기타",
};
