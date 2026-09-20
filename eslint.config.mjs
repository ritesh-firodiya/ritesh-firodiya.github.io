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
    // public/ holds vendored third-party bundles — Tailwind's Play CDN build
    // and lucide's UMD build, copied in by scripts/sync-designs.mjs — plus 209
    // design HTML files and their own tailwind.config.js. None of it is source,
    // all of it is minified or generated, and linting it fails the build on
    // someone else's code style.
    "public/**",
    "scripts/captured/**",
  ]),
]);

export default eslintConfig;
