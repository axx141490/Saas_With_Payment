import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, paymentMethod = "alipay" } = await req.json();

    // Validate amount
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: "最低充值金额为 ¥10" },
        { status: 400 }
      );
    }

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json(
          { error: "No email found" },
          { status: 400 }
        );
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
        },
      });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkId: userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "recharge",
        amount,
        paymentMethod,
        status: "pending",
        description: `账户充值 ¥${amount}`,
      },
    });

    // Create Stripe checkout session for one-time payment
    const sessionParams: Record<string, unknown> = {
      customer: stripeCustomerId,
      mode: "payment", // One-time payment, not subscription
      payment_method_types: [paymentMethod],
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: "账户充值",
              description: `充值 ¥${amount} 到账户余额`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/recharge?success=true&amount=${amount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/recharge?canceled=true`,
      metadata: {
        userId: user.id,
        transactionId: transaction.id,
        type: "recharge",
        amount: amount.toString(),
      },
    };

    if (paymentMethod === "wechat_pay") {
      sessionParams.payment_method_options = {
        wechat_pay: { client: "web" },
      };
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    // Update transaction with Stripe payment ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { stripePaymentId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Recharge error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
