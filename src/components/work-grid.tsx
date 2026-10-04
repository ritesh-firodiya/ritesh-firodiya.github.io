"use client";

import { Fragment, useState, type ReactNode } from "react";

/**
 * The state filter on /work.
 *
 * The cards and rows are rendered on the server and passed in already built;
 * this only decides which of them show. So the page is complete without
 * JavaScript, and the filter is the one thing that needs it.
 */
export type Filter = "all" | "live" | "test" | "build" | "draft";
export type Item = { key: string; stage: Exclude<Filter, "all">; node: ReactNode };

export function WorkGrid({
  counts,
  cards,
  rows,
}: {
  counts: { key: Filter; label: string; n: number }[];
  cards: Item[];
  rows: Item[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const show = (i: Item) => filter === "all" || i.stage === filter;
  const shownCards = cards.filter(show);
  const shownRows = rows.filter(show);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by state">
        {counts.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={filter === c.key}
            onClick={() => setFilter(c.key)}
            className={`chip${filter === c.key ? " chip--on" : ""}`}
          >
            {c.label} <span className="font-mono">{c.n}</span>
          </button>
        ))}
      </div>

      {shownCards.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shownCards.map((c) => <Fragment key={c.key}>{c.node}</Fragment>)}</div>
      )}

      {shownRows.length > 0 && (
        <>
          <h2 className="section-title mt-14">Not shipped yet.</h2>
          <p className="mt-2 max-w-[60ch] text-base text-ink-2">Code or designs exist, and nothing is installable. Each row says which.</p>
          <div className="card mt-6 overflow-hidden">{shownRows.map((r) => <Fragment key={r.key}>{r.node}</Fragment>)}</div>
        </>
      )}
    </>
  );
}
