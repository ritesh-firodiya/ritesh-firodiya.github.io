import type { CSSProperties } from "react";
import {
  Activity, Archive, Bug, CircleAlert, Clapperboard, Code, FileText, FlaskConical, GitPullRequest, Globe, Lightbulb,
  ListChecks, Megaphone, Monitor, PencilRuler, Search, Smartphone, Tag, UserCheck, type LucideIcon,
} from "lucide-react";
import type { StageNodeData } from "@/lib/stages";

const ICON: Record<string, LucideIcon> = {
  activity: Activity, archive: Archive, bug: Bug, "circle-alert": CircleAlert, clapperboard: Clapperboard, code: Code,
  "file-text": FileText, "flask-conical": FlaskConical, "git-pull-request": GitPullRequest, globe: Globe, lightbulb: Lightbulb,
  "list-checks": ListChecks, megaphone: Megaphone, monitor: Monitor, "pencil-ruler": PencilRuler, search: Search,
  smartphone: Smartphone, tag: Tag,
};

function Gate() {
  return (
    <span className="map-gate" title="A person approves">
      <UserCheck size={12} aria-label="A person approves" />
    </span>
  );
}

/** One stage. With records it is a stack holding the count, and it opens to the count by status. */
export function StageNode({ node, group }: { node: StageNodeData; group: string }) {
  const Icon = ICON[node.icon];
  const classes = `map-node map-node--${node.tone}${node.off ? " map-node--off" : ""}${node.branch ? " map-node--branch" : ""}`;
  return (
    <li className={classes} style={{ "--x": node.left, "--y": node.top } as CSSProperties}>
      {node.n ? (
        <details name={group} className="map-open">
          <summary className="map-tile map-tile--count">
            <b className="map-n">{node.n}</b>
            <span className="map-unit">{node.unit}</span>
            {node.gate && <Gate />}
          </summary>
          <ul className="map-more">
            {node.counts?.map((c) => (
              <li key={c.status}>
                <b>{c.count}</b> {c.status}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <span className="map-tile">
          <Icon size={20} aria-hidden />
          {node.gate && <Gate />}
        </span>
      )}
      <span className="map-words">
        <b className="block text-sm">{node.label}</b>
        <span className="block text-xs text-ink-3">{node.what}</span>
      </span>
    </li>
  );
}
