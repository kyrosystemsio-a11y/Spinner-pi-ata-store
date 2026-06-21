"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { RIBBON_COLORS, type Product } from "@/data/products";

export default function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [ribbonColor, setRibbonColor] = useState<string>(RIBBON_COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      slug: product.slug,
      quantity,
      ribbonColor: product.customizable ? ribbonColor : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {product.customizable && (
        <div>
          <label
            htmlFor="ribbon-color"
            className="mb-2 block text-sm font-semibold"
          >
            Ribbon Color
          </label>
          <select
            id="ribbon-color"
            value={ribbonColor}
            onChange={(e) => setRibbonColor(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-black/15 bg-white px-3 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-midway)]"
          >
            {RIBBON_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
          >
            −
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full cursor-pointer rounded-full bg-[var(--color-midway)] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[var(--color-midway-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)]"
      >
        {added ? "Added — Ready to Spin ✓" : "Add to My Spin"}
      </button>
    </div>
  );
}
