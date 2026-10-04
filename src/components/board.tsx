import Link from "next/link";
import { Activity, Hammer, Lightbulb, ListChecks, Megaphone, PencilRuler, Rocket, Search, type LucideIcon } from "lucide-react";
import { STAGES, LEVEL_LABEL, levelsOf, type Level } from "@/lib/board";
import type { Product } from "@/lib/products";

const ICON: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  search: Search,
  "list-checks": ListChecks,
  "pencil-ruler": PencilRuler,
  hammer: Hammer,
  rocket: Rocket,
  megaphone: Megaphone,
  activity: Activity,
};
const DOT: Record<Level, string> = { 0: "dot dot--none", 1: "dot dot--half", 2: "dot" };

/**
 * The process and the proof in one place: the eight stages, what each leaves
 * behind, and one row of dots per project.
 *
 * Written for the phone first: a key of the stages, then each project as its
 * name over eight dots. From `md` up there is room for the table.
 */
export function Board({ products }: { products: Product[] }) {
  const dots = (p: Product) =>
    levelsOf(p).map((v, i) => (
      <span key={STAGES[i].key} className={DOT[v]} role="img" aria-label={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} title={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} />
    ));

  return (
    <div className="card overflow-hidden">
      <div className="md:hidden">
        <ol className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-b border-line bg-muted p-3 text-xs">
          {STAGES.map((s, i) => (
            <li key={s.key}>
              <b className="font-bold">
                {i + 1}. {s.name}
              </b>{" "}
              <span className="text-ink-3">{s.leaves}</span>
            </li>
          ))}
        </ol>
        <ul>
          {products.map((p) => (
            <li key={p.slug} className="border-b border-line px-3 py-2.5 last:border-b-0">
              <Link href={`/products/${p.slug}/`} className="text-base font-semibold">
                {p.name}
              </Link>
              <div className="mt-1.5 grid grid-cols-8">{dots(p)}</div>
            </li>
          ))}
        </ul>
      </div>

      <table className="tbl board hidden md:table">
        <thead>
          <tr>
            <th scope="col">Project</th>
            {STAGES.map((s, i) => {
              const Icon = ICON[s.icon];
              return (
                <th key={s.key} scope="col" title={s.what}>
                  <span className="flex items-center gap-1.5 text-ink">
                    <Icon size={14} className="shrink-0 text-brand-500" aria-hidden /> {i + 1}. {s.name}
                  </span>
                  <span className="board-leaves">{s.leaves}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug}>
              <td>
                <Link href={`/products/${p.slug}/`} className="font-semibold hover:text-brand-500">
                  {p.name}
                </Link>
              </td>
              {dots(p).map((d) => (
                <td key={d.key}>{d}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BoardLegend() {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
      <span className="inline-flex items-center gap-1.5">
        <span className="dot" aria-hidden /> Done
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="dot dot--half" aria-hidden /> Under way
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="dot dot--none" aria-hidden /> Not started
      </span>
    </p>
  );
}
