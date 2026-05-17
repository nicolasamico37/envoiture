"use client";

import Link from "next/link";

import {
  useState,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Card from "@/components/Card";

import LoadingScreen from "@/components/LoadingScreen";

import { profiles as initialProfiles } from "@/data/profiles";

import calculateCompatibility from "@/utils/calculateCompatibility";

import currentUser from "@/data/currentUser";

import getCurrentUserProfile from "@/utils/getCurrentUserProfile";

export default function ProfilesPage() {
  const router =
    useRouter();

  const [profiles, setProfiles] =
    useState(initialProfiles);

  const [search, setSearch] =
    useState("");

  const [filterDriver, setFilterDriver] =
    useState(false);

  const [
    currentProfile,
    setCurrentProfile,
  ] = useState(null);

  useEffect(() => {
    const savedProfiles =
      localStorage.getItem(
        "envoiture-profiles"
      );

    if (savedProfiles) {
      setProfiles(
        JSON.parse(savedProfiles)
      );
    }

    const profile =
      getCurrentUserProfile();

    setCurrentProfile(profile);
  }, []);

  const filteredProfiles =
    profiles.filter((profile) => {
      const matchesSearch =
        profile.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        profile.city
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        profile.destination
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesDriver =
        !filterDriver ||
        profile.conducteur;

      return (
        matchesSearch &&
        matchesDriver
      );
    });

  function addNotification(text) {
    const savedNotifications =
      JSON.parse(
        localStorage.getItem(
          "envoiture-notifications"
        ) || "[]"
      );

    const newNotification = {
      id: Date.now(),
      text,
      read: false,
    };

    localStorage.setItem(
      "envoiture-notifications",
      JSON.stringify([
        newNotification,
        ...savedNotifications,
      ])
    );
  }

  function handleMessage(profile) {
    const savedMessages =
      JSON.parse(
        localStorage.getItem(
          "envoiture-messages"
        ) || "[]"
      );

    let conversation =
      savedMessages.find(
        (item) =>
          item.name === profile.name
      );

    if (!conversation) {
      conversation = {
        id: Date.now(),
        name: profile.name,
        location: `${profile.city} → ${profile.destination}`,
        lastMessage:
          "Nouvelle conversation",
        messages: [],
      };

      localStorage.setItem(
        "envoiture-messages",
        JSON.stringify([
          ...savedMessages,
          conversation,
        ])
      );

      addNotification(
        `Nouvelle conversation avec ${profile.name}`
      );
    }

    localStorage.setItem(
      "envoiture-selected-conversation",
      conversation.id
    );

    router.push(
      "/messages"
    );
  }

  function renderSchedules(
    horaires
  ) {
    return Object.entries(
      horaires
    ).map(([day, values]) => (
      <div
        key={day}
        className="bg-gray-50 rounded-2xl p-4"
      >
        <h4 className="font-semibold text-gray-900 mb-2">
          {day}
        </h4>

        <div className="space-y-1 text-sm text-gray-600">
          <p>
            🚆 Prise de service :
            {" "}
            {
              values.priseService
            }
          </p>

          <p>
            🏠 Départ domicile :
            {" "}
            {
              values.departMaison
            }
          </p>

          <p>
            ↩️ Retour :
            {" "}
            {values.retour}
          </p>
        </div>
      </div>
    ));
  }

  if (!currentProfile) {
    return (
      <LoadingScreen text="Chargement des profils..." />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Profils">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 mb-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Rechercher un profil..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <button
              onClick={() =>
                setFilterDriver(
                  !filterDriver
                )
              }
              className={`w-full lg:w-fit px-6 py-3 rounded-2xl font-medium transition ${
                filterDriver
                  ? "bg-gradient-to-r from-pink-600 to-red-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Conducteurs uniquement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProfiles.map(
            (profile) => {
              const compatibility =
                profile.id !==
                currentUser.id
                  ? calculateCompatibility(
                      currentProfile,
                      profile
                    )
                  : null;

              return (
                <div
                  key={profile.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold">
                        {profile.avatar}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {profile.name}
                        </h2>

                        <p className="text-gray-500 mt-1">
                          {profile.role}
                        </p>

                        <p className="text-gray-500">
                          {profile.city}
                        </p>
                      </div>
                    </div>

                    {compatibility !==
                      null && (
                      <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold w-fit">
                        {
                          compatibility
                        }
                        %
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Destination
                      </h3>

                      <p className="text-gray-600">
                        {
                          profile.destination
                        }
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Horaires par jour
                      </h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {renderSchedules(
                          profile.horaires
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Disponibilités
                      </h3>

                      <div className="flex gap-3 flex-wrap">
                        {profile.days?.map(
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
                        Points de rencontre
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {profile.pointsRencontre?.map(
                          (point) => (
                            <div
                              key={point}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full"
                            >
                              📍 {point}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Bio
                      </h3>

                      <p className="text-gray-600 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>

                    {profile.id !==
                      currentUser.id && (
                      <div className="flex flex-col lg:flex-row gap-4 pt-4">
                        <button
                          onClick={() =>
                            handleMessage(
                              profile
                            )
                          }
                          className="flex-1 bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold"
                        >
                          Envoyer un message
                        </button>

                        <Link
                          href="/messages"
                          className="flex items-center justify-center px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50"
                        >
                          💬
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>
    </div>
  );
}