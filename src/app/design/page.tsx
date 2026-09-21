import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import {
  audit, totals, tally, measured, unmeasured, withTwoThemes, withReserved, palettes,
} from "@/lib/design";

export const metadata: Metadata = {
  title: "Design",
  description:
    "Every screen is drawn in HTML before any app code exists. The rules that produced nine design sets, the tokens behind them, and an honest account of where they drifted.",
};

/**
 * The rules were not written as a manifesto. They were extracted by reading
 * nine shared.css headers written months apart and noticing which arguments
 * kept being made independently. A rule one set follows is a preference; a
 * rule six sets arrived at separately is a finding.
 *
 * `measure` is the lint check that decides the tally. A rule with no check is
 * not softened into one — it says so, because a rule that cannot be measured
 * and pretends otherwise is worse than a rule that admits it.
 */
const RULES: {
  title: string;
  body: React.ReactNode;
  measure?: string[];
  stated?: string;
}[] = [
  {
    title: "One or two colours are reserved, and nothing else may use them",
    body: (
      <>
        In Imposter, green means Civilian and black means Imposter, so no category plate may
        be green. In Tic Tac Toe, blue is X and rose is O. A player reads across a noisy board
        in two seconds — if green can also mean “Food &amp; Drink” then the one colour carrying
        the whole game carries nothing.
      </>
    ),
    stated: `Declared by ${withReserved.length} of ${palettes.length} palettes`,
  },
  {
    title: "The wireframe is the spec",
    body: (
      <>
        When a screen and its wireframe disagree, the wireframe wins and the code is corrected.
        There is exactly one standing exception —{" "}
        <Link href="/design/drift" className="link-u">Charades</Link> — and it is written down
        rather than quietly done.
      </>
    ),
    stated: "House rule, one documented exception",
  },
  {
    title: "A screen with no HTML file does not ship",
    body: (
      <>
        Every state gets its own file — empty, loading, error, locked, offline. Not a note in a
        doc, a file. Across the estate that is {totals.screens.toLocaleString()} screens in{" "}
        {totals.sets} sets.
      </>
    ),
    stated: "House rule",
  },
  {
    title: "Tokens are defined once; a token with no variable has no utility",
    body: (
      <>
        The Tailwind config holds only <code className="font-mono text-xs2">var(--…)</code>; the
        stylesheet holds the values. The two cannot drift, because a literal compiled into a
        utility would paint two scopes the same and nothing in the markup would say why.
      </>
    ),
    measure: ["colors-are-vars", "vars-defined"],
  },
  {
    title: "No component class Tailwind can already express",
    body: (
      <>
        No <code className="font-mono text-xs2">.btn</code>,{" "}
        <code className="font-mono text-xs2">.card</code>,{" "}
        <code className="font-mono text-xs2">.chip</code> or{" "}
        <code className="font-mono text-xs2">.row</code>. This was the one contested rule — four
        sets for, four against, both argued in writing. It is settled now in favour of utilities,
        and the sets that disagree are being unwound rather than grandfathered.
      </>
    ),
    measure: ["no-component-classes"],
  },
  {
    title: "Name by role, never by hue",
    body: (
      <>
        <code className="font-mono text-xs2">brand</code>, not{" "}
        <code className="font-mono text-xs2">green</code>. A repalette becomes a one-file change
        and no class ever lies about what it means. One set named its ramp{" "}
        <code className="font-mono text-xs2">teal</code>, which shadowed Tailwind&rsquo;s own teal
        and left four stops silently resolving to stock values.
      </>
    ),
    measure: ["canonical-keys"],
  },
  {
    title: "A dark theme is a scope remap, not a second set of utilities",
    body: (
      <>
        The same token names are redefined inside a scope, so a utility follows whichever scope it
        lands in. No markup changes, and nothing can be dark in one place and light in another.
        The app that does this writes zero <code className="font-mono text-xs2">dark:</code>{" "}
        utilities; the two that use the prefix instead carry 371 between them.
      </>
    ),
    stated: `Complete in ${withTwoThemes.length} of ${palettes.length} palettes`,
  },
  {
    title: "Every class must resolve to a token that exists",
    body: (
      <>
        A class that resolves to nothing does not warn. It just quietly does not paint.{" "}
        <code className="font-mono text-xs2">text-2xs</code> was used 186 times across three apps
        and declared in one; <code className="font-mono text-xs2">text-tertiary</code> was used
        240 times in a fourth with no such colour key anywhere.
      </>
    ),
    measure: ["classes-resolve"],
  },
  {
    title: "Write down what was deleted, and why",
    body: (
      <>
        The best argument for rule 4 in this whole corpus is a deletion note. One set records that
        three amber tokens were referenced but never defined — so a shadow the original design
        called a core decision silently resolved to nothing on all 26 primary buttons, for months,
        with no error anywhere. Nobody noticed until the tokens were audited. That paragraph is
        worth more than the rule it justifies.
      </>
    ),
    stated: "Not measurable, and the most valuable of the nine",
  },
];

function Tally({ rule }: { rule: (typeof RULES)[number] }) {
  if (!rule.measure) {
    return <p className="mt-3 font-mono text-label uppercase tracking-label text-ink-3">{rule.stated}</p>;
  }
  const { pass, of } = tally(rule.measure);
  return (
    <p className="mt-3 font-mono text-label uppercase tracking-label text-ink-3">
      Passes in {pass} of {of} measured sets
    </p>
  );
}

export default function DesignPage() {
  return (
    <>
      <SiteHeader active="/design" />
      <main>
        <section className="px-gutter pt-section">
          <div className="mx-auto max-w-page">
            <Label>
              Design · {totals.sets} sets · {totals.screens.toLocaleString()} screens · audited{" "}
              {audit.generatedAt}
            </Label>
            <h1 className="mt-3 max-w-measure font-display text-d1 font-semibold">
              Every screen is drawn in HTML before any app code exists.
            </h1>
            <p className="mt-5 max-w-prose text-lead text-ink-2">
              {totals.sets} products, each with a design set of plain HTML and Tailwind — no React,
              no build step. A screen with no HTML file does not ship. This section is that system,
              the rules it produced, and an honest account of where it has drifted.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/design/system"
                className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent"
              >
                The system →
              </Link>
              <Link href="/design/gallery" className="inline-flex items-center rounded-pill border border-line-2 px-4 py-2 text-small transition hover:border-ink">
                The screens
              </Link>
              <Link href="/design/drift" className="inline-flex items-center rounded-pill border border-line-2 px-4 py-2 text-small transition hover:border-ink">
                Where it drifted
              </Link>
            </div>
          </div>
        </section>

        <section className="px-gutter py-section">
          <div className="mx-auto max-w-page">
            <Label>The rules</Label>
            <h2 className="mt-3 max-w-measure font-display text-d2 font-semibold">
              Nine rules, none of them invented on purpose.
            </h2>
            <p className="mt-4 max-w-prose text-ink-2">
              Each was found by reading nine design systems written months apart and noticing which
              arguments kept being made independently. A rule one set follows is a preference. A
              rule six sets arrived at separately is a finding. Where a rule can be checked by a
              script, the tally below is the script&rsquo;s, not an estimate —{" "}
              <Link href="/design/drift" className="link-u">the lint</Link> runs on every set.
            </p>

            <ol className="mt-8 grid gap-5 md:grid-cols-2">
              {RULES.map((rule, i) => (
                <li key={rule.title} className="rounded-card border border-line bg-surface p-5 shadow-lift">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-label text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-h3 font-semibold">{rule.title}</h3>
                  </div>
                  <p className="mt-3 text-small text-ink-2">{rule.body}</p>
                  <Tally rule={rule} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto max-w-page">
            <div className="rounded-card border border-line bg-paper-2 p-6">
              <Label>Where it stands</Label>
              <p className="mt-3 max-w-prose text-ink-2">
                {measured.length} of {totals.sets} sets have a token layer the lint can read.{" "}
                {unmeasured.length > 0 && (
                  <>
                    The other {unmeasured.length} —{" "}
                    {unmeasured.map((s) => s.product).join(", ")} — carry an inline{" "}
                    <code className="font-mono text-xs2">&lt;style&gt;</code> block per file and no
                    config at all, so most checks cannot run on them. They are counted as outside
                    the system rather than clean; a lint that rewards having nothing to check is
                    worse than no lint.
                  </>
                )}
              </p>
              <Link href="/design/drift" className="link-u mt-4 inline-block text-small">
                The full matrix, and the order it gets fixed in →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
