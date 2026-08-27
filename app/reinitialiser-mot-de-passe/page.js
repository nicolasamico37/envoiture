"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setMessage(
            "Le lien de réinitialisation est invalide ou a expiré. Veuillez recommencer la procédure."
          );
        }
      } catch (error) {
        console.error(
          "Erreur vérification session :",
          error
        );

        setMessage(
          "Impossible de vérifier votre session de réinitialisation."
        );
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password.length < 8) {
      setMessage(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(
          "Votre session de réinitialisation est introuvable ou a expiré. Veuillez recommencer la procédure."
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setMessage(
        "Votre mot de passe a été modifié avec succès."
      );

      // Petite pause pour laisser le message s'afficher
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "Erreur réinitialisation mot de passe :",
        error
      );

      setMessage(
        error?.message ||
          "Impossible de modifier votre mot de passe."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="text-center text-gray-500">
          Vérification du lien...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Nouveau mot de passe
          </h1>

          <p className="text-gray-500 mt-2 mb-8">
            Choisissez un nouveau mot de passe pour
            accéder à votre compte EnVoiture.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border rounded-2xl px-5 py-4 pr-14"
                required
                minLength={8}
                disabled={success}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
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
                      d="M2.25 12s3.75-7.25 9.75-7.25S21.75 19.25 12 19.25 2.25 12 2.25 12z"
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

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full border rounded-2xl px-5 py-4 pr-14"
                required
                minLength={8}
                disabled={success}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
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
                      d="M9.88 5.09A10.94 10.94 0 0112 4.75c5.25 0 9.47 3.47 10.5 7.25a11.7 11.7 0 014.17 5.49"
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
                      d="M2.25 12s3.75-7.25 9.75-7.25S21.75 19.25 12 19.25 2.25 12 2.25 12z"
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

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-4 rounded-2xl"
            >
              {loading
                ? "Patiente..."
                : "Modifier mon mot de passe"}
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
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          EnVoiture · Covoiturage entre agents SNCF
        </p>
      </div>
    </main>
  );
}