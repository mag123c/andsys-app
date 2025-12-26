import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/storage/remote/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const isAdmin = isAdminEmail(user.email);
  return NextResponse.json({ isAdmin });
}
