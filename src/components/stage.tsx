import Link from "next/link";
import { Activity, Hammer, Lightbulb, ListChecks, Megaphone, PencilRuler, Rocket, Search, type LucideIcon } from "lucide-react";
import { STAGES, LEVEL_LABEL, levelsOf, type Level } from "@/lib/board";
import type { Product } from "@/lib/products";

export const STAGE_ICON: Record<string, LucideIcon> = {
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

/** The eight stages as a line. With `levels`, it is filled to where one
 *  product has got; without, it is the process itself. */
export function StageTrack({ levels }: { levels?: Level[] }) {
  return (
    <div className="overflow-x-auto">
      <ol className="track min-w-[760px]">
        {STAGES.map((s, i) => {
          const Icon = STAGE_ICON[s.icon];
          const v = levels?.[i];
          const mod = v === 2 ? " track-step--done" : v === 1 ? " track-step--half" : "";
          return (
            <li key={s.key} className={`track-step${mod}`}>
              <span className="track-pin">
                <Icon size={16} aria-hidden />
              </span>
              <span className="font-mono text-2xs text-ink-3">{v === undefined ? `0${i + 1}` : LEVEL_LABEL[v]}</span>
              <span className="text-base font-bold">{s.name}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Projects down, stages across, one dot per cell. */
export function Board({ products }: { products: Product[] }) {
  return (
    <table className="tbl min-w-[760px]">
      <thead>
        <tr>
          <th scope="col">Project</th>
          {STAGES.map((s) => (
            <th key={s.key} scope="col" className="text-center">
              {s.name}
            </th>
          ))}
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
              <td key={STAGES[i].key} className="text-center">
                <span className={DOT[v]} role="img" aria-label={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} title={`${STAGES[i].name}: ${LEVEL_LABEL[v]}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function BoardLegend() {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
      <span className="inline-flex items-center gap-2">
        <span className="dot" aria-hidden /> Done
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="dot dot--half" aria-hidden /> Under way
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="dot dot--none" aria-hidden /> Not started
      </span>
    </p>
  );
}
