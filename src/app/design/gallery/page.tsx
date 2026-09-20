import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatePill, Label } from "@/components/pills";
import { mediaFor, mediaMissing, mediaGeneratedOn } from "@/lib/products";

export const metadata: Metadata = {
  title: "The screens",
  description: "Selected screens per product with the reasoning that produced each one — not a dump of all 264. Paywall internals and unreleased features are not published.",
};

const SETS = [
  {
    slug: "imposter",
    name: "Imposter", state: "live" as const, badge: "Canonical set",
    intro: "The reference implementation — the only set that satisfies every rule at once, and the source of the token architecture the others are measured against.",
    screens: [
      { title: "The reveal", why: "Light green means Civilian and black means Imposter, and no other element in the entire app may use either. The two roles are two values of the palette — that is rule 1, and this screen is the reason it exists." },
      { title: "The hint", why: "One word, hand-written for that exact secret word. The screen is almost empty on purpose — a hint surrounded by interface reads as a puzzle to solve rather than a thing to bluff with." },
      { title: "Pack picker", why: "Every pack plate is a white tile with a line icon. An earlier version gave each category its own colour, which quietly stole the two colours the game depends on." },
      { title: "Round end", why: "No red, even on the destructive action. That convention is older than this palette and it loses here deliberately, because red would compete with the two role colours." },
    ],
  },
  {
    slug: "charades",
    name: "Charades", state: "beta" as const, badge: "Drifted — see /design/drift",
    intro: "Published anyway, labelled. Hiding the sets that break the rules would make the system look better than it is.",
    screens: [
      { title: "Card in play", why: "One card, enormous type, nothing else. It is read across a room by someone holding the phone to their forehead — every pixel spent on chrome is a pixel stolen from the only thing that matters." },
      { title: "Pack picker", why: "Gold is reserved for paid content and appears nowhere else. Spending it on decoration would flatten the only signal separating the free pack from the other 31." },
      { title: "Team setup", why: "Two teams, no accounts, no lobby. The whole configuration step has to survive being done by someone else's slightly drunk friend." },
      { title: "Round result", why: "Scores resolve immediately with no confirmation step — the room has already moved on to arguing about whether that one counted." },
    ],
  },
];

export default function GalleryPage() {
  return (
    <>
      <SiteHeader active="/design" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/design" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Design</Link>
            <Label>Screens · selected</Label>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">A few screens, each carrying a decision.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Chosen because each one explains something — not a dump of all 264. Paywall internals
              and unreleased features are not published.
            </p>
            <div className="mt-5 max-w-prose rounded-card border border-dashed border-line-2 bg-paper-2 px-5 py-3.5 text-small text-ink-2">
              <p>
                <b className="text-ink">Screenshots are derivatives.</b> The originals are 1080×2400
                and up because the stores demand it — about 42MB across the apps. A build step resizes
                and converts them to WebP at 640px, which is roughly a hundredth of the bytes and
                indistinguishable at this size. The originals stay in the app repos.
                Last synced {mediaGeneratedOn}.
              </p>
              {mediaMissing.length > 0 && (
                <p className="mt-2">
                  <b className="text-ink">No assets to sync for:</b>{" "}
                  {mediaMissing.map((m) => `${m.slug} (${m.why})`).join("; ")}. Those render labelled
                  placeholders — a gap you can see beats a grey box.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter pb-section">
          {SETS.map((s) => (
            <div key={s.name} className="border-t border-line pt-10 first:border-0 first:pt-0 [&:not(:first-child)]:mt-16">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-h2 font-semibold">{s.name}</h2>
                <StatePill state={s.state}>{s.badge}</StatePill>
              </div>
              <p className="mt-2 max-w-prose text-small text-ink-2">{s.intro}</p>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {s.screens.map((sc, i) => {
                  const shot = mediaFor(s.slug).shots[i];
                  return (
                  <figure key={sc.title}>
                    {shot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shot.src} alt={`${s.name} — ${sc.title}`} loading="lazy"
                           className="aspect-[9/19.5] w-full rounded-xl border border-line object-cover object-top" />
                    ) : (
                      <div className="shot-ph aspect-[9/19.5] overflow-hidden rounded-xl border border-line">
                        <p className="px-3 font-mono text-[10px] uppercase tracking-label text-ink-3">{sc.title}</p>
                      </div>
                    )}
                    <figcaption className="mt-4">
                      <h3 className="font-display text-h3 font-semibold">{sc.title}</h3>
                      {/* The reasoning renders as page text, never inside a frame — an
                          embedded screen contributes nothing to search, and the reasoning
                          is the artifact worth indexing. */}
                      <p className="mt-2 text-small text-ink-2">{sc.why}</p>
                    </figcaption>
                  </figure>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="mt-14 max-w-prose border-l-2 border-line-2 pl-5 text-small text-ink-2">
            Source for these apps is closed while they are commercial. The design files are not —
            they are the part that is useful to someone else, and they cost nothing to give away.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
