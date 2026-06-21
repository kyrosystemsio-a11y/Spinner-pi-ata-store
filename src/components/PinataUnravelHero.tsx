"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";

const PinataHeroCanvas = dynamic(
  () => import("@/components/three/PinataHeroCanvas"),
  { ssr: false }
);

const MARQUEE_ITEMS = [
  "HANDMADE",
  "REUSABLE",
  "MADE TO ORDER",
  "PULL THE RIBBONS",
  "SHIPS NATIONWIDE",
];

export default function PinataUnravelHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
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
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[260vh] bg-midway-gradient text-white"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="absolute inset-0">
          <PinataHeroCanvas progress={progress} />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <span className="animate-rise rounded-full border border-[var(--color-gold)] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[var(--color-gold-bright)]">
            Patent Pending Spin Design
          </span>
          <h1 className="animate-rise mt-6 font-display text-4xl leading-tight sm:text-6xl md:text-7xl">
            SPIN. PULL.
            <br />
            REPEAT.
          </h1>
          <p className="animate-rise mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Handcrafted spin piñatas built to be pulled, spun, and reused
            party after party — keep scrolling and watch it unravel.
          </p>
          <div className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="cursor-pointer rounded-full bg-[var(--color-gold)] px-7 py-4 font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)]"
            >
              Shop All Piñatas
            </Link>
            <Link
              href="/shop?category=custom"
              className="cursor-pointer rounded-full border-2 border-white/70 px-7 py-4 font-bold transition-colors hover:bg-white/10"
            >
              Build a Custom Piñata
            </Link>
          </div>
        </div>

        <div className="caution-stripe relative z-10 flex h-12 items-center overflow-hidden">
          <div className="animate-marquee flex shrink-0 gap-8 whitespace-nowrap px-4 text-sm font-bold uppercase tracking-widest text-[var(--color-ink)]">
            {Array.from({ length: 3 }).flatMap((_, set) =>
              MARQUEE_ITEMS.map((item, i) => (
                <span key={`${set}-${i}`}>{item} •</span>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
