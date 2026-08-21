"use client";

import { useEffect, useState } from "react";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";

import { trips } from "@/data/trips";

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

    useEffect(() => {
    async function loadNotifications() {
      if (!profile?.id) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          titre,
          message,
          lu,
          trajet_id,
          participation_id,
          created_at
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "Erreur récupération notifications dashboard :",
          error
        );
        return;
      }

      setNotifications(
        data || []
      );
    }

    loadNotifications();
  }, [
    profile?.id,
  ]);

  if (loading) {
    return (
      <LoadingScreen text="Chargement du dashboard..." />
    );
  }

  if (!profile) {
    return (
      <LoadingScreen text="Chargement du profil..." />
    );
  }

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.read
    );

  const initials =
    `${profile.first_name?.[0] ?? ""}${
      profile.last_name?.[0] ?? ""
    }`.toUpperCase();

  return (
    <div className="space-y-8">
      <Card
        title={`Bienvenue ${profile.first_name} 👋`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-pink-50 border border-pink-100 rounded-3xl p-6">
            <p className="text-sm text-pink-600 font-semibold mb-3">
              🚗 Trajets disponibles
            </p>

            <h2 className="text-5xl font-black text-gray-900">
              {trips.length}
            </h2>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <p className="text-sm text-red-600 font-semibold mb-3">
              🚘 Places proposées
            </p>

            <h2 className="text-5xl font-black text-gray-900">
              {profile.seats}
            </h2>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
            <p className="text-sm text-gray-600 font-semibold mb-3">
              🔔 Notifications
            </p>

            <h2 className="text-5xl font-black text-gray-900">
              {unreadNotifications.length}
            </h2>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Mon profil">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.first_name}{" "}
                  {profile.last_name}
                </h2>

                <p className="text-gray-500">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                🏢 Établissement :{" "}
                <span className="font-semibold">
                  {profile.establishment ||
                    "Non renseigné"}
                </span>
              </p>

              <p>
                📍 Ville de résidence:{" "}
                <span className="font-semibold">
                  {profile.zone ||
                    "Non renseignée"}
                </span>
              </p>

              <p>
                🚗 Places disponibles :{" "}
                <span className="font-semibold">
                  {profile.seats ?? 0}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card title="Notifications récentes">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500">
                Aucune notification
              </p>
            ) : (
              notifications
                .slice(0, 5)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-2xl p-4 ${
                      notification.read
                        ? "bg-white border-gray-200"
                        : "bg-pink-50 border-pink-100"
                    }`}
                  >
                    <p className="text-gray-800">
                      {notification.text}
                    </p>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}