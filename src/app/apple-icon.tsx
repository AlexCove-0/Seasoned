import { ImageResponse } from "next/og";

// iOS uses this for the Home Screen tile. It doesn't round the corners of
// the source image itself, so this is drawn edge-to-edge and iOS masks it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 120,
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
