"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    linesWithProduct,
    subtotal,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-[var(--color-kraft)] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="font-display text-lg text-[var(--color-midway)]">
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl leading-none hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)]"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {linesWithProduct.length === 0 ? (
            <p className="mt-10 text-center text-sm text-black/60">
              Your cart is empty. Time to spin something up.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {linesWithProduct.map((line) => (
                <li
                  key={`${line.slug}-${line.ribbonColor ?? "none"}`}
                  className="flex gap-3 border-b border-black/10 pb-4"
                >
                  <div
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                    style={{ backgroundColor: line.swatch }}
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-semibold leading-tight">
                      {line.name}
                    </p>
                    {line.ribbonColor && (
                      <p className="text-xs text-black/60">
                        Ribbon: {line.ribbonColor}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Decrease quantity of ${line.name}`}
                          onClick={() =>
                            updateQuantity(
                              line.slug,
                              line.ribbonColor,
                              line.quantity - 1
                            )
                          }
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          aria-label={`Increase quantity of ${line.name}`}
                          onClick={() =>
                            updateQuantity(
                              line.slug,
                              line.ribbonColor,
                              line.quantity + 1
                            )
                          }
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(line.price * line.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(line.slug, line.ribbonColor)}
                      className="mt-1 self-start cursor-pointer text-xs text-black/50 underline hover:text-black/80"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/10 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className="block w-full cursor-pointer rounded-full bg-[var(--color-midway)] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--color-midway-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)]"
          >
            View Cart & Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
