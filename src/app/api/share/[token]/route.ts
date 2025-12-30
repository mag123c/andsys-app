import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/storage/remote/server";
import { verifyPassword } from "@/lib/share";
import type { SharedChapterView, SharedChapterError } from "@/repositories/types";

interface RouteParams {
  params: Promise<{ token: string }>;
}

interface SharedChapterRow {
  id: string;
  project_title: string;
  chapter_title: string;
  chapter_number: number;
  content: unknown;
  character_count: number;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
  password_hash: string | null;
  view_count: number;
}

type ValidateResult =
  | { success: true; data: SharedChapterRow }
  | { success: false; error: SharedChapterError; status: number };

/**
 * 공유 링크 검증 및 데이터 조회 (공통 로직)
 */
async function validateAndGetChapter(
  token: string,
  password?: string
): Promise<ValidateResult> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("shared_chapters")
    .select("*")
    .eq("share_token", token)
    .single();

  if (error || !data) {
    return { success: false, error: "NOT_FOUND", status: 404 };
  }

  // 만료 확인
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: "LINK_EXPIRED", status: 410 };
  }

  // 비활성화 확인
  if (!data.is_active) {
    return { success: false, error: "LINK_EXPIRED", status: 410 };
  }

  // 비밀번호 확인
  if (data.password_hash) {
    if (!password) {
      return { success: false, error: "PASSWORD_REQUIRED", status: 401 };
    }

    const isValid = await verifyPassword(password, data.password_hash);
    if (!isValid) {
      return { success: false, error: "INVALID_PASSWORD", status: 401 };
    }
  }

  return { success: true, data };
}

/**
 * 조회수 증가 (RPC로 race condition 방지)
 */
async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // RPC로 atomic increment (race condition 방지)
  const { error } = await supabase.rpc("increment_shared_chapter_view_count", {
    chapter_id: id,
  });

  if (error) {
    console.error("Failed to increment view count:", error);
  }
}

/**
 * SharedChapterRow를 SharedChapterView로 변환
 */
function toSharedChapterView(data: SharedChapterRow): SharedChapterView {
  return {
    projectTitle: data.project_title,
    chapterTitle: data.chapter_title,
    chapterNumber: data.chapter_number,
    content: data.content as SharedChapterView["content"],
    characterCount: data.character_count,
    expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    createdAt: new Date(data.created_at),
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const password = request.headers.get("X-Share-Password") || undefined;

    const result = await validateAndGetChapter(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    // 조회수 증가 (비동기, 에러 무시)
    incrementViewCount(result.data.id).catch(() => {});

    return NextResponse.json({
      success: true,
      data: toSharedChapterView(result.data),
    });
  } catch (error) {
    console.error("Fetch shared chapter error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "PASSWORD_REQUIRED" },
        { status: 400 }
      );
    }

    const result = await validateAndGetChapter(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    // 조회수 증가 (비동기, 에러 무시)
    incrementViewCount(result.data.id).catch(() => {});

    return NextResponse.json({
      success: true,
      data: toSharedChapterView(result.data),
    });
  } catch (error) {
    console.error("Verify password error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
