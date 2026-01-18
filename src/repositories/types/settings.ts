import { DEFAULT_EDITOR_FONT } from "@/components/features/editor/extensions";

/**
 * 디자인 테마 타입
 * - default: 기본 테마 (shadcn/ui 스타일, 둥근 모서리)
 * - digital: 디지털 테마 (픽셀/레트로 스타일, 각진 모서리)
 */
export type DesignTheme = "default" | "digital";

/**
 * 사용자 에디터 설정
 */
export interface UserSettings {
  /** 기본 글꼴 (EDITOR_FONTS의 value) */
  defaultFont: string;
  /** 디자인 테마 */
  designTheme: DesignTheme;
}

/**
 * 설정 업데이트 입력
 */
export type UpdateUserSettingsInput = Partial<UserSettings>;

/**
 * 기본 사용자 설정 (리디바탕체, 기본 테마)
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultFont: DEFAULT_EDITOR_FONT,
  designTheme: "default",
};
