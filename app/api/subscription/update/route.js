import { clerkClient } from "@clerk/nextjs/server"

export async function POST(request) {
  try {
    const { userId, orderID, plan } = await request.json()

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Update user's subscription status in Clerk
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        subscriptionStatus: plan === "Pro" ? "pro" : "free",
        subscriptionUpdated: new Date().toISOString(),
        paypalOrderID: orderID,
      }
    })

    // Sync with Supabase
    const { supabase } = await import("@/lib/supabase");
    const { error: supabaseError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: plan === "Pro" ? "pro" : "free",
        paypal_order_id: orderID || null,
        updated_at: new Date().toISOString()
      });

    if (supabaseError) {
      console.error("Supabase subscription sync error:", supabaseError);
    }

    return Response.json({
      success: true,
      message: "Subscription updated successfully"
    })
  } catch (error) {
    console.error("Subscription update error:", error)
    return Response.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    )
  }
}
