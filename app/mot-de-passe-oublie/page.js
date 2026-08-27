"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MotDePasseOubliePage() {
  const router = useRouter();

  const [cp, setCp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const numeroCp = cp.trim().toUpperCase();

    if (!/^\d{7}[A-Z]$/.test(numeroCp)) {
      setMessage(
        "Le numéro de CP doit comporter 7 chiffres suivis d'une lettre."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cp: numeroCp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error ||
            "Impossible de traiter votre demande."
        );
        return;
      }

      setSuccess(true);
      setMessage(
        "Si un compte correspondant existe, un e-mail de réinitialisation a été envoyé à l'adresse professionnelle associée à votre numéro de CP."
      );
    } catch (error) {
      console.error(
        "Erreur mot de passe oublié :",
        error
      );

      setMessage(
        "Impossible de traiter votre demande pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Mot de passe oublié
          </h1>

          <p className="text-gray-500 mt-2 mb-8">
            Entrez votre numéro de CP pour recevoir un
            lien permettant de réinitialiser votre mot
            de passe.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              inputMode="text"
              maxLength={8}
              placeholder="Numéro de CP"
              value={cp}
              onChange={(e) =>
                setCp(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^0-9A-Z]/g, "")
                )
              }
              className="w-full border rounded-2xl px-5 py-4"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-4 rounded-2xl"
            >
              {loading
                ? "Patiente..."
                : "Recevoir le lien"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-5 text-center text-sm ${
                success
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 w-full text-pink-600 hover:text-pink-700"
          >
            Retour à la connexion
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          EnVoiture · Covoiturage entre agents SNCF
        </p>
      </div>
    </main>
  );
}