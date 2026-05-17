"use client";

import {
  useState,
  useEffect,
} from "react";

import Card from "@/components/Card";

import LoadingScreen from "@/components/LoadingScreen";

import { profiles } from "@/data/profiles";
import { trips } from "@/data/trips";

import getCurrentUserProfile from "@/utils/getCurrentUserProfile";

export default function DashboardPage() {
  const [notifications, setNotifications] =
    useState([]);

  const [currentProfile, setCurrentProfile] =
    useState(null);

  useEffect(() => {
    const savedNotifications =
      JSON.parse(
        localStorage.getItem(
          "envoiture-notifications"
        ) || "[]"
      );

    setNotifications(
      savedNotifications
    );

    const profile =
      getCurrentUserProfile();

    setCurrentProfile(profile);
  }, []);

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.read
    );

  if (!currentProfile) {
    return (
      <LoadingScreen text="Chargement du dashboard..." />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="space-y-8">
        <Card
          title={`Bienvenue ${currentProfile.name} 👋`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                👥 Profils actifs
              </p>

              <h2 className="text-5xl font-black text-gray-900">
                {profiles.length}
              </h2>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">
                🔔 Notifications
              </p>

              <h2 className="text-5xl font-black text-gray-900">
                {
                  unreadNotifications.length
                }
              </h2>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Mon profil">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-3xl font-bold">
                  {
                    currentProfile.avatar
                  }
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {
                      currentProfile.name
                    }
                  </h2>

                  <p className="text-gray-500">
                    {
                      currentProfile.role
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-gray-700">
                <p>
                  📍 Ville :
                  {" "}
                  <span className="font-semibold">
                    {
                      currentProfile.city
                    }
                  </span>
                </p>

                <p>
                  🎯 Destination :
                  {" "}
                  <span className="font-semibold">
                    {
                      currentProfile.destination
                    }
                  </span>
                </p>
              </div>
            </div>
          </Card>

          <Card title="Notifications récentes">
            <div className="space-y-4">
              {notifications.length ===
              0 ? (
                <p className="text-gray-500">
                  Aucune notification
                </p>
              ) : (
                notifications
                  .slice(0, 5)
                  .map(
                    (
                      notification
                    ) => (
                      <div
                        key={
                          notification.id
                        }
                        className={`border rounded-2xl p-4 ${
                          notification.read
                            ? "bg-white border-gray-200"
                            : "bg-pink-50 border-pink-100"
                        }`}
                      >
                        <p className="text-gray-800">
                          {
                            notification.text
                          }
                        </p>
                      </div>
                    )
                  )
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}