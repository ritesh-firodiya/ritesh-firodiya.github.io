import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, Label } from "@/components/pills";
import { products, shipped, unbuilt, mediaFor, verifiedOn } from "@/lib/products";
import { profile } from "@/lib/profile";
import { CASE_STUDIES } from "@/lib/case-studies";

/* Named rather than sliced, so reordering products.json cannot silently
   promote something with no screenshot into the two feature slots. */
const FEATURED = ["aakalan", "askcal"];

/* The compact row under the features. Four is what fits one line at 1440
   without wrapping into a second row that reads as a different section. */
const COMPACT = ["tic-tac-toe", "charades", "imposter", "chitragupt"];

export default function Home() {
  const study = CASE_STUDIES[0];
  const featured = FEATURED.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);
  const compact = COMPACT.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);

  /* Two counts that were once one. "Live" includes the web products; "on
     Google Play" must mean the Play listing specifically, or it is a claim the
     store does not support. */
  const live = products.filter((p) =>
    Object.values(p.platforms).some((v) => v && v.state === "live"),
  ).length;
  const onPlay = products.filter((p) => p.platforms.android?.state === "live").length;

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ══ hero ══ Name, claim, two doors, four numbers — and that is all.
            The version this replaces spent a full viewport on a headline and
            forty words, then put a "three doors" band under it that made every
            reader classify themselves before the page had shown them anything.
            The work is now the next thing down. */}
        <section className="grain relative overflow-hidden border-b border-line">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-14 sm:pt-20">
            <p className="inline-flex items-center gap-2 rounded-pill border border-live/30 bg-live-bg px-3 py-1 font-mono text-label uppercase tracking-label text-live">
              <span className="h-1.5 w-1.5 rounded-pill bg-live" aria-hidden />
              Open to senior &amp; staff roles · and consulting
            </p>
            <h1 className="mt-6 max-w-[14ch] text-d1 font-bold">{profile.headline}</h1>

            <div className="mt-8 flex flex-wrap items-end gap-8 sm:gap-12">
              <p className="max-w-measure text-lead text-ink-2">
                Nine years of production TypeScript — Walmart, Swiggy, Globant, Speechify. Now
                building{" "}
                <b className="font-semibold text-ink">{products.length} products for India</b>, and
                stating how every one of them is paid for before you install it.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/me.webp"
                alt={profile.name}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-card border border-line object-cover"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/work" className="rounded-pill bg-ink px-5 py-2.5 text-small font-medium text-ink-inverse transition hover:bg-brand-500">
                See the work
              </Link>
              <Link href="/hire" className="rounded-pill border border-line-strong px-5 py-2.5 text-small font-medium transition hover:border-brand-500 hover:text-brand-500">
                Work together
              </Link>
              <a href={`mailto:${profile.email}`} className="text-small font-medium text-ink-3 underline decoration-line-strong underline-offset-4 transition hover:text-brand-500">
                {profile.email}
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              <Stat k="Products" v={products.length} />
              <Stat k="Live today" v={live} tone="text-live" />
              <Stat k="On Google Play" v={onPlay} />
              <Stat k="Years shipping" v={9} />
            </dl>
          </div>
        </section>

        {/* ══ selected work ══ GOAL 1, and band two rather than band four.
            "Can this person ship" is what all four readers are really asking,
            and a picture answers it faster than a paragraph. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-page px-gutter py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Label>Selected work</Label>
                <h2 className="mt-2 max-w-[24ch] text-d2 font-semibold">
                  Things I built, and what it took.
                </h2>
              </div>
              <Link href="/work" className="text-small font-medium text-brand-500 underline decoration-brand-200 underline-offset-4">
                All work
              </Link>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-3">
              <Link
                href={`/work/${study.slug}/`}
                className="group flex flex-col rounded-card border border-line bg-surface p-7 transition hover:border-brand-200 lg:col-span-2"
              >
                <Shot slug={study.slug} className="mb-6 h-48" />
                <Label>Case study · {study.product}</Label>
                <h3 className="mt-2 max-w-[30ch] text-h2 font-semibold transition group-hover:text-brand-500">
                  {study.title}
                </h3>
                <dl className="mt-auto flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-4">
                  {study.facts.slice(0, 3).map((f) => (
                    <div key={f.k}>
                      <dt className="font-mono text-label uppercase tracking-label text-ink-3">{f.k}</dt>
                      <dd className="mt-1 max-w-[24ch] text-small font-medium">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </Link>

              <div className="flex flex-col gap-6">
                {featured.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}/`}
                    className="group flex-1 rounded-card border border-line bg-surface p-5 transition hover:border-brand-200"
                  >
                    <Shot slug={p.slug} className="mb-4 h-24" />
                    <ModelPill model={p.model} />
                    <h3 className="mt-2 text-h3 font-semibold transition group-hover:text-brand-500">{p.name}</h3>
                    <p className="mt-1 text-small text-ink-2">{p.tagline}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ experience ══ GOAL 2, condensed. Eight rows here would make the
            landing page a CV; the full history is the résumé's job. */}
        <section className="border-b border-line bg-muted">
          <div className="mx-auto max-w-page px-gutter py-14">
            <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-12">
              <div>
                <Label>Experience</Label>
                <h2 className="mt-2 text-d2 font-semibold">Nine years, mostly end-to-end.</h2>
                <p className="mt-3 max-w-[34ch] text-small text-ink-2">
                  Postgres schema to Play Store release — usually as the only person who touches
                  both.
                </p>
                <Link href="/resume" className="mt-4 inline-block text-small font-medium text-brand-500 underline decoration-brand-200 underline-offset-4">
                  Full résumé
                </Link>
              </div>
              <ol className="border-t border-line">
                {profile.experiences.slice(0, 3).map((e) => (
                  <li key={e.company} className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-6">
                    <p className="font-mono text-label uppercase tracking-label text-ink-3">
                      {e.from} — {e.to}
                    </p>
                    <p className="text-small">
                      <b className="font-semibold">{e.position}</b> ·{" "}
                      <span className="text-brand-500">{e.company}</span>
                    </p>
                  </li>
                ))}
                <li className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-6">
                  <p className="font-mono text-label uppercase tracking-label text-ink-3">2017 — 2023</p>
                  <p className="text-small text-ink-2">
                    {profile.experiences.slice(3).map((e) => e.company).join(" · ")}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ══ products ══ GOAL 3 — the brand-site half. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-page px-gutter py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Label>Products · verified {verifiedOn}</Label>
                <h2 className="mt-2 max-w-[26ch] text-d2 font-semibold">
                  {products.length} products, honestly labelled.
                </h2>
              </div>
              <Link href="/products" className="text-small font-medium text-brand-500 underline decoration-brand-200 underline-offset-4">
                All products
              </Link>
            </div>
            <p className="mt-4 max-w-prose text-small text-ink-2">
              How each one is paid for is stated above its install button — never below it, never
              softened into &ldquo;unlock&rdquo;. No promise is made on behalf of all of them.
            </p>

            <div className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {compact.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}/`} className="group bg-surface p-5 transition hover:bg-muted">
                  <ModelPill model={p.model} />
                  <h3 className="mt-2.5 text-h3 font-semibold transition group-hover:text-brand-500">{p.name}</h3>
                  <p className="mt-1 text-small text-ink-2">{p.tagline}</p>
                </Link>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs2 text-ink-3">
              + {unbuilt.length} listed because a spec and a schema exist, not because anything
              ships. {shipped.length} are built.
            </p>
          </div>
        </section>

        {/* ══ the two ways to work with me ══ GOALS 4 and 6, side by side
            because they are two answers to one question. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-page gap-6 px-gutter py-14 md:grid-cols-2">
            <Door
              href="/hire"
              kicker="Work together"
              title="An MVP, a team to lead, or AI tooling."
              body="What I take on, what it costs in time, and what you get at the end of it."
              cta="What I take on"
            />
            <Door
              href="/resume"
              kicker="Hiring"
              title="Senior / staff IC and tech lead."
              body="Nine years across remote teams, on the web and in the store."
              cta="Read the résumé"
            />
          </div>
        </section>

        {/* ══ contact ══ GOAL 5, and the end of the journey. */}
        <section className="bg-band text-band-ink">
          <div className="mx-auto max-w-page px-gutter py-14">
            <p className="font-mono text-label uppercase tracking-label text-band-ink/55">Get in touch</p>
            <h2 className="mt-3 max-w-[20ch] text-d2 font-semibold">
              Hiring, building, or just want to argue about tooling?
            </h2>
            <p className="mt-4 max-w-measure text-band-ink/65">{profile.currently}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="rounded-pill bg-page px-5 py-3 text-small font-medium text-ink transition hover:bg-brand-500 hover:text-band-ink">
                {profile.email}
              </a>
              <Link href="/contact" className="rounded-pill border border-band-ink/25 px-5 py-3 text-small font-medium transition hover:border-band-ink">
                Every way to reach me
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ k, v, tone }: { k: string; v: number; tone?: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="font-mono text-label uppercase tracking-label text-ink-3">{k}</dt>
      <dd className={`mt-1.5 text-h2 tabular-nums ${tone ?? ""}`}>{v}</dd>
    </div>
  );
}

function Door({ href, kicker, title, body, cta }: Record<"href" | "kicker" | "title" | "body" | "cta", string>) {
  return (
    <Link href={href} className="group rounded-card border border-line bg-surface p-8 transition hover:border-brand-200">
      <Label>{kicker}</Label>
      <h2 className="mt-2 text-h2 font-semibold transition group-hover:text-brand-500">{title}</h2>
      <p className="mt-3 max-w-[44ch] text-small text-ink-2">{body}</p>
      <span className="mt-5 inline-block text-small font-medium text-brand-500">{cta} →</span>
    </Link>
  );
}

/* A real screenshot where one exists, and a visibly empty slot where none
   does. The rule is that a missing asset is visibly missing — a grey box
   reads as a surface that happens to be blank, hatching does not. */
function Shot({ slug, className = "" }: { slug: string; className?: string }) {
  const m = mediaFor(slug);
  const shot = m.shots[0];
  if (!shot) {
    return (
      <div className={`slot flex items-center justify-center rounded ${className}`}>
        <p className="font-mono text-label uppercase tracking-label text-ink-3">No screenshot yet</p>
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded bg-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.src} alt={`${slug} — ${shot.label}`} loading="lazy" className="h-full w-auto object-contain" />
    </div>
  );
}
