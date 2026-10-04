import { type Product, galleriesFor, screensFor, withheldFor } from "@/lib/products";
import { wikiOf } from "@/lib/wiki";

/** What a product has to show, in one line: the last line of its card. */
export function evidenceLine(p: Product): string {
  const screens = galleriesFor(p.slug).length ? screensFor(p.slug).length : 0;
  const wiki = wikiOf(p.slug)?.total ?? 0;
  const withheld = withheldFor(p.slug).length > 0 && screens === 0;
  const parts = [
    screens ? `${screens} screens` : withheld ? "Design set withheld" : null,
    wiki ? `${wiki} wiki pages` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No design set yet";
}
