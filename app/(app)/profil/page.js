"use client";

import {
  useState,
  useEffect,
} from "react";

import Card from "@/components/Card";

import LoadingScreen from "@/components/LoadingScreen";

import { profiles as initialProfiles } from "@/data/profiles";

import currentUser from "@/data/currentUser";

export default function ProfilePage() {
  const [profile, setProfile] =
    useState(null);

  useEffect(() => {
    const savedProfiles =
      localStorage.getItem(
        "envoiture-profiles"
      );

    const profiles =
      savedProfiles
        ? JSON.parse(savedProfiles)
        : initialProfiles;

    const currentProfile =
      profiles.find(
        (profile) =>
          profile.id ===
          currentUser.id
      );

    setProfile(
      currentProfile
    );
  }, []);

  function handleSave() {
    const savedProfiles =
      JSON.parse(
        localStorage.getItem(
          "envoiture-profiles"
        ) || "[]"
      );

    let profiles =
      savedProfiles.length > 0
        ? savedProfiles
        : initialProfiles;

    profiles = profiles.map(
      (item) => {
        if (
          item.id ===
          currentUser.id
        ) {
          return profile;
        }

        return item;
      }
    );

    localStorage.setItem(
      "envoiture-profiles",
      JSON.stringify(profiles)
    );

    alert(
      "Profil enregistré ✅"
    );
  }

  function handleReset() {
    const confirmed =
      confirm(
        "Réinitialiser toutes les données de test ?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "envoiture-trips"
    );

    localStorage.removeItem(
      "envoiture-joined-trips"
    );

    localStorage.removeItem(
      "envoiture-messages"
    );

    localStorage.removeItem(
      "envoiture-notifications"
    );

    localStorage.removeItem(
      "envoiture-selected-conversation"
    );

    localStorage.removeItem(
      "envoiture-profiles"
    );

    window.location.reload();
  }

  function updateSchedule(
    day,
    field,
    value
  ) {
    setProfile({
      ...profile,

      horaires: {
        ...profile.horaires,

        [day]: {
          ...profile.horaires[
            day
          ],

          [field]: value,
        },
      },
    });
  }

  if (!profile) {
    return (
      <LoadingScreen text="Chargement du profil..." />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Mon profil">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-4xl font-bold">
              {profile.avatar}
            </div>

            <div className="flex-1 w-full space-y-4">
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3"
              />

              <input
                type="text"
                value={
                  profile.role
                }
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    role:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3"
              />
            </div>
          </div>

          <input
            type="text"
            value={profile.city}
            onChange={(e) =>
              setProfile({
                ...profile,
                city:
                  e.target.value,
              })
            }
            className="w-full border border-gray-200 rounded-2xl px-5 py-3"
          />

          <input
            type="text"
            value={
              profile.destination
            }
            onChange={(e) =>
              setProfile({
                ...profile,
                destination:
                  e.target.value,
              })
            }
            className="w-full border border-gray-200 rounded-2xl px-5 py-3"
          />

          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile({
                ...profile,
                bio:
                  e.target.value,
              })
            }
            className="w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[140px]"
          />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Horaires
            </h2>

            <div className="space-y-6">
              {Object.entries(
                profile.horaires
              ).map(
                ([day, values]) => (
                  <div
                    key={day}
                    className="border border-gray-200 rounded-3xl p-5"
                  >
                    <h3 className="font-semibold text-gray-900 mb-5 text-lg">
                      {day}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Prise de service
                        </label>

                        <input
                          type="time"
                          value={
                            values.priseService
                          }
                          onChange={(e) =>
                            updateSchedule(
                              day,
                              "priseService",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Départ domicile
                        </label>

                        <input
                          type="time"
                          value={
                            values.departMaison
                          }
                          onChange={(e) =>
                            updateSchedule(
                              day,
                              "departMaison",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Retour
                        </label>

                        <input
                          type="time"
                          value={
                            values.retour
                          }
                          onChange={(e) =>
                            updateSchedule(
                              day,
                              "retour",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-200 rounded-2xl px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold"
            >
              Enregistrer le profil
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-red-100 text-red-700 px-5 py-4 rounded-2xl font-semibold"
            >
              Réinitialiser les données
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}