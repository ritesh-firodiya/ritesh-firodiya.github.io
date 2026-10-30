"use client";

import { useState } from "react";
import type { Growth } from "@/lib/architecture";

const money = (value: number) => (value < 1 ? `$${value.toFixed(2)}` : `$${Math.round(value).toLocaleString("en-US")}`);

/** One per-use rate scaled up, against its daily limit. */
export function ArchitectureGrowth({ growth }: { growth: Growth }) {
  const [picked, setPicked] = useState(0);
  const count = growth.steps[picked];
  if (count === undefined) return null;
  const perDay = count / 30;
  const share = growth.limitPerDay ? perDay / growth.limitPerDay : null;
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <span className="mr-1 text-ink-3">{growth.unit}</span>
        {growth.steps.map((step, i) => (
          <button key={step} type="button" aria-pressed={i === picked} onClick={() => setPicked(i)} className={`rounded-md px-2.5 py-1 ${i === picked ? "bg-muted font-medium text-ink" : "text-ink-3 hover:bg-muted"}`}>
            {step.toLocaleString("en-US")}{step === growth.today ? " (today)" : ""}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div><div className="text-xs text-ink-3">{growth.costLabel ?? "Cost a month"}</div><div className="text-lg font-semibold">{money(count * growth.rate)} / mo</div></div>
        <div><div className="text-xs text-ink-3">{growth.unit}, per day</div><div className="text-lg font-semibold">{Math.round(perDay).toLocaleString("en-US")}</div></div>
        {share !== null && (
          <div><div className="text-xs text-ink-3">{growth.limitLabel ?? "Limit"}</div><div className="text-lg font-semibold">{share > 1 ? "Over the limit" : share < 0.01 ? "Under 1% used" : `${Math.round(share * 100)}% used`}</div></div>
        )}
      </div>
      {growth.note && <p className="mt-2 text-xs text-ink-3">{growth.note}</p>}
    </div>
  );
}
