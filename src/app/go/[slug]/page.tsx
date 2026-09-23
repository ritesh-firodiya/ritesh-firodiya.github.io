import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Label } from "@/components/pills";
import { products, bySlug, type Platform } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  return p ? { title: `Get ${p.name}`, robots: { index: false, follow: true } } : {};
}

/**
 * The short link. One per app, for a bio, a QR code or a forwarded message, so
 * the link never has to be reprinted when a platform opens.
 *
 * It is a PAGE and not a bare redirect for three reasons: a wrong platform
 * guess must be recoverable in one tap, a platform with nothing installable has
 * to say why, and a desktop visitor needs something other than a store they
 * cannot install from. Platform detection is deliberately left to the client at
 * runtime — this file is prerendered, so it must render usefully for everyone.
 */
export default async function GoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const entries = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const open = entries.filter(([, v]) => v.state === "live" || v.state === "beta");
  const shut = entries.filter(([, v]) => v.state !== "live" && v.state !== "beta");

  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-gutter py-section">
      <div className="rounded-card border border-line bg-surface p-8 text-center shadow-frame">
        <span className="shot-ph mx-auto block h-[88px] w-[88px] rounded-card font-mono text-xs2 text-ink-3">Icon</span>
        <h1 className="mt-6 font-display text-h2 font-semibold">{p.name}</h1>
        <p className="mt-2 text-small text-ink-2">{p.tagline}</p>

        {open.length > 0 ? (
          <div className="mt-6 grid gap-2.5">
              {open.map(([k, v]) => (
                <Link key={k} href={v.url ?? "#"} className="flex items-center justify-center gap-2.5 rounded-pill bg-ink px-5 py-3 font-medium text-ink-inverse transition hover:bg-brand-500">
                  {k === "ios" ? "App Store / TestFlight" : k === "android" ? "Google Play" : "Open the site"}
                </Link>
              ))}
          </div>
        ) : (
          <p className="mt-6 max-w-prose text-small text-ink-2">
            {p.unreleasedNote ?? "Nothing is installable today."}
          </p>
        )}

        {shut.length > 0 && (
          <div className="mt-6 border-t border-line pt-5 text-left">
            <Label>Not available yet</Label>
            <ul className="mt-3 space-y-2 text-small text-ink-2">
              {shut.map(([k, v]) => (
                <li key={k} className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{k === "ios" ? "iOS" : k === "android" ? "Android" : "Web"}</span>
                  <span className="text-right text-xs2 text-ink-3">{v.note || v.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 grid gap-2.5">
          <Link href={`/products/${p.slug}/`} className="flex items-center justify-center gap-2 rounded-pill border border-line-strong px-5 py-2.5 text-small font-medium transition hover:border-brand-500">
            Read about the app
          </Link>
          {open.length === 0 && (
            <Link href="/support" className="flex items-center justify-center gap-2 rounded-pill border border-line-strong px-5 py-2.5 text-small font-medium transition hover:border-brand-500">
              Tell me when it opens
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs2 text-ink-3">This page sets no cookies and records nothing.</p>
      </div>

      <Link href="/products" className="link-u mx-auto mt-8 inline-flex items-center gap-1.5 text-small text-ink-2 hover:text-ink">
        ← All products
      </Link>
    </main>
  );
}
