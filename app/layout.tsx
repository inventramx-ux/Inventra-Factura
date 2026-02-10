import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { InvoiceProvider } from "./contexts/InvoiceContext"
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
  icons: {
    icon: ['/favicon.ico'],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <InvoiceProvider>
        <html lang="es">
          <head>
            <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/favicon.ico" />
          </head>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
            <Analytics />
          </body>
        </html>
      </InvoiceProvider>
    </ClerkProvider>
  );
}
