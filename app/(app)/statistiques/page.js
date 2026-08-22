"use client";

import {
  useEffect,
  useState,
} from "react";

import Card from "@/components/Card";

import { supabase } from "@/lib/supabase";

const COST_PER_KM = 0.15;
const CO2_PER_KM = 120;

function getTripDate(trip) {
  const possibleFields = [
    "date",
    "date_trajet",
    "dateTrajet",
    "jour",
    "trip_date",
    "tripDate",
  ];

  for (const field of possibleFields) {
    if (trip?.[field]) {
      const date = new Date(trip[field]);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function getTripDistance(trip) {
  const possibleFields = [
    "distance_km",
    "distanceKm",
    "distance",
    "distance_km_total",
    "distanceKmTotal",
  ];

  for (const field of possibleFields) {
    const value = Number(trip?.[field]);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return 0;
}

function isRealizedTrip(trip) {
  const tripDate = getTripDate(trip);

  if (!tripDate) {
    return false;
  }

  const today = new Date();

  today.setHours(
    23,
    59,
    59,
    999
  );

  return tripDate <= today;
}

export default function StatisticsPage() {
  const [stats, setStats] =
    useState({
      trips: 0,
      kilometers: 0,
      carpoolDays: 0,
      savings: 0,
      co2: 0,
      avoidedKilometers: 0,
      collectiveTrips: 0,
      collectiveKilometers: 0,
      collectiveSavings: 0,
      collectiveCo2: 0,
      collectiveAgents: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      try {
        const {
          data: trips,
          error: tripsError,
        } = await supabase
          .from("trajets")
          .select("*");

        if (tripsError) {
          console.error(
            "Erreur récupération statistiques trajets :",
            tripsError
          );

          setLoading(false);
          return;
        }

        const allTrips =
          trips || [];

        /*
         * --------------------------------------------------
         * TRAJETS RÉALISÉS
         * --------------------------------------------------
         *
         * Un trajet est considéré comme réalisé lorsque
         * sa date est passée.
         */

        const realizedTrips =
          allTrips.filter(
            isRealizedTrip
          );

        const kilometers =
          realizedTrips.reduce(
            (
              total,
              trip
            ) =>
              total +
              getTripDistance(
                trip
              ),
            0
          );

        /*
         * Les kilomètres mutualisés représentent les
         * kilomètres effectués dans le cadre des trajets
         * comptabilisés comme réalisés.
         */

        const savings =
          kilometers *
          COST_PER_KM;

        const co2 =
          kilometers *
          CO2_PER_KM;

        /*
         * --------------------------------------------------
         * JOURS DE COVOITURAGE
         * --------------------------------------------------
         */

        const uniqueDays =
          new Set();

        realizedTrips.forEach(
          (trip) => {
            const date =
              getTripDate(
                trip
              );

            if (date) {
              uniqueDays.add(
                date
                  .toISOString()
                  .split("T")[0]
              );
            }
          }
        );

        /*
         * --------------------------------------------------
         * IMPACT COLLECTIF
         * --------------------------------------------------
         *
         * Pour le moment, l'impact collectif repose sur
         * les mêmes trajets disponibles dans la base.
         *
         * Le nombre d'agents sera déterminé à partir des
         * identifiants présents dans les trajets lorsque
         * ceux-ci sont disponibles.
         */

        const collectiveKilometers =
          kilometers;

        const collectiveSavings =
          collectiveKilometers *
          COST_PER_KM;

        const collectiveCo2 =
          collectiveKilometers *
          CO2_PER_KM;

        const agentIds =
          new Set();

        allTrips.forEach(
          (trip) => {
            const possibleFields = [
              "user_id",
              "userId",
              "conducteur_id",
              "conducteurId",
              "profil_id",
              "profilId",
            ];

            for (const field of possibleFields) {
              if (
                trip?.[field]
              ) {
                agentIds.add(
                  trip[field]
                );
                break;
              }
            }

            const passengerFields = [
              "passager_id",
              "passagerId",
            ];

            for (const field of passengerFields) {
              if (
                trip?.[field]
              ) {
                agentIds.add(
                  trip[field]
                );
              }
            }
          }
        );

        setStats({
          trips:
            realizedTrips.length,

          kilometers:
            Math.round(
              kilometers * 10
            ) / 10,

          carpoolDays:
            uniqueDays.size,

          savings:
            Math.round(
              savings * 100
            ) / 100,

          co2:
            Math.round(
              co2
            ),

          avoidedKilometers:
            Math.round(
              kilometers * 10
            ) / 10,

          collectiveTrips:
            realizedTrips.length,

          collectiveKilometers:
            Math.round(
              collectiveKilometers *
                10
            ) / 10,

          collectiveSavings:
            Math.round(
              collectiveSavings *
                100
            ) / 100,

          collectiveCo2:
            Math.round(
              collectiveCo2
            ),

          collectiveAgents:
            agentIds.size,
        });
      } catch (error) {
        console.error(
          "Erreur générale récupération statistiques :",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const formatNumber =
    (value) =>
      new Intl.NumberFormat(
        "fr-FR"
      ).format(value);

  const formatMoney =
    (value) =>
      new Intl.NumberFormat(
        "fr-FR",
        {
          style: "currency",
          currency: "EUR",
        }
      ).format(value);

  const cards = [
    {
      title:
        "Trajets réalisés",
      value: loading
        ? "..."
        : formatNumber(
            stats.trips
          ),
      icon: "🚗",
      bg: "bg-pink-50",
      border:
        "border-pink-100",
    },

    {
      title:
        "Kilomètres mutualisés",
      value: loading
        ? "..."
        : `${formatNumber(
            stats.kilometers
          )} km`,
      icon: "📍",
      bg: "bg-red-50",
      border:
        "border-red-100",
    },

    {
      title:
        "Jours de covoiturage",
      value: loading
        ? "..."
        : formatNumber(
            stats.carpoolDays
          ),
      icon: "📅",
      bg: "bg-gray-50",
      border:
        "border-gray-200",
    },

    {
      title:
        "Économies estimées",
      value: loading
        ? "..."
        : formatMoney(
            stats.savings
          ),
      icon: "💶",
      bg: "bg-green-50",
      border:
        "border-green-100",
      info: true,
    },

    {
      title:
        "CO₂ estimé évité",
      value: loading
        ? "..."
        : `${formatNumber(
            stats.co2
          )} g`,
      icon: "🌱",
      bg: "bg-emerald-50",
      border:
        "border-emerald-100",
      info: true,
    },

    {
      title:
        "Déplacements individuels évités",
      value: loading
        ? "..."
        : `${formatNumber(
            stats.avoidedKilometers
          )} km`,
      icon: "🚙",
      bg: "bg-blue-50",
      border:
        "border-blue-100",
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Statistiques">
        <section>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6">
            🚗 Mon activité
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cards
              .slice(0, 3)
              .map(
                (card) => (
                  <div
                    key={
                      card.title
                    }
                    className={`${card.bg} ${card.border} border rounded-3xl p-7`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-4xl">
                        {
                          card.icon
                        }
                      </div>

                      <div className="text-3xl font-black text-gray-900 text-right">
                        {
                          card.value
                        }
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">
                      {
                        card.title
                      }
                    </h3>
                  </div>
                )
              )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6">
            💶 Mes économies
          </h2>

          <div className="bg-green-50 border border-green-100 rounded-3xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="text-5xl mb-4">
                  💶
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Économies estimées
                </h3>

                <p className="text-gray-600 mt-2">
                  Grâce aux kilomètres
                  parcourus en covoiturage.
                </p>
              </div>

              <div className="text-4xl lg:text-5xl font-black text-gray-900">
                {loading
                  ? "..."
                  : formatMoney(
                      stats.savings
                    )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-green-200 text-sm text-gray-600">
              <p>
                ⓘ Estimation basée sur
                un coût de référence de{" "}
                <strong>
                  {COST_PER_KM
                    .toFixed(2)
                    .replace(
                      ".",
                      ","
                    )}{" "}
                  €/km
                </strong>
                .
              </p>

              <p className="mt-1">
                Cette valeur constitue
                une estimation et ne
                correspond pas
                nécessairement au coût
                réel de votre véhicule.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6">
            🌱 Mon impact
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-5xl mb-4">
                    🌱
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    CO₂ estimé évité
                  </h3>

                  <p className="text-gray-600 mt-2">
                    Grâce aux déplacements
                    réalisés en covoiturage.
                  </p>
                </div>

                <div className="text-3xl lg:text-4xl font-black text-gray-900 text-right">
                  {loading
                    ? "..."
                    : `${formatNumber(
                        stats.co2
                      )} g`}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-emerald-200 text-sm text-gray-600">
                <p>
                  ⓘ Calcul basé sur un
                  facteur conventionnel de{" "}
                  <strong>
                    {CO2_PER_KM} g de CO₂/km
                  </strong>
                  pour une voiture
                  particulière.
                </p>

                <p className="mt-1">
                  Il s'agit d'une estimation
                  et non d'une mesure exacte
                  des émissions du véhicule.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-5xl mb-4">
                    🚙
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">
                    Déplacements individuels évités
                  </h3>

                  <p className="text-gray-600 mt-2">
                    Kilomètres qui ont pu être
                    mutualisés grâce au
                    covoiturage.
                  </p>
                </div>

                <div className="text-3xl lg:text-4xl font-black text-gray-900 text-right">
                  {loading
                    ? "..."
                    : `${formatNumber(
                        stats.avoidedKilometers
                      )} km`}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6">
            🌍 Impact collectif
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-7">
              <p className="text-gray-500 text-sm mb-2">
                Trajets partagés
              </p>

              <p className="text-4xl font-black text-gray-900">
                {loading
                  ? "..."
                  : formatNumber(
                      stats.collectiveTrips
                    )}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-7">
              <p className="text-gray-500 text-sm mb-2">
                Kilomètres mutualisés
              </p>

              <p className="text-4xl font-black text-gray-900">
                {loading
                  ? "..."
                  : `${formatNumber(
                      stats.collectiveKilometers
                    )} km`}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-7">
              <p className="text-gray-500 text-sm mb-2">
                Économies estimées
              </p>

              <p className="text-4xl font-black text-gray-900">
                {loading
                  ? "..."
                  : formatMoney(
                      stats.collectiveSavings
                    )}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-7">
              <p className="text-gray-500 text-sm mb-2">
                CO₂ estimé évité
              </p>

              <p className="text-4xl font-black text-gray-900">
                {loading
                  ? "..."
                  : `${formatNumber(
                      stats.collectiveCo2
                    )} g`}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-pink-600 to-red-500 rounded-3xl p-8 text-white">
            <h3 className="text-2xl lg:text-3xl font-black mb-4">
              Une mobilité plus collaborative
            </h3>

            <p className="text-base lg:text-lg leading-relaxed opacity-95">
              Ces statistiques permettent de
              mesurer concrètement l'activité
              de covoiturage et son impact
              économique et environnemental.
            </p>
          </div>
        </section>

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            Les économies et émissions de CO₂
            sont des estimations calculées selon
            les paramètres de référence
            d'EnVoiture.
          </p>
        </div>
      </Card>
    </div>
  );
}