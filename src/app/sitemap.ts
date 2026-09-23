import type { MetadataRoute } from "next";

// output: "export" prerenders every route; a metadata route has to declare
// itself static or the build refuses to collect it.
export const dynamic = "force-static";

import { products } from "@/lib/products";
import { CASE_STUDIES } from "@/lib/case-studies";

const BASE = "https://ritesh-firodiya.github.io";

/**
 * Generated, never hand-listed. A sitemap typed by hand goes stale the first
 * time a route is added — which is the same failure mode this whole site was
 * rebuilt to remove.
 *
 * /go/[slug] is deliberately absent: those are redirect targets for QR codes
 * and bios, not pages anyone should land on from search. They also carry
 * `robots: noindex`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1.0, freq: "monthly" as const },
    { path: "/work", priority: 0.9, freq: "monthly" as const },
    { path: "/products", priority: 0.9, freq: "weekly" as const },
    { path: "/about", priority: 0.8, freq: "monthly" as const },
    { path: "/contact", priority: 0.7, freq: "yearly" as const },
    { path: "/hire", priority: 0.8, freq: "monthly" as const },
    { path: "/resume", priority: 0.8, freq: "monthly" as const },
    { path: "/legal", priority: 0.3, freq: "yearly" as const },
    { path: "/support", priority: 0.5, freq: "yearly" as const },
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((r) => ({
      url: `${BASE}${r.path}/`.replace(/\/\/$/, "/"),
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.notBuilt ? 0.4 : 0.8,
    })),
    ...CASE_STUDIES.map((c) => ({
      url: `${BASE}/work/${c.slug}/`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
