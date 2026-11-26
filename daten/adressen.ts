/**
 * Adressen der neun Leistungen. Eine Stelle für Menü, Seiten, Sitemap und Weiterleitungen.
 * Diese Datei enthält bewusst keine Bild-Importe, damit auch next.config.ts sie lesen kann.
 *
 * Wortlaut der Adressen: SEO-Optimierung.md, Kapitel 7.
 * Reihenfolge: Informationsarchitektur.md, Abschnitt 4.
 */
export const leistungsAdressen = {
  elektroinstallation: "elektroinstallation",
  wallbox: "wallbox",
  photovoltaik: "photovoltaik",
  "smart-home": "smart-home",
  verteilerbau: "zaehlerschrank-verteilerbau",
  pruefung: "e-check-pruefung",
  netzwerktechnik: "netzwerktechnik",
  blitzschutz: "blitzschutz",
  antennentechnik: "sat-antennentechnik",
} as const;

export type LeistungId = keyof typeof leistungsAdressen;

/** Feste Reihenfolge für Menü, Übersicht, Kacheln, Haus, Fuß und Formular. */
export const leistungsReihenfolge: LeistungId[] = [
  "elektroinstallation",
  "wallbox",
  "photovoltaik",
  "smart-home",
  "verteilerbau",
  "pruefung",
  "netzwerktechnik",
  "blitzschutz",
  "antennentechnik",
];

export function leistungsPfad(id: LeistungId): string {
  return `/leistungen/${leistungsAdressen[id]}`;
}

export const stellenAdressen = {
  elektroinstallateur: "elektroinstallateur",
  projektleiter: "projektleiter-elektromeister",
  ausbildung: "ausbildung-elektroniker",
} as const;

export type StelleId = keyof typeof stellenAdressen;

export function stellenPfad(id: StelleId): string {
  return `/karriere/${stellenAdressen[id]}`;
}
