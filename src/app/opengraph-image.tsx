import { ImageResponse } from "next/og";

export const alt = "Ritesh Firodiya — Engineer who ships";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// output: "export" prerenders every route; an ImageResponse route has to say
// so explicitly or the build refuses to collect it.
export const dynamic = "force-static";

// Rendered once at build time, so it ships as a plain PNG with the static
// export. Colours are the real tokens; ImageResponse cannot read the CSS
// theme, so they are the one place in the codebase a hex is written twice.
// If the palette changes, this file changes with it.
const PAPER = "#fbf9f4";
const INK = "#14130f";
const INK2 = "#45423a";
const INK3 = "#78736a";
const ACCENT = "#8a3324";
const LINE = "#e4dfd2";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: PAPER, padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: ACCENT }} />
            <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: INK3 }}>
              Ritesh Firodiya
            </div>
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, color: INK, marginTop: 40, letterSpacing: -3, lineHeight: 1.05 }}>
            Engineer who ships.
          </div>
          <div style={{ fontSize: 34, color: INK2, marginTop: 28, maxWidth: 900, lineHeight: 1.4 }}>
            Thirteen products for India. Every app&rsquo;s real price, stated before you install it.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, background: LINE, marginBottom: 28 }} />
          <div style={{ display: "flex", gap: 40, fontSize: 24, color: INK3 }}>
            <div style={{ display: "flex" }}>Products</div>
            <div style={{ display: "flex" }}>Design system</div>
            <div style={{ display: "flex" }}>Process</div>
            <div style={{ display: "flex", marginLeft: "auto", color: ACCENT }}>
              ritesh-firodiya.github.io
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
