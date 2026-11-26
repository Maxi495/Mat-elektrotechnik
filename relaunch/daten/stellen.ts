import { stellenAdressen, stellenPfad, type StelleId } from "./adressen";

/**
 * Offene Stellen. Einzige Stelle für Karriereseite und Stellenseiten.
 * Inhalte: Kontext.md, Abschnitt 4.4. Gehalt, Arbeitszeit und Ansprechperson nennt die alte Seite nicht.
 */
export interface Stelle {
  id: StelleId;
  slug: string;
  pfad: string;
  titel: string;
  /** Seitentitel für Suchmaschinen, höchstens rund 60 Zeichen. */
  seoTitel: string;
  art: "Fachkraft" | "Meister" | "Ausbildung";
  kurz: string;
  einleitung: string;
  aufgaben: string[];
  anforderungen: string[];
  angebot: string[];
  offen: boolean;
  /**
   * Datum der Veröffentlichung (JJJJ-MM-TT) für die strukturierten Daten "JobPosting".
   * Nicht bekannt. Solange null, wird für diese Stelle kein JobPosting ausgegeben.
   */
  veroeffentlicht: string | null;
}

const daten: Record<StelleId, Omit<Stelle, "id" | "slug" | "pfad">> = {
  elektroinstallateur: {
    titel: "Elektroinstallateur (m/w/d)",
    seoTitel: "Elektroinstallateur (m/w/d) in Germering | Mat",
    art: "Fachkraft",
    kurz: "Installation, Kundendienst und Beleuchtung bei Privat- und Gewerbekunden.",
    einleitung:
      "Sie installieren, warten und reparieren elektrische Anlagen bei unseren Kunden im Raum München und beraten sie vor Ort.",
    aufgaben: [
      "Elektroinstallation, Sicherheits- und Kommunikationstechnik",
      "Wartung, Instandsetzung und Kundendienst mit Fehlersuche und Reparaturen",
      "Austausch und Erneuerung von Beleuchtung",
      "Beratung der Kunden",
      "Termin-, Einsatz- und Materialplanung",
      "Dokumentation für die Abrechnung (Regienachweise)",
    ],
    anforderungen: [
      "Ausbildung als Elektroniker für Energie- und Gebäudetechnik oder vergleichbar",
      "Mehrjährige Erfahrung mit Stark- und Schwachstromanlagen",
      "Gute Deutschkenntnisse",
      "Selbstständige, zuverlässige und kundenorientierte Arbeitsweise",
      "Führerschein Klasse B",
    ],
    angebot: [
      "Überdurchschnittliche Vergütung",
      "Betreuung durch Obermonteur oder Projektleiter",
      "Weiterentwicklung bis zum Kundendienst-Obermonteur",
      "Arbeitskleidung, Werkzeug, Maschinen und Fahrzeug werden gestellt",
      "Gutes Betriebsklima",
    ],
    offen: true,
    veroeffentlicht: null,
  },
  projektleiter: {
    titel: "Projektleiter / Elektromeister (m/w/d)",
    seoTitel: "Projektleiter Elektromeister (m/w/d) Germering | Mat",
    art: "Meister",
    kurz: "Projekte vom Angebot bis zur Abnahme führen, mit eigenem Team.",
    einleitung:
      "Elektrotechnik auf höchster Stufe: Sie führen Projekte vom Angebot bis zur Abnahme und leiten Ihr Team.",
    aufgaben: [
      "Projekte planen und steuern, Material einkaufen, Personal einteilen",
      "Schriftverkehr nach VOB, Besprechungen mit Bauherrenvertretern und Gewerken",
      "Montage-, Werks- und Bestandspläne erstellen",
      "Aufmaße prüfen, Abschlags- und Schlussrechnungen vorbereiten",
      "Budget und Qualität überwachen",
      "Mitarbeiter und Subunternehmer koordinieren",
      "Nachtragsangebote erstellen, Kunden gewinnen und betreuen",
      "Team führen, Ausbildung unterstützen, Abläufe verbessern",
    ],
    anforderungen: [
      "Elektrotechnikermeister oder vergleichbare Qualifikation",
      "Idealerweise Erfahrung als Bau- oder Projektleiter größerer Vorhaben",
      "Mehrjährige Erfahrung als Obermonteur",
      "Kenntnisse in Gebäude- und Energietechnik, Normen und VOB/B",
      "Führungserfahrung und Durchsetzungsvermögen",
      "Führerschein Klasse B",
    ],
    angebot: [
      "Führungsaufgabe mit Eigenverantwortung",
      "Attraktive Vergütung",
      "Unbefristeter Vertrag",
      "Fortbildung",
      "Sehr gute Aufstiegsmöglichkeiten",
    ],
    offen: true,
    veroeffentlicht: null,
  },
  ausbildung: {
    titel: "Ausbildung zum Elektroniker für Energie- und Gebäudetechnik (m/w/d)",
    seoTitel: "Ausbildung Elektroniker (m/w/d) in Germering | Mat",
    art: "Ausbildung",
    kurz: "Handwerk lernen im jungen Team, mit moderner Ausrüstung und Aufstiegschancen.",
    einleitung:
      "In der Ausbildung lernen Sie das Handwerk von Grund auf, auf echten Baustellen und an der Seite erfahrener Monteure.",
    aufgaben: [
      "Handwerkliche Tätigkeiten nach Ausbildungsordnung und Tarifvertrag",
      "Mitarbeit auf Baustellen und im Kundendienst",
    ],
    anforderungen: [
      "Qualifizierender Hauptschulabschluss oder höher",
      "Interesse am Handwerk",
      "Zuverlässig, teamfähig, belastbar und ehrgeizig",
      "Interesse an Weiterbildung",
    ],
    angebot: [
      "Tariflohn",
      "Aufstiegschancen",
      "Moderne Ausrüstung",
      "Schulungsangebot",
      "Kollegiale Unternehmenskultur",
    ],
    offen: true,
    veroeffentlicht: null,
  },
};

export const stellen: Stelle[] = (Object.keys(stellenAdressen) as StelleId[]).map((id) => ({
  id,
  slug: stellenAdressen[id],
  pfad: stellenPfad(id),
  ...daten[id],
}));

export const offeneStellen = stellen.filter((s) => s.offen);

export const stelleNachSlug = (slug: string): Stelle | undefined =>
  stellen.find((s) => s.slug === slug);

/** Warum hier arbeiten: Vorteile aus den Stellenanzeigen der bisherigen Seite. */
export const vorteile: { titel: string; text: string }[] = [
  {
    titel: "Alles wird gestellt",
    text: "Arbeitskleidung, Werkzeug, Maschinen und Fahrzeug bekommen Sie von uns.",
  },
  {
    titel: "Vergütung über dem Schnitt",
    text: "Fachkräfte erhalten bei uns eine überdurchschnittliche Vergütung, Auszubildende Tariflohn.",
  },
  {
    titel: "Aufstieg im Betrieb",
    text: "Vom Monteur zum Kundendienst-Obermonteur oder zum Projektleiter: Wir fördern, wer weiterkommen will.",
  },
  {
    titel: "Laufende Schulung",
    text: "Unser Team arbeitet mit aktuellen Produkten und wird dafür laufend geschult.",
  },
  {
    titel: "Projekte mit Abwechslung",
    text: "Elektroinstallation, Photovoltaik, Smart Home, Blitzschutz, Antennentechnik: Kein Tag gleicht dem anderen.",
  },
  {
    titel: "Junges Team",
    text: "Sie arbeiten in einem jungen, motivierten Team mit gutem Betriebsklima.",
  },
];
