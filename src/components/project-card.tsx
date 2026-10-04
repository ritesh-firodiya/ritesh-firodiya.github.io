import Link from "next/link";
import { StatePill, SurfaceTags } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import type { Product } from "@/lib/products";
import { evidenceLine } from "@/lib/evidence";

/** One project: its picture, its state, whether it is an app or a site, and
 *  what it left behind. */
export function ProjectCard({ p, lead = false }: { p: Product; lead?: boolean }) {
  return (
    <Link href={`/products/${p.slug}/`} className="card flex flex-col overflow-hidden">
      <CardPicture p={p} tall={lead} />
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatePill p={p} />
          <SurfaceTags p={p} />
        </div>
        <h3 className="mt-2 text-body font-bold">{p.name}</h3>
        <p className="mt-0.5 text-sm text-ink-2">{p.tagline}</p>
        <p className="mt-auto pt-2.5 font-mono text-2xs text-ink-3">{evidenceLine(p)}</p>
      </div>
    </Link>
  );
}
