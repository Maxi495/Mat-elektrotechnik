import { ImageResponse } from "next/og";
import { firma } from "@/daten/firma";
import { bricolage600, figtree500, logoSvg } from "./vorschau-daten";

/**
 * Vorschaubild für soziale Netzwerke und Messenger (SEO-Optimierung.md, Kapitel 11).
 * 1200 × 630, weißer Grund mit Original-Logo, Überschrift in Bricolage Grotesque,
 * darunter die Leitung in Mat-Rot. Wird beim Bau als PNG erzeugt.
 */
export const vorschauGroesse = { width: 1200, height: 630 };
export const vorschauTyp = "image/png";

export async function vorschaubild({ titel, zeile }: { titel: string; zeile: string }) {
  const bricolage = Buffer.from(bricolage600, "base64");
  const figtree = Buffer.from(figtree500, "base64");
  const logo = logoSvg;

  const gross = titel.length > 44 ? 62 : titel.length > 30 ? 74 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          padding: "64px 72px 0 96px",
          fontFamily: "Figtree",
          position: "relative",
        }}
      >
        {/* Die Leitung im Kanal mit Knotenpunkt */}
        <div style={{ position: "absolute", left: 48, top: 0, width: 4, height: 438, background: "#D70036", display: "flex" }} />
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 434,
            width: 1152,
            height: 4,
            background: "#D70036",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 424,
            width: 24,
            height: 24,
            borderRadius: 12,
            background: "#D70036",
            display: "flex",
          }}
        />

        {/* Original-Logo, unverändert, auf Weiß */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={`data:image/svg+xml;base64,${logo}`} width={176} height={92} />

        <div style={{ display: "flex", flexDirection: "column", marginBottom: 236 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage Grotesque",
              fontSize: gross,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#000000",
              maxWidth: 980,
            }}
          >
            {titel}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 96,
            right: 72,
            bottom: 0,
            height: 192,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            color: "#3D3D3D",
          }}
        >
          <div style={{ display: "flex", maxWidth: 720 }}>{zeile}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 72,
              padding: "0 36px",
              borderRadius: 36,
              background: "#D70036",
              color: "#FFFFFF",
              fontSize: 28,
            }}
          >
            {firma.telefon.anzeige}
          </div>
        </div>
      </div>
    ),
    {
      ...vorschauGroesse,
      fonts: [
        { name: "Bricolage Grotesque", data: bricolage, style: "normal", weight: 600 },
        { name: "Figtree", data: figtree, style: "normal", weight: 500 },
      ],
    },
  );
}
