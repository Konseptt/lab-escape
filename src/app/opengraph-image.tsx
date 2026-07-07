import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#131312",
          color: "#e8e6e3",
          padding: "72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" stroke="#e8e6e3" strokeWidth="1.5" />
            <path
              d="M7 22V13h5M17 2v9h-5M12 13v4"
              stroke="#e8e6e3"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="7.5" r="1.4" fill="#d97706" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 28, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              Lab Escape
            </div>
            <div style={{ fontSize: 22, color: "#9a9690" }}>{siteConfig.tagline}</div>
          </div>
        </div>
        <div style={{ maxWidth: 900, fontSize: 44, lineHeight: 1.15, fontWeight: 400 }}>
          Train on the experiments that built psychology.
        </div>
        <div style={{ fontSize: 22, color: "#9a9690", maxWidth: 820, lineHeight: 1.5 }}>
          Stroop, Simons, Asch, Milgram, and more. Trial-level logging. Open source.
        </div>
      </div>
    ),
    { ...size }
  );
}
