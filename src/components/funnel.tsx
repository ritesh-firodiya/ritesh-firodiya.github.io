import type { CSSProperties } from "react";
import { FLOW_STAGE, duration, type Flow } from "@/lib/flow";
import type { Funnel as Release, StageId } from "@/lib/funnel";

interface FunnelProps {
  name: string;
  flow: Flow;
  /** Feature counts and each surface's release state; null when the product has neither. */
  release: Release | null;
}

/** How a surface's stage reads after its name and version. */
const SURFACE_STATE: Partial<Record<StageId, string>> = {
  testers: "with testers",
  review: "in store review",
  deployed: "deployed, not launched",
  live: "live",
};

function Status({ release, live }: { release: Release; live: boolean }) {
  const surfaces = release.stages.flatMap((s) => s.items.filter((i) => i.surface).map((i) => ({ ...i, state: SURFACE_STATE[s.id] })));
  if (surfaces.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-3">{live ? "Where each surface is" : "Why nothing is live yet"}</h3>
      <ul className="mt-1.5 grid gap-1 text-ink-2">
        {surfaces.map((s) => (
          <li key={s.name}>
            <b className="font-semibold text-ink">{s.name}</b> {[s.detail, s.state].filter(Boolean).join(" · ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NextUp({ release }: { release: Release }) {
  const n = (id: StageId) => release.stages.find((s) => s.id === id)?.items.length ?? 0;
  const parts = [
    n("plan") && `${n("plan")} planned`,
    n("build") && `${n("build")} building`,
    release.setAside.shelved && `${release.setAside.shelved} shelved`,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-3">Next up</h3>
      <p className="mt-1.5 text-ink-2">{parts.join(" · ")}</p>
    </div>
  );
}

/** Every conversation about the product, and how far it got. */
export function Funnel({ name, flow, release }: FunnelProps) {
  const { stages, hops, slowest, drop, asOf, since } = flow;
  const max = Math.max(1, ...stages.map((s) => s.count));
  const share = (i: number) => Math.round(((stages[i]?.count ?? 0) * 100) / max);
  const cols = { "--stages": stages.length } as CSSProperties;
  const slowHop = hops.find((h) => h.to === slowest);
  const dropHop = hops.find((h) => h.to === drop);
  const live = (stages.find((s) => s.id === "live")?.count ?? 0) > 0;

  return (
    <section className="glass mt-3 p-4 md:p-5" aria-labelledby="funnel-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="funnel-h" className="font-bold">
          How it ships
        </h2>
        {asOf && <p className="text-xs text-ink-3">As of {asOf}</p>}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        Every conversation I had with Claude about {name}{since ? ` since ${since}` : ""}, and how far it got. Each counts at every stage up to the
        furthest it reached.
      </p>
      <div
        className="funnel mt-4"
        style={cols}
        role="img"
        aria-label={`${name}: ${stages.map((s) => `${s.count} ${FLOW_STAGE[s.id].label.toLowerCase()}`).join(", ")}`}
      >
        {stages.map((s, i) => (
          <div
            key={s.id}
            className={`funnel-band${s.id === drop ? " funnel-band--wait" : ""}`}
            style={{ "--a": share(i), "--b": share(i + 1 < stages.length ? i + 1 : i) } as CSSProperties}
          />
        ))}
      </div>
      {/* A list on a phone, where nine columns of words cannot fit; one column per band from md. */}
      <ol className="funnel-heads mt-2" style={cols}>
        {stages.map((s, i) => {
          const hop = i > 0 ? hops[i - 1] : null;
          return (
            <li key={s.id} className="funnel-head">
              <p className={`funnel-n${s.id === drop ? " text-warn" : ""}`}>{s.count}</p>
              <div>
                <p className="text-xs font-semibold text-ink">{FLOW_STAGE[s.id].label}</p>
                <p className="text-2xs text-ink-3">{FLOW_STAGE[s.id].counts}</p>
                {/* Nothing reached the stage before: no share to state. */}
                {hop && hop.share !== null && (
                  <p className={`mt-1 font-mono text-2xs ${s.id === slowest ? "text-warn" : "text-ink-3"}`}>
                    {hop.share}% · {duration(hop.medianHours)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {(slowHop || dropHop) && (
        <p className="mt-4 text-sm text-ink-2">
          {slowHop && (
            <>
              Slowest step:{" "}
              <b className="text-ink">
                {FLOW_STAGE[slowHop.from].label} → {FLOW_STAGE[slowHop.to].label}
              </b>
              , median {duration(slowHop.medianHours)}.{" "}
            </>
          )}
          {dropHop && (
            <>
              Biggest drop:{" "}
              <b className="text-ink">
                {FLOW_STAGE[dropHop.from].label} → {FLOW_STAGE[dropHop.to].label}
              </b>
              , {stages.find((s) => s.id === dropHop.from)?.count} to {stages.find((s) => s.id === dropHop.to)?.count}.
            </>
          )}
        </p>
      )}
      {release && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm empty:hidden md:grid-cols-2">
          <Status release={release} live={live} />
          <NextUp release={release} />
        </div>
      )}
    </section>
  );
}
