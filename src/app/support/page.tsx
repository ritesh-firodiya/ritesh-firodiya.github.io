import Link from "next/link";
import type { Metadata } from "next";
import { Bug, CreditCard, Trash2, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { products } from "@/lib/products";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Support",
  description: "A bug, a purchase problem, or deleting your account and data. One person reads these and answers them.",
  alternates: { canonical: "/support/" },
};

const PATHS: { Icon: LucideIcon; title: string; body: string; cta: string; subject: string }[] = [
  { Icon: Bug, title: "Something is broken", body: "Tell me the app, your phone model, and what you were doing. A screenshot beats a description.", cta: "Report a bug", subject: "Bug report" },
  { Icon: CreditCard, title: "A purchase or a subscription", body: "Paid and did not get access, want a refund, or want to stop a subscription renewing. Refunds and cancellations are handled by the store — I will tell you exactly where to tap.", cta: "Purchase help", subject: "Purchase help" },
  { Icon: Trash2, title: "Delete my account & data", body: "Required by both stores, and it should be easy. Say which app and which account; done within 7 days.", cta: "Request deletion", subject: "Account deletion request" },
];

/* The answers name apps. A claim on behalf of every app is only as true as the
   least convenient one, so each list is derived from the data. */
const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]);
const subs = products.filter((p) => p.model === "subscription").map((p) => p.name);
const ads = products.filter((p) => p.model === "free-ads").map((p) => p.name);
const tracked = products.filter((p) => p.analytics && p.analytics !== "None" && p.model !== "free-ads").map((p) => p.name);

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pb-16 pt-12 lg:pt-16">
        <p className="eyebrow">Support</p>
        <h1 className="page-title mt-3 max-w-[20ch]">Help with one of the apps.</h1>
        <p className="mt-4 max-w-[58ch] text-lead text-ink-2">One person reads these and answers them. Usually a reply within two working days.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PATHS.map(({ Icon, title, body, cta, subject }) => (
            <div key={title} className="card flex flex-col p-6">
              <Icon size={24} className="text-brand-500" aria-hidden />
              <h2 className="mt-4 text-h3 font-bold">{title}</h2>
              <p className="mb-6 mt-2 text-base text-ink-2">{body}</p>
              <a href={`mailto:${profile.email}?subject=${encodeURIComponent(subject)}`} className="btn btn-quiet mt-auto self-start">
                {cta}
              </a>
            </div>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="section-title">Asked often.</h2>
          <div className="mt-6 grid gap-x-12 lg:grid-cols-2">
            <Faq q="How do I stop a subscription renewing?">
              In your Google Play or App Store account, not in the app — neither store lets a developer cancel on your
              behalf. Access continues to the end of the period you have already paid for. {list(subs)} are the
              subscriptions.
            </Faq>
            <Faq q="Which apps have ads?">
              {ads.length === 1 ? `One: ${ads[0]}` : list(ads)}, with a banner and an interstitial between games. There
              is no ad-free purchase for it. Nothing else has an ad SDK at all.
            </Faq>
            <Faq q="I bought something and got a new phone.">
              Open the app, go to the purchase screen and tap Restore — purchases are tied to your store account, not
              the device. If it still does not appear, email the store receipt.
            </Faq>
            <Faq q="Do you track me?">
              Only {list(tracked)} carries analytics, and it asks first. {ads[0]}&rsquo;s ad network receives an
              advertising identifier. Every other app has no analytics SDK at all.
            </Faq>
          </div>
        </section>

        <p className="mt-8 rounded-lg border border-line bg-muted p-5 text-base text-ink-2">
          Looking for a privacy policy? <Link href="/legal/" className="text-link">All legal documents</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-5">
      <h3 className="text-body font-bold">{q}</h3>
      <p className="mt-2 text-base text-ink-2">{children}</p>
    </div>
  );
}
