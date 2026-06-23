"use client";

import Image from "next/image";
import { forwardRef } from "react";
import AddToCartForm from "@/components/AddToCartForm";
import type { Product } from "@/data/products";

// Reveal section shown once the 3D unravel/money-burst timeline settles —
// hands off from the procedural scene to the real product photo. The photo
// itself is the same /products/baptism.jpg used elsewhere on this page;
// there is no separate "FullSizeRender" asset checked into the repo, and we
// don't fabricate product photography, so this reuses the one real photo
// that exists rather than inventing a placeholder image.
const BaptismRevealSection = forwardRef<
  HTMLDivElement,
  { product: Product; reducedMotion?: boolean }
>(function BaptismRevealSection({ product, reducedMotion }, ref) {
  return (
    <section className="bg-[var(--color-kraft)] py-16">
      <div
        ref={ref}
        style={reducedMotion ? undefined : { opacity: 0, transform: "translateY(24px)" }}
        className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6"
      >
        <div className="relative aspect-square w-full max-w-xl overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/products/baptism.jpg"
            alt={`${product.name}, fully unwrapped`}
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            className="object-cover"
          />
        </div>
        <h2 className="mt-6 font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
          The Real Thing
        </h2>
        <p className="mt-2 max-w-xl text-sm text-black/70 sm:text-base">
          Hand-finished satin, ready to hang and spin at your celebration.
        </p>
        <div className="mt-8 w-full max-w-sm text-left">
          <AddToCartForm product={product} />
        </div>
      </div>
    </section>
  );
});

export default BaptismRevealSection;
