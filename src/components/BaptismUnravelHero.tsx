"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { smoothstep } from "@/lib/three-easing";
import BaptismRevealSection from "@/components/BaptismRevealSection";
import type { Product } from "@/data/products";

const BaptismHeroCanvas = dynamic(
  () => import("@/components/three/BaptismHeroCanvas"),
  { ssr: false }
);

export default function BaptismUnravelHero({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const update = () => {
      const section = sectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const traveled = -rect.top;
        progress.current =
          scrollable > 0
            ? Math.min(1, Math.max(0, traveled / scrollable))
            : 0;
      }
      const reveal = revealRef.current;
      if (reveal) {
        // Fade/rise the photo handoff in as the unravel + money-burst
        // timeline settles (burst finishes at p=0.85; finale dolly/settle
        // runs through p=1), so it reads as "the 3D model becomes the real
        // thing" rather than popping in abruptly.
        const settle = smoothstep(0.92, 1, progress.current);
        reveal.style.opacity = String(settle);
        reveal.style.transform = `translateY(${(1 - settle) * 24}px)`;
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  // Scroll-driven 3D experience is decorative — real product photos and
  // purchase flow live in the standard PDP layout right below this section.
  if (reducedMotion) {
    return (
      <>
        <section className="relative bg-[var(--color-kraft)]">
          <div className="relative mx-auto aspect-square max-w-2xl">
            <Image
              src="/products/baptism.jpg"
              alt="Spinata BAPTISM, wrapped and ready to spin"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-contain"
              priority
            />
          </div>
          <p className="px-4 pb-6 text-center text-xs text-black/50">
            Illustrative preview — bills shown elsewhere on this page are
            stylized props, not real currency.
          </p>
        </section>
        <BaptismRevealSection product={product} reducedMotion />
      </>
    );
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-[320vh] bg-[var(--color-kraft)]"
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          <div className="absolute inset-0">
            <BaptismHeroCanvas progress={progress} />
          </div>

          <div
            className="absolute inset-x-0 top-0 z-0 h-1/3 bg-gradient-to-b from-[var(--color-kraft)] via-[var(--color-kraft)]/40 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-1 flex-col items-center justify-end px-4 pb-10 text-center sm:px-6">
            <span className="rounded-full border border-[var(--color-midway)] bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[var(--color-midway)]">
              Bolo Tradition
            </span>
            <h2 className="mt-4 font-display text-3xl text-[var(--color-midway)] sm:text-5xl">
              Scroll to Unwrap
            </h2>
            <p className="mt-3 max-w-xl text-sm text-black/70 sm:text-base">
              The Spinata BAPTISM unwraps as you scroll, showering the room
              in bills the way the Bolo tradition does. Bills shown here are
              stylized props, not real currency.
            </p>
          </div>
        </div>
      </section>
      <BaptismRevealSection ref={revealRef} product={product} />
    </>
  );
}
