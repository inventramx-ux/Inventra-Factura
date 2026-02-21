<<<<<<< Updated upstream
import paypal from "@paypal/checkout-server-sdk";
=======
import { Client, Environment } from "@paypal/paypal-server-sdk";
>>>>>>> Stashed changes
import { clerkClient } from "@clerk/nextjs/server";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const getPayPalClient = () => {
  const clientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox";

  if (!clientID || !clientSecret) {
    return null;
  }

  console.log(`Initializing PayPal in ${mode} mode`);

<<<<<<< Updated upstream
  const environment = mode === "live"
    ? new paypal.core.LiveEnvironment(clientID, clientSecret)
    : new paypal.core.SandboxEnvironment(clientID, clientSecret);
=======
  const client = new Client({
    clientID,
    clientSecret,
    environment: mode === "live" ? Environment.Production : Environment.Sandbox
  });
>>>>>>> Stashed changes

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

    const { orderID, userId } = await request.json();

    const requestPaypal = new paypal.orders.OrdersCaptureRequest(orderID);

    const response = await client.execute(requestPaypal);

    if (response.result.status === "COMPLETED") {
      // Update user's subscription status in Clerk
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
          // Continue even if updates fail
        }
      }

      // Here you would typically:
      // 1. Send confirmation email
      // 2. Grant access to Pro features
      // 3. Log the transaction

      return Response.json({
        success: true,
        status: response.result.status,
        orderID: response.result.id,
        subscriptionUpdated: true
      });
    } else {
      return Response.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("PayPal capture error:", error);
    return Response.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
