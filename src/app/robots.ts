import type { MetadataRoute } from "next";

// output: "export" prerenders every route; a metadata route has to declare
// itself static or the build refuses to collect it.
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Short links exist to bounce a phone to a store. They are not content,
        // they would compete with the real product pages in search, and half of
        // them will 404-equivalent once a platform opens.
        disallow: ["/go/"],
      },
    ],
    sitemap: "https://ritesh-firodiya.github.io/sitemap.xml",
    host: "https://ritesh-firodiya.github.io",
  };
}
