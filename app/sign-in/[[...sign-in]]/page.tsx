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
      <RedirectToSignIn />
    </div>
  );
}

"use client";

import { RedirectToSignIn } from "@clerk/nextjs";
              "bg-white/10 border border-white/20 text-white hover:bg-white/20",
