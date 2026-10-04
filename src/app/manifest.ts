import type { MetadataRoute } from "next";

// output: "export" prerenders every route; a metadata route has to declare
// itself static or the build refuses to collect it.
export const dynamic = "force-static";


export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ritesh Firodiya",
    short_name: "Ritesh F",
    description:
      "Full-stack engineer. The work, the process, and every app with its screens and its wiki.",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#F5F6F8", // --color-page
    theme_color: "#0B1220", // --color-ink
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      // Maskable: Android crops an install icon to its own shape, and a square
      // photo survives that where a letterform loses its edges.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
