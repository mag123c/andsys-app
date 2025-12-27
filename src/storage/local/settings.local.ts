import { db } from "./db";
import type {
  UserSettings,
  UpdateUserSettingsInput,
} from "@/repositories/types";
import { DEFAULT_USER_SETTINGS } from "@/repositories/types";

/**
 * 설정 키 생성
 * userId 또는 guestId를 기반으로 고유 키 생성
 */
function getSettingsKey(owner: { userId?: string; guestId?: string }): string {
  if (owner.userId) {
    return `user:${owner.userId}`;
  }
  if (owner.guestId) {
    return `guest:${owner.guestId}`;
  }
  throw new Error("userId or guestId is required");
}

export const settingsLocalRepository = {
  /**
   * 사용자 설정 조회
   * 설정이 없으면 기본값 반환
   */
  async get(owner: { userId?: string; guestId?: string }): Promise<UserSettings> {
    const key = getSettingsKey(owner);
    const record = await db.settings.get(key);

    if (!record) {
      return { ...DEFAULT_USER_SETTINGS };
    }

    // 기존 설정과 기본값 병합 (새 필드가 추가된 경우 대비)
    return {
      ...DEFAULT_USER_SETTINGS,
      ...(record.value as Partial<UserSettings>),
    };
  },

  /**
   * 사용자 설정 업데이트
   */
  async update(
    owner: { userId?: string; guestId?: string },
    data: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    const key = getSettingsKey(owner);
    const current = await this.get(owner);

    const updated: UserSettings = {
      ...current,
      ...data,
    };

    await db.settings.put({
      key,
      value: updated,
    });

    return updated;
  },

  /**
   * 사용자 설정 초기화 (기본값으로 리셋)
   */
  async reset(owner: { userId?: string; guestId?: string }): Promise<UserSettings> {
    const key = getSettingsKey(owner);

    await db.settings.put({
      key,
      value: DEFAULT_USER_SETTINGS,
    });

    return { ...DEFAULT_USER_SETTINGS };
  },
};
