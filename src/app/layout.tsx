import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "../providers/QueryProvider";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura Nova | Detalles Florales Exclusivos en Huancayo",
  description: "Regalos y detalles florales hechos con mucho cariño pensados para celebrar, sorprender y hacer sentir especial a alguien en Huancayo.",
  keywords: ["flores", "regalos", "huancayo", "detalles florales", "rosas", "arreglos florales", "aura nova", "floreria"],
  authors: [{ name: "Aura Nova" }],
  openGraph: {
    title: "Aura Nova | Diseño Floral Exclusivo",
    description: "Detalles hechos con mucho cariño pensados para celebrar, sorprender y hacer sentir especial a alguien.",
    url: "https://auranova.pe",
    siteName: "Aura Nova",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Nova | Diseño Floral",
    description: "Detalles florales hechos con mucho cariño en Huancayo.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-brown">
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" />
          <OfflineBanner />
        </QueryProvider>
      </body>
    </html>
  );
}
