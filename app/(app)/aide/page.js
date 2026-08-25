"use client";

import Link from "next/link";

import { useMemo, useState } from "react";

const sections = [
  {
      id: "a-propos",
      title: "À propos d'EnVoiture",
      icon: "ℹ️",
      questions: [
        {
          question: "Pourquoi EnVoiture a-t-il été créé ?",
          answer:
            "Dans les établissements SNCF, de nombreux agents effectuent quotidiennement des trajets similaires, parfois avec des horaires décalés. Certains collègues se croisent ou empruntent les mêmes routes sans savoir qu'ils pourraient covoiturer ensemble. EnVoiture a été pensé pour faciliter cette mise en relation dans un environnement interne, adapté aux contraintes des agents SNCF.",
        },
        {
          question: "Quel est le principe d'EnVoiture ?",
          answer:
            "EnVoiture est une plateforme interne de mise en relation pour le covoiturage entre agents SNCF. Elle permet de déclarer ses habitudes de déplacement, de trouver des collègues dont les trajets sont compatibles et de prendre contact afin d'organiser ensuite le covoiturage.",
        },
        {
          question: "Quels sont les trois principes fondamentaux d'EnVoiture ?",
          answer:
            "EnVoiture repose sur trois principes : la confiance, la confidentialité et le consentement. La confiance vient d'un service destiné aux agents SNCF. La confidentialité repose notamment sur la limitation des informations personnelles exposées, sans affichage public des adresses exactes ni géolocalisation en temps réel. Le consentement signifie que chacun conserve le contrôle de ses échanges et des informations qu'il choisit de partager.",
        },
        {
          question: "En quoi EnVoiture crée-t-il du lien entre collègues ?",
          answer:
            "EnVoiture ne sert pas uniquement à partager une voiture. Il permet aussi à des collègues qui se croisent quotidiennement, travaillent dans le même établissement ou effectuent des trajets similaires de se trouver et d'échanger. Le covoiturage peut ainsi favoriser l'entraide et créer du lien entre collègues.",
        },
        {
          question: "Quels sont les avantages pour les agents ?",
          answer:
            "Le covoiturage peut permettre de réduire les dépenses liées aux trajets domicile-travail, de diminuer la fatigue liée aux déplacements, de simplifier l'organisation des trajets et de favoriser l'entraide et le lien entre collègues.",
        },
        {
          question: "Quels sont les avantages pour l'établissement ?",
          answer:
            "EnVoiture peut contribuer à réduire le nombre de véhicules utilisés pour les trajets domicile-travail, à diminuer la pression sur les parkings, à réduire l'empreinte carbone des déplacements et à améliorer la qualité de vie liée aux trajets domicile-travail.",
        },
        {
          question: "EnVoiture est-il un service commercial ?",
          answer:
            "Non. EnVoiture est conçu comme un outil communautaire et non lucratif destiné aux agents SNCF. Le service n'a pas vocation à mettre en place de commission ou de transaction financière entre les utilisateurs.",
        },
        {
          question: "Quelle est la responsabilité des utilisateurs ?",
          answer:
            "EnVoiture est un outil de mise en relation. Chaque utilisateur reste responsable de son comportement, de ses échanges avec les autres utilisateurs et des décisions prises dans le cadre d'un covoiturage. Les informations et les mises en relation proposées par le service ne dispensent pas chacun d'agir avec prudence, respect et discernement.",
        },
        {
          question: "EnVoiture est-il responsable du covoiturage lui-même ?",
          answer:
            "EnVoiture facilite la mise en relation entre utilisateurs, mais n'est pas partie au trajet organisé entre eux. Les utilisateurs restent responsables de l'organisation concrète du covoiturage, du respect des règles applicables et des comportements adoptés lors de leurs échanges et déplacements. Les conditions d'utilisation du service préciseront les responsabilités respectives de chacun.",
        },
      {
        question: "Quelle est la responsabilité des utilisateurs et d'EnVoiture ?",
        answer:
          "EnVoiture est un outil interne destiné à faciliter la mise en relation entre agents SNCF souhaitant organiser un covoiturage. EnVoiture facilite cette mise en relation mais n'est pas partie au covoiturage organisé entre les utilisateurs. Chaque utilisateur reste responsable de ses échanges, de ses décisions et de son comportement, avant, pendant et après le trajet. Les utilisateurs s'engagent à utiliser le service de manière respectueuse, loyale et conforme aux règles applicables. Les informations communiquées dans EnVoiture doivent être utilisées uniquement dans le cadre prévu par le service. EnVoiture ne peut pas garantir le comportement d'un utilisateur, la réalisation d'un trajet ou les conditions dans lesquelles un covoiturage est organisé. En cas de comportement inapproprié, de non-respect des règles ou de problème rencontré avec un autre utilisateur, un signalement peut être effectué depuis le service.",
      },

        {
          question: "Qui a développé EnVoiture ?",
          answer:
            "EnVoiture est développé par Nicolas AMICO, agent du Technicentre Industriel de Saint-Pierre-des-Corps.",
        },
      ],
    },

  {
      id: "demarrage",
      title: "Bien démarrer",
      icon: "🚀",
      questions: [
        {
          question: "À quoi sert EnVoiture ?",
          answer:
            "EnVoiture est un outil de covoiturage destiné aux agents de votre établissement. Il permet de trouver des collègues avec lesquels partager tout ou partie de vos trajets domicile-travail, de proposer des trajets et d'organiser ensuite le covoiturage directement entre vous.",
        },
        {
          question: "Que dois-je renseigner pour commencer ?",
          answer:
            "Commencez par vérifier votre profil et renseignez les informations utiles à vos déplacements : vos horaires habituels, vos trajets, votre rôle de conducteur ou de passager et, si vous conduisez, les informations concernant votre véhicule et le nombre de places disponibles.",
        },
        {
          question: "Comment fonctionne EnVoiture ?",
          answer:
            "EnVoiture utilise les informations liées à vos déplacements pour identifier des collègues dont les trajets peuvent être compatibles avec les vôtres. Lorsque vous trouvez une personne qui vous intéresse, vous pouvez la contacter via la messagerie afin d'organiser votre covoiturage.",
        },
        {
          question: "Dois-je créer un trajet pour chaque déplacement ?",
          answer:
            "Vos horaires habituels peuvent vous faire gagner du temps lors de la création de vos trajets. Ils servent de référence et peuvent être adaptés pour un trajet précis. Modifier vos habitudes ne modifie pas automatiquement les trajets déjà créés.",
        },
      ],
    },

  {
      id: "conducteur-passager",
      title: "Conducteur et passager",
      icon: "🧑‍✈️",
      questions: [
        {
          question: "Puis-je être conducteur et passager ?",
          answer:
            "Oui. Votre utilisation d'EnVoiture peut évoluer selon vos déplacements. Vous pouvez proposer un trajet lorsque vous conduisez et rechercher ou rejoindre un trajet proposé par un collègue lorsque vous souhaitez être passager.",
        },
        {
          question: "Comment proposer des places dans ma voiture ?",
          answer:
            "Lorsque vous proposez un trajet en tant que conducteur, indiquez le nombre de places que vous souhaitez mettre à disposition. Cette information permet aux autres utilisateurs de savoir si le trajet peut encore accueillir des passagers.",
        },
        {
          question: "Comment rejoindre le trajet d'un collègue ?",
          answer:
            "Lorsqu'un trajet vous intéresse, utilisez l'action permettant de demander à le rejoindre. Le conducteur pourra ensuite prendre connaissance de votre demande et vous pourrez organiser les détails du covoiturage.",
        },
        {
          question: "Que se passe-t-il lorsqu'un trajet n'a plus de place ?",
          answer:
            "Un trajet ne doit pas être considéré comme disponible lorsque toutes les places proposées sont déjà occupées. Vérifiez les informations affichées sur le trajet avant d'effectuer une demande.",
        },
        {
          question: "Puis-je annuler ma participation à un trajet ?",
          answer:
            "Oui. Si votre organisation change, utilisez l'action disponible sur le trajet concerné pour annuler votre participation. Les personnes concernées peuvent alors être informées de cette modification.",
        },
      ],
    },

  {
      id: "confidentialite",
      title: "Confidentialité",
      icon: "🔒",
      questions: [
        {
          question: "Quelles informations sont visibles par les autres utilisateurs ?",
          answer:
            "EnVoiture est conçu pour limiter les informations personnelles exposées. Les informations nécessaires à la recherche de compatibilités et à l'organisation du covoiturage peuvent être présentées aux autres utilisateurs, mais les informations personnelles qui ne sont pas nécessaires n'ont pas vocation à être affichées publiquement.",
        },
        {
          question: "Mon adresse personnelle complète est-elle visible ?",
          answer:
            "Non. EnVoiture n'a pas vocation à afficher publiquement votre adresse personnelle complète. Les informations liées à votre localisation sont utilisées pour rechercher des compatibilités tout en limitant l'exposition de vos données personnelles.",
        },
        {
          question: "Quand dois-je communiquer mon adresse exacte ?",
          answer:
            "L'adresse exacte peut être échangée directement avec votre collègue lorsque vous avez décidé d'organiser un covoiturage. Il est préférable de ne pas publier ce type d'information dans votre profil ou dans un message destiné à plusieurs personnes.",
        },
        {
          question: "Pourquoi certaines informations sont-elles utilisées pour le matching ?",
          answer:
            "Certaines informations sont nécessaires pour déterminer si deux déplacements peuvent être compatibles. Elles permettent notamment de comparer les jours, les horaires et la proximité des trajets sans avoir besoin d'exposer publiquement toutes vos informations personnelles.",
        },
      ],
    },

  {
      id: "trajets",
      title: "Mes trajets",
      icon: "🚗",
      questions: [
        {
          question: "Comment créer un trajet ?",
          answer:
            "Allez dans « Trajets », puis choisissez l'option permettant de créer un trajet. Renseignez le jour, vos horaires et les informations demandées, puis validez. Le trajet pourra ensuite être pris en compte dans la recherche de compatibilités.",
        },
        {
          question: "Puis-je créer plusieurs trajets ?",
          answer:
            "Oui. Vous pouvez enregistrer les différents trajets nécessaires à votre organisation, notamment lorsque vos horaires ou vos jours de déplacement sont différents.",
        },
        {
          question: "Comment modifier un trajet ?",
          answer:
            "Dans « Trajets », retrouvez le trajet concerné puis utilisez l'action de modification. Les changements concernent ce trajet et ne modifient pas automatiquement vos horaires habituels.",
        },
        {
          question: "Comment supprimer un trajet ?",
          answer:
            "Dans « Trajets », sélectionnez le trajet concerné puis utilisez l'action permettant de le supprimer. Une fois supprimé, il ne sera plus pris en compte comme trajet disponible.",
        },
        {
          question:
            "Quelle est la différence entre mes horaires habituels et mes trajets ?",
          answer:
            "Les horaires habituels correspondent à vos habitudes de déplacement, jour par jour. Ils servent notamment à vous faire gagner du temps lors de la création de vos trajets. Vous pouvez les consulter et les modifier depuis la page « Mon profil ». Un trajet correspond, lui, à un déplacement réellement proposé ou recherché à une date donnée. Modifier vos horaires habituels ne modifie pas les trajets déjà créés.",
        },
        {
          question: "Puis-je avoir des horaires différents selon les jours ?",
          answer:
            "Oui. EnVoiture permet de définir des horaires différents pour chaque journée. Vous pouvez ainsi avoir, par exemple, un horaire habituel du lundi au jeudi et un autre horaire le vendredi.",
        },
        {
          question: "Je ne retrouve pas un trajet que j'avais créé.",
          answer:
            "Vérifiez la rubrique « Trajets » et les informations du trajet concerné. Si le problème persiste, vérifiez également que le trajet n'a pas été supprimé ou modifié.",
        },
      ],
    },

  {
      id: "vehicules",
      title: "Mes véhicules",
      icon: "🚙",
      questions: [
        {
          question: "Pourquoi renseigner mon véhicule ?",
          answer:
            "Les informations concernant votre véhicule permettent de préparer vos trajets lorsque vous conduisez et d'indiquer aux autres utilisateurs les possibilités d'accueil de votre véhicule.",
        },
        {
          question: "Puis-je enregistrer plusieurs véhicules ?",
          answer:
            "EnVoiture permet de gérer les véhicules associés à votre profil lorsque cette fonctionnalité est disponible dans votre espace. Vous pouvez ainsi utiliser le véhicule correspondant au déplacement concerné.",
        },
        {
          question: "À quoi sert le véhicule par défaut ?",
          answer:
            "Le véhicule par défaut est celui qui peut être proposé automatiquement lorsque vous préparez un nouveau trajet. Vous pouvez ensuite sélectionner un autre véhicule si nécessaire.",
        },
        {
          question: "Comment indiquer le nombre de places disponibles ?",
          answer:
            "Le nombre de places proposées doit correspondre au nombre de passagers que vous acceptez d'accueillir dans le cadre du trajet. Cette information est importante pour éviter de proposer davantage de places que votre véhicule ne peut en accueillir.",
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
        {
          question: "À quoi sert la messagerie ?",
          answer:
            "La messagerie est destinée à faciliter la prise de contact entre collègues. Elle permet de discuter de l'organisation pratique du covoiturage sans avoir à publier vos coordonnées personnelles.",
        },
        {
          question: "Que dois-je faire après avoir trouvé un collègue compatible ?",
          answer:
            "Prenez contact avec lui via la messagerie. Vous pourrez ensuite vous mettre d'accord directement sur les détails pratiques : point de rendez-vous, horaires, organisation du trajet et autres informations utiles.",
        },
      ],
    },

  {
      id: "modalites-rh",
      title: "Modalités RH du covoiturage",
      icon: "📋",
      questions: [
        {
          question: "Où trouver les modalités RH applicables au covoiturage ?",
          answer:
            "Les modalités RH applicables au covoiturage dans votre établissement seront présentées dans cette rubrique dès qu'elles auront été définies et validées par les services compétents. Elles pourront notamment préciser les règles et dispositifs applicables aux agents.",
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
            "Dans « Mon profil », rendez-vous dans la rubrique consacrée à vos horaires de déplacement. Vous pouvez définir vos habitudes pour chaque jour de la semaine. Chaque journée peut avoir ses propres horaires.",
        },
        {
          question: "Pourquoi mes horaires habituels sont-ils importants ?",
          answer:
            "Ils permettent à EnVoiture de mieux comprendre vos habitudes de déplacement et de vous faire gagner du temps lors de la création de trajets. Des horaires correctement renseignés améliorent également la pertinence des recherches de compatibilité.",
        },
        {
          question: "Comment indiquer le nombre de places disponibles dans ma voiture ?",
          answer:
            "Le nombre de places disponibles fait partie des informations utilisées lorsque vous proposez un trajet en tant que conducteur. Il permet aux autres utilisateurs de savoir combien de passagers peuvent être accueillis.",
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
            "Les notifications vous informent lorsqu'une action ou une information importante concerne votre activité sur EnVoiture, par exemple un nouveau message, une demande concernant un trajet ou une correspondance.",
        },
        {
          question: "Où retrouver mes notifications ?",
          answer:
            "Vos notifications sont accessibles depuis l'interface EnVoiture grâce à l'icône de notification. Les notifications peuvent également vous orienter directement vers l'élément concerné, comme une conversation ou un trajet.",
        },
        {
          question: "Puis-je supprimer une notification ?",
          answer:
            "Oui. Une notification lue peut être supprimée afin de garder une liste de notifications claire et utile.",
        },
        {
          question: "Je ne retrouve pas une notification que j'attendais.",
          answer:
            "Vérifiez la rubrique « Notifications » depuis l'icône de notification. Si vous ne retrouvez pas l'information recherchée, contactez votre référent EnVoiture.",
        },
      ],
    },

  {
      id: "statistiques",
      title: "Statistiques",
      icon: "📊",
      questions: [
        {
          question: "Que présentent mes statistiques ?",
          answer:
            "La rubrique « Statistiques » permet de visualiser les résultats de votre activité de covoiturage, notamment les kilomètres mutualisés ainsi que les estimations d'économies et de CO₂ évité.",
        },
        {
          question: "Comment sont calculées mes économies ?",
          answer:
            "Les économies affichées sont une estimation basée sur les kilomètres mutualisés grâce au covoiturage. EnVoiture utilise actuellement une valeur de référence de 0,15 € par kilomètre. Il s'agit d'une estimation et non du coût réel de votre véhicule.",
        },
        {
          question: "Comment est calculé le CO₂ évité ?",
          answer:
            "Le CO₂ évité est estimé à partir des kilomètres mutualisés. EnVoiture utilise actuellement un facteur de référence de 120 g de CO₂ par kilomètre. Il s'agit d'une estimation conventionnelle et non d'une mesure exacte des émissions de chaque véhicule.",
        },
        {
          question: "Pourquoi mes statistiques sont-elles des estimations ?",
          answer:
            "Les statistiques servent à donner un ordre de grandeur de l'impact du covoiturage. Elles ne constituent pas une mesure exacte des coûts réellement supportés par votre véhicule ni des émissions réellement produites.",
        },
      ],
    },

  {
      id: "compatibilite",
      title: "Trouver un collègue",
      icon: "👥",
      questions: [
        {
          question: "Comment trouver des collègues compatibles ?",
          answer:
            "Ouvrez « Profils ». EnVoiture compare les informations utiles aux déplacements afin de mettre en évidence les collègues susceptibles de correspondre à vos besoins de covoiturage.",
        },
        {
          question: "Comment fonctionne la compatibilité ?",
          answer:
            "La compatibilité prend notamment en compte les établissements, les jours, les horaires et les informations liées aux trajets. Plus les conditions de déplacement sont proches, plus la compatibilité est pertinente.",
        },
        {
          question: "Quelles informations sont visibles par les autres utilisateurs ?",
          answer:
            "EnVoiture est conçu pour limiter les informations personnelles exposées. Les adresses personnelles complètes ne sont pas affichées publiquement. Les informations nécessaires à la recherche de compatibilités sont présentées afin de permettre aux collègues de prendre contact.",
        },
      ],
    },

  {
      id: "depannage",
      title: "Un problème ?",
      icon: "🛠️",
      questions: [
        {
          question: "Je ne trouve aucun collègue compatible. Que faire ?",
          answer:
            "Commencez par vérifier que votre profil, vos jours de déplacement et vos horaires habituels sont correctement renseignés. Une recherche peut également ne donner aucun résultat si aucun collègue ne présente actuellement un déplacement suffisamment proche du vôtre.",
        },
        {
          question: "Je rencontre un problème que cette aide ne résout pas.",
          answer:
            "Si vous ne trouvez pas la réponse à votre question dans cette rubrique, contactez votre référent EnVoiture. Pensez à lui indiquer le problème rencontré, la page concernée et, si possible, le message d'erreur affiché.",
        },
      ],
    }
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedSearch) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(normalizedSearch) ||
            item.answer.toLowerCase().includes(normalizedSearch) ||
            section.title.toLowerCase().includes(normalizedSearch)
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [normalizedSearch]);

  const displayedSections = selectedSection
    ? filteredSections.filter(
        (section) => section.id === selectedSection
      )
    : filteredSections;

  const resultCount = displayedSections.reduce(
    (total, section) => total + section.questions.length,
    0
  );


  function selectSection(sectionId) {
    setSelectedSection(sectionId);
  }

  function resetNavigation() {
    setSelectedSection(null);
  }

  function clearSearch() {
    setSearch("");
    setSelectedSection(null);
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-red-500 px-6 py-10 lg:px-10 lg:py-12 text-white">
            <div className="text-5xl mb-5">❓</div>

            <h1 className="text-3xl lg:text-4xl font-black">
              Aide EnVoiture
            </h1>

            <p className="mt-3 text-base lg:text-lg text-white/90 max-w-2xl">
              Retrouvez rapidement les réponses aux questions les plus
              fréquentes et découvrez comment utiliser EnVoiture.
            </p>

            <div className="mt-7 relative max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedSection(null);
                              }}
                placeholder="Rechercher dans l'aide..."
                className="w-full bg-white text-gray-900 placeholder:text-gray-400 rounded-2xl px-12 py-4 outline-none border-2 border-white/30 focus:border-white"
              />
            </div>
          </div>

          {!search && !selectedSection && (
            <div className="p-6 lg:p-10">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Comment pouvons-nous vous aider ?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectSection(section.id)}
                    className="text-left bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:bg-gray-100 hover:border-gray-300 transition"
                  >
                    <div className="text-3xl mb-3">{section.icon}</div>

                    <div className="font-bold text-gray-900">
                      {section.title}
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                      {section.questions.length} question
                      {section.questions.length > 1 ? "s" : ""}
                    </div>
                  </button>
                ))}

                <Link
                  href="/signalements"
                  className="block mt-4 sm:mt-0 text-left bg-white border-2 border-red-300 rounded-2xl p-5 hover:bg-red-50 hover:border-red-400 transition"
                >
                  <div className="text-3xl mb-3">🚨</div>

                  <div className="font-bold text-red-600">
                    Signalements
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    Signaler un problème ou un comportement inapproprié
                  </div>
                </Link>
              </div>
            </div>
          )}

          {(search || selectedSection) && (
            <div className="p-6 lg:p-10">
              {selectedSection && !search && (
                <button
                  type="button"
                  onClick={resetNavigation}
                  className="mb-6 text-sm font-semibold text-pink-700 hover:text-pink-800"
                >
                  ← Retour aux rubriques
                </button>
              )}

              {search && (
                <div className="mb-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        Résultats de recherche
                      </h2>

                      <p className="text-gray-500 mt-1">
                        {resultCount} résultat
                        {resultCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    {search && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="shrink-0 text-sm font-semibold text-pink-700 hover:text-pink-800"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>
              )}

              {displayedSections.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔎</div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Aucun résultat
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Essayez avec d'autres mots-clés.
                  </p>

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 transition"
                  >
                    Afficher toutes les rubriques
                  </button>
                </div>
              )}

              <div className="space-y-8">
                {displayedSections.map((section) => (
                  <section key={section.id}>
                    {search && (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{section.icon}</span>

                        <h3 className="text-xl font-black text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                    )}

                    <div className="space-y-3">
                      {section.questions.map((item, index) => {
                        const questionId = `${section.id}-${index}`;

                        return (
                          <div
                            key={questionId}
                            className="border border-gray-200 rounded-2xl bg-white p-5"
                          >
                            <div className="font-semibold text-gray-900">
                              {item.question}
                            </div>

                            <div className="mt-3 text-gray-600 leading-relaxed">
                              {item.answer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          <div className="mx-6 lg:mx-10 mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-lg">
              Vous ne trouvez pas la réponse à votre question ?
            </h2>

            <p className="text-gray-600 mt-2 leading-relaxed">
              Consultez les différentes rubriques de cette aide ou contactez
              votre référent EnVoiture si vous rencontrez un problème.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}