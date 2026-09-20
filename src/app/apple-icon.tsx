import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// output: "export" prerenders every route; an ImageResponse route has to say
// so explicitly or the build refuses to collect it.
export const dynamic = "force-static";

// Generated rather than drawn, so there is no binary to keep in sync with the
// palette. Ink ground, paper monogram, accent rule — the same three tokens the
// site is built from.
export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", background: "#14130f",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, color: "#fbf9f4", lineHeight: 1 }}>R</div>
        <div style={{ width: 52, height: 5, background: "#8a3324", marginTop: 14, borderRadius: 999 }} />
      </div>
    ),
    size,
  );
}
