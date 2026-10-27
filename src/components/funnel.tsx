import type { CSSProperties } from "react";
import { STAGE_LABEL, helpAt, type Funnel as FunnelData, type FunnelItem, type Stage } from "@/lib/funnel";

/** A long stage shows this many items, then folds the rest. */
const SHOWN = 4;

interface FunnelProps {
  name: string;
  funnel: FunnelData;
  modules: string[];
}

function Item({ item }: { item: FunnelItem }) {
  if (!item.surface) return <li>{item.name}</li>;
  return (
    <li>
      <b className="font-semibold text-ink">{item.name}</b>
      {item.detail && <span className="block text-xs text-ink-3">{item.detail}</span>}
    </li>
  );
}

function Items({ s }: { s: Stage }) {
  /* An empty stage: its 0 says so. On a phone it takes no room at all. */
  if (s.count === 0) return <div className="hidden md:block" />;
  const shown = s.items.slice(0, SHOWN);
  const rest = s.items.slice(SHOWN);
  return (
    <div>
      <p className="text-xs font-semibold text-ink-3 md:hidden">{STAGE_LABEL[s.id]}</p>
      <ul className="mt-1 grid gap-1.5 text-ink-2 md:mt-0">
        {shown.map((i) => (
          <Item key={i.name} item={i} />
        ))}
        {s.shipped > 0 && <li>{s.shipped} shipped features in this build</li>}
      </ul>
      {rest.length > 0 && (
        <details className="mt-1.5 text-ink-2">
          <summary className="cursor-pointer text-xs text-ink-3">{rest.length} more</summary>
          <ul className="mt-1.5 grid gap-1.5">
            {rest.map((i) => (
              <Item key={i.name} item={i} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/** One band per stage, its thickness the stage's count, sloping into the next. */
export function Funnel({ name, funnel, modules }: FunnelProps) {
  const { stages, waits, setAside, asOf } = funnel;
  const max = Math.max(1, ...stages.map((s) => s.count));
  const share = (s?: Stage) => Math.round(((s?.count ?? 0) * 100) / max);
  const cols = { "--stages": stages.length } as CSSProperties;
  const aside = [setAside.shelved && `${setAside.shelved} shelved`, setAside.superseded && `${setAside.superseded} superseded`].filter(Boolean);
  const help = waits ? helpAt(waits, modules) : [];

  return (
    <section className="glass mt-3 p-4 md:p-5" aria-labelledby="funnel-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="funnel-h" className="font-bold">
          How it ships
        </h2>
        {asOf && <p className="text-xs text-ink-3">Release state as of {asOf}</p>}
      </div>
      <div
        className="funnel mt-4"
        style={cols}
        role="img"
        aria-label={`${name}: ${stages.map((s) => `${s.count} in ${STAGE_LABEL[s.id]}`).join(", ")}`}
      >
        {stages.map((s, i) => (
          <div
            key={s.id}
            className={`funnel-band${s.id === waits ? " funnel-band--wait" : ""}`}
            style={{ "--a": share(s), "--b": share(stages[i + 1] ?? s) } as CSSProperties}
          />
        ))}
      </div>
      <div className="funnel" style={cols} aria-hidden>
        {stages.map((s) => (
          <div key={s.id} className="pt-2 text-center">
            <p className={`funnel-n${s.id === waits ? " text-warn" : ""}`}>{s.count}</p>
            <p className={`mt-1 text-xs ${s.id === waits ? "font-semibold text-ink" : "text-ink-3"}`}>{STAGE_LABEL[s.id]}</p>
          </div>
        ))}
      </div>
      <div className="funnel-items mt-5 border-t border-line pt-4 text-sm" style={cols}>
        {stages.map((s) => (
          <Items key={s.id} s={s} />
        ))}
      </div>
      {(waits || aside.length > 0) && (
        <p className="mt-4 text-xs text-ink-3">
          {waits && (
            <>
              Work waits at <b className="text-ink-2">{STAGE_LABEL[waits]}</b>.{" "}
            </>
          )}
          {aside.length > 0 && <>{aside.join(", ")}. </>}
          {help.length > 0 && <>{help.join("; ")}.</>}
        </p>
      )}
    </section>
  );
}
