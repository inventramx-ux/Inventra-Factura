import paypal from "@paypal/checkout-server-sdk";
import { clerkClient } from "@clerk/nextjs/server";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function getAccessToken() {
  const clientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const baseUrl = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  if (!clientID || !clientSecret) {
    throw new Error("PayPal credentials not found");
  }

  const auth = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Failed to get PayPal access token");
  return data.access_token;
}

const getPayPalClient = () => {
  const clientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox";

  if (!clientID || !clientSecret) {
    return null;
  }

  console.log(`Initializing PayPal in ${mode} mode`);

  const environment = mode === "live"
    ? new paypal.core.LiveEnvironment(clientID, clientSecret)
    : new paypal.core.SandboxEnvironment(clientID, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

export async function POST(request) {
  try {
    const client = getPayPalClient();

    if (!client) {
      console.error("PayPal credentials not configured in environment variables");
      return Response.json(
        {
          error: "Configuración de PayPal incompleta",
          details: "No se puede confirmar el pago porque las credenciales de PayPal faltan en el servidor."
        },
        { status: 503 }
      );
    }

    const { orderID, subscriptionID, userId } = await request.json();

    if (subscriptionID) {
      console.log("Confirming subscription:", subscriptionID);

      // Verify subscription status via PayPal API
      const accessToken = await getAccessToken();
      const baseUrl = process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      const subResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionID}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      });

      if (!subResponse.ok) {
        throw new Error("Failed to verify subscription with PayPal");
      }

      const subscriptionDetails = await subResponse.json();
      console.log("Subscription status:", subscriptionDetails.status);

      // Only proceed if active
      if (subscriptionDetails.status !== "ACTIVE" && subscriptionDetails.status !== "APPROVED") {
        return Response.json(
          { error: "La suscripción no está activa", details: `Estado actual: ${subscriptionDetails.status}` },
          { status: 400 }
        );
      }

      if (userId) {
        try {
          const clerk = await clerkClient();
          await clerk.users.updateUser(userId, {
            publicMetadata: {
              subscriptionStatus: "pro",
              subscriptionUpdated: new Date().toISOString(),
              paypalSubscriptionID: subscriptionID,
            }
          });

          // Sync with Supabase
          const { supabase } = await import("@/lib/supabase");
          const { error: supabaseError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'pro',
              paypal_order_id: subscriptionID, // Store subscription ID in order ID column for compatibility
              updated_at: new Date().toISOString()
            });

          if (supabaseError) {
            console.error("Supabase subscription sync error:", supabaseError);
          }
        } catch (updateError) {
          console.error("Subscription update error:", updateError);
        }
      }

      return Response.json({
        success: true,
        subscriptionID: subscriptionID,
        subscriptionUpdated: true
      });
    }

    if (orderID) {
      const requestPaypal = new paypal.orders.OrdersCaptureRequest(orderID);
      const response = await client.execute(requestPaypal);

      if (response.result.status === "COMPLETED") {
        if (userId) {
          try {
            const clerk = await clerkClient();
            await clerk.users.updateUser(userId, {
              publicMetadata: {
                subscriptionStatus: "pro",
                subscriptionUpdated: new Date().toISOString(),
                paypalOrderID: orderID,
              }
            });

            // Sync with Supabase
            const { supabase } = await import("@/lib/supabase");
            const { error: supabaseError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                status: 'pro',
                paypal_order_id: orderID,
                updated_at: new Date().toISOString()
              });

            if (supabaseError) {
              console.error("Supabase subscription sync error:", supabaseError);
            }
          } catch (updateError) {
            console.error("Subscription update error:", updateError);
          }
        }

        return Response.json({
          success: true,
          status: response.result.status,
          orderID: response.result.id,
          subscriptionUpdated: true
        });
      }
    }

    return Response.json(
      { error: "No orderID or subscriptionID provided or payment not completed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PayPal confirmation error:", error);
    return Response.json(
      { error: "Failed to confirm payment/subscription" },
      { status: 500 }
    );
  }
}
