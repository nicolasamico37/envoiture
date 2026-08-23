"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

const DAYS = [
  ["lundi", "Lundi"], ["mardi", "Mardi"], ["mercredi", "Mercredi"],
  ["jeudi", "Jeudi"], ["vendredi", "Vendredi"],
  ["samedi", "Samedi"], ["dimanche", "Dimanche"],
];

const defaults = () => DAYS.map(([jour]) => ({
  id: null, jour, actif: false,
  depart_domicile: "", prise_service: "", retour: "",
}));

export default function PreferencesPage() {
  const { profile, loading } = useAuth();
  const [preferences, setPreferences] = useState({
    peut_conduire: false, peut_etre_passager: true,
  });
  const [habits, setHabits] = useState(defaults());
  const [loadingData, setLoadingData] = useState(true);
  const [habitsLoadFailed, setHabitsLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    async function load() {
      setLoadingData(true);
      setHabitsLoadFailed(false);

      const { data: pref, error: prefError } = await supabase
        .from("preferences_utilisateur")
        .select("id, peut_conduire, peut_etre_passager")
        .eq("utilisateur_id", profile.id)
        .maybeSingle();

      if (prefError) {
        console.error("Erreur lors du chargement des préférences :", prefError);
        setMessage("Impossible de charger vos préférences.");
      } else if (pref) {
        setPreferences({
          peut_conduire: Boolean(pref.peut_conduire),
          peut_etre_passager: Boolean(pref.peut_etre_passager),
        });
      }

      const { data, error } = await supabase
        .from("habitudes_deplacement")
        .select("id, jour, actif, depart_domicile, prise_service, retour")
        .eq("utilisateur_id", profile.id);

      if (error) {
        console.error("Erreur lors du chargement des habitudes :", error);
        setHabitsLoadFailed(true);
        setMessage("Impossible de charger vos horaires de déplacement.");
      } else {
        const loaded = defaults();
        (data || []).forEach(h => {
          const i = loaded.findIndex(x => x.jour === h.jour);
          if (i >= 0) loaded[i] = {
            id: h.id ?? null, jour: h.jour, actif: Boolean(h.actif),
            depart_domicile: h.depart_domicile?.slice(0,5) || "",
            prise_service: h.prise_service?.slice(0,5) || "",
            retour: h.retour?.slice(0,5) || "",
          };
        });
        setHabits(loaded);
      }
      setLoadingData(false);
    }
    load();
  }, [profile]);

  const updateHabit = (jour, field, value) =>
    setHabits(xs => xs.map(x => x.jour === jour ? { ...x, [field]: value } : x));

  const toggleDay = (jour, actif) =>
    updateHabit(jour, "actif", actif);

  async function saveHabits(userId) {
    if (habitsLoadFailed) throw new Error(
      "Les horaires actuels n'ont pas pu être chargés. Ils ne seront pas modifiés."
    );

    for (const h of habits) {
      if (h.actif && (!h.depart_domicile || !h.prise_service || !h.retour))
        throw new Error(`Veuillez renseigner les trois horaires pour ${DAYS.find(d => d[0] === h.jour)?.[1]}.`);
    }

    for (const h of habits) {
      const payload = {
        utilisateur_id: userId, jour: h.jour, actif: Boolean(h.actif),
        depart_domicile: h.actif ? h.depart_domicile : null,
        prise_service: h.actif ? h.prise_service : null,
        retour: h.actif ? h.retour : null,
        updated_at: new Date().toISOString(),
      };
      if (h.id) {
        const { error } = await supabase.from("habitudes_deplacement")
          .update(payload).eq("id", h.id).eq("utilisateur_id", userId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("habitudes_deplacement")
          .insert(payload).select("id, jour").single();
        if (error) throw error;
        if (data) setHabits(xs => xs.map(x => x.jour === data.jour ? { ...x, id: data.id } : x));
      }
    }
  }

  async function save() {
    if (!profile?.id) return;
    setSaving(true); setMessage("");
    try {
      const { data: existing, error: loadError } = await supabase
        .from("preferences_utilisateur").select("id")
        .eq("utilisateur_id", profile.id).maybeSingle();
      if (loadError) throw loadError;

      const payload = {
        utilisateur_id: profile.id,
        peut_conduire: preferences.peut_conduire,
        peut_etre_passager: preferences.peut_etre_passager,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase.from("preferences_utilisateur")
          .update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("preferences_utilisateur")
          .insert({ ...payload, notifications_application: false, notifications_email: false });
        if (error) throw error;
      }

      await saveHabits(profile.id);
      setMessage("Préférences enregistrées avec succès ✅");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des préférences :", error);
      setMessage(error?.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally { setSaving(false); }
  }

  if (loading || !profile || loadingData)
    return <LoadingScreen text="Chargement des préférences..." />;

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <Card title="Mes préférences">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900">Participation au covoiturage</h2>
            <p className="text-sm text-gray-500 mt-1">Indiquez comment vous souhaitez participer au covoiturage.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ["peut_conduire", "Conducteur"],
                ["peut_etre_passager", "Passager"],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="inline-flex items-center gap-3 cursor-pointer border border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-pink-300 transition"
                >
                  <input
                    type="checkbox"
                    checked={preferences[field]}
                    onChange={e => setPreferences(x => ({ ...x, [field]: e.target.checked }))}
                    className="h-5 w-5"
                  />
                  <span className="text-gray-800 font-medium">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Habitudes de déplacement</h2>
            <p className="text-sm text-gray-500 mt-1">Définissez vos habitudes pour chaque jour. Les horaires peuvent être différents d'un jour à l'autre.</p>

            <div className="mt-4">
              <div className="hidden md:grid grid-cols-[220px_1fr_1fr_1fr] gap-3 px-4 mb-2">
                <div></div>
                <div className="text-sm font-medium text-gray-700">Départ du domicile</div>
                <div className="text-sm font-medium text-gray-700">Prise de service</div>
                <div className="text-sm font-medium text-gray-700">Retour</div>
              </div>

              <div className="space-y-1">
                {habits.map(h => (
                  <div
                    key={h.jour}
                    className={`grid grid-cols-1 md:grid-cols-[220px_1fr_1fr_1fr] gap-3 items-center border rounded-xl px-4 py-2 ${
                      h.actif
                        ? "border-pink-200 bg-pink-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={h.actif}
                        onChange={e => toggleDay(h.jour, e.target.checked)}
                        className="h-5 w-5 shrink-0"
                      />
                      <span className="font-semibold text-gray-900">
                        {DAYS.find(d => d[0] === h.jour)?.[1]}
                      </span>
                    </label>

                    {[
                      ["depart_domicile", "Départ du domicile"],
                      ["prise_service", "Prise de service"],
                      ["retour", "Retour"],
                    ].map(([field, label]) => (
                      <label key={field} className="flex flex-col">
                        <span className="md:hidden text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </span>
                        <input
                          type="time"
                          value={h[field]}
                          disabled={!h.actif}
                          onChange={e => updateHabit(h.jour, field, e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {message && <div className="rounded-2xl bg-gray-100 border border-gray-200 px-5 py-4 text-sm text-gray-700">{message}</div>}

          <div className="flex justify-end pt-2">
            <button type="button" onClick={save} disabled={saving}
              className="bg-gradient-to-r from-pink-600 to-red-500 text-white px-7 py-3 rounded-2xl font-semibold disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer les préférences"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
