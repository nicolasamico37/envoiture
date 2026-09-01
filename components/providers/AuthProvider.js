"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

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
  if (!Array.isArray(habitudes)) {
    return {
      days: [],
      horaires: {},
    };
  }

  const days = [];
  const horaires = {};

  dayOrder.forEach((day) => {
    const habit = habitudes.find(
      (item) => item.jour === day
    );

    if (!habit || !habit.actif) {
      return;
    }

    const label = dayLabels[day];

    days.push(label);

    horaires[label] = {
      priseService:
        habit.prise_service
          ? String(habit.prise_service).slice(0, 5)
          : null,

      departMaison:
        habit.depart_domicile
          ? String(habit.depart_domicile).slice(0, 5)
          : null,

      retour:
        habit.retour
          ? String(habit.retour).slice(0, 5)
          : null,
    };
  });

  return {
    days,
    horaires,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  async function loadProfile(user) {
    if (!user) {
      setProfile(null);
      return;
    }

    const {
      data: userData,
      error: userError,
    } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error(
        "Erreur lors du chargement de l'utilisateur :",
        userError
      );

      setProfile(null);
      return;
    }

    /*
     * ------------------------------------------------
     * PROFIL
     * ------------------------------------------------
     *
     * Un profil absent n'est pas une erreur.
     * Cela correspond à un nouvel utilisateur
     * qui doit encore compléter son profil.
     */

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profils")
      .select(`
        *,
        sncf_sites (
          id,
          name,
          type,
          city,
          region,
          active
        )
      `)
      .eq("utilisateur_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Erreur lors du chargement du profil :",
        profileError
      );

      setProfile(null);
      return;
    }

    /*
     * Aucun profil :
     * l'utilisateur est authentifié mais doit
     * encore compléter son profil.
     */

    if (!profileData) {
      setProfile(null);
      return;
    }

    const {
      data: preferencesData,
      error: preferencesError,
    } = await supabase
      .from("preferences_utilisateur")
      .select(`
        vehicule_defaut_id,
        peut_conduire,
        peut_etre_passager
      `)
      .eq("utilisateur_id", user.id)
      .maybeSingle();

    if (preferencesError) {
      console.error(
        "Erreur lors du chargement des préférences :",
        preferencesError
      );
    }

    const {
      data: habitudesData,
      error: habitudesError,
    } = await supabase
      .from("habitudes_deplacement")
      .select(`
        jour,
        actif,
        depart_domicile,
        prise_service,
        retour
      `)
      .eq("utilisateur_id", user.id);

    if (habitudesError) {
      console.error(
        "Erreur lors du chargement des habitudes :",
        habitudesError
      );
    }

    const {
      data: residenceData,
      error: residenceError,
    } = await supabase
      .from("residences_privees")
      .select(`
        adresse,
        code_postal,
        ville,
        ban_id,
        latitude,
        longitude
      `)
      .eq("utilisateur_id", user.id)
      .maybeSingle();

    if (residenceError) {
      console.error(
        "Erreur lors du chargement de la résidence :",
        residenceError
      );
    }

    const siteTravail =
      profileData.sncf_sites;

    const movementData =
      buildMovementData(
        habitudesData || []
      );

    setProfile({
      ...userData,

      id: user.id,

      email: user.email,

      first_name:
        profileData.prenom,

      last_name:
        profileData.nom,

      name:
        `${profileData.prenom} ${profileData.nom}`,

      role:
        userData.role,

      /*
       * La ville de résidence est désormais
       * la source de l'information "zone".
       *
       * Elle provient de residences_privees
       * et non plus de profils.secteur.
       */
      zone:
        residenceData?.ville ?? null,

      establishment:
        siteTravail?.name ?? null,

      site_travail_id:
        profileData.site_travail_id ?? null,

      site_travail:
        siteTravail
          ? {
              id: siteTravail.id,
              name: siteTravail.name,
              type: siteTravail.type,
              city: siteTravail.city,
              region: siteTravail.region,
              active: siteTravail.active,
            }
          : null,

      days:
        movementData.days,

      horaires:
        movementData.horaires,

      habitudes:
        habitudesData || [],

      residence:
        residenceData
          ? {
              adresse:
                residenceData.adresse,

              codePostal:
                residenceData.code_postal,

              ville:
                residenceData.ville,

              banId:
                residenceData.ban_id,

              latitude:
                residenceData.latitude,

              longitude:
                residenceData.longitude,
            }
          : null,

      conducteur:
        Boolean(
          preferencesData?.peut_conduire
        ),

      peut_conduire:
        Boolean(
          preferencesData?.peut_conduire
        ),

      peut_etre_passager:
        preferencesData?.peut_etre_passager ??
        true,

      vehicule_defaut_id:
        preferencesData?.vehicule_defaut_id ??
        null,

      seats: 0,

      avatar:
        `${profileData.prenom?.[0] ?? ""}${profileData.nom?.[0] ?? ""}`
          .toUpperCase(),

      photo:
        profileData.photo,
    });
  }

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session?.user) {
        await loadProfile(
          session.user
        );
      }

      setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);

          if (session?.user) {
            await loadProfile(
              session.user
            );
          } else {
            setProfile(null);
          }
        }
      );

    return () =>
      subscription.unsubscribe();
  }, []);

  async function refreshProfile() {
    if (session?.user) {
      await loadProfile(
        session.user
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}