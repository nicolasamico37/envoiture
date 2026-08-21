import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import {
  calculateCompatibilityBase,
  calculateFinalScore,
  calculateHomeDistance,
} from "@/utils/compatibility";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createServerSupabase(accessToken) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    }
  );
}

const dayLabels = {
  lundi: "Lun",
  mardi: "Mar",
  mercredi: "Mer",
  jeudi: "Jeu",
  vendredi: "Ven",
  samedi: "Sam",
  dimanche: "Dim",
};

const dayOrder = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

function buildMovementData(habitudes) {
  const days = [];
  const horaires = {};

  if (!Array.isArray(habitudes)) {
    return {
      days,
      horaires,
    };
  }

  dayOrder.forEach((day) => {
    const habit =
      habitudes.find(
        (item) =>
          item.jour === day
      );

    if (
      !habit ||
      !habit.actif
    ) {
      return;
    }

    const label =
      dayLabels[day];

    days.push(label);

    horaires[label] = {
      priseService:
        habit.prise_service
          ? String(
              habit.prise_service
            ).slice(0, 5)
          : null,

      departMaison:
        habit.depart_domicile
          ? String(
              habit.depart_domicile
            ).slice(0, 5)
          : null,

      retour:
        habit.retour
          ? String(
              habit.retour
            ).slice(0, 5)
          : null,
    };
  });

  return {
    days,
    horaires,
  };
}

function buildCandidateMovementData(
  days
) {
  if (!Array.isArray(days)) {
    return {
      days: [],
      horaires: {},
    };
  }

  return buildMovementData(
    days
  );
}

export async function GET(request) {
  try {
    /*
     * --------------------------------------------------
     * AUTHENTIFICATION
     * --------------------------------------------------
     */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (!authorization) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Utilisateur non authentifié.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      );

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Jeton d'authentification absent.",
        },
        { status: 401 }
      );
    }

    const supabase =
      createServerSupabase(
        accessToken
      );

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session utilisateur invalide.",
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * PROFIL UTILISATEUR COURANT
     * --------------------------------------------------
     */

    const {
      data: currentProfile,
      error:
        currentProfileError,
    } = await supabase
      .from("profils")
      .select(`
        utilisateur_id,
        nom,
        prenom,
        secteur,
        site_travail_id,
        sncf_sites (
          id,
          name,
          type,
          city,
          region,
          active
        )
      `)
      .eq(
        "utilisateur_id",
        user.id
      )
      .single();

    if (
      currentProfileError ||
      !currentProfile
    ) {
      console.error(
        "Erreur profil courant :",
        currentProfileError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Profil utilisateur introuvable.",
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------
     * HABITUDES UTILISATEUR COURANT
     * --------------------------------------------------
     */

    const {
      data: currentHabits,
      error:
        currentHabitsError,
    } = await supabase
      .from(
        "habitudes_deplacement"
      )
      .select(`
        jour,
        actif,
        depart_domicile,
        prise_service,
        retour
      `)
      .eq(
        "utilisateur_id",
        user.id
      );

    if (currentHabitsError) {
      console.error(
        "Erreur habitudes utilisateur :",
        currentHabitsError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de charger vos habitudes de déplacement.",
        },
        { status: 500 }
      );
    }

    /*
     * --------------------------------------------------
     * RÉSIDENCE UTILISATEUR COURANT
     * --------------------------------------------------
     */

    const {
      data: currentResidence,
      error:
        currentResidenceError,
    } = await supabase
      .from(
        "residences_privees"
      )
      .select(`
        latitude,
        longitude
      `)
      .eq(
        "utilisateur_id",
        user.id
      )
      .maybeSingle();

    if (
      currentResidenceError
    ) {
      console.error(
        "Erreur résidence utilisateur :",
        currentResidenceError
      );
    }

    /*
     * --------------------------------------------------
     * PRÉFÉRENCES UTILISATEUR COURANT
     * --------------------------------------------------
     */

    const {
      data: currentPreferences,
      error:
        currentPreferencesError,
    } = await supabase
      .from(
        "preferences_utilisateur"
      )
      .select(`
        peut_conduire,
        peut_etre_passager,
        tolerance_depart_minutes
      `)
      .eq(
        "utilisateur_id",
        user.id
      )
      .maybeSingle();

    if (
      currentPreferencesError
    ) {
      console.error(
        "Erreur préférences utilisateur :",
        currentPreferencesError
      );
    }

    /*
     * --------------------------------------------------
     * VÉHICULE UTILISATEUR COURANT
     * --------------------------------------------------
     *
     * On vérifie qu'un conducteur possède réellement
     * un véhicule actif avec au moins une place proposée.
     */

    const {
      data: currentVehicle,
      error:
        currentVehicleError,
    } = await supabase
      .from("vehicules")
      .select(`
        id
      `)
      .eq(
        "utilisateur_id",
        user.id
      )
      .eq(
        "statut",
        "actif"
      )
      .is(
        "archived_at",
        null
      )
      .gt(
        "places_proposees",
        0
      )
      .limit(1)
      .maybeSingle();

    if (
      currentVehicleError
    ) {
      console.error(
        "Erreur véhicule utilisateur :",
        currentVehicleError
      );
    }

    const currentMovement =
      buildMovementData(
        currentHabits || []
      );

    /*
     * --------------------------------------------------
     * UTILISATEUR COURANT
     * --------------------------------------------------
     */

    const currentUser = {
      id:
        user.id,

      destination:
        currentProfile
          .site_travail_id,

      sector:
        currentProfile
          .secteur,

      days:
        currentMovement.days,

      horaires:
        currentMovement.horaires,

      tolerance_depart_minutes:
        currentPreferences
          ?.tolerance_depart_minutes ??
        15,

      conducteur:
        Boolean(
          currentPreferences
            ?.peut_conduire &&
          currentVehicle
        ),

      passager:
        Boolean(
          currentPreferences
            ?.peut_etre_passager
        ),
    };

    /*
     * --------------------------------------------------
     * CANDIDATS
     * --------------------------------------------------
     */

    const {
      data: candidates,
      error:
        candidatesError,
    } =
      await supabase.rpc(
        "get_matching_candidates"
      );

    if (candidatesError) {
      console.error(
        "Erreur récupération candidats :",
        candidatesError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de récupérer les candidats.",
        },
        { status: 500 }
      );
    }

    const results = [];

    /*
     * --------------------------------------------------
     * CALCUL DES COMPATIBILITÉS
     * --------------------------------------------------
     */

    for (
      const candidate
      of candidates || []
    ) {
      const candidateMovement =
        buildCandidateMovementData(
          candidate.days
        );

      const otherUser = {
        id:
          candidate
            .utilisateur_id,

        destination:
          candidate
            .site_travail_id,

        sector:
          candidate.secteur,

        days:
          candidateMovement.days,

        horaires:
          candidateMovement.horaires,

        tolerance_depart_minutes:
          candidate
            .tolerance_depart_minutes,

        conducteur:
          Boolean(
            candidate.conducteur
          ),

        passager:
          Boolean(
            candidate
              .peut_etre_passager
          ),
      };

      /*
       * -----------------------------------------------
       * COMPATIBILITÉ DE BASE
       * -----------------------------------------------
       */

      const compatibility =
        calculateCompatibilityBase(
          currentUser,
          otherUser
        );

      /*
       * Aucun jour compatible :
       * pas de match.
       */

      if (
        compatibility.score === 0 ||
        compatibility
          .compatibleDays
          .length === 0
      ) {
        continue;
      }

      /*
       * -----------------------------------------------
       * DISTANCE ENTRE LES DOMICILES
       * -----------------------------------------------
       *
       * Les coordonnées restent côté serveur.
       * Elles ne sont jamais renvoyées au navigateur.
       */

      let homeDistanceKm =
        null;

      if (
        currentResidence
          ?.latitude != null &&
        currentResidence
          ?.longitude != null &&
        candidate
          .residence_latitude !=
          null &&
        candidate
          .residence_longitude !=
          null
      ) {
        homeDistanceKm =
          calculateHomeDistance(
            {
              latitude:
                currentResidence
                  .latitude,

              longitude:
                currentResidence
                  .longitude,
            },

            {
              latitude:
                candidate
                  .residence_latitude,

              longitude:
                candidate
                  .residence_longitude,
            }
          );
      }

      /*
       * -----------------------------------------------
       * SCORE FINAL
       * -----------------------------------------------
       */

      const finalScore =
        calculateFinalScore({
          baseScore:
            compatibility.score,

          homeDistanceKm,
        });

      /*
       * -----------------------------------------------
       * RÉSULTAT
       * -----------------------------------------------
       */

      results.push({
        id:
          candidate
            .utilisateur_id,

        name:
          `${candidate.prenom} ${candidate.nom}`,

        first_name:
          candidate.prenom,

        last_name:
          candidate.nom,

        city:
          candidate.secteur,

        establishment:
          candidate.site_name,

        site_travail: {
          id:
            candidate
              .site_travail_id,

          name:
            candidate.site_name,

          type:
            candidate.site_type,

          city:
            candidate.site_city,

          region:
            candidate.site_region,
        },

        days:
          candidateMovement.days,

        horaires:
          candidateMovement.horaires,

        tolerance_depart_minutes:
          candidate
            .tolerance_depart_minutes,

        conducteur:
          Boolean(
            candidate.conducteur
          ),

        peut_conduire:
          Boolean(
            candidate
              .peut_conduire
          ),

        peut_etre_passager:
          Boolean(
            candidate
              .peut_etre_passager
          ),

        compatibility:
          finalScore.score,

        commonDays:
          compatibility.commonDays,

        compatibleDays:
          compatibility
            .compatibleDays,

        departureCompatibility:
          compatibility
            .departureCompatibility,

        homeDistanceKm:
          homeDistanceKm !== null
            ? Number(
                homeDistanceKm.toFixed(2)
              )
            : null,

        scoreDetails: {
          establishment:
            compatibility
              .siteScore,

          commonDays:
            compatibility
              .daysScore,

          departure:
            compatibility
              .departureScore,

          role:
            compatibility
              .roleScore,

          sector:
            compatibility
              .sectorScore,

          residence:
            finalScore
              .distanceScore,
        },
      });
    }

    /*
     * --------------------------------------------------
     * TRI
     * --------------------------------------------------
     */

    results.sort(
      (a, b) => {
        if (
          b.compatibility !==
          a.compatibility
        ) {
          return (
            b.compatibility -
            a.compatibility
          );
        }

        if (
          a.homeDistanceKm ===
          null
        ) {
          return 1;
        }

        if (
          b.homeDistanceKm ===
          null
        ) {
          return -1;
        }

        return (
          a.homeDistanceKm -
          b.homeDistanceKm
        );
      }
    );

    return NextResponse.json({
      success: true,

      candidates:
        results,
    });
  } catch (error) {
    console.error(
      "Erreur API matching :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Erreur lors du calcul des compatibilités.",
      },
      { status: 500 }
    );
  }
}