import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const paymentMethodType =
          session.payment_method_types?.[0] || "unknown";

        await prisma.subscription.create({
          data: {
            userId: session.metadata!.userId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            paymentMethod: paymentMethodType,
            currentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
          },
        });
      } else if (
        session.mode === "payment" &&
        session.metadata?.type === "recharge"
      ) {
        // Handle recharge payment
        const amount = parseFloat(session.metadata.amount);
        const transactionId = session.metadata.transactionId;

        // Update user balance
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // Update transaction status
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "completed" },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        invoice.parent?.subscription_details?.subscription;
      if (subscriptionId) {
        const subId =
          typeof subscriptionId === "string"
            ? subscriptionId
            : subscriptionId.id;
        const subscription = await stripe.subscriptions.retrieve(subId);
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          stripePriceId: subscription.items.data[0].price.id,
          currentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const runtime = "nodejs";
