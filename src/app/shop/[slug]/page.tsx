import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PRODUCTS,
  getProductBySlug,
  CATEGORY_LABELS,
  getProductGallery,
  getAverageRating,
  getRelatedProducts,
} from "@/data/products";
import AddToCartForm from "@/components/AddToCartForm";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import ProductCard from "@/components/ProductCard";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Spinner Piñata`,
    description: product.description,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const gallery = getProductGallery(product);
  const averageRating = getAverageRating(product);
  const reviews = product.reviews ?? [];
  const relatedProducts = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery.map((src) => `${SITE_URL}${src}`),
    url: `${SITE_URL}/shop/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/shop/${product.slug}`,
    },
    ...(averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-black/60">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:underline"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          images={gallery}
          alt={product.name}
          swatch={product.swatch}
          isAnimatedGlow={product.isAnimatedGlow}
        />

        <div className="flex flex-col gap-5">
          <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-[var(--color-ink)]">
            ${product.price.toFixed(2)}
          </p>
          <p className="leading-relaxed text-black/75">
            {product.description}
          </p>

          <AddToCartForm product={product} />

          <div className="mt-2 flex flex-col gap-3 rounded-xl bg-white p-5 text-sm text-black/75 shadow-sm">
            <p>
              <span className="font-semibold text-[var(--color-ink)]">Shipping: </span>
              Ships nationwide, hand-packed in 2–3 business days
              {product.customizable ? " (allow 2–3 extra days for custom builds)" : ""}.
            </p>
            <p>
              <span className="font-semibold text-[var(--color-ink)]">Returns: </span>
              {product.customizable
                ? "Custom builds are made to order and final sale."
                : "Unused items can be returned within 14 days."}{" "}
              See our{" "}
              <Link href="/returns-policy" className="underline">
                Returns &amp; Guarantee policy
              </Link>{" "}
              for details.
            </p>
            <p>
              <span className="font-semibold text-[var(--color-ink)]">Guarantee: </span>
              If it doesn&apos;t spin, pull, or hold up the way it should, tell us — we
              stand behind every build we ship.
            </p>
          </div>
        </div>
      </div>

      <ProductReviews reviews={reviews} averageRating={averageRating} />

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-black/10 pt-10">
          <h2 className="font-display text-2xl text-[var(--color-midway)]">
            You Might Also Like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
