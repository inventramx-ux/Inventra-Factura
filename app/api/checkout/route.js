import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const clientID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  console.error("Missing PayPal credentials in environment variables");
  throw new Error("PayPal credentials not configured");
}

const environment = new paypal.core.SandboxEnvironment(clientID, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    const { plan, price } = await request.json();
    
    console.log("Creating PayPal order with:", { plan, price });
    console.log("PayPal Client ID:", clientID ? "Set" : "Missing");
    console.log("PayPal Client Secret:", clientSecret ? "Set" : "Missing");

    const requestPaypal = new paypal.orders.OrdersCreateRequest();
    requestPaypal.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "MXN",
            value: price || "199.00",
          },
          description: `Plan ${plan || "Pro"} - Inventra Factura`,
        },
      ],
    });

    console.log("Sending PayPal request...");
    const response = await client.execute(requestPaypal);
    console.log("PayPal response:", response.result);
    
    return Response.json({ 
      orderID: response.result.id,
      status: response.result.status 
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details
    });
    return Response.json(
      { 
        error: "Failed to create PayPal order",
        details: error.message 
      },
      { status: 500 }
    );
  }
}