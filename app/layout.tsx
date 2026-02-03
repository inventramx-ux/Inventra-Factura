import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        >
          <header className="flex justify-between items-center p-4 gap-4 h-16 border-b border-white/20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/inventralogo.png"
                alt="Inventra Factura"
                width={32}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="text-white font-semibold hidden sm:inline">
                Inventra Factura
              </span>
            </Link>

            {/* Auth buttons */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Registrarse
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
