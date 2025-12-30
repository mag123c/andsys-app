import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/storage/remote/server";
import { generateShareToken, getShareUrl, getExpirationDate, hashPassword } from "@/lib/share";
import type { CreateSharedChapterInput, SharedChapterListItem } from "@/repositories/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body: CreateSharedChapterInput = await request.json();
    const { chapterId, expiresIn, password } = body;

    if (!chapterId || !expiresIn) {
      return NextResponse.json(
        { success: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // 챕터와 프로젝트 정보 조회 (로컬 데이터는 클라이언트에서 전달받아야 함)
    // 여기서는 클라이언트에서 추가 정보를 함께 보내도록 수정
    const extendedBody = body as CreateSharedChapterInput & {
      projectId: string;
      projectTitle: string;
      chapterTitle: string;
      chapterNumber: number;
      content: unknown;
      characterCount: number;
    };

    const shareToken = generateShareToken();
    const expiresAt = getExpirationDate(expiresIn);

    // 비밀번호 해시 (PBKDF2 + salt)
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const { data, error } = await supabase
      .from("shared_chapters")
      .insert({
        user_id: user.id,
        project_id: extendedBody.projectId,
        chapter_id: chapterId,
        share_token: shareToken,
        password_hash: passwordHash,
        project_title: extendedBody.projectTitle,
        chapter_title: extendedBody.chapterTitle,
        chapter_number: extendedBody.chapterNumber,
        content: extendedBody.content,
        character_count: extendedBody.characterCount,
        expires_at: expiresAt?.toISOString() ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create shared chapter:", error);
      return NextResponse.json(
        { success: false, error: "CREATE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        shareToken,
        shareUrl: getShareUrl(shareToken),
        expiresAt: expiresAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Share chapter error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    let query = supabase
      .from("shared_chapters")
      .select("*")
      .eq("user_id", user.id);

    // 특정 회차의 활성 링크만 조회
    if (chapterId) {
      query = query
        .eq("chapter_id", chapterId)
        .eq("is_active", true)
        .or("expires_at.is.null,expires_at.gt.now()");
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch shared chapters:", error);
      return NextResponse.json(
        { success: false, error: "FETCH_FAILED" },
        { status: 500 }
      );
    }

    const items: SharedChapterListItem[] = data.map((row) => ({
      id: row.id,
      projectTitle: row.project_title,
      chapterTitle: row.chapter_title,
      chapterNumber: row.chapter_number,
      shareToken: row.share_token,
      shareUrl: getShareUrl(row.share_token),
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      viewCount: row.view_count,
      isActive: row.is_active,
      hasPassword: !!row.password_hash,
      createdAt: new Date(row.created_at),
    }));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fetch shared chapters error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
