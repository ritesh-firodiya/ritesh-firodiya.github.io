import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages. Every route is a pure function of the
  // files in data/ — there is no request-time data anywhere on this site — so
  // the whole thing prerenders and Pages serves plain HTML.
  output: "export",

  // Pages has no image optimiser, so Next's default loader cannot run.
  images: { unoptimized: true },

  // Emit /products/index.html rather than /products.html, so a link to
  // /products resolves without a redirect on a static host.
  trailingSlash: true,

  // Fail the build on a type error rather than shipping past it. A site whose
  // whole premise is "the facts are checked" should not deploy with a red
  // type-check. (Next 16 dropped the `eslint` key; lint runs as its own script.)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
