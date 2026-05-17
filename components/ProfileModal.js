export default function ProfileModal({
  match,
  onClose,
}) {
  if (!match) return null;

  const isDriver =
    match.role === "Conducteur";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <div className="flex items-center gap-6 mb-8">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold ${
              isDriver
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-600"
            }`}
          >
            {match.nom.charAt(0)}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {match.nom}
            </h2>

            <p className="text-gray-500 mt-2">
              Secteur {match.secteur}
            </p>

            <div className="flex gap-3 mt-4 flex-wrap">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isDriver
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {match.role}
              </span>

              {isDriver && (
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {match.places} places disponibles
                </span>
              )}

              <span className="px-4 py-2 rounded-full text-sm font-medium bg-pink-100 text-pink-700">
                {match.compatibility}% compatible
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">
              Horaires
            </h3>

            <div className="flex gap-6 flex-wrap text-gray-700">
              <p>
                🚆 Départ : {match.horaires.depart}
              </p>

              <p>
                ↩ Retour : {match.horaires.retour}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">
              Jours de trajet
            </h3>

            <div className="flex gap-2 flex-wrap">
              {match.jours.map((jour) => (
                <span
                  key={jour}
                  className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm"
                >
                  {jour}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">
              Informations
            </h3>

            <p className="text-gray-700 leading-relaxed">
              Collègue compatible pour les trajets vers Nantes.
              Utilise régulièrement EnVoiture pour les déplacements domicile-travail.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="bg-gradient-to-r from-pink-600 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">
            Contacter
          </button>
        </div>
      </div>
    </div>
  );
}