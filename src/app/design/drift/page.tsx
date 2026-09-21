import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { Cell, CheckName, Verdict, fmt } from "@/components/design-bits";
import { audit, sets, checkOf, measured, unmeasured } from "@/lib/design";

export const metadata: Metadata = {
  title: "Where the design system drifted",
  description:
    "The lint output for every design set in the estate — which rules are broken, by whom, by how much, and the order they get fixed in.",
};

const CHECK_IDS = sets[0]?.checks.map((c) => c.id) ?? [];

/**
 * Cheapest-to-change first, not worst-first. A retoken on a set with no app
 * behind it costs nothing downstream; a retoken on a shipped app means
 * re-reviewing screens a person has already approved.
 */
const ORDER = [
  {
    name: "tic-tac-toe",
    head: "Tic Tac Toe — smallest set, proves the migration",
    body: "Six screens, and the whole token contract exists only as a drawing: the wireframes declare about thirty tokens and the app's global.css is two import lines. It also carries the only rounded-2xl in the estate that means 28px instead of 24px. Small enough that every check gets exercised on it before anything expensive moves.",
  },
  {
    name: "imposter",
    head: "Imposter — mostly a rename",
    body: "Already zero default-palette classes and zero inline styles. What it needs is the rename, the deletion of role-mrwhite tokens that survived the feature being cut from the game, and one value reconciled where the runtime drifted from the design.",
  },
  {
    name: "aakalan",
    head: "Aakalan — the Rule 5 workload",
    body: "The richest set in the estate and the only complete two-theme one, so its dark palette becomes the reference implementation. It is also 190 CSS selectors that have to be unwound to utilities across 19 screens. Its own notes argue the other side — thirty copies of one row's nine declarations is not consistency either — and that argument is reasonable. The rule is settled anyway; the cost is real and is stated here rather than discovered in the middle of it.",
  },
  {
    name: "charades",
    head: "Charades — live, and it needed a decision first",
    body: "Hue names and literal hex, but the real problem was written in its own config under a KNOWN DRIFT heading: the wireframe ramp sat one step off the app's. Charades ships, so moving the app would change a released product's colours while moving the wireframe changes nothing a user sees. The wireframe moves. That inverts the house rule exactly once, on purpose, and this sentence is the record of it.",
  },
  {
    name: "askcal",
    head: "AskCal — two design systems in one folder",
    body: "Retoken, plus merging away a second parallel stylesheet whose protein, carbs and fat tokens disagree with the main one for the same names. No public release yet, so the screens can change without anyone having to be told.",
  },
  {
    name: "plan-kid",
    head: "Plan-Kid — the largest violating set and the cheapest to fix",
    body: "55 screens and no app code yet, so nothing has been built against it. Its own config already says the app's theme must be generated from these tokens rather than re-picked by eye — doing it now is the difference between that sentence being true and being aspirational. It also carries 240 uses of text-tertiary, a class with no colour key behind it anywhere.",
  },
  {
    name: "property-app",
    head: "DwarSeva Property — rebuild, do not migrate",
    body: "Every file carries its own inline stylesheet and the default palette, with no token config at all. It is also the most ambitious set in the corpus — the only one with web, mobile and an admin surface. It gets rebuilt when the product is real, not patched now.",
  },
  {
    name: "chitragupt",
    head: "Chitragupt — rebuild, and reconcile two halves first",
    body: "The largest set in the estate by a wide margin and the one furthest outside the system. Its own website already has a real light-and-dark token system that the mobile app it belongs to does not, and there is a duplicate copy of the whole design tree to delete before anything is generated.",
  },
  {
    name: "trunk",
    head: "Trunk — collapse four copies into one",
    body: "A separate venture with its own brand and its own overriding CLAUDE.md, so it is last. Its token set is hand-maintained in four places, two of which already disagree, and both of its stylesheets name a source-of-truth file that no longer exists on disk.",
  },
];

export default function DriftPage() {
  const totalViolations = sets.reduce(
    (n, s) => n + s.checks.reduce((m, c) => m + (c.ok === false ? c.count : 0), 0),
    0,
  );
  /* At v1.0.0 nothing has been migrated yet, so "N of 9 break the rules" would
     read as "9 of 9" — true, and a worse sentence than the plain one. The
     headline follows the number instead of the number following the headline. */
  const clean = sets.filter((s) => s.verdict === "canonical").length;
  const headline =
    clean === 0
      ? `None of the ${sets.length} sets passes yet.`
      : `${sets.length - clean} of the ${sets.length} sets break the rules.`;

  return (
    <>
      <SiteHeader active="/design" />
      <main>
        <section className="px-gutter pt-section">
          <div className="mx-auto max-w-page">
            <Link href="/design" className="link-u text-small text-ink-2">← Design</Link>
            <Label>Drift · audited {audit.generatedAt} · design-system {audit.version}</Label>
            <h1 className="mt-3 max-w-measure font-display text-d1 font-semibold">{headline}</h1>
            <p className="mt-5 max-w-prose text-lead text-ink-2">
              {clean === 0 && (
                <>
                  The canon landed before any set was migrated onto it, so this is the starting
                  line rather than a report card — {measured.length} sets have a token layer to
                  check and {unmeasured.length} have none at all.{" "}
                </>
              )}
              Publishing a design system without publishing where it fails is marketing, not
              documentation. This page is the lint output. It is linked from the design index at
              the same weight as the system itself, on purpose.
            </p>
            <p className="mt-4 max-w-prose text-small text-ink-3">
              Generated from <code className="font-mono text-xs2">src/data/design-audit.json</code>,
              which <code className="font-mono text-xs2">scripts/lint-designs.mjs</code> writes. It
              was a hand-written table until it had a route, which made it accurate on the day it
              was drawn and decaying from then on.
            </p>
          </div>
        </section>

        <section className="px-gutter py-section">
          <div className="mx-auto max-w-page">
            <div className="tbl-scroll">
              <table className="tbl-wrap w-full border-collapse text-small">
                <caption className="sr-only">Design system compliance by set and rule</caption>
                <thead>
                  <tr className="border-b border-line-2 text-left align-bottom">
                    <th scope="col" className="tbl-stick py-2 pr-4">Set</th>
                    <th scope="col" className="px-3 py-2 text-right">Screens</th>
                    {CHECK_IDS.map((id) => (
                      <th key={id} scope="col" className="px-3 py-2 text-center">
                        <CheckName id={id} />
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-left">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((s) => (
                    <tr key={s.name} className="border-b border-line">
                      <th scope="row" className="tbl-stick py-2 pr-4 text-left font-medium">
                        {s.product}
                        <span className="mt-0.5 block font-mono text-label text-ink-3">{s.path}</span>
                      </th>
                      <td className="nums px-3 py-2 text-right">{s.screens}</td>
                      {CHECK_IDS.map((id) => (
                        <Cell key={id} check={checkOf(s, id)} />
                      ))}
                      <td className="px-3 py-2"><Verdict verdict={s.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-small text-ink-3">
              A number is how many violations the check found, not a score —{" "}
              <b className="text-ink-2">{fmt(totalViolations)}</b> in total.{" "}
              <b className="text-ink-2">n/a</b> means the check could not run because the set has no
              token layer, which is counted as outside the system rather than clean. A{" "}
              <span className="text-accent">•</span> marks a check that fails the build.
            </p>
          </div>
        </section>

        <section className="px-gutter pb-section">
          <div className="mx-auto grid max-w-page gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="max-w-measure font-display text-d2 font-semibold">
                The order they get fixed in, and why that order.
              </h2>
              <p className="mt-4 max-w-prose text-ink-2">
                Not worst-first. Cheapest-to-change first, because a retoken on a design set with
                no app behind it costs nothing downstream, and a retoken on a shipped app means
                re-reviewing every screen a person has already approved.
              </p>
              <ol className="mt-7 space-y-5">
                {ORDER.map((step, i) => {
                  const s = sets.find((x) => x.name === step.name);
                  return (
                    <li key={step.name} className="flex gap-4">
                      <span className="mt-0.5 font-mono text-label text-ink-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-h3 font-semibold">{step.head}</h3>
                        {s && (
                          <p className="mt-1 font-mono text-label uppercase tracking-label text-ink-3">
                            {s.screens} screens · {s.verdict}
                          </p>
                        )}
                        <p className="mt-2 max-w-prose text-small text-ink-2">{step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <aside className="space-y-5">
              <div className="rounded-card border border-line bg-paper-2 p-5">
                <Label>Why publish this at all</Label>
                <p className="mt-3 text-small text-ink-2">
                  A design system page that shows only the compliant examples is a portfolio piece.
                  The useful artifact is the one that says which rules got broken, by whom, and what
                  it would cost to fix — because that is the part another team actually recognises.
                </p>
                <p className="mt-3 text-small text-ink-2">
                  It is also the same standard applied to the apps themselves on the{" "}
                  <Link href="/products" className="link-u">products page</Link>: state the real
                  model, including the inconvenient one.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5">
                <Label>How it is measured</Label>
                <p className="mt-3 text-small text-ink-2">
                  {CHECK_IDS.length} checks read each set&rsquo;s token config, its stylesheets, its
                  screen markup and — where there is one — the app source behind it.
                </p>
                <ul className="mt-3 space-y-1.5 text-small text-ink-2">
                  {CHECK_IDS.map((id) => (
                    <li key={id} className="font-mono text-xs2">
                      {id}
                      {audit.blocking.includes(id) && <span className="text-accent"> •</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-small text-ink-3">
                  The one that catches real bugs is <b>vars-defined</b> — see rule 09 on the{" "}
                  <Link href="/design" className="link-u">design index</Link>.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5">
                <Label>Coverage</Label>
                <p className="mt-3 text-small text-ink-2">
                  {measured.length} of {sets.length} sets have a token layer the lint can read.
                  Every check that could not run is shown as n/a rather than omitted, so the
                  denominator stays honest.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
