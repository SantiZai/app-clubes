import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PádelClub — Torneos y reservas",
  description:
    "Inscribite a torneos de pádel, seguí tus resultados y encontrá rivales a tu nivel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

