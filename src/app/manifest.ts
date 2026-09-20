import type { MetadataRoute } from "next";

// output: "export" prerenders every route; a metadata route has to declare
// itself static or the build refuses to collect it.
export const dynamic = "force-static";


export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ritesh Firodiya",
    short_name: "Ritesh F",
    description:
      "Engineer who ships. Every app, its real price, the design system and the process behind them.",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#fbf9f4", // --color-paper
    theme_color: "#14130f", // --color-ink
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
