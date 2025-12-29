"use server";

import { createServerSupabaseClient } from "@/storage/remote/server";
import { createAdminClient } from "@/storage/remote/admin";

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * 회원 탈퇴 서버 액션
 * - 현재 로그인된 사용자의 계정과 모든 데이터를 삭제
 * - CASCADE 설정으로 profiles, projects, chapters 등 자동 삭제
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  try {
    // 현재 로그인된 사용자 확인
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // Admin 클라이언트로 사용자 삭제
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return { success: false, error: "계정 삭제에 실패했습니다." };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, error: "계정 삭제 중 오류가 발생했습니다." };
  }
}
