import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArchitectureGrowth } from "@/components/architecture-growth";
import { ArchitectureMap } from "@/components/architecture-map";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { architectureHref, architectureOf, architectureSlugs, type Basis, type Sourced } from "@/lib/architecture";
import { bySlug } from "@/lib/products";

const BASIS: Record<Basis, { label: string; tone: string }> = {
  measured: { label: "Measured", tone: "bg-success-bg text-success-fg" },
  stated: { label: "Stated", tone: "bg-muted text-ink-3" },
  code: { label: "In code", tone: "bg-muted text-ink-3" },
  assumed: { label: "Assumed", tone: "bg-muted text-ink-2" },
  unknown: { label: "Not known", tone: "bg-muted text-ink-2" },
};
const TH = "whitespace-nowrap border-b border-line px-3 py-2 text-left text-xs font-semibold text-ink-3";
const TD = "border-b border-line px-3 py-2 align-top";

function BasisCell({ value }: { value?: Sourced }) {
  const basis = value?.basis && BASIS[value.basis];
  return (
    <td className={TD}>
      {basis && <span className={`inline-block whitespace-nowrap rounded-full px-2 text-xs font-semibold ${basis.tone}`}>{basis.label}</span>}
      {value?.source && <span className="mt-0.5 block text-xs text-ink-3">{value.source}</span>}
    </td>
  );
}

function Table({ headers, children }: { headers?: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-sm">
        {headers && <thead><tr>{headers.map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Heading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-2 mt-8 flex flex-wrap items-baseline gap-x-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {note && <p className="text-sm text-ink-3">{note}</p>}
    </div>
  );
}

export function generateStaticParams() {
  return architectureSlugs.filter(bySlug).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p || !architectureOf(slug)) return {};
  return {
    title: `${p.name} architecture`,
    description: `How ${p.name} fits together, what it costs and what happens when a part fails.`,
    alternates: { canonical: architectureHref(slug) },
  };
}

export default async function ArchitecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  const a = architectureOf(slug);
  if (!p || !a) notFound();
  const failing = a.parts.filter((x) => x.ifDown);

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-10 pt-6">
        <p className="text-sm text-ink-3">
          <Link href="/#work" className="hover:text-ink">Work</Link> /{" "}
          <Link href={`/products/${slug}/`} className="hover:text-ink">{p.name}</Link> / Architecture
        </p>
        <h1 className="page-title mt-2">{p.name} architecture</h1>
        {a.summary && <p className="mt-2 max-w-3xl text-ink-3">{a.summary}</p>}
        {a.verified && <p className="mt-1 font-mono text-xs text-ink-3">last verified {a.verified}</p>}
        {a.headlines.length > 0 && (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {a.headlines.map((h) => (
              <div key={h.label} className="rounded-lg border border-line bg-surface p-3.5">
                <div className="text-xs text-ink-3">{h.label}</div>
                <div className="mt-1 text-xl font-semibold leading-tight">{h.value}</div>
                {h.note && <div className="mt-1 text-xs text-ink-3">{h.note}</div>}
              </div>
            ))}
          </div>
        )}

        <Heading title="How it fits together" note={a.flows.length > 0 ? "Pick something a user does to see its path and what it costs." : undefined} />
        <ArchitectureMap architecture={a} />

        <Heading title="Cost" note="Every number says where it came from." />
        <Table headers={["Service", "Pays for", "Today", "Grows with", "Basis"]}>
          {a.parts.filter((x) => x.cost).map((x) => (
            <tr key={x.id}>
              <td className={`${TD} font-semibold`}>{x.label}</td>
              <td className={TD}>{x.does}</td>
              <td className={TD}>{x.cost?.today}</td>
              <td className={TD}>{x.cost?.grows}</td>
              <BasisCell value={x.cost} />
            </tr>
          ))}
        </Table>

        {a.growth && (
          <>
            <Heading title="What if it grows?" note={a.growth.summary} />
            <ArchitectureGrowth growth={a.growth} />
          </>
        )}

        {failing.length > 0 && (
          <>
            <Heading title="What breaks when something fails" />
            <Table headers={["If this fails", "The user sees", "Their data", "Basis"]}>
              {failing.map((x) => (
                <tr key={x.id}>
                  <td className={`${TD} font-semibold`}>{x.label}</td>
                  <td className={TD}>{x.ifDown?.user}</td>
                  <td className={TD}>{x.ifDown?.data}</td>
                  <BasisCell value={x.ifDown} />
                </tr>
              ))}
            </Table>
          </>
        )}

        <div className="grid gap-x-4 lg:grid-cols-2">
          {a.data.length > 0 && (
            <div>
              <Heading title="Where the data goes" />
              <Table>
                {a.data.map((d) => <tr key={d.what}><td className={`${TD} font-semibold`}>{d.what}</td><td className={TD}>{d.where}</td></tr>)}
              </Table>
            </div>
          )}
          {a.unknowns.length > 0 && (
            <div>
              <Heading title="What we do not know yet" />
              <ul className="list-disc space-y-1.5 rounded-lg border border-line bg-surface p-3 pl-7 text-sm">
                {a.unknowns.map((u) => <li key={u}>{u}</li>)}
              </ul>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
