"use client";

import {
  useEffect,
  useState,
} from "react";

import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";

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
        city: "",
        photo: "",
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

      city:
        profile.zone ?? "",

      photo:
        profile.photo ?? "",

      site_travail_id:
        profile.site_travail_id ?? null,
    });

    async function loadProfileData() {
      setLoadingResidence(true);
      setLoadingPreferences(true);
      setLoadingVehicles(true);

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
        .select(
          "adresse, code_postal, ville"
        )
        .eq(
          "utilisateur_id",
          profile.id
        )
        .maybeSingle();

      if (residenceError) {
        console.error(
          "Erreur lors du chargement de la résidence privée :",
          residenceError
        );

        setMessage(
          "Impossible de charger les informations de résidence."
        );
      } else if (residenceData) {
        setResidence({
          adresse:
            residenceData.adresse ?? "",

          code_postal:
            residenceData.code_postal ?? "",

          ville:
            residenceData.ville ?? "",
        });
      } else {
        setResidence({
          adresse: "",
          code_postal: "",
          ville: "",
        });
      }

      setLoadingResidence(false);

      /*
       * -----------------------------------------------
       * PRÉFÉRENCES UTILISATEUR
       * -----------------------------------------------
       */

      const {
        data: preferencesData,
        error: preferencesError,
      } = await supabase
        .from(
          "preferences_utilisateur"
        )
        .select(`
          id,
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
          "Erreur lors du chargement des préférences :",
          preferencesError
        );

        setMessage(
          "Impossible de charger vos préférences de covoiturage."
        );
      } else if (preferencesData) {
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
            preferencesData
              .parking_travail_id ?? null,

          vehicule_defaut_id:
            preferencesData
              .vehicule_defaut_id ?? null,
        });
      }

      /*
       * -----------------------------------------------
       * PARKINGS DU SITE DE TRAVAIL
       * -----------------------------------------------
       */

      if (
        profile.site_travail_id
      ) {
        const {
          data: parkingData,
          error: parkingError,
        } = await supabase
          .from("sncf_parkings")
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
            profile.site_travail_id
          )
          .eq(
            "active",
            true
          )
          .order(
            "name",
            {
              ascending: true,
            }
          );

        if (parkingError) {
          console.error(
            "Erreur lors du chargement des parkings :",
            parkingError
          );
        } else {
          setParkings(
            parkingData || []
          );
        }
      } else {
        setParkings([]);
      }

      /*
       * -----------------------------------------------
       * VÉHICULES
       * -----------------------------------------------
       */

      const {
        data: vehicleData,
        error: vehicleError,
      } = await supabase
        .from("vehicules")
        .select(`
          id,
          utilisateur_id,
          libelle,
          marque,
          modele,
          couleur,
          places_proposees,
          statut,
          created_at,
          updated_at
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
        console.error(
          "Erreur lors du chargement des véhicules :",
          vehicleError
        );

        setVehicleMessage(
          "Impossible de charger vos véhicules."
        );
      } else {
        setVehicles(
          vehicleData || []
        );
      }

      setLoadingPreferences(false);
      setLoadingVehicles(false);
    }

    loadProfileData();

    setMessage("");
    setVehicleMessage("");
  }, [profile]);

  /*
   * ------------------------------------------------
   * CHARGEMENT DES PARKINGS POUR UN NOUVEAU PROFIL
   * ------------------------------------------------
   */

  useEffect(() => {
    if (
      profile ||
      !formData?.site_travail_id
    ) {
      if (!formData?.site_travail_id) {
        setParkings([]);
      }

      return;
    }

    async function loadNewProfileParkings() {
      const {
        data,
        error,
      } = await supabase
        .from("sncf_parkings")
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
          formData.site_travail_id
        )
        .eq(
          "active",
          true
        )
        .order(
          "name",
          {
            ascending: true,
          }
        );

      if (error) {
        console.error(
          "Erreur lors du chargement des parkings :",
          error
        );

        setParkings([]);
      } else {
        setParkings(
          data || []
        );
      }
    }

    loadNewProfileParkings();
  }, [
    profile,
    formData?.site_travail_id,
  ]);

  /*
   * ------------------------------------------------
   * AFFICHAGE DU CHARGEMENT
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

  /*
   * ------------------------------------------------
   * MODIFICATION DES CHAMPS
   * ------------------------------------------------
   */

  function updateField(
    field,
    value
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function updateResidenceField(
    field,
    value
  ) {
    setResidence((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function updatePreference(
    field,
    value
  ) {
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  }

  function updateVehicleField(
    field,
    value
  ) {
    setVehicleForm((current) => ({
      ...current,
      [field]: value,
    }));

    setVehicleMessage("");
  }

  /*
   * ------------------------------------------------
   * GÉOCODAGE
   * ------------------------------------------------
   */

  async function geocodeResidence() {
    const adresse =
      residence.adresse.trim();

    const codePostal =
      residence.code_postal.trim();

    const ville =
      residence.ville.trim();

    if (
      !adresse ||
      !codePostal ||
      !ville
    ) {
      setMessage(
        "Veuillez renseigner votre adresse, votre code postal et votre ville."
      );

      return null;
    }

    const response =
      await fetch(
        "/api/geocode",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            adresse,
            code_postal:
              codePostal,
            ville,
          }),
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          "Impossible de géocoder cette adresse."
      );
    }

    if (
      data.confidence !== "high"
    ) {
      throw new Error(
        "L'adresse n'a pas pu être vérifiée avec suffisamment de précision. Vérifiez l'adresse saisie."
      );
    }

    return data.result;
  }

  /*
   * ------------------------------------------------
   * ENREGISTREMENT DU PROFIL
   * ------------------------------------------------
   */

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

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
        !formData.last_name.trim() ||
        !formData.city.trim()
      ) {
        setMessage(
          "Veuillez renseigner votre prénom, votre nom et votre secteur de résidence."
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

            secteur:
              formData.city.trim(),

            photo:
              formData.photo || null,
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

            secteur:
              formData.city.trim(),

            photo:
              formData.photo || null,

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
              geocoded.ban_id,

            latitude:
              geocoded.latitude,

            longitude:
              geocoded.longitude,

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
          "Erreur lors de l'enregistrement de la résidence privée :",
          residenceError
        );

        setMessage(
          "Le profil a été enregistré, mais pas la résidence."
        );

        return;
      }

      /*
       * -----------------------------------------------
       * PRÉFÉRENCES
       * -----------------------------------------------
       */

      const {
        data: existingPreferences,
        error: preferencesLoadError,
      } = await supabase
        .from(
          "preferences_utilisateur"
        )
        .select(`
          id
        `)
        .eq(
          "utilisateur_id",
          userId
        )
        .maybeSingle();

      if (preferencesLoadError) {
        console.error(
          "Erreur lors du chargement des préférences existantes :",
          preferencesLoadError
        );

        setMessage(
          "Impossible de charger vos préférences de covoiturage."
        );

        return;
      }

      const preferencesPayload = {
        utilisateur_id:
          userId,

        peut_conduire:
          preferences.peut_conduire,

        peut_etre_passager:
          preferences.peut_etre_passager,

        parking_travail_id:
          preferences.peut_conduire
            ? preferences.parking_travail_id
            : null,

        vehicule_defaut_id:
          preferences.peut_conduire
            ? preferences.vehicule_defaut_id
            : null,

        updated_at:
          new Date().toISOString(),
      };

      if (
        existingPreferences
      ) {
        const {
          error:
            preferencesUpdateError,
        } = await supabase
          .from(
            "preferences_utilisateur"
          )
          .update(
            preferencesPayload
          )
          .eq(
            "id",
            existingPreferences.id
          );

        if (
          preferencesUpdateError
        ) {
          console.error(
            "Erreur lors de la mise à jour des préférences :",
            preferencesUpdateError
          );

          setMessage(
            `Erreur préférences : ${
              preferencesUpdateError.message ||
              "Erreur inconnue"
            }`
          );

          return;
        }
      } else {
        const {
          error:
            preferencesInsertError,
        } = await supabase
          .from(
            "preferences_utilisateur"
          )
          .insert({
            ...preferencesPayload,

            notifications_application:
              false,

            notifications_email:
              false,
          });

        if (
          preferencesInsertError
        ) {
          console.error(
            "Erreur lors de la création des préférences :",
            preferencesInsertError
          );

          setMessage(
            `Erreur préférences : ${
              preferencesInsertError.message ||
              "Erreur inconnue"
            }`
          );

          return;
        }
      }

      /*
       * -----------------------------------------------
       * RAFRAÎCHISSEMENT
       * -----------------------------------------------
       */

      await refreshProfile();

      setMessage(
        profile
          ? "Profil enregistré et adresse vérifiée ✅"
          : "Profil créé et adresse vérifiée ✅"
      );

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement :",
        error
      );

      setMessage(
        error?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ------------------------------------------------
   * AJOUT D'UN VÉHICULE
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
    setVehicleMessage("");
  }

  function handleEditVehicle(vehicle) {
    if (!preferences.peut_conduire) {
      return;
    }

    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      libelle: vehicle.libelle || "",
      marque: vehicle.marque || "",
      modele: vehicle.modele || "",
      couleur: vehicle.couleur || "",
      places_proposees:
        Number(vehicle.places_proposees) || 1,
    });
    setShowVehicleForm(true);
    setVehicleMessage("");
  }

  async function handleSaveVehicle() {
    if (!preferences.peut_conduire) {
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

    const libelle =
      vehicleForm.libelle.trim();

    const marque =
      vehicleForm.marque.trim();

    const modele =
      vehicleForm.modele.trim();

    const couleur =
      vehicleForm.couleur.trim();

    const places = Number(
      vehicleForm.places_proposees
    );

    if (!libelle) {
      setVehicleMessage(
        "Veuillez donner un nom à votre véhicule."
      );
      return;
    }

    if (
      !Number.isInteger(places) ||
      places < 1
    ) {
      setVehicleMessage(
        "Le nombre maximal de passagers doit être supérieur à 0."
      );
      return;
    }

    setSavingVehicle(true);
    setVehicleMessage("");

    try {
      if (editingVehicleId) {
        const { count, error: tripCountError } =
          await supabase
            .from("trajets")
            .select(
              "id",
              {
                count: "exact",
                head: true,
              }
            )
            .eq(
              "vehicule_id",
              editingVehicleId
            )
            .gt(
              "places_proposees",
              places
            )
            .in("statut", [
              "ouvert",
              "complet",
            ]);

        if (tripCountError) {
          throw tripCountError;
        }

        if (count > 0) {
          setVehicleMessage(
            "Impossible de réduire cette capacité : au moins un trajet existant propose déjà davantage de places."
          );
          return;
        }

        const {
          data: updatedVehicle,
          error: updateError,
        } = await supabase
          .from("vehicules")
          .update({
            libelle,
            marque: marque || null,
            modele: modele || null,
            couleur: couleur || null,
            places_proposees: places,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            editingVehicleId
          )
          .eq(
            "utilisateur_id",
            userId
          )
          .select(`
            id,
            utilisateur_id,
            libelle,
            marque,
            modele,
            couleur,
            places_proposees,
            statut,
            created_at,
            updated_at
          `)
          .single();

        if (updateError) {
          throw updateError;
        }

        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id ===
            editingVehicleId
              ? updatedVehicle
              : vehicle
          )
        );

        resetVehicleForm();
        setVehicleMessage(
          "Véhicule modifié ✅"
        );
        return;
      }

      const {
        data: newVehicle,
        error: vehicleError,
      } = await supabase
        .from("vehicules")
        .insert({
          utilisateur_id: userId,
          libelle,
          marque: marque || null,
          modele: modele || null,
          couleur: couleur || null,
          places_proposees: places,
          statut: "actif",
        })
        .select(`
          id,
          utilisateur_id,
          libelle,
          marque,
          modele,
          couleur,
          places_proposees,
          statut,
          created_at,
          updated_at
        `)
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      if (!newVehicle) {
        throw new Error(
          "Le véhicule n'a pas pu être récupéré après son enregistrement."
        );
      }

      setVehicles((current) => [
        ...current,
        newVehicle,
      ]);

      if (vehicles.length === 0) {
        const {
          error: defaultError,
        } = await supabase
          .from(
            "preferences_utilisateur"
          )
          .update({
            vehicule_defaut_id:
              newVehicle.id,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "utilisateur_id",
            userId
          );

        if (defaultError) {
          throw defaultError;
        }

        setPreferences(
          (current) => ({
            ...current,
            vehicule_defaut_id:
              newVehicle.id,
          })
        );
      }

      resetVehicleForm();
      setVehicleMessage(
        vehicles.length > 0
          ? "Véhicule ajouté ✅"
          : "Véhicule ajouté et défini par défaut ✅"
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement du véhicule :",
        error
      );

      setVehicleMessage(
        `Erreur véhicule : ${
          error?.message ||
          "Une erreur est survenue."
        }`
      );
    } finally {
      setSavingVehicle(false);
    }
  }

  async function handleDeleteVehicle(vehicle) {
    if (!preferences.peut_conduire) {
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

    const confirmed = window.confirm(
      `Supprimer le véhicule « ${
        vehicle.libelle || "Véhicule"
      } » ?`
    );

    if (!confirmed) {
      return;
    }

    setSavingVehicle(true);
    setVehicleMessage("");

    try {
      if (
        preferences.vehicule_defaut_id ===
        vehicle.id
      ) {
        const {
          error: preferenceError,
        } = await supabase
          .from(
            "preferences_utilisateur"
          )
          .update({
            vehicule_defaut_id: null,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "utilisateur_id",
            userId
          );

        if (preferenceError) {
          throw preferenceError;
        }

        setPreferences(
          (current) => ({
            ...current,
            vehicule_defaut_id: null,
          })
        );
      }

      const { error: archiveError } =
        await supabase
          .from("vehicules")
          .update({
            archived_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", vehicle.id)
          .eq(
            "utilisateur_id",
            userId
          );

      if (archiveError) {
        throw archiveError;
      }

      setVehicles((current) =>
        current.filter(
          (item) => item.id !== vehicle.id
        )
      );

      if (
        editingVehicleId ===
        vehicle.id
      ) {
        resetVehicleForm();
      }

      setVehicleMessage(
        "Véhicule supprimé ✅"
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du véhicule :",
        error
      );

      setVehicleMessage(
        `Erreur véhicule : ${
          error?.message ||
          "Impossible de supprimer le véhicule."
        }`
      );
    } finally {
      setSavingVehicle(false);
    }
  }

  /*
   * ------------------------------------------------
   * VÉHICULE PAR DÉFAUT
   * ------------------------------------------------
   */

  async function handleSetDefaultVehicle(
    vehicleId
  ) {
    if (
      !preferences.peut_conduire
    ) {
      return;
    }

    const userId =
      profile?.id ||
      session?.user?.id;

    if (!userId) {
      return;
    }

    if (
      preferences.vehicule_defaut_id ===
      vehicleId
    ) {
      return;
    }

    setVehicleMessage("");

    const {
      error,
    } = await supabase
      .from(
        "preferences_utilisateur"
      )
      .update({
        vehicule_defaut_id:
          vehicleId,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "utilisateur_id",
        userId
      );

    if (error) {
      console.error(
        "Erreur lors de la définition du véhicule par défaut :",
        error
      );

      setVehicleMessage(
        error.message ||
          "Impossible de définir le véhicule par défaut."
      );

      return;
    }

    setPreferences(
      (current) => ({
        ...current,
        vehicule_defaut_id:
          vehicleId,
      })
    );

    setVehicleMessage(
      "Véhicule par défaut enregistré ✅"
    );

    setTimeout(() => {
      setVehicleMessage("");
    }, 2500);
  }

  function vehicleLabel(
    vehicle
  ) {
    if (vehicle.libelle) {
      return vehicle.libelle;
    }

    const details = [
      vehicle.marque,
      vehicle.modele,
    ]
      .filter(Boolean)
      .join(" ");

    return details || "Véhicule";
  }

  /*
   * ------------------------------------------------
   * AFFICHAGE
   * ------------------------------------------------
   */

  return (
    <div className="space-y-8">
      <Card
        title={
          profile
            ? "Mon profil"
            : "Créer mon profil"
        }
      >

        <form
          onSubmit={handleSave}
          className="space-y-8"
        >

          <div className="flex flex-col sm:flex-row items-center gap-6">

            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-4xl font-bold shrink-0">
              {initials || "?"}
            </div>

            <div className="flex-1 w-full">

              <h2 className="text-2xl font-bold text-gray-900">
                {formData.first_name ||
                  "Nouveau"}{" "}
                {formData.last_name}
              </h2>

              {profile?.email ? (
                <p className="text-gray-500">
                  {profile.email}
                </p>
              ) : session?.user?.email ? (
                <p className="text-gray-500">
                  {session.user.email}
                </p>
              ) : null}

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
              Adresse e-mail
            </label>

            <input
              type="email"
              value={
                profile?.email ??
                session?.user?.email ??
                ""
              }
              disabled
              className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-gray-50 text-gray-500"
            />

            <p className="text-xs text-gray-500 mt-2">
              L'adresse e-mail est gérée par
              l'authentification Supabase.
            </p>

          </div>

          {/* ------------------------------------------ */}
          {/* SITE DE TRAVAIL                           */}
          {/* ------------------------------------------ */}

          <div className="border-t border-gray-100 pt-8">

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Site de travail
            </h3>

            {profile ? (

              <>
                <div className="w-full border border-gray-200 rounded-2xl px-5 py-3 bg-gray-50 text-gray-700">
                  {profile.establishment ||
                    "Site de travail non renseigné"}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Votre site de travail est défini dans
                  votre profil professionnel.
                </p>
              </>

            ) : (

              <>
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
                  required
                  disabled={
                    loadingSites
                  }
                >

                  <option value="">
                    {loadingSites
                      ? "Chargement des sites..."
                      : "Sélectionnez votre site de travail"}
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

                <p className="text-xs text-gray-500 mt-2">
                  Sélectionnez votre site de travail.
                </p>
              </>

            )}

          </div>


            {/* ---------------------------------------- */}
            {/* PARKING                                 */}
            {/* ---------------------------------------- */}

            <div
              className={`mt-6 rounded-2xl p-5 border transition ${
                preferences.peut_conduire
                  ? "bg-gray-50 border-gray-200"
                  : "bg-gray-100 border-gray-200 opacity-55"
              }`}
            >

              <h4 className="font-semibold text-gray-900 mb-2">
                Parking de destination préféré
              </h4>

              <p className="text-sm text-gray-500 mb-4">
                Ce choix concerne vos trajets
                en tant que conducteur.
              </p>

              {parkings.length > 0 ? (

                <div className="space-y-3">

                  {parkings.map(
                    (parking) => (

                      <label
                        key={
                          parking.id
                        }
                        className={`flex items-center gap-4 border rounded-2xl p-4 transition ${
                          preferences.peut_conduire
                            ? "cursor-pointer bg-white hover:bg-gray-50"
                            : "cursor-not-allowed bg-gray-50"
                        } ${
                          preferences.parking_travail_id ===
                            parking.id &&
                          preferences.peut_conduire
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200"
                        }`}
                      >

                        <input
                          type="radio"
                          name="parking_travail"
                          value={
                            parking.id
                          }
                          checked={
                            preferences.parking_travail_id ===
                            parking.id
                          }
                          disabled={
                            !preferences.peut_conduire
                          }
                          onChange={() =>
                            updatePreference(
                              "parking_travail_id",
                              parking.id
                            )
                          }
                          className="w-5 h-5 accent-pink-600"
                        />

                        <span className="font-medium text-gray-900">
                          {
                            parking.name
                          }
                        </span>

                      </label>

                    )
                  )}

                </div>

              ) : (

                <p className="text-sm text-gray-500">
                  Aucun parking actif n'est
                  actuellement enregistré
                  pour votre site de travail.
                </p>

              )}

              {!preferences.peut_conduire && (
                <p className="text-sm text-gray-500 mt-4">
                  🔒 Activez « Conducteur » pour
                  modifier votre parking préféré.
                </p>
              )}

            </div>

            {/* ---------------------------------------- */}
            {/* VÉHICULES                               */}
            {/* ---------------------------------------- */}

            <div
              className={`mt-6 rounded-2xl p-5 border transition ${
                preferences.peut_conduire
                  ? "bg-gray-50 border-gray-200"
                  : "bg-gray-100 border-gray-200 opacity-55"
              }`}
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">

                <div>

                  <h4 className="font-semibold text-gray-900">
                    🚗 Mes véhicules
                  </h4>

                  <p className="text-sm text-gray-500 mt-1">
                    Gérez les véhicules que vous
                    pouvez utiliser pour le
                    covoiturage.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={
                    !preferences.peut_conduire ||
                    loadingVehicles
                  }
                  onClick={() => {
                    if (showVehicleForm) {
                      resetVehicleForm();
                    } else {
                      setEditingVehicleId(null);
                      setVehicleForm({
                        libelle: "",
                        marque: "",
                        modele: "",
                        couleur: "",
                        places_proposees: 1,
                      });
                      setShowVehicleForm(true);
                      setVehicleMessage("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showVehicleForm
                    ? "Annuler"
                    : "+ Ajouter un véhicule"}
                </button>

              </div>

              {!preferences.peut_conduire && (
                <p className="text-sm text-gray-500 mt-4">
                  🔒 Activez « Conducteur » pour
                  gérer vos véhicules.
                </p>
              )}

              {loadingVehicles && (
                <p className="text-sm text-gray-500 mt-4">
                  Chargement des véhicules...
                </p>
              )}

              {!loadingVehicles &&
                vehicles.length ===
                  0 && (

                  <div
                    className={`mt-4 rounded-2xl p-4 ${
                      preferences.peut_conduire
                        ? "bg-white"
                        : "bg-gray-100"
                    }`}
                  >

                    <p className="text-sm text-gray-500">
                      Aucun véhicule enregistré.
                    </p>

                  </div>

                )}

              {!loadingVehicles &&
                vehicles.length > 0 && (

                  <div className="space-y-3 mt-4">

                    {vehicles.map(
                      (vehicle) => {

                        const isDefault =
                          preferences.vehicule_defaut_id ===
                          vehicle.id;

                        return (

                          <div
                            key={
                              vehicle.id
                            }
                            className={`rounded-2xl p-4 border ${
                              isDefault &&
                              preferences.peut_conduire
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                              <div>

                                <div className="font-semibold text-gray-900">
                                  {vehicleLabel(
                                    vehicle
                                  )}
                                </div>

                                <div className="text-sm text-gray-500 mt-1">
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
                                    ) ||
                                    "Informations complémentaires non renseignées"}
                                </div>

                                <div className="text-sm text-gray-600 mt-2">
                                  {vehicle.places_proposees} {
                                    vehicle.places_proposees > 1
                                      ? "passagers maximum"
                                      : "passager maximum"
                                  }
                                </div>

                              </div>

                              <label
                                className={`flex items-center gap-2 text-sm font-medium ${
                                  preferences.peut_conduire
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                              >

                                <input
                                  type="radio"
                                  name="vehicule_defaut"
                                  checked={
                                    isDefault
                                  }
                                  disabled={
                                    !preferences.peut_conduire
                                  }
                                  onChange={() =>
                                    handleSetDefaultVehicle(
                                      vehicle.id
                                    )
                                  }
                                  className="w-5 h-5 accent-pink-600"
                                />

                                Véhicule par défaut

                              </label>

                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">

                              <button
                                type="button"
                                disabled={
                                  !preferences.peut_conduire ||
                                  savingVehicle
                                }
                                onClick={() =>
                                  handleEditVehicle(
                                    vehicle
                                  )
                                }
                                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                disabled={
                                  !preferences.peut_conduire ||
                                  savingVehicle
                                }
                                onClick={() =>
                                  handleDeleteVehicle(
                                    vehicle
                                  )
                                }
                                className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-red-700 font-medium disabled:opacity-50"
                              >
                                Supprimer
                              </button>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              {/* -------------------------------------- */}
              {/* AJOUT D'UN VÉHICULE                    */}
              {/* -------------------------------------- */}

              {showVehicleForm &&
                preferences.peut_conduire && (

                <div
                  className="mt-5 bg-white border border-gray-200 rounded-2xl p-5 space-y-5"
                >

                  <h5 className="font-semibold text-gray-900">
                    {editingVehicleId
                      ? "Modifier le véhicule"
                      : "Ajouter un véhicule"}
                  </h5>

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
                      placeholder="Ma voiture"
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                      required
                    />

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

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
                        placeholder="Peugeot"
                        className="w-full border border-gray-200 rounded-2xl px-5 py-3"
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
                        placeholder="308"
                        className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

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
                        placeholder="Gris"
                        className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                      />

                    </div>

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passagers maximum
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={
                          vehicleForm.places_proposees
                        }
                        onChange={(e) =>
                          updateVehicleField(
                            "places_proposees",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                        required
                      />

                    </div>

                  </div>

                  <p className="text-xs text-gray-500">
                    Indiquez le nombre maximum de
                    passagers que vous acceptez
                    d'emmener, hors conducteur.
                  </p>

                  {vehicleMessage && (
                    <div className="text-sm text-gray-700">
                      {vehicleMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleSaveVehicle
                    }
                    disabled={
                      savingVehicle
                    }
                    className="w-full bg-gray-900 text-white px-5 py-3 rounded-2xl font-semibold disabled:opacity-60"
                  >
                    {savingVehicle
                      ? "Enregistrement..."
                      : editingVehicleId
                      ? "Enregistrer les modifications"
                      : "Ajouter le véhicule"}
                  </button>

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
                  Secteur de résidence
                </label>

                <input
                  type="text"
                  value={
                    formData.city
                  }
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3"
                  required
                />

                <p className="text-xs text-gray-500 mt-2">
                  Cette information correspond à votre
                  secteur de résidence.
                </p>

              </div>

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
                    inputMode="numeric"
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
                    placeholder="37520"
                    disabled={
                      loadingResidence
                    }
                    required
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
                    placeholder="La Riche"
                    disabled={
                      loadingResidence
                    }
                    required
                  />

                </div>

              </div>

            </div>

          </div>

          {message && (
            <div className="text-center text-sm text-gray-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              loadingResidence ||
              loadingPreferences ||
              loadingSites
            }
            className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white px-5 py-4 rounded-2xl font-semibold disabled:opacity-60"
          >
            {saving
              ? "Vérification et enregistrement..."
              : profile
                ? "Enregistrer le profil"
                : "Créer mon profil"}
          </button>

        </form>

      </Card>
    </div>
  );
}