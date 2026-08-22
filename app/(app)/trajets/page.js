"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const DAY_ORDER = {
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
  dimanche: 7,
};

const DAY_LABELS = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

function formatTime(time) {
  if (!time) return "—";
  return time.slice(0, 5);
}

function formatDate(date) {
  if (!date) return "";

  const parsed =
    new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getDayFromDate(date) {
  if (!date) return null;

  const parsed =
    new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const days = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  return days[parsed.getDay()];
}

function getVehicleLabel(vehicle) {
  if (!vehicle) return "Véhicule";

  if (vehicle.libelle) {
    return vehicle.libelle;
  }

  const label = [
    vehicle.marque,
    vehicle.modele,
  ]
    .filter(Boolean)
    .join(" ");

  return label || "Véhicule";
}

function getParticipationStatusLabel(status) {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "acceptee":
      return "Acceptée";
    case "refusee":
      return "Refusée";
    case "annulee":
      return "Annulée";
    default:
      return status;
  }
}

function getTodayString() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function addDays(dateString, days) {
  const date =
    new Date(`${dateString}T00:00:00`);

  date.setDate(
    date.getDate() + days
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getDatesBetween(
  startDate,
  endDate
) {
  const dates = [];

  let current = startDate;

  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}

export default function TripsPage() {
  const {
    profile,
    loading: authLoading,
  } = useAuth();

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    savingTrip,
    setSavingTrip,
  ] = useState(false);

  const [
    savingMultipleTrips,
    setSavingMultipleTrips,
  ] = useState(false);

  const [
    joiningTripId,
    setJoiningTripId,
  ] = useState(null);

  const [
    processingParticipationId,
    setProcessingParticipationId,
  ] = useState(null);

  const [
    trips,
    setTrips,
  ] = useState([]);

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    preferences,
    setPreferences,
  ] = useState(null);

  const [
    habits,
    setHabits,
  ] = useState([]);

  const [
    parkings,
    setParkings,
  ] = useState([]);

  const [
    profileData,
    setProfileData,
  ] = useState(null);

  const [
    participantProfiles,
    setParticipantProfiles,
  ] = useState({});

  const [
    myParticipations,
    setMyParticipations,
  ] = useState([]);

  const [
    driverParticipations,
    setDriverParticipations,
  ] = useState([]);

  const [
    acceptedParticipationCounts,
    setAcceptedParticipationCounts,
  ] = useState({});

  const [
    driverHabits,
    setDriverHabits,
  ] = useState({});

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    showMultipleForm,
    setShowMultipleForm,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedDriverId,
    setSelectedDriverId,
  ] = useState("");

  const [
    selectedDriverName,
    setSelectedDriverName,
  ] = useState("");

  const [
    selectedTripId,
    setSelectedTripId,
  ] = useState("");

  const [
    expandedTripId,
    setExpandedTripId,
  ] = useState("");
  
  const [
    message,
    setMessage,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    tripToCancel,
    setTripToCancel,
  ] = useState(null);

  const [
    selectedTripIds,
    setSelectedTripIds,
  ] = useState([]);

  const [
    showBulkCancelModal,
    setShowBulkCancelModal,
  ] = useState(false);

  const [
    bulkCancelSummary,
    setBulkCancelSummary,
  ] = useState(null);

  const [
    bulkCancelling,
    setBulkCancelling,
  ] = useState(false);
  
  const [
    showScrollButtons,
    setShowScrollButtons,
  ] = useState(false);

  const [
    selectedDay,
    setSelectedDay,
  ] = useState("");

  const [
    newTrip,
    setNewTrip,
  ] = useState({
    date_trajet: "",
    heure_depart: "",
    heure_prise_service: "",
    heure_retour: "",
    parking_travail_id: "",
    vehicule_id: "",
    commentaire: "",
  });

  const [
    multipleTripForm,
    setMultipleTripForm,
  ] = useState({
    date_debut: "",
    date_fin: "",
    jours: [],
    vehicule_id: "",
    parking_travail_id: "",
    commentaire: "",
  });

  const [
    multipleTrips,
    setMultipleTrips,
  ] = useState([]);

  /*
   * --------------------------------------------------
   * PARAMÈTRES URL
   * --------------------------------------------------
   */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const conducteurId =
      params.get("conducteur") || "";

    const trajetId =
      params.get("trajet_id") || "";

    setSelectedDriverId(
      conducteurId
    );

    setSelectedTripId(
      trajetId
    );

    if (!conducteurId) {
      setSelectedDriverName("");
      return;
    }

    async function loadSelectedDriver() {
      const {
        data,
        error,
      } = await supabase
        .from("profils")
        .select(
          "prenom, nom"
        )
        .eq(
          "utilisateur_id",
          conducteurId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Erreur conducteur :",
          error
        );
        return;
      }

      setSelectedDriverName(
        `${data?.prenom || ""} ${
          data?.nom || ""
        }`.trim()
      );
    }

    loadSelectedDriver();
  }, []);

  /*
   * --------------------------------------------------
   * CHARGEMENT
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    loadData();
  }, [profile?.id]);

  useEffect(() => {
    if (
      loadingData ||
      !selectedTripId ||
      trips.length === 0
    ) {
      return;
    }

    const tripExists =
      trips.some(
        (trip) =>
          trip.id ===
          selectedTripId
      );

    if (!tripExists) {
      return;
    }

    const timeout =
      setTimeout(() => {
        document
          .getElementById(
            `trajet-${selectedTripId}`
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    loadingData,
    selectedTripId,
    trips,
  ]);

useEffect(() => {
  function handleScroll() {
    setShowScrollButtons(
      window.scrollY > 200
    );
  }

  handleScroll();

  window.addEventListener(
    "scroll",
    handleScroll
  );

  return () => {
    window.removeEventListener(
      "scroll",
      handleScroll
    );
  };
}, []);

  async function loadData() {
    setLoadingData(true);
    setMessage("");

    try {
      const {
        data: currentProfile,
        error: profileError,
      } = await supabase
        .from("profils")
        .select(`
          utilisateur_id,
          nom,
          prenom,
          secteur,
          site_travail_id
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      setProfileData(
        currentProfile
      );

      const {
        data: preferencesData,
        error: preferencesError,
      } = await supabase
        .from(
          "preferences_utilisateur"
        )
        .select(`
          peut_conduire,
          peut_etre_passager,
          vehicule_defaut_id,
          parking_travail_id
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (preferencesError) {
        throw preferencesError;
      }

      const safePreferences =
        preferencesData || {
          peut_conduire: false,
          peut_etre_passager: true,
          vehicule_defaut_id: null,
          parking_travail_id: null,
        };

      setPreferences(
        safePreferences
      );

      const {
        data: habitsData,
        error: habitsError,
      } = await supabase
        .from(
          "habitudes_deplacement"
        )
        .select(`
          id,
          jour,
          actif,
          depart_domicile,
          prise_service,
          retour
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .order("jour");

      if (habitsError) {
        throw habitsError;
      }

      const sortedHabits =
        (
          habitsData || []
        ).sort(
          (a, b) =>
            (DAY_ORDER[a.jour] || 99) -
            (DAY_ORDER[b.jour] || 99)
        );

      setHabits(
        sortedHabits
      );

      const {
        data: vehicleData,
        error: vehicleError,
      } = await supabase
        .from("vehicules")
        .select(`
          id,
          libelle,
          marque,
          modele,
          couleur,
          places_proposees,
          statut
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .eq(
          "statut",
          "actif"
        )
        .is(
          "archived_at",
          null
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );

      if (vehicleError) {
        throw vehicleError;
      }

      setVehicles(
        vehicleData || []
      );

      let parkingData = [];

      if (
        currentProfile?.site_travail_id
      ) {
        const {
          data,
          error,
        } = await supabase
          .from(
            "sncf_parkings"
          )
          .select(`
            id,
            site_id,
            name,
            latitude,
            longitude,
            active
          `)
          .eq(
            "site_id",
            currentProfile.site_travail_id
          )
          .eq(
            "active",
            true
          )
          .order(
            "id",
            {
              ascending: true,
            }
          );

        if (error) {
          throw error;
        }

        parkingData =
          data || [];
      }

      setParkings(
        parkingData
      );

      const defaultVehicle =
        (
          vehicleData || []
        ).find(
          (vehicle) =>
            vehicle.id ===
            safePreferences.vehicule_defaut_id
        ) ||
        vehicleData?.[0] ||
        null;

      const defaultParking =
        (
          parkingData || []
        ).find(
          (parking) =>
            parking.id ===
            safePreferences.parking_travail_id
        ) ||
        parkingData?.[0] ||
        null;

      setNewTrip(
        (current) => ({
          ...current,
          vehicule_id:
            current.vehicule_id ||
            defaultVehicle?.id ||
            "",
          parking_travail_id:
            current.parking_travail_id ||
            defaultParking?.id ||
            "",
        })
      );

      setMultipleTripForm(
        (current) => ({
          ...current,
          vehicule_id:
            current.vehicule_id ||
            defaultVehicle?.id ||
            "",
          parking_travail_id:
            current.parking_travail_id ||
            defaultParking?.id ||
            "",
        })
      );

      const {
        data: tripData,
        error: tripError,
      } = await supabase
        .from("trajets")
        .select(`
          id,
          conducteur_id,
          vehicule_id,
          secteur_depart,
          secteur_arrivee,
          date_trajet,
          heure_depart,
          heure_prise_service,
          heure_retour,
          places_proposees,
          commentaire,
          statut,
          parking_travail_id,
          created_at,
          vehicules (
            id,
            libelle,
            marque,
            modele,
            couleur,
            places_proposees
          )
        `)
        .in(
          "statut",
          [
            "ouvert",
            "complet",
          ]
        )
        .order(
          "date_trajet",
          {
            ascending: true,
          }
        )
        .order(
          "heure_depart",
          {
            ascending: true,
          }
        );

      if (tripError) {
        throw tripError;
      }

      const loadedTrips =
        tripData || [];

      setTrips(
        loadedTrips
      );

      const {
        data: participationData,
        error: participationError,
      } = await supabase
        .from(
          "participations"
        )
        .select(`
          id,
          trajet_id,
          utilisateur_id,
          statut,
          commentaire,
          created_at
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .neq(
          "statut",
          "annulee"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (participationError) {
        throw participationError;
      }

      setMyParticipations(
        participationData || []
      );

      const myTripIds =
        loadedTrips
          .filter(
            (trip) =>
              trip.conducteur_id ===
              profile.id
          )
          .map(
            (trip) =>
              trip.id
          );

      let loadedDriverParticipations =
        [];

      if (
        myTripIds.length > 0
      ) {
        const {
          data,
          error,
        } = await supabase
          .from(
            "participations"
          )
          .select(`
            id,
            trajet_id,
            utilisateur_id,
            statut,
            commentaire,
            created_at
          `)
          .in(
            "trajet_id",
            myTripIds
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (error) {
          throw error;
        }

        loadedDriverParticipations =
          data || [];
      }

      setDriverParticipations(
        loadedDriverParticipations
      );

            const participantIds = [
        ...new Set(
          loadedDriverParticipations
            .map(
              (item) =>
                item.utilisateur_id
            )
            .filter(Boolean)
        ),
      ];

      if (
        participantIds.length > 0
      ) {
        const {
          data: participantData,
          error: participantError,
        } = await supabase
          .from("profils")
          .select(
            "utilisateur_id, prenom, nom"
          )
          .in(
            "utilisateur_id",
            participantIds
          );

        if (participantError) {
          throw participantError;
        }

        const profileMap = {};

        

        (
          participantData || []
        ).forEach(
          (participant) => {
            profileMap[
              participant.utilisateur_id
            ] =
              `${participant.prenom || ""} ${
                participant.nom || ""
              }`.trim() ||
              "Collègue";
          }
        );

        setParticipantProfiles(
          profileMap
        );
      } else {
        setParticipantProfiles(
          {}
        );
      }

      const tripIds =
        loadedTrips.map(
          (trip) =>
            trip.id
        );

      if (
        tripIds.length > 0
      ) {
        const {
          data: acceptedData,
          error: acceptedError,
        } = await supabase
          .from(
            "participations"
          )
          .select(
            "trajet_id"
          )
          .in(
            "trajet_id",
            tripIds
          )
          .eq(
            "statut",
            "acceptee"
          );

        if (acceptedError) {
          throw acceptedError;
        }

        const countMap =
          {};

        (
          acceptedData || []
        ).forEach(
          (participation) => {
            countMap[
              participation.trajet_id
            ] =
              (
                countMap[
                  participation.trajet_id
                ] || 0
              ) + 1;
          }
        );

        setAcceptedParticipationCounts(
          countMap
        );
      } else {
        setAcceptedParticipationCounts(
          {}
        );
      }

      const conductorIds = [
        ...new Set(
          loadedTrips.map(
            (trip) =>
              trip.conducteur_id
          )
        ),
      ];

      if (
        conductorIds.length > 0
      ) {
        const {
          data: conductorHabitData,
          error: conductorHabitError,
        } = await supabase
          .from(
            "habitudes_deplacement"
          )
          .select(`
            utilisateur_id,
            jour,
            actif,
            depart_domicile,
            prise_service,
            retour
          `)
          .in(
            "utilisateur_id",
            conductorIds
          );

        if (conductorHabitError) {
          throw conductorHabitError;
        }

        const habitMap =
          {};

        (
          conductorHabitData || []
        ).forEach(
          (habit) => {
            if (
              !habitMap[
                habit.utilisateur_id
              ]
            ) {
              habitMap[
                habit.utilisateur_id
              ] = {};
            }

            habitMap[
              habit.utilisateur_id
            ][habit.jour] =
              habit;
          }
        );

        setDriverHabits(
          habitMap
        );
      } else {
        setDriverHabits(
          {}
        );
      }

      const activeHabits =
        sortedHabits.filter(
          (habit) =>
            habit.actif &&
            habit.depart_domicile &&
            habit.prise_service &&
            habit.retour
        );

      if (
        activeHabits.length > 0 &&
        !selectedDay
      ) {
        setSelectedDay(
          activeHabits[0].jour
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des trajets :",
        error
      );

      setMessage(
        `Erreur trajets : ${
          error?.message ||
          "Impossible de charger les trajets."
        }`
      );
    } finally {
      setLoadingData(
        false
      );
    }
  }

  /*
   * --------------------------------------------------
   * HABITUDES
   * --------------------------------------------------
   */

  const activeHabits =
    useMemo(() => {
      return habits.filter(
        (habit) =>
          habit.actif &&
          habit.depart_domicile &&
          habit.prise_service &&
          habit.retour
      );
    }, [habits]);

  const selectedHabit =
    useMemo(() => {
      return (
        activeHabits.find(
          (habit) =>
            habit.jour ===
            selectedDay
        ) || null
      );
    }, [
      activeHabits,
      selectedDay,
    ]);

  /*
   * --------------------------------------------------
   * VÉHICULE / PARKING
   * --------------------------------------------------
   */

  const selectedVehicle =
    useMemo(() => {
      return (
        vehicles.find(
          (vehicle) =>
            vehicle.id ===
            newTrip.vehicule_id
        ) || null
      );
    }, [
      vehicles,
      newTrip.vehicule_id,
    ]);

  const selectedMultipleVehicle =
    useMemo(() => {
      return (
        vehicles.find(
          (vehicle) =>
            vehicle.id ===
            multipleTripForm.vehicule_id
        ) || null
      );
    }, [
      vehicles,
      multipleTripForm.vehicule_id,
    ]);

  const selectedParking =
    useMemo(() => {
      return (
        parkings.find(
          (parking) =>
            String(
              parking.id
            ) ===
            String(
              newTrip.parking_travail_id
            )
        ) || null
      );
    }, [
      parkings,
      newTrip.parking_travail_id,
    ]);

  const selectedMultipleParking =
    useMemo(() => {
      return (
        parkings.find(
          (parking) =>
            String(
              parking.id
            ) ===
            String(
              multipleTripForm.parking_travail_id
            )
        ) || null
      );
    }, [
      parkings,
      multipleTripForm.parking_travail_id,
    ]);

  /*
   * --------------------------------------------------
   * PLACES
   * --------------------------------------------------
   */

  function getAcceptedPlaces(trip) {
    return (
      acceptedParticipationCounts[
        trip.id
      ] || 0
    );
  }

  function getAvailablePlaces(trip) {
    const proposed =
      Number(
        trip.places_proposees
      ) || 0;

    const accepted =
      getAcceptedPlaces(
        trip
      );

    return Math.max(
      0,
      proposed -
        accepted
    );
  }

  /*
   * --------------------------------------------------
   * RECHERCHE
   * --------------------------------------------------
   */
  
const normalizedSearch =
  search
    .trim()
    .toLowerCase();

const todayString =
  getTodayString();

  const filteredTrips =
  useMemo(() => {
    return [...trips]
      .filter(
        (trip) => {
          const matchesDriver =
            !selectedDriverId ||
            trip.conducteur_id ===
              selectedDriverId;

          if (!matchesDriver) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return (
            trip.secteur_depart
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            trip.secteur_arrivee
              ?.toLowerCase()
              .includes(
                normalizedSearch
              )
          );
        }
      )
      .sort(
        (a, b) => {
          const dateCompare =
            (a.date_trajet || "").localeCompare(
              b.date_trajet || ""
            );

          if (dateCompare !== 0) {
            return dateCompare;
          }

          const departureCompare =
            (a.heure_depart || "").localeCompare(
              b.heure_depart || ""
            );

          if (departureCompare !== 0) {
            return departureCompare;
          }

          const serviceCompare =
            (a.heure_prise_service || "").localeCompare(
              b.heure_prise_service || ""
            );

          if (serviceCompare !== 0) {
            return serviceCompare;
          }

          const returnCompare =
            (a.heure_retour || "").localeCompare(
              b.heure_retour || ""
            );

          if (returnCompare !== 0) {
            return returnCompare;
          }

          return (
            (a.created_at || "").localeCompare(
              b.created_at || ""
            )
          );
        }
      );
  }, [
    trips,
    normalizedSearch,
    selectedDriverId,
  ]);

  const myTrips =
    filteredTrips.filter(
      (trip) =>
        trip.conducteur_id ===
        profile.id
    );

  const joinedTripIds =
    new Set(
      myParticipations.map(
        (participation) =>
          participation.trajet_id
      )
    );

  const joinedTrips =
    filteredTrips.filter(
      (trip) =>
        trip.conducteur_id !==
          profile.id &&
        joinedTripIds.has(
          trip.id
        )
    );

  const availableTrips =
    filteredTrips.filter(
      (trip) =>
        trip.conducteur_id !==
          profile.id &&
        !joinedTripIds.has(
          trip.id
        ) &&
        trip.date_trajet >=
          todayString
    );

  /*
   * --------------------------------------------------
   * TRAJET UNIQUE
   * --------------------------------------------------
   */

  function handleDayChange(day) {
    const habit =
      activeHabits.find(
        (item) =>
          item.jour === day
      );

    setSelectedDay(day);

    setNewTrip(
      (current) => ({
        ...current,
        date_trajet: "",
        heure_depart:
          habit?.depart_domicile?.slice(0, 5) ||
          "",
        heure_prise_service:
          habit?.prise_service?.slice(0, 5) ||
          "",
        heure_retour:
          habit?.retour?.slice(0, 5) ||
          "",
      })
    );

    setFormError("");
  }

  function handleDateChange(date) {
    const day =
      getDayFromDate(
        date
      );

    const matchingHabit =
      activeHabits.find(
        (habit) =>
          habit.jour ===
          day
      );

    setSelectedDay(
      day || ""
    );

    setNewTrip(
      (current) => ({
        ...current,
        date_trajet: date,
        heure_depart:
          matchingHabit?.depart_domicile?.slice(0, 5) ||
          "",
        heure_prise_service:
          matchingHabit?.prise_service?.slice(0, 5) ||
          "",
        heure_retour:
          matchingHabit?.retour?.slice(0, 5) ||
          "",
      })
    );

    setFormError("");
  }

  function handleTimeChange(
    field,
    value
  ) {
    setNewTrip(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setFormError("");
  }

  /*
   * --------------------------------------------------
   * CRÉATION TRAJET UNIQUE
   * --------------------------------------------------
   */

  async function handleCreateTrip() {
    setFormError("");
    setMessage("");

    if (
      !preferences?.peut_conduire
    ) {
      setFormError(
        "Vous devez être déclaré Conducteur pour proposer un trajet."
      );
      return;
    }

    if (!newTrip.date_trajet) {
      setFormError(
        "Veuillez choisir une date."
      );
      return;
    }

    if (!newTrip.heure_depart) {
      setFormError(
        "Veuillez renseigner l'heure de départ du domicile."
      );
      return;
    }

    if (
      !newTrip.heure_prise_service
    ) {
      setFormError(
        "Veuillez renseigner l'heure de prise de service."
      );
      return;
    }

    if (!newTrip.heure_retour) {
      setFormError(
        "Veuillez renseigner l'heure de retour."
      );
      return;
    }

    if (!selectedVehicle) {
      setFormError(
        "Veuillez sélectionner un véhicule."
      );
      return;
    }

    if (!selectedParking) {
      setFormError(
        "Veuillez sélectionner un parking."
      );
      return;
    }

    const places =
      Number(
        selectedVehicle.places_proposees
      );

    if (
      !Number.isInteger(
        places
      ) ||
      places <= 0
    ) {
      setFormError(
        "Le véhicule sélectionné ne possède pas un nombre de places valide."
      );
      return;
    }

    setSavingTrip(true);

    try {
      const {
        data: createdTrip,
        error,
      } = await supabase
        .from("trajets")
        .insert({
          conducteur_id:
            profile.id,

          vehicule_id:
            selectedVehicle.id,

          secteur_depart:
            profileData?.secteur ||
            "Secteur de résidence",

          secteur_arrivee:
            profileData?.site_travail_id
              ? "Technicentre Saint-Pierre-des-Corps"
              : "Site de travail",

          date_trajet:
            newTrip.date_trajet,

          heure_depart:
            newTrip.heure_depart,

          heure_prise_service:
            newTrip.heure_prise_service,

          heure_retour:
            newTrip.heure_retour,

          places_proposees:
            places,

          commentaire:
            newTrip.commentaire.trim() ||
            null,

          statut:
            "ouvert",

          parking_travail_id:
            selectedParking.id,
        })
        .select(`
          id,
          conducteur_id,
          vehicule_id,
          secteur_depart,
          secteur_arrivee,
          date_trajet,
          heure_depart,
          heure_prise_service,
          heure_retour,
          places_proposees,
          commentaire,
          statut,
          parking_travail_id,
          created_at,
          vehicules (
            id,
            libelle,
            marque,
            modele,
            couleur,
            places_proposees
          )
        `)
        .single();

      if (error) {
        throw error;
      }

            setTrips(
        (current) =>
          [
            ...current,
            createdTrip,
          ].sort(
            (a, b) => {
              const dateCompare =
                (a.date_trajet || "").localeCompare(
                  b.date_trajet || ""
                );

              if (dateCompare !== 0) {
                return dateCompare;
              }

              const departureCompare =
                (a.heure_depart || "").localeCompare(
                  b.heure_depart || ""
                );

              if (departureCompare !== 0) {
                return departureCompare;
              }

              const serviceCompare =
                (a.heure_prise_service || "").localeCompare(
                  b.heure_prise_service || ""
                );

              if (serviceCompare !== 0) {
                return serviceCompare;
              }

              const returnCompare =
                (a.heure_retour || "").localeCompare(
                  b.heure_retour || ""
                );

              if (returnCompare !== 0) {
                return returnCompare;
              }

              return (
                (a.created_at || "").localeCompare(
                  b.created_at || ""
                )
              );
            }
          )
      );

      setAcceptedParticipationCounts(
        (current) => ({
          ...current,
          [createdTrip.id]: 0,
        })
      );

      setNewTrip(
        (current) => ({
          ...current,
          date_trajet: "",
          heure_depart: "",
          heure_prise_service: "",
          heure_retour: "",
          commentaire: "",
        })
      );

      setShowForm(false);

      setMessage(
        "Trajet aller-retour enregistré avec succès ✅"
      );

      setTimeout(() => {
        setMessage("");
      }, 2200);
    } catch (error) {
      console.error(
        "Erreur création trajet :",
        error
      );

      setFormError(
        `Erreur trajet : ${
          error?.message ||
          "Impossible de créer le trajet."
        }`
      );
    } finally {
      setSavingTrip(false);
    }
  }

  /*
   * --------------------------------------------------
   * CRÉATION MULTIPLE
   * --------------------------------------------------
   */

  function handleMultipleDayToggle(
    day
  ) {
    setMultipleTripForm(
      (current) => {
        const exists =
          current.jours.includes(
            day
          );

        return {
          ...current,
          jours: exists
            ? current.jours.filter(
                (item) =>
                  item !== day
              )
            : [
                ...current.jours,
                day,
              ],
        };
      }
    );
  }

  function buildMultipleTrips() {
    const {
      date_debut,
      date_fin,
      jours,
    } = multipleTripForm;

    if (
      !date_debut ||
      !date_fin ||
      jours.length === 0
    ) {
      setMultipleTrips([]);
      return;
    }

    if (
      date_fin <
      date_debut
    ) {
      setMultipleTrips([]);
      return;
    }

    const dates =
      getDatesBetween(
        date_debut,
        date_fin
      );

    const generated =
      dates
        .map(
          (date) => {
            const day =
              getDayFromDate(
                date
              );

            if (
              !jours.includes(
                day
              )
            ) {
              return null;
            }

            const habit =
              activeHabits.find(
                (item) =>
                  item.jour ===
                  day
              );

            const existing =
              trips.find(
                (trip) =>
                  trip.conducteur_id ===
                    profile.id &&
                  trip.date_trajet ===
                    date
              );

            return {
              date,
              day,
              heure_depart:
                habit?.depart_domicile?.slice(
                  0,
                  5
                ) || "",
              heure_prise_service:
                habit?.prise_service?.slice(
                  0,
                  5
                ) || "",
              heure_retour:
                habit?.retour?.slice(
                  0,
                  5
                ) || "",
              existing,
            };
          }
        )
        .filter(Boolean);

    setMultipleTrips(
      generated
    );
  }

  useEffect(() => {
    if (!showMultipleForm) {
      return;
    }

    buildMultipleTrips();
  }, [
    showMultipleForm,
    multipleTripForm.date_debut,
    multipleTripForm.date_fin,
    multipleTripForm.jours,
    activeHabits,
    trips,
  ]);

  function updateMultipleTrip(
    index,
    field,
    value
  ) {
    setMultipleTrips(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  }

  function handleOpenMultipleForm() {
    setShowForm(false);
    setShowMultipleForm(true);
    setFormError("");
    setMessage("");
  }

  function handleCloseMultipleForm() {
    setShowMultipleForm(false);
    setMultipleTrips([]);
    setFormError("");
  }

  async function handleCreateMultipleTrips() {
    setFormError("");
    setMessage("");

    if (
      !preferences?.peut_conduire
    ) {
      setFormError(
        "Vous devez être déclaré Conducteur pour proposer des trajets."
      );
      return;
    }

    if (
      !multipleTripForm.date_debut ||
      !multipleTripForm.date_fin
    ) {
      setFormError(
        "Veuillez choisir une période."
      );
      return;
    }

    if (
      multipleTripForm.date_fin <
      multipleTripForm.date_debut
    ) {
      setFormError(
        "La date de fin doit être postérieure ou égale à la date de début."
      );
      return;
    }

    if (
      multipleTripForm.jours.length ===
      0
    ) {
      setFormError(
        "Veuillez sélectionner au moins un jour."
      );
      return;
    }

    if (
      multipleTrips.length ===
      0
    ) {
      setFormError(
        "Aucun trajet ne correspond aux jours sélectionnés."
      );
      return;
    }

    if (!selectedMultipleVehicle) {
      setFormError(
        "Veuillez sélectionner un véhicule."
      );
      return;
    }

    if (!selectedMultipleParking) {
      setFormError(
        "Veuillez sélectionner un parking."
      );
      return;
    }

    const places =
      Number(
        selectedMultipleVehicle.places_proposees
      );

    if (
      !Number.isInteger(
        places
      ) ||
      places <= 0
    ) {
      setFormError(
        "Le véhicule sélectionné ne possède pas un nombre de places valide."
      );
      return;
    }

    const incomplete =
      multipleTrips.filter(
        (item) =>
          !item.heure_depart ||
          !item.heure_prise_service ||
          !item.heure_retour
      );

    if (
      incomplete.length > 0
    ) {
      setFormError(
        "Tous les horaires doivent être renseignés avant la création des trajets."
      );
      return;
    }

    const tripsToCreate =
      multipleTrips.filter(
        (item) =>
          !item.existing
      );

    if (
      tripsToCreate.length ===
      0
    ) {
      setMessage(
        "Tous les trajets sélectionnés existent déjà."
      );
      return;
    }

    setSavingMultipleTrips(
      true
    );

    try {
      const rows =
        tripsToCreate.map(
          (item) => ({
            conducteur_id:
              profile.id,

            vehicule_id:
              selectedMultipleVehicle.id,

            secteur_depart:
              profileData?.secteur ||
              "Secteur de résidence",

            secteur_arrivee:
              profileData?.site_travail_id
                ? "Technicentre Saint-Pierre-des-Corps"
                : "Site de travail",

            date_trajet:
              item.date,

            heure_depart:
              item.heure_depart,

            heure_prise_service:
              item.heure_prise_service,

            heure_retour:
              item.heure_retour,

            places_proposees:
              places,

            commentaire:
              multipleTripForm.commentaire.trim() ||
              null,

            statut:
              "ouvert",

            parking_travail_id:
              selectedMultipleParking.id,
          })
        );

      const {
        data: createdTrips,
        error,
      } = await supabase
        .from("trajets")
        .insert(rows)
        .select(`
          id,
          conducteur_id,
          vehicule_id,
          secteur_depart,
          secteur_arrivee,
          date_trajet,
          heure_depart,
          heure_prise_service,
          heure_retour,
          places_proposees,
          commentaire,
          statut,
          parking_travail_id,
          created_at,
          vehicules (
            id,
            libelle,
            marque,
            modele,
            couleur,
            places_proposees
          )
        `);

      if (error) {
        throw error;
      }

      const created =
        createdTrips || [];

      setTrips(
        (current) =>
          [
            ...current,
            ...created,
          ].sort(
            (a, b) => {
              const dateCompare =
                a.date_trajet.localeCompare(
                  b.date_trajet
                );

              if (
                dateCompare !== 0
              ) {
                return dateCompare;
              }

              return (
                a.heure_depart ||
                ""
              ).localeCompare(
                b.heure_depart ||
                  ""
              );
            }
          )
      );

      setAcceptedParticipationCounts(
        (current) => {
          const next = {
            ...current,
          };

          created.forEach(
            (trip) => {
              next[trip.id] = 0;
            }
          );

          return next;
        }
      );

      setMultipleTrips([]);
      setMultipleTripForm(
        (current) => ({
          ...current,
          date_debut: "",
          date_fin: "",
          jours: [],
          commentaire: "",
        })
      );

      setShowMultipleForm(
        false
      );

      setMessage(
        `${created.length} trajet${
          created.length > 1
            ? "s"
            : ""
        } créé${
          created.length > 1
            ? "s"
            : ""
        } avec succès ✅`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Erreur création multiple :",
        error
      );

      setFormError(
        `Erreur : ${
          error?.message ||
          "Impossible de créer les trajets."
        }`
      );
    } finally {
      setSavingMultipleTrips(
        false
      );
    }
  }

  /*
   * --------------------------------------------------
   * PARTICIPATION PASSAGER
   * --------------------------------------------------
   */

  function getParticipationForTrip(
    tripId
  ) {
    return myParticipations.find(
      (participation) =>
        participation.trajet_id ===
        tripId
    );
  }

  async function handleJoinTrip(trip) {
    if (
      !trip.date_trajet ||
      trip.date_trajet <
        todayString
    ) {
      setMessage(
        "Ce trajet est déjà passé et ne peut plus être rejoint."
      );
      return;
    }

    const availablePlaces =
      getAvailablePlaces(
        trip
      );

    if (
      availablePlaces <= 0
    ) {
      setMessage(
        "Ce trajet est complet. Il n'y a plus de place disponible."
      );
      return;
    }

    if (
      !preferences?.peut_etre_passager
    ) {
      setMessage(
        "Vous devez être déclaré Passager pour rejoindre un trajet."
      );
      return;
    }

    const existing =
      getParticipationForTrip(
        trip.id
      );

    if (existing) {
      return;
    }

    setJoiningTripId(
      trip.id
    );

    setMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "participations"
        )
        .insert({
          trajet_id:
            trip.id,
          utilisateur_id:
            profile.id,
          statut:
            "en_attente",
          commentaire:
            null,
        })
        .select(`
          id,
          trajet_id,
          utilisateur_id,
          statut,
          commentaire,
          created_at
        `)
        .single();

      if (error) {
        throw error;
      }

      setMyParticipations(
        (current) => [
          data,
          ...current,
        ]
      );

      setMessage(
        "Votre demande de participation a été envoyée ✅"
      );

      setTimeout(() => {
        setMessage("");
      }, 2200);
    } catch (error) {
      console.error(
        "Erreur participation :",
        error
      );

      setMessage(
        `Erreur participation : ${
          error?.message ||
          "Impossible de rejoindre ce trajet."
        }`
      );
    } finally {
      setJoiningTripId(
        null
      );
    }
  }

  /*
   * --------------------------------------------------
   * ACCEPTATION
   * --------------------------------------------------
   */

  async function handleAcceptParticipation(
    participation
  ) {
    const trip =
      trips.find(
        (item) =>
          item.id ===
          participation.trajet_id
      );

    if (!trip) {
      setMessage(
        "Impossible de retrouver le trajet concerné."
      );
      return;
    }

    if (
      trip.date_trajet <
      todayString
    ) {
      setMessage(
        "Ce trajet est déjà passé."
      );
      return;
    }

    const availablePlaces =
      getAvailablePlaces(
        trip
      );

    if (
      availablePlaces <= 0
    ) {
      setMessage(
        "Il n'y a plus de place disponible dans ce véhicule."
      );
      return;
    }

    setProcessingParticipationId(
      participation.id
    );

    setMessage("");

    try {
  const {
    data,
    error,
  } = await supabase.rpc(
    "accept_participation",
    {
      p_participation_id:
        participation.id,
    }
  );

  if (error) {
    throw error;
  }

  setDriverParticipations(
    (current) =>
      current.map(
        (item) =>
          item.id ===
          participation.id
            ? data
            : item
      )
  );

  setAcceptedParticipationCounts(
    (current) => ({
      ...current,
      [trip.id]:
        (
          current[
            trip.id
          ] || 0
        ) + 1,
    })
  );

  setMessage(
    "La demande a été acceptée ✅"
  );

  setTimeout(() => {
    setMessage("");
  }, 2200);
} catch (error) {
  console.error(
    "Erreur acceptation participation :",
    error
  );

  setMessage(
    `Erreur : ${
      error?.message ||
      "Impossible d'accepter la demande."
    }`
  );
} finally {
  setProcessingParticipationId(
    null
  );
}
}

  /*
   * --------------------------------------------------
   * REFUS
   * --------------------------------------------------
   */

  async function handleRefuseParticipation(
    participation
  ) {
    setProcessingParticipationId(
      participation.id
    );

    setMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "participations"
        )
        .update({
          statut:
            "refusee",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          participation.id
        )
        .eq(
          "trajet_id",
          participation.trajet_id
        )
        .select(`
          id,
          trajet_id,
          utilisateur_id,
          statut,
          commentaire,
          created_at
        `)
        .single();

      if (error) {
        throw error;
      }

      setDriverParticipations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              participation.id
                ? data
                : item
          )
      );

      setMessage(
        "La demande a été refusée."
      );

      setTimeout(() => {
        setMessage("");
      }, 2200);
    } catch (error) {
      console.error(
        "Erreur refus participation :",
        error
      );

      setMessage(
        `Erreur : ${
          error?.message ||
          "Impossible de refuser la demande."
        }`
      );
    } finally {
      setProcessingParticipationId(
        null
      );
    }
  }

  /*
   * --------------------------------------------------
   * ANNULATION PARTICIPATION
   * --------------------------------------------------
   */

  async function handleCancelParticipation(
    participation
  ) {
    setJoiningTripId(
      participation.trajet_id
    );

    setMessage("");

    try {
      const {
        error,
      } = await supabase
        .from(
          "participations"
        )
        .update({
          statut:
            "annulee",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          participation.id
        )
        .eq(
          "utilisateur_id",
          profile.id
        );

      if (error) {
        throw error;
      }

      setMyParticipations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              participation.id
          )
      );

      setMessage(
        "Votre participation a été annulée ✅"
      );

      setTimeout(() => {
        setMessage("");
      }, 2200);
    } catch (error) {
      console.error(
        "Erreur annulation participation :",
        error
      );

      setMessage(
        `Erreur : ${
          error?.message ||
          "Impossible d'annuler la participation."
        }`
      );
    } finally {
      setJoiningTripId(
        null
      );
    }
  }

  /*
   * --------------------------------------------------
   * ANNULATION TRAJET
   * --------------------------------------------------
   */

  function toggleTripSelection(tripId) {
  setSelectedTripIds((current) =>
    current.includes(tripId)
      ? current.filter(
          (id) => id !== tripId
        )
      : [...current, tripId]
  );
}

function getSelectableMyTrips() {
  return myTrips.filter(
    (trip) =>
      trip.conducteur_id === profile.id &&
      trip.date_trajet &&
      trip.date_trajet >= todayString &&
      trip.statut !== "annule"
  );
}

function toggleSelectAllMyTrips() {
  const selectableTrips =
    getSelectableMyTrips();

  const selectableIds =
    selectableTrips.map(
      (trip) => trip.id
    );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) =>
      selectedTripIds.includes(id)
    );

  setSelectedTripIds(
    allSelected
      ? []
      : selectableIds
  );
}

async function requestBulkCancel() {
  if (
    selectedTripIds.length === 0
  ) {
    return;
  }

  setMessage("");

  try {
    const {
      data: participations,
      error,
    } = await supabase
      .from("participations")
      .select(`
        id,
        trajet_id,
        utilisateur_id,
        statut
      `)
      .in(
        "trajet_id",
        selectedTripIds
      )
      .in(
        "statut",
        [
          "acceptee",
          "en_attente",
        ]
      );

    if (error) {
      throw error;
    }

    const affectedTripIds =
      new Set(
        (participations || []).map(
          (item) =>
            item.trajet_id
        )
      );

    setBulkCancelSummary({
      tripCount:
        selectedTripIds.length,

      affectedTripCount:
        affectedTripIds.size,

      participantCount:
        participations?.length || 0,
    });

    setShowBulkCancelModal(true);
  } catch (error) {
    console.error(
      "Erreur préparation annulation groupée :",
      error
    );

    setMessage(
      `Erreur : ${
        error?.message ||
        "Impossible de préparer l'annulation."
      }`
    );
  }
}

async function handleBulkCancel() {
  if (
    selectedTripIds.length === 0
  ) {
    return;
  }

  setBulkCancelling(true);
  setMessage("");

  try {
    const now =
      new Date().toISOString();

    /*
     * Récupération des participations
     * encore concernées.
     */
    const {
      data: participations,
      error: participationFetchError,
    } = await supabase
      .from("participations")
      .select(`
        id,
        trajet_id,
        utilisateur_id,
        statut
      `)
      .in(
        "trajet_id",
        selectedTripIds
      )
      .in(
        "statut",
        [
          "acceptee",
          "en_attente",
        ]
      );

    if (
      participationFetchError
    ) {
      throw participationFetchError;
    }

    /*
     * Annulation des trajets.
     */
    const {
      error: tripError,
    } = await supabase
      .from("trajets")
      .update({
        statut: "annule",
        updated_at: now,
        archived_at: now,
      })
      .in(
        "id",
        selectedTripIds
      )
      .eq(
        "conducteur_id",
        profile.id
      );

    if (tripError) {
      throw tripError;
    }

    /*
     * Annulation des participations.
     */
    if (
      participations &&
      participations.length > 0
    ) {
      const {
        error:
          participationUpdateError,
      } = await supabase
        .from("participations")
        .update({
          statut: "annulee",
          updated_at: now,
        })
        .in(
          "trajet_id",
          selectedTripIds
        )
        .in(
          "statut",
          [
            "acceptee",
            "en_attente",
          ]
        );

      if (
        participationUpdateError
      ) {
        throw participationUpdateError;
      }

      /*
       * Notification des passagers.
       */
      const notifications =
        participations.map(
          (participation) => {
            const trip =
              trips.find(
                (item) =>
                  item.id ===
                  participation.trajet_id
              );

            return {
              utilisateur_id:
                participation.utilisateur_id,

              type:
                "trajet_annule",

              titre:
                "Trajet annulé",

              message:
                participation.statut ===
                "acceptee"
                  ? `Le trajet du ${
                      trip
                        ? formatDate(
                            trip.date_trajet
                          )
                        : "prévu"
                    } a été annulé par le conducteur.`
                  : `La demande de participation au trajet du ${
                      trip
                        ? formatDate(
                            trip.date_trajet
                          )
                        : "prévu"
                    } a été annulée car le trajet n'est plus disponible.`,

              lu: false,

              trajet_id:
                participation.trajet_id,

              participation_id:
                participation.id,
            };
          }
        );

      const {
        error: notificationError,
      } = await supabase
        .from("notifications")
        .insert(
          notifications
        );

      if (notificationError) {
        throw notificationError;
      }
    }

    /*
     * Mise à jour de l'interface.
     */
    setTrips(
      (current) =>
        current.filter(
          (trip) =>
            !selectedTripIds.includes(
              trip.id
            )
        )
    );

    setMyParticipations(
      (current) =>
        current.filter(
          (participation) =>
            !selectedTripIds.includes(
              participation.trajet_id
            )
        )
    );

    setDriverParticipations(
      (current) =>
        current.map(
          (participation) =>
            selectedTripIds.includes(
              participation.trajet_id
            )
              ? {
                  ...participation,
                  statut:
                    "annulee",
                }
              : participation
        )
    );

    const count =
      selectedTripIds.length;

    setSelectedTripIds([]);
    setBulkCancelSummary(null);
    setShowBulkCancelModal(false);

    setMessage(
      `${count} trajet${
        count > 1
          ? "s"
          : ""
      } annulé${
        count > 1
          ? "s"
          : ""
      } avec succès${
        participations?.length
          ? " et les passagers concernés ont été informés"
          : ""
      } ✅`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  } catch (error) {
    console.error(
      "Erreur annulation groupée :",
      error
    );

    setMessage(
      `Erreur : ${
        error?.message ||
        "Impossible d'annuler les trajets."
      }`
    );
  } finally {
    setBulkCancelling(false);
  }
}
  
  function requestCancelTrip(trip) {
    if (
      !trip?.date_trajet ||
      trip.date_trajet <
        getTodayString()
    ) {
      return;
    }

    setTripToCancel(
      trip
    );
  }

  async function handleCancelTrip(
  trip
) {
  setTripToCancel(null);
  setMessage("");

  try {
    /*
     * --------------------------------------------------
     * 1. Récupérer les participations concernées
     * --------------------------------------------------
     */

    const {
      data: participations,
      error: participationFetchError,
    } = await supabase
      .from("participations")
      .select(`
        id,
        trajet_id,
        utilisateur_id,
        statut
      `)
      .eq(
        "trajet_id",
        trip.id
      )
      .in(
        "statut",
        [
          "acceptee",
          "en_attente",
        ]
      );

    if (
      participationFetchError
    ) {
      throw participationFetchError;
    }

    /*
     * --------------------------------------------------
     * 2. Annuler le trajet
     * --------------------------------------------------
     */

    const {
      error: tripError,
    } = await supabase
      .from("trajets")
      .update({
        statut:
          "annule",
        updated_at:
          new Date().toISOString(),
        archived_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        trip.id
      )
      .eq(
        "conducteur_id",
        profile.id
      );

    if (tripError) {
      throw tripError;
    }

        /*
     * --------------------------------------------------
     * 3. Notifier les passagers concernés
     * --------------------------------------------------
     */

    
      

    

      /*
       * --------------------------------------------------
       * 4. Annuler les participations
       * --------------------------------------------------
       */

      const {
        error:
          participationUpdateError,
      } = await supabase
        .from(
          "participations"
        )
        .update({
          statut:
            "annulee",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "trajet_id",
          trip.id
        )
        .in(
          "statut",
          [
            "acceptee",
            "en_attente",
          ]
        );

      if (
        participationUpdateError
      ) {
        throw participationUpdateError;
      }
    

    /*
     * --------------------------------------------------
     * 5. Retirer le trajet de l'affichage
     * --------------------------------------------------
     */

    setTrips(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            trip.id
        )
    );

    /*
     * --------------------------------------------------
     * 6. Mettre à jour les participations
     *    locales
     * --------------------------------------------------
     */

    setDriverParticipations(
      (current) =>
        current.filter(
          (item) =>
            item.trajet_id !==
            trip.id
        )
    );

    setMyParticipations(
      (current) =>
        current.map(
          (item) =>
            item.trajet_id ===
            trip.id
              ? {
                  ...item,
                  statut:
                    "annulee",
                }
              : item
        )
    );

        setMessage(
      "Trajet annulé et participants informés ✅"
    );

    setTimeout(() => {
      setMessage("");
    }, 2200);

  } catch (error) {
    console.error(
      "Erreur annulation trajet :",
      error
    );

    setMessage(
      `Erreur : ${
        error?.message ||
        "Impossible d'annuler le trajet."
      }`
    );
  }

  }

  /*
   * --------------------------------------------------
   * CARTE TRAJET
   * --------------------------------------------------
   */

  function renderTripCard(
    trip,
    mode
  ) {
    const isMine =
      trip.conducteur_id ===
      profile.id;

    const canSelect =
      isMine &&
      trip.date_trajet &&
      trip.date_trajet >=
        todayString &&
      trip.statut !== "annule";

    const isBulkSelected =
      selectedTripIds.includes(
        trip.id
      );
      
    const participation =
      getParticipationForTrip(
        trip.id
      );

    const parking =
      parkings.find(
        (item) =>
          item.id ===
          trip.parking_travail_id
      );

    const pendingRequests =
      driverParticipations.filter(
        (item) =>
          item.trajet_id ===
            trip.id &&
          item.statut ===
            "en_attente"
      );

    const acceptedPlaces =
      getAcceptedPlaces(
        trip
      );

    const availablePlaces =
      getAvailablePlaces(
        trip
      );

    const isFull =
      availablePlaces <= 0;

    const isPast =
      Boolean(
        trip.date_trajet &&
          trip.date_trajet <
            todayString
      );

    const isSelected =
      selectedTripId ===
      trip.id;
    
    const isExpanded =
      expandedTripId === trip.id ||
      selectedTripId === trip.id;
      
    return (
      <div
        id={`trajet-${trip.id}`}
        key={trip.id}
        className={`border rounded-3xl p-6 lg:p-8 ${
          isSelected
            ? "border-pink-500 ring-4 ring-pink-100 bg-pink-50"
            : isPast
            ? "bg-gray-100 border-gray-200 opacity-60"
            : "bg-white border-gray-200"
        }`}
      >

        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            setExpandedTripId(
              isExpanded ? "" : trip.id
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setExpandedTripId(
                isExpanded ? "" : trip.id
              );
            }
          }}
          className="cursor-pointer"
        >

          <div className="flex items-center gap-4">

            {canSelect && (
              <input
                type="checkbox"
                checked={isBulkSelected}
                onChange={(event) => {
                  event.stopPropagation();
                  toggleTripSelection(
                    trip.id
                  );
                }}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="w-5 h-5 accent-pink-600 shrink-0"
                aria-label="Sélectionner ce trajet"
              />
            )}

            <div className="flex-1 min-w-0">

              <p className="text-sm text-gray-500">
                {formatDate(
                  trip.date_trajet
                )}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">

                <span className="font-bold text-gray-900">
                  {trip.secteur_depart}
                </span>

                <span className="text-gray-400">
                  →
                </span>

                <span className="font-bold text-gray-900">
                  {trip.secteur_arrivee}
                </span>

              </div>

            </div>

            <div
              className={`px-4 py-2 rounded-full font-semibold w-fit shrink-0 ${
                isPast
                  ? "bg-gray-300 text-gray-600"
                  : isFull
                  ? "bg-gray-200 text-gray-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              🚗{" "}
              {isPast
                ? "Trajet passé"
                : isFull
                ? "Complet"
                : `${availablePlaces} place${
                    availablePlaces > 1
                      ? "s"
                      : ""
                  } disponible${
                    availablePlaces > 1
                      ? "s"
                      : ""
                  }`}
            </div>

            <span
              className="text-gray-400 text-xl shrink-0"
              aria-hidden="true"
            >
              {isExpanded
                ? "▲"
                : "▼"}
            </span>

          </div>

        </div>

        {isExpanded && (
          <>

            {isSelected && (
              <div className="mt-5 bg-pink-100 text-pink-700 rounded-2xl px-4 py-3 font-semibold">
                🔔 Trajet concerné par cette notification
              </div>
            )}

        <div className="mt-6 space-y-4">

          <div className="bg-gray-50 rounded-2xl p-4">

            <p className="font-semibold text-gray-900">
              Aller
            </p>

            <p className="text-sm text-gray-600 mt-2">
              🏠 Départ :{" "}
              <span className="font-semibold">
                {formatTime(
                  trip.heure_depart
                )}
              </span>
            </p>

            <p className="text-sm text-gray-600 mt-1">
              🏢 Prise de service :{" "}
              <span className="font-semibold">
                {formatTime(
                  trip.heure_prise_service
                )}
              </span>
            </p>

          </div>

          <div className="bg-gray-50 rounded-2xl p-4">

            <p className="font-semibold text-gray-900">
              Retour
            </p>

            <p className="text-sm text-gray-600 mt-2">
              🏢 Départ du travail :{" "}
              <span className="font-semibold">
                {formatTime(
                  trip.heure_retour
                )}
              </span>
            </p>

          </div>

        </div>

        <div className="mt-5 space-y-3">

          {parking && (
            <p className="text-gray-700">
              🅿️ Parking :{" "}
              <span className="font-semibold">
                {parking.name}
              </span>
            </p>
          )}

          <p className="text-gray-700">
            🚗 Véhicule :{" "}
            <span className="font-semibold">
              {getVehicleLabel(
                trip.vehicules
              )}
            </span>
          </p>

          <p className="text-gray-700">
            👥 Places :{" "}
            <span className="font-semibold">
              {acceptedPlaces}
            </span>{" "}
            acceptée
            {acceptedPlaces > 1
              ? "s"
              : ""}{" "}
            /{" "}
            <span className="font-semibold">
              {trip.places_proposees}
            </span>{" "}
            proposée
            {trip.places_proposees > 1
              ? "s"
              : ""}
          </p>

          {trip.commentaire && (
            <p className="text-gray-700">
              💬{" "}
              {trip.commentaire}
            </p>
          )}

        </div>

        {mode === "mine" && (

          <div className="mt-6">

            <div className="bg-gray-50 rounded-2xl p-5">

              <p className="font-semibold text-gray-900">
                Demandes de participation
              </p>

              {pendingRequests.length ===
              0 ? (

                <p className="text-sm text-gray-500 mt-2">
                  Aucune demande en attente.
                </p>

              ) : (

                <div className="mt-4 space-y-4">

                  {pendingRequests.map(
                    (request) => {

                      const participantName =
                        participantProfiles[
                          request.utilisateur_id
                        ] ||
                        "Collègue";

                      const processing =
                        processingParticipationId ===
                        request.id;

                      return (
                        <div
                          key={
                            request.id
                          }
                          className="bg-white border border-gray-200 rounded-2xl p-4"
                        >

                          <p className="font-semibold text-gray-900">
                            👤{" "}
                            {participantName}
                          </p>

                          <p className="text-sm text-gray-600 mt-1">
                            souhaite rejoindre ce trajet.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 mt-4">

                            <button
                              type="button"
                              disabled={
                                processing ||
                                isPast ||
                                isFull
                              }
                              onClick={() =>
                                handleAcceptParticipation(
                                  request
                                )
                              }
                              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-2xl font-semibold disabled:opacity-50"
                            >
                              {processing
                                ? "Traitement..."
                                : "✓ Accepter"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                processing
                              }
                              onClick={() =>
                                handleRefuseParticipation(
                                  request
                                )
                              }
                              className="flex-1 bg-red-100 text-red-700 px-4 py-3 rounded-2xl font-semibold disabled:opacity-50"
                            >
                              {processing
                                ? "Traitement..."
                                : "✕ Refuser"}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

              <p className="text-sm text-gray-500 mt-4">
                Places acceptées :{" "}
                <span className="font-semibold">
                  {acceptedPlaces}
                </span>{" "}
                /{" "}
                {trip.places_proposees}
              </p>

            </div>

            <button
              type="button"
              disabled={
                isPast
              }
              onClick={() =>
                requestCancelTrip(
                  trip
                )
              }
              className="w-full mt-5 bg-red-100 text-red-700 px-5 py-4 rounded-2xl font-semibold disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isPast
                ? "Trajet passé"
                : "Annuler ce trajet"}
            </button>

          </div>
        )}

        {mode === "joined" &&
          participation && (

            <div className="mt-6">

              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">

                <p className="font-semibold text-gray-900">
                  Ma participation
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Statut :{" "}
                  <span className="font-semibold">
                    {getParticipationStatusLabel(
                      participation.statut
                    )}
                  </span>
                </p>

              </div>

              <button
                type="button"
                disabled={
                  joiningTripId ===
                  trip.id
                }
                onClick={() =>
                  handleCancelParticipation(
                    participation
                  )
                }
                className="w-full mt-5 bg-red-100 text-red-700 px-5 py-4 rounded-2xl font-semibold disabled:opacity-50"
              >
                {joiningTripId ===
                trip.id
                  ? "Annulation..."
                  : "Annuler ma participation"}
              </button>

            </div>
          )}

        {mode === "available" && (

          <button
            type="button"
            disabled={
              joiningTripId ===
                trip.id ||
              !preferences?.peut_etre_passager ||
              isFull
            }
            onClick={() =>
              handleJoinTrip(
                trip
              )
            }
            className="w-full mt-6 bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {!preferences?.peut_etre_passager
              ? "Mode Passager non activé"
              : isFull
              ? "Trajet complet"
              : joiningTripId ===
                trip.id
              ? "Envoi de la demande..."
              : "Demander à rejoindre ce trajet"}
          </button>

        )}


          </>
        )}

      </div>
    );
  }

  /*
   * --------------------------------------------------
   * CHARGEMENT
   * --------------------------------------------------
   */

  if (
    authLoading ||
    !profile ||
    loadingData
  ) {
    return (
      <LoadingScreen
        text="Chargement des trajets..."
      />
    );
  }

  /*
   * --------------------------------------------------
   * PAGE
   * --------------------------------------------------
   */

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">

      <Card
        title={
          selectedDriverId
            ? selectedDriverName
              ? `Trajets de ${selectedDriverName}`
              : "Trajets du collègue"
            : "Mes trajets"
        }
      >

        {selectedDriverId && (
          <div className="mb-8 bg-pink-50 border border-pink-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <p className="font-semibold text-gray-900">
                🚗 Trajets de ce collègue
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Seuls les trajets proposés par cette personne sont affichés.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDriverId("");
                setSelectedDriverName("");
                setSelectedTripId("");

                window.history.replaceState(
                  {},
                  "",
                  "/trajets"
                );
              }}
              className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-medium"
            >
              Voir tous les trajets
            </button>

          </div>
        )}

        <div className="flex flex-col gap-4 mb-8">

          <input
            type="text"
            placeholder="Rechercher un trajet..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="w-full border border-gray-200 rounded-2xl px-5 py-3"
          />

          {preferences?.peut_conduire && (

            <div className="flex flex-col lg:flex-row gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowMultipleForm(false);
                  setShowForm(
                    (current) =>
                      !current
                  );
                }}
                className="w-full lg:flex-1 bg-gradient-to-r from-pink-600 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold"
              >
                {showForm
                  ? "Fermer"
                  : "Proposer un trajet"}
              </button>

              <button
                type="button"
                onClick={
                  handleOpenMultipleForm
                }
                className="w-full lg:flex-1 bg-white border-2 border-pink-600 text-pink-700 px-6 py-3 rounded-2xl font-semibold"
              >
                Créer plusieurs trajets
              </button>

            </div>

          )}

        </div>

        {message && (
          <div className="mb-6 text-center text-sm text-gray-700">
            {message}
          </div>
        )}

        {!preferences?.peut_conduire && (
          <div className="mb-8 bg-gray-100 border border-gray-200 rounded-2xl p-5">

            <p className="font-semibold text-gray-900">
              Mode conducteur non activé
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Vous pouvez rejoindre un trajet existant si vous avez activé « Passager » dans votre profil.
            </p>

          </div>
        )}

        {/* ------------------------------------------
            TRAJET UNIQUE
            ------------------------------------------ */}

        {showForm &&
          preferences?.peut_conduire && (

          <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 mb-10 space-y-6">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Proposer un trajet
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Les horaires habituels sont proposés automatiquement lorsqu'ils existent. Vous pouvez les modifier pour ce trajet uniquement.
              </p>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>

              <input
                type="date"
                value={
                  newTrip.date_trajet
                }
                onChange={(event) =>
                  handleDateChange(
                    event.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3"
              />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

                <p className="font-semibold text-gray-900">
                  Aller
                </p>

                <label className="block text-sm text-gray-600 mt-3">
                  🏠 Départ du domicile
                </label>

                <input
                  type="time"
                  value={
                    newTrip.heure_depart
                  }
                  onChange={(event) =>
                    handleTimeChange(
                      "heure_depart",
                      event.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 bg-white text-xl font-bold"
                />

                <label className="block text-sm text-gray-600 mt-3">
                  🏢 Prise de service
                </label>

                <input
                  type="time"
                  value={
                    newTrip.heure_prise_service
                  }
                  onChange={(event) =>
                    handleTimeChange(
                      "heure_prise_service",
                      event.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 bg-white text-xl font-bold"
                />

              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

                <p className="font-semibold text-gray-900">
                  Retour
                </p>

                <label className="block text-sm text-gray-600 mt-3">
                  🏢 Départ du travail
                </label>

                <input
                  type="time"
                  value={
                    newTrip.heure_retour
                  }
                  onChange={(event) =>
                    handleTimeChange(
                      "heure_retour",
                      event.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 bg-white text-xl font-bold"
                />

              </div>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking de travail
              </label>

              <select
                value={
                  newTrip.parking_travail_id
                }
                onChange={(event) =>
                  setNewTrip(
                    (current) => ({
                      ...current,
                      parking_travail_id:
                        event.target.value,
                    })
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
              >

                <option value="">
                  Sélectionner un parking
                </option>

                {parkings.map(
                  (parking) => (
                    <option
                      key={
                        parking.id
                      }
                      value={
                        parking.id
                      }
                    >
                      {parking.name}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Véhicule
              </label>

              <select
                value={
                  newTrip.vehicule_id
                }
                onChange={(event) =>
                  setNewTrip(
                    (current) => ({
                      ...current,
                      vehicule_id:
                        event.target.value,
                    })
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
              >

                <option value="">
                  Sélectionner un véhicule
                </option>

                {vehicles.map(
                  (vehicle) => (
                    <option
                      key={
                        vehicle.id
                      }
                      value={
                        vehicle.id
                      }
                    >
                      {getVehicleLabel(
                        vehicle
                      )}{" "}
                      —{" "}
                      {
                        vehicle.places_proposees
                      }{" "}
                      place
                      {vehicle.places_proposees >
                      1
                        ? "s"
                        : ""}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire
              </label>

              <textarea
                value={
                  newTrip.commentaire
                }
                onChange={(event) =>
                  setNewTrip(
                    (current) => ({
                      ...current,
                      commentaire:
                        event.target.value,
                    })
                  )
                }
                rows={3}
                placeholder="Informations utiles pour les covoitureurs..."
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 resize-none"
              />

            </div>

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">
                {formError}
              </div>
            )}

            <button
              type="button"
              onClick={
                handleCreateTrip
              }
              disabled={
                savingTrip ||
                vehicles.length ===
                  0 ||
                parkings.length ===
                  0
              }
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold disabled:opacity-50"
            >
              {savingTrip
                ? "Enregistrement..."
                : "Proposer ce trajet aller-retour"}
            </button>

          </div>
        )}

        {/* ------------------------------------------
            CRÉATION MULTIPLE
            ------------------------------------------ */}

        {showMultipleForm &&
          preferences?.peut_conduire && (

          <div className="bg-white border border-pink-200 rounded-3xl p-6 lg:p-8 mb-10 space-y-6">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Créer plusieurs trajets
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Les habitudes servent uniquement à préremplir les horaires. Les trajets créés resteront indépendants.
              </p>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Du
                </label>

                <input
                  type="date"
                  value={
                    multipleTripForm.date_debut
                  }
                  onChange={(event) =>
                    setMultipleTripForm(
                      (current) => ({
                        ...current,
                        date_debut:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Au
                </label>

                <input
                  type="date"
                  value={
                    multipleTripForm.date_fin
                  }
                  onChange={(event) =>
                    setMultipleTripForm(
                      (current) => ({
                        ...current,
                        date_fin:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                />

              </div>

            </div>

            <div>

              <p className="block text-sm font-medium text-gray-700 mb-3">
                Jours concernés
              </p>

              <div className="flex flex-wrap gap-2">

                {[
                  "lundi",
                  "mardi",
                  "mercredi",
                  "jeudi",
                  "vendredi",
                  "samedi",
                  "dimanche",
                ].map(
                  (day) => {

                    const selected =
                      multipleTripForm.jours.includes(
                        day
                      );

                    return (
                      <button
                        key={
                          day
                        }
                        type="button"
                        onClick={() =>
                          handleMultipleDayToggle(
                            day
                          )
                        }
                        className={`px-4 py-2 rounded-full font-medium ${
                          selected
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {
                          DAY_LABELS[
                            day
                          ]
                        }
                      </button>
                    );
                  }
                )}

              </div>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Véhicule
              </label>

              <select
                value={
                  multipleTripForm.vehicule_id
                }
                onChange={(event) =>
                  setMultipleTripForm(
                    (current) => ({
                      ...current,
                      vehicule_id:
                        event.target.value,
                    })
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
              >

                <option value="">
                  Sélectionner un véhicule
                </option>

                {vehicles.map(
                  (vehicle) => (
                    <option
                      key={
                        vehicle.id
                      }
                      value={
                        vehicle.id
                      }
                    >
                      {getVehicleLabel(
                        vehicle
                      )}{" "}
                      —{" "}
                      {
                        vehicle.places_proposees
                      }{" "}
                      place
                      {vehicle.places_proposees >
                      1
                        ? "s"
                        : ""}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking de travail
              </label>

              <select
                value={
                  multipleTripForm.parking_travail_id
                }
                onChange={(event) =>
                  setMultipleTripForm(
                    (current) => ({
                      ...current,
                      parking_travail_id:
                        event.target.value,
                    })
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
              >

                <option value="">
                  Sélectionner un parking
                </option>

                {parkings.map(
                  (parking) => (
                    <option
                      key={
                        parking.id
                      }
                      value={
                        parking.id
                      }
                    >
                      {parking.name}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire commun
              </label>

              <textarea
                value={
                  multipleTripForm.commentaire
                }
                onChange={(event) =>
                  setMultipleTripForm(
                    (current) => ({
                      ...current,
                      commentaire:
                        event.target.value,
                    })
                  )
                }
                rows={3}
                placeholder="Informations utiles pour les covoitureurs..."
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 resize-none"
              />

            </div>

            {multipleTrips.length >
              0 && (

              <div>

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      Aperçu
                    </h3>

                    <p className="text-sm text-gray-500">
                      {
                        multipleTrips.length
                      }{" "}
                      trajet
                      {multipleTrips.length >
                      1
                        ? "s"
                        : ""}{" "}
                      concerné
                      {multipleTrips.length >
                      1
                        ? "s"
                        : ""}
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {multipleTrips.map(
                    (item, index) => (

                      <div
                        key={
                          item.date
                        }
                        className={`border rounded-2xl p-4 ${
                          item.existing
                            ? "bg-gray-100 border-gray-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                          <div>

                            <p className="font-semibold text-gray-900">
                              {formatDate(
                                item.date
                              )}
                            </p>

                            {item.existing ? (

                              <p className="text-sm text-gray-500 mt-1">
                                ✓ Trajet déjà existant — il sera conservé.
                              </p>

                            ) : (

                              <p className="text-sm text-gray-500 mt-1">
                                Nouveau trajet
                              </p>

                            )}

                          </div>

                          {!item.existing && (

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                              <div>

                                <label className="block text-xs text-gray-500 mb-1">
                                  Départ
                                </label>

                                <input
                                  type="time"
                                  value={
                                    item.heure_depart
                                  }
                                  onChange={(event) =>
                                    updateMultipleTrip(
                                      index,
                                      "heure_depart",
                                      event.target.value
                                    )
                                  }
                                  className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
                                />

                              </div>

                              <div>

                                <label className="block text-xs text-gray-500 mb-1">
                                  Service
                                </label>

                                <input
                                  type="time"
                                  value={
                                    item.heure_prise_service
                                  }
                                  onChange={(event) =>
                                    updateMultipleTrip(
                                      index,
                                      "heure_prise_service",
                                      event.target.value
                                    )
                                  }
                                  className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
                                />

                              </div>

                              <div>

                                <label className="block text-xs text-gray-500 mb-1">
                                  Retour
                                </label>

                                <input
                                  type="time"
                                  value={
                                    item.heure_retour
                                  }
                                  onChange={(event) =>
                                    updateMultipleTrip(
                                      index,
                                      "heure_retour",
                                      event.target.value
                                    )
                                  }
                                  className="border border-gray-200 rounded-xl px-3 py-2 bg-white"
                                />

                              </div>

                            </div>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

            {multipleTrips.length >
              0 && (

              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">

                <p className="font-semibold text-gray-900">

                  {
                    multipleTrips.filter(
                      (item) =>
                        !item.existing
                    ).length
                  }{" "}
                  nouveau
                  {multipleTrips.filter(
                    (item) =>
                      !item.existing
                  ).length >
                  1
                    ? "x"
                    : ""}{" "}
                  trajet
                  {multipleTrips.filter(
                    (item) =>
                      !item.existing
                  ).length >
                  1
                    ? "s"
                    : ""}{" "}
                  seront créé
                  {multipleTrips.filter(
                    (item) =>
                      !item.existing
                  ).length >
                  1
                    ? "s"
                    : ""}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Les trajets déjà existants ne seront pas modifiés.
                </p>

              </div>

            )}

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">
                {formError}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-3">

              <button
                type="button"
                onClick={
                  handleCloseMultipleForm
                }
                className="flex-1 bg-gray-100 text-gray-700 px-5 py-4 rounded-2xl font-semibold"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  handleCreateMultipleTrips
                }
                disabled={
                  savingMultipleTrips ||
                  multipleTrips.length ===
                    0
                }
                className="flex-1 bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold disabled:opacity-50"
              >
                {savingMultipleTrips
                  ? "Création..."
                  : `Créer ${
                      multipleTrips.filter(
                        (item) =>
                          !item.existing
                      ).length
                    } trajet${
                      multipleTrips.filter(
                        (item) =>
                          !item.existing
                      ).length >
                      1
                        ? "s"
                        : ""
                    }`}
              </button>

            </div>

          </div>
        )}

        {/* ------------------------------------------
            MES TRAJETS
            ------------------------------------------ */}

        {myTrips.length > 0 && (

          <div className="mb-12">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes trajets proposés
            </h2>

            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

  <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
    <input
      type="checkbox"
      checked={
        getSelectableMyTrips().length > 0 &&
        getSelectableMyTrips().every(
          (trip) =>
            selectedTripIds.includes(
              trip.id
            )
        )
      }
      onChange={
        toggleSelectAllMyTrips
      }
      className="w-5 h-5 accent-pink-600"
    />

    <span>
      Tout sélectionner
    </span>
  </label>

  {selectedTripIds.length > 0 && (
    <button
      type="button"
      onClick={
        requestBulkCancel
      }
      className="bg-red-100 text-red-700 px-5 py-3 rounded-2xl font-semibold hover:bg-red-200 transition"
    >
      🗑️ Annuler{" "}
      {selectedTripIds.length} trajet
      {selectedTripIds.length > 1
        ? "s"
        : ""}
    </button>
  )}

</div>

            <div className="space-y-4">

              {myTrips.map(
                (trip) =>
                  renderTripCard(
                    trip,
                    "mine"
                  )
              )}

            </div>

          </div>

        )}

        {/* ------------------------------------------
            PARTICIPATIONS
            ------------------------------------------ */}

        {joinedTrips.length > 0 && (

          <div className="mb-12">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes participations
            </h2>

            <div className="space-y-4">

              {joinedTrips.map(
                (trip) =>
                  renderTripCard(
                    trip,
                    "joined"
                  )
              )}

            </div>

          </div>

        )}

        {/* ------------------------------------------
            TRAJETS DISPONIBLES
            ------------------------------------------ */}

        <div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedDriverId
              ? "Trajets disponibles de ce collègue"
              : "Trajets disponibles"}
          </h2>

          {availableTrips.length >
          0 ? (

            <div className="space-y-4">

              {availableTrips.map(
                (trip) =>
                  renderTripCard(
                    trip,
                    "available"
                  )
              )}

            </div>

          ) : (

            <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">

              <p className="text-lg font-semibold text-gray-900">
                Aucun trajet disponible
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Aucun trajet ouvert ne correspond actuellement à votre recherche.
              </p>

            </div>

          )}

        </div>

      </Card>

      {/* ------------------------------------------
          MODALE ANNULATION
          ------------------------------------------ */}

      {showBulkCancelModal &&
  bulkCancelSummary && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md bg-white rounded-3xl p-6 lg:p-8 shadow-xl">

        <h2 className="text-xl font-bold text-gray-900">
          Annuler plusieurs trajets ?
        </h2>

        <p className="text-gray-600 mt-4 leading-relaxed">
          Vous êtes sur le point d'annuler{" "}
          <span className="font-semibold">
            {bulkCancelSummary.tripCount}
          </span>{" "}
          trajet
          {bulkCancelSummary.tripCount > 1
            ? "s"
            : ""}.
        </p>

        {bulkCancelSummary.participantCount >
          0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
            ⚠️{" "}
            {bulkCancelSummary.participantCount}{" "}
            participation
            {bulkCancelSummary.participantCount >
            1
              ? "s"
              : ""}{" "}
            sont concernée
            {bulkCancelSummary.participantCount >
            1
              ? "s"
              : ""}.
            <br />
            Les passagers concernés seront
            automatiquement informés.
          </div>
        )}

        {bulkCancelSummary.participantCount ===
          0 && (
          <p className="text-sm text-gray-500 mt-3">
            Aucun passager n'est associé à ces
            trajets.
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">

          <button
            type="button"
            disabled={bulkCancelling}
            onClick={() => {
              setShowBulkCancelModal(
                false
              );
              setBulkCancelSummary(
                null
              );
            }}
            className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl font-semibold disabled:opacity-50"
          >
            Retour
          </button>

          <button
            type="button"
            disabled={bulkCancelling}
            onClick={
              handleBulkCancel
            }
            className="flex-1 bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold disabled:opacity-50"
          >
            {bulkCancelling
              ? "Annulation..."
              : "Confirmer l'annulation"}
          </button>

        </div>

      </div>

    </div>
  )}    

      {tripToCancel && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-3xl p-6 lg:p-8 shadow-xl">

            <h2 className="text-xl font-bold text-gray-900">
              Annuler ce trajet ?
            </h2>

            <p className="text-sm text-gray-600 mt-3">
              Vous êtes sur le point d'annuler le trajet du{" "}
              <span className="font-semibold">
                {formatDate(
                  tripToCancel.date_trajet
                )}
              </span>
              .
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Cette action annulera le trajet et le retirera des trajets disponibles.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setTripToCancel(
                    null
                  )
                }
                className="flex-1 bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl font-semibold"
              >
                Retour
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCancelTrip(
                    tripToCancel
                  )
                }
                className="flex-1 bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold"
              >
                Confirmer l'annulation
              </button>

            </div>

                    </div>

        </div>

      )}

      {showScrollButtons && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:bg-gray-100 transition flex items-center justify-center text-xl"
            aria-label="Remonter en haut de la page"
            title="Remonter en haut"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top:
                  document.documentElement
                    .scrollHeight,
                behavior: "smooth",
              })
            }
            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:bg-gray-100 transition flex items-center justify-center text-xl"
            aria-label="Descendre en bas de la page"
            title="Descendre en bas"
          >
            ↓
          </button>
        </div>
      )}

    </div>
  );
}