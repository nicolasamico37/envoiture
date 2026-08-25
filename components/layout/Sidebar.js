"use client";

import Link from "next/link";
import Image from "next/image";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useState,
  useEffect,
} from "react";

import LoadingScreen from "@/components/layout/LoadingScreen";

import {
  useAuth,
} from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";

const links = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: "🏠",
  },

  {
    href: "/profil",
    label: "Mon profil",
    icon: "🙍",
  },

  {
    href: "/preferences",
    label: "Mes préférences",
    icon: "⚙️",
  },

  {
    href: "/trajets",
    label: "Trajets",
    icon: "🚗",
  },

  {
    href: "/profils",
    label: "Profils compatibles",
    icon: "👥",
  },

  {
    href: "/messages",
    label: "Messages",
    icon: "💬",
  },

  {
    href: "/statistiques",
    label: "Statistiques",
    icon: "📊",
  },

  {
    href: "/aide",
    label: "Aide",
    icon: "❓",
  },
];

export default function Sidebar({
  mobile = false,
  onClose,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    profile,
    loading,
  } = useAuth();

  const [collapsed, setCollapsed] =
    useState(false);

  useEffect(() => {
    const savedState =
      localStorage.getItem(
        "envoiture-sidebar"
      );

    if (savedState) {
      setCollapsed(
        JSON.parse(savedState)
      );
    }
  }, []);

  function toggleSidebar() {
    const newState =
      !collapsed;

    setCollapsed(newState);

    localStorage.setItem(
      "envoiture-sidebar",
      JSON.stringify(newState)
    );
  }

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );

      return;
    }

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <LoadingScreen
        text="Chargement du menu..."
      />
    );
  }

  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${
        profile.last_name?.[0] ?? ""
      }`.toUpperCase()
    : "?";

  const displayName = profile
    ? `${profile.first_name ?? ""} ${
        profile.last_name ?? ""
      }`.trim()
    : "Nouveau compte";

  return (
    <aside
      className={`min-h-screen bg-white border-r border-gray-200 p-6 flex flex-col transition-all duration-300 ${
        mobile
          ? "w-72"
          : collapsed
            ? "w-28"
            : "w-72"
      }`}
    >
      <div
        className={`mb-8 ${
          collapsed &&
          !mobile
            ? "flex flex-col items-center"
            : ""
        }`}
      >
        <div
          className={`w-full flex ${
            collapsed &&
            !mobile
              ? "justify-center"
              : "justify-start"
          }`}
        >
          <Image
            src="/logo-icon.png"
            alt="EnVoiture"
            width={
              collapsed && !mobile
                ? 58
                : 72
            }
            height={
              collapsed && !mobile
                ? 58
                : 72
            }
            style={{
              width: "auto",
              height: "auto",
            }}
            className="rounded-2xl"
            priority
          />

          <div className="flex items-center gap-3 ml-auto">

            {!mobile && (
              <button
                onClick={
                  toggleSidebar
                }
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-xl shrink-0"
              >
                {collapsed
                  ? "➡️"
                  : "⬅️"}
              </button>
            )}

            {mobile && (
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-xl"
              >
                ✕
              </button>
            )}

          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className={`w-full mt-5 flex items-center ${
            collapsed &&
            !mobile
              ? "justify-center"
              : "gap-4"
          } px-5 py-4 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 transition`}
        >
          <span className="text-2xl">
            🚪
          </span>

          {(!collapsed ||
            mobile) && (
            <span className="font-medium">
              Quitter
            </span>
          )}
        </button>

      </div>

      <nav className="space-y-3">

        {links.map((link) => {
          const active =
            pathname ===
            link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                if (
                  mobile &&
                  onClose
                ) {
                  onClose();
                }
              }}
              className={`flex items-center ${
                collapsed &&
                !mobile
                  ? "justify-center"
                  : "gap-4"
              } px-5 py-4 rounded-2xl transition ${
                active
                  ? "bg-gradient-to-r from-pink-600 to-red-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-2xl">
                {link.icon}
              </span>

              {(!collapsed ||
                mobile) && (
                <span className="font-medium">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}

      </nav>

      <div className="mt-auto space-y-4">

        <div
          className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center ${
            collapsed &&
            !mobile
              ? "justify-center"
              : "gap-4"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {profile
              ? profile.avatar ||
                initials
              : "?"}
          </div>

          {(!collapsed ||
            mobile) && (
            <div className="min-w-0">

              <p className="font-semibold text-gray-900 truncate">
                {displayName}
              </p>

              <p className="text-sm text-gray-500 truncate">
                {profile
                  ? profile.establishment ||
                    "Établissement non renseigné"
                  : "Profil à compléter"}
              </p>

            </div>
          )}

        </div>

      </div>
    </aside>
  );
}
