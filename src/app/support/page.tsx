import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Support",
  description: "A bug, a purchase problem, or deleting your account and data. One person reads these and answers them.",
};

const EMAIL = "firodiya.ritesh@gmail.com";
const PATHS = [
  { title: "Something is broken", body: "Tell me the app, your phone model, and what you were doing. A screenshot beats a description.", cta: "Report a bug", subject: "Bug report" },
  { title: "A purchase or a subscription", body: "Paid and did not get access, want a refund, or want to stop a subscription renewing. Refunds and cancellations are handled by the store — I will tell you exactly where to tap.", cta: "Purchase help", subject: "Purchase help" },
  { title: "Delete my account & data", body: "Required by both stores, and it should be easy. Say which app and which account; done within 7 days.", cta: "Request deletion", subject: "Account deletion request" },
];

const subs = products.filter((p) => p.model === "subscription").map((p) => p.name);
const ads = products.filter((p) => p.model === "free-ads").map((p) => p.name);
const tracked = products.filter((p) => p.analytics && p.analytics !== "None").map((p) => p.name);

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="grain relative overflow-hidden border-b border-line">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Label>Support</Label>
            <h1 className="mt-4 max-w-[18ch] font-display text-d1 font-semibold">One person reads these, and answers them.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              No ticket number, no bot, no queue position. Usually a reply within two working days.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <div className="grid gap-5 lg:grid-cols-3">
            {PATHS.map((p) => (
              <div key={p.title} className="flex flex-col rounded-card border border-line bg-surface p-7">
                <h2 className="font-display text-h2 font-semibold">{p.title}</h2>
                <p className="mt-3 text-small text-ink-2">{p.body}</p>
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(p.subject)}`} className="mt-auto pt-7">
                  <span className="inline-flex items-center gap-2 rounded-pill border border-line-strong px-4 py-2 text-small font-medium transition hover:border-brand-500 hover:text-brand-500">
                    {p.cta}
                  </span>
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-card border border-line bg-muted p-6">
            <p className="text-body text-ink-2">
              Or just email <a href={`mailto:${EMAIL}`} className="link-u font-medium text-brand-500">{EMAIL}</a> —
              every button above goes to the same inbox, with the subject already filled in.
            </p>
          </div>
        </section>

        <section className="border-t border-line bg-muted">
          <div className="mx-auto max-w-page px-gutter py-section">
            <h2 className="font-display text-d2 font-semibold">Asked often enough to answer here.</h2>
            <div className="mt-9 grid gap-x-12 gap-y-7 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-h3 font-semibold">How do I stop a subscription renewing?</h3>
                <p className="mt-2 max-w-prose text-small text-ink-2">
                  In your Google Play or App Store account, not in the app — neither store lets a
                  developer cancel on your behalf. Access continues to the end of the period you have
                  already paid for. {subs.join(", ")} are the subscriptions;{" "}
                  <Link href="/products" className="link-u text-brand-500">the full list is here</Link>.
                </p>
              </div>
              <div>
                <h3 className="font-display text-h3 font-semibold">Which apps have ads?</h3>
                <p className="mt-2 max-w-prose text-small text-ink-2">
                  {ads.length === 1 ? `One: ${ads[0]}` : ads.join(", ")}, with a banner and an
                  interstitial between games. There is no ad-free purchase for it. Nothing else has
                  an ad SDK at all.
                </p>
              </div>
              <div>
                <h3 className="font-display text-h3 font-semibold">I bought something and got a new phone.</h3>
                <p className="mt-2 max-w-prose text-small text-ink-2">
                  Open the app, go to the purchase screen and tap Restore — purchases are tied to
                  your store account, not the device. If it still does not appear, email the store
                  receipt.
                </p>
              </div>
              <div>
                <h3 className="font-display text-h3 font-semibold">Do you track me?</h3>
                <p className="mt-2 max-w-prose text-small text-ink-2">
                  Only {tracked.join(", ")} carries analytics, and it asks first. {ads[0]}&rsquo;s ad
                  network receives an advertising identifier. Every other app has no analytics SDK at
                  all — each product page lists exactly what its app asks for and why.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
