"use client";

import { useEffect, useState } from "react";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";

export default function StatisticsPage() {
  const { profile, loading: profileLoading } = useAuth();

  const [stats, setStats] = useState({
    trips: 0,
    carpoolers: 0,
    contacts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!profile?.id) {
        return;
      }

      setLoading(true);

      try {
        /*
         * --------------------------------------------------
         * TRAJETS RÉALISÉS
         * --------------------------------------------------
         *
         * Un trajet n'est considéré comme réalisé que
         * lorsqu'il possède le statut TERMINE.
         */

        const { data: driverTrips, error: driverTripsError } =
          await supabase
            .from("trajets")
            .select("id")
            .eq("conducteur_id", profile.id)
            .eq("statut", "TERMINE");

        if (driverTripsError) {
          throw driverTripsError;
        }

        const { data: participations, error: participationsError } =
          await supabase
            .from("participations")
            .select(`
              trajet_id,
              statut,
              trajets (
                id,
                conducteur_id,
                statut
              )
            `)
            .eq("utilisateur_id", profile.id)
            .eq("statut", "ACCEPTEE");

        if (participationsError) {
          throw participationsError;
        }

        /*
         * Les trajets auxquels l'utilisateur a participé
         * sont retenus uniquement lorsqu'ils sont terminés.
         */
        const passengerTrips = (participations || [])
          .filter(
            (participation) =>
              participation.trajets?.statut === "TERMINE"
          )
          .map((participation) => participation.trajet_id);

        const realizedTripIds = new Set([
          ...(driverTrips || []).map((trip) => trip.id),
          ...passengerTrips,
        ]);

        /*
         * --------------------------------------------------
         * COVOITUREURS
         * --------------------------------------------------
         *
         * On compte les personnes distinctes avec lesquelles
         * l'utilisateur a effectivement réalisé un covoiturage.
         *
         * Conducteur :
         *   → les participants dont la participation est
         *     acceptée sur un trajet terminé.
         *
         * Passager :
         *   → le conducteur du trajet terminé.
         */

        const carpoolerIds = new Set();

        const driverTripIds = (driverTrips || []).map(
          (trip) => trip.id
        );

        if (driverTripIds.length > 0) {
          const { data: passengerParticipations, error } =
            await supabase
              .from("participations")
              .select("utilisateur_id, trajet_id")
              .in("trajet_id", driverTripIds)
              .eq("statut", "ACCEPTEE")
              .neq("utilisateur_id", profile.id);

          if (error) {
            throw error;
          }

          (passengerParticipations || []).forEach(
            (participation) => {
              if (participation.utilisateur_id) {
                carpoolerIds.add(participation.utilisateur_id);
              }
            }
          );
        }

        if (passengerTrips.length > 0) {
          const { data: passengerTripDetails, error } =
            await supabase
              .from("trajets")
              .select("id, conducteur_id")
              .in("id", passengerTrips);

          if (error) {
            throw error;
          }

          (passengerTripDetails || []).forEach((trip) => {
            if (
              trip.conducteur_id &&
              trip.conducteur_id !== profile.id
            ) {
              carpoolerIds.add(trip.conducteur_id);
            }
          });
        }

        /*
         * --------------------------------------------------
         * CONTACTS
         * --------------------------------------------------
         *
         * Seuls les contacts actifs sont comptabilisés.
         * L'archivage d'un contact ne supprime pas son
         * historique, mais il ne fait plus partie des
         * contacts actifs.
         */

        const { count: contactsCount, error: contactsError } =
          await supabase
            .from("contacts")
            .select("id", { count: "exact", head: true })
            .eq("utilisateur_id", profile.id)
            .is("archived_at", null);

        if (contactsError) {
          throw contactsError;
        }

        setStats({
          trips: realizedTripIds.size,
          carpoolers: carpoolerIds.size,
          contacts: contactsCount || 0,
        });
      } catch (error) {
        console.error(
          "Erreur récupération des statistiques :",
          error
        );

        setStats({
          trips: 0,
          carpoolers: 0,
          contacts: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [profile?.id]);

  if (profileLoading) {
    return (
      <LoadingScreen text="Chargement des statistiques..." />
    );
  }

  if (!profile) {
    return (
      <LoadingScreen text="Chargement du profil..." />
    );
  }

  const formatNumber = (value) =>
    new Intl.NumberFormat("fr-FR").format(value);

  const cards = [
    {
      title: "Trajets réalisés",
      value: stats.trips,
      icon: "🚗",
      bg: "bg-pink-50",
      border: "border-pink-100",
      description:
        "Trajets auxquels vous avez effectivement participé et qui sont terminés.",
    },
    {
      title: "Covoitureurs",
      value: stats.carpoolers,
      icon: "👥",
      bg: "bg-red-50",
      border: "border-red-100",
      description:
        "Personnes avec lesquelles vous avez effectivement réalisé un covoiturage.",
    },
    {
      title: "Contacts",
      value: stats.contacts,
      icon: "🤝",
      bg: "bg-gray-50",
      border: "border-gray-200",
      description:
        "Contacts actuellement présents dans votre liste de contacts.",
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Statistiques">
        <section>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">
            🚗 Mon activité
          </h2>

          <p className="text-gray-500 mb-6">
            Retrouvez ici les principaux indicateurs de votre activité
            de covoiturage sur EnVoiture.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`${card.bg} ${card.border} border rounded-3xl p-7`}
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="text-4xl">{card.icon}</div>

                  <div className="text-4xl font-black text-gray-900 text-right">
                    {loading ? "..." : formatNumber(card.value)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {card.title}
                </h3>

                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-7">
            <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-2">
              📍 Kilomètres et impact
            </h2>

            <p className="text-gray-600 leading-relaxed">
              Les kilomètres mutualisés, les économies estimées et le
              CO₂ évité seront calculés à partir d'une distance routière
              fiable pour chaque trajet. Cette partie sera activée une
              fois le calcul automatique des distances mis en place.
            </p>
          </div>
        </section>

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            Les statistiques d'activité sont calculées à partir des
            trajets, participations et contacts enregistrés dans EnVoiture.
          </p>
        </div>
      </Card>
    </div>
  );
}
