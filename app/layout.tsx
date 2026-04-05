import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ClientProvider } from "./contexts/ClientContext"
import { CurrencyProvider } from "./contexts/CurrencyContext"
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>

      <body className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}>
        <ClerkProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ClientProvider>
              <CurrencyProvider>
                {children}
                <Analytics />
              </CurrencyProvider>
            </ClientProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
