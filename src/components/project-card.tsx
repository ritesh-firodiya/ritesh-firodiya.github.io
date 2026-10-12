import Link from "next/link";
import { StatePill, SurfaceTags } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import type { Product } from "@/lib/products";
import { evidenceLine } from "@/lib/evidence";

/** One project: a tall picture, then its name, its state, whether it is an app
 *  or a site, and what it left behind. The tagline is on the project page.
 *  Every card is the same size. */
export function ProjectCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.slug}/`} className="card flex flex-col overflow-hidden">
      <CardPicture p={p} />
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-body font-bold leading-tight">{p.name}</h3>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <StatePill p={p} />
          <SurfaceTags p={p} />
        </div>
        <p className="mt-2 font-mono text-2xs text-ink-3">{evidenceLine(p)}</p>
      </div>
    </Link>
  );
}
