"use client";

import {
  useState,
  useEffect,
  useMemo,
} from "react";

import Card from "@/components/Card";

import LoadingScreen from "@/components/LoadingScreen";

import getCurrentUserProfile from "@/utils/getCurrentUserProfile";

export default function MessagesPage() {
  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  const [
    currentProfile,
    setCurrentProfile,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const savedMessages =
      JSON.parse(
        localStorage.getItem(
          "envoiture-messages"
        ) || "[]"
      );

    setConversations(
      savedMessages
    );

    const selectedId =
      localStorage.getItem(
        "envoiture-selected-conversation"
      );

    if (selectedId) {
      const foundConversation =
        savedMessages.find(
          (conversation) =>
            conversation.id ===
            Number(selectedId)
        );

      if (foundConversation) {
        setSelectedConversation(
          foundConversation
        );
      }
    }

    const profile =
      getCurrentUserProfile();

    setCurrentProfile(profile);
  }, []);

  const filteredConversations =
    useMemo(() => {
      return conversations.filter(
        (conversation) =>
          conversation.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          conversation.location
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [conversations, search]);

  function saveConversations(
    updatedConversations
  ) {
    setConversations(
      updatedConversations
    );

    localStorage.setItem(
      "envoiture-messages",
      JSON.stringify(
        updatedConversations
      )
    );
  }

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

  function handleSendMessage() {
    if (
      !message.trim() ||
      !selectedConversation ||
      !currentProfile
    ) {
      return;
    }

    const newMessage = {
      from:
        currentProfile.name,

      text: message,

      time:
        new Date().toLocaleTimeString(
          "fr-FR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
    };

    const updatedConversations =
      conversations.map(
        (conversation) => {
          if (
            conversation.id !==
            selectedConversation.id
          ) {
            return conversation;
          }

          return {
            ...conversation,

            lastMessage:
              message,

            messages: [
              ...conversation.messages,
              newMessage,
            ],
          };
        }
      );

    saveConversations(
      updatedConversations
    );

    const updatedSelected =
      updatedConversations.find(
        (conversation) =>
          conversation.id ===
          selectedConversation.id
      );

    setSelectedConversation(
      updatedSelected
    );

    setMessage("");
  }

  function handleDeleteConversation(
    id
  ) {
    const updatedConversations =
      conversations.filter(
        (conversation) =>
          conversation.id !== id
      );

    saveConversations(
      updatedConversations
    );

    if (
      selectedConversation?.id ===
      id
    ) {
      setSelectedConversation(
        null
      );
    }
  }

  if (!currentProfile) {
    return (
      <LoadingScreen text="Chargement des messages..." />
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
                setSearch(e.target.value)
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
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 overflow-y-auto mb-6">
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
                        item.from ===
                        currentProfile.name;

                      return (
                        <div
                          key={index}
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

              <div className="flex flex-col lg:flex-row gap-4">
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
                  className="flex-1 border border-gray-200 rounded-2xl px-5 py-4"
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