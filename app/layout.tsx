import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { InvoiceProvider } from "./contexts/InvoiceContext"
import { ClientProvider } from "./contexts/ClientContext"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventra Factura",
  description: "Sistema de facturación moderno para tu negocio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
