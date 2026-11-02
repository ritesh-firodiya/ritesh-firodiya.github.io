import { StageMap } from "@/components/stage-map";
import type { Stages } from "@/lib/stages";

const FACTS = [
  { metric: "versions_total", label: "Versions cut" },
  { metric: "ios_versions_approved", label: "iOS approved" },
  { metric: "store_rejections_min", label: "Store rejections", min: true },
  { metric: "reverted_total", label: "Decisions reverted" },
  { metric: "experiments_discarded", label: "Experiments discarded" },
  { metric: "features_shelved", label: "Features shelved" },
];

/** A product's own stages, and where each surface stands. */
export function HowItShips({ name, stages }: { name: string; stages: Stages }) {
  const { surfaces, next, anyLive } = stages.status;
  return (
    <section className="glass mt-3 p-4 md:p-5" aria-labelledby="ships-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ships-h" className="font-bold">How it ships</h2>
        {stages.asOf && <p className="text-xs text-ink-3">As of {stages.asOf}</p>}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        The stages work on {name} goes through. I approve at the marked ones and can send them back. A dashed stage has not started. Tap a count to open it.
      </p>
      <StageMap map={stages.map} />
      {stages.history && (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm md:grid-cols-6">
            {FACTS.map((f) => {
              const n = stages.history?.[f.metric] ?? 0;
              return (
                <div key={f.metric}>
                  <dt className="text-xs text-ink-3">{f.label}</dt>
                  <dd className="font-mono font-bold">{f.min && n > 0 ? `${n}+` : n}</dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-2 text-xs text-ink-3">Turned down: my chat since 2 Oct 2026, read and sampled by hand. Approximate, and a minimum. Store rejections are a minimum too.</p>
        </>
      )}
      {(surfaces.length > 0 || next.length > 0) && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm md:grid-cols-2">
          {surfaces.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-3">{anyLive ? "Where each surface is" : "Why nothing is live yet"}</h3>
              <ul className="mt-1.5 grid gap-1 text-ink-2">
                {surfaces.map((s) => (
                  <li key={s.name}>
                    <b className="font-semibold text-ink">{s.name}</b> {s.what}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {next.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-3">Next up</h3>
              <p className="mt-1.5 text-ink-2">{next.join(" · ")}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
