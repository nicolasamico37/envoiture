"use client";

import { useMemo, useState } from "react";

const sections = [
  {
    id: "trajets",
    title: "Mes trajets",
    icon: "🚗",
    questions: [
      {
        question: "Comment créer un trajet ?",
        answer:
          "Allez dans « Trajets », puis choisissez l'option permettant de créer un trajet. Renseignez le jour, vos horaires et les informations demandées, puis validez. Le trajet sera ensuite visible selon les critères de compatibilité.",
      },
      {
        question: "Comment modifier un trajet ?",
        answer:
          "Dans « Trajets », retrouvez le trajet concerné puis utilisez l'action de modification. Les changements concernent uniquement ce trajet et ne modifient pas automatiquement vos horaires habituels.",
      },
      {
        question: "Comment supprimer un trajet ?",
        answer:
          "Dans « Trajets », sélectionnez le trajet concerné puis utilisez l'action permettant de le supprimer. Une fois supprimé, il ne sera plus proposé aux autres utilisateurs.",
      },
      {
        question: "À quoi servent mes horaires habituels ?",
        answer:
          "Vos horaires habituels servent à vous faire gagner du temps lors de la création de nouveaux trajets. Ils permettent de proposer automatiquement vos horaires habituels, que vous pouvez ensuite modifier pour un trajet précis. Modifier vos habitudes ne modifie jamais les trajets déjà créés.",
      },
    ],
  },

  {
    id: "profil",
    title: "Mon profil",
    icon: "👤",
    questions: [
      {
        question: "Comment modifier mon profil ?",
        answer:
          "Ouvrez « Mon profil » depuis le menu. Vous pouvez y consulter et modifier les informations disponibles sur votre profil.",
      },
      {
        question: "Comment renseigner mes horaires habituels ?",
        answer:
          "Dans « Mon profil », rendez-vous dans la rubrique « Horaires de déplacement ». Vous pouvez définir vos habitudes pour chaque jour de la semaine. Chaque journée peut avoir ses propres horaires.",
      },
      {
        question:
          "Comment indiquer le nombre de places disponibles dans ma voiture ?",
        answer:
          "Le nombre de places disponibles fait partie des informations de votre profil conducteur. Il permet aux autres utilisateurs de savoir combien de personnes peuvent être accueillies dans votre véhicule.",
      },
    ],
  },

  {
    id: "profils",
    title: "Trouver un collègue",
    icon: "👥",
    questions: [
      {
        question:
          "Comment trouver des collègues compatibles ?",
        answer:
          "Ouvrez « Profils ». EnVoiture compare les informations utiles aux déplacements afin de mettre en évidence les collègues susceptibles de correspondre à vos besoins de covoiturage.",
      },
      {
        question: "Comment fonctionne la compatibilité ?",
        answer:
          "La compatibilité prend notamment en compte les établissements, les jours, les horaires et les informations liées aux trajets. Plus les conditions de déplacement sont proches, plus la compatibilité est pertinente.",
      },
      {
        question:
          "Quelles informations sont visibles par les autres utilisateurs ?",
        answer:
          "EnVoiture est conçu pour limiter les informations personnelles exposées. Les adresses personnelles complètes ne sont pas affichées publiquement. Les informations nécessaires à la recherche de compatibilités sont présentées afin de permettre aux collègues de prendre contact.",
      },
    ],
  },

  {
    id: "messages",
    title: "Messages",
    icon: "💬",
    questions: [
      {
        question: "Comment contacter un collègue ?",
        answer:
          "Lorsqu'un profil ou un trajet vous intéresse, utilisez la fonction de contact proposée par EnVoiture. Vous pouvez ainsi échanger directement avec le collègue concerné pour organiser votre covoiturage.",
      },
      {
        question: "Comment retrouver mes conversations ?",
        answer:
          "Ouvrez « Messages » dans le menu. Vous y retrouverez vos échanges avec les autres utilisateurs.",
      },
    ],
  },

  {
    id: "notifications",
    title: "Notifications",
    icon: "🔔",
    questions: [
      {
        question: "À quoi servent les notifications ?",
        answer:
          "Les notifications vous informent notamment lorsqu'une information importante concerne votre activité sur EnVoiture, par exemple un nouveau contact ou une correspondance potentielle.",
      },
    ],
  },

  {
    id: "statistiques",
    title: "Statistiques",
    icon: "📊",
    questions: [
      {
        question:
          "Comment sont calculées mes économies ?",
        answer:
          "Les économies affichées sont une estimation basée sur les kilomètres mutualisés grâce au covoiturage. EnVoiture utilise actuellement une valeur de référence de 0,15 € par kilomètre. Il s'agit d'une estimation et non du coût réel de votre véhicule.",
      },
      {
        question:
          "Comment est calculé le CO₂ évité ?",
        answer:
          "Le CO₂ évité est estimé à partir des kilomètres mutualisés. EnVoiture utilise actuellement un facteur de référence de 120 g de CO₂ par kilomètre. Il s'agit d'une estimation conventionnelle et non d'une mesure exacte des émissions de chaque véhicule.",
      },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] =
    useState(null);
  const [selectedSection, setSelectedSection] =
    useState(null);

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedSearch) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (item) =>
            item.question
              .toLowerCase()
              .includes(normalizedSearch) ||
            item.answer
              .toLowerCase()
              .includes(normalizedSearch) ||
            section.title
              .toLowerCase()
              .includes(normalizedSearch)
        ),
      }))
      .filter(
        (section) =>
          section.questions.length > 0
      );
  }, [normalizedSearch]);

  const displayedSections = selectedSection
    ? filteredSections.filter(
        (section) =>
          section.id === selectedSection
      )
    : filteredSections;

  function toggleQuestion(
    sectionId,
    questionIndex
  ) {
    const id = `${sectionId}-${questionIndex}`;

    setOpenQuestion((current) =>
      current === id ? null : id
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-pink-600 to-red-500 px-6 py-10 lg:px-10 lg:py-12 text-white">
            <div className="text-5xl mb-5">
              ❓
            </div>

            <h1 className="text-3xl lg:text-4xl font-black">
              Aide EnVoiture
            </h1>

            <p className="mt-3 text-base lg:text-lg text-white/90 max-w-2xl">
              Retrouvez rapidement les réponses aux
              questions les plus fréquentes concernant
              l'utilisation d'EnVoiture.
            </p>

            <div className="mt-7 relative max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setSelectedSection(null);
                  setOpenQuestion(null);
                }}
                placeholder="Rechercher dans l'aide..."
                className="w-full bg-white text-gray-900 placeholder:text-gray-500 border border-white/30 rounded-2xl px-12 py-4 outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>

          {!search && !selectedSection && (
            <div className="p-6 lg:p-10">

              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Comment pouvons-nous vous aider ?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map(
                  (section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setSelectedSection(
                          section.id
                        );
                        setOpenQuestion(null);
                      }}
                      className="text-left bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:bg-gray-100 hover:border-gray-300 transition"
                    >
                      <div className="text-3xl mb-3">
                        {section.icon}
                      </div>

                      <div className="font-bold text-gray-900">
                        {section.title}
                      </div>

                      <div className="text-sm text-gray-500 mt-1">
                        {
                          section.questions
                            .length
                        }{" "}
                        question
                        {section.questions
                          .length > 1
                          ? "s"
                          : ""}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {(search ||
            selectedSection) && (
            <div className="p-6 lg:p-10">

              {selectedSection &&
                !search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSection(
                        null
                      )
                    }
                    className="mb-6 text-sm font-semibold text-pink-700 hover:text-pink-800"
                  >
                    ← Retour aux rubriques
                  </button>
                )}

              {search && (
                <div className="mb-7">
                  <h2 className="text-2xl font-black text-gray-900">
                    Résultats de recherche
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {displayedSections.reduce(
                      (
                        total,
                        section
                      ) =>
                        total +
                        section
                          .questions
                          .length,
                      0
                    )}{" "}
                    résultat
                    {displayedSections.reduce(
                      (
                        total,
                        section
                      ) =>
                        total +
                        section
                          .questions
                          .length,
                      0
                    ) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              )}

              {displayedSections.length ===
                0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">
                    🔎
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Aucun résultat
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Essayez avec d'autres mots-clés.
                  </p>
                </div>
              )}

              <div className="space-y-8">
                {displayedSections.map(
                  (section) => (
                    <section
                      key={section.id}
                    >
                      {search && (
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">
                            {
                              section.icon
                            }
                          </span>

                          <h3 className="text-xl font-black text-gray-900">
                            {
                              section.title
                            }
                          </h3>
                        </div>
                      )}

                      <div className="space-y-3">
                        {section.questions.map(
                          (
                            item,
                            index
                          ) => {
                            const questionId = `${section.id}-${index}`;
                            const isOpen =
                              openQuestion ===
                              questionId;

                            return (
                              <div
                                key={
                                  questionId
                                }
                                className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleQuestion(
                                      section.id,
                                      index
                                    )
                                  }
                                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-5 hover:bg-gray-50 transition"
                                >
                                  <span className="font-semibold text-gray-900">
                                    {
                                      item.question
                                    }
                                  </span>

                                  <span className="text-xl text-gray-500 shrink-0">
                                    {isOpen
                                      ? "−"
                                      : "+"}
                                  </span>
                                </button>

                                {isOpen && (
                                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                    {
                                      item.answer
                                    }
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </section>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mx-6 lg:mx-10 mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-lg">
              Vous ne trouvez pas la réponse à votre question ?
            </h2>

            <p className="text-gray-600 mt-2 leading-relaxed">
              Contactez votre référent EnVoiture pour
              obtenir de l'aide.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}