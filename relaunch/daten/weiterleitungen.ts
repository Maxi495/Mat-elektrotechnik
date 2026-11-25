import { leistungsPfad, stellenPfad } from "./adressen";

/**
 * Dauerhafte Weiterleitungen (301) von den Adressen der alten TYPO3-Seite.
 * Grundlage: Informationsarchitektur.md, Abschnitt 13, und SEO-Optimierung.md, 11.1.
 * Ziele folgen den Adressen aus der SEO-Datei.
 *
 * Jede alte Adresse steht einmal ohne und einmal mit Schrägstrich am Ende,
 * damit die Umleitung in einem Schritt ankommt.
 */
type Regel = { source: string; destination: string; statusCode: 301 };

const alt: Array<[von: string, nach: string]> = [
  ["/de", "/"],
  ["/de/unternehmen", "/unternehmen"],
  ["/de/unternehmen/ueber-uns", "/unternehmen"],
  ["/de/unternehmen/karriere", "/karriere"],
  // Stellenseiten der alten Seite (Kontext.md, Abschnitt 7)
  ["/de/unternehmen/elektroinstallateur-m/w", stellenPfad("elektroinstallateur")],
  [
    "/de/unternehmen/karriere/elektromeister-als-projektleiter-m/w",
    stellenPfad("projektleiter"),
  ],
  [
    "/de/unternehmen/karriere/azubi-als-elektroniker-fuer-energie-und-gebaeudetechnik-m/w/d",
    stellenPfad("ausbildung"),
  ],
  ["/de/kompetenzen", "/leistungen"],
  ["/de/kompetenzen/installationsarbeiten", leistungsPfad("elektroinstallation")],
  ["/de/kompetenzen/elektromobilitaet", leistungsPfad("wallbox")],
  ["/de/kompetenzen/blitzschutz", leistungsPfad("blitzschutz")],
  [
    "/de/kompetenzen/it-infrastruktur-edv-netzwerktechnik",
    leistungsPfad("netzwerktechnik"),
  ],
  ["/de/kompetenzen/planung-von-verteileranlagen", leistungsPfad("verteilerbau")],
  ["/de/kompetenzen/antennentechnik", leistungsPfad("antennentechnik")],
  ["/de/kompetenzen/anlagen-und-ihre-ueberpruefung", leistungsPfad("pruefung")],
  ["/de/photovoltaik", leistungsPfad("photovoltaik")],
  ["/de/referenzen", "/referenzen"],
  // Es gibt keinen Ratgeber (Informationsarchitektur.md, Annahme A3). Der ELMAR-Beitrag steht unter "Über uns".
  ["/de/news", "/unternehmen"],
  ["/de/service", "/kontakt"],
  ["/de/service/anfahrt", "/kontakt"],
  ["/de/service/kontakt", "/kontakt"],
  ["/de/service/suche", "/"],
  ["/de/service/impressum", "/impressum"],
  ["/de/datenschutz-1", "/datenschutz"],
  ["/de/datenschutz", "/datenschutz"],
];

/**
 * Adressen, die in der Informationsarchitektur anders lauten als in der SEO-Datei.
 * Die SEO-Datei gilt, die anderen Schreibweisen leiten um.
 */
const abweichend: Array<[von: string, nach: string]> = [
  ["/ueber-uns", "/unternehmen"],
  ["/leistungen/verteilerbau", leistungsPfad("verteilerbau")],
  ["/leistungen/e-check", leistungsPfad("pruefung")],
  ["/leistungen/antennentechnik", leistungsPfad("antennentechnik")],
];

const fest: Regel[] = [...alt, ...abweichend].flatMap(([von, nach]) => [
  { source: von, destination: nach, statusCode: 301 as const },
  { source: `${von}/`, destination: nach, statusCode: 301 as const },
]);

export const weiterleitungen: Regel[] = [
  ...fest,
  // Regel für Adressen: kein Schrägstrich am Ende (Informationsarchitektur.md, Abschnitt 14).
  { source: "/:pfad+/", destination: "/:pfad+", statusCode: 301 },
];
