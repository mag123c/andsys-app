import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/storage/remote/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/novels";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message, error);
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // code가 없는 경우
  console.error("Auth callback: No code provided");
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
