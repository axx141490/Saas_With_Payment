import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getUserSubscription() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user || user.subscriptions.length === 0) return null;

  const subscription = user.subscriptions[0];
  const isActive =
    subscription.status === "active" &&
    subscription.currentPeriodEnd > new Date();

  return {
    ...subscription,
    isActive,
    isPro:
      isActive &&
      subscription.stripePriceId ===
        process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    isEnterprise:
      isActive &&
      subscription.stripePriceId ===
        process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  };
}
