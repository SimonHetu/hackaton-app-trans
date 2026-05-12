import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ligues Sportives",
  description: "Plateforme de gestion de ligues sportives communautaires",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}