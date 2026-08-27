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

    // Recherche du compte EnVoiture correspondant au CP
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
     * Si aucun compte EnVoiture ne correspond au CP,
     * on renvoie volontairement une réponse neutre.
     */
    if (!utilisateur) {
      return NextResponse.json({
        success: true,
        message:
          "Si un compte correspondant existe, un e-mail de réinitialisation a été envoyé.",
      });
    }

    /*
     * On récupère maintenant l'utilisateur directement
     * dans Supabase Auth grâce à son identifiant.
     *
     * Cela permet de prendre en charge :
     * - les anciens comptes créés avant le système CP ;
     * - les nouveaux comptes créés avec leur adresse professionnelle.
     */
    const {
      data: authUserData,
      error: authUserError,
    } = await supabaseAdmin.auth.admin.getUserById(
      utilisateur.id
    );

    if (authUserError) {
      console.error(
        "Erreur recherche utilisateur Auth :",
        authUserError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de retrouver votre compte d'authentification.",
        },
        { status: 500 }
      );
    }

    const authUser = authUserData?.user;

    if (!authUser?.email) {
      console.error(
        "Utilisateur Auth sans adresse e-mail :",
        utilisateur.id
      );

      return NextResponse.json(
        {
          error:
            "Aucune adresse e-mail n'est associée à ce compte.",
        },
        { status: 500 }
      );
    }

    /*
     * On utilise l'adresse réellement enregistrée
     * dans Supabase Auth.
     *
     * Pour ton ancien compte, ce sera donc :
     * nicolasamico37@gmail.com
     *
     * Pour un nouveau compte SNCF, ce sera son adresse
     * professionnelle enregistrée dans Auth.
     */
    const emailAuth = authUser.email;

    console.log(
      "Demande de réinitialisation pour :",
      emailAuth
    );

    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(
        emailAuth,
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
        "Si un compte correspondant existe, un e-mail de réinitialisation a été envoyé.",
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