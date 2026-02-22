import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
    try {
        const bodyText = await request.text();
        const payload = JSON.parse(bodyText);

        // Headers required for signature verification
        const headers = {
            auth_algo: request.headers.get("paypal-auth-algo"),
            cert_url: request.headers.get("paypal-cert-url"),
            transmission_id: request.headers.get("paypal-transmission-id"),
            transmission_sig: request.headers.get("paypal-transmission-sig"),
            transmission_time: request.headers.get("paypal-transmission-time"),
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        };

        // Skip verification if Webhook ID is not configured (e.g., in local dev without hooks enabled)
        if (headers.webhook_id && headers.webhook_id !== "YOUR_WEBHOOK_ID_HERE") {
            console.log("Verifying PayPal Webhook signature...");
            const isVerified = await verifyPayPalSignature(headers, bodyText);
            if (!isVerified) {
                console.error("PayPal Webhook signature verification failed");
                return Response.json({ error: "Invalid signature" }, { status: 401 });
            }
            console.log("Signature verified successfully");
        } else {
            console.warn("PayPal Webhook ID not configured. Skipping signature verification (unsafe for production).");
        }

        const eventType = payload.event_type;
        const resource = payload.resource;

        console.log(`Received PayPal Webhook: ${eventType}`, { id: payload.id });

        switch (eventType) {
            case "BILLING.SUBSCRIPTION.ACTIVATED":
            case "BILLING.SUBSCRIPTION.CREATED":
            case "PAYMENT.SALE.COMPLETED": {
                const subscriptionID = resource.id || resource.billing_agreement_id;
                if (!subscriptionID) break;

                // Try to find the user by subscription ID
                const { data: subData } = await supabase
                    .from("subscriptions")
                    .select("user_id")
                    .eq("paypal_order_id", subscriptionID) // Using existing column for subscriptions
                    .single();

                if (subData?.user_id) {
                    await updateStatus(subData.user_id, "pro", subscriptionID);
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.EXPIRED":
            case "BILLING.SUBSCRIPTION.SUSPENDED":
            case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
                const subscriptionID = resource.id;
                const { data: subData } = await supabase
                    .from("subscriptions")
                    .select("user_id")
                    .eq("paypal_order_id", subscriptionID)
                    .single();

                if (subData?.user_id) {
                    await updateStatus(subData.user_id, "free", subscriptionID);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return Response.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}

async function verifyPayPalSignature(headers, body) {
    try {
        const accessToken = await getAccessToken();
        const mode = process.env.PAYPAL_MODE || "sandbox";
        const baseUrl = mode === "live"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                auth_algo: headers.auth_algo,
                cert_url: headers.cert_url,
                transmission_id: headers.transmission_id,
                transmission_sig: headers.transmission_sig,
                transmission_time: headers.transmission_time,
                webhook_id: headers.webhook_id,
                webhook_event: JSON.parse(body),
            }),
        });

        const data = await response.json();
        console.log("Verification response:", data.verification_status);
        return data.verification_status === "SUCCESS";
    } catch (error) {
        console.error("Error verifying PayPal signature:", error);
        return false;
    }
}

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
    return data.access_token;
}

async function updateStatus(userId, status, subscriptionID) {
    console.log(`Updating status for user ${userId} to ${status}`);

    try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                subscriptionStatus: status,
                subscriptionUpdated: new Date().toISOString(),
                paypalSubscriptionID: subscriptionID,
            }
        });

        await supabase
            .from("subscriptions")
            .upsert({
                user_id: userId,
                status: status,
                paypal_order_id: subscriptionID,
                updated_at: new Date().toISOString()
            });
    } catch (err) {
        console.error("Error updating subscription status:", err);
    }
}
