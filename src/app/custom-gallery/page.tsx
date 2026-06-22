import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import CustomBuildGallery, { type PastBuild } from "@/components/CustomBuildGallery";

// Real photos of completed customer builds go here once we have them.
// Do not fabricate entries — CustomBuildGallery renders an honest empty
// state when this is empty.
const PAST_BUILDS: PastBuild[] = [];

export const metadata: Metadata = {
  title: "Custom Builds | Spinner Piñata",
  description: "Build your own Spinner Piñata — pick your colors and theme to get started.",
  alternates: { canonical: "/custom-gallery" },
};

export default function CustomGalleryPage() {
  const customBuilds = getProductsByCategory("custom");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Custom Builds
      </h1>
      <p className="mt-3 max-w-2xl text-black/70">
        Every custom build starts with your ribbon color and a photo of the
        theme or character you want. Here&apos;s where it starts — browse the
        base builds below, then tell us what to make.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-2xl">
        {customBuilds.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <CustomBuildGallery builds={PAST_BUILDS} />

      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[var(--color-midway)]">
          Ready to build yours?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-black/70">
          Add a custom build to your cart and include your ribbon color and
          theme details, or reach out directly through{" "}
          <Link href="/contact-us" className="underline">
            Contact Us
          </Link>{" "}
          before ordering.
        </p>
      </div>
    </div>
  );
}
