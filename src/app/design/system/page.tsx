import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";

export const metadata: Metadata = {
  title: "The design system",
  description: "Two files that cannot disagree: a token config where every value is a variable, and a stylesheet that holds the values. Plus the type scale and the palette.",
};

const SPLIT = [
  { file: "The token config", lead: "Every token as a utility scale, and every value is a var(--…). Never a literal.", note: "A token with no variable here simply has no utility. That is the enforcement — you cannot use a colour you did not define." },
  { file: "The stylesheet", lead: "The token definitions, once — plus the handful of things Tailwind genuinely cannot express: gradients, pseudo-elements, keyframes, device frames.", note: "Also where the rules are written down, as a header comment that future-you has to scroll past." },
  { file: "The markup", lead: "100% Tailwind. No style attributes, no style blocks.", note: "The moment a screen carries its own styles it becomes a third source of truth, and the next screen copies it." },
];
const GROUND = ["bg-paper", "bg-paper-2", "bg-paper-3", "bg-surface"];
const INK = ["bg-ink", "bg-ink-2", "bg-ink-3", "bg-accent"];

export default function SystemPage() {
  return (
    <>
      <SiteHeader active="/design" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/design" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Design</Link>
            <Label>The system</Label>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">Two files, and they cannot disagree.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              The whole system is a token config, a stylesheet, and a rule about which one owns what.
              Every screen in every app is plain HTML loading those two files and nothing else.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <h2 className="max-w-[22ch] font-display text-d2 font-semibold">The split, and it is load-bearing.</h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {SPLIT.map((s) => (
                <div key={s.file} className="rounded-card border border-line bg-surface p-7">
                  <p className="font-mono text-label uppercase tracking-label text-accent">{s.file}</p>
                  <p className="mt-4 text-body text-ink-2">{s.lead}</p>
                  <p className="mt-4 text-small text-ink-3">{s.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-prose border-l-2 border-accent/40 pl-5 text-body text-ink-2">
              Why it matters in one sentence: a literal hex compiled into a utility would paint the
              development chrome and the product screens identically, and nothing in the markup would
              say why. Because every value is a variable, redefining the variables inside a scope
              re-themes everything below it without touching a single class.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <h2 className="font-display text-d2 font-semibold">Tokens</h2>
          <p className="mt-4 max-w-prose text-body text-ink-2">
            These are this site&rsquo;s. Each app has its own values under the same scale names, which
            is what makes the system portable rather than a theme.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-6">
              <Label>Ground &amp; ink</Label>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[...GROUND, ...INK].map((c) => (
                  <div key={c}>
                    <div className={`h-14 rounded ${c} ${c.startsWith("bg-paper") || c === "bg-surface" ? "border border-line" : ""}`} />
                    <p className="mt-1.5 font-mono text-[10px] text-ink-3">{c.replace("bg-", "")}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-small text-ink-2">
                Three ink stops, and <code className="font-mono text-xs2">ink-3</code> is the floor —
                4.6:1 on paper. Nothing quieter is allowed, because the theme this replaced used a
                grey that measured 2.9:1 and failed AA outright.
              </p>
            </div>

            <div className="rounded-card border border-line bg-surface p-6">
              <Label>Meaning-carrying scales</Label>
              <p className="mt-4 text-small text-ink-2">
                Two independent axes. A product has a <b className="text-ink">model</b> and a{" "}
                <b className="text-ink">status</b>, and conflating them is how &ldquo;coming
                soon&rdquo; ends up meaning four different things.
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-label text-ink-3">Model</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ModelPill model="free" /><ModelPill model="free-ads" /><ModelPill model="one-time" />
                <ModelPill model="subscription" /><ModelPill model="per-period" />
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-label text-ink-3">Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatePill state="live">Live</StatePill><StatePill state="beta">Beta open</StatePill>
                <StatePill state="closed">Closed testing</StatePill><StatePill state="none">Not out</StatePill>
              </div>
              <p className="mt-5 text-small text-ink-2">
                No model colour reads as a warning. A subscription is not a confession and
                ad-supported is not an apology — both are facts, so both get a neutral wash at equal
                weight.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-card border border-line bg-surface p-8">
            <Label>Type</Label>
            <div className="mt-6 space-y-4 border-b border-line pb-8">
              <p className="font-display text-d1 font-semibold">Display — Fraunces</p>
              <p className="font-display text-d2 font-semibold">Section heads, same face</p>
              <p className="text-lead text-ink-2">Lead paragraph in Inter, which carries every word anyone actually reads.</p>
              <p className="text-body text-ink-2">Body copy at 17px on a 68-character measure. Long enough to argue a point, short enough to track back to the next line without effort.</p>
              <p className="font-mono text-xs2 uppercase tracking-label text-ink-3">Labels, dates and stacks — JetBrains Mono</p>
            </div>
            <p className="mt-6 max-w-prose text-small text-ink-2">
              One display face used for display only. The failure this guards against is documented
              in one of the app sets: a first pass with no display scale at all, whose biggest type
              was 38px and whose everything-else was 14px — <i>&ldquo;which is why it read as a
              settings app.&rdquo;</i>
            </p>
          </div>
        </section>

        <section className="border-t border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <h2 className="max-w-[24ch] font-display text-d2 font-semibold">Why it survives a framework change.</h2>
            <div className="mt-9 grid gap-6 lg:grid-cols-3">
              <div><Label>Design</Label><p className="mt-3 text-small text-ink-2">Plain HTML, Tailwind from a CDN, no build step. Openable in a browser in five years with no toolchain.</p></div>
              <div><Label>Mobile</Label><p className="mt-3 text-small text-ink-2">The same scale names become the app&rsquo;s theme, so a class in a React Native screen means what it meant in the wireframe.</p></div>
              <div><Label>Web</Label><p className="mt-3 text-small text-ink-2">Tailwind v4 defines a theme in CSS rather than in JavaScript — so the wireframes&rsquo; variable block became this site&rsquo;s real theme almost verbatim. A port, not a translation.</p></div>
            </div>
            <p className="mt-8 max-w-prose border-l-2 border-accent/40 pl-5 text-body text-ink-2">
              That is the whole return on the variable rule. The token layer was never coupled to a
              framework, so changing the framework did not touch a single screen.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
