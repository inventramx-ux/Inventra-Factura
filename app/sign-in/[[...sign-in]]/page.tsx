"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <img
            src="/inventralogo.png"
            alt="Inventra Factura"
            width={48}
            height={48}
            className="h-12 w-auto"
          />
          <span className="text-white text-2xl font-bold hidden sm:inline">
            Inventra Factura
          </span>
        </Link>
      </div>

      <SignIn
        appearance={{
          elements: {
            card: 'bg-white/5 border border-white/10 backdrop-blur rounded-xl shadow-xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-300',
            socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
            socialButtonsBlockButtonText: 'text-white',
            dividerLine: 'bg-white/10',
            dividerText: 'text-slate-300',
            formFieldLabel: 'text-slate-200',
            formFieldInput: 'bg-black/30 border-white/20 text-white',
            footerActionText: 'text-slate-300',
            footerActionLink: 'text-white hover:text-slate-200',
          },
        }}
      />
    </div>
  );
}
