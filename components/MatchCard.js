import { useRouter } from "next/navigation";

export default function MatchCard({
  nom,
  secteur,
  role,
  places,
  jours,
  horaires,
  compatibility,
  onViewProfile,
}) {
  const router = useRouter();

  const isDriver = role === "Conducteur";

  function getCompatibilityColor() {
    if (compatibility >= 85) {
      return "bg-green-100 text-green-700";
    }

    if (compatibility >= 70) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  function handleContact() {
    localStorage.setItem(
      "envoiture-active-conversation",
      nom
    );

    router.push("/messages");
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${
              isDriver
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-600"
            }`}
          >
            {nom.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-semibold text-lg text-gray-900">
                {nom}
              </p>

              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${getCompatibilityColor()}`}
              >
                {compatibility}% compatible
              </span>
            </div>

            <p className="text-gray-600 mt-1">
              Secteur {secteur}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  isDriver
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {role}
              </span>

              {isDriver && (
                <span className="text-sm text-gray-500">
                  {places} places disponibles
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {jours.map((jour) => (
                <span
                  key={jour}
                  className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                >
                  {jour}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-4 flex-wrap text-sm text-gray-600">
              <span>
                🚆 Départ : {horaires.depart}
              </span>

              <span>
                ↩ Retour : {horaires.retour}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onViewProfile}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50"
          >
            Voir le profil
          </button>

          <button
            onClick={handleContact}
            className="bg-gradient-to-r from-pink-600 to-red-500 text-white px-4 py-2 rounded-xl font-medium"
          >
            Contacter
          </button>
        </div>
      </div>
    </div>
  );
}