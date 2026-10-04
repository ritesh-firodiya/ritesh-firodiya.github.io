import Link from "next/link";
import { ChevronsUpDown, Workflow } from "lucide-react";
import { type Product, bySlug, galleriesFor, mediaFor } from "@/lib/products";
import { WIKI_TYPES, wikiHref, wikiOf, wikiSlugs, type WikiType } from "@/lib/wiki";

/** The left rail every wiki page shares: which project, which kind of page. */
export function WikiRail({ p, on }: { p: Product; on?: WikiType }) {
  const wiki = wikiOf(p.slug)!;
  const icon = mediaFor(p.slug).icon;
  const galleries = galleriesFor(p.slug);
  const others = wikiSlugs.map(bySlug).filter((x): x is Product => Boolean(x) && x!.slug !== p.slug);

  return (
    <aside className="order-last lg:sticky lg:top-20 lg:order-first lg:self-start">
      <p className="eyebrow">Project</p>
      {/* A native disclosure, so moving between wikis needs no script. */}
      <details className="card mt-2">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <span className="flex items-center gap-3 font-semibold">
            {icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" width={28} height={28} className="h-7 w-7 rounded-sm" />
            )}
            {p.name}
          </span>
          <ChevronsUpDown size={16} className="text-ink-3" aria-hidden />
        </summary>
        <ul className="border-t border-line py-1 text-base">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={wikiHref(o.slug)} className="flex items-center justify-between px-4 py-2 text-ink-2 hover:bg-muted hover:text-ink">
                {o.name} <span className="font-mono text-xs text-ink-3">{wikiOf(o.slug)!.total}</span>
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <p className="eyebrow mt-7">Page types</p>
      <nav className="mt-2 flex flex-col text-base" aria-label="Page types">
        <RailLink href={wikiHref(p.slug)} label="All pages" n={wiki.total} on={!on} />
        {WIKI_TYPES.filter((t) => wiki.byType[t.type]).map((t) => (
          <RailLink key={t.type} href={`${wikiHref(p.slug)}#${t.type}`} label={t.label} n={wiki.byType[t.type]!} on={on === t.type} />
        ))}
      </nav>

      {galleries.length > 0 && (
        <a href={galleries[0].href} className="btn btn-quiet mt-7 w-full">
          <Workflow size={16} aria-hidden /> Open the design set
        </a>
      )}
    </aside>
  );
}

function RailLink({ href, label, n, on }: { href: string; label: string; n: number; on: boolean }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={`flex items-center justify-between rounded-sm px-3 py-2 ${on ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-2 hover:text-ink"}`}
    >
      {label} <span className="font-mono text-xs text-ink-3">{n}</span>
    </Link>
  );
}
