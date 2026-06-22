import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/shop", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/custom-gallery", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/our-story", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/instructions", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/shipping", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/contact-us", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/returns-policy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries = PRODUCTS.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
