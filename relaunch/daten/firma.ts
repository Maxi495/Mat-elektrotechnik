/**
 * Firmendaten. Einzige Stelle für Name, Adresse, Telefon, Zeiten, Bewertungsstand und Auszeichnungen.
 * Quelle der Fakten: Kontext.md, Abschnitt 1, und SEO-Optimierung.md.
 *
 * Was nicht gesichert ist, steht hier als Platzhalter im Format [OFFEN: ...]
 * oder als Schalter mit dem Wert false. Nichts davon ist erfunden.
 */

export const firma = {
  name: "Mat-Elektrotechnik GmbH",
  kurzname: "Mat-Elektrotechnik",
  /** Adresse der Seite im Netz, sobald die Domain umgezogen ist. */
  domain: "https://www.mat-elektrotechnik.de",

  adresse: {
    strasse: "Industriestraße 12",
    plz: "82110",
    ort: "Germering",
    bundesland: "BY",
    land: "DE",
  },

  telefon: {
    anzeige: "089 23750352",
    international: "+49 89 23750352",
    href: "tel:+498923750352",
  },
  email: "info@mat-elektrotechnik.de",

  geschaeftsfuehrer: "Miodrag Manojlovic",
  geschaeftsfuehrerTitel: "Elektromeister",
  handelsregister: "HRB 246899",
  registergericht: "Amtsgericht München",
  ustId: "DE 323 580 611",
  unternehmensgegenstand: "Elektrotechnik",

  gegruendet: 2010,
  gmbhSeit: 2018,
  /** Laut Auftrag und Kontext.md: Geschäftsführer ist Elektromeister. */
  meisterbetrieb: true,

  erreichbarkeit: {
    tage: "Montag bis Freitag",
    /**
     * Uhrzeiten sind nicht bestätigt. Kontext.md nennt keine, die SEO-Datei schlägt 7 bis 16 Uhr vor
     * und verlangt, die Zeiten vor dem Einbau zu prüfen. Sobald Mat sie bestätigt:
     * bestaetigt auf true setzen. Dann erscheinen sie auf der Seite, in der Meta-Beschreibung
     * der Kontaktseite und in den strukturierten Daten.
     */
    bestaetigt: false,
    von: "07:00",
    bis: "16:00",
    anzeige: "7 bis 16 Uhr",
  },

  /** Stand laut SEO-Optimierung.md vom 25.11.2026. */
  google: {
    note: 4.9,
    noteAnzeige: "4,9",
    anzahl: 67,
    stand: "2026-11-25",
    /** Suche nach dem Firmenprofil. Der direkte Link zum Profil fehlt noch. */
    profil:
      "https://www.google.com/maps/search/?api=1&query=Mat-Elektrotechnik+GmbH+Industriestra%C3%9Fe+12+Germering",
  },

  routenplaner:
    "https://www.google.com/maps/dir/?api=1&destination=Industriestra%C3%9Fe+12%2C+82110+Germering",

  facebook: "https://www.facebook.com/MAT.Elektrotechnik/",

  auszeichnungen: [
    {
      name: "Markenpreis ELMAR 2023",
      kurz: "ELMAR-Preis 2023",
      detail: "Kategorie 1",
      text: "Am 7. Dezember 2023 wurde der Markenpreis ELMAR beim Markenforum der Elektrobranche in fünf Kategorien verliehen. Mat-Elektrotechnik wurde in Kategorie 1 ausgezeichnet und setzte sich gegen zahlreiche Mitbewerber aus ganz Deutschland durch. Den Preis vergibt die Initiative „Elektromarken. Starke Partner.“ jedes Jahr für herausragendes Markenbewusstsein.",
    },
  ],

  /**
   * "E-CHECK" ist eine geschützte Marke der Elektro-Innungen (SEO-Optimierung.md, 6.3).
   * Nur auf true setzen, wenn Mat Innungsbetrieb mit E-CHECK-Berechtigung ist.
   * Solange false: Die Leistung heißt "Anlagenprüfung & DGUV V3".
   */
  eCheckBerechtigt: false,

  /** Firmenvideo der alten Seite. Die Datei liegt bisher nur auf dem alten Server. */
  video: null as null | { src: string; poster: string },

  einzugsgebietZeile:
    "Elektro-Meisterbetrieb in Germering, tätig im Landkreis Fürstenfeldbruck und im Raum München.",
} as const;

/** Sichtbarer Platzhalter für fehlende Inhalte. Alle Vorkommen stehen in der Liste offener Punkte. */
export function offen(wasFehlt: string): string {
  return `[OFFEN: ${wasFehlt}]`;
}

export const adresszeile = `${firma.adresse.strasse}, ${firma.adresse.plz} ${firma.adresse.ort}`;

/** Erreichbarkeit als Satzteil. Ohne bestätigte Uhrzeiten mit sichtbarem Platzhalter. */
export const erreichbarkeitText = firma.erreichbarkeit.bestaetigt
  ? `${firma.erreichbarkeit.tage}, ${firma.erreichbarkeit.anzeige}`
  : `${firma.erreichbarkeit.tage} ${offen("Uhrzeiten bestätigen, Vorschlag der SEO-Datei: 7 bis 16 Uhr")}`;

export const jahreAmMarkt = (jahr: number) => jahr - firma.gegruendet;
