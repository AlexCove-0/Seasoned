import { ImageResponse } from "next/og";

// Generated at build time rather than checked in as a binary, so the mark
// stays in sync with the palette in globals.css.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f5233",
          color: "#faf8f5",
          fontSize: 44,
          fontWeight: 600,
          fontFamily: "Georgia, serif",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
