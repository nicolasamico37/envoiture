export default function UserBadge({
  name,
  location,
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
        {name[0]}
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 text-lg">
          {name}
        </h2>

        <p className="text-gray-500">
          {location}
        </p>
      </div>
    </div>
  );
}