import { useId, type CSSProperties, type ReactNode } from "react";
import { StageNode } from "@/components/stage-node";
import type { StageMapData } from "@/lib/stages";

const LEGEND = [
  { tone: "problem", label: "Problems" },
  { tone: "think", label: "Thinking" },
  { tone: "make", label: "Building" },
  { tone: "ship", label: "Shipping" },
];
const NOTE_LEFT = 46;
const NOTE_WIDTH = "48%";

/** The workflow canvas: a list down a line on a phone, connected tiles from lg. */
export function StageMap({ map, note }: { map: StageMapData; note?: ReactNode }) {
  const group = useId();
  const last = map.nodes[map.nodes.length - 1];
  return (
    <>
      <ol className="stage-map mt-4" style={{ "--ratio": `${map.width}/${map.height}` } as CSSProperties} aria-label="Stages, with forks">
        <svg className="map-lines" viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden>
          {map.lines.map((l) => (
            <path key={l.d} className={`map-line${l.tone ? ` map-line--${l.tone}` : ""}${l.off ? " map-line--off" : ""}`} d={l.d} />
          ))}
          {map.label && (
            <text className="map-edge" x={map.label.x} y={map.label.y}>
              {map.label.text}
            </text>
          )}
        </svg>
        {map.nodes.map((n) => (
          <StageNode key={n.id} node={n} group={group} />
        ))}
        {note && last && (
          <li className="map-note" style={{ "--x": NOTE_LEFT, "--y": last.top, "--w": NOTE_WIDTH } as CSSProperties}>
            {note}
          </li>
        )}
      </ol>
      <p className="map-legend mt-3">
        {LEGEND.map((k) => (
          <span key={k.tone} className={`map-key map-key--${k.tone}`}>
            {k.label}
          </span>
        ))}
      </p>
    </>
  );
}
