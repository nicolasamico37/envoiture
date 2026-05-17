import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EnVoiture",
  description:
    "Le covoiturage entre collègues SNCF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}