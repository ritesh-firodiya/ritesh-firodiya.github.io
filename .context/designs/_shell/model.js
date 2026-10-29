/* The derived model of the set — window.BABUL_MODEL.
 * ============================================================================
 * Derived once from what crawl.js read out of the HTML, and shared by the
 * shell, the journey and every view. When the chart, the page list and the contact sheet each
 * built their own, they disagreed about what a state was.
 *
 * A FRAME is a page in one of its states. Its id is the page id, plus
 * ".<state>" for any state but the default: game/play, game/play.hindi. One
 * file holds every state of a page; ?state=<name> picks one (expand.js).       */
(function () {
  var S = window.BABUL_SHELL;
  if (S) S.buildModel = build;
  function build() {
  var B = window.BABUL || {};

  var DEFAULT_STATE = "data";
  var pages = B.pages, links = B.links || [], J = B.journeys || {};
  var components = (B.components || {}).components || [];

  var meta = {}, order = {};
  pages.forEach(function (p, i) {
    meta[p.id] = {
      id: p.id,
      name: p.name,
      group: p.id.split("/")[0],
      file: p.id + ".html",
      page: p,
      states: [{ name: DEFAULT_STATE, file: p.id + ".html" }].concat((p.states || []).map(function (s) {
        return { name: s.name, note: s.note, file: p.id + ".html?state=" + s.name };
      })),
    };
    order[p.id] = i;
  });
  var pageOf = function (frame) { return String(frame).split(".")[0]; };

  /* ---- links, collapsed onto pages ---------------------------------------
     A link that is not a tap (`tap: false`) is not navigation: a state reached
     through the island, a sheet that opens by itself, the system back gesture.
     It is dropped HERE rather than at render time, or it still counts for rank.
     Collapsing can turn a link into a self-loop (Playing → Playing · hindi) or a
     duplicate; both are dropped. `side` is a shortcut or an upsell: real, but
     not a step forward, so it never ranks a page. */
  var edges = [], seen = {};
  links.forEach(function (l) {
    if (l.tap === false) return;
    var from = pageOf(l.from), to = pageOf(l.to);
    if (from === to || !meta[from] || !meta[to]) return;
    var key = from + ">" + to + ">" + (l.back ? "back" : l.side ? "side" : "fwd");
    if (seen[key]) return;
    seen[key] = true;
    edges.push({ from: from, to: to, label: l.label, back: !!l.back, side: !!l.side, action: l.action || "go" });
  });
  var forward = edges.filter(function (e) { return !e.back && !e.side; });

  var START = J.start ? pageOf(J.start) : (pages[0] || {}).id;
  var ends = (J.end || []).map(pageOf);

  /* ---- the happy path: start to the first end, along declared links ------- */
  var mainPath = {}, mainNodes = {};
  (function () {
    var next = {};
    forward.forEach(function (e) { (next[e.from] = next[e.from] || []).push(e); });
    var visited = {}, path = [];
    (function walk(node) {
      if (visited[node]) return false;
      visited[node] = true;
      if (ends.indexOf(node) !== -1) return true;
      var outs = next[node] || [];
      for (var k = 0; k < outs.length; k++) {
        path.push(outs[k]);
        if (walk(outs[k].to)) return true;
        path.pop();
      }
      return false;
    })(START);
    path.forEach(function (e) {
      mainPath[e.from + ">" + e.to] = true;
      mainNodes[e.from] = mainNodes[e.to] = true;
    });
    if (START) mainNodes[START] = true;
  })();

  /* ---- rank = longest path from the start, so a link always points right ---
     Only defined on a DAG, and the forward graph is one by construction. When
     it is violated anyway, relaxation never settles and the columns run into
     the hundreds. So a cycle is detected and the rank falls back to BFS
     depth, and the console says so. */
  var col = {};
  if (START) col[START] = 0;
  var settled = false;
  for (var pass = 0; pass <= forward.length; pass++) {
    var moved = false;
    forward.forEach(function (e) {
      if (col[e.from] == null) return;
      if (col[e.to] == null || col[e.to] < col[e.from] + 1) { col[e.to] = col[e.from] + 1; moved = true; }
    });
    if (!moved) { settled = true; break; }
  }
  if (!settled) {
    console.warn("[model] the forward graph has a cycle — ranking by BFS depth. A link that loops back is `side` or `back`.");
    col = {};
    var nexts = {};
    forward.forEach(function (e) { (nexts[e.from] = nexts[e.from] || []).push(e.to); });
    var queue = START ? [START] : [];
    if (START) col[START] = 0;
    while (queue.length) {
      var cur = queue.shift();
      (nexts[cur] || []).forEach(function (to) { if (col[to] == null) { col[to] = col[cur] + 1; queue.push(to); } });
    }
  }
  var last = 0;
  Object.keys(col).forEach(function (k) { last = Math.max(last, col[k]); });
  Object.keys(meta).forEach(function (id) { if (col[id] == null) col[id] = last + 1; });

  /* ---- groups: the page list, by folder, in the order the journey reaches
     them; manifest order breaks every tie. */
  var byGroup = {}, groupRank = {};
  pages.forEach(function (p) {
    var g = meta[p.id].group;
    (byGroup[g] = byGroup[g] || []).push(p.id);
    if (groupRank[g] == null || col[p.id] < groupRank[g]) groupRank[g] = col[p.id];
  });
  var groups = Object.keys(byGroup).sort(function (a, b) {
    var onPath = function (g) { return byGroup[g].some(function (id) { return mainNodes[id]; }) ? 0 : 1; };
    return groupRank[a] - groupRank[b] || onPath(a) - onPath(b) || order[byGroup[a][0]] - order[byGroup[b][0]];
  }).map(function (g) {
    return { name: g, pages: byGroup[g].sort(function (a, b) { return col[a] - col[b] || order[a] - order[b]; }).map(function (id) { return meta[id]; }) };
  });

  /* ---- named journeys: the few walks that explain the product ------------- */
  var journeys = (J.journeys || []).map(function (j) {
    return { name: j.name, pages: j.pages.map(pageOf).filter(function (id) { return meta[id]; }).map(function (id) { return meta[id]; }) };
  });

  window.BABUL_MODEL = {
    product: B.product || {},
    meta: meta,
    order: order,
    DEFAULT_STATE: DEFAULT_STATE,
    edges: edges,           // links collapsed onto pages, taps only, deduped
    col: col,
    mainPath: mainPath,
    mainNodes: mainNodes,
    start: START,
    ends: ends,
    groups: groups,         // [{ name, pages: [meta] }] in journey order
    journeys: journeys,     // [{ name, pages: [meta] }], in the order pages are reached
    components: components,
    assets: B.assets || {},
  };
  }
})();
