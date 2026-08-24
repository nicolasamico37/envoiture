"use client";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Chargement du dashboard..." />;
  }

  if (!profile) {
    return <LoadingScreen text="Chargement du profil..." />;
  }

  return (
    <div className="space-y-8">
      <Card title={`Bienvenue ${profile.first_name} 👋`}>
        <div className="space-y-6">
          <div className="rounded-3xl border border-pink-100 bg-pink-50 p-6">
            <p className="text-gray-700 leading-relaxed">
              Bienvenue dans votre espace EnVoiture.
            </p>

            <p className="text-gray-600 leading-relaxed mt-2">
              Retrouvez vos trajets, vos préférences, vos messages,
              vos notifications et votre activité depuis le menu.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              🚗 EnVoiture
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              Un espace réservé aux agents SNCF pour organiser leurs
              trajets et faciliter le covoiturage entre collègues.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
