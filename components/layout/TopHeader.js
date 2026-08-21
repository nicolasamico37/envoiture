"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function TopHeader() {
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
      const {
        data,
        error,
      } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          titre,
          message,
          lu,
          trajet_id,
          participation_id,
          conversation_id,
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
   * MARQUER UNE NOTIFICATION COMME LUE
   * --------------------------------------------------
   */

  async function markAsRead(
    notificationId
  ) {
    if (!profile?.id) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from("notifications")
        .update({
          lu: true,
        })
        .eq(
          "id",
          notificationId
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
              notificationId
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
    if (!profile?.id) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from("notifications")
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
   * SUPPRESSION D'UNE NOTIFICATION
   * --------------------------------------------------
   */

  async function deleteNotification(
    notificationId
  ) {
    if (!profile?.id) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from("notifications")
        .delete()
        .eq(
          "id",
          notificationId
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
              notificationId
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
   * OUVRIR LE TRAJET LIÉ À LA NOTIFICATION
   * --------------------------------------------------
   */

    async function openNotification(
    notification
  ) {
    /*
     * --------------------------------------------------
     * 1. Marquer la notification comme lue
     * --------------------------------------------------
     */

    if (
      !notification.lu
    ) {
      await markAsRead(
        notification.id
      );
    }

    /*
     * --------------------------------------------------
     * 2. Notification liée à une conversation
     * --------------------------------------------------
     */

    if (
      notification.conversation_id
    ) {
      localStorage.setItem(
        "envoiture-selected-conversation",
        notification.conversation_id
      );

      setShowNotifications(
        false
      );

      window.location.href =
        "/messages";

      return;
    }

    /*
     * --------------------------------------------------
     * 3. Notification liée à un trajet
     * --------------------------------------------------
     */

    if (
      notification.trajet_id
    ) {
      setShowNotifications(
        false
      );

      window.location.href =
        `/trajets?trajet_id=${encodeURIComponent(
          notification.trajet_id
        )}`;

      return;
    }

    /*
     * --------------------------------------------------
     * 4. Notification sans destination
     * --------------------------------------------------
     */

    setShowNotifications(
      false
    );
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">

      <div className="h-24 px-6 lg:px-10 flex items-center justify-between">

        {/* LOGO */}

        <div className="flex-1 flex justify-center">

          <Link
            href="/"
            className="block hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
          >
            <Image
              src="/logo-text.png"
              alt="EnVoiture"
              width={320}
              height={80}
              style={{
                width: "auto",
                height: "auto",
              }}
              className="max-w-[220px] lg:max-w-[320px]"
              priority
            />
          </Link>

        </div>

        {/* NOTIFICATIONS */}

        <div
          ref={dropdownRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (current) =>
                  !current
              )
            }
            className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center text-xl lg:text-2xl"
            aria-label="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-5 lg:min-w-[24px] lg:h-6 px-1 bg-red-500 rounded-full text-white text-[10px] lg:text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (

            <div className="absolute top-16 right-0 w-[calc(100vw-24px)] max-w-[380px] bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50">

              {/* EN-TÊTE */}

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
                    className="text-sm text-pink-600 font-medium hover:text-pink-700"
                  >
                    Tout lire
                  </button>
                )}

              </div>

              {/* LISTE */}

              <div className="max-h-[70vh] overflow-y-auto">

                {notifications.length ===
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

                        <div className="flex items-start gap-3">

                          {/* CONTENU CLIQUABLE */}

                          <button
                            type="button"
                            onClick={() =>
                              openNotification(
                                notification
                              )
                            }
                            className="flex-1 text-left min-w-0"
                          >

                            <p className="font-semibold text-gray-900 text-sm lg:text-base">
                              {
                                notification.titre
                              }
                            </p>

                            <p className="text-sm lg:text-base text-gray-700 leading-relaxed mt-1">
                              {
                                notification.message
                              }
                            </p>

                            {notification.trajet_id && (
                              <p className="text-xs text-pink-600 font-medium mt-2">
                                Voir le trajet →
                              </p>
                            )}

                          </button>

                          {/* SUPPRESSION */}

                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Supprimer la notification"
                            aria-label="Supprimer la notification"
                          >
                            ✕
                          </button>

                        </div>

                        {!notification.lu && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="mt-3 text-sm text-pink-600 font-medium hover:text-pink-700"
                          >
                            Marquer comme lu
                          </button>
                        )}

                      </div>

                    )
                  )

                )}

              </div>

              {/* PIED */}

              <div className="p-4 bg-gray-50 border-t border-gray-200">

                <Link
                  href="/messages"
                  onClick={() =>
                    setShowNotifications(
                      false
                    )
                  }
                  className="text-sm text-pink-600 font-medium"
                >
                  Voir les messages
                </Link>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}