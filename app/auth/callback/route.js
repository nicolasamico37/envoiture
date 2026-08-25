import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation", requestUrl.origin)
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Erreur confirmation e-mail :",
      error
    );

    return NextResponse.redirect(
      new URL("/login?error=confirmation", requestUrl.origin)
    );
  }

  return NextResponse.redirect(
    new URL("/inscription/finaliser", requestUrl.origin)
  );
}