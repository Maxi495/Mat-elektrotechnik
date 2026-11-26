/**
 * Einzugsgebiet. Einzige Stelle für Karte, Ortsliste und strukturierte Daten.
 * Liste: Informationsarchitektur.md, Abschnitt 12 (dort als Vorschlag markiert, bitte von Mat prüfen lassen).
 *
 * x und y sind die Lage auf der schematischen Karte (0 bis 100, Norden oben),
 * grob aus der geografischen Lage abgeleitet und nicht maßstäblich.
 */
export interface Ort {
  name: string;
  bereich: "kern" | "umkreis" | "muenchen";
  x: number;
  y: number;
  /** Seite, auf der die Beschriftung steht. */
  beschriftung: "links" | "rechts" | "oben" | "unten";
  /** Entfernung von Germering. Nicht geliefert. */
  entfernungKm: number | null;
  hinweis?: string;
}

export const orte: Ort[] = [
  { name: "Germering", bereich: "kern", x: 53.8, y: 52.9, beschriftung: "links", entfernungKm: 0 },
  { name: "Puchheim", bereich: "umkreis", x: 47.6, y: 41.9, beschriftung: "links", entfernungKm: null },
  { name: "Eichenau", bereich: "umkreis", x: 32, y: 31, beschriftung: "oben", entfernungKm: null },
  { name: "Gröbenzell", bereich: "umkreis", x: 56.9, y: 14.2, beschriftung: "rechts", entfernungKm: null },
  { name: "Olching", bereich: "umkreis", x: 37.3, y: 6, beschriftung: "links", entfernungKm: null },
  { name: "Fürstenfeldbruck", bereich: "umkreis", x: 6, y: 23.2, beschriftung: "oben", entfernungKm: null },
  { name: "Gilching", bereich: "umkreis", x: 21.3, y: 69.7, beschriftung: "links", entfernungKm: null },
  { name: "Krailling", bereich: "umkreis", x: 68, y: 78, beschriftung: "links", entfernungKm: null },
  { name: "Planegg", bereich: "umkreis", x: 80, y: 71, beschriftung: "rechts", entfernungKm: null },
  { name: "Gräfelfing", bereich: "umkreis", x: 83.1, y: 60.5, beschriftung: "rechts", entfernungKm: null },
  { name: "Gauting", bereich: "umkreis", x: 59.1, y: 93, beschriftung: "rechts", entfernungKm: null },
  { name: "Freiham", bereich: "muenchen", x: 70.2, y: 48.5, beschriftung: "rechts", entfernungKm: null },
  { name: "Aubing", bereich: "muenchen", x: 74.7, y: 37.4, beschriftung: "rechts", entfernungKm: null },
  { name: "Lochhausen", bereich: "muenchen", x: 70.7, y: 24.5, beschriftung: "rechts", entfernungKm: null },
  { name: "Pasing", bereich: "muenchen", x: 100, y: 40, beschriftung: "rechts", entfernungKm: null },
];

export const kernort = orte.find((o) => o.bereich === "kern")!;
export const umkreis = orte.filter((o) => o.bereich === "umkreis");
export const muenchenWest = orte.filter((o) => o.bereich === "muenchen");

/** Orte für die strukturierten Daten (SEO-Optimierung.md, 11.4). */
export const areaServed = ["Germering", "Puchheim", "Gilching", "Fürstenfeldbruck", "München"];
