import { Activity, Hammer, Lightbulb, ListChecks, Megaphone, PencilRuler, Rocket, Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LIFECYCLE, VALUE, type Verdict } from "@/lib/canon";

/** What canon is worth: four glass cards, each naming its mechanism. `extra`
 *  adds a line of real output under a card, keyed by its title. */
export function Value({ extra = {} }: { extra?: Partial<Record<(typeof VALUE)[number]["title"], ReactNode>> }) {
  return (
    <ol className="mt-5 grid gap-3 md:grid-cols-2">
      {VALUE.map((v, i) => (
        <li key={v.title} className="glass flex flex-col p-4">
          <p className="flex items-center gap-2.5 text-h3 font-bold">
            <span className="step-num">{i + 1}</span> {v.title}
          </p>
          <p className="mt-2 text-base text-ink-2">{v.body}</p>
          {extra[v.title] && <p className="mt-2 text-sm text-ink-2">{extra[v.title]}</p>}
          <p className="mt-auto pt-4 font-mono text-2xs text-ink-3">{v.how}</p>
        </li>
      ))}
    </ol>
  );
}

/** One verdict: the request as a quote, PUSH BACK, and why. */
export function VerdictCard({ v, long = false }: { v: Verdict; long?: boolean }) {
  return (
    <article className="glass flex flex-col p-4">
      <p className="ask">{v.ask}</p>
      <p className="mt-4">
        <span className="verdict verdict--push">PUSH BACK</span>
      </p>
      {long ? (
        <ul className="mt-3 grid gap-1.5 text-sm text-ink-2">
          {v.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-2">{v.summary}</p>
      )}
      <p className="mt-auto pt-4 font-mono text-2xs text-ink-3">{long ? v.sources : v.sources.split(" · ")[0]}</p>
    </article>
  );
}

const ICON: Record<(typeof LIFECYCLE)[number]["icon"], LucideIcon> = {
  lightbulb: Lightbulb, search: Search, "list-checks": ListChecks, "pencil-ruler": PencilRuler,
  hammer: Hammer, rocket: Rocket, megaphone: Megaphone, activity: Activity,
};

/** The eight stages on one gradient line: down on a phone, across from md. */
export function Lifecycle() {
  return (
    <ol className="pdlc mt-5 grid gap-4 md:grid-cols-8 md:gap-2">
      {LIFECYCLE.map((l) => {
        const Icon = ICON[l.icon];
        return (
          <li key={l.stage} className="flex gap-3 md:flex-col md:items-center md:text-center">
            <span className="pdlc-dot">
              <Icon size={16} aria-hidden />
            </span>
            <span>
              <b className="block text-sm">{l.stage}</b>
              <span className="block text-xs text-ink-3">{l.keeps}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
