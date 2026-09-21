import { isBlocking, type Check } from "@/lib/design";

/**
 * A pass/fail cell that a colourblind reader can still read.
 *
 * globals.css already ships .cell-pass / .cell-fail / .cell-na with a glyph as
 * well as a colour — they were written for this table before it had a route.
 */
export function Cell({ check }: { check: Check | undefined }) {
  /* .cell-na already draws its own glyph via ::before, so the cell carries no
     text of its own — "–n/a" was the first version and read as a typo. The
     reason the check could not run lives in the title. */
  if (!check) return <td className="cell-na px-3 py-2 text-center text-xs2" />;
  if (check.ok === null) {
    return <td className="cell-na px-3 py-2 text-center text-xs2" title={check.detail} />;
  }
  if (check.ok) return <td className="cell-pass px-3 py-2 text-center text-xs2">ok</td>;
  return (
    <td className="cell-fail px-3 py-2 text-center text-xs2 nums" title={check.detail}>
      {fmt(check.count)}
    </td>
  );
}

/** 31810 reads as 31.8k. The exact number is in the title attribute. */
export function fmt(n: number) {
  return n >= 10000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function CheckName({ id }: { id: string }) {
  return (
    <span className="font-mono text-label uppercase tracking-label">
      {id.replace(/-/g, " ")}
      {isBlocking(id) && <span className="text-accent"> •</span>}
    </span>
  );
}

/** A colour chip that shows the value, because a swatch alone is not a token. */
export function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="min-w-0">
      <div
        className="h-12 w-full rounded-[10px] border border-line"
        style={{ background: value }}
      />
      <p className="mt-1.5 truncate font-mono text-label text-ink-2">{name}</p>
      <p className="truncate font-mono text-label text-ink-3">{value}</p>
    </div>
  );
}

export function Verdict({ verdict }: { verdict: string }) {
  const tone: Record<string, string> = {
    canonical: "bg-live-wash text-live",
    "near-clean": "bg-beta-wash text-beta",
    "older generation": "bg-build-wash text-build",
    drifted: "bg-accent-wash text-accent",
    "outside the system": "bg-design-wash text-design",
  };
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-pill px-2.5 py-1 font-mono text-label uppercase tracking-label ${tone[verdict] ?? "bg-paper-2 text-ink-2"}`}
    >
      {verdict}
    </span>
  );
}
