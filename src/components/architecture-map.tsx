"use client";

import { useState } from "react";
import type { Architecture } from "@/lib/architecture";

const WIDTH = 1000;
const PAD = 14;
const GAP = 52;
const HEAD = 30;
const BOX = 46;
const BOX_GAP = 10;

interface Box { x: number; y: number; w: number; h: number }

function line(a: Box, b: Box): string {
  if (a.x === b.x) {
    const x = a.x + a.w - 14;
    return a.y > b.y ? `M${x} ${a.y}L${x} ${b.y + b.h}` : `M${x} ${a.y + a.h}L${x} ${b.y}`;
  }
  const right = a.x < b.x;
  const [x1, x2] = [right ? a.x + a.w : a.x, right ? b.x : b.x + b.w];
  const [y1, y2] = [a.y + a.h / 2, b.y + b.h / 2];
  const middle = (x1 + x2) / 2;
  return `M${x1} ${y1}C${middle} ${y1} ${middle} ${y2} ${x2} ${y2}`;
}

const steps = (path: string[]): [string, string][] =>
  path.flatMap((id, i): [string, string][] => { const from = path[i - 1]; return from && from !== id ? [[from, id]] : []; });
const key = ([a, b]: [string, string]) => [a, b].sort().join("|");

/** One column per area, one box per part, and the path of the action picked above it. */
export function ArchitectureMap({ architecture: a }: { architecture: Architecture }) {
  const [picked, setPicked] = useState(0);
  const flow = a.flows[picked];
  const width = (WIDTH - PAD * 2 - GAP * (a.areas.length - 1)) / a.areas.length;
  const boxes = new Map<string, Box>();
  const columns = a.areas.map((area, i) => {
    const x = PAD + i * (width + GAP);
    const parts = a.parts.filter((p) => p.area === area.id);
    parts.forEach((p, j) => boxes.set(p.id, { x: x + 10, y: PAD + HEAD + j * (BOX + BOX_GAP), w: width - 20, h: BOX }));
    return { area, x, count: parts.length };
  });
  const height = PAD * 2 + HEAD + Math.max(...columns.map((c) => c.count)) * (BOX + BOX_GAP) + 4;
  const links = new Map(a.flows.flatMap((f) => steps(f.path)).filter(([x, y]) => boxes.has(x) && boxes.has(y)).map((s) => [key(s), s]));
  const lit = new Set(flow ? steps(flow.path).map(key) : []);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-line p-2 text-sm" role="group" aria-label="What a user does">
        {a.flows.map((f, i) => (
          <button key={f.name} type="button" aria-pressed={i === picked} onClick={() => setPicked(i)} className={`rounded-md px-2.5 py-1 ${i === picked ? "bg-muted font-medium text-ink" : "text-ink-3 hover:bg-muted"}`}>
            {f.name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} className="block h-auto w-full min-w-[640px]" role="img" aria-label={flow ? `The path of: ${flow.name}` : "How the parts connect"}>
          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8z" className="fill-line" /></marker>
            <marker id="arrow-on" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8z" className="fill-ink" /></marker>
            {a.parts.map((p) => {
              const b = boxes.get(p.id);
              return b && <clipPath key={p.id} id={`part-${p.id}`}><rect x={b.x + 10} y={b.y} width={b.w - 20} height={b.h} /></clipPath>;
            })}
          </defs>
          {columns.map(({ area, x }) => (
            <g key={area.id}>
              <rect x={x} y={PAD} width={width} height={height - PAD * 2} rx={10} className="fill-muted" />
              <text x={x + 10} y={PAD + 20} className="fill-ink-3 text-[11px] font-semibold uppercase tracking-wide">{area.label}</text>
            </g>
          ))}
          {[...links.entries()].map(([k, [x, y]]) => {
            const on = lit.has(k);
            // A path shows the way it travels; a line off the path shows every way any action uses it.
            const ways = on && flow ? [flow] : a.flows.filter((f) => f !== flow);
            const goes = (from: string, to: string) => ways.some((f) => steps(f.path).some(([s, t]) => s === from && t === to));
            const marker = `url(#${on ? "arrow-on" : "arrow"})`;
            return <path key={k} d={line(boxes.get(x)!, boxes.get(y)!)} fill="none" markerEnd={goes(x, y) ? marker : undefined} markerStart={goes(y, x) ? marker : undefined} strokeWidth={on ? 2.5 : 1.5} className={on ? "stroke-ink" : "stroke-line opacity-40"} />;
          })}
          {a.parts.map((p) => {
            const b = boxes.get(p.id);
            if (!b) return null;
            const on = !flow || flow.path.includes(p.id);
            return (
              <g key={p.id} className={on ? "" : "opacity-30"}>
                <title>{p.label}</title>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} strokeWidth={on ? 2 : 1.5} className={`fill-surface ${on ? "stroke-ink" : "stroke-line"}`} />
                <text x={b.x + 10} y={b.y + b.h / 2 + 5} clipPath={`url(#part-${p.id})`} className="fill-ink text-[14px] font-semibold">{p.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
