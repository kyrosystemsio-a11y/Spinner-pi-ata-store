import Link from "next/link";
import { CATEGORY_LABELS, type Category } from "@/data/products";

const CATEGORIES: (Category | "all")[] = [
  "all",
  "custom",
  "colors",
  "design",
  "halloween",
  "glow",
  "baptism",
  "influencers",
  "merch",
];

export default function CategoryFilter({
  active,
}: {
  active: Category | "all";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const label = category === "all" ? "All Products" : CATEGORY_LABELS[category];
        const isActive = category === active;
        const href = category === "all" ? "/shop" : `/shop?category=${category}`;
        return (
          <Link
            key={category}
            href={href}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "border-[var(--color-midway)] bg-[var(--color-midway)] text-white"
                : "border-black/15 text-[var(--color-ink)] hover:border-[var(--color-midway)] hover:text-[var(--color-midway)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
