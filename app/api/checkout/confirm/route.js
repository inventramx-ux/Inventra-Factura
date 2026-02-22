import paypal from "@paypal/checkout-server-sdk";
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
      // For subscriptions, we usually trust the onApprove event from frontend 
      // but ideally we should verify it via API.
      // For now, let's update the user metadata as we did with orders.

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
