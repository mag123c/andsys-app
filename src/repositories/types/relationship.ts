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
  { type: "family", label: "가족", color: "#A855F7" },    // 밝은 보라
  { type: "friend", label: "친구", color: "#22C55E" },    // 밝은 초록
  { type: "lover", label: "연인", color: "#EC4899" },     // 핑크
  { type: "rival", label: "라이벌", color: "#F97316" },   // 오렌지
  { type: "enemy", label: "적", color: "#DC2626" },       // 진한 빨강
  { type: "colleague", label: "동료", color: "#3B82F6" }, // 파랑
  { type: "master", label: "사제", color: "#14B8A6" },    // 틸(청록)
  { type: "custom", label: "기타", color: "#6B7280" },    // 회색
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
