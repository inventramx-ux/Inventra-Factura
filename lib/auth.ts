import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
    : clerkUser.firstName ?? clerkUser.lastName ?? null;

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: email || `user-${clerkUser.id}@placeholder.local`,
        name,
      },
    });
  } else if (user.email !== email || user.name !== name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email, name },
    });
  }

  return user;
}
