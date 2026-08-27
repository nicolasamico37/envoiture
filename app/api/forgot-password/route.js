import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { cp } = await request.json();

    if (!cp || typeof cp !== "string") {
      return NextResponse.json(
        {
          error: "Numéro de CP manquant.",
        },
        { status: 400 }
      );
    }

    const numeroCp = cp.trim().toUpperCase();

    // Vérification du format : 7 chiffres + 1 lettre
    if (!/^\d{7}[A-Z]$/.test(numeroCp)) {
      return NextResponse.json(
        {
          error:
            "Le numéro de CP doit comporter 7 chiffres suivis d'une lettre.",
        },
        { status: 400 }
      );
    }

    // Recherche du compte correspondant au CP
    const { data: utilisateur, error: utilisateurError } =
      await supabaseAdmin
        .from("utilisateurs")
        .select("id, numero_cp, email_professionnel")
        .eq("numero_cp", numeroCp)
        .maybeSingle();

    if (utilisateurError) {
      console.error(
        "Erreur recherche CP mot de passe oublié :",
        utilisateurError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de traiter votre demande pour le moment.",
        },
        { status: 500 }
      );
    }

    /*
     * Même si aucun compte n'est trouvé, on renvoie
     * une réponse neutre afin de ne pas révéler
     * l'existence d'un compte associé à un CP.
     */
    if (!utilisateur?.email_professionnel) {
      return NextResponse.json({
        success: true,
        message:
          "Si un compte correspondant existe, un e-mail de réinitialisation a été envoyé à l'adresse professionnelle associée à votre numéro de CP.",
      });
    }

    const emailProfessionnel =
      utilisateur.email_professionnel;

    // Envoi de l'e-mail de réinitialisation
    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(
        emailProfessionnel,
        {
          redirectTo:
            "https://www.envoiture-app.com/reinitialiser-mot-de-passe",
        }
      );

    if (resetError) {
      console.error(
        "Erreur réinitialisation mot de passe :",
        resetError
      );

      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer l'e-mail de réinitialisation.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Si un compte correspondant existe, un e-mail de réinitialisation a été envoyé à l'adresse professionnelle associée à votre numéro de CP.",
    });
  } catch (error) {
    console.error(
      "Erreur API forgot-password :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de traiter votre demande.",
      },
      { status: 400 }
    );
  }
}