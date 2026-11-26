import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Symbol für den Startbildschirm: das Schaltzeichen Steckdose auf Mat-Rot. Das Logo selbst bleibt unverändert. */
export default function Symbol() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D70036",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          <path d="M11 34a13 13 0 0 1 26 0" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M17.5 21h13" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 21V10" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
