import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import PinataIcon from "@/components/PinataIcon";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-midway)]"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: product.swatch }}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <PinataIcon
              className="h-full w-full opacity-90"
              color="#ffffff33"
              glow={product.isAnimatedGlow}
            />
          </div>
        )}
        {product.isAnimatedGlow && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-ink)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-gold-bright)]">
            Glow
          </span>
        )}
        {product.customizable && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-gold)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
            Custom
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold leading-snug text-[var(--color-ink)]">
          {product.name}
        </h3>
        <p className="mt-auto text-sm font-bold text-[var(--color-midway)]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
