import type { Review } from "@/data/products";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-[var(--color-gold)]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill={i < Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6L1.3 7.7l6.1-.6L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductReviews({
  reviews,
  averageRating,
}: {
  reviews: Review[];
  averageRating: number | null;
}) {
  return (
    <section className="mt-16 border-t border-black/10 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-[var(--color-midway)]">
          Customer Reviews
        </h2>
        {averageRating !== null && (
          <div className="flex items-center gap-2">
            <Stars rating={averageRating} />
            <span className="text-sm font-semibold text-black/70">
              {averageRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-6 text-sm text-black/70 shadow-sm">
          No reviews yet — be the first to spin this one and tell us what you
          think. Reach out through{" "}
          <a href="/contact-us" className="underline">
            Contact Us
          </a>{" "}
          and we&apos;ll feature your review here.
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {reviews.map((review, i) => (
            <li key={i} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[var(--color-ink)]">{review.author}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-black/75">{review.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
