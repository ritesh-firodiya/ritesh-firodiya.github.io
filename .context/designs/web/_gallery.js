/* The gallery: a horizontal flow chart, drawn with React Flow.
 * ============================================================================
 * Nodes, edges and the column rank come from window.WF — the model _chrome.js
 * derives from routes.js and shares with the contact sheet — so the chart
 * cannot disagree with the set, or with the sheet. The rank is longest-path
 * depth rather than dagre or elk: the graph is a shallow DAG with an explicit
 * start, so depth already gives the column and there is no layout problem left
 * to solve. One fewer dependency, and the columns line up with the journey
 * instead of with whatever a layout engine decided looked balanced.
 *
 * This file draws. It derives nothing.
 *
 * React Flow v11, not v12: the v12 UMD bundle expects `react/jsx-runtime` on
 * the page as a global, which React's own UMD build does not provide. v11 needs
 * only React and ReactDOM.
 *
 *   flow: {
 *     start: "states/splash.html",
 *     end:   ["game/score.html"],
 *     edges: [
 *       { from: "states/splash.html", to: "home/home.html" },
 *       { from: "home/home.html", to: "game/play.html", label: "Let's Play" },
 *       { from: "game/score.html", to: "home/home.html", label: "Home", back: true },
 *     ],
 *   }
 */
(function () {
  /* This file never touches window.ROUTES. Everything it draws comes from WF,
     which _chrome.js derived from the manifest once. */
  var host = document.getElementById("flow");
  if (!host || !window.ReactFlow || !window.WF || !window.WF.start) return;

  var h = React.createElement;
  var RF = window.ReactFlow;

  /* ---- the model ---------------------------------------------------------
     meta, the state collapse, the edge list, the main path and the column
     rank are all published by _chrome.js as window.WF, and shared with the
     contact sheet. They used to be rebuilt here from routes.js, which is how
     the chart and the sheet came to disagree about what counted as a screen:
     the chart collapsed "Board · loading" onto Board and the sheet gave it a
     tile of its own.

     A state is a variant of a screen, not a second screen. Drawn as its own
     node it is the same box twice — "Board" beside "Board · loading" — which
     is exactly what a reader reads as two places. Edges are rewritten through
     the same collapse, so a step drawn as passing through a state still
     connects the screens on either side of it. */
  var WF = window.WF;
  var meta = WF.meta, base = WF.base, links = WF.links, col = WF.col;
  var mainPath = WF.mainPath, mainNodes = WF.mainNodes, START = WF.start;
  var ENDS = WF.ends, usedFlows = WF.flows;


  /* One colour per flow, so a reader can tell the shop from the game without
     reading a word. The reserved flow names get fixed roles; a product's own
     domain flows fall through to info. */
  var FLOW_TINT = {
    states: "var(--ink-3)",
    auth: "var(--info)",
    onboarding: "var(--info)",
    home: "var(--brand-500)",
    game: "var(--success)",
    settings: "var(--ink-3)",
    /* Every set declares brand; only a set with a second brand colour declares
       accent. The CSS fallback is the whole point of writing it this way — an
       undeclared var() paints NOTHING, so a store flow in a set with no accent
       would have had a colourless left edge and a blank swatch in the key. */
    store: "var(--accent-500, var(--brand-500))",
    patterns: "var(--ink-4)",
  };
  var tintOf = function (flow) { return FLOW_TINT[flow] || "var(--info)"; };

  var COL_W = 255, ROW_H = 104;

  /* The main path gets row 0 in every column, so the happy path is one
     straight horizontal line and everything else hangs below it. Ordering the
     rows by whoever was declared first made the spine zig-zag between columns,
     which is exactly the thing a flow chart is supposed to make obvious. */
  var byCol = {};
  Object.keys(col).forEach(function (f) {
    if (!meta[f]) return;          // ranked but not a screen the chart shows
    (byCol[col[f]] = byCol[col[f]] || []).push(f);
  });

  var nodes = [], rowOf = {};
  Object.keys(byCol).forEach(function (c) {
    var files = byCol[c].sort(function (a, b) {
      var am = mainNodes[a] || a === START ? 0 : 1;
      var bm = mainNodes[b] || b === START ? 0 : 1;
      if (am !== bm) return am - bm;
      return a.localeCompare(b);
    });
    files.forEach(function (f, k) {
      rowOf[f] = k;
      var m = meta[f];
      var isStart = f === START;
      var isEnd = ENDS.indexOf(f) !== -1;
      var onMain = mainNodes[f] || isStart;
      nodes.push({
        id: f,
        type: "screen",
        position: { x: Number(c) * COL_W, y: k * ROW_H },
        draggable: false,
        data: m,
        style: { borderLeftColor: tintOf(m.flow) },
        className: "fnode"
          + (isStart ? " is-start" : "")
          + (isEnd ? " is-end" : "")
          + (onMain ? " is-main" : ""),
      });
    });
  });

  var fanIndex = {};
  var edges = links.map(function (e, i) {
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

  /* ---- the node ---------------------------------------------------------- */
  /* The whole box selects; only the arrow opens. Clicking a box used to
     navigate, which meant there was no way to ask the chart a question about a
     screen without leaving it. */
  function ScreenNode(p) {
    return h(React.Fragment, null,
      h(RF.Handle, { type: "target", position: RF.Position.Left, isConnectable: false }),
      h("span", { className: "fnode-label" },
        h("span", { className: "fname" }, p.data.name),
        h("span", { className: "fflow mono" }, p.data.flow + "/")),
      h("a", {
        className: "fnode-go",
        href: p.data.file,
        title: "Open " + p.data.name,
        "aria-label": "Open " + p.data.name,
        onClick: function (ev) { ev.stopPropagation(); },
      }, h("svg", { viewBox: "0 0 24 24", width: 13, height: 13, fill: "none",
                    stroke: "currentColor", strokeWidth: 2.4,
                    strokeLinecap: "round", strokeLinejoin: "round" },
          h("path", { d: "M7 17 17 7" }), h("path", { d: "M8 7h9v9" }))),
      h(RF.Handle, { type: "source", position: RF.Position.Right, isConnectable: false }));
  }
  /* Defined once, outside the component: React Flow warns and re-mounts every
     node when nodeTypes is a new object each render. */
  var nodeTypes = { screen: ScreenNode };

  /* ---- labels that still land on something ------------------------------- */
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
    /* Selection only. Hover used to light a node's neighbours too, and because
       it drove React state it re-rendered — and tore down and rebuilt both
       observers below — once per mouse move across the chart. */
    var sv = React.useState(null), sel = sv[0], setSel = sv[1];
    var bk = React.useState(false), showBack = bk[0], setShowBack = bk[1];

    /* Returns are off by default. They are the least interesting paths in the
       product and the most destructive to read: every screen goes back to
       Home, so they all converge and cross everything on the way. */
    var shown = React.useMemo(function () {
      return edges.filter(function (e) { return showBack || !e.quiet; });
    }, [showBack]);

    /* ONE HOP: what gets me here, and where can I go from here.

       This used to light every node that could REACH the selected one — the
       whole transitive ancestry. That is a fair question in a six-screen game
       and useless in a thirty-four screen app, because nearly everything
       reaches nearly everything: Balances leads to Add leads to the With sheet
       leads to a group leads to a person leads back to Balances. So clicking
       almost any box lit almost the whole chart, and the answer to "how do I
       get here" came back as "yes".

       One hop is bounded, always readable, and is the question somebody
       actually has standing in front of a box. Computed over the VISIBLE
       edges, so turning returns on widens the answer rather than quietly
       counting paths that are not drawn. */
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

    /* Memoised. Without this every render built new node and edge objects,
       React Flow saw a changed graph and re-measured it, and the chart
       shivered continuously. */
    var styledEdges = React.useMemo(function () {
      if (!sel) return shown;
      return shown.map(function (e) {
        /* Touching the selection, not merely joining two lit boxes. `lit` holds
           the neighbours too, so the old test also lit the shortcuts BETWEEN
           one node's neighbours — edges with nothing to do with what you
           clicked. */
        var on = e.source === sel || e.target === sel;
        return Object.assign({}, e, {
          style: Object.assign({}, e.style, {
            opacity: on ? 1 : 0.07,
            stroke: on ? "var(--brand-500)" : e.style.stroke,
            strokeWidth: on ? 2.6 : e.style.strokeWidth,
          }),
          labelStyle: Object.assign({}, e.labelStyle, { opacity: on ? 1 : 0, fill: on ? "var(--brand-700)" : e.labelStyle.fill }),
          markerEnd: Object.assign({}, e.markerEnd, { color: on ? "var(--brand-500)" : e.markerEnd.color }),
          zIndex: on ? 6 : 0,
        });
      });
    }, [sel, shown]);

    var styledNodes = React.useMemo(function () {
      if (!lit) return nodes;
      return nodes.map(function (n) {
        return Object.assign({}, n, {
          className: n.className + (lit[n.id] ? " is-lit" : " is-dim") + (n.id === sel ? " is-sel" : ""),
        });
      });
    }, [lit, sel]);

    /* No dep list: the label geometry depends on what is currently lit.
       The observer is the part that matters. Tailwind's CDN build compiles at
       runtime, so the boxes change width well after first paint, and React
       Flow draws no edge at all until it has measured the nodes at both ends —
       run this once at mount and there is nothing on screen to measure yet.
       A fixed timeout is a guess at how long that takes; watching for the
       labels to actually appear is not. Only childList is observed, so the
       transforms this writes cannot retrigger it. */
    /* No dep list: the label geometry depends on what is currently lit.
       The watchers are the part that matters. Run this once at mount and there
       is nothing on screen to measure — React Flow draws no edge until it has
       measured the nodes at both ends, and Tailwind's CDN build compiles at
       runtime, so the boxes change width well after first paint. A fixed
       timeout is a guess at how long all that takes. So: the mutation observer
       catches the edges arriving and the fit moving them, and the resize
       observer catches the restyle, which changes no attribute and would
       otherwise be invisible from here. */
    React.useEffect(function () {
      var pending = 0;
      var ro;
      /* Keyed on `lit` below, because that decides which labels are visible and
         therefore what there is to space out. With no dep list at all, both
         observers were torn down and rebuilt on every render. */
      var soon = function () {
        clearTimeout(pending);
        pending = setTimeout(function () {
          spreadLabels();
          [].forEach.call(host.querySelectorAll(".react-flow__node"), function (n) { ro.observe(n); });
        }, 60);
      };
      ro = new ResizeObserver(soon);
      /* Our own writes are transforms on the label wrappers; ignoring those is
         what stops this from retriggering itself forever. */
      var mo = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var t = records[i].target;
          if (t.classList && t.classList.contains("react-flow__edge-textwrapper")) continue;
          return soon();
        }
      });
      mo.observe(host, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ["transform", "style", "class"],
      });
      soon();
      return function () { mo.disconnect(); ro.disconnect(); clearTimeout(pending); };
    }, [lit]);

    return h(RF.default || RF.ReactFlow, {
      nodes: styledNodes,
      edges: styledEdges,
      nodeTypes: nodeTypes,
      /* The prop, not inst.fitView() in onInit: onInit fires before the store
         has measured the nodes, so the fit framed a graph of zero-sized boxes
         and left the transform at the identity. As a prop React Flow fits once
         the nodes are measured — and it only fits on init, so selecting does
         not re-frame the chart now that the arrays are memoised. */
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
      h(RF.Background, { gap: 22, size: 1, color: "var(--line)" }),
      h(RF.Controls, { showInteractive: false }),
      h(RF.Panel, { position: "bottom-right", className: "fkey" },
        h("button", {
          type: "button",
          className: "fkey-toggle" + (showBack ? " is-on" : ""),
          onClick: function () { setShowBack(!showBack); },
        }, showBack ? "hide returns" : "show returns"),
        usedFlows.map(function (fl) {
          return h("span", { key: fl, className: "fkey-item" },
            h("span", { className: "fkey-dot", style: { background: tintOf(fl) } }),
            h("span", { className: "mono" }, fl));
        }),
        h("span", { className: "fkey-item" },
          h("span", { className: "fkey-line" }), h("span", null, "main path")),
        h("span", { className: "fkey-item" },
          h("span", { className: "fkey-line fkey-line--side" }), h("span", null, "shortcuts")),
        h("span", { className: "fkey-hint" },
          sel ? "what " + (meta[sel] || {}).name + " connects to — click it again, or the canvas, to clear"
              : "click a screen to see what it connects to · ↗ opens it")));
  }

  ReactDOM.createRoot(host).render(h(Chart));
})();
