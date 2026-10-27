/**
 * A product's conversation flow, from its `.context/metrics/flow.json`
 * (written on the owner's machine by ~/git/bin/flow: counts and times only).
 *
 * Adds what the page states: each step's share and median time, the slowest
 * step (the longest median wait) and the biggest drop (the lowest share).
 * Pure: the sync passes the parsed file in, the test passes fixtures.
 */

const IDS = ["asked", "committed", "released", "live"];

/** @param {any} raw the parsed flow.json */
export function flowOf(raw) {
  const stages = raw?.stages;
  if (!Array.isArray(stages) || stages.map((s) => s.id).join() !== IDS.join()) {
    throw new Error(`flow.json must list the stages ${IDS.join(", ")} in order`);
  }
  if (!stages.every((s) => Number.isInteger(s.count) && s.count >= 0)) throw new Error("flow.json: every count must be a whole number");

  const hops = stages.slice(1).map((s, i) => {
    const from = stages[i];
    const hours = raw.medianHours?.[`${from.id}→${s.id}`];
    return {
      from: from.id,
      to: s.id,
      /* A step nothing reached has no share: 0 of 0 is not 0%. */
      share: from.count > 0 ? Math.round((s.count * 100) / from.count) : null,
      medianHours: typeof hours === "number" ? hours : null,
    };
  });

  const timed = hops.filter((h) => h.medianHours !== null);
  const slowest = timed.length ? timed.reduce((a, b) => (b.medianHours > a.medianHours ? b : a)).to : null;
  const shared = hops.filter((h) => h.share !== null);
  const drop = shared.length ? shared.reduce((a, b) => (b.share < a.share ? b : a)).to : null;

  return { stages: stages.map(({ id, count }) => ({ id, count })), hops, slowest, drop, asOf: raw.updated ?? null };
}
