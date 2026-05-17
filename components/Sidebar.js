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

import LoadingScreen from "@/components/LoadingScreen";

import getCurrentUserProfile from "@/utils/getCurrentUserProfile";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "🏠",
  },

  {
    href: "/trajets",
    label: "Trajets",
    icon: "🚗",
  },

  {
    href: "/profils",
    label: "Profils",
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
    href: "/profil",
    label: "Mon profil",
    icon: "🙍",
  },
];

export default function Sidebar({
  mobile = false,
  onClose,
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [collapsed, setCollapsed] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

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

    const currentProfile =
      getCurrentUserProfile();

    setProfile(currentProfile);
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

  function handleLogout() {
    router.push("/");
  }

  if (!profile) {
    return (
      <LoadingScreen text="Chargement du menu..." />
    );
  }

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
      <div>
        <div
          className={`mb-10 ${
            collapsed &&
            !mobile
              ? "flex flex-col items-center"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
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
                  collapsed &&
                  !mobile
                    ? 58
                    : 72
                }
                height={
                  collapsed &&
                  !mobile
                    ? 58
                    : 72
                }
                className="rounded-2xl"
                priority
              />
            </div>

            <div className="flex items-center gap-3">
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
      </div>

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
            {profile.avatar}
          </div>

          {(!collapsed ||
            mobile) && (
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {profile.name}
              </p>

              <p className="text-sm text-gray-500 truncate">
                {profile.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
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
    </aside>
  );
}