export interface CustomField {
  key: string;
  value: string;
}

export interface Character {
  id: string;
  projectId: string;

  // 기본 정보
  name: string;
  nickname: string | null;
  age: number | null;
  gender: string | null;
  race: string | null;
  imageUrl: string | null;
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
  customFields: CustomField[];

  // 메타
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCharacterInput = Pick<Character, "projectId" | "name"> &
  Partial<
    Pick<
      Character,
      | "nickname"
      | "age"
      | "gender"
      | "race"
      | "imageUrl"
      | "height"
      | "weight"
      | "appearance"
      | "mbti"
      | "personality"
      | "education"
      | "occupation"
      | "affiliation"
      | "background"
      | "customFields"
    >
  >;

export type UpdateCharacterInput = Partial<
  Pick<
    Character,
    | "name"
    | "nickname"
    | "age"
    | "gender"
    | "race"
    | "imageUrl"
    | "height"
    | "weight"
    | "appearance"
    | "mbti"
    | "personality"
    | "education"
    | "occupation"
    | "affiliation"
    | "background"
    | "customFields"
  >
>;
