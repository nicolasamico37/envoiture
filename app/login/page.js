export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 to-red-500 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          Connexion
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="prenom.nom@sncf.fr"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border border-gray-200 rounded-2xl px-5 py-4"
          />

          <button className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-4 rounded-2xl font-semibold">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}