import Image from "next/image";

export interface PastBuild {
  src: string;
  caption: string;
}

export default function CustomBuildGallery({ builds }: { builds: PastBuild[] }) {
  if (builds.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-black/15 bg-white/50 p-8 text-center">
        <h2 className="font-semibold text-[var(--color-midway)]">
          Past Builds Gallery — Coming Soon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black/60">
          We&apos;re collecting real photos from completed custom builds.
          Check back soon to see what other customers have created.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl text-[var(--color-midway)]">
        Past Builds
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {builds.map((build) => (
          <figure key={build.src} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="relative aspect-square w-full">
              <Image
                src={build.src}
                alt={build.caption}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-3 text-sm text-black/70">
              {build.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
