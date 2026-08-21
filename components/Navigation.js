"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import Link from "next/link";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function Navigation() {
  const {
  profile,
} = useAuth();
  
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    loadingNotifications,
    setLoadingNotifications,
  ] = useState(false);

  const dropdownRef =
    useRef(null);

  /*
   * --------------------------------------------------
   * CHARGEMENT DES NOTIFICATIONS
   * --------------------------------------------------
   */

  async function loadNotifications() {
    if (!profile?.id) {
      return;
    }

    try {
      setLoadingNotifications(
        true
      );

      const {
        data,
        error,
      } = await supabase
        .from(
          "notifications"
        )
        .select(`
          id,
          type,
          titre,
          message,
          lu,
          trajet_id,
          participation_id,
          created_at
        `)
        .eq(
          "utilisateur_id",
          profile.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        throw error;
      }

      setNotifications(
        data || []
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des notifications :",
        error
      );
    } finally {
      setLoadingNotifications(
        false
      );
    }
  }

  /*
   * --------------------------------------------------
   * CHARGEMENT INITIAL + ACTUALISATION
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    loadNotifications();

    /*
     * On vérifie régulièrement s'il y a
     * une nouvelle notification.
     *
     * Cela permet à Nicolas de recevoir
     * la demande de Lapinou sans devoir
     * changer de page.
     */

    const interval =
      setInterval(
        () => {
          loadNotifications();
        },
        10000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    profile?.id,
  ]);

  /*
   * --------------------------------------------------
   * FERMETURE DU MENU EN CLIQUANT À L'EXTÉRIEUR
   * --------------------------------------------------
   */

  useEffect(() => {
    function handleClickOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * --------------------------------------------------
   * OUVERTURE / FERMETURE
   * --------------------------------------------------
   */

  function toggleNotifications() {
    setShowNotifications(
      (current) =>
        !current
    );
  }

  /*
   * --------------------------------------------------
   * MARQUER UNE NOTIFICATION COMME LUE
   * --------------------------------------------------
   */

  async function markAsRead(
    id
  ) {
    try {
      const {
        error,
      } = await supabase
        .from(
          "notifications"
        )
        .update({
          lu: true,
        })
        .eq(
          "id",
          id
        )
        .eq(
          "utilisateur_id",
          profile.id
        );

      if (error) {
        throw error;
      }

      setNotifications(
        (current) =>
          current.map(
            (
              notification
            ) =>
              notification.id ===
              id
                ? {
                    ...notification,
                    lu: true,
                  }
                : notification
          )
      );
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification :",
        error
      );
    }
  }

  /*
   * --------------------------------------------------
   * TOUT LIRE
   * --------------------------------------------------
   */

  async function markAllAsRead() {
    try {
      const {
        error,
      } = await supabase
        .from(
          "notifications"
        )
        .update({
          lu: true,
        })
        .eq(
          "utilisateur_id",
          profile.id
        )
        .eq(
          "lu",
          false
        );

      if (error) {
        throw error;
      }

      setNotifications(
        (current) =>
          current.map(
            (
              notification
            ) => ({
              ...notification,
              lu: true,
            })
          )
      );
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications :",
        error
      );
    }
  }

  /*
   * --------------------------------------------------
   * SUPPRESSION
   * --------------------------------------------------
   *
   * Pour l'instant, la suppression est conservée
   * dans l'interface mais sera activée côté
   * Supabase lorsque la policy DELETE sera créée.
   *
   * Cela évite de masquer une erreur RLS.
   * --------------------------------------------------
   */

  async function deleteNotification(
    id
  ) {
    try {
      const {
        error,
      } = await supabase
        .from(
          "notifications"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "utilisateur_id",
          profile.id
        );

      if (error) {
        throw error;
      }

      setNotifications(
        (current) =>
          current.filter(
            (
              notification
            ) =>
              notification.id !==
              id
          )
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la notification :",
        error
      );
    }
  }

  /*
   * --------------------------------------------------
   * COMPTEUR
   * --------------------------------------------------
   */

  const unreadCount =
    notifications.filter(
      (
        notification
      ) =>
        !notification.lu
    ).length;

  /*
   * --------------------------------------------------
   * AFFICHAGE
   * --------------------------------------------------
   */

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-end relative">

      <div
        className="relative"
        ref={dropdownRef}
      >

        <button
          type="button"
          onClick={
            toggleNotifications
          }
          className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-xl lg:text-2xl"
        >

          🔔

          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[22px] h-5 lg:min-w-[24px] lg:h-6 px-1 bg-red-500 rounded-full text-white text-[10px] lg:text-xs flex items-center justify-center font-bold">
              {unreadCount}
            </div>
          )}

        </button>

        {showNotifications && (

          <div className="fixed top-20 lg:top-24 right-3 lg:right-6 w-[calc(100vw-24px)] lg:w-[380px] max-w-[380px] bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50">

            <div className="p-4 lg:p-5 border-b border-gray-200 flex items-center justify-between">

              <h2 className="font-bold text-gray-900 text-base lg:text-lg">
                Notifications
              </h2>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  className="text-sm text-pink-600 font-medium"
                >
                  Tout lire
                </button>
              )}

            </div>

            <div className="max-h-[70vh] overflow-y-auto">

              {loadingNotifications &&
              notifications.length ===
                0 ? (

                <div className="p-8 text-center text-gray-500">
                  Chargement...
                </div>

              ) : notifications.length ===
                0 ? (

                <div className="p-8 text-center text-gray-500">
                  Aucune notification
                </div>

              ) : (

                notifications.map(
                  (
                    notification
                  ) => (

                    <div
                      key={
                        notification.id
                      }
                      className={`p-4 lg:p-5 border-b border-gray-100 transition ${
                        notification.lu
                          ? "bg-white"
                          : "bg-pink-50"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex-1">

                          {notification.titre && (
                            <p className="font-semibold text-gray-900 text-sm lg:text-base mb-1">
                              {
                                notification.titre
                              }
                            </p>
                          )}

                          <p className="text-sm lg:text-base text-gray-800 leading-relaxed">
                            {
                              notification.message
                            }
                          </p>

                          {!notification.lu && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="mt-3 text-sm text-pink-600 font-medium"
                            >
                              Marquer comme lu
                            </button>
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Supprimer"
                        >
                          ✕
                        </button>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">

              <Link
                href="/messages"
                className="text-sm text-pink-600 font-medium"
              >
                Voir les messages
              </Link>

            </div>

          </div>

        )}

      </div>

    </header>
  );
}