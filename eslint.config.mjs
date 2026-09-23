import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // public/ holds generated and vendored files, not source.
    "public/**",
    "scripts/captured/**",
    // .context/ is the design set, not the app. _chrome.js and _gallery.js are
    // copied BYTE FOR BYTE from the canonical set and must never be edited per
    // product (STYLE-GUIDE.md §13), so a lint rule that would have us "fix" an
    // unused catch binding in them is pointed at the wrong repository — the fix
    // belongs upstream, in every set at once, or nowhere.
    ".context/**",
  ]),
]);

export default eslintConfig;
