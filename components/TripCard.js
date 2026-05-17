export default function TripCard({
  trip,
  onDelete,
  onEdit,
}) {
  const isAller =
    trip.type === "Aller";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-sm px-4 py-2 rounded-full font-medium ${
                isAller
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isAller
                ? "🟢 Aller"
                : "🔵 Retour"}
            </span>

            <span className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
              🕒 {trip.heure}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />

              <h2 className="text-2xl font-bold text-gray-900">
                {trip.depart}
              </h2>
            </div>

            <div className="ml-[5px] border-l-2 border-dashed border-gray-300 h-10 my-2" />

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />

              <h3 className="text-xl font-semibold text-gray-700">
                {trip.destination}
              </h3>
            </div>
          </div>

          <div className="flex gap-2 mt-6 flex-wrap">
            {trip.jours.map((jour) => (
              <span
                key={jour}
                className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
              >
                {jour}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-4">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
            🚗 {trip.places} places disponibles
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(trip)}
              className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              Modifier
            </button>

            <button
              onClick={() => onDelete(trip.id)}
              className="bg-red-100 text-red-700 px-5 py-3 rounded-xl font-medium hover:bg-red-200 transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}