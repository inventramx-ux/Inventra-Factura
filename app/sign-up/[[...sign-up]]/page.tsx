import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <Image
            src="/inventralogo.png"
            alt="Inventra Factura"
            width={48}
            height={48}
            className="h-12 w-auto"
            priority
          />
          <span className="text-white text-2xl font-bold hidden sm:inline">
            Inventra Factura
          </span>
        </Link>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-white/10 border border-white/20",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton:
              "bg-white/10 border border-white/20 text-white hover:bg-white/20",
            formFieldLabel: "text-white",
            formFieldInput:
              "bg-white/10 border border-white/20 text-white placeholder-gray-500",
            formResendCodeLink: "text-blue-400 hover:text-blue-300",
            primaryButton: "bg-white text-black hover:bg-gray-200",
            dividerLine: "bg-white/20",
            dividerText: "text-gray-400",
            footerActionLink: "text-blue-400 hover:text-blue-300",
          },
        }}
      />
    </div>
  );
}
