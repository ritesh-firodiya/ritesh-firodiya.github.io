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

/** The process and the proof in one table: the eight stages across, what each
 *  leaves behind under its name, and one row of dots per project. */
export function Board({ products }: { products: Product[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="tbl board min-w-[820px]">
        <thead>
          <tr>
            <th scope="col">Project</th>
            {STAGES.map((s, i) => {
              const Icon = ICON[s.icon];
              return (
                <th key={s.key} scope="col" title={s.what}>
                  <span className="flex items-center gap-1.5 text-ink">
                    <Icon size={14} className="text-brand-500" aria-hidden /> {i + 1}. {s.name}
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
              {levelsOf(p).map((v, i) => (
                <td key={STAGES[i].key}>
                  <span className={DOT[v]} role="img" aria-label={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} title={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} />
                </td>
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
