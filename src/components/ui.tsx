import { Monitor, Smartphone } from "lucide-react";
import { type Product, stageOf, surfaceTags } from "@/lib/products";

/** The release state. The colour is derived; only the words are the product's. */
export function StatePill({ p, label }: { p: Product; label?: string }) {
  return <span className={`state state--${stageOf(p)}`}>{label ?? p.stageLabel}</span>;
}

export function Chips({ items }: { items: string[] }) {
  return (
    <p className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
    </p>
  );
}

const SURFACE = { mobile: { label: "Mobile", Icon: Smartphone }, web: { label: "Web", Icon: Monitor } } as const;

/** Mobile, Web, or both. */
export function SurfaceTags({ p }: { p: Product }) {
  return (
    <>
      {surfaceTags(p).map((s) => {
        const { label, Icon } = SURFACE[s];
        return (
          <span key={s} className="tag">
            <Icon size={12} aria-hidden /> {label}
          </span>
        );
      })}
    </>
  );
}
