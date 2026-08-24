import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-red-50">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-pink-200 blur-3xl opacity-30" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-red-200 blur-3xl opacity-20" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
          <header className="mb-20 flex items-center justify-between gap-6">
            <Link href="/" aria-label="EnVoiture">
              <Image
                src="/logo-full.png"
                alt="EnVoiture"
                width={520}
                height={160}
                className="h-auto w-auto max-w-[210px] lg:max-w-[330px]"
                priority
              />
            </Link>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="hidden rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex"
              >
                Se connecter
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-pink-200 transition hover:scale-[1.02]"
              >
                Commencer
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-14 pb-24 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-pink-100 bg-white px-5 py-3 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Plateforme collaborative entre agents SNCF
                </span>
              </div>

              <h1 className="mb-7 text-5xl font-black leading-tight tracking-tight lg:text-7xl">
                Le covoiturage
                <span className="block bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                  entre collègues.
                </span>
              </h1>

              <p className="mb-9 max-w-2xl text-xl leading-relaxed text-gray-600 lg:text-2xl">
                EnVoiture facilite vos trajets domicile-travail avec des
                collègues qui partagent les mêmes contraintes professionnelles.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 px-8 py-4 text-center text-lg font-bold text-white shadow-xl shadow-pink-200 transition hover:scale-[1.02]"
                >
                  Accéder à EnVoiture
                </Link>
                <a
                  href="#fonctionnement"
                  className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Découvrir le fonctionnement
                </a>
              </div>
            </div>

            <div className="rounded-[36px] border border-gray-200 bg-white p-6 shadow-2xl shadow-pink-100 lg:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-500">Exemple</p>
                  <h2 className="text-2xl font-black lg:text-3xl">
                    Votre trajet quotidien
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 text-2xl text-white">
                  🚗
                </div>
              </div>

              <div className="mb-4 rounded-3xl border border-pink-100 bg-pink-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-pink-600">
                      Départ
                    </p>
                    <p className="font-bold">Votre secteur de résidence</p>
                  </div>
                  <span className="text-xl">→</span>
                  <div className="text-right">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-pink-600">
                      Arrivée
                    </p>
                    <p className="font-bold">Votre site de travail</p>
                  </div>
                </div>
              </div>

              {[
                ["⏰", "Horaires compatibles", "Trouvez des trajets adaptés à vos horaires."],
                ["👥", "Des collègues compatibles", "Retrouvez les personnes qui partagent vos contraintes."],
                ["💬", "Échangez simplement", "Contactez votre collègue depuis la plateforme."],
              ].map(([icon, title, text], index) => (
                <div
                  key={title}
                  className={`mb-3 flex items-center gap-4 rounded-2xl border p-4 ${
                    index === 2
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
                    {icon}
                  </div>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className={`text-sm ${index === 2 ? "text-gray-300" : "text-gray-500"}`}>
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnement" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 font-bold uppercase tracking-widest text-pink-600">
              Comment ça marche ?
            </p>
            <h2 className="mb-6 text-4xl font-black lg:text-5xl">
              Simple à utiliser, pensé pour votre quotidien.
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 lg:text-xl">
              De la création du trajet à la mise en relation avec un collègue,
              EnVoiture accompagne chaque étape.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              ["01", "📝", "Créez votre trajet", "Indiquez votre départ, votre site de travail, vos horaires et les jours concernés."],
              ["02", "🔎", "Trouvez un collègue", "Consultez les trajets compatibles avec vos contraintes et vos besoins."],
              ["03", "💬", "Organisez-vous", "Échangez avec votre collègue et définissez ensemble les modalités du covoiturage."],
            ].map(([number, icon, title, text]) => (
              <div key={number} className="rounded-[30px] border border-gray-200 bg-gray-50 p-8">
                <p className="mb-6 font-black text-pink-600">{number}</p>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
                  {icon}
                </div>
                <h3 className="mb-4 text-2xl font-black">{title}</h3>
                <p className="leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-16 text-center">
            <p className="mb-4 font-bold uppercase tracking-widest text-pink-600">
              Pourquoi EnVoiture ?
            </p>
            <h2 className="mb-6 text-4xl font-black lg:text-5xl">
              Une solution pensée pour les réalités SNCF.
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              ["🚆", "Horaires et prises de service", "Les horaires décalés, les prises de service tôt le matin et les contraintes de roulement font partie du quotidien."],
              ["🤝", "Une communauté de collègues", "EnVoiture facilite les échanges entre agents partageant des contraintes professionnelles et des trajets similaires."],
              ["🌱", "Une mobilité plus simple", "Partager les trajets domicile-travail peut réduire les coûts individuels et contribuer à une mobilité plus durable."],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl">
                  {icon}
                </div>
                <h3 className="mb-4 text-2xl font-black">{title}</h3>
                <p className="leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
          <div className="rounded-[40px] bg-gray-900 p-8 text-white sm:p-12 lg:p-16">
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                🔒
              </div>
              <div>
                <p className="mb-4 font-bold uppercase tracking-widest text-pink-300">
                  Confidentialité
                </p>
                <h2 className="mb-5 text-3xl font-black lg:text-4xl">
                  Vos informations restent sous votre contrôle.
                </h2>
                <p className="text-lg leading-relaxed text-gray-300">
                  EnVoiture limite les informations personnelles exposées aux
                  autres utilisateurs. Les informations précises nécessaires au
                  covoiturage sont destinées à rester dans le cadre des échanges
                  entre personnes concernées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-pink-50 via-white to-red-50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="mb-4 font-bold uppercase tracking-widest text-pink-600">
            EnVoiture
          </p>
          <h2 className="mb-6 text-4xl font-black lg:text-5xl">
            Prêt à partager vos trajets ?
          </h2>
          <p className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-gray-600">
            Retrouvez vos collègues et simplifiez vos déplacements
            domicile-travail.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-pink-200 transition hover:scale-[1.02]"
          >
            Accéder à EnVoiture
          </Link>
        </div>
      </section>

      <footer className="bg-gray-950 px-6 py-8 text-center text-sm text-gray-400">
        EnVoiture — Covoiturage entre agents SNCF
      </footer>
    </main>
  );
}
