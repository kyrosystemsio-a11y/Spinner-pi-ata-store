import { stripe } from "@/lib/stripe";

// MVP: Stripe's built-in checkout receipt email is the order confirmation.
// This webhook just logs completed orders server-side; wire it to a real
// order store / fulfillment email once one exists.
export async function POST(request: Request) {
  if (!stripe) {
    return Response.json({ error: "Stripe isn't configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured.");
    return Response.json({ error: "Webhook isn't configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Order completed:", {
      sessionId: session.id,
      amountTotal: session.amount_total,
      customerEmail: session.customer_details?.email,
    });
  }

  return Response.json({ received: true });
}
