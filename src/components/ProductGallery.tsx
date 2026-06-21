"use client";

import Image from "next/image";
import { useState } from "react";
import PinataIcon from "@/components/PinataIcon";

export default function ProductGallery({
  images,
  alt,
  swatch,
  isAnimatedGlow,
}: {
  images: string[];
  alt: string;
  swatch: string;
  isAnimatedGlow?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => active && setZoomed(true)}
        aria-label={active ? `Zoom in on ${alt}` : alt}
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-midway)]"
        style={{ backgroundColor: swatch }}
      >
        {active ? (
          <Image
            src={active}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={!isAnimatedGlow}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-12">
            <PinataIcon className="h-full w-full" color="#ffffff33" glow={isAnimatedGlow} />
          </div>
        )}
      </button>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === activeIndex}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex
                  ? "border-[var(--color-midway)]"
                  : "border-transparent hover:border-[var(--color-midway)]/40"
              }`}
              style={{ backgroundColor: swatch }}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed && active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close zoomed image"
            className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="relative h-full max-h-[90vh] w-full max-w-3xl">
            <Image src={active} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
