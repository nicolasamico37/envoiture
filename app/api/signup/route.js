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

    // Vérification que le CP n'est pas déjà utilisé
    const { data: existingUser, error: existingUserError } =
      await supabaseAdmin
        .from("utilisateurs")
        .select("id, numero_cp, email_professionnel")
        .eq("numero_cp", numeroCp)
        .maybeSingle();

    if (existingUserError) {
      console.error(
        "Erreur recherche CP :",
        existingUserError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de vérifier le numéro de CP.",
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Un compte EnVoiture existe déjà pour ce numéro de CP.",
        },
        { status: 409 }
      );
    }

    // Construction de l'adresse professionnelle
    const emailProfessionnel =
      `${numeroCp}@commun.ad.sncf.fr`.toLowerCase();

    // Création du compte + envoi de l'invitation
    const { data, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(
        emailProfessionnel
      );

    if (inviteError) {
      console.error(
        "Erreur invitation utilisateur :",
        inviteError
      );

      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer l'invitation à l'adresse professionnelle.",
        },
        { status: 500 }
      );
    }

    if (!data?.user?.id) {
      return NextResponse.json(
        {
          error:
            "L'utilisateur a été créé mais son identifiant est introuvable.",
        },
        { status: 500 }
      );
    }

    // Le trigger handle_new_user() doit avoir créé
    // la ligne correspondante dans public.utilisateurs.
    const { error: updateError } =
      await supabaseAdmin
        .from("utilisateurs")
        .update({
          numero_cp: numeroCp,
          email_professionnel: emailProfessionnel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);

    if (updateError) {
      console.error(
        "Erreur enregistrement CP :",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Le compte a été créé mais les informations du CP n'ont pas pu être enregistrées.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Un e-mail de confirmation a été envoyé à votre adresse professionnelle SNCF.",
    });
  } catch (error) {
    console.error(
      "Erreur API signup :",
      error
    );

    return NextResponse.json(
      {
        error: "Requête invalide.",
      },
      { status: 400 }
    );
  }
}