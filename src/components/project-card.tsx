import Link from "next/link";
import { StatePill } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import type { Product } from "@/lib/products";
import { evidenceLine } from "@/lib/evidence";

/** One project as a card: its picture, how far along it is, what it is. The
 *  same card on the home page and on Work, so a project looks like itself
 *  wherever it appears. */
export function ProjectCard({ p, detail = false }: { p: Product; detail?: boolean }) {
  return (
    <Link href={`/products/${p.slug}/`} className="card overflow-hidden">
      <CardPicture p={p} />
      <div className="p-5">
        <StatePill p={p} />
        <h3 className="mt-3 text-h3 font-bold">{p.name}</h3>
        <p className="mt-1 text-base text-ink-2">{p.tagline}</p>
        {detail && <p className="mt-2 text-sm text-ink-3">{p.blurb}</p>}
        <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-ink-3">{evidenceLine(p)}</p>
      </div>
    </Link>
  );
}
