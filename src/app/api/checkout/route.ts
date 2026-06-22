import type { CartLine } from "@/lib/cart-context";
import { getProductBySlug } from "@/data/products";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Checkout requested but STRIPE_SECRET_KEY is not configured.");
    return Response.json(
      { error: "Checkout isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const { lines } = (await request.json()) as { lines: CartLine[] };

  if (!Array.isArray(lines) || lines.length === 0) {
    return Response.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Always re-look-up price/name server-side from our own product data — never
  // trust a price submitted by the client.
  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; metadata: Record<string, string> };
      unit_amount: number;
    };
    quantity: number;
  }> = [];

  for (const line of lines) {
    const product = getProductBySlug(line.slug);
    if (!product || !Number.isInteger(line.quantity) || line.quantity <= 0) {
      return Response.json(
        { error: `Couldn't find one of the items in your cart.` },
        { status: 400 }
      );
    }
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: line.ribbonColor
            ? `${product.name} (${line.ribbonColor} ribbon)`
            : product.name,
          metadata: { slug: product.slug },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: line.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/checkout/cancel`,
    shipping_address_collection: { allowed_countries: ["US"] },
  });

  if (!session.url) {
    console.error("Stripe Checkout Session created without a redirect URL.");
    return Response.json(
      { error: "Couldn't start checkout. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ url: session.url });
}
