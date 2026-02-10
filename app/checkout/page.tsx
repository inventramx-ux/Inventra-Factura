"use client";

import React from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

const CheckoutPage = () => {
  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <PayPalScriptProvider
        options={{
          clientId:
            "AbRMwcea-gsUfQJlbJlw0snA3Y_dxNDuZ6oQL3odx7bH6ozFPULZ9iSXXdxpMiemd-pmZuMAe6cWpOw0",
        }}
      >
        <PayPalButtons
          createOrder={async () => {
            const res = await fetch("/api/checkout", {
              method: "POST",
            });

            const data = await res.json();

            // MUST return the PayPal order ID
            return data.orderID;
          }}
          onApprove={async (data) => {
            await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });

            alert("Payment successful 🚀");
          }}
          onCancel={() => {
            console.log("Payment cancelled");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default CheckoutPage;
