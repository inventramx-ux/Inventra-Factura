import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { InvoiceProvider } from "./contexts/InvoiceContext"
import { ClientProvider } from "./contexts/ClientContext"
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventra  ",
  description: "Sistema de facturación moderno para tu negocio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">

      <body className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}>
        <ClerkProvider>
          <ClientProvider>
            <InvoiceProvider>
              {children}
              <Analytics />
            </InvoiceProvider>
          </ClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
