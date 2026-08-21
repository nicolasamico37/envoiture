import Image from "next/image";

export default function LoadingScreen({
  text = "Chargement...",
}) {
  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-3xl px-10 py-10 shadow-sm text-center max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping" />

            <Image
              src="/logo-icon.png"
              alt="EnVoiture"
              width={96}
              height={96}
              className="relative rounded-3xl w-[96px] h-auto"
              priority
            />
          </div>
        </div>

        <Image
          src="/logo-full.png"
          alt="EnVoiture"
          width={620}
          height={180}
          className="mx-auto h-auto w-auto max-w-full mb-8"
          priority
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {text}
        </h2>

        <p className="text-gray-500">
          Préparation de votre espace collaboratif...
        </p>
      </div>
    </div>
  );
}