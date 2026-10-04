import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, ExternalLink, Play } from "lucide-react";
import { StatePill } from "@/components/ui";
import { products, bySlug, mediaFor, type Platform } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  return p ? { title: `Get ${p.name}`, robots: { index: false, follow: true } } : {};
}

const NAME: Record<string, string> = { web: "Web", ios: "iOS", android: "Android" };

/**
 * The short link. One per app, for a bio, a QR code or a forwarded message, so
 * the link never has to be reprinted when a platform opens.
 *
 * It is a PAGE and not a bare redirect: a wrong platform guess must be
 * recoverable in one tap, a platform with nothing installable has to say why,
 * and a desktop visitor needs something other than a store they cannot install
 * from. No site header — someone who scanned a code came for one app.
 */
export default async function GoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const entries = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const open = entries.filter(([, v]) => v.state === "live" || v.state === "beta");
  const shut = entries.filter(([, v]) => v.state !== "live" && v.state !== "beta");
  const icon = mediaFor(p.slug).icon;

  return (
    <main id="main" className="grid min-h-dvh flex-1 place-items-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" width={80} height={80} className="mx-auto h-20 w-20 rounded-xl" />
          ) : (
            <span className="slot mx-auto grid h-20 w-20 place-items-center rounded-xl font-mono text-xs text-ink-3">Icon</span>
          )}
          <h1 className="mt-5 text-h2 font-bold">{p.name}</h1>
          <p className="mt-1 text-base text-ink-2">{p.tagline}</p>
          <p className="mt-3">
            <StatePill p={p} />
          </p>

          {open.length > 0 ? (
            <div className="mt-6 grid gap-2.5">
              {open.map(([k, v], i) => (
                <a key={k} href={v.url!} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
                  {k === "ios" ? <Apple size={16} aria-hidden /> : k === "android" ? <Play size={16} aria-hidden /> : <ExternalLink size={16} aria-hidden />}
                  {v.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-base text-ink-2">{p.unreleasedNote ?? "Nothing is installable today."}</p>
          )}

          {shut.length > 0 && (
            <div className="mt-6 border-t border-line pt-5 text-left">
              <p className="eyebrow">Not available</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {shut.map(([k, v]) => (
                  <li key={k} className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{NAME[k]}</span>
                    <span className="text-right text-ink-3">{v.note || v.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link href={`/products/${p.slug}/`} className="btn btn-quiet mt-6 w-full">Read about the app</Link>
          <p className="mt-5 text-xs text-ink-3">This page sets no cookies and records nothing.</p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/#work" className="text-link text-sm">All work</Link>
        </p>
      </div>
    </main>
  );
}
