export type RelationshipType =
  | "family"
  | "friend"
  | "lover"
  | "rival"
  | "enemy"
  | "colleague"
  | "master"
  | "custom";

export interface RelationshipTypeConfig {
  type: RelationshipType;
  label: string;
  color: string;
}

export const RELATIONSHIP_TYPES: RelationshipTypeConfig[] = [
  { type: "family", label: "가족", color: "#8B5CF6" },
  { type: "friend", label: "친구", color: "#10B981" },
  { type: "lover", label: "연인", color: "#F43F5E" },
  { type: "rival", label: "라이벌", color: "#F59E0B" },
  { type: "enemy", label: "적", color: "#EF4444" },
  { type: "colleague", label: "동료", color: "#3B82F6" },
  { type: "master", label: "사제", color: "#8B5CF6" },
  { type: "custom", label: "기타", color: "#6B7280" },
];

export interface Relationship {
  id: string;
  projectId: string;

  // 관계 당사자
  fromCharacterId: string;
  toCharacterId: string;

  // 관계 정보
  type: RelationshipType;
  description: string | null;

  // 양방향 여부
  bidirectional: boolean;

  // 메타
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRelationshipInput = Pick<
  Relationship,
  "projectId" | "fromCharacterId" | "toCharacterId" | "type" | "bidirectional"
> &
  Partial<Pick<Relationship, "description">>;

export type UpdateRelationshipInput = Partial<
  Pick<Relationship, "type" | "description" | "bidirectional">
>;
