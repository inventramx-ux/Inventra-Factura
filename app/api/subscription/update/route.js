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
