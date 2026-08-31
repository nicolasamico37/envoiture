import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
          <div className="flex w-full max-w-3xl flex-col items-center text-center">
            <Image
              src="/logo-text.png"
              alt="EnVoiture — Le covoiturage entre collègues SNCF"
              width={896}
              height={284}
              className="h-auto w-[min(72vw,520px)]"
              priority
            />

            <div className="mt-8">
              <p className="text-xl font-medium text-gray-800 sm:text-2xl">
                Développé par Nicolas AMICO
              </p>

              <p className="mt-1 text-lg text-gray-500 sm:text-xl">
                Technicentre Industriel de Saint-Pierre-des-Corps
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-10 inline-flex min-w-[190px] items-center justify-center rounded-xl bg-[#00997C] px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-[#065654] focus:outline-none focus:ring-2 focus:ring-[#00997C] focus:ring-offset-2"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <footer className="flex items-end justify-end px-6 pb-6 sm:px-10 sm:pb-8">
          <Image
            src="/logo-sncf-voyageurs.png"
            alt="SNCF Voyageurs"
            width={240}
            height={80}
            className="h-auto w-[130px] sm:w-[160px]"
          />
        </footer>
      </div>
    </main>
  );
}