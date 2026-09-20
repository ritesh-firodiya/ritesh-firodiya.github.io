import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// output: "export" prerenders every route; an ImageResponse route has to say
// so explicitly or the build refuses to collect it.
export const dynamic = "force-static";

// The photo rather than a monogram — a home-screen icon is a face people
// recognise faster than a letter. Read off disk and inlined at build time:
// satori resolves data URIs, not file paths, and there is no server to fetch
// from under a static export.
const PHOTO = `data:image/jpeg;base64,${readFileSync(
  join(process.cwd(), "public", "me.jpg"),
).toString("base64")}`;

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#14130f" }}>
        <img src={PHOTO} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
