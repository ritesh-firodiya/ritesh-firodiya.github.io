/* tokens.js → CSS variables (dark under :root[data-theme="dark"]) and the
 * Tailwind config. Utilities read variables, never values, so the theme toggle
 * repaints without dark: classes. Palette colours get a variable and no
 * utility, so a screen can only paint with a role. Naming: design-sets §8.  */
(function () {
  var T = (window.BABUL || {}).tokens;
  if (!T) return console.warn("[theme] tokens.js did not load — nothing will paint.");

  var isToken = function (node) { return node && typeof node === "object" && "$value" in node; };
  var darkOf = function (node) {
    var ext = node.$extensions && node.$extensions["dev.babul"];
    return ext && ext.modes ? ext.modes.dark : undefined;
  };
  /* Every token of a group, as [path, node]; $-keys are W3C metadata, not tokens. */
  function walk(node, path, out) {
    if (isToken(node)) { out.push([path, node]); return out; }
    Object.keys(node || {}).forEach(function (k) {
      if (k.charAt(0) !== "$") walk(node[k], path.concat(k === "DEFAULT" ? [] : [k]), out);
    });
    return out;
  }
  var dashed = function (prefix, path) { return "--" + [prefix].concat(path).filter(Boolean).join("-"); };
  /* {color.palette.red.500} → var(--palette-red-500); a plain value stays as it is. */
  var resolve = function (v) {
    var m = /^\{color\.([\w.-]+)\}$/.exec(v);
    return m ? "var(--" + m[1].replace(/\.DEFAULT\b/g, "").replace(/\./g, "-") + ")" : v;
  };

  var light = [], dark = [];
  function cssVar(name, value, darkValue) {
    light.push(name + ": " + value + ";");
    if (darkValue !== undefined) dark.push(name + ": " + darkValue + ";");
  }

  // <alpha-value> keeps opacity modifiers (bg-surface/40) painting; a plain var() makes Tailwind drop them.
  var withAlpha = function (name) { return "color-mix(in srgb, var(" + name + ") calc(<alpha-value> * 100%), transparent)"; };
  var colors = {};
  walk(T.color, [], []).forEach(function (t) {
    var name = dashed("", t[0]), dark = darkOf(t[1]);
    cssVar(name, resolve(t[1].$value), dark === undefined ? undefined : resolve(dark));
    if (t[0][0] === "palette") return;
    var at = colors;
    t[0].forEach(function (k, i) {
      if (i === t[0].length - 1) {
        if (at[k] && typeof at[k] === "object") at[k].DEFAULT = withAlpha(name);
        else at[k] = withAlpha(name);
        return;
      }
      if (typeof at[k] === "string") at[k] = { DEFAULT: at[k] };
      at = at[k] = at[k] || {};
    });
  });

  var fontSize = {};
  walk(T.typography, [], []).forEach(function (t) {
    var key = t[0].join("-"), v = t[1].$value;
    cssVar("--fs-" + key, v.fontSize);
    cssVar("--lh-" + key, v.lineHeight);
    var extra = { lineHeight: "var(--lh-" + key + ")" };
    if (v.letterSpacing) {
      cssVar("--ls-" + key, v.letterSpacing);
      extra.letterSpacing = "var(--ls-" + key + ")";
    }
    fontSize[key] = ["var(--fs-" + key + ")", extra];
  });

  var spacing = {};
  walk(T.spacing, [], []).forEach(function (t) { spacing[t[0].join("-")] = t[1].$value; });

  function scale(group, prefix) {
    var out = {};
    walk(T[group], [], []).forEach(function (t) {
      var name = dashed(prefix, t[0]);
      cssVar(name, t[1].$value, darkOf(t[1]));
      out[t[0].length ? t[0].join("-") : "DEFAULT"] = "var(" + name + ")";
    });
    return out;
  }
  var borderRadius = scale("radius", "radius");
  var boxShadow = scale("shadow", "shadow");
  /* The device frame is the shell's, not the product's: shell.css declares it. */
  borderRadius.phone = "var(--radius-phone)";
  boxShadow.phone = "var(--shadow-phone)";

  var css = ":root {\n  " + light.join("\n  ") + "\n}\n" +
            (dark.length ? ':root[data-theme="dark"] {\n  ' + dark.join("\n  ") + "\n}\n" : "");
  var tag = document.createElement("style");
  tag.id = "babul-tokens";
  tag.textContent = css;
  document.head.appendChild(tag);

  window.tailwind.config = {
    theme: {
      extend: {
        colors: colors,
        fontSize: fontSize,
        spacing: spacing,
        borderRadius: borderRadius,
        boxShadow: boxShadow,
        fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
        letterSpacing: { label: "var(--tracking-label)" },
        width: { frame: "var(--frame-w)" },
        maxWidth: { frame: "var(--frame-w)" },
        height: { frame: "var(--frame-h)" },
      },
    },
  };

  /* The theme is the viewer's choice, kept across pages and across the
     journey's thumbnails, and applied before first paint. */
  var themes = ((window.BABUL || {}).product || {}).themes || ["light"];
  var theme = themes[0];
  try { var saved = localStorage.getItem("babul-theme"); if (themes.indexOf(saved) >= 0) theme = saved; } catch (e) {}
  document.documentElement.dataset.theme = theme;
})();
