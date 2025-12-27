import { DEFAULT_EDITOR_FONT } from "@/components/features/editor/extensions";

/**
 * 사용자 에디터 설정
 */
export interface UserSettings {
  /** 기본 글꼴 (EDITOR_FONTS의 value) */
  defaultFont: string;
}

/**
 * 설정 업데이트 입력
 */
export type UpdateUserSettingsInput = Partial<UserSettings>;

/**
 * 기본 사용자 설정 (리디바탕체)
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultFont: DEFAULT_EDITOR_FONT,
};
