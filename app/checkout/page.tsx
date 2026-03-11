"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(
    searchParams.get("cancelled") === "true"
      ? { text: "Pago cancelado. Puedes intentarlo de nuevo cuando quieras.", type: "info" }
      : null
  );

  const handleCheckout = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Error al iniciar el pago");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setMessage({
        text: error instanceof Error ? error.message : "Error al procesar el pago. Intenta de nuevo.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#111111] rounded-2xl p-8 border border-[#1e1e1e]">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-white tracking-tight">Plan Pro</h1>
          <p className="text-[#555] text-sm mt-1 mb-8">Inventra Factura</p>

          {/* Plan details */}
          <div className="border border-[#1e1e1e] rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#666] text-sm">Plan</span>
              <span className="text-white text-sm font-medium">Pro</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#666] text-sm">Precio</span>
              <span className="text-white text-sm font-medium">$199 MXN/mes</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-8">
            {["Facturas ilimitadas", "Clientes ilimitados", "Reportes avanzados", "Soporte prioritario"].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-[#888]">
                <span className="text-[#444]">—</span>
                {feature}
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm ${
                message.type === "success"
                  ? "bg-[#0a1a0a] text-[#4a8] border border-[#1a2a1a]"
                  : message.type === "error"
                  ? "bg-[#1a0a0a] text-[#a44] border border-[#2a1a1a]"
                  : "bg-[#0a0a1a] text-[#88a] border border-[#1a1a2a]"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full text-sm font-medium py-3.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white text-black hover:bg-[#e0e0e0] active:bg-[#ccc]"
          >
            {isLoading ? "Redirigiendo..." : "Continuar al pago"}
          </button>

          <p className="text-[#444] text-xs text-center mt-3">
            Serás redirigido a Stripe para completar el pago
          </p>

          {/* Back */}
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full text-center text-[#555] hover:text-[#999] transition-colors text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-[#555] text-sm">Cargando...</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
