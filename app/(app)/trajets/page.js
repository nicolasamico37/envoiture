"use client";

import {
  useState,
  useEffect,
} from "react";

import Card from "@/components/Card";

import LoadingScreen from "@/components/LoadingScreen";

import { trips as initialTrips } from "@/data/trips";

import getCurrentUserProfile from "@/utils/getCurrentUserProfile";

const availableDays = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

export default function TripsPage() {
  const [trips, setTrips] =
    useState(initialTrips);

  const [joinedTrips, setJoinedTrips] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [currentProfile, setCurrentProfile] =
    useState(null);

  const [newTrip, setNewTrip] =
    useState({
      driver: "",

      from: "",

      to: "",

      departure: "",

      returnTime: "",

      seats: 1,

      meetingPoint: "",

      days: [],
    });

  useEffect(() => {
    const savedTrips =
      localStorage.getItem(
        "envoiture-trips"
      );

    if (savedTrips) {
      setTrips(
        JSON.parse(savedTrips)
      );
    }

    const savedJoinedTrips =
      localStorage.getItem(
        "envoiture-joined-trips"
      );

    if (savedJoinedTrips) {
      setJoinedTrips(
        JSON.parse(savedJoinedTrips)
      );
    }

    const profile =
      getCurrentUserProfile();

    setCurrentProfile(profile);

    setNewTrip((previous) => ({
      ...previous,

      driver: profile.name,

      from: profile.city,

      to: profile.destination,
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "envoiture-trips",
      JSON.stringify(trips)
    );
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(
      "envoiture-joined-trips",
      JSON.stringify(joinedTrips)
    );
  }, [joinedTrips]);

  const filteredTrips =
    trips.filter((trip) => {
      return (
        trip.driver
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        trip.from
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        trip.to
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    });

  const myTrips =
    filteredTrips.filter((trip) =>
      joinedTrips.includes(trip.id)
    );

  const availableTrips =
    filteredTrips.filter(
      (trip) =>
        !joinedTrips.includes(
          trip.id
        )
    );

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

  function handleJoinTrip(trip) {
    if (trip.seats <= 0) {
      return;
    }

    if (
      joinedTrips.includes(trip.id)
    ) {
      return;
    }

    const updatedTrips =
      trips.map((item) => {
        if (item.id !== trip.id) {
          return item;
        }

        return {
          ...item,
          seats: item.seats - 1,
        };
      });

    setTrips(updatedTrips);

    setJoinedTrips([
      ...joinedTrips,
      trip.id,
    ]);

    addNotification(
      `Vous avez rejoint le trajet de ${trip.driver}`
    );
  }

  function handleLeaveTrip(trip) {
    const updatedTrips =
      trips.map((item) => {
        if (item.id !== trip.id) {
          return item;
        }

        return {
          ...item,
          seats: item.seats + 1,
        };
      });

    setTrips(updatedTrips);

    setJoinedTrips(
      joinedTrips.filter(
        (id) => id !== trip.id
      )
    );

    addNotification(
      `Vous avez quitté le trajet de ${trip.driver}`
    );
  }

  function handleDeleteTrip(id) {
    setTrips(
      trips.filter(
        (trip) => trip.id !== id
      )
    );

    setJoinedTrips(
      joinedTrips.filter(
        (tripId) => tripId !== id
      )
    );

    addNotification(
      "Trajet supprimé"
    );
  }

  function toggleDay(day) {
    if (
      newTrip.days.includes(day)
    ) {
      setNewTrip({
        ...newTrip,

        days:
          newTrip.days.filter(
            (item) =>
              item !== day
          ),
      });

      return;
    }

    setNewTrip({
      ...newTrip,

      days: [
        ...newTrip.days,
        day,
      ],
    });
  }

  function handleCreateTrip() {
    if (
      !newTrip.from ||
      !newTrip.to ||
      !newTrip.departure
    ) {
      return;
    }

    const createdTrip = {
      id: Date.now(),

      ...newTrip,

      seats: Number(
        newTrip.seats
      ),

      initialSeats: Number(
        newTrip.seats
      ),
    };

    setTrips([
      createdTrip,
      ...trips,
    ]);

    addNotification(
      "Nouveau trajet proposé"
    );

    setNewTrip({
      driver:
        currentProfile.name,

      from:
        currentProfile.city,

      to:
        currentProfile.destination,

      departure: "",

      returnTime: "",

      seats: 1,

      meetingPoint: "",

      days: [],
    });

    setShowForm(false);
  }

  function renderTripCard(
    trip,
    alreadyJoined
  ) {
    const isMine =
      currentProfile &&
      trip.driver ===
        currentProfile.name;

    return (
      <div
        key={trip.id}
        className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {trip.from}
            </h2>

            <p className="text-gray-500 text-lg">
              →
            </p>

            <h2 className="text-2xl font-bold text-gray-900">
              {trip.to}
            </h2>
          </div>

          <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold w-fit">
            🚗 {trip.seats} place
            {trip.seats > 1
              ? "s"
              : ""}
          </div>
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            👤 Conducteur :
            {" "}
            <span className="font-semibold">
              {trip.driver}
            </span>
          </p>

          <p>
            ⏰ Départ :
            {" "}
            <span className="font-semibold">
              {trip.departure}
            </span>
          </p>

          <p>
            ↩️ Retour :
            {" "}
            <span className="font-semibold">
              {trip.returnTime}
            </span>
          </p>

          <p>
            📍 Point de rencontre :
            {" "}
            <span className="font-semibold">
              {trip.meetingPoint}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Jours concernés
          </h3>

          <div className="flex flex-wrap gap-3">
            {trip.days.map(
              (day) => (
                <div
                  key={day}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full"
                >
                  {day}
                </div>
              )
            )}
          </div>
        </div>

        {isMine ? (
          <button
            onClick={() =>
              handleDeleteTrip(
                trip.id
              )
            }
            className="w-full mt-8 bg-red-100 text-red-700 px-5 py-4 rounded-2xl font-semibold"
          >
            Supprimer ce trajet
          </button>
        ) : alreadyJoined ? (
          <button
            onClick={() =>
              handleLeaveTrip(
                trip
              )
            }
            className="w-full mt-8 bg-red-100 text-red-700 px-5 py-4 rounded-2xl font-semibold"
          >
            Annuler ce trajet
          </button>
        ) : (
          <button
            onClick={() =>
              handleJoinTrip(trip)
            }
            disabled={
              trip.seats <= 0
            }
            className={`w-full mt-8 px-5 py-4 rounded-2xl font-semibold transition ${
              trip.seats <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-600 to-red-500 text-white"
            }`}
          >
            {trip.seats <= 0
              ? "Trajet complet"
              : "Rejoindre ce trajet"}
          </button>
        )}
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <LoadingScreen text="Chargement des trajets..." />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Trajets proposés">
        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher un trajet..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full border border-gray-200 rounded-2xl px-5 py-3"
          />

          <button
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
            className="w-full lg:w-fit bg-gradient-to-r from-pink-600 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Proposer un trajet
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 mb-10 space-y-5">
            <input
              type="text"
              placeholder="Ville de départ"
              value={newTrip.from}
              onChange={(e) =>
                setNewTrip({
                  ...newTrip,

                  from: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <input
              type="text"
              placeholder="Destination"
              value={newTrip.to}
              onChange={(e) =>
                setNewTrip({
                  ...newTrip,

                  to: e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="time"
                value={
                  newTrip.departure
                }
                onChange={(e) =>
                  setNewTrip({
                    ...newTrip,

                    departure:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3"
              />

              <input
                type="time"
                value={
                  newTrip.returnTime
                }
                onChange={(e) =>
                  setNewTrip({
                    ...newTrip,

                    returnTime:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3"
              />
            </div>

            <input
              type="number"
              min="1"
              value={newTrip.seats}
              onChange={(e) =>
                setNewTrip({
                  ...newTrip,

                  seats:
                    e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <input
              type="text"
              placeholder="Point de rencontre"
              value={
                newTrip.meetingPoint
              }
              onChange={(e) =>
                setNewTrip({
                  ...newTrip,

                  meetingPoint:
                    e.target.value,
                })
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Jours du trajet
              </h3>

              <div className="flex flex-wrap gap-3">
                {availableDays.map(
                  (day) => {
                    const selected =
                      newTrip.days.includes(
                        day
                      );

                    return (
                      <button
                        key={day}
                        onClick={() =>
                          toggleDay(
                            day
                          )
                        }
                        className={`px-4 py-2 rounded-full transition ${
                          selected
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <button
              onClick={
                handleCreateTrip
              }
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold"
            >
              Créer le trajet
            </button>
          </div>
        )}

        {myTrips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes trajets
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {myTrips.map((trip) =>
                renderTripCard(
                  trip,
                  true
                )
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Trajets disponibles
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {availableTrips.map(
              (trip) =>
                renderTripCard(
                  trip,
                  false
                )
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}