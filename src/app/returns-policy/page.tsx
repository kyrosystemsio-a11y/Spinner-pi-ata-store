import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Guarantee | Spinner Piñata",
  description: "Our returns, exchanges, and satisfaction guarantee for Spinner Piñata orders.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[var(--color-midway)] sm:text-4xl">
        Returns &amp; Guarantee
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-black/75">
        <p>
          Every Spinner Piñata is hand-built, and we want you happy with
          yours. If something arrives damaged or isn&apos;t what you
          ordered, contact us within 7 days of delivery and we&apos;ll send
          a replacement or refund — no return shipping required.
        </p>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">
            Ready-made colors, designs &amp; merch
          </p>
          <p className="mt-1">
            Unused items in original condition can be returned within 14
            days of delivery for a full refund. Reach out through{" "}
            <Link href="/contact-us" className="underline">
              Contact Us
            </Link>{" "}
            to start a return.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">
            Custom builds
          </p>
          <p className="mt-1">
            Because custom builds are made to order with your chosen ribbon
            color and theme, they&apos;re final sale once production
            starts. We&apos;ll always work with you on damage, defects, or
            mistakes on our end.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">
            Our guarantee
          </p>
          <p className="mt-1">
            If your Spinner Piñata doesn&apos;t spin, pull, or hold up the
            way it should, tell us. We stand behind every build we ship.
          </p>
        </div>
      </div>
    </div>
  );
}
