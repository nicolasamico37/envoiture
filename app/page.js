import Link from "next/link";

import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-red-50" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <Image
                src="/logo-full.png"
                alt="EnVoiture"
                width={520}
                height={160}
                className="h-auto w-auto max-w-[240px] lg:max-w-[420px]"
                priority
              />
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden lg:flex items-center justify-center px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition font-medium"
              >
                Accéder à l'application
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 text-white font-semibold shadow-lg shadow-pink-200"
              >
                Commencer
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white border border-pink-100 rounded-full px-5 py-3 mb-8 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />

                <p className="text-sm font-medium text-gray-700">
                  Plateforme collaborative SNCF
                </p>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                Le covoiturage
                <span className="bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                  {" "}
                  intelligent{" "}
                </span>
                entre collègues.
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-10">
                EnVoiture facilite les trajets domicile-travail
                entre agents SNCF grâce à une plateforme moderne,
                collaborative et pensée pour les horaires décalés.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center px-8 py-5 rounded-3xl bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold text-lg shadow-xl shadow-pink-200 hover:scale-[1.02] transition"
                >
                  Accéder à la plateforme
                </Link>

                <button className="flex items-center justify-center px-8 py-5 rounded-3xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">
                  Découvrir le concept
                </button>
              </div>

              <div className="grid grid-cols-3 gap-5 mt-14">
                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    🚗
                  </h2>

                  <p className="text-sm text-gray-600">
                    Mutualisation des trajets
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    ⏰
                  </h2>

                  <p className="text-sm text-gray-600">
                    Compatible horaires décalés
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    🌱
                  </h2>

                  <p className="text-sm text-gray-600">
                    Mobilité plus durable
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-30" />

              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-red-200 rounded-full blur-3xl opacity-30" />

              <div className="relative bg-white border border-gray-200 rounded-[40px] p-6 lg:p-8 shadow-2xl shadow-pink-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Aujourd'hui
                    </p>

                    <h2 className="text-3xl font-black text-gray-900">
                      12 trajets actifs
                    </h2>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center text-3xl shadow-lg">
                    🚗
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-pink-50 border border-pink-100 rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          La Riche → Saint-Pierre des Corps
                        </p>

                        <p className="text-gray-500 text-sm">
                          Départ 04:35
                        </p>
                      </div>

                      <div className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        3 places
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-600 to-red-500 text-white flex items-center justify-center font-bold">
                        N
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          Nicolas
                        </p>

                        <p className="text-sm text-gray-500">
                          Technicentre Saint-Pierre des Corps
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          Tours → Saint-Pierre
                        </p>

                        <p className="text-gray-500 text-sm">
                          Départ 07:10
                        </p>
                      </div>

                      <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                        1 place
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold">
                        M
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          Mathieu
                        </p>

                        <p className="text-sm text-gray-500">
                          Maintenance TER
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-3xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">
                        Impact collectif
                      </h3>

                      <span className="text-3xl">
                        🌱
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-4xl font-black mb-2">
                          -38%
                        </p>

                        <p className="text-sm text-gray-300">
                          Réduction CO₂
                        </p>
                      </div>

                      <div>
                        <p className="text-4xl font-black mb-2">
                          214€
                        </p>

                        <p className="text-sm text-gray-300">
                          Économie moyenne
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32">
            <div className="text-center mb-16">
              <p className="text-pink-600 font-bold uppercase tracking-widest mb-4">
                Pourquoi EnVoiture ?
              </p>

              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-8">
                Une plateforme pensée
                <span className="bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                  {" "}
                  pour les réalités SNCF
                </span>
              </h2>

              <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Les solutions classiques ne prennent pas en compte
                les contraintes des agents SNCF :
                horaires décalés, prises de service tôt le matin,
                variations de roulements et besoins locaux spécifiques.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-[36px] p-8 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-pink-100 flex items-center justify-center text-4xl mb-8">
                  🚆
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-5">
                  Adapté aux horaires ferroviaires
                </h3>

                <p className="text-gray-600 leading-relaxed text-lg">
                  EnVoiture permet de trouver facilement des collègues
                  compatibles avec les prises de service tôt le matin,
                  les horaires de nuit et les roulements spécifiques SNCF.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[36px] p-8 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center text-4xl mb-8">
                  🤝
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-5">
                  Une communauté de confiance
                </h3>

                <p className="text-gray-600 leading-relaxed text-lg">
                  Les trajets se font entre collègues partageant
                  les mêmes contraintes professionnelles,
                  les mêmes sites et les mêmes habitudes de déplacement.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-[36px] p-8 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center text-4xl mb-8">
                  🌱
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-5">
                  Moins de coûts, moins d'impact
                </h3>

                <p className="text-gray-600 leading-relaxed text-lg">
                  Réduire les frais de carburant,
                  limiter l'empreinte carbone
                  et fluidifier les trajets quotidiens :
                  une mobilité plus intelligente pour tous.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}