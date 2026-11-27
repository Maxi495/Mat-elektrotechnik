import type { LeistungId } from "@/daten/adressen";
import type { RaumId } from "./haus";

/**
 * Wo die neun Leistungen im Haus sitzen (Informationsarchitektur.md, Abschnitt 9), von wo die Kamera sie zeigt
 * und wie die Leitung vom Zählerschrank dorthin läuft (Design.md, Abschnitt 11).
 *
 * Maße in Metern, Ursprung an der Hausecke hinten links: [x nach rechts, y nach oben, z nach vorn].
 */

export type P = readonly [number, number, number];

export interface Ort {
  /** Hier sitzt der rote Punkt */
  anker: P;
  /** Standort der Kamera und der Punkt, auf den sie blickt */
  auge: P;
  blick: P;
  /** Dieser Raum bekommt Licht, wenn die Leistung gewählt ist */
  raum?: RaumId;
  /** Wegpunkte ins Haus, vom Vorplatz bis in den Raum. Ohne Weg bleibt die Kamera draußen. */
  weg?: readonly Wegpunkt[];
  /** Verlauf der Leitung vom Zählerschrank bis zur Leistung */
  leitung: readonly P[];
}

/** Wegpunkte auf Augenhöhe. Die ersten beiden liegen draußen vor der Haustür und auf der Dachterrasse. */
export const WEGPUNKTE = {
  vorplatz: [5.22, 1.7, 11.2],
  tuer: [5.22, 1.65, 6.95],
  flurVorn: [5.62, 1.65, 5.5],
  flurMitte: [5.62, 1.65, 3.9],
  flurHinten: [5.3, 1.65, 0.98],
  technik: [3.25, 1.6, 1.2],
  wohnen: [7.3, 1.65, 3.85],
  luft: [6.05, 8.9, 11.6],
  terrasse: [6.05, 7.65, 7.0],
  dgTuer: [6.05, 7.65, 5.0],
  dgInnen: [6.35, 7.65, 3.9],
} as const satisfies Record<string, P>;

export type Wegpunkt = keyof typeof WEGPUNKTE;

/** Welche Wegpunkte direkt verbunden sind */
export const WEGNETZ: readonly (readonly [Wegpunkt, Wegpunkt])[] = [
  ["vorplatz", "tuer"],
  ["tuer", "flurVorn"],
  ["flurVorn", "flurMitte"],
  ["flurMitte", "flurHinten"],
  ["flurHinten", "technik"],
  ["flurMitte", "wohnen"],
  ["luft", "terrasse"],
  ["terrasse", "dgTuer"],
  ["dgTuer", "dgInnen"],
];

/** Von diesen Wegpunkten aus ist man im Freien */
export const DRAUSSEN: readonly Wegpunkt[] = ["vorplatz", "luft"];

/* Die Leitung: Sie beginnt am Zählerschrank im Technikraum und läuft unter der Decke weiter. */
const SCHRANK: P = [1.75, 2.05, 0.44];
const DECKE: P = [1.75, 2.62, 0.44];
const FLUR: P = [5.86, 2.62, 0.44];
/** Steigleitung in der Ecke des Flurs, hinauf bis aufs Dach */
const steig = (y: number): P => [5.86, y, 0.44];

export const ORTE: Record<LeistungId, Ort> = {
  elektroinstallation: {
    anker: [6.2, 1.55, 2.62],
    auge: [8.72, 1.55, 5.35],
    blick: [6.9, 1.22, 2.5],
    raum: "wohnen",
    weg: ["vorplatz", "tuer", "flurVorn", "flurMitte", "wohnen"],
    leitung: [SCHRANK, DECKE, FLUR, [6.2, 2.62, 0.44], [6.2, 2.62, 2.62], [6.14, 1.08, 2.62], [6.14, 0.32, 2.62]],
  },
  wallbox: {
    anker: [0.5, 1.85, 6.5],
    auge: [3.9, 1.75, 10.6],
    blick: [1.25, 1.0, 6.4],
    raum: "garage",
    leitung: [SCHRANK, DECKE, [0.42, 2.62, 0.44], [0.42, 2.62, 6.5], [0.42, 1.5, 6.5]],
  },
  photovoltaik: {
    anker: [6.95, 9.55, 2.6],
    auge: [14.6, 15.4, 11.4],
    blick: [6.6, 8.5, 2.5],
    leitung: [SCHRANK, DECKE, FLUR, steig(8.92), [6.95, 8.92, 0.44], [6.95, 8.98, 1.2]],
  },
  "smart-home": {
    anker: [9.0, 1.78, 4.2],
    auge: [6.5, 1.6, 4.12],
    blick: [9.0, 1.2, 5.85],
    raum: "wohnen",
    weg: ["vorplatz", "tuer", "flurVorn", "flurMitte"],
    leitung: [SCHRANK, DECKE, FLUR, [9.02, 2.62, 0.44], [9.02, 2.62, 4.2], [9.08, 1.5, 4.2]],
  },
  verteilerbau: {
    anker: [1.75, 2.3, 0.6],
    auge: [2.55, 1.5, 2.1],
    blick: [1.75, 1.25, 0.4],
    raum: "technik",
    weg: ["vorplatz", "tuer", "flurVorn", "flurMitte", "flurHinten", "technik"],
    // Vom Hausanschluss an der linken Wand in den Zählerschrank
    leitung: [[0.36, 0.15, 0.44], [0.36, 1.1, 0.44], [0.75, 1.1, 0.44], [1.2, 1.1, 0.44]],
  },
  pruefung: {
    anker: [2.82, 1.5, 0.82],
    auge: [3.3, 1.5, 2.05],
    blick: [2.5, 1.0, 0.55],
    raum: "technik",
    weg: ["vorplatz", "tuer", "flurVorn", "flurMitte", "flurHinten", "technik"],
    leitung: [[2.1, 0.5, 0.52], [2.1, 0.3, 0.52], [2.82, 0.3, 0.7], [2.82, 0.98, 0.78]],
  },
  netzwerktechnik: {
    anker: [6.8, 8.0, 0.62],
    auge: [6.35, 7.55, 3.35],
    blick: [7.0, 7.3, 0.7],
    raum: "dg",
    weg: ["luft", "terrasse", "dgTuer", "dgInnen"],
    leitung: [SCHRANK, DECKE, FLUR, steig(8.38), [6.8, 8.38, 0.44], [6.8, 7.75, 0.44]],
  },
  blitzschutz: {
    anker: [9.62, 7.3, 4.3],
    auge: [27.5, 9.6, 17.0],
    blick: [9.3, 6.1, 4.2],
    // Vom Potentialausgleich am Zählerschrank zur Erdung, die Ableitung hinauf zur Fangstange
    leitung: [[1.75, 0.35, 0.44], [1.75, 0.12, 0.44], [9.25, 0.12, 0.44], [9.46, 0.12, 0.44], [9.46, 0.12, 4.3], [9.46, 8.78, 4.3], [9.56, 8.78, 4.3], [9.56, 10.55, 4.3]],
  },
  antennentechnik: {
    anker: [3.0, 10.25, 0.72],
    auge: [-4.2, 13.2, 8.2],
    blick: [3.1, 9.3, 0.9],
    leitung: [SCHRANK, DECKE, FLUR, steig(8.92), [3.0, 8.92, 0.44], [3.0, 8.92, 0.72], [3.0, 9.55, 0.72]],
  },
};
