/**
 * The mechanical half of a migration: rename tokens, and turn inline styles
 * into the utilities that already say the same thing.
 *
 * Everything here is a rename or a 1:1 translation. Nothing changes a value,
 * because a retoken must be invisible — `scripts/verify-retoken.mjs` is the
 * proof, and it only holds if this file never gets creative.
 *
 * What it will NOT do is guess. A declaration it does not recognise is left
 * exactly where it is and reported, so the leftover count is the honest size
 * of the hand-work rather than a silent approximation.
 */

const PROP_TO_PREFIX = {
  color: "text",
  background: "bg",
  "background-color": "bg",
  "border-color": "border",
  fill: "fill",
  stroke: "stroke",
};

/** `--accent` -> `--brand-500`, longest name first so prefixes cannot shadow. */
export function renameVars(text, map) {
  let out = text;
  for (const [from, to] of byLengthDesc(map)) {
    /* NOT \b: a word boundary sits between "d" and "-", so after --accent
       became --brand-500 a later brand -> splash rule rewrote it again as
       --splash-500. A token name ends where neither a word character nor a
       hyphen follows. */
    out = out.replaceAll(new RegExp(`--${escape(from)}(?![\\w-])`, "g"), `--${to}`);
  }
  return out;
}

/**
 * `bg-accent` -> `bg-brand-500`, inside class attributes only.
 *
 * Scoped to attributes because a blind replace also rewrote CSS properties and
 * URLs — `border-radius` is not a `border-` utility and `play.google.com` is
 * not a token.
 */
export function renameClasses(text, map, { jsx = false } = {}) {
  const pairs = byLengthDesc(map);
  const attr = jsx ? JSX_ATTR() : /\b(class|className)\s*=\s*"([^"]*)"/g;

  return text.replace(attr, (whole, ...rest) => {
    /* The brace is CAPTURED and put back. Matching `{` without capturing it
       silently ate it, turning className={`…`} into className=`…`} across ten
       files — valid-looking text that does not compile. */
    const [name, brace, quote, body] = jsx ? rest : [rest[0], "", '"', rest[1]];
    let next = body;
    for (const [from, to] of pairs) {
      /* A key may be prefix-qualified: `border:white/10` -> line, but
         `bg:white/10` -> sunken. The same opacity means a hairline on an edge
         and a raised surface on a fill, and one map for both silently picked
         whichever came first. */
      const [qualifier, token] = from.includes(":") ? from.split(":") : [null, from];
      const prefixes = qualifier ?? "bg|text|border|ring|fill|stroke|from|via|to|decoration|placeholder|accent|divide|outline|shadow";
      next = next.replace(
        /* `/` closes the lookahead because Tailwind's opacity modifier sits
           directly after the token — bg-rose-500/15 is still the rose-500
           token, and leaving it out skipped every translucent class. */
        new RegExp(`(^|[\\s:])((?:${prefixes})-)${escape(token)}(?=$|[\\s"'\`/])`, "g"),
        (_m, lead, prefix) => `${lead}${prefix}${to}`,
      );
    }
    return `${name}=${brace ?? ""}${quote}${next}${quote}`;
  });
}

/**
 * Turn `style="color:var(--icon)"` into the class `text-icon`.
 *
 * Rule 5 says the markup is 100% Tailwind. An inline style is a third source
 * of truth that no lint of the token layer can see, and tic-tac-toe carried
 * 102 of them — almost all of the form `color:var(--token)`, which a utility
 * already expresses exactly.
 */
export function inlineStylesToUtilities(html, { typeScale = {}, explicit = {} } = {}) {
  const leftovers = [];
  let converted = 0;

  const out = html.replace(/<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, (tag, name, attrs) => {
    const styleMatch = attrs.match(/\sstyle="([^"]*)"/);
    if (!styleMatch) return tag;

    const keep = [];
    const add = [];
    for (const decl of styleMatch[1].split(";")) {
      if (!decl.trim()) continue;
      const [rawProp, ...rest] = decl.split(":");
      const prop = rawProp.trim().toLowerCase();
      const value = rest.join(":").trim();

      const prefix = PROP_TO_PREFIX[prop];
      const token = value.match(/^var\(\s*--([\w-]+)\s*\)$/);
      if (prefix && token) { add.push(`${prefix}-${token[1]}`); continue; }
      if (prefix && value === "#ffffff") { add.push(`${prefix}-ink-inverse`); continue; }

      const step = prop === "font-size" ? typeScale[value] : null;
      if (step) { add.push(`text-${step}`); continue; }

      /* Declarations a person mapped by hand in the palette's migrate.styles.
         Everything else here is a mechanical translation; this is the escape
         hatch for the ones that need a decision, and writing them down in the
         palette keeps the decision reviewable instead of buried in a regex. */
      const chosen = explicit[`${prop}:${value}`.replace(/\s+/g, "")];
      if (chosen) { add.push(...chosen.split(/\s+/)); continue; }

      /* `border-top: 1px solid var(--line)` is two utilities and no judgment. */
      const edge = prop.match(/^border(?:-(top|right|bottom|left))?$/);
      const edgeToken = edge && value.match(/^1px\s+solid\s+var\(\s*--([\w-]+)\s*\)$/);
      if (edgeToken) {
        const side = { top: "t", right: "r", bottom: "b", left: "l" }[edge[1]] ?? "";
        add.push(`border${side ? "-" + side : ""}`, `border-${edgeToken[1]}`);
        continue;
      }

      keep.push(decl.trim());
      leftovers.push(`${prop}: ${value}`);
    }

    if (!add.length) return tag;
    converted += add.length;

    let next = attrs.replace(/\sstyle="[^"]*"/, keep.length ? ` style="${keep.join(";")}"` : "");
    next = next.match(/\sclass="/)
      ? next.replace(/\sclass="([^"]*)"/, (_m, c) => ` class="${c} ${add.join(" ")}"`)
      : `${next} class="${add.join(" ")}"`;
    return `<${name}${next}>`;
  });

  return { text: out, converted, leftovers };
}

/** px value -> the core type step that already means it, when one does. */
export function typeScaleLookup(coreType) {
  const byPx = {};
  for (const [step, spec] of Object.entries(coreType)) {
    if (step === "_" || typeof spec !== "object") continue;
    byPx[spec.size] = step;
  }
  return byPx;
}

/**
 * A JSX class attribute, including the braced forms.
 *
 * `className={`py-4 border-b ${extra}`}` is the shape a conditional class list
 * takes, and an expression that required the quote to sit directly after `=`
 * skipped every one of them — tic-tac-toe's Header kept `border-slate-200`
 * through a whole migration because of it.
 *
 * Returned fresh each call: a /g regex carries lastIndex, and sharing one
 * instance across files makes the second file start mid-way through.
 */
const JSX_ATTR = () => /\b(class|className)\s*=\s*(\{\s*)?(["'`])([\s\S]*?)\3/g;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byLengthDesc = (map) =>
  Object.entries(map).filter(([k]) => !k.startsWith("_")).sort((a, b) => b[0].length - a[0].length);

/**
 * `text-brand-500 dark:text-brand-500` -> `text-brand-500`.
 *
 * This is the whole return on making dark a token scope. Before the rename,
 * `text-sky-700 dark:text-sky-300` had to name both values because the class
 * WAS the value. Afterwards both sides are the same token and the variant is
 * noise — the token itself changes under `@variant dark`.
 *
 * Only removes a `dark:` utility whose base sibling is byte-identical. A pair
 * that still differs after the rename is a real difference the tokens do not
 * yet capture, and deleting it would silently change the dark theme.
 */
export function collapseDarkPairs(text, { jsx = true } = {}) {
  let removed = 0;
  const attr = jsx ? JSX_ATTR() : /\b(class|className)\s*=\s*"([^"]*)"/g;

  const out = text.replace(attr, (whole, ...rest) => {
    const [name, brace, quote, body] = jsx ? rest : [rest[0], "", '"', rest[1]];
    const classes = body.split(/\s+/).filter(Boolean);
    const base = new Set(classes.filter((c) => !c.startsWith("dark:")));
    const kept = classes.filter((c) => {
      if (!c.startsWith("dark:")) return true;
      if (base.has(c.slice(5))) { removed++; return false; }
      return true;
    });
    return `${name}=${brace ?? ""}${quote}${kept.join(" ")}${quote}`;
  });

  return { text: out, removed };
}
