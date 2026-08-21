import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          EnVoiture · Covoiturage entre agents SNCF
        </p>
      </div>
    </main>
  );
}