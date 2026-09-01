"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";
import { containsForbiddenPresentationTerm } from "@/lib/profanity";

const PRESENTATION_MAX_LENGTH = 500;

export default function ProfilePage() {
  const {
    session,
    profile,
    loading,
    refreshProfile,
  } = useAuth();

  const [formData, setFormData] =
    useState(null);

  const [residence, setResidence] =
    useState({
      adresse: "",
      code_postal: "",
      ville: "",
    });

  const [preferences, setPreferences] =
    useState({
      peut_conduire: false,
      peut_etre_passager: true,
      parking_travail_id: null,
      vehicule_defaut_id: null,
    });

  const [sites, setSites] =
    useState([]);

  const [parkings, setParkings] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);

  const [showVehicleForm, setShowVehicleForm] =
    useState(false);

  const [editingVehicleId, setEditingVehicleId] =
    useState(null);

  const [vehicleForm, setVehicleForm] =
    useState({
      libelle: "",
      marque: "",
      modele: "",
      couleur: "",
      places_proposees: 1,
    });

  const [saving, setSaving] =
    useState(false);

  const [savingVehicle, setSavingVehicle] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [presentationError, setPresentationError] =
    useState("");

  const presentationRef = useRef(null);

  const [vehicleMessage, setVehicleMessage] =
    useState("");

  const [loadingResidence, setLoadingResidence] =
    useState(true);

  const [loadingPreferences, setLoadingPreferences] =
    useState(true);

  const [loadingVehicles, setLoadingVehicles] =
    useState(true);

  const [loadingSites, setLoadingSites] =
    useState(false);

  /*
   * ------------------------------------------------
   * CHARGEMENT DU PROFIL
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!profile) {
      /*
       * Nouveau compte :
       * aucun profil n'existe encore.
       */

      setFormData({
        first_name: "",
        last_name: "",
        photo: "",
        presentation: "",
        site_travail_id: null,
      });

      setResidence({
        adresse: "",
        code_postal: "",
        ville: "",
      });

      setPreferences({
        peut_conduire: false,
        peut_etre_passager: true,
        parking_travail_id: null,
        vehicule_defaut_id: null,
      });

      setParkings([]);
      setVehicles([]);
      setLoadingResidence(false);
      setLoadingPreferences(false);
      setLoadingVehicles(false);

      /*
       * Chargement des sites SNCF actifs.
       */

      async function loadSites() {
        setLoadingSites(true);

        const {
          data,
          error,
        } = await supabase
          .from("sncf_sites")
          .select(`
            id,
            name,
            type,
            city,
            region,
            active
          `)
          .eq("active", true)
          .order("name", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Erreur lors du chargement des sites SNCF :",
            error
          );

          setMessage(
            "Impossible de charger les sites de travail."
          );
        } else {
          setSites(data || []);
        }

        setLoadingSites(false);
      }

      loadSites();

      return;
    }

    /*
     * ------------------------------------------------
     * PROFIL EXISTANT
     * ------------------------------------------------
     */

    setFormData({
      first_name:
        profile.first_name ?? "",

      last_name:
        profile.last_name ?? "",

      photo:
        profile.photo ?? "",

      presentation:
        profile.presentation ?? "",

      site_travail_id:
        profile.site_travail_id ?? null,
    });

    async function loadProfileData() {
      setLoadingResidence(true);
      setLoadingPreferences(true);
      setLoadingVehicles(true);

      /*
       * -----------------------------------------------
       * PRÉSENTATION
       * -----------------------------------------------
       */

      const {
        data: profileData,
        error: profileDataError,
      } = await supabase
        .from("profils")
        .select(`
          prenom,
          nom,
          photo,
          presentation,
          site_travail_id
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (profileDataError) {
        console.error(
          "Erreur chargement données profil :",
          profileDataError
        );
      }

      if (profileData) {
        setFormData({
          first_name:
            profileData.prenom ?? "",

          last_name:
            profileData.nom ?? "",

          photo:
            profileData.photo ?? "",

          presentation:
            profileData.presentation ?? "",

          site_travail_id:
            profileData.site_travail_id ?? null,
        });
      }

      /*
       * -----------------------------------------------
       * RÉSIDENCE
       * -----------------------------------------------
       */

      const {
        data: residenceData,
        error: residenceError,
      } = await supabase
        .from("residences_privees")
        .select(`
          adresse,
          code_postal,
          ville,
          latitude,
          longitude,
          ban_id
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (residenceError) {
        console.error(
          "Erreur chargement résidence :",
          residenceError
        );
      }

      if (residenceData) {
        setResidence({
          adresse:
            residenceData.adresse ?? "",

          code_postal:
            residenceData.code_postal ?? "",

          ville:
            residenceData.ville ?? "",
        });
      }

      setLoadingResidence(false);

      /*
       * -----------------------------------------------
       * PRÉFÉRENCES
       * -----------------------------------------------
       */

      const {
        data: preferencesData,
        error: preferencesError,
      } = await supabase
        .from("preferences_utilisateur")
        .select(`
          peut_conduire,
          peut_etre_passager,
          parking_travail_id,
          vehicule_defaut_id
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (preferencesError) {
        console.error(
          "Erreur chargement préférences :",
          preferencesError
        );
      }

      if (preferencesData) {
        setPreferences({
          peut_conduire:
            Boolean(
              preferencesData.peut_conduire
            ),

          peut_etre_passager:
            Boolean(
              preferencesData.peut_etre_passager
            ),

          parking_travail_id:
            preferencesData.parking_travail_id ??
            null,

          vehicule_defaut_id:
            preferencesData.vehicule_defaut_id ??
            null,
        });
      }

      setLoadingPreferences(false);

      /*
       * -----------------------------------------------
       * VÉHICULES
       * -----------------------------------------------
       */

      const {
        data: vehiclesData,
        error: vehiclesError,
      } = await supabase
        .from("vehicules")
        .select(`
          id,
          libelle,
          marque,
          modele,
          couleur,
          places_proposees,
          statut,
          archived_at
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .is(
          "archived_at",
          null
        )
        .order("created_at", {
          ascending: true,
        });

      if (vehiclesError) {
        console.error(
          "Erreur chargement véhicules :",
          vehiclesError
        );
      }

      setVehicles(
        vehiclesData || []
      );

      setLoadingVehicles(false);

      /*
       * -----------------------------------------------
       * PARKINGS
       * -----------------------------------------------
       */

      const {
        data: parkingsData,
        error: parkingsError,
      } = await supabase
        .from("sncf_parkings")
        .select(`
          id,
          name,
          latitude,
          longitude
        `)
        .eq(
          "site_id",
          profile.site_travail_id
        )
        .order("name", {
          ascending: true,
        });

      if (parkingsError) {
        console.error(
          "Erreur chargement parkings :",
          parkingsError
        );
      }

      setParkings(
        parkingsData || []
      );

      /*
       * -----------------------------------------------
       * SITES SNCF
       * -----------------------------------------------
       */

      setLoadingSites(true);

      const {
        data: sitesData,
        error: sitesError,
      } = await supabase
        .from("sncf_sites")
        .select(`
          id,
          name,
          type,
          city,
          region,
          active
        `)
        .eq("active", true)
        .order("name", {
          ascending: true,
        });

      if (sitesError) {
        console.error(
          "Erreur chargement sites SNCF :",
          sitesError
        );
      }

      setSites(
        sitesData || []
      );

      setLoadingSites(false);
    }

    loadProfileData();
  }, [
    profile,
  ]);

  /*
   * ------------------------------------------------
   * CHARGEMENT / GÉOCODAGE DE LA RÉSIDENCE
   * ------------------------------------------------
   */

  async function geocodeResidence() {
    if (
      !residence.adresse.trim() ||
      !residence.code_postal.trim() ||
      !residence.ville.trim()
    ) {
      setMessage(
        "Veuillez renseigner votre adresse, votre code postal et votre ville de résidence."
      );

      return null;
    }

    try {
      const response =
        await fetch(
          `/api/geocode?${new URLSearchParams(
            {
              adresse:
                residence.adresse.trim(),

              code_postal:
                residence.code_postal.trim(),

              ville:
                residence.ville.trim(),
            }
          ).toString()}`
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.error ||
            "Impossible de localiser cette adresse."
        );

        return null;
      }

      return data;
    } catch (error) {
      console.error(
        "Erreur géocodage résidence :",
        error
      );

      setMessage(
        "Impossible de localiser cette adresse."
      );

      return null;
    }
  }

  /*
   * ------------------------------------------------
   * MODIFICATION DU FORMULAIRE
   * ------------------------------------------------
   */

  function updateField(
    field,
    value
  ) {
    setFormData(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function updateResidenceField(
    field,
    value
  ) {
    setResidence(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  /*
   * ------------------------------------------------
   * SAUVEGARDE DU PROFIL
   * ------------------------------------------------
   */

  async function handleSave() {
    setMessage("");
    setPresentationError("");

    try {
      /*
       * -----------------------------------------------
       * IDENTIFIANT UTILISATEUR
       * -----------------------------------------------
       */

      const userId =
        profile?.id ||
        session?.user?.id;

      if (!userId) {
        throw new Error(
          "Utilisateur non authentifié."
        );
      }

      /*
       * -----------------------------------------------
       * VALIDATION DU PROFIL
       * -----------------------------------------------
       */

      if (
        !formData.first_name.trim() ||
        !formData.last_name.trim()
      ) {
        setMessage(
          "Veuillez renseigner votre prénom et votre nom."
        );

        return;
      }

      if (
        !formData.site_travail_id
      ) {
        setMessage(
          "Veuillez sélectionner votre site de travail."
        );

        return;
      }

      if (
        !residence.adresse.trim() ||
        !residence.code_postal.trim() ||
        !residence.ville.trim()
      ) {
        setMessage(
          "Veuillez renseigner votre adresse, votre code postal et votre ville de résidence."
        );

        return;
      }

      const presentation =
        (formData.presentation || "").trim();

      if (
        presentation.length >
        PRESENTATION_MAX_LENGTH
      ) {
        setMessage(
          `Votre présentation ne peut pas dépasser ${PRESENTATION_MAX_LENGTH} caractères.`
        );

        return;
      }

      if (
        containsForbiddenPresentationTerm(
          presentation
        )
      ) {
        const errorMessage =
          "Votre présentation contient un terme qui ne peut pas être utilisé. Merci de la reformuler.";

        setMessage("");
        setPresentationError(
          errorMessage
        );

        requestAnimationFrame(() => {
          presentationRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });

        return;
      }

      setPresentationError("");

      /*
       * -----------------------------------------------
       * GÉOCODAGE DE LA RÉSIDENCE
       * -----------------------------------------------
       */

      const geocoded =
        await geocodeResidence();

      if (!geocoded) {
        return;
      }

      /*
       * -----------------------------------------------
       * PROFIL
       * -----------------------------------------------
       */

      if (profile) {
        /*
         * Profil existant → UPDATE
         */

        const {
          error: profileError,
        } = await supabase
          .from("profils")
          .update({
            prenom:
              formData.first_name.trim(),

            nom:
              formData.last_name.trim(),

            photo:
              formData.photo || null,

            presentation:
              presentation || null,
          })
          .eq(
            "utilisateur_id",
            userId
          );

        if (profileError) {
          console.error(
            "Erreur lors de la mise à jour du profil :",
            profileError
          );

          setMessage(
            "Impossible d'enregistrer le profil."
          );

          return;
        }
      } else {
        /*
         * Nouveau compte → INSERT
         */

        const {
          error: profileInsertError,
        } = await supabase
          .from("profils")
          .insert({
            utilisateur_id:
              userId,

            prenom:
              formData.first_name.trim(),

            nom:
              formData.last_name.trim(),

            photo:
              formData.photo || null,

            presentation:
              presentation || null,

            site_travail_id:
              Number(
                formData.site_travail_id
              ),
          });

        if (
          profileInsertError
        ) {
          console.error(
            "Erreur lors de la création du profil :",
            profileInsertError
          );

          setMessage(
            `Impossible de créer le profil : ${
              profileInsertError.message ||
              "erreur inconnue"
            }`
          );

          return;
        }
      }

      /*
       * -----------------------------------------------
       * RÉSIDENCE
       * -----------------------------------------------
       */

      const {
        error: residenceError,
      } = await supabase
        .from("residences_privees")
        .upsert(
          {
            utilisateur_id:
              userId,

            adresse:
              residence.adresse.trim(),

            code_postal:
              residence.code_postal.trim(),

            ville:
              residence.ville.trim(),

            ban_id:
              geocoded.result.ban_id,

            latitude:
              geocoded.result.latitude,

            longitude:
              geocoded.result.longitude,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "utilisateur_id",
          }
        );

      if (residenceError) {
        console.error(
          "Erreur lors de l'enregistrement de la résidence :",
          residenceError
        );

        setMessage(
          "Le profil a été enregistré, mais impossible d'enregistrer la résidence."
        );

        return;
      }

      /*
       * -----------------------------------------------
       * RAFRAÎCHISSEMENT
       * -----------------------------------------------
       */

      await refreshProfile();

      setMessage(
        "Profil enregistré avec succès."
      );

    } catch (error) {
      console.error(
        "Erreur sauvegarde profil :",
        error
      );

      setMessage(
        error?.message ||
          "Impossible d'enregistrer le profil."
      );
    }
  }

  /*
   * ------------------------------------------------
   * GESTION DES VÉHICULES
   * ------------------------------------------------
   */

  function resetVehicleForm() {
    setVehicleForm({
      libelle: "",
      marque: "",
      modele: "",
      couleur: "",
      places_proposees: 1,
    });

    setEditingVehicleId(null);
    setShowVehicleForm(false);
  }

  function updateVehicleField(
    field,
    value
  ) {
    setVehicleForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  async function handleSaveVehicle() {
    setVehicleMessage("");

    if (
      !vehicleForm.libelle.trim()
    ) {
      setVehicleMessage(
        "Veuillez renseigner un nom pour le véhicule."
      );

      return;
    }

    const places =
      Number(
        vehicleForm.places_proposees
      );

    if (
      !Number.isFinite(places) ||
      places < 1
    ) {
      setVehicleMessage(
        "Le nombre de places doit être supérieur ou égal à 1."
      );

      return;
    }

    const userId =
      profile?.id ||
      session?.user?.id;

    if (!userId) {
      setVehicleMessage(
        "Utilisateur non authentifié."
      );

      return;
    }

    setSavingVehicle(true);

    try {
      if (editingVehicleId) {
        const {
          error,
        } = await supabase
          .from("vehicules")
          .update({
            libelle:
              vehicleForm.libelle.trim(),

            marque:
              vehicleForm.marque.trim() ||
              null,

            modele:
              vehicleForm.modele.trim() ||
              null,

            couleur:
              vehicleForm.couleur.trim() ||
              null,

            places_proposees:
              places,
          })
          .eq(
            "id",
            editingVehicleId
          )
          .eq(
            "utilisateur_id",
            userId
          );

        if (error) {
          throw error;
        }

        setVehicleMessage(
          "Véhicule modifié avec succès."
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("vehicules")
          .insert({
            utilisateur_id:
              userId,

            libelle:
              vehicleForm.libelle.trim(),

            marque:
              vehicleForm.marque.trim() ||
              null,

            modele:
              vehicleForm.modele.trim() ||
              null,

            couleur:
              vehicleForm.couleur.trim() ||
              null,

            places_proposees:
              places,

            statut:
              "ACTIF",
          })
          .select(`
            id,
            libelle,
            marque,
            modele,
            couleur,
            places_proposees,
            statut,
            archived_at
          `)
          .single();

        if (error) {
          throw error;
        }

        setVehicles(
          (current) => [
            ...current,
            data,
          ]
        );

        setVehicleMessage(
          "Véhicule ajouté avec succès."
        );
      }

      if (
        editingVehicleId
      ) {
        setVehicles(
          (current) =>
            current.map(
              (vehicle) =>
                vehicle.id ===
                editingVehicleId
                  ? {
                      ...vehicle,
                      libelle:
                        vehicleForm.libelle.trim(),
                      marque:
                        vehicleForm.marque.trim() ||
                        null,
                      modele:
                        vehicleForm.modele.trim() ||
                        null,
                      couleur:
                        vehicleForm.couleur.trim() ||
                        null,
                      places_proposees:
                        places,
                    }
                  : vehicle
            )
        );
      }

      resetVehicleForm();

    } catch (error) {
      console.error(
        "Erreur sauvegarde véhicule :",
        error
      );

      setVehicleMessage(
        error?.message ||
          "Impossible d'enregistrer le véhicule."
      );
    } finally {
      setSavingVehicle(false);
    }
  }

  function editVehicle(
    vehicle
  ) {
    setVehicleForm({
      libelle:
        vehicle.libelle ?? "",

      marque:
        vehicle.marque ?? "",

      modele:
        vehicle.modele ?? "",

      couleur:
        vehicle.couleur ?? "",

      places_proposees:
        vehicle.places_proposees ?? 1,
    });

    setEditingVehicleId(
      vehicle.id
    );

    setShowVehicleForm(true);

    setVehicleMessage("");
  }

  async function archiveVehicle(
    vehicle
  ) {
    if (
      !vehicle?.id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous archiver le véhicule « ${
          vehicle.libelle
        } » ?`
      );

    if (!confirmed) {
      return;
    }

    setVehicleMessage("");

    try {
      const {
        error,
      } = await supabase
        .from("vehicules")
        .update({
          statut:
            "ARCHIVE",

          archived_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          vehicle.id
        );

      if (error) {
        throw error;
      }

      setVehicles(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              vehicle.id
          )
      );

      if (
        preferences
          .vehicule_defaut_id ===
        vehicle.id
      ) {
        setPreferences(
          (current) => ({
            ...current,
            vehicule_defaut_id:
              null,
          })
        );
      }

      setVehicleMessage(
        "Véhicule archivé."
      );

    } catch (error) {
      console.error(
        "Erreur archivage véhicule :",
        error
      );

      setVehicleMessage(
        error?.message ||
          "Impossible d'archiver le véhicule."
      );
    }
  }

  /*
   * ------------------------------------------------
   * CHARGEMENT
   * ------------------------------------------------
   */

  if (loading) {
    return (
      <LoadingScreen
        text="Chargement du profil..."
      />
    );
  }

  if (!formData) {
    return (
      <LoadingScreen
        text="Préparation du profil..."
      />
    );
  }

  const initials =
    `${formData.first_name?.[0] ?? ""}${
      formData.last_name?.[0] ?? ""
    }`.toUpperCase();

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Mon profil">

        {/* ------------------------------------------ */}
        {/* IDENTITÉ                                  */}
        {/* ------------------------------------------ */}

        <div className="space-y-8">

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Informations personnelles
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Ces informations permettent à vos collègues
              de vous identifier.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start">

              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-3xl font-bold shrink-0">
                {formData.photo ||
                  initials ||
                  "?"}
              </div>

              <div className="flex-1 w-full space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>

                    <input
                      type="text"
                      value={
                        formData.first_name
                      }
                      onChange={(e) =>
                        updateField(
                          "first_name",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>

                    <input
                      type="text"
                      value={
                        formData.last_name
                      }
                      onChange={(e) =>
                        updateField(
                          "last_name",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                      required
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo
                  </label>

                  <input
                    type="text"
                    value={
                      formData.photo
                    }
                    onChange={(e) =>
                      updateField(
                        "photo",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                    placeholder="URL de votre avatar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Présentation
                  </label>

                  <textarea
                    ref={
                      presentationRef
                    }
                    value={
                      formData.presentation ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "presentation",
                        e.target.value
                      )
                    }
                    className={`w-full border rounded-2xl px-5 py-3 min-h-32 ${
                      presentationError
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200"
                    }`}
                    maxLength={
                      PRESENTATION_MAX_LENGTH
                    }
                    placeholder="Présentez-vous en quelques mots..."
                  />

                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Cette présentation sera visible
                      par les collègues avec lesquels
                      vous êtes compatible.
                    </p>

                    <span className="text-xs text-gray-400">
                      {
                        formData.presentation?.length ||
                        0
                      }{" "}
                      /{" "}
                      {
                        PRESENTATION_MAX_LENGTH
                      }
                    </span>
                  </div>

                  {presentationError && (
                    <p className="text-sm text-red-600 mt-3">
                      {presentationError}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ------------------------------------------ */}
          {/* SITE DE TRAVAIL                           */}
          {/* ------------------------------------------ */}

          <div className="border-t border-gray-100 pt-8">

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Site de travail
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Sélectionnez le site SNCF sur lequel vous
              travaillez habituellement.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site de travail
              </label>

              <select
                value={
                  formData.site_travail_id ??
                  ""
                }
                onChange={(e) =>
                  updateField(
                    "site_travail_id",
                    e.target.value
                      ? Number(
                          e.target.value
                        )
                      : null
                  )
                }
                className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                disabled={
                  loadingSites
                }
                required
              >
                <option value="">
                  {loadingSites
                    ? "Chargement..."
                    : "Sélectionnez votre site"}
                </option>

                {sites.map(
                  (site) => (
                    <option
                      key={
                        site.id
                      }
                      value={
                        site.id
                      }
                    >
                      {site.name}
                      {site.city
                        ? ` — ${site.city}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          {/* ------------------------------------------ */}
          {/* RÉSIDENCE                                 */}
          {/* ------------------------------------------ */}

          <div className="border-t border-gray-100 pt-8">

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Résidence
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Ces informations permettent à EnVoiture
              de calculer les compatibilités de
              covoiturage.
            </p>

            <div className="space-y-6">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔒 Adresse de résidence
                </label>

                <input
                  type="text"
                  value={
                    residence.adresse
                  }
                  onChange={(e) =>
                    updateResidenceField(
                      "adresse",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                  placeholder="Numéro et nom de rue"
                  required
                  disabled={
                    loadingResidence
                  }
                />

                <p className="text-xs text-gray-500 mt-2">
                  Votre adresse exacte reste strictement
                  privée. Elle n'est jamais visible par les
                  autres utilisateurs.
                </p>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>

                  <input
                    type="text"
                    value={
                      residence.code_postal
                    }
                    onChange={(e) =>
                      updateResidenceField(
                        "code_postal",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                    placeholder="Ex. 37520"
                    required
                    disabled={
                      loadingResidence
                    }
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>

                  <input
                    type="text"
                    value={
                      residence.ville
                    }
                    onChange={(e) =>
                      updateResidenceField(
                        "ville",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                    placeholder="Ex. La Riche"
                    required
                    disabled={
                      loadingResidence
                    }
                  />

                </div>

              </div>

            </div>
          </div>

          {/* ------------------------------------------ */}
          {/* VÉHICULES                                 */}
          {/* ------------------------------------------ */}

          <div className="border-t border-gray-100 pt-8">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Mes véhicules
                </h3>

                <p className="text-sm text-gray-500">
                  Ajoutez les véhicules que vous utilisez
                  pour le covoiturage.
                </p>
              </div>

              {!showVehicleForm && (
                <button
                  type="button"
                  onClick={() => {
                    resetVehicleForm();
                    setShowVehicleForm(
                      true
                    );
                  }}
                  className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                >
                  + Ajouter un véhicule
                </button>
              )}

            </div>

            {showVehicleForm && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-3xl p-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du véhicule
                    </label>

                    <input
                      type="text"
                      value={
                        vehicleForm.libelle
                      }
                      onChange={(e) =>
                        updateVehicleField(
                          "libelle",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                      placeholder="Ex. Ma voiture"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque
                    </label>

                    <input
                      type="text"
                      value={
                        vehicleForm.marque
                      }
                      onChange={(e) =>
                        updateVehicleField(
                          "marque",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                      placeholder="Ex. Peugeot"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle
                    </label>

                    <input
                      type="text"
                      value={
                        vehicleForm.modele
                      }
                      onChange={(e) =>
                        updateVehicleField(
                          "modele",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                      placeholder="Ex. 308"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur
                    </label>

                    <input
                      type="text"
                      value={
                        vehicleForm.couleur
                      }
                      onChange={(e) =>
                        updateVehicleField(
                          "couleur",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                      placeholder="Ex. Gris"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Places proposées
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        vehicleForm.places_proposees
                      }
                      onChange={(e) =>
                        updateVehicleField(
                          "places_proposees",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-white"
                    />
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                  <button
                    type="button"
                    onClick={
                      handleSaveVehicle
                    }
                    disabled={
                      savingVehicle
                    }
                    className="px-5 py-3 rounded-2xl bg-gray-900 text-white font-semibold disabled:opacity-60"
                  >
                    {savingVehicle
                      ? "Enregistrement..."
                      : editingVehicleId
                        ? "Modifier le véhicule"
                        : "Ajouter le véhicule"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetVehicleForm
                    }
                    className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>

                </div>

              </div>
            )}

            {!loadingVehicles &&
              vehicles.length === 0 &&
              !showVehicleForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mt-6">
                  <p className="text-gray-600">
                    Aucun véhicule enregistré.
                  </p>
                </div>
              )}

            {!loadingVehicles &&
              vehicles.length > 0 && (
                <div className="space-y-4 mt-6">

                  {vehicles.map(
                    (vehicle) => (
                      <div
                        key={
                          vehicle.id
                        }
                        className="bg-white border border-gray-200 rounded-3xl p-5"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                          <div>
                            <h4 className="font-bold text-gray-900">
                              {
                                vehicle.libelle
                              }
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              {[
                                vehicle.marque,
                                vehicle.modele,
                                vehicle.couleur,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " · "
                                )}

                              {" · "}

                              {
                                vehicle.places_proposees
                              }{" "}
                              place
                              {vehicle.places_proposees >
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                editVehicle(
                                  vehicle
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                archiveVehicle(
                                  vehicle
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 font-medium disabled:opacity-50"
                            >
                              Archiver
                            </button>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            {!loadingVehicles &&
              vehicles.length > 0 &&
              !showVehicleForm &&
              vehicleMessage && (
                <div className="text-sm text-gray-700 mt-4">
                  {vehicleMessage}
                </div>
              )}

          </div>

          {/* ------------------------------------------ */}
          {/* BOUTON ENREGISTRER                        */}
          {/* ------------------------------------------ */}

          <div className="border-t border-gray-100 pt-8">

            {message && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 text-sm text-gray-700">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                saving ||
                loadingResidence
              }
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold disabled:opacity-60"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer mon profil"}
            </button>

          </div>

        </div>

      </Card>
    </div>
  );
}