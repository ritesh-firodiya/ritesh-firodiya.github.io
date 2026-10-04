"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, SearchX } from "lucide-react";

/**
 * Every page of one wiki, grouped by type, with a filter.
 *
 * A filter, not a search: there is no server to search with, and a name is
 * what a reader half-remembers. It narrows by page name only, and says so when
 * nothing matches.
 */
export type Group = { type: string; label: string; second: string; rows: { slug: string; owns: string; href: string }[] };

export function WikiIndex({ groups, total }: { groups: Group[]; total: number }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = groups
    .map((g) => ({ ...g, rows: needle ? g.rows.filter((r) => r.slug.toLowerCase().includes(needle)) : g.rows }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <label className="card mt-6 flex items-center gap-3 px-4 py-3">
        <Search size={16} className="text-ink-3" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter pages by name"
          aria-label="Filter pages by name"
          className="w-full bg-transparent text-base outline-none placeholder:text-ink-4"
        />
      </label>

      {shown.length === 0 && (
        <div className="slot mt-10 rounded-lg px-6 py-16 text-center">
          <SearchX size={32} className="mx-auto text-ink-3" aria-hidden />
          <h2 className="mt-4 text-h3 font-bold">No page matches “{q.trim()}”.</h2>
          <p className="mt-2 text-base text-ink-2">The filter looks at page names only, across all {total} pages.</p>
          <button type="button" onClick={() => setQ("")} className="btn btn-quiet mt-6">
            Clear the filter
          </button>
        </div>
      )}

      {shown.map((g) => (
        <section key={g.type} id={g.type} className="scroll-mt-24">
          <h2 className="mt-10 text-h3 font-bold">
            {g.label} <span className="font-mono text-sm font-normal text-ink-3">{g.rows.length}</span>
          </h2>
          <div className="card mt-3 overflow-hidden">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col" className="w-[38%]">Page</th>
                  <th scope="col">{g.second}</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.slug}>
                    <td className="break-words">
                      <Link href={r.href} className="text-link">{r.slug}</Link>
                    </td>
                    <td className="text-ink-2">{r.owns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
