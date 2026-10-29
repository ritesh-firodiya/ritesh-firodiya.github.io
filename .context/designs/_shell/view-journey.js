/* Journey: every page as a picture of itself, in a flow chart drawn with
 * React Flow — Babul's Journey section.
 * ============================================================================
 * Nodes, links and the column rank come from window.BABUL_MODEL, so the chart
 * cannot disagree with the page list. The rank is longest-path depth rather
 * than dagre or elk: the graph is a shallow DAG with an explicit start, so
 * depth already gives the column and there is no layout problem left to solve.
 *
 * The chips over the chart are the named journeys (data-journeys). All draws every
 * page; a journey draws its pages in its order, one row, left to right.
 *
 * This file draws. It derives nothing.                                       */
(function () {
  var S = window.BABUL_SHELL, M;
  if (!S) return;

  S.onBuild = function () {
    M = window.BABUL_MODEL;
    var host = S.el("div", "chart-canvas");
    host.id = "flow";
    S.canvas.appendChild(host);
    if (!window.ReactFlow || !M.start) return;
    draw(host);
  };

  function draw(host) {
  var h = React.createElement;
  var RF = window.ReactFlow;
  var meta = M.meta, col = M.col, mainPath = M.mainPath, mainNodes = M.mainNodes;
  var START = M.start, ENDS = M.ends;

  /* One colour per group, so a reader can tell the shop from the game without
     reading a word. Fixed roles for the reserved names; the rest fall to info. */
  var GROUP_TINT = {
    launch: "var(--ink-3)", auth: "var(--info)", onboarding: "var(--info)",
    home: "var(--brand-500)", game: "var(--success)", settings: "var(--ink-3)",
    store: "var(--accent-500, var(--brand-500))",
  };
  var tintOf = function (g) { return GROUP_TINT[g] || "var(--info)"; };

  /* Each node is the page itself, shrunk: Babul's journey shows pages, not
     boxes with names in them. A tall phone is cropped to its top, which is
     the part that tells two pages apart. */
  var FRAME = (M.product.frames || {})[S.size] || { w: 390, h: 844 };
  var THUMB_W = FRAME.w > 600 ? 200 : 110;
  var THUMB_SCALE = THUMB_W / FRAME.w;
  var THUMB_H = Math.min(Math.round(FRAME.h * THUMB_SCALE), Math.round(THUMB_W * 1.6));
  var COL_W = THUMB_W + 150, ROW_H = THUMB_H + 70;
  var links = M.edges;

  function screenNode(id, x, y) {
    var m = meta[id];
    return {
      id: id,
      type: "screen",
      position: { x: x, y: y },
      draggable: false,
      data: m,
      className: "fnode"
        + (id === START ? " is-start" : "")
        + (ENDS.indexOf(id) !== -1 ? " is-end" : "")
        + (mainNodes[id] ? " is-main" : ""),
    };
  }

  /* The main path gets row 0 in every column, so the happy path is one
     straight line and everything else hangs below it. */
  var byCol = {};
  Object.keys(meta).forEach(function (id) { (byCol[col[id]] = byCol[col[id]] || []).push(id); });
  var nodes = [], rowOf = {};
  Object.keys(byCol).forEach(function (c) {
    byCol[c].sort(function (a, b) {
      return (mainNodes[a] ? 0 : 1) - (mainNodes[b] ? 0 : 1) || M.order[a] - M.order[b];
    }).forEach(function (id, k) {
      rowOf[id] = k;
      nodes.push(screenNode(id, Number(c) * COL_W, k * ROW_H));
    });
  });

  function makeEdges(list, rowOf, col) {
  var fanIndex = {};
  return list.map(function (e, i) {
    var isMain = mainPath[e.from + ">" + e.to];
    var quiet = e.back;
    var side = e.side;
    /* An edge that skips a column passes straight over whatever sits between
       its ends, and React Flow puts the label at the path midpoint — which is
       exactly on that node. Lift the label clear and give it a halo instead of
       a background box, which would detach from the moved text. */
    var span = Math.abs((col[e.to] || 0) - (col[e.from] || 0));
    /* React Flow puts a label at the path midpoint, which for an edge that
       drops rows is halfway down the corridor — level with whatever node
       happens to sit there, and, for five exits from one screen, on top of the
       other four. Slide it down to the TARGET's row instead: it then sits on
       the horizontal run going into the screen it names, which is the end that
       makes it mean something. */
    var drop = (rowOf[e.to] || 0) - (rowOf[e.from] || 0);
    /* An edge that skips a column passes straight over whatever sits between
       its ends, and its midpoint label lands on that node. Lift it clear. */
    var shift = quiet ? 0 : (drop / 2) * ROW_H + (span > 1 ? -34 : 0);
    var lifted = shift !== 0;
    var stroke = quiet || side ? "var(--ink-4)" : isMain ? "var(--brand-500)" : "var(--line-strong)";
    return {
      id: "e" + i,
      quiet: quiet,
      source: e.from,
      target: e.to,
      /* Only forward edges carry a label. A return is dashed and arrowed,
         which already says "goes back here"; labelling them put three "Back"s
         on top of each other across the body of the chart. */
      label: quiet ? undefined : e.label,
      type: "smoothstep",
      /* Every edge leaving one node bends at the same x by default, so five
         exits from Home ran down a single corridor and became one thick line.
         Staggering the bend gives each its own lane. */
      pathOptions: { borderRadius: 12, offset: 18 + (fanIndex[e.from] = (fanIndex[e.from] == null ? 0 : fanIndex[e.from] + 1)) * 16 },
      zIndex: quiet ? 0 : isMain ? 2 : 1,
      style: {
        stroke: stroke,
        strokeWidth: isMain ? 2.4 : 1.5,
        strokeDasharray: quiet ? "4 4" : side ? "1 3" : undefined,
      },
      labelStyle: Object.assign({
        fontSize: 10, fontWeight: 800, fill: isMain ? "var(--brand-700)" : "var(--ink-3)",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }, lifted ? {
        transform: "translateY(" + shift + "px)",
        paintOrder: "stroke", stroke: "var(--page)", strokeWidth: 4, strokeLinejoin: "round",
      } : {}),
      labelShowBg: !lifted,
      labelBgStyle: { fill: "var(--page)", fillOpacity: 0.95 },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 4,
      markerEnd: { type: "arrowclosed", width: 13, height: 13, color: stroke },
    };
  });
  }
  var edges = makeEdges(links, rowOf, col);

  /* A journey: its pages in its order, one row, and a link between each
     neighbour — the declared one's label when there is one. */
  var journeyGraphs = M.journeys.map(function (j) {
    var jRow = {}, jCol = {}, jNodes = [], jLinks = [];
    j.pages.forEach(function (m, c) {
      jRow[m.id] = 0;
      jCol[m.id] = c;
      jNodes.push(screenNode(m.id, c * COL_W, 0));
      if (c === 0) return;
      var prev = j.pages[c - 1].id;
      var direct = links.filter(function (e) { return e.from === prev && e.to === m.id; })[0];
      jLinks.push({ from: prev, to: m.id, label: direct ? direct.label : null, back: false, side: false });
    });
    return { nodes: jNodes, edges: makeEdges(jLinks, jRow, jCol) };
  });

  function ScreenNode(p) {
    return h(React.Fragment, null,
      h(RF.Handle, { type: "target", position: RF.Position.Left, isConnectable: false }),
      h("span", { className: "fnode-head" },
        h("span", { className: "fname" }, p.data.name),
        h("span", { className: "fflow", style: { color: tintOf(p.data.group) } }, p.data.group)),
      /* The head asks the chart a question; the picture opens the page. */
      h("a", {
        className: "fnode-thumb",
        href: S.at(p.data.file),
        title: "Open " + p.data.name,
        style: { width: THUMB_W, height: THUMB_H },
        onClick: function (ev) { ev.stopPropagation(); },
      }, h("iframe", {
        src: S.at(p.data.file) + "?bare",
        tabIndex: -1,
        "aria-hidden": "true",
        style: { width: FRAME.w, height: FRAME.h, transform: "scale(" + THUMB_SCALE + ")" },
      })),
      h(RF.Handle, { type: "source", position: RF.Position.Right, isConnectable: false }));
  }
  var nodeTypes = { screen: ScreenNode };

  /* Putting a label at the target's row settles most of it, but not all: two
     edges landing on one screen still share a point, and an edge that neither
     drops a row nor skips a column has a midpoint wherever the corridor put
     it. The rest cannot be reasoned out from the manifest — it depends on how
     wide a word renders — so it is measured instead, once the chart is on
     screen, and the few that overlap are stepped out of the way. */
  function spreadLabels() {
    var wraps = [].slice.call(host.querySelectorAll(".react-flow__edge-textwrapper"));
    if (!wraps.length) return;

    /* The wrapper's own transform is how React Flow places the label; replacing
       it sends every label to the origin. Compose onto it instead — an SVG
       transform list applies in order, so `<its translate> translate(0,dy)` is
       its position shifted by dy — and remember which string was ours, so a
       re-render that rewrites the attribute is recognised as a new baseline
       rather than cached as one. */
    wraps.forEach(function (w) {
      var current = w.getAttribute("transform") || "";
      if (current !== w.__spread) w.__base = current;
      if (w.__base !== current) w.setAttribute("transform", w.__base);
    });

    var vp = host.querySelector(".react-flow__viewport");
    var m = /scale\(([\d.]+)\)/.exec(vp ? vp.style.transform : "");
    var zoom = m ? parseFloat(m[1]) : 1;

    var blockers = [].slice.call(host.querySelectorAll(".react-flow__node"))
      .map(function (n) { return n.getBoundingClientRect(); });

    var overlaps = function (r, list) {
      return list.some(function (o) {
        return r.right > o.left && r.left < o.right && r.bottom > o.top && r.top < o.bottom;
      });
    };

    var STEPS = [-26, 26, -52, 52, -78, 78, -104, 104];
    wraps.forEach(function (w) {
      var r = w.getBoundingClientRect();
      if (!overlaps(r, blockers)) { blockers.push(r); return; }
      for (var i = 0; i < STEPS.length; i++) {
        var d = STEPS[i] * zoom;
        var moved = { left: r.left, right: r.right, top: r.top + d, bottom: r.bottom + d };
        if (!overlaps(moved, blockers)) {
          w.__spread = (w.__base || "") + " translate(0," + STEPS[i] + ")";
          w.setAttribute("transform", w.__spread);
          blockers.push(moved);
          return;
        }
      }
      blockers.push(r);
    });
  }

  function Chart() {
    var sv = React.useState(null), sel = sv[0], setSel = sv[1];
    var bk = React.useState(false), showBack = bk[0], setShowBack = bk[1];
    var md = React.useState("all"), mode = md[0], setMode = md[1];
    var graph = mode === "all" ? { nodes: nodes, edges: edges } : journeyGraphs[mode];

    /* Returns are hidden by default: every page goes back Home, so they all
       converge and cross everything on the way. */
    var shown = React.useMemo(function () {
      return graph.edges.filter(function (e) { return showBack || !e.quiet; });
    }, [showBack, mode]);

    /* One hop, not the whole ancestry: in a big set nearly everything reaches
       nearly everything, and "how do I get here" came back as "yes". */
    var lit = React.useMemo(function () {
      if (!sel) return null;
      var m = {};
      m[sel] = true;
      shown.forEach(function (e) {
        if (e.source === sel) m[e.target] = true;
        if (e.target === sel) m[e.source] = true;
      });
      return m;
    }, [sel, shown]);

    var styledEdges = React.useMemo(function () {
      if (!sel) return shown;
      return shown.map(function (e) {
        var on = e.source === sel || e.target === sel;
        return Object.assign({}, e, {
          style: Object.assign({}, e.style, { opacity: on ? 1 : 0.07, stroke: on ? "var(--brand-500)" : e.style.stroke, strokeWidth: on ? 2.6 : e.style.strokeWidth }),
          labelStyle: Object.assign({}, e.labelStyle, { opacity: on ? 1 : 0, fill: on ? "var(--brand-700)" : e.labelStyle.fill }),
          markerEnd: Object.assign({}, e.markerEnd, { color: on ? "var(--brand-500)" : e.markerEnd.color }),
          zIndex: on ? 6 : 0,
        });
      });
    }, [sel, shown]);

    var styledNodes = React.useMemo(function () {
      if (!lit) return graph.nodes;
      return graph.nodes.map(function (n) {
        return Object.assign({}, n, { className: n.className + (lit[n.id] ? " is-lit" : " is-dim") + (n.id === sel ? " is-sel" : "") });
      });
    }, [lit, sel, mode]);

    /* Labels are spaced once the chart is on screen and measured: Tailwind's
       CDN compiles at runtime and React Flow draws no edge until it has
       measured both ends, so a fixed timeout is only a guess. */
    React.useEffect(function () {
      var pending = 0;
      var ro;
      var soon = function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          spreadLabels();
          [].forEach.call(host.querySelectorAll(".react-flow__node"), function (n) { ro.observe(n); });
        }, 60);
      };
      ro = new ResizeObserver(soon);
      var mo = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var t = records[i].target;
          if (t.classList && t.classList.contains("react-flow__edge-textwrapper")) continue;
          return soon();
        }
      });
      mo.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["transform", "style", "class"] });
      soon();
      return function () { mo.disconnect(); ro.disconnect(); clearTimeout(pending); };
    }, [lit, mode]);

    var chips = h("div", { className: "journey-chips" },
      chip("all", "All", nodes.length),
      M.journeys.map(function (j, i) { return chip(i, j.name, j.pages.length); }));
    function chip(key, label, count) {
      return h("button", {
        key: key, type: "button",
        className: "journey-chip" + (mode === key ? " is-on" : ""),
        onClick: function () { setSel(null); setMode(key); },
      }, label, h("span", null, String(count)));
    }

    return h(React.Fragment, null, chips, h(RF.default || RF.ReactFlow, {
      /* Keyed on the mode, so switching re-frames the chart: fitView runs
         once, when React Flow first measures the nodes. */
      key: String(mode),
      nodes: styledNodes,
      edges: styledEdges,
      nodeTypes: nodeTypes,
      fitView: true,
      fitViewOptions: { padding: 0.16 },
      nodesFocusable: false,
      edgesFocusable: false,
      nodesDraggable: false,
      nodesConnectable: false,
      elementsSelectable: false,
      proOptions: { hideAttribution: true },
      minZoom: 0.2,
      maxZoom: 1.6,
      onNodeClick: function (_, n) { setSel(n.id === sel ? null : n.id); },
      onPaneClick: function () { setSel(null); },
    },
      h(RF.Background, { gap: 16, size: 1, color: "var(--chrome-dot)" }),
      h(RF.Controls, { showInteractive: false }),
      h(RF.Panel, { position: "bottom-right", className: "fkey" },
        h("button", { type: "button", className: "fkey-toggle" + (showBack ? " is-on" : ""), onClick: function () { setShowBack(!showBack); } },
          showBack ? "hide returns" : "show returns"),
        h("span", { className: "fkey-item" }, h("span", { className: "fkey-line" }), h("span", null, "main path")),
        h("span", { className: "fkey-item" }, h("span", { className: "fkey-line fkey-line--side" }), h("span", null, "shortcuts")),
        h("span", { className: "fkey-hint" },
          sel ? "what " + (meta[sel] || {}).name + " connects to — click it again, or the canvas, to clear"
              : "click a name to see what it connects to · the picture opens it"))));
  }

  ReactDOM.createRoot(host).render(h(Chart));
  }
})();
