import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Canceled | Spinner Piñata",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Checkout Canceled
      </h1>
      <p className="mt-4 text-black/70">
        No charge was made. Your cart is still waiting whenever you&apos;re ready.
      </p>
      <Link
        href="/cart"
        className="mt-8 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 font-bold text-white transition-colors hover:bg-[var(--color-midway-light)]"
      >
        Back to Cart
      </Link>
    </div>
  );
}
