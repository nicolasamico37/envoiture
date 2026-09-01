"use client";

import {
  useState,
  useEffect,
  useMemo,
} from "react";

import Card from "@/components/Card";

import LoadingScreen from "@/components/layout/LoadingScreen";

import { useAuth } from "@/components/providers/AuthProvider";

import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const {
    profile,
    loading,
  } = useAuth();

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(true);

  const currentUserId =
    profile?.utilisateur_id ||
    profile?.id ||
    null;

  const currentProfileName =
    profile
      ? `${profile.prenom || ""} ${
          profile.nom || ""
        }`.trim()
      : "";

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    async function loadConversations() {
      setLoadingMessages(true);

      try {
        const {
          data: conversationRows,
          error: conversationsError,
        } = await supabase
          .from("conversations")
          .select(
            `
              id,
              type,
              utilisateur_1_id,
              utilisateur_2_id,
              trajet_id,
              created_at,
              updated_at
            `
          )
          .or(
            `utilisateur_1_id.eq.${currentUserId},utilisateur_2_id.eq.${currentUserId}`
          )
          .is("archived_at", null)
          .order(
            "updated_at",
            {
              ascending: false,
            }
          );

        if (conversationsError) {
          throw conversationsError;
        }

        if (
          !conversationRows ||
          conversationRows.length === 0
        ) {
          setConversations([]);
          setSelectedConversation(null);
          setLoadingMessages(false);
          return;
        }

        const otherUserIds =
          conversationRows.map(
            (conversation) =>
              conversation.utilisateur_1_id ===
              currentUserId
                ? conversation.utilisateur_2_id
                : conversation.utilisateur_1_id
          );

        const uniqueUserIds =
          [...new Set(otherUserIds)];

        const {
          data: profileRows,
          error: profilesError,
        } = await supabase
          .from("profils")
          .select(
            `
              utilisateur_id,
              prenom,
              nom
            `
          )
          .in(
            "utilisateur_id",
            uniqueUserIds
          );

        if (profilesError) {
          throw profilesError;
        }

        const profileMap =
          Object.fromEntries(
            (profileRows || []).map(
              (item) => [
                item.utilisateur_id,
                item,
              ]
            )
          );

        const {
          data: residenceRows,
          error: residencesError,
        } = await supabase
          .from("residences_privees")
          .select(
            `
              utilisateur_id,
              ville
            `
          )
          .in(
            "utilisateur_id",
            uniqueUserIds
          );

        if (residencesError) {
          throw residencesError;
        }

        const residenceMap =
          Object.fromEntries(
            (residenceRows || []).map(
              (item) => [
                item.utilisateur_id,
                item,
              ]
            )
          );

        const tripIds =
          conversationRows
            .map(
              (conversation) =>
                conversation.trajet_id
            )
            .filter(Boolean);

        let tripMap = {};

        if (tripIds.length > 0) {
          const {
            data: tripRows,
            error: tripsError,
          } = await supabase
            .from("trajets")
            .select(
              `
                id,
                secteur_depart,
                secteur_arrivee,
                date_trajet
              `
            )
            .in(
              "id",
              [...new Set(tripIds)]
            );

          if (tripsError) {
            throw tripsError;
          }

          tripMap =
            Object.fromEntries(
              (tripRows || []).map(
                (trip) => [
                  trip.id,
                  trip,
                ]
              )
            );
        }

        const conversationIds =
          conversationRows.map(
            (conversation) =>
              conversation.id
          );

        const {
          data: messageRows,
          error: messagesError,
        } = await supabase
          .from("messages")
          .select(
            `
              id,
              conversation_id,
              expediteur_id,
              contenu,
              created_at
            `
          )
          .in(
            "conversation_id",
            conversationIds
          )
          .is("archived_at", null)
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (messagesError) {
          throw messagesError;
        }

        const messagesByConversation =
          {};

        (
          messageRows || []
        ).forEach((item) => {
          if (
            !messagesByConversation[
              item.conversation_id
            ]
          ) {
            messagesByConversation[
              item.conversation_id
            ] = [];
          }

          messagesByConversation[
            item.conversation_id
          ].push(item);
        });

        const formattedConversations =
          conversationRows.map(
            (conversation) => {
              const otherUserId =
                conversation.utilisateur_1_id ===
                currentUserId
                  ? conversation.utilisateur_2_id
                  : conversation.utilisateur_1_id;

              const otherProfile =
                profileMap[
                  otherUserId
                ];

              const otherResidence =
                residenceMap[
                  otherUserId
                ];

              const trip =
                conversation.trajet_id
                  ? tripMap[
                      conversation.trajet_id
                    ]
                  : null;

              const conversationMessages =
                messagesByConversation[
                  conversation.id
                ] || [];

              const lastMessage =
                conversationMessages[
                  conversationMessages.length -
                    1
                ];

              const name =
                otherProfile
                  ? `${otherProfile.prenom || ""} ${
                      otherProfile.nom || ""
                    }`.trim()
                  : "Collègue";

              let location =
                "";

              if (trip) {
                location =
                  `${trip.secteur_depart || ""} → ${
                    trip.secteur_arrivee || ""
                  }`.trim();
              } else if (
                otherResidence?.ville
              ) {
                location =
                  otherResidence.ville;
              }

              return {
                id:
                  conversation.id,

                name,

                location,

                lastMessage:
                  lastMessage
                    ? lastMessage.contenu
                    : "",

                messages:
                  conversationMessages.map(
                    (item) => ({
                      id: item.id,

                      from:
                        item.expediteur_id ===
                        currentUserId
                          ? currentProfileName
                          : name,

                      text:
                        item.contenu,

                      time:
                        new Date(
                          item.created_at
                        ).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ),

                      senderId:
                        item.expediteur_id,
                    })
                  ),
              };
            }
          );

        setConversations(
          formattedConversations
        );

        const savedConversationId =
          localStorage.getItem(
            "envoiture-selected-conversation"
          );

        const savedConversation =
          formattedConversations.find(
            (conversation) =>
              conversation.id ===
              savedConversationId
          );

        setSelectedConversation(
          savedConversation ||
            formattedConversations[0] ||
            null
        );
      } catch (error) {
        console.error(
          "Erreur chargement messages :",
          error
        );

        setConversations([]);
        setSelectedConversation(null);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadConversations();
  }, [currentUserId, currentProfileName]);

  const filteredConversations =
    useMemo(() => {
      const normalizedSearch =
        search
          .toLowerCase()
          .trim();

      if (!normalizedSearch) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          conversation.location
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }, [
      conversations,
      search,
    ]);

  function handleSelectConversation(
    conversation
  ) {
    setSelectedConversation(
      conversation
    );

    localStorage.setItem(
      "envoiture-selected-conversation",
      conversation.id
    );
  }

  async function handleSendMessage() {
    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !selectedConversation ||
      !currentUserId
    ) {
      return;
    }

    const {
      data: newMessage,
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          selectedConversation.id,

        expediteur_id:
          currentUserId,

        contenu:
          trimmedMessage,
      })
      .select(
        `
          id,
          conversation_id,
          expediteur_id,
          contenu,
          created_at
        `
      )
      .single();

    if (error) {
      console.error(
        "Erreur envoi message :",
        error
      );

      return;
    }

    await supabase
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        selectedConversation.id
      );

    const formattedMessage = {
      id:
        newMessage.id,

      from:
        currentProfileName,

      text:
        newMessage.contenu,

      time:
        new Date(
          newMessage.created_at
        ).toLocaleTimeString(
          "fr-FR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),

      senderId:
        newMessage.expediteur_id,
    };

    const updatedConversation = {
      ...selectedConversation,

      lastMessage:
        newMessage.contenu,

      messages: [
        ...selectedConversation.messages,
        formattedMessage,
      ],
    };

    const updatedConversations =
      conversations
        .map((conversation) =>
          conversation.id ===
          selectedConversation.id
            ? updatedConversation
            : conversation
        );

    setConversations(
      updatedConversations
    );

    setSelectedConversation(
      updatedConversation
    );

    setMessage("");
  }

  async function handleDeleteConversation(
    id
  ) {
    const {
      error,
    } = await supabase
      .from("conversations")
      .update({
        archived_at:
          new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erreur archivage conversation :",
        error
      );

      return;
    }

    const updatedConversations =
      conversations.filter(
        (conversation) =>
          conversation.id !== id
      );

    setConversations(
      updatedConversations
    );

    if (
      selectedConversation?.id ===
      id
    ) {
      setSelectedConversation(
        updatedConversations[0] ||
          null
      );
    }
  }

  if (
    loading ||
    loadingMessages ||
    !profile
  ) {
    return (
      <LoadingScreen
        text="Chargement des messages..."
      />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
        <Card title="Messages">
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-3"
            />

            <div className="space-y-4">
              {filteredConversations.length ===
              0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-500">
                  Aucune conversation
                </div>
              ) : (
                filteredConversations.map(
                  (
                    conversation
                  ) => {
                    const active =
                      selectedConversation?.id ===
                      conversation.id;

                    return (
                      <div
                        key={
                          conversation.id
                        }
                        className={`rounded-2xl border p-5 cursor-pointer transition ${
                          active
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleSelectConversation(
                            conversation
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center font-bold text-xl">
                              {conversation.name.charAt(
                                0
                              )}
                            </div>

                            <div className="min-w-0">
                              <h2 className="font-bold text-gray-900 truncate">
                                {
                                  conversation.name
                                }
                              </h2>

                              <p className="text-sm text-gray-500 truncate">
                                {
                                  conversation.location
                                }
                              </p>

                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {
                                  conversation.lastMessage
                                }
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();

                              handleDeleteConversation(
                                conversation.id
                              );
                            }}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>
        </Card>

        <Card
          title={
            selectedConversation
              ? selectedConversation.name
              : "Conversation"
          }
        >
          {!selectedConversation ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-center py-20">
              Sélectionnez une conversation
            </div>
          ) : (
            <div className="flex flex-col min-h-[500px]">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto mb-6">
                {selectedConversation.messages
                  ?.length ===
                0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-500">
                    Aucun message
                  </div>
                ) : (
                  selectedConversation.messages.map(
                    (
                      item,
                      index
                    ) => {
                      const mine =
                        item.senderId ===
                        currentUserId;

                      return (
                        <div
                          key={
                            item.id ||
                            index
                          }
                          className={`flex ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-3xl px-5 py-4 ${
                              mine
                                ? "bg-gradient-to-r from-pink-600 to-red-500 text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="leading-relaxed">
                              {
                                item.text
                              }
                            </p>

                            <p
                              className={`text-xs mt-2 ${
                                mine
                                  ? "text-pink-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {
                                item.time
                              }
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-4 shrink-0 pt-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-w-0 border border-gray-200 rounded-2xl px-5 py-4"
                />

                <button
                  onClick={
                    handleSendMessage
                  }
                  className="w-full lg:w-fit bg-gradient-to-r from-pink-600 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold"
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}