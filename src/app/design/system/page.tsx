import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { Swatch } from "@/components/design-bits";
import { tokens, palettes, lead, realKeys, sets } from "@/lib/design";

export const metadata: Metadata = {
  title: "The design system",
  description:
    "One skeleton, one palette per product, and a naming rule a script can check. The tokens behind every screen in the estate.",
};

const LAYERS = [
  {
    file: "core.json → core.css",
    lead: "Everything that is not a colour, identical in every product.",
    body: "The type scale, the radii, the shadow geometry, the tracking, the phone frame, and the short list of classes Tailwind genuinely cannot express. Generated, never hand-edited, and byte-identical across every set on a surface.",
  },
  {
    file: "palettes/<name>.json → tokens.css",
    lead: "The colours, and only the colours.",
    body: "About thirty-five role-named keys, plus a reserved block for the colours that carry meaning in that product. This is the only file a product owns. A theme is a remap of the same names inside a scope, never a second set of utilities.",
  },
  {
    file: "tailwind.config.js",
    lead: "Every value is a var(--token). Never a literal.",
    body: "Because the values live in CSS and the names live here, the two cannot drift. And because every value is a var and the names are fixed, this file has no product-specific content left in it — the canon region is byte-identical across every set, which the lint compares.",
  },
  {
    file: "*.html and src/",
    lead: "100% Tailwind. No style=, no <style>.",
    body: "The moment a screen carries its own styles it becomes a third source of truth, and the next screen copies it. Two sets in the estate did exactly that, once per file, across 352 screens.",
  },
];

/** The ramp stops worth showing. A palette declares what it has; nothing is invented. */
const RAMP = ["50", "100", "200", "400", "500", "700", "900"];
const GROUND = ["page", "surface", "muted", "sunken", "ink", "ink-2", "ink-3", "line"];

export default function SystemPage() {
  const mobileType = Object.entries(tokens.core.mobile.type);
  const renamed = Object.entries(tokens.core.shared.colorKeys.renamed).filter(([k]) => k !== "_");

  return (
    <>
      <SiteHeader active="/design" />
      <main>
        <section className="px-gutter pt-section">
          <div className="mx-auto max-w-page">
            <Link href="/design" className="link-u text-small text-ink-2">← Design</Link>
            <Label>The system · v{tokens.version}</Label>
            <h1 className="mt-3 max-w-measure font-display text-d1 font-semibold">
              One skeleton, {palettes.length} palettes, and a rule a script can check.
            </h1>
            <p className="mt-5 max-w-prose text-lead text-ink-2">
              Everything metric is shared and everything hued is not. A game and a legal app should
              not look the same; they should look like they were built by the same people. So the
              type scale, the radii, the spacing and the token <i>names</i> are fixed, and each
              product supplies about thirty-five colours.
            </p>
          </div>
        </section>

        <section className="px-gutter py-section">
          <div className="mx-auto max-w-page">
            <h2 className="max-w-measure font-display text-d2 font-semibold">
              The split, and it is load-bearing.
            </h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {LAYERS.map((l) => (
                <div key={l.file} className="rounded-card border border-line bg-surface p-5 shadow-lift">
                  <p className="font-mono text-label uppercase tracking-label text-accent">{l.file}</p>
                  <p className="mt-3 font-medium">{l.lead}</p>
                  <p className="mt-2 text-small text-ink-2">{l.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-prose text-ink-2">
              Why it matters in one sentence: a literal hex compiled into a utility would paint the
              development chrome and the product screens identically, and nothing in the markup
              would say why. Because every value is a variable, redefining the variables inside a
              scope re-themes everything below it without touching a single class.
            </p>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page">
            <div className="rounded-card border border-accent/30 bg-accent-wash p-6">
              <Label>The naming rule</Label>
              <p className="mt-3 max-w-prose font-display text-h2 font-semibold">
                The CSS variable name is the Tailwind token path with dots as dashes.
              </p>
              <p className="mt-4 font-mono text-small text-ink-2">
                line.strong ↔ --line-strong · ink.2 ↔ --ink-2 · brand.500 ↔ --brand-500
              </p>
              <p className="mt-4 max-w-prose text-small text-ink-2">
                That is the entire naming policy, and the reason it is a policy at all is that a
                script can check it. Before it, five sets broke it in both directions at once —
                Tailwind key <code className="font-mono text-xs2">line</code> with CSS variable{" "}
                <code className="font-mono text-xs2">--border</code>, Tailwind key{" "}
                <code className="font-mono text-xs2">ink</code> with{" "}
                <code className="font-mono text-xs2">--text-primary</code> — so neither name could
                be trusted to find the other.
              </p>
            </div>

            <details className="mt-5 rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer font-medium">
                What was renamed to get there ({renamed.length} rules)
              </summary>
              <div className="mt-4 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                {renamed.map(([from, to]) => (
                  <p key={from} className="font-mono text-xs2 text-ink-2">
                    <span className="text-ink-3">{from}</span> → {to}
                  </p>
                ))}
              </div>
              <p className="mt-4 max-w-prose text-small text-ink-2">
                Values did not change — a retoken has to be invisible on screen. The one exception
                is Charades, where the wireframe deliberately moves to the shipped app&rsquo;s ramp.
                It is recorded on <Link href="/design/drift" className="link-u">the drift page</Link>.
              </p>
            </details>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page">
            <Label>Tokens</Label>
            <h2 className="mt-3 max-w-measure font-display text-d2 font-semibold">
              The same scale names, {palettes.length} sets of values.
            </h2>
            <p className="mt-4 max-w-prose text-ink-2">
              This is what makes the system portable rather than a theme. Every palette below
              declares the same keys; only the hexes differ.
            </p>

            <div className="mt-8 space-y-10">
              {palettes.map((p) => {
                const themeNames = Object.keys(p.themes);
                const light = p.themes[themeNames[0]];
                const reserved = realKeys(p.reserved);
                const why = lead(p);
                const auditSet = sets.find((s) => s.name === p.name);

                return (
                  <article key={p.name} className="border-t border-line pt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-display text-h2 font-semibold">{p.product}</h3>
                      <p className="font-mono text-label uppercase tracking-label text-ink-3">
                        {themeNames.length > 1 ? `${themeNames.join(" + ")} themes` : "single theme"}
                        {auditSet && ` · ${auditSet.screens} screens`}
                      </p>
                    </div>

                    {why && <p className="mt-3 max-w-prose text-small text-ink-2">{why}</p>}

                    <p className="mt-5 font-mono text-label uppercase tracking-label text-ink-3">Brand</p>
                    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {RAMP.filter((s) => light[`brand-${s}`]).map((s) => (
                        <Swatch key={s} name={`brand-${s}`} value={light[`brand-${s}`]} />
                      ))}
                    </div>

                    {RAMP.some((s) => light[`accent-${s}`]) && (
                      <>
                        <p className="mt-5 font-mono text-label uppercase tracking-label text-ink-3">Accent</p>
                        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                          {RAMP.filter((s) => light[`accent-${s}`]).map((s) => (
                            <Swatch key={s} name={`accent-${s}`} value={light[`accent-${s}`]} />
                          ))}
                        </div>
                      </>
                    )}

                    <p className="mt-5 font-mono text-label uppercase tracking-label text-ink-3">Ground &amp; ink</p>
                    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                      {GROUND.filter((k) => light[k]).map((k) => (
                        <Swatch key={k} name={k} value={light[k]} />
                      ))}
                    </div>

                    {reserved.length > 0 && (
                      <div className="mt-5 rounded-card border border-line bg-paper-2 p-4">
                        <p className="font-mono text-label uppercase tracking-label text-ink-3">
                          Reserved — {reserved.length} tokens, spoken for
                        </p>
                        <p className="mt-2 font-mono text-xs2 text-ink-2">{reserved.join(" · ")}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page">
            <Label>Type</Label>
            <h2 className="mt-3 max-w-measure font-display text-d2 font-semibold">
              Two surfaces, because a phone frame and a web page are not the same problem.
            </h2>
            <p className="mt-4 max-w-prose text-ink-2">
              A 390px frame wants fixed <code className="font-mono text-xs2">px</code> steps and a
              1120px page wants fluid <code className="font-mono text-xs2">rem</code> clamps.
              Forcing one on the other would be a worse system, not a more unified one — so the
              metric scales are per surface and everything that actually causes drift is shared.
            </p>

            <div className="tbl-scroll mt-7">
              <table className="tbl-wrap w-full border-collapse text-small">
                <caption className="sr-only">The mobile type scale</caption>
                <thead>
                  <tr className="border-b border-line-2 text-left">
                    <th scope="col" className="py-2 pr-4">Step</th>
                    <th scope="col" className="px-3 py-2">Size</th>
                    <th scope="col" className="px-3 py-2">Leading</th>
                    <th scope="col" className="px-3 py-2">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {mobileType.map(([step, spec]) => (
                    <tr key={step} className="border-b border-line">
                      <th scope="row" className="py-2 pr-4 text-left font-mono text-xs2">
                        text-{step}
                      </th>
                      <td className="nums px-3 py-2">{spec.size}</td>
                      <td className="nums px-3 py-2">{spec.leading ?? "—"}</td>
                      <td className="nums px-3 py-2">{spec.tracking ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-prose text-small text-ink-2">
              The first four steps were already byte-identical in all six token-driven sets — the
              strongest shared convention in the tree. The rest came from the one app that had a
              product scale at all. Emitting them into every app is what makes{" "}
              <code className="font-mono text-xs2">text-2xs</code> real: it was used 186 times
              across three apps and declared in one.
            </p>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page">
            <h2 className="max-w-measure font-display text-d2 font-semibold">
              Why it survives a framework change.
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="font-mono text-label uppercase tracking-label text-ink-3">Design</p>
                <p className="mt-2 text-small text-ink-2">
                  Plain HTML, Tailwind from a pinned CDN, no build step. Openable in a browser in
                  five years with no toolchain.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="font-mono text-label uppercase tracking-label text-ink-3">Mobile</p>
                <p className="mt-2 text-small text-ink-2">
                  The same scale names become the app&rsquo;s theme, so a class in a React Native
                  screen means what it meant in the wireframe — both are emitted from one file.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="font-mono text-label uppercase tracking-label text-ink-3">Web</p>
                <p className="mt-2 text-small text-ink-2">
                  Tailwind v4 defines a theme in CSS rather than in JavaScript, so the variable
                  block is the real theme almost verbatim. A port, not a translation.
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-prose text-ink-2">
              That is the whole return on the variable rule. The token layer was never coupled to a
              framework, so changing the framework does not touch a single screen.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
