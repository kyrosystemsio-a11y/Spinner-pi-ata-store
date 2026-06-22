"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { lines, linesWithProduct, subtotal, updateQuantity, removeItem } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(
          data.error ?? "Couldn't start checkout. Please try again."
        );
        setIsCheckingOut(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Couldn't start checkout. Please try again.");
      setIsCheckingOut(false);
    }
  }

  if (linesWithProduct.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-midway)]">
          Your Cart Is Empty
        </h1>
        <p className="mt-3 text-black/70">
          Nothing here yet — let&apos;s find you a piñata.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block cursor-pointer rounded-full bg-[var(--color-midway)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-midway-light)]"
        >
          Browse the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Your Cart
      </h1>

      <ul className="mt-8 flex flex-col gap-5">
        {linesWithProduct.map((line) => (
          <li
            key={`${line.slug}-${line.ribbonColor ?? "none"}`}
            className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
          >
            <div
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
              style={{ backgroundColor: line.swatch }}
            >
              {line.image && (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold leading-tight">{line.name}</p>
                  {line.ribbonColor && (
                    <p className="text-sm text-black/60">
                      Ribbon: {line.ribbonColor}
                    </p>
                  )}
                </div>
                <p className="font-bold text-[var(--color-midway)]">
                  ${(line.price * line.quantity).toFixed(2)}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Decrease quantity of ${line.name}`}
                    onClick={() =>
                      updateQuantity(line.slug, line.ribbonColor, line.quantity - 1)
                    }
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{line.quantity}</span>
                  <button
                    aria-label={`Increase quantity of ${line.name}`}
                    onClick={() =>
                      updateQuantity(line.slug, line.ribbonColor, line.quantity + 1)
                    }
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(line.slug, line.ribbonColor)}
                  className="cursor-pointer text-sm text-black/50 underline hover:text-black/80"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-black/10 pt-6">
        <div className="flex w-full max-w-xs justify-between text-lg font-bold sm:max-w-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full max-w-xs cursor-pointer rounded-full bg-[var(--color-midway)] px-7 py-4 text-center font-bold text-white transition-colors hover:bg-[var(--color-midway-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-sm"
        >
          {isCheckingOut ? "Redirecting to checkout…" : "Checkout"}
        </button>
        <p className="max-w-sm text-right text-xs text-black/50">
          14-day returns on ready-made orders · we&apos;ll always make it
          right if something arrives damaged.
        </p>
        {checkoutError && (
          <p className="max-w-sm text-right text-sm text-red-600">
            {checkoutError}
          </p>
        )}
      </div>
    </div>
  );
}
