import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { Verdict } from "@/components/design-bits";
import designsRaw from "@/data/designs.json";
import { sets, audit } from "@/lib/design";
import { bySlug, mediaMissing } from "@/lib/products";

export const metadata: Metadata = {
  title: "The screens",
  description:
    "Every design set in the estate, live — the real wireframes the apps were built from, served byte-identical from the repos they were drawn in.",
};

type Screen = { path: string; title: string; surface: string; area?: string };
type Set = { indexes: { path: string; title: string; surface: string }[]; screens: Screen[] };

const designs = designsRaw as unknown as {
  generatedOn: string;
  sets: Record<string, Set>;
};

/**
 * The gallery shown is each set's OWN index.html, written in the app repo and
 * served unaltered — not a second grid invented here. A grid written on this
 * side is a different document, and it drifts the moment a screen is added.
 */
const slugToSet: Record<string, string> = {
  "dwarseva-property": "property-app",
};

export default function GalleryPage() {
  const entries = Object.entries(designs.sets);

  return (
    <>
      <SiteHeader active="/design" />
      <main>
        <section className="px-gutter pt-section">
          <div className="mx-auto max-w-page">
            <Link href="/design" className="link-u text-small text-ink-2">← Design</Link>
            <Label>The screens · synced {designs.generatedOn}</Label>
            <h1 className="mt-3 max-w-measure font-display text-d1 font-semibold">
              The real wireframes, not screenshots of them.
            </h1>
            <p className="mt-5 max-w-prose text-lead text-ink-2">
              Each set below is served byte-identical from the repo it was drawn in, including its
              own gallery page and its own breadcrumb strip. They are openable in a browser with no
              toolchain, which was the point of drawing them in plain HTML in the first place.
            </p>
          </div>
        </section>

        <section className="px-gutter py-section">
          <div className="mx-auto max-w-page space-y-8">
            {entries.map(([slug, set]) => {
              const product = bySlug(slug);
              const auditSet = sets.find((s) => s.name === (slugToSet[slug] ?? slug));
              const areas = [...new Set(set.screens.map((s) => s.area).filter(Boolean))] as string[];
              const surfaces = [...new Set(set.indexes.map((i) => i.surface))];
              const isRoot = (path: string) => path.split("/").length === 5;
              const roots = set.indexes.filter((i) => isRoot(i.path));
              const flows = set.indexes.filter((i) => !isRoot(i.path));

              return (
                <article key={slug} className="rounded-card border border-line bg-surface p-6 shadow-lift">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-display text-h2 font-semibold">
                      {product?.name ?? auditSet?.product ?? slug}
                    </h2>
                    {auditSet && <Verdict verdict={auditSet.verdict} />}
                  </div>

                  <p className="mt-2 font-mono text-label uppercase tracking-label text-ink-3">
                    {auditSet ? `${auditSet.screens} screens` : `${set.screens.length} screens`}
                    {surfaces.length > 0 && ` · ${surfaces.join(", ")}`}
                    {auditSet?.hasConfig ? " · tokenised" : " · no token layer"}
                  </p>

                  {areas.length > 0 && (
                    <p className="mt-3 max-w-prose text-small text-ink-2">
                      Flows: {areas.join(" · ")}
                    </p>
                  )}

                  {/* A set's root index gets the clean product URL that
                      sync-designs.mjs publishes. Its per-flow indexes exist
                      only under /designs/ — linking them all to the root, as
                      the first version did, gave Aakalan nine buttons that
                      went to the same page. */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {roots.map((idx) => (
                      <a
                        key={idx.path}
                        href={`/products/${slug}/designs/${roots.length > 1 ? idx.surface + "/" : ""}`}
                        className="inline-flex items-center rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent"
                      >
                        {roots.length > 1 ? `${idx.surface} gallery` : "Open the gallery"} →
                      </a>
                    ))}
                  </div>

                  {flows.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                      {flows.map((idx) => (
                        <a
                          key={idx.path}
                          /* Directory URL, not the file: both serve and GitHub
                             Pages 301 a trailing /index.html to the folder. */
                          href={idx.path.replace(/index\.html$/, "")}
                          className="link-u text-small text-ink-2"
                        >
                          {idx.title.replace(/^.*— /, "")}
                        </a>
                      ))}
                    </div>
                  )}

                  {product && (
                    <Link href={`/products/${slug}`} className="link-u mt-4 inline-block text-small">
                      What it is, and how it is paid for →
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {mediaMissing.length > 0 && (
          <section className="px-gutter pb-section">
            <div className="mx-auto max-w-page">
              <div className="rounded-card border border-line bg-paper-2 p-6">
                <Label>Stated rather than hidden</Label>
                <h2 className="mt-3 font-display text-h2 font-semibold">
                  {mediaMissing.length} products have no screenshots here yet.
                </h2>
                <p className="mt-3 max-w-prose text-small text-ink-2">
                  Rule 08: a missing asset must be visibly missing. A slot that never got its image
                  should be obvious at review instead of shipping as a grey box nobody questions —
                  so the gap is printed, with the reason.
                </p>
                <ul className="mt-4 space-y-2">
                  {mediaMissing.map((m) => (
                    <li key={m.slug} className="text-small text-ink-2">
                      <b className="text-ink">{bySlug(m.slug)?.name ?? m.slug}</b> — {m.why}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page text-small text-ink-3">
            Compliance for every set, including the ones not shown above, is on{" "}
            <Link href="/design/drift" className="link-u">the drift page</Link> — audited{" "}
            {audit.generatedAt}.
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
