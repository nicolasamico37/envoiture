export default function MessageBubble({
  sender,
  message,
  ownMessage,
}) {
  return (
    <div
      className={`flex items-end gap-3 ${
        ownMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!ownMessage && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center font-semibold">
          {sender.charAt(0)}
        </div>
      )}

      <div
        className={`max-w-md px-5 py-4 rounded-3xl ${
          ownMessage
            ? "bg-gradient-to-r from-pink-600 to-red-500 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        {!ownMessage && (
          <p className="text-sm font-semibold mb-2">
            {sender}
          </p>
        )}

        <p>{message}</p>
      </div>

      {ownMessage && (
        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
          M
        </div>
      )}
    </div>
  );
}