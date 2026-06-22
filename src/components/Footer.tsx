import Link from "next/link";
import { SOCIAL_LINKS } from "@/data/social";

const FOOTER_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/custom-gallery", label: "Custom Builds" },
  { href: "/our-story", label: "Our Story" },
  { href: "/instructions", label: "How It Works" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/returns-policy", label: "Returns & Guarantee" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

const activeSocialLinks = SOCIAL_LINKS.filter((link) => link.href);

export default function Footer() {
  return (
    <footer className="bg-[var(--color-midway-deep)] text-white">
      <div className="gold-divider w-full" />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl text-[var(--color-gold-bright)]">
            SPINNER PIÑATA
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Handmade spin-and-pull piñatas built to be reused, not just
            smashed once. Pick your colors, pull the ribbons, and let the
            tornado of confetti fly.
          </p>
          {activeSocialLinks.length > 0 && (
            <div className="mt-5 flex gap-3">
              {activeSocialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-6">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-gold-bright)]">
              Explore
            </p>
            <ul className="flex flex-col gap-2 text-sm text-white/80">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50 sm:px-6">
        © {new Date().getFullYear()} Spinner Piñata. All rights reserved.
      </div>
    </footer>
  );
}
