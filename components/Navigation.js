"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import Link from "next/link";

export default function Navigation() {
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

  useEffect(() => {
    loadNotifications();
  }, []);

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

  function loadNotifications() {
    const savedNotifications =
      JSON.parse(
        localStorage.getItem(
          "envoiture-notifications"
        ) || "[]"
      );

    setNotifications(
      savedNotifications
    );
  }

  function toggleNotifications() {
    setShowNotifications(
      !showNotifications
    );
  }

  function markAsRead(id) {
    const updatedNotifications =
      notifications.map(
        (notification) => {
          if (
            notification.id === id
          ) {
            return {
              ...notification,
              read: true,
            };
          }

          return notification;
        }
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      "envoiture-notifications",
      JSON.stringify(
        updatedNotifications
      )
    );
  }

  function deleteNotification(id) {
    const updatedNotifications =
      notifications.filter(
        (notification) =>
          notification.id !== id
      );

    setNotifications(
      updatedNotifications
    );

    localStorage.setItem(
      "envoiture-notifications",
      JSON.stringify(
        updatedNotifications
      )
    );
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-end relative">
      <div
        className="relative"
        ref={dropdownRef}
      >
        <button
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

              <button
                onClick={() => {
                  const updated =
                    notifications.map(
                      (
                        notification
                      ) => ({
                        ...notification,
                        read: true,
                      })
                    );

                  setNotifications(
                    updated
                  );

                  localStorage.setItem(
                    "envoiture-notifications",
                    JSON.stringify(
                      updated
                    )
                  );
                }}
                className="text-sm text-pink-600 font-medium"
              >
                Tout lire
              </button>
            </div>

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
                        notification.read
                          ? "bg-white"
                          : "bg-pink-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm lg:text-base text-gray-800 leading-relaxed">
                            {
                              notification.text
                            }
                          </p>

                          {!notification.read && (
                            <button
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
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          className="text-gray-400 hover:text-red-500 transition"
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