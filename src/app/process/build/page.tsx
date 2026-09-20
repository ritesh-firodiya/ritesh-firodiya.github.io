import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { BUILD_STAGES } from "@/lib/process";

export const metadata: Metadata = {
  title: "How an app gets built",
  description: "Five stages, two hard gates, and the rule that makes it work: a plan approved is not code approved.",
};

const FIXED = [
  "One styling system, no alternatives. Mixing three is how a codebase ends up with four ways to set a margin.",
  "Icons come from the same set the app uses, so an icon is never re-chosen at build time and a wireframe never promises a glyph that does not exist.",
  "Every secret is backed up the moment it exists. Not later, not once it works — a secret that exists in one place is already a lost secret.",
];

export default function BuildPage() {
  return (
    <>
      <SiteHeader active="/process" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/process" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Process</Link>
            <Label>Stage 4 · build</Label>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">Designs first. Every time. No exceptions.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Five stages, each waiting on an explicit approval. The rule that makes it work is the
              unglamorous one: <b className="text-ink">a plan approved is not code approved.</b>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <ol className="border-t border-line">
            {BUILD_STAGES.map((s) => (
              <li key={s.n} className="grid gap-3 border-b border-line py-8 md:grid-cols-[4rem_1fr] md:gap-8">
                <span className="font-display text-d2 font-semibold text-accent">{s.n}</span>
                <div>
                  <h2 className="font-display text-h2 font-semibold">{s.title}</h2>
                  <p className="mt-3 max-w-prose text-body text-ink-2">{s.body}</p>
                  {"note" in s && s.note && <p className="mt-3 max-w-prose text-small text-ink-2">{s.note}</p>}
                  {s.gate && (
                    <p className="mt-4">
                      <span className="inline-block rounded-pill bg-accent-wash px-2.5 py-1 font-mono text-label uppercase tracking-label text-accent">
                        Hard gate — manual approval
                      </span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-card border border-accent/30 bg-accent-wash p-8">
            <h2 className="max-w-[24ch] font-display text-h2 font-semibold">The rule that is hardest to keep</h2>
            <p className="mt-4 max-w-prose text-body text-ink-2">
              Do not start with &ldquo;a small piece&rdquo;, a spike, or a test harness because it
              looks useful. Every one of those is code written before the gate it was supposed to
              wait for, and every one of them becomes an argument for skipping the gate —{" "}
              <i>we&rsquo;ve already built some of it.</i>
            </p>
            <p className="mt-4 max-w-prose text-body text-ink-2">
              This is also the rule that is worth the most, because it is the one that stops a
              weekend idea from quietly becoming a six-month commitment nobody ever decided to make.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {FIXED.map((f, i) => (
              <div key={i}><Label>Also fixed</Label><p className="mt-3 text-small text-ink-2">{f}</p></div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
