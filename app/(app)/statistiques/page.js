"use client";

import {
  useEffect,
  useState,
} from "react";

import Card from "@/components/Card";

export default function StatisticsPage() {
  const [stats, setStats] =
    useState({
      trips: 0,
      profiles: 0,
      messages: 0,
      notifications: 0,
    });

  useEffect(() => {
    const trips =
      JSON.parse(
        localStorage.getItem(
          "envoiture-trips"
        ) || "[]"
      );

    const profiles =
      JSON.parse(
        localStorage.getItem(
          "envoiture-profiles"
        ) || "[]"
      );

    const messages =
      JSON.parse(
        localStorage.getItem(
          "envoiture-messages"
        ) || "[]"
      );

    const notifications =
      JSON.parse(
        localStorage.getItem(
          "envoiture-notifications"
        ) || "[]"
      );

    const totalMessages =
      messages.reduce(
        (total, conversation) =>
          total +
          conversation.messages.length,
        0
      );

    setStats({
      trips: trips.length,
      profiles:
        profiles.length,
      messages:
        totalMessages,
      notifications:
        notifications.length,
    });
  }, []);

  const cards = [
    {
      title:
        "Trajets disponibles",
      value: stats.trips,
      icon: "🚗",
      bg: "bg-pink-50",
      border:
        "border-pink-100",
    },

    {
      title:
        "Profils actifs",
      value: stats.profiles,
      icon: "👥",
      bg: "bg-red-50",
      border:
        "border-red-100",
    },

    {
      title:
        "Messages envoyés",
      value: stats.messages,
      icon: "💬",
      bg: "bg-gray-50",
      border:
        "border-gray-200",
    },

    {
      title:
        "Notifications",
      value:
        stats.notifications,
      icon: "🔔",
      bg: "bg-yellow-50",
      border:
        "border-yellow-100",
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Statistiques">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`${card.bg} ${card.border} border rounded-3xl p-8`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-5xl">
                  {card.icon}
                </div>

                <div className="text-5xl font-black text-gray-900">
                  {card.value}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {card.title}
              </h2>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-r from-pink-600 to-red-500 rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-black mb-4">
            Activité de la plateforme
          </h2>

          <p className="text-lg leading-relaxed opacity-95">
            Ces statistiques permettent de suivre l’activité globale de la plateforme EnVoiture et l’évolution de la mobilité collaborative entre collègues.
          </p>
        </div>
      </Card>
    </div>
  );
}