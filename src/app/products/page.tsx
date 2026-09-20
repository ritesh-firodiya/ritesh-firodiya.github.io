import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import {
  products,
  verifiedOn,
  mediaFor,
  byRank,
  rank,
  RANK_LABEL,
  type Product,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Every product with how it is paid for, what it shows you and what it measures — apps, platforms and tools, ordered by what you can actually use today.",
};

const dash = <span className="text-ink-3">—</span>;

/* `closed` and `none` are never hidden and never softened — someone deciding
   whether to install needs to know a button is missing on purpose. */
function Availability({ p }: { p: Product }) {
  const open = Object.entries(p.platforms).filter(
    ([, v]) => v && (v.state === "live" || v.state === "beta"),
  );
  if (open.length === 0) {
    const why = Object.values(p.platforms).find((v) => v?.note)?.note;
    return (
      <>
        <StatePill state="none">{p.notBuilt ? "In build" : "Not out"}</StatePill>
        {why && <span className="mt-1 block text-xs2 text-ink-3">{why}</span>}
      </>
    );
  }
  const [firstKey, first] = open[0];
  const rest = open.slice(1);
  const name = firstKey === "web" ? "Open" : first!.state === "live" ? "Play" : "TestFlight";
  return (
    <>
      <StatePill state={first!.state}>{name}</StatePill>
      {rest.length > 0 && (
        <span className="mt-1 block text-xs2 text-ink-3">
          {rest.map(([k]) => (k === "ios" ? "iOS TestFlight" : "Android")).join(", ")}
        </span>
      )}
    </>
  );
}

function Row({ p }: { p: Product }) {
  const icon = mediaFor(p.slug).icon;
  return (
    <tr className="border-b border-line last:border-0">
      <th scope="row" className="tbl-stick px-4 py-3 text-left font-display text-h3 font-semibold">
        <span className="flex items-start gap-3">
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon}
              alt=""
              width={30}
              height={30}
              className="mt-0.5 h-[30px] w-[30px] shrink-0 rounded-lg border border-line"
            />
          ) : (
            <span className="shot-ph mt-0.5 h-[30px] w-[30px] shrink-0 rounded-lg" aria-hidden="true" />
          )}
          <span className="min-w-0">
            <Link href={`/products/${p.slug}/`} className="link-u hover:text-accent">
              {p.name}
            </Link>
            <span className="mt-0.5 block font-sans text-xs2 font-normal text-ink-3">{p.tagline}</span>
          </span>
        </span>
      </th>
      <td className="px-4 py-3">
        <ModelPill model={p.model} />
      </td>
      <td className={`px-4 py-3 ${p.model === "free-ads" ? "font-medium text-m-ads" : "text-ink-2"}`}>
        {p.ads ?? dash}
      </td>
      <td
        className={`px-4 py-3 ${
          p.analytics && p.analytics !== "None" ? "font-medium text-m-year" : "text-ink-2"
        }`}
      >
        {p.analytics ?? dash}
      </td>
      <td className="px-4 py-3">
        <Availability p={p} />
      </td>
    </tr>
  );
}

const HEADERS = ["Product", "Model", "Ads", "Analytics", "Get it"];

export default function ProductsPage() {
  const sorted = [...products].sort(byRank);
  const groups = [0, 1, 2, 3]
    .map((r) => ({ r, items: sorted.filter((p) => rank(p) === r) }))
    .filter((g) => g.items.length > 0);
  const available = sorted.filter((p) => rank(p) <= 1).length;

  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        {/* Title, then the table, and nothing between them. The crux of this
            page is the table; anything above it is a toll on reaching it. */}
        <section className="mx-auto max-w-page px-gutter pb-6 pt-section">
          <Label>
            {products.length} products · {available} you can use today
          </Label>
          <h1 className="mt-3 max-w-[24ch] font-display text-d1 font-semibold">
            How each one is paid for, and what it knows about you.
          </h1>
        </section>

        <section className="mx-auto max-w-page px-gutter">
          <div className="tbl-wrap overflow-hidden rounded-card border border-line bg-surface shadow-lift">
            <div className="tbl-scroll">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Every product with how it is paid for, its ad surfaces, its analytics and its
                  availability, ordered by what is usable today
                </caption>
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    {HEADERS.map((h, i) => (
                      <th
                        key={h}
                        scope="col"
                        className={`whitespace-nowrap px-4 py-3 font-mono text-label uppercase tracking-label text-ink-3 ${
                          i === 0 ? "tbl-stick bg-paper-2" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                {groups.map((g) => (
                  <tbody key={g.r} className="text-small">
                    <tr className="border-b border-line bg-paper-2">
                      <td
                        colSpan={HEADERS.length}
                        className="px-4 py-2 font-mono text-label uppercase tracking-label text-ink-3"
                      >
                        {RANK_LABEL[g.r]} · {g.items.length}
                      </td>
                    </tr>
                    {g.items.map((p) => (
                      <Row key={p.slug} p={p} />
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs2 text-ink-3">
            <span className="lg:hidden">Scroll sideways — the name stays pinned.</span>
            <span>
              Every row is checked against the product&rsquo;s own source. Last verified {verifiedOn}.
            </span>
          </p>
        </section>

        {/* Secondary: useful once, not worth the fold. */}
        <section className="mx-auto max-w-page px-gutter py-section">
          <h2 className="font-display text-h2 font-semibold">What the models mean</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-3">
              <dt className="shrink-0">
                <ModelPill model="one-time" />
              </dt>
              <dd className="text-small text-ink-2">
                Pay once, keep it. Nothing renews; it restores on a new phone.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">
                <ModelPill model="free-ads" />
              </dt>
              <dd className="text-small text-ink-2">
                Free, nothing to buy. Paid for by a banner and a full-screen ad, so it needs a
                network and the ad network sees a device id.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">
                <ModelPill model="subscription" />
              </dt>
              <dd className="text-small text-ink-2">
                Charges again until you cancel, in your store account rather than in the app.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">
                <ModelPill model="per-period" />
              </dt>
              <dd className="text-small text-ink-2">
                Each period is its own purchase. The charge repeats yearly, but only if you come
                back. Nothing auto-renews.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0">
                <ModelPill model="undecided" />
              </dt>
              <dd className="text-small text-ink-2">
                Not priced. Either sold to organisations rather than people, or not finished.
              </dd>
            </div>
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
