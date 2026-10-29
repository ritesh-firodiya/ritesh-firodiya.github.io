/* Styles: every token, one group per page, as Babul's Styles section shows it.
 * ============================================================================
 * Drawn from tokens.js and the icons the set draws, so the sheet can never
 * disagree with the set. A token's name is Babul's slash name — brand/500,
 * industry/family/bg.                                                       */
(function () {
  var S = window.BABUL_SHELL, M;
  if (!S) return;
  var B = window.BABUL || {}, T = B.tokens || {};

  var isToken = function (n) { return n && typeof n === "object" && "$value" in n; };
  function walk(node, path, out) {
    if (isToken(node)) { out.push({ path: path, node: node }); return out; }
    Object.keys(node || {}).forEach(function (k) {
      if (k.charAt(0) !== "$") walk(node[k], k === "DEFAULT" ? path : path.concat(k), out);
    });
    return out;
  }
  var darkOf = function (n) { var e = n.$extensions && n.$extensions["dev.babul"]; return e && e.modes ? e.modes.dark : undefined; };
  var tokensOf = function (group) { return walk(T[group], [], []); };

  S.styleCounts = function () {
    return {
      colors: tokensOf("color").length,
      typography: tokensOf("typography").length,
      spacing: tokensOf("spacing").length,
      radius: tokensOf("radius").length,
      shadows: tokensOf("shadow").length,
      icons: (((B.assets || {}).icons || {}).names || []).length,
    };
  };

  var el, sheet;
  S.onBuild = function () {
    M = window.BABUL_MODEL;
    el = S.el;
    sheet = el("div", "styles-sheet");
    S.canvas.appendChild(sheet);
    var section = document.body.dataset.section;
    ({ colors: colors, typography: typography, spacing: spacing, radius: radius, shadows: shadows, icons: icons }[section] || icons)();
  };

  /* ---- colours: the palette by base colour, then the roles that use it ---- */
  // The palette is in tokens.js light to dark already; a role shows the palette
  // colour it names, so a value is drawn once and every reuse is a name.
  var alias = function (v) { var m = /^\{color\.palette\.([\w.-]+)\}$/.exec(v || ""); return m ? m[1].replace(/\./g, "/") : v; };
  function swatch(row, cssName, name, lines) {
    var chip = el("div", "styles-chip");
    var fill = el("div", "styles-chip-fill");
    fill.style.background = "var(" + cssName + ")";
    chip.appendChild(fill);
    chip.appendChild(el("div", "styles-chip-name", name));
    lines.forEach(function (l) { if (l) chip.appendChild(el("div", "styles-chip-value", l)); });
    row.appendChild(chip);
  }
  function colors() {
    var P = T.color.palette || {};
    sheet.appendChild(el("h2", "styles-heading", "Palette"));
    // A ramp is a row; the colours with no ramp (white, black) share one.
    var single = Object.keys(P).filter(function (k) { return isToken(P[k]); });
    Object.keys(P).forEach(function (base) {
      if (base.charAt(0) === "$" || isToken(P[base])) return;
      sheet.appendChild(el("p", "styles-family", base));
      var row = el("div", "styles-row");
      walk(P[base], [], []).forEach(function (t) {
        swatch(row, "--" + ["palette", base].concat(t.path).join("-"), t.path.join(""), [t.node.$value]);
      });
      sheet.appendChild(row);
    });
    if (single.length) {
      sheet.appendChild(el("p", "styles-family", "base"));
      var row = el("div", "styles-row");
      single.forEach(function (k) { swatch(row, "--palette-" + k, k, [P[k].$value]); });
      sheet.appendChild(row);
    }

    sheet.appendChild(el("h2", "styles-heading", "Roles"));
    var groups = {}, order = [];
    tokensOf("color").forEach(function (t) {
      if (t.path[0] === "palette") return;
      var g = t.path.length > 1 ? t.path.slice(0, -1).join("/") : "ground and text";
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(t);
    });
    order.forEach(function (g) {
      sheet.appendChild(el("p", "styles-family", g));
      var row = el("div", "styles-row");
      groups[g].forEach(function (t) {
        var dark = darkOf(t.node);
        swatch(row, "--" + t.path.join("-"), t.path.join("/"), [alias(t.node.$value), dark && "dark " + alias(dark)]);
      });
      sheet.appendChild(row);
    });
  }

  /* ---- type: one line per style, set in the style itself ------------------ */
  function typography() {
    tokensOf("typography").forEach(function (t) {
      var key = t.path.join("-"), v = t.node.$value;
      var line = el("div", "styles-line");
      line.appendChild(el("span", "styles-line-name", key));
      var sample = el("span", "styles-line-sample", "Act it out — " + M.product.name);
      sample.style.font = "400 var(--fs-" + key + ")/var(--lh-" + key + ") var(--font-sans)";
      if (v.letterSpacing) sample.style.letterSpacing = "var(--ls-" + key + ")";
      line.appendChild(sample);
      sheet.appendChild(line);
    });
  }

  /* ---- spacing: a bar as long as the space -------------------------------- */
  function spacing() {
    tokensOf("spacing").forEach(function (t) {
      var key = t.path.join("-");
      var line = el("div", "styles-line");
      line.appendChild(el("span", "styles-line-name", key));
      var barEl = el("span", "styles-bar");
      barEl.style.width = t.node.$value;
      line.appendChild(barEl);
      line.appendChild(el("span", "styles-chip-value", t.node.$value));
      sheet.appendChild(line);
    });
  }

  /* ---- radius and shadows: the shape itself ------------------------------- */
  function shapes(group, cssProp, prefix) {
    var row = el("div", "styles-row");
    tokensOf(group).forEach(function (t) {
      var name = [prefix].concat(t.path).join("-");
      var chip = el("div", "styles-chip");
      var box = el("div", "styles-box");
      box.style[cssProp] = "var(--" + name + ")";
      chip.appendChild(box);
      chip.appendChild(el("div", "styles-chip-name", t.path.length ? t.path.join("/") : "default"));
      chip.appendChild(el("div", "styles-chip-value", group === "radius" ? t.node.$value : ""));
      row.appendChild(chip);
    });
    sheet.appendChild(row);
  }
  function radius() { shapes("radius", "borderRadius", "radius"); }
  function shadows() { shapes("shadow", "boxShadow", "shadow"); }

  /* ---- icons: the logos, then every lucide icon the set draws ------------- */
  function icons() {
    var art = ((B.assets || {}).logos || []).concat((B.assets || {}).images || []);
    if (art.length) {
      sheet.appendChild(el("p", "styles-family", "logos and images"));
      var row = el("div", "styles-row");
      art.forEach(function (a) {
        var chip = el("div", "styles-chip");
        var img = el("img", "styles-art");
        img.src = S.root + a.file;
        img.alt = "";
        chip.appendChild(img);
        chip.appendChild(el("div", "styles-chip-name", a.name));
        row.appendChild(chip);
      });
      sheet.appendChild(row);
    }
    var set = (B.assets || {}).icons || { names: [] };
    sheet.appendChild(el("p", "styles-family", set.set + " " + (set.version || "")));
    var grid = el("div", "styles-row");
    set.names.forEach(function (n) {
      var chip = el("div", "styles-chip");
      var glyph = S.icon(n, n);
      glyph.classList.add("styles-glyph");
      chip.appendChild(glyph);
      chip.appendChild(el("div", "styles-chip-name", n));
      grid.appendChild(chip);
    });
    sheet.appendChild(grid);
  }
})();
