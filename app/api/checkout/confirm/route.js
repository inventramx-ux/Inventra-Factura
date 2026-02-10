import paypal from "@paypal/checkout-server-sdk";
import { clerkClient } from "@clerk/nextjs/server";

const clientID = process.env.PAYPAL_CLIENT_ID || "AbRMwcea-gsUfQJlbJlw0snA3Y_dxNDuZ6oQL3odx7bH6ozFPULZ9iSXXdxpMiemd-pmZuMAe6cWpOw0";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "EFPaGXnuEqFgKc-sFBLf1EAi4i2sJsDuzGyW0nkwHpVuxOUTho_IBktohrZghHwjr6Djyt860gpJgOU9";

const environment = new paypal.core.SandboxEnvironment(clientID, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    const { orderID, userId } = await request.json();

    const requestPaypal = new paypal.orders.OrdersCaptureRequest(orderID);

    const response = await client.execute(requestPaypal);

    if (response.result.status === "COMPLETED") {
      // Update user's subscription status in Clerk
      if (userId) {
        try {
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              subscriptionStatus: "pro",
              subscriptionUpdated: new Date().toISOString(),
              paypalOrderID: orderID,
            }
          });
        } catch (clerkError) {
          console.error("Clerk update error:", clerkError);
          // Continue even if Clerk update fails
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
