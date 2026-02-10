import paypal from "@paypal/checkout-server-sdk";

const clientID = process.env.PAYPAL_CLIENT_ID || "AbRMwcea-gsUfQJlbJlw0snA3Y_dxNDuZ6oQL3odx7bH6ozFPULZ9iSXXdxpMiemd-pmZuMAe6cWpOw0";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "EFPaGXnuEqFgKc-sFBLf1EAi4i2sJsDuzGyW0nkwHpVuxOUTho_IBktohrZghHwjr6Djyt860gpJgOU9";

const environment = new paypal.core.SandboxEnvironment(clientID, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    const { plan, price } = await request.json();

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

    const response = await client.execute(requestPaypal);
    
    return Response.json({ 
      orderID: response.result.id,
      status: response.result.status 
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return Response.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}