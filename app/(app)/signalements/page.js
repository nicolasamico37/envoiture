// app/(app)/signalements/page.js

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const MOTIFS = [
  "Comportement inapproprié",
  "Non-respect de la charte",
  "Problème lié à un trajet",
  "Problème lié aux échanges",
  "Atteinte à la confidentialité",
  "Autre",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function SignalementsPage() {
  const { profile, loading } = useAuth();

  const [people, setPeople] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [certified, setCertified] = useState(false);

  const [loadingPeople, setLoadingPeople] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile?.id) return;

    async function loadPeople() {
      setLoadingPeople(true);
      setMessage("");

      try {
        const { data: contacts, error: contactsError } = await supabase
          .from("contacts")
          .select("contact_id")
          .eq("utilisateur_id", profile.id)
          .is("archived_at", null);

        if (contactsError) throw contactsError;

        const { data: myTrips, error: myTripsError } = await supabase
          .from("trajets")
          .select("id, conducteur_id, date_trajet")
          .eq("conducteur_id", profile.id);

        if (myTripsError) throw myTripsError;

        const myTripIds = (myTrips || []).map((row) => row.id);

        const { data: myParticipations, error: participationError } =
          await supabase
            .from("participations")
            .select("trajet_id, utilisateur_id, statut")
            .eq("utilisateur_id", profile.id)
            .eq("statut", "ACCEPTEE");

        if (participationError) throw participationError;

        const participatedTripIds = (myParticipations || []).map(
          (row) => row.trajet_id
        );

        const allTripIds = [
          ...new Set([...myTripIds, ...participatedTripIds]),
        ];

        let tripRows = [];

        if (allTripIds.length > 0) {
          const { data, error } = await supabase
            .from("trajets")
            .select("id, conducteur_id, date_trajet")
            .in("id", allTripIds);

          if (error) throw error;
          tripRows = data || [];
        }

        const tripMap = new Map(
          tripRows.map((trip) => [trip.id, trip])
        );

        const interactionMap = new Map();

        function addInteraction(userId) {
          if (!userId || userId === profile.id) return;
          if (!interactionMap.has(userId)) {
            interactionMap.set(userId, { id: userId });
          }
        }

        (contacts || []).forEach((row) => addInteraction(row.contact_id));

        (myParticipations || []).forEach((participation) => {
          const trip = tripMap.get(participation.trajet_id);
          if (trip) addInteraction(trip.conducteur_id);
        });

        if (myTripIds.length > 0) {
          const { data: passengers, error: passengersError } =
            await supabase
              .from("participations")
              .select("trajet_id, utilisateur_id, statut")
              .in("trajet_id", myTripIds)
              .eq("statut", "ACCEPTEE");

          if (passengersError) throw passengersError;

          (passengers || []).forEach((participation) => {
            addInteraction(participation.utilisateur_id);
          });
        }

        const { data: privateConversations, error: conversationsError } =
          await supabase
            .from("conversations")
            .select("utilisateur_1_id, utilisateur_2_id")
            .eq("type", "PRIVEE")
            .or(
              `utilisateur_1_id.eq.${profile.id},utilisateur_2_id.eq.${profile.id}`
            );

        if (conversationsError) throw conversationsError;

        (privateConversations || []).forEach((conversation) => {
          const otherId =
            conversation.utilisateur_1_id === profile.id
              ? conversation.utilisateur_2_id
              : conversation.utilisateur_1_id;

          addInteraction(otherId);
        });

        const userIds = Array.from(interactionMap.keys());

        if (userIds.length === 0) {
          setPeople([]);
          return;
        }

        const { data: users, error: usersError } = await supabase
          .from("utilisateurs")
          .select("id, prenom, nom")
          .in("id", userIds);

        if (usersError) throw usersError;

        const result = (users || [])
          .map((user) => ({
            id: user.id,
            prenom: user.prenom || "",
            nom: user.nom || "",
          }))
          .sort((a, b) =>
            `${a.nom} ${a.prenom}`.localeCompare(
              `${b.nom} ${b.prenom}`,
              "fr"
            )
          );

        setPeople(result);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des personnes signalables :",
          error
        );

        setMessage(
          "Impossible de charger les personnes avec lesquelles vous avez eu une interaction."
        );
      } finally {
        setLoadingPeople(false);
      }
    }

    loadPeople();
  }, [profile]);

  function addFiles(event) {
    const selected = Array.from(event.target.files || []);
    const available = MAX_FILES - files.length;
    const errors = [];
    const accepted = [];

    if (available <= 0) {
      setMessage(`Vous pouvez joindre au maximum ${MAX_FILES} fichiers.`);
      event.target.value = "";
      return;
    }

    selected.slice(0, available).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name} : type de fichier non autorisé.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} : taille supérieure à 10 Mo.`);
        return;
      }

      if (
        files.some(
          (existing) =>
            existing.name === file.name && existing.size === file.size
        )
      ) {
        return;
      }

      accepted.push(file);
    });

    setFiles((current) => [...current, ...accepted]);

    if (selected.length > available) {
      errors.push(`Vous pouvez joindre au maximum ${MAX_FILES} fichiers.`);
    }

    setMessage(errors.length ? errors.join(" ") : "");
    event.target.value = "";
  }

  function removeFile(index) {
    setFiles((current) => current.filter((_, i) => i !== index));
    setMessage("");
  }

  function submit(event) {
    event.preventDefault();
    setMessage("");

    if (!selectedPersonId) {
      setMessage("Veuillez sélectionner la personne concernée.");
      return;
    }

    if (!motif) {
      setMessage("Veuillez sélectionner un motif.");
      return;
    }

    if (!description.trim()) {
      setMessage("Veuillez décrire les faits concernés.");
      return;
    }

    if (!certified) {
      setMessage(
        "Vous devez confirmer que les renseignements fournis sont exacts et sincères."
      );
      return;
    }

    setMessage(
      "Le formulaire est prêt. L'enregistrement réel du signalement sera activé lors du raccordement final à Supabase."
    );
  }

  if (loading || !profile || loadingPeople) {
    return <LoadingScreen text="Chargement des signalements..." />;
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/aide"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            ← Retour à l'aide
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl shrink-0">
                🚨
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
                  Signaler un problème
                </h1>

                <p className="text-gray-600 mt-2">
                  Un signalement permet d'informer l'administration d'une
                  situation que vous estimez contraire à la charte
                  d'utilisation d'EnVoiture.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="p-6 lg:p-8 space-y-7">
            <section>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-800 mb-2">
                  Personne concernée{" "}
                  <span className="text-red-500">*</span>
                </span>

                {people.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 text-sm text-gray-600">
                    Aucune personne avec laquelle vous avez eu une interaction
                    ne peut actuellement être sélectionnée.
                  </div>
                ) : (
                  <select
                    value={selectedPersonId}
                    onChange={(event) => {
                      setSelectedPersonId(event.target.value);
                      setMessage("");
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
                  >
                    <option value="">Sélectionnez une personne</option>

                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {`${person.prenom} ${person.nom}`.trim()}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <p className="text-xs text-gray-500 mt-2">
                Seules les personnes avec lesquelles vous avez eu une
                interaction enregistrée dans EnVoiture peuvent être signalées.
              </p>
            </section>

            <section>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-800 mb-2">
                  Motif du signalement{" "}
                  <span className="text-red-500">*</span>
                </span>

                <select
                  value={motif}
                  onChange={(event) => {
                    setMotif(event.target.value);
                    setMessage("");
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">Sélectionnez un motif</option>

                  {MOTIFS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-800 mb-2">
                  Décrivez les faits{" "}
                  <span className="text-red-500">*</span>
                </span>

                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setMessage("");
                  }}
                  rows={7}
                  placeholder="Décrivez précisément ce qui s'est passé..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </label>
            </section>

            <section>
              <div className="mb-2">
                <span className="block text-sm font-semibold text-gray-800">
                  Pièces jointes
                </span>

                <span className="text-xs text-gray-500">
                  Facultatif · jusqu'à {MAX_FILES} fichiers · 10 Mo maximum par
                  fichier.
                </span>
              </div>

              <input
                id="signalement-files"
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(",")}
                onChange={addFiles}
                className="block w-full text-sm text-gray-600 border border-gray-200 rounded-xl bg-white px-3 py-2"
              />

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3"
                    >
                      <span className="text-xl shrink-0">📎</span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} Mo
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-red-50 border border-red-100 p-5">
              <h2 className="font-bold text-gray-900">
                Un signalement est une démarche sérieuse.
              </h2>

              <p className="text-sm text-gray-700 mt-2 leading-6">
                Il doit être effectué de bonne foi et reposer sur des faits
                réels, précis et sincères. Les informations et documents
                transmis doivent être exacts et ne doivent pas être
                volontairement trompeurs ou falsifiés.
              </p>

              <p className="text-sm text-gray-700 mt-3 leading-6">
                Tout signalement manifestement abusif, mensonger ou utilisé
                dans le but de nuire à un autre utilisateur pourra constituer
                un manquement à la charte d'utilisation d'EnVoiture et faire
                l'objet de mesures de la part de l'administration.
              </p>

              <label className="flex items-start gap-3 mt-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={(event) => {
                    setCertified(event.target.checked);
                    setMessage("");
                  }}
                  className="mt-1 h-5 w-5 shrink-0"
                />

                <span className="text-sm font-semibold text-gray-800 leading-5">
                  Je certifie que les renseignements fournis dans ce
                  signalement sont exacts et sincères, au regard des faits dont
                  j'ai personnellement connaissance.
                </span>
              </label>
            </section>

            {message && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
              <Link
                href="/aide"
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition font-semibold text-center"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={!certified || sending}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-red-500 text-white font-semibold hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
