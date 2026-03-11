import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      console.error("STRIPE_PRICE_ID not configured");
      return Response.json(
        { error: "Configuración de Stripe incompleta" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${request.headers.get("origin")}/checkout?cancelled=true`,
      metadata: {
        userId: userId,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return Response.json(
      { error: "Error al crear la sesión de pago", details: error.message },
      { status: 500 }
    );
  }
}