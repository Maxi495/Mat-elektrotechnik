import type { LeistungId } from "./adressen";

/**
 * Bewertungen und Kundenstimmen. Einzige Stelle für Startseite, Referenzen und Leistungsseiten.
 *
 * googleBewertungen ist absichtlich leer: Es werden keine erfundenen Einträge eingetragen.
 * Sobald Mat die Texte aus dem Google-Profil freigibt, hier ergänzen. Der Baustein zeigt sie dann von selbst.
 *
 * kundenstimmen sind die sieben Stimmen der bisherigen Webseite. In Kontext.md stehen sie nur sinngemäß.
 * Deshalb erscheinen sie als Zusammenfassung und nicht als wörtliches Zitat, bis der Originalwortlaut vorliegt.
 */
export interface Bewertung {
  id: string;
  text: string;
  name: string;
  quelle: "google" | "direkt";
  /** Leer = allgemeine Stimme ohne Bezug zu einer Leistung. */
  leistungen: LeistungId[];
  /** ISO-Datum, nur bei Google-Bewertungen. */
  datum: string | null;
  /** 1 bis 5, nur bei Google-Bewertungen. */
  sterne: number | null;
  /** true = sinngemäß wiedergegeben, nicht wörtlich */
  sinngemaess: boolean;
}

export const googleBewertungen: Bewertung[] = [];

export const kundenstimmen: Bewertung[] = [
  {
    id: "riepertinger",
    name: "Margit Riepertinger",
    text: "Stromversorgung erneuert: schnell, sauber und zu einem fairen Preis, mit freundlichen und kompetenten Mitarbeitern.",
    quelle: "direkt",
    leistungen: ["elektroinstallation"],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "fuchsbichler",
    name: "Thomas Fuchsbichler",
    text: "Über 50 Jahre alte Hauptverteilung modernisiert und die Stromversorgung für eine Wallbox gelegt. Gelobt werden Planung, Kommunikation und Abnahme.",
    quelle: "direkt",
    leistungen: ["verteilerbau", "wallbox"],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "a-g",
    name: "A. G.",
    text: "Kompetent und schnell, mit korrekter Rechnung ohne Mehrkosten, nachdem ein anderer Elektriker mangelhaft gearbeitet hatte.",
    quelle: "direkt",
    leistungen: ["elektroinstallation", "pruefung"],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "bogner",
    name: "Florian Bogner",
    text: "Gelobt werden Preis-Leistung, Professionalität, Pünktlichkeit und die schnelle Reaktion.",
    quelle: "direkt",
    leistungen: [],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "urban",
    name: "M. Urban",
    text: "Schnelle, unkomplizierte Projektierung, mängelfreie Ausführung und ein günstiger Preis.",
    quelle: "direkt",
    leistungen: [],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "dausel",
    name: "Kerstin Dausel",
    text: "Komplettsanierung inklusive Elektrik: kompetente Beratung, und es war immer jemand erreichbar.",
    quelle: "direkt",
    leistungen: ["elektroinstallation"],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
  {
    id: "fischer",
    name: "Thomas Fischer",
    text: "Kompetent und zuverlässig. Die Zusammenarbeit besteht seit vielen Jahren.",
    quelle: "direkt",
    leistungen: [],
    datum: null,
    sterne: null,
    sinngemaess: true,
  },
];

export const alleBewertungen: Bewertung[] = [...googleBewertungen, ...kundenstimmen];

/**
 * Ein bis zwei Stimmen für eine Leistungsseite: zuerst solche mit Bezug zur Leistung,
 * dann allgemeine Stimmen. Die allgemeinen wechseln je Leistung, damit nicht überall dieselbe steht.
 */
export function bewertungenFuer(leistung: LeistungId, position: number, anzahl = 2): Bewertung[] {
  const passend = alleBewertungen.filter((b) => b.leistungen.includes(leistung));
  const allgemein = alleBewertungen.filter((b) => b.leistungen.length === 0);
  const gedreht = allgemein.map((_, i) => allgemein[(i + position) % allgemein.length]);
  return [...passend, ...gedreht].slice(0, anzahl);
}

export const hatBewertungZurLeistung = (leistung: LeistungId): boolean =>
  alleBewertungen.some((b) => b.leistungen.includes(leistung));
