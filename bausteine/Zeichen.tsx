import type { ReactNode, CSSProperties } from "react";
import type { ZeichenName } from "@/daten/leistungen";

/**
 * Schaltzeichen und weitere Bildzeichen (Design.md, Abschnitt 6).
 * Ein Stil für alle: Linie 1,75 px, runde Enden, keine gefüllten Flächen, Feld 24 × 24.
 * Die Farbe erbt vom Text. Grundlage sind genormte Schaltzeichen, leicht vereinfacht.
 *
 * Jede Linie trägt pathLength="1", damit sich das Zeichen beim ersten Erscheinen selbst zeichnen kann.
 */
export type WeiteresZeichen =
  | "telefon"
  | "brief"
  | "ort"
  | "uhr"
  | "pfeil"
  | "plus"
  | "haken"
  | "stern"
  | "stecker"
  | "winkel"
  | "warnung"
  | "kreuz"
  | "foto"
  | "haus"
  | "extern"
  | "siegel"
  | "pokal"
  | "team"
  | "pause"
  | "weiter"
  | "lupe"
  | "minus";

export type ZeichenArt = ZeichenName | WeiteresZeichen;

const L = (d: string, key?: string | number) => <path key={key ?? d} d={d} pathLength={1} />;

/** Bewegliches Teil: schließt bei Maus darüber den Stromkreis. */
const Hebel = ({ d, zu, drehpunkt }: { d: string; zu: string; drehpunkt: string }) => (
  <path
    d={d}
    pathLength={1}
    className="zeichen__teil zeichen__teil--schliesst"
    style={{ "--zu": zu, transformOrigin: drehpunkt } as CSSProperties}
  />
);

const zeichen: Record<ZeichenArt, ReactNode> = {
  /* Die neun Schaltzeichen der Leistungen */

  // Steckdose: Halbkreis mit Strich und Schutzkontakt
  steckdose: [L("M5 17a7 7 0 0 1 14 0"), L("M8.5 10h7"), L("M12 10V4.5")],

  // Ladepunkt: Steckdose mit Blitz
  ladepunkt: [
    L("M3 18.5a6.5 6.5 0 0 1 13 0"),
    L("M6.5 12h6"),
    L("M9.5 12V7.5"),
    <path
      key="blitz"
      d="M18.6 3l-3 5.5h4.4l-3 5.5"
      pathLength={1}
      className="zeichen__teil zeichen__teil--zuckt"
    />,
  ],

  // Solarzelle: Rechteck mit Diagonale und Pfeilen
  solarzelle: [
    L("M4 10.5h16V20H4z"),
    L("M4 20l16-9.5"),
    L("M6 2.5l3 3.5"),
    L("M9 6V3.7M9 6H6.7"),
    L("M11.5 2.5l3 3.5"),
    L("M14.5 6V3.7M14.5 6h-2.3"),
  ],

  // Schalter mit Funkbogen
  funkschalter: [
    <circle key="a" cx="5" cy="18.5" r="1.6" pathLength={1} />,
    <circle key="b" cx="19" cy="18.5" r="1.6" pathLength={1} />,
    <Hebel key="hebel" d="M6.4 17.7L16.5 12" zu="29.4deg" drehpunkt="0% 100%" />,
    L("M16 9a3 3 0 0 1 3-3"),
    L("M12.5 9A6.5 6.5 0 0 1 19 2.5"),
  ],

  // Sicherungsautomat: Schalter mit Auslöser
  sicherungsautomat: [
    L("M12 2.5V6"),
    L("M10.2 5.2l3.6 3.6M13.8 5.2l-3.6 3.6"),
    <Hebel key="hebel" d="M12 17L7 9.5" zu="33.7deg" drehpunkt="100% 100%" />,
    L("M12 17v4.5"),
    L("M12 18.4h3.6v2.4H12"),
  ],

  // Messgerät: Kreis mit V
  messgeraet: [
    <circle key="k" cx="12" cy="12" r="7.5" pathLength={1} />,
    L("M9 8.8l3 6.6 3-6.6"),
    L("M2 12h2.5M19.5 12H22"),
  ],

  // Datendose: Rechteck mit drei Abgängen
  datendose: [L("M5 4h14v9H5z"), L("M8.5 13v7"), L("M12 13v7"), L("M15.5 13v7")],

  // Erdungszeichen: drei kürzer werdende Striche
  erdung: [L("M12 3v8"), L("M5 11h14"), L("M7.5 15h9"), L("M10 19h4")],

  // Antennenzeichen: Y auf Strich
  antenne: [L("M12 3v18"), L("M12 12L6 3"), L("M12 12l6-9"), L("M8.5 21h7")],

  /* Weitere Zeichen im selben Linienstil */

  telefon: [
    L(
      "M5.2 3.5h3.6l1.9 4.7-2.3 1.5a11.5 11.5 0 0 0 5.9 5.9l1.5-2.3 4.7 1.9v3.6a1.7 1.7 0 0 1-1.7 1.7C10.6 20.5 3.5 13.4 3.5 5.2a1.7 1.7 0 0 1 1.7-1.7z",
    ),
  ],
  brief: [L("M3 6h18v12H3z"), L("M3.5 6.8L12 13l8.5-6.2")],
  ort: [
    L("M12 21s-6.5-5.6-6.5-10.6a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"),
    <circle key="k" cx="12" cy="10.4" r="2.2" pathLength={1} />,
  ],
  uhr: [<circle key="k" cx="12" cy="12" r="8.5" pathLength={1} />, L("M12 7.5V12l3 2")],
  pfeil: [L("M4 12h16"), L("M14 6l6 6-6 6")],
  plus: [L("M12 5v14"), L("M5 12h14")],
  haken: [L("M5 12.5l4.5 4.5L19 7.5")],
  stern: [L("M12 3.6l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.2-4.1 5.8-.9z")],
  stecker: [L("M9 3v5"), L("M15 3v5"), L("M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0z"), L("M12 17v4")],
  winkel: [L("M6 9l6 6 6-6")],
  warnung: [
    <circle key="k" cx="12" cy="12" r="8.5" pathLength={1} />,
    L("M12 7.5V13"),
    L("M12 16.3v.2"),
  ],
  kreuz: [L("M6 6l12 12"), L("M18 6L6 18")],
  foto: [
    L("M4 8h3l1.5-2.5h7L17 8h3v11H4z"),
    <circle key="k" cx="12" cy="13.3" r="3.2" pathLength={1} />,
  ],
  haus: [L("M3.5 11.5L12 4l8.5 7.5"), L("M6 10v9.5h12V10")],
  extern: [L("M10 5H5v14h14v-5"), L("M14 5h5v5"), L("M19 5l-8 8")],
  siegel: [
    <circle key="k" cx="12" cy="9" r="5.5" pathLength={1} />,
    L("M8.6 13.4L7 21l5-2.6 5 2.6-1.6-7.6"),
  ],
  pokal: [
    L("M8 4h8v5a4 4 0 0 1-8 0z"),
    L("M8 6H5a3 3 0 0 0 3 3"),
    L("M16 6h3a3 3 0 0 1-3 3"),
    L("M12 13v4"),
    L("M8.5 20h7"),
  ],
  team: [
    <circle key="a" cx="9" cy="8.5" r="3" pathLength={1} />,
    L("M3.5 19.5a5.5 5.5 0 0 1 11 0"),
    <circle key="b" cx="16.8" cy="9.5" r="2.4" pathLength={1} />,
    L("M16.4 14.4a4.6 4.6 0 0 1 4.3 5.1"),
  ],
  // Laufband anhalten und weiterlaufen lassen
  pause: [L("M9 6v12"), L("M15 6v12")],
  weiter: [L("M8.5 5.5v13l10-6.5z")],
  // Karte: Suche und Verkleinern
  lupe: [<circle key="k" cx="10.5" cy="10.5" r="6" pathLength={1} />, L("M15 15l5 5")],
  minus: [L("M5 12h14")],
};

export function Zeichen({
  name,
  groesse,
  zeichnet = false,
  className = "",
  style,
}: {
  name: ZeichenArt;
  groesse?: "gross" | "klein";
  /** Zeichnet sich beim ersten Erscheinen selbst (nur mit Skript). */
  zeichnet?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const klassen = ["zeichen", groesse ? `zeichen--${groesse}` : "", className].filter(Boolean).join(" ");
  return (
    <svg
      className={klassen}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-zeichnet={zeichnet ? "" : undefined}
      style={style}
    >
      {zeichen[name]}
    </svg>
  );
}

/** Fünf Sterne. Gefüllt sind so viele, wie die Bewertung hat. */
export function Sterne({ wert, text }: { wert: number; text: string }) {
  return (
    <span className="sterne" role="img" aria-label={text}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Zeichen
          key={i}
          name="stern"
          style={{ "--i": i, fill: i < Math.round(wert) ? undefined : "none" } as CSSProperties}
        />
      ))}
    </span>
  );
}

/** Kippschalter als reines Zierelement. Der Zustand kommt vom umgebenden Bedienelement. */
export function Kippschalter({ an }: { an?: boolean }) {
  return (
    <span className="kippschalter" data-an={an === undefined ? undefined : String(an)} aria-hidden="true">
      <span className="kippschalter__hebel" />
    </span>
  );
}
