"use client";



import React, { useEffect, useState } from "react";

import {

  PayPalScriptProvider,

  PayPalButtons,

} from "@paypal/react-paypal-js";

import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";



const CheckoutPage = () => {

  const [plan, setPlan] = useState("Pro");

  const [price] = useState("199.00");

  const router = useRouter();

  const { user } = useUser();



  return (

    <div className="min-h-screen bg-slate-900 flex items-center justify-center">

      <div className="max-w-md w-full mx-4">

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">

          <h1 className="text-2xl font-bold text-white mb-2">Completa tu pago</h1>

          <p className="text-gray-400 mb-6">Plan Pro - Inventra Factura</p>



          <div className="bg-white/5 rounded-lg p-4 mb-6">

            <div className="flex justify-between items-center mb-2">

              <span className="text-gray-300">Plan:</span>

              <span className="text-white font-medium">{plan}</span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-gray-300">Precio:</span>

              <span className="text-white font-medium">${price} MXN/mes</span>

            </div>

          </div>



          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
              currency: "MXN",
              vault: true,
              intent: "subscription",
            }}
          >

            <PayPalButtons

              style={{

                layout: "vertical",

                color: "blue",

                shape: "rect",

                label: "subscribe",

              }}

              createSubscription={async (data, actions) => {

                return actions.subscription.create({

                  plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "P-5EL73493HV576381LNGM7OVA",

                });

              }}

              onApprove={async (data) => {

                try {

                  console.log("Subscription approved, ID:", data.subscriptionID);

                  const res = await fetch("/api/checkout/confirm", {

                    method: "POST",

                    headers: {

                      "Content-Type": "application/json",

                    },

                    body: JSON.stringify({

                      subscriptionID: data.subscriptionID,

                      userId: user?.id,

                    }),

                  });



                  const result = await res.json();



                  if (res.ok && result.success) {

                    alert("¡Suscripción exitosa! 🚀 Redirigiendo al dashboard...");

                    setTimeout(() => {

                      window.location.href = "/dashboard";

                    }, 2000);

                  } else {

                    throw new Error(result.error || "Subscription confirmation failed");

                  }

                } catch (error) {

                  console.error("Subscription confirmation error:", error);

                  alert("Error al confirmar la suscripción. Por favor contacta soporte.");

                }

              }}

              onCancel={() => {

                alert("Pago cancelado. Puedes intentarlo de nuevo cuando quieras.");

              }}

              onError={(err) => {

                console.error("PayPal error:", err);

                alert("Ocurrió un error con PayPal. Por favor intenta de nuevo.");

              }}

            />

          </PayPalScriptProvider>



          <button

            onClick={() => router.back()}

            className="mt-6 w-full text-center text-gray-400 hover:text-white transition-colors text-sm"

          >

            ← Volver

          </button>

        </div>

      </div>

    </div>

  );

};



export default CheckoutPage;

