/**
 * Einzugsgebiet. Einzige Stelle für Karte, Ortsliste und strukturierte Daten.
 * Liste: Informationsarchitektur.md, Abschnitt 12 (dort als Vorschlag markiert, bitte von Mat prüfen lassen).
 *
 * lon und lat sind die Ortsmitte laut OpenStreetMap (© OpenStreetMap-Mitwirkende, ODbL).
 * Die Karte führt die Strecke vom Betrieb zu dieser Stelle.
 */
export interface Ort {
  name: string;
  bereich: "kern" | "umkreis" | "muenchen";
  lon: number;
  lat: number;
  /** Entfernung von Germering. Nicht geliefert. */
  entfernungKm: number | null;
  hinweis?: string;
}

export const orte: Ort[] = [
  { name: "Germering", bereich: "kern", lon: 11.3614, lat: 48.1374, entfernungKm: 0 },
  { name: "Puchheim", bereich: "umkreis", lon: 11.3526, lat: 48.1705, entfernungKm: null },
  { name: "Eichenau", bereich: "umkreis", lon: 11.3223, lat: 48.1726, entfernungKm: null },
  { name: "Gröbenzell", bereich: "umkreis", lon: 11.3709, lat: 48.1942, entfernungKm: null },
  { name: "Olching", bereich: "umkreis", lon: 11.3279, lat: 48.2078, entfernungKm: null },
  { name: "Fürstenfeldbruck", bereich: "umkreis", lon: 11.2547, lat: 48.1795, entfernungKm: null },
  { name: "Gilching", bereich: "umkreis", lon: 11.2922, lat: 48.114, entfernungKm: null },
  { name: "Krailling", bereich: "umkreis", lon: 11.4051, lat: 48.0993, entfernungKm: null },
  { name: "Planegg", bereich: "umkreis", lon: 11.422, lat: 48.1037, entfernungKm: null },
  { name: "Gräfelfing", bereich: "umkreis", lon: 11.43, lat: 48.1212, entfernungKm: null },
  { name: "Gauting", bereich: "umkreis", lon: 11.3803, lat: 48.0668, entfernungKm: null },
  { name: "Freiham", bereich: "muenchen", lon: 11.4066, lat: 48.1421, entfernungKm: null },
  { name: "Aubing", bereich: "muenchen", lon: 11.4141, lat: 48.1584, entfernungKm: null },
  { name: "Lochhausen", bereich: "muenchen", lon: 11.4058, lat: 48.1802, entfernungKm: null },
  { name: "Pasing", bereich: "muenchen", lon: 11.4607, lat: 48.1478, entfernungKm: null },
];

export const kernort = orte.find((o) => o.bereich === "kern")!;
export const umkreis = orte.filter((o) => o.bereich === "umkreis");
export const muenchenWest = orte.filter((o) => o.bereich === "muenchen");

/** Orte für die strukturierten Daten (SEO-Optimierung.md, 11.4). */
export const areaServed = ["Germering", "Puchheim", "Gilching", "Fürstenfeldbruck", "München"];
