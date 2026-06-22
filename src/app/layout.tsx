import type { Metadata } from "next";
import { Bungee, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SITE_URL } from "@/lib/site";
import { SOCIAL_LINKS } from "@/data/social";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebVitals from "@/components/WebVitals";

const bungee = Bungee({
  variable: "--font-bungee",
  weight: "400",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const SITE_TITLE = "Spinner Piñata | Handmade Spin & Pull Piñatas";
const SITE_DESCRIPTION =
  "Reusable, handcrafted spin piñatas for birthdays, baptisms, and every fiesta. Pick your colors, pull the ribbons, and watch it spin.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Spinner Piñata",
    images: ["/icon.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sameAs = SOCIAL_LINKS.filter((link) => link.href).map((link) => link.href);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spinner Piñata",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <html
      lang="en"
      className={`${bungee.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-kraft-texture text-[var(--color-ink)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WebVitals />
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
