"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const router = useRouter();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cp, setCp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const numeroCp = cp.trim().toUpperCase();

        // Vérification du format du CP
        if (!/^\d{7}[A-Z]$/.test(numeroCp)) {
          setMessage(
            "Le numéro de CP doit comporter 7 chiffres suivis d'une lettre."
          );
          return;
        }

        const response = await fetch("/api/signup", {
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
              "Impossible de créer le compte."
          );
          return;
        }

        setMessage(
          "Un e-mail de confirmation a été envoyé à votre adresse professionnelle SNCF."
        );

        return;
      }

      // Connexion classique
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "SUPABASE AUTH ERROR :",
        err
      );

      setMessage(
        err?.message ||
          "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        {mode === "login"
          ? "Connexion"
          : "Créer un compte"}
      </h1>

      <p className="text-gray-500 mb-8">
        Bienvenue sur EnVoiture.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {mode === "login" ? (
          <>
            <input
              type="email"
              placeholder="Adresse e-mail professionnelle"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded-2xl px-5 py-4"
              required
            />

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Mot de passe"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-2xl px-5 py-4 pr-14"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.58 10.58a2 2 0 002.84 2.84"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.88 5.09A10.94 10.94 0 0112 4.75c5.25 0 9.47 3.47 10.5 7.25a11.7 11.7 0 01-4.17 5.49"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.61 6.61A11.9 11.9 0 001.5 12c1.03 3.78 5.25 7.25 10.5 7.25 1.61 0 3.12-.33 4.42-.91"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12s3.75-7.25 9.75-7.25S21.75 12 21.75 12 18 19.25 12 19.25 2.25 12 2.25 12z"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
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

            <p className="text-sm text-gray-500">
              Votre numéro de CP sera utilisé pour
              vérifier votre appartenance à la SNCF.
            </p>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-4 rounded-2xl"
        >
          {loading
            ? "Patiente..."
            : mode === "login"
            ? "Se connecter"
            : "Créer le compte"}
        </button>
      </form>

      {message && (
        <div className="mt-5 text-center text-sm">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(
            mode === "login"
              ? "signup"
              : "login"
          );
          setMessage("");
        }}
        className="mt-8 w-full text-pink-600"
      >
        {mode === "login"
          ? "Créer un compte"
          : "J'ai déjà un compte"}
      </button>
    </div>
  );
}