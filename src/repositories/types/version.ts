export type VersionEntityType = "synopsis" | "character";

export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface LineDiff {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber?: number;
}

export interface VersionDiff {
  fields?: FieldDiff[];
  lines?: LineDiff[];
}

export interface Version {
  id: string;
  projectId: string;
  entityType: VersionEntityType;
  entityId: string;
  snapshot: Record<string, unknown>;
  diff: VersionDiff | null;
  createdAt: Date;
}

export interface CreateVersionInput {
  projectId: string;
  entityType: VersionEntityType;
  entityId: string;
  snapshot: Record<string, unknown>;
  previousSnapshot?: Record<string, unknown>;
}
