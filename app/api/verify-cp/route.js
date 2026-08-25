import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { cp } = await request.json();

    if (!cp || typeof cp !== "string") {
      return NextResponse.json(
        { error: "Numéro de CP manquant." },
        { status: 400 }
      );
    }

    const numeroCp = cp.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
      .from("utilisateurs")
      .select("id, numero_cp, email_professionnel")
      .eq("numero_cp", numeroCp)
      .maybeSingle();

    if (error) {
      console.error("Erreur vérification CP :", error);

      return NextResponse.json(
        { error: "Erreur lors de la vérification du CP." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: !!data,
    });
  } catch (error) {
    console.error("Erreur API verify-cp :", error);

    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }
}