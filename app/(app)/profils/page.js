"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Card from "@/components/Card";

import LoadingScreen from "@/components/layout/LoadingScreen";

import { supabase } from "@/lib/supabase";

export default function ProfilesPage() {
  const router =
    useRouter();

  const [profiles, setProfiles] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadMatches() {
    try {
      setLoading(true);
      setError("");

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (
        !session?.access_token
      ) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );

        return;
      }

      const response =
        await fetch(
          "/api/matching",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Impossible de charger les compatibilités."
        );
      }

      setProfiles(
        Array.isArray(
          data.candidates
        )
          ? data.candidates
          : []
      );
    } catch (err) {
      console.error(
        "Erreur chargement matching :",
        err
      );

      setError(
        err.message ||
          "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const filteredProfiles =
    profiles.filter(
      (profile) => {
        const searchValue =
          search
            .trim()
            .toLowerCase();

        if (!searchValue) {
          return true;
        }

        return (
          profile.name
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||
          profile.city
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||
          profile.establishment
            ?.toLowerCase()
            .includes(
              searchValue
            )
        );
      }
    );

  async function handleMessage(
    profile
  ) {
    try {
      /*
       * --------------------------------------------------
       * 1. Récupérer l'utilisateur connecté
       * --------------------------------------------------
       */

      const {
        data: {
          session,
        },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user?.id) {
        setError(
          "Vous devez être connecté pour envoyer un message."
        );
        return;
      }

      const currentUserId =
        session.user.id;

      const targetUserId =
        profile?.utilisateur_id;

      if (!targetUserId) {
        setError(
          "Impossible d'identifier ce collègue."
        );
        return;
      }

      if (
        currentUserId ===
        targetUserId
      ) {
        return;
      }

      /*
       * --------------------------------------------------
       * 2. Chercher une conversation privée existante
       * --------------------------------------------------
       */

      const {
        data:
          existingConversation,
        error:
          searchError,
      } = await supabase
        .from(
          "conversations"
        )
        .select(`
          id,
          utilisateur_1_id,
          utilisateur_2_id,
          type,
          trajet_id,
          archived_at
        `)
        .eq(
          "type",
          "PRIVEE"
        )
        .is(
          "archived_at",
          null
        )
        .or(
          `and(utilisateur_1_id.eq.${currentUserId},utilisateur_2_id.eq.${targetUserId}),and(utilisateur_1_id.eq.${targetUserId},utilisateur_2_id.eq.${currentUserId})`
        )
        .maybeSingle();

      if (searchError) {
        throw searchError;
      }

      let conversation =
        existingConversation;

      /*
       * --------------------------------------------------
       * 3. Créer la conversation si nécessaire
       * --------------------------------------------------
       */

      if (!conversation) {
        const {
          data:
            newConversation,
          error:
            createError,
        } = await supabase
          .from(
            "conversations"
          )
          .insert({
            type:
              "PRIVEE",
            utilisateur_1_id:
              currentUserId,
            utilisateur_2_id:
              targetUserId,
            trajet_id:
              null,
          })
          .select(`
            id,
            utilisateur_1_id,
            utilisateur_2_id,
            type,
            trajet_id,
            archived_at
          `)
          .single();

        if (createError) {
          throw createError;
        }

        conversation =
          newConversation;
      }

      /*
       * --------------------------------------------------
       * 4. Mémoriser la conversation sélectionnée
       * --------------------------------------------------
       */

      localStorage.setItem(
        "envoiture-selected-conversation",
        conversation.id
      );

      /*
       * --------------------------------------------------
       * 5. Ouvrir la messagerie
       * --------------------------------------------------
       */

      router.push(
        "/messages"
      );

    } catch (error) {
      console.error(
        "Erreur ouverture conversation :",
        error
      );

      setError(
        error?.message ||
          "Impossible d'ouvrir la conversation."
      );
    }
  }

  function getHomeProximityLabel(
    distanceKm
  ) {
    if (
      distanceKm === null ||
      distanceKm === undefined
    ) {
      return null;
    }

    if (distanceKm <= 0.5) {
      return "Domiciles très proches";
    }

    if (distanceKm <= 1) {
      return "Domiciles proches";
    }

    if (distanceKm <= 2) {
      return "Domiciles assez proches";
    }

    if (distanceKm <= 3) {
      return "Domiciles relativement proches";
    }

    if (distanceKm <= 4) {
      return "Domiciles dans le même secteur";
    }

    return null;
  }

  function renderSchedules(
    horaires
  ) {
    if (
      !horaires ||
      typeof horaires !== "object" ||
      Object.keys(horaires).length === 0
    ) {
      return (
        <div className="text-sm text-gray-500">
          Aucun horaire renseigné
        </div>
      );
    }

    const dayLabels = {
      lundi: "Lundi",
      mardi: "Mardi",
      mercredi: "Mercredi",
      jeudi: "Jeudi",
      vendredi: "Vendredi",
      samedi: "Samedi",
      dimanche: "Dimanche",
    };

    return Object.entries(horaires).map(
      ([day, schedule]) => (
        <div
          key={day}
          className="border border-gray-200 rounded-2xl p-4"
        >
          <div className="font-semibold text-gray-900 mb-2">
            {dayLabels[day] || day}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {schedule?.priseService && (
              <div>
                Prise de service :{" "}
                {schedule.priseService}
              </div>
            )}

            {schedule?.depart && (
              <div>
                Départ : {schedule.depart}
              </div>
            )}

            {schedule?.retour && (
              <div>
                Retour : {schedule.retour}
              </div>
            )}
          </div>
        </div>
      )
    );
  }

  function renderCompatibilityReasons(
    profile
  ) {
    const details =
      profile.scoreDetails || {};

    const reasons = [];

    if (
      details.establishment >= 20
    ) {
      reasons.push({
        icon: "🏢",
        text: "Même établissement",
      });
    }

    const compatibleDaysCount =
      Array.isArray(
        profile.compatibleDays
      )
        ? profile.compatibleDays.length
        : 0;

    if (
      compatibleDaysCount > 0
    ) {
      reasons.push({
        icon: "📅",
        text:
          `${compatibleDaysCount} jour${
            compatibleDaysCount > 1
              ? "s"
              : ""
          } compatible${
            compatibleDaysCount > 1
              ? "s"
              : ""
          }`,
      });
    }

    if (
      details.departure > 0
    ) {
      reasons.push({
        icon: "⏰",
        text: "Horaires compatibles",
      });
    }

    if (
      details.role >= 10
    ) {
      reasons.push({
        icon: "🚗",
        text: "Conducteur / passager compatible",
      });
    }

    if (
      details.sector >= 5
    ) {
      reasons.push({
        icon: "📍",
        text: "Même secteur",
      });
    }

    const proximityLabel =
      getHomeProximityLabel(
        profile.homeDistanceKm
      );

    if (proximityLabel) {
      reasons.push({
        icon: "🏠",
        text: proximityLabel,
      });
    }

    return reasons;
  }

  if (loading) {
    return (
      <LoadingScreen
        text="Recherche de collègues compatibles..."
      />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Profils compatibles">

        <div className="bg-white border border-gray-200 rounded-3xl p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">

            <input
              type="text"
              placeholder="Rechercher un profil..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="flex-1 border border-gray-200 rounded-2xl px-5 py-3"
            />

            <button
              onClick={
                loadMatches
              }
              className="w-full lg:w-fit px-6 py-3 rounded-2xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              ↻ Actualiser
            </button>

          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-8">
            {error}
          </div>
        )}

        {!error &&
          filteredProfiles.length ===
            0 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">
                🚗
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Aucun collègue compatible pour le moment
              </h2>

              <p className="text-gray-500 max-w-xl mx-auto">
                Nous rechercherons automatiquement
                les collègues dont les trajets,
                les jours et les horaires sont
                compatibles avec les vôtres.
              </p>
            </div>
          )}

        {filteredProfiles.length >
          0 && (
          <div className="space-y-4">
            {filteredProfiles.map(
              (profile) => {
                const compatibilityReasons =
                  renderCompatibilityReasons(
                    profile
                  );

                return (
                  <div
                    key={
                      profile.id
                    }
                    className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">

                      <div className="flex items-center gap-5">

                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold">
                          {(
                            profile.first_name?.[0] ||
                            ""
                          ).toUpperCase()}
                          {(
                            profile.last_name?.[0] ||
                            ""
                          ).toUpperCase()}
                        </div>

                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {
                              profile.name
                            }
                          </h2>

                          {profile.city && (
                            <p className="text-gray-500 mt-1">
                              {
                                profile.city
                              }
                            </p>
                          )}
                        </div>

                      </div>

                      <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold w-fit">
                        {
                          profile.compatibility
                        }% compatible
                      </div>

                    </div>

                    <div className="space-y-5">

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Destination
                        </h3>

                        <p className="text-gray-600">
                          {
                            profile.establishment
                          }
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Pourquoi ce profil est compatible
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {compatibilityReasons.map(
                            (reason) => (
                              <div
                                key={
                                  reason.text
                                }
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3"
                              >
                                <span className="text-xl">
                                  {
                                    reason.icon
                                  }
                                </span>

                                <span className="text-sm font-medium text-gray-700">
                                  {
                                    reason.text
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Jours compatibles
                        </h3>

                        <div className="flex gap-3 flex-wrap">
                          {profile.compatibleDays?.map(
                            (day) => (
                              <div
                                key={day}
                                className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-medium"
                              >
                                {day}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Horaires
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {renderSchedules(
                            profile.horaires
                          )}
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-sm text-gray-600">
                            Le matching repose sur
                            la compatibilité des
                            établissements, des
                            jours, des horaires,
                            des profils conducteur/
                            passager et de la
                            proximité des domiciles.
                          </p>

                          <p className="text-sm text-gray-600 mt-2">
                            Les modalités du
                            covoiturage sont ensuite
                            à organiser directement
                            entre vous.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-4 pt-4">

                        <Link
                          href={`/trajets?conducteur=${encodeURIComponent(
                            profile.id
                          )}`}
                          className="flex-1 bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold text-center"
                        >
                          🚗 Voir ses trajets
                        </Link>

                        <button
                          onClick={() =>
                            handleMessage(
                              profile
                            )
                          }
                          className="flex-1 bg-gray-100 text-gray-700 px-5 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition"
                        >
                          💬 Envoyer un message
                        </button>

                      </div>

                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      </Card>
    </div>
  );
}