import Link from "next/link";
import type { Metadata } from "next";
import { stripe } from "@/lib/stripe";
import ClearCartOnMount from "@/components/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Order Confirmed | Spinner Piñata",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session =
    session_id && stripe
      ? await stripe.checkout.sessions.retrieve(session_id).catch(() => null)
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <ClearCartOnMount />
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Order Confirmed!
      </h1>
      <p className="mt-4 text-black/70">
        {session?.customer_details?.email
          ? `A receipt is on its way to ${session.customer_details.email}.`
          : "A receipt is on its way to your inbox."}{" "}
        We&apos;ll start hand-building your order right away.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
      >
        Keep Shopping
      </Link>
    </div>
  );
}
