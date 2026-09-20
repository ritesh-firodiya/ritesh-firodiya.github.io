import { MODEL, STATE, type Model, type PlatformState } from "@/lib/products";

const base =
  "inline-block whitespace-nowrap rounded-pill px-2.5 py-1 font-mono text-label uppercase tracking-label";

export function ModelPill({ model, children }: { model: Model; children?: React.ReactNode }) {
  const m = MODEL[model];
  return <span className={`${base} ${m.bg} ${m.fg}`}>{children ?? m.label}</span>;
}

export function StatePill({ state, children }: { state: PlatformState; children: React.ReactNode }) {
  const s = STATE[state];
  return <span className={`${base} ${s.bg} ${s.fg}`}>{children}</span>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-label uppercase tracking-label text-ink-3">{children}</p>
  );
}
