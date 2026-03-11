import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  console.log(`Received Stripe webhook: ${event.type}`, { id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          await updateSubscriptionStatus(userId, "pro", subscriptionId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await findUserBySubscription(subscription.id);

        if (userId) {
          await updateSubscriptionStatus(userId, "free", subscription.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string | null;

        if (subscriptionId) {
          const userId = await findUserBySubscription(subscriptionId);
          if (userId) {
            await updateSubscriptionStatus(userId, "free", subscriptionId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function findUserBySubscription(subscriptionId: string): Promise<string | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  return data?.user_id || null;
}

async function updateSubscriptionStatus(
  userId: string,
  status: string,
  subscriptionId: string
) {
  console.log(`Updating status for user ${userId} to ${status}`);

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        subscriptionStatus: status,
        subscriptionUpdated: new Date().toISOString(),
        stripeSubscriptionId: subscriptionId,
      },
    });

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      status: status,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error updating subscription status:", err);
  }
}
