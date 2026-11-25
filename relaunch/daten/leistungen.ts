import type { StaticImageData } from "next/image";
import { firma, offen } from "./firma";
import {
  leistungsAdressen,
  leistungsPfad,
  leistungsReihenfolge,
  type LeistungId,
} from "./adressen";

import bildUnterverteilungWohnung from "@/bilder/unterverteilung-wohnung.webp";
import bildRohbau from "@/bilder/rohbau-leerrohre-decke.webp";
import bildZaehlerschrank from "@/bilder/zaehlerschrank-digitalzaehler.webp";
import bildPvDach from "@/bilder/photovoltaik-module-dach.webp";
import bildWohnraum from "@/bilder/wohnraum-ringleuchten.webp";
import bildBedienfeld from "@/bilder/smart-home-bedienfeld.webp";
import bildHauptverteilung from "@/bilder/hauptverteilung-schaltschrank.webp";
import bildSicherungsreihen from "@/bilder/verteiler-sicherungsreihen.webp";
import bildGeraetepruefung from "@/bilder/geraetepruefung-pruefplaketten.webp";
import bildNetzwerkSwitches from "@/bilder/netzwerkschrank-switches.webp";
import bildPatchfeld from "@/bilder/netzwerkschrank-patchfeld.webp";
import bildBlitzschutzDach from "@/bilder/blitzschutz-flachdach-fangstangen.webp";
import bildFangstangen from "@/bilder/blitzschutz-fangstangen-winter.webp";
import bildSat from "@/bilder/sat-schuessel-dach.webp";

/**
 * Die neun Leistungen. Einzige Stelle für Namen, Adressen, Texte, Fragen und Verknüpfungen.
 * Menü, Sicherungsreihe, Übersicht, Haus, Fußzeile, Formular und Leistungsseiten lesen von hier.
 *
 * Titel, Hauptüberschriften und Meta-Beschreibungen: SEO-Optimierung.md, Kapitel 8 (Wortlaut unverändert).
 * Reihenfolge, Abschnitte, verwandte Leistungen: Informationsarchitektur.md, Abschnitte 4, 7.3 und 8.
 * Fakten: Kontext.md. Fehlendes steht als [OFFEN: ...] im Text.
 *
 * Im Fließtext verlinkt die Schreibweise [Text](leistung:id) auf eine andere Leistung,
 * [Text](/pfad) auf eine andere Seite.
 */

export type Gruppe = "privat" | "gewerbe" | "hausverwaltung";

export const gruppenNamen: Record<Gruppe, string> = {
  privat: "Privatkunden",
  gewerbe: "Gewerbe",
  hausverwaltung: "Hausverwaltungen",
};

export type ZeichenName =
  | "steckdose"
  | "ladepunkt"
  | "solarzelle"
  | "funkschalter"
  | "sicherungsautomat"
  | "messgeraet"
  | "datendose"
  | "erdung"
  | "antenne";

export interface Leistung {
  id: LeistungId;
  slug: string;
  pfad: string;
  /** Name im Menü, in Kacheln, im Haus, in der Fußzeile und im Formular. Überall gleich. */
  name: string;
  /** Eine Zeile für das Aufklappmenü. */
  zeile: string;
  /** Zwei Zeilen für Sicherungsreihe, Karten und Haus. */
  kurztext: string;
  zeichen: ZeichenName;
  seo: { titel: string; h1: string; beschreibung: string };
  /** Zwei Sätze Nutzen unter der Hauptüberschrift. Der Suchbegriff steht im ersten Satz. */
  nutzen: string;
  ueberblick: string[];
  umfang: { titel: string; teile: { titel: string; text: string }[] };
  fuerWen: { titel: string; gruppen: Partial<Record<Gruppe, string>> };
  ablauf: { titel: string; schritte: { titel: string; text: string; dauer?: string }[] };
  kosten: { titel: string; absaetze: string[] };
  referenzenTitel: string;
  fragenTitel: string;
  fragen: { frage: string; antwort: string }[];
  verwandt: LeistungId[];
  bild: StaticImageData;
  bildAlt: string;
  /** Sichtbarer Hinweis unter dem Kopfbild, wenn ein passendes Foto noch fehlt. */
  bildHinweis?: string;
  reihenBild: StaticImageData;
  reihenBildAlt: string;
  /** Bildausschnitt im hohen Streifen der Sicherungsreihe. */
  reihenBildLage?: string;
  /** Ort im Haus für die Seite /haus (Informationsarchitektur.md, Abschnitt 9). */
  hausOrt: string;
}

const pruefungName = firma.eCheckBerechtigt
  ? "E-Check & Anlagenprüfung"
  : "Anlagenprüfung & DGUV V3";

const ablaufDauer = offen("ungefähre Dauer je Schritt");

const daten: Record<LeistungId, Omit<Leistung, "id" | "slug" | "pfad">> = {
  /* ------------------------------------------------------------------ 1 */
  elektroinstallation: {
    name: "Elektroinstallation",
    zeile: "Neubau, Umbau, Sanierung und Reparaturen",
    kurztext:
      "Licht- und Kraftinstallation für Wohnung, Haus und Gewerbe. Planung und Ausführung kommen aus einer Hand.",
    zeichen: "steckdose",
    seo: {
      titel: "Elektroinstallation Germering | Neubau & Sanierung | Mat",
      h1: "Elektroinstallation in Germering: Neubau, Umbau und Sanierung",
      beschreibung:
        "Licht- und Kraftinstallation für Wohnung, Haus und Gewerbe. Planung und Ausführung aus einer Hand. Angebot anfragen.",
    },
    nutzen:
      "Wir planen und bauen Ihre Elektroinstallation in Germering und im Münchner Westen: im Neubau, beim Umbau und in der Altbausanierung. Planung und Ausführung kommen aus einer Hand, vom Rohbau bis zur letzten Steckdose.",
    ueberblick: [
      "Neuinstallation für Rohbau, Haus und Betrieb",
      "Erweiterung und Sanierung bestehender Anlagen",
      "Beleuchtung, Sprechanlagen und Notbeleuchtung",
      "Fehlersuche und Reparaturen",
    ],
    umfang: {
      titel: "Was zur Elektroinstallation gehört",
      teile: [
        {
          titel: "Neuinstallation im Neubau",
          text: "Wir verlegen Leerrohre und Leitungen im Rohbau, setzen Schalter und Steckdosen und nehmen die Anlage in Betrieb. Das gilt für die Wohnung genauso wie für Einfamilienhaus, Büro und Produktionshalle. Den passenden [Verteiler](leistung:verteilerbau) planen und bauen wir gleich mit.",
        },
        {
          titel: "Umbau und Altbausanierung",
          text: "Alte Leitungen, zu wenige Stromkreise, fehlender Schutz: Wir prüfen die bestehende Anlage, erneuern, was nötig ist, und erweitern die Installation um neue Räume und Verbraucher. Wer mag, bereitet dabei gleich ein [Smart Home](leistung:smart-home) vor.",
        },
        {
          titel: "Beleuchtung innen und außen",
          text: "Wir installieren Licht- und Kraftstromkreise, LED-Beleuchtung, Treppen- und Außenlicht sowie Sicherheitsbeleuchtung. Wie das aussieht, zeigen unsere [Referenzen](/referenzen): indirektes Licht im Wohnraum, Stufenlicht an der Treppe, Strahler auf der Terrasse.",
        },
        {
          titel: "Sprechanlagen, Alarm und Notbeleuchtung",
          text: "Zur Hausinstallation gehören bei uns auch Sprechanlagen mit Türstation, Alarmsysteme und Notbeleuchtung. Die Datenleitungen dafür verlegen wir im selben Zug wie Ihr [Netzwerk](leistung:netzwerktechnik).",
        },
        {
          titel: "Reparaturen und Fehlersuche",
          text: "Wenn eine Sicherung immer wieder auslöst oder eine Steckdose tot bleibt, suchen wir den Fehler und beheben ihn fachgerecht. Defekte Leuchten und Schalter tauschen wir aus.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Elektroinstallationen ausführen",
      gruppen: {
        privat:
          "Sie bauen, sanieren oder brauchen zusätzliche Steckdosen und Stromkreise. Wir beraten Sie passend zu Bedarf und Budget.",
        gewerbe:
          "Büros, Werkstätten und Produktionshallen brauchen eine Betriebsinstallation, die mitwächst. Wir planen Licht- und Kraftstrom, Verteiler und Datenleitungen als ein Paket.",
        hausverwaltung:
          "Für Hausverwaltungen übernehmen wir Instandsetzung, Beleuchtungstausch und Erweiterungen in Wohnanlagen, mit Dokumentation für die Abrechnung.",
      },
    },
    ablauf: {
      titel: "So läuft Ihre Elektroinstallation ab",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie schildern uns Ihr Vorhaben per Formular oder Telefon, gern mit Plänen oder Fotos.",
        },
        {
          titel: "Beratung vor Ort",
          text: "Wir sehen uns Räume und bestehende Anlage an und klären, was Sie brauchen.",
        },
        { titel: "Angebot", text: "Sie erhalten ein Angebot mit allen Positionen." },
        {
          titel: "Umsetzung",
          text: "Wir installieren in Abstimmung mit Bauleitung und den anderen Gewerken.",
        },
        {
          titel: "Abnahme",
          text: "Wir messen und prüfen die Anlage, übergeben die Dokumentation und weisen Sie ein.",
        },
      ],
    },
    kosten: {
      titel: "Was die Elektroinstallation kostet",
      absaetze: [
        `Die Kosten hängen vor allem von der Größe des Objekts, von der Zahl der Stromkreise, Schalter und Steckdosen und vom Zustand der vorhandenen Anlage ab. Im Altbau kommt oft ein neuer Zählerschrank dazu. Nach dem Termin vor Ort erhalten Sie ein Angebot. ${offen("Preisrahmen für die Elektroinstallation")}`,
      ],
    },
    referenzenTitel: "Elektroinstallationen aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zur Elektroinstallation",
    fragen: [
      {
        frage: "Was kostet eine neue Elektroinstallation?",
        antwort:
          "Das hängt von Wohnfläche, Ausstattung und dem Zustand der bestehenden Anlage ab. Wir sehen uns das Objekt an und erstellen danach ein Angebot mit allen Positionen.",
      },
      {
        frage: "Wie lange dauert die Elektroinstallation?",
        antwort: `Die Dauer richtet sich nach Größe und Bauablauf. Im Neubau arbeiten wir in Abschnitten: Rohinstallation, Verteiler, Endmontage. ${offen("übliche Dauer für Wohnung und Einfamilienhaus")}`,
      },
      {
        frage: "Muss bei einer Altbausanierung die ganze Elektrik erneuert werden?",
        antwort:
          "Nicht immer. Wir prüfen die bestehende Anlage und sagen Ihnen, was bleiben kann und was aus Sicherheitsgründen erneuert werden sollte. Oft betrifft das den Zählerschrank, fehlende Fehlerstrom-Schutzschalter und alte Leitungen.",
      },
      {
        frage: "Übernehmen Sie auch kleine Aufträge und Reparaturen?",
        antwort:
          "Ja. Wir kommen auch für einzelne Steckdosen, den Tausch von Leuchten und die Fehlersuche.",
      },
      {
        frage: "Arbeiten Sie mit Architekten und anderen Gewerken zusammen?",
        antwort:
          "Ja. Bei Neubau und Sanierung stimmen wir uns mit Bauleitung, Architekt und den anderen Gewerken ab.",
      },
      {
        frage: "In welchen Orten arbeiten Sie?",
        antwort:
          "Unser Betrieb sitzt in Germering. Wir arbeiten im Landkreis Fürstenfeldbruck und im Raum München, vor allem im Münchner Westen.",
      },
    ],
    verwandt: ["verteilerbau", "smart-home", "netzwerktechnik"],
    bild: bildUnterverteilungWohnung,
    bildAlt:
      "Elektroinstallation in einer Wohnung: geöffnete Unterverteilung mit beschrifteten Sicherungen im Flur",
    reihenBild: bildRohbau,
    reihenBildAlt:
      "Elektroinstallation im Rohbau: Monteur verlegt Leerrohre auf der Bewehrung einer Decke",
    hausOrt: "Wohnraum: Steckdosen, Schalter, Licht",
  },

  /* ------------------------------------------------------------------ 2 */
  wallbox: {
    name: "Wallbox & E-Mobilität",
    zeile: "Ladepunkt für Eigenheim, Tiefgarage und Firma",
    kurztext:
      "Wir prüfen Ihre Hausinstallation, montieren die Wallbox und melden sie beim Netzbetreiber an.",
    zeichen: "ladepunkt",
    seo: {
      titel: "Wallbox-Installation Germering & München-West | Mat",
      h1: "Wallbox installieren lassen in Germering",
      beschreibung:
        "Wallbox für Eigenheim, Tiefgarage und Firma: Beratung, Anmeldung beim Netzbetreiber und Montage vom Elektrofachbetrieb aus Germering.",
    },
    nutzen:
      "Sie möchten eine Wallbox installieren lassen, in Germering oder im Münchner Westen? Wir prüfen Ihre Hausinstallation, montieren den Ladepunkt und melden ihn beim Netzbetreiber an.",
    ueberblick: [
      "Prüfung von Hausanschluss, Zählerschrank und Leitungsweg",
      "Fachgerechte Montage und Inbetriebnahme",
      "Anmeldung beim Netzbetreiber",
      "Ladepunkte für Eigenheim, Tiefgarage und Firma",
    ],
    umfang: {
      titel: "Was wir bei der Wallbox-Installation übernehmen",
      teile: [
        {
          titel: "Prüfung der Hausinstallation",
          text: "Vor der Montage prüfen wir, ob Hausanschluss, Zählerschrank und Absicherung für das Laden ausgelegt sind. Reicht die Anlage nicht aus, passen wir sie an oder erneuern den [Zählerschrank](leistung:verteilerbau).",
        },
        {
          titel: "Montage und Inbetriebnahme",
          text: "Wir legen die Zuleitung, setzen die nötigen Schutzeinrichtungen und montieren die Wallbox an Wand oder Stele. Nach der Messung nehmen wir den Ladepunkt in Betrieb und zeigen Ihnen die Bedienung.",
        },
        {
          titel: "Anmeldung beim Netzbetreiber",
          text: "Jeder Ladepunkt muss beim Netzbetreiber angemeldet werden. Bis 11 kW Ladeleistung genügt die Anmeldung, darüber ist vorab seine Zustimmung nötig. Diese Formalitäten übernehmen wir für Sie.",
        },
        {
          titel: "Ladepunkte für Firmen und Tiefgaragen",
          text: "Für Betriebe, Wohnanlagen und Tiefgaragen planen wir mehrere Ladepunkte samt Zuleitung und Verteilung. Bei mehreren Fahrzeugen verteilt ein Lastmanagement die verfügbare Leistung.",
        },
        {
          titel: "Laden mit eigenem Solarstrom",
          text: "Mit einer [Photovoltaikanlage](leistung:photovoltaik) laden Sie Ihr Auto mit Strom vom eigenen Dach. Wir stimmen Wallbox, Wechselrichter und Speicher aufeinander ab.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Ladepunkte bauen",
      gruppen: {
        privat:
          "Im Eigenheim reicht meist ein Ladepunkt in Garage oder Carport. Wir klären, welche Ladeleistung zu Auto und Hausanschluss passt.",
        gewerbe:
          "Für Fuhrpark, Mitarbeiter und Kunden planen wir Ladepunkte auf dem Firmengelände, mit Lastmanagement für mehrere Fahrzeuge.",
        hausverwaltung:
          "In Wohnanlagen und Tiefgaragen kommt es auf die gemeinsame Zuleitung an. Wir planen die Grundinstallation so, dass weitere Stellplätze später folgen können.",
      },
    },
    ablauf: {
      titel: "So kommen Sie zu Ihrer Wallbox",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie schreiben uns, wo geladen werden soll. Ein Foto vom Zählerschrank hilft bei der ersten Einschätzung.",
        },
        {
          titel: "Termin vor Ort",
          text: "Wir prüfen Hausanschluss, Zählerschrank, Leitungsweg und den Platz für die Wallbox.",
        },
        {
          titel: "Angebot und Anmeldung",
          text: "Sie erhalten ein Angebot. Nach Ihrer Zusage melden wir den Ladepunkt beim Netzbetreiber an.",
        },
        {
          titel: "Montage",
          text: "Wir legen die Zuleitung, montieren die Wallbox und passen den Zählerschrank an, wenn nötig.",
        },
        {
          titel: "Abnahme",
          text: "Wir messen, nehmen den Ladepunkt in Betrieb und zeigen Ihnen die Bedienung.",
        },
      ],
    },
    kosten: {
      titel: "Was eine Wallbox kostet und welche Förderung es gibt",
      absaetze: [
        `Den Preis bestimmen vor allem die Länge der Zuleitung, Wand- und Erdarbeiten, der Zustand des Zählerschranks und die gewählte Wallbox. ${offen("Preisrahmen für die Wallbox-Installation")}`,
        `Förderprogramme für Ladestationen ändern sich häufig. Wir prüfen im Beratungsgespräch, was für Ihr Vorhaben aktuell gilt. ${offen("aktuelle Förderung für Wallboxen in Germering und im Landkreis Fürstenfeldbruck")}`,
      ],
    },
    referenzenTitel: "Wallbox-Projekte aus der Region",
    fragenTitel: "Häufige Fragen zur Wallbox",
    fragen: [
      {
        frage: "Was kostet die Installation einer Wallbox?",
        antwort:
          "Die Kosten hängen von Leitungsweg, Zählerschrank und Wallbox-Modell ab. Nach einem Termin vor Ort bekommen Sie ein Angebot.",
      },
      {
        frage: "Brauche ich eine Genehmigung für die Wallbox?",
        antwort:
          "Jede Wallbox muss beim Netzbetreiber angemeldet werden. Bis 11 kW Ladeleistung genügt die Anmeldung, darüber ist seine Zustimmung nötig. Beides erledigen wir für Sie.",
      },
      {
        frage: "Reicht mein Hausanschluss für eine Wallbox?",
        antwort:
          "In den meisten Einfamilienhäusern ja. Wir prüfen Hausanschluss, Zählerschrank und Absicherung vor Ort. Wo die Leistung knapp ist, hilft ein Lastmanagement oder eine geringere Ladeleistung.",
      },
      {
        frage: "Wie lange dauert die Installation?",
        antwort: `Das hängt vom Leitungsweg und vom Zustand des Zählerschranks ab. ${offen("übliche Dauer und Vorlaufzeit für die Wallbox-Montage")}`,
      },
      {
        frage: "Kann ich die Wallbox mit meiner Photovoltaikanlage verbinden?",
        antwort:
          "Ja. Viele Wallboxen laden gezielt mit überschüssigem Solarstrom. Wir stimmen Wallbox und Wechselrichter aufeinander ab.",
      },
      {
        frage: "Was ist bei einer Ladestation im Mehrfamilienhaus zu beachten?",
        antwort:
          "Entscheidend sind die gemeinsame Zuleitung, die Zählerplätze und die Abstimmung mit Eigentümergemeinschaft und Hausverwaltung. Wir planen die Grundinstallation für die Tiefgarage so, dass weitere Stellplätze folgen können.",
      },
    ],
    verwandt: ["photovoltaik", "verteilerbau", "pruefung"],
    bild: bildZaehlerschrank,
    bildAlt:
      "Zählerschrank mit digitalem Zähler und Sicherungen: Ausgangspunkt für die Zuleitung einer Wallbox",
    bildHinweis: offen("Foto einer von Mat montierten Wallbox"),
    reihenBild: bildZaehlerschrank,
    reihenBildAlt:
      "Zählerschrank mit digitalem Zähler, an den die Zuleitung für eine Wallbox angeschlossen wird",
    hausOrt: "Garage oder Stellplatz",
  },

  /* ------------------------------------------------------------------ 3 */
  photovoltaik: {
    name: "Photovoltaik",
    zeile: "PV-Anlagen und Speicher für Haus und Gewerbe",
    kurztext:
      "Beratung, Planung und Montage Ihrer PV-Anlage, mit oder ohne Speicher. Alles aus einer Hand.",
    zeichen: "solarzelle",
    seo: {
      titel: "Photovoltaik Germering | Planung & Montage | Mat",
      h1: "Photovoltaikanlagen in Germering und Umgebung",
      beschreibung:
        "PV-Anlage mit oder ohne Speicher: Planung, Montage, Anmeldung und Wartung vom Elektrobetrieb vor Ort. Unverbindlich beraten lassen.",
    },
    nutzen:
      "Wir planen und montieren Photovoltaikanlagen in Germering und Umgebung, für Eigenheime genauso wie für Gewerbedächer. Beratung, Planung und Umsetzung kommen aus einer Hand.",
    ueberblick: [
      "Konzept nach Dach, Ausrichtung und Verbrauch",
      "Montage von Modulen, Wechselrichter und Speicher",
      "Anmeldung beim Netzbetreiber",
      "Erfahrung mit PV-Großanlagen für Gewerbe und Industrie",
    ],
    umfang: {
      titel: "Was wir bei Ihrer Photovoltaikanlage übernehmen",
      teile: [
        {
          titel: "Beratung und Planung",
          text: "Jedes Dach ist anders. Wir sehen uns Fläche, Ausrichtung und Ihren Stromverbrauch an und erstellen daraus ein Konzept, das zu Ihrem Gebäude passt.",
        },
        {
          titel: "Montage und elektrischer Anschluss",
          text: "Wir montieren Module und Unterkonstruktion, setzen den Wechselrichter und schließen die Anlage an Ihre Hausinstallation an. Oft muss dafür der [Zählerschrank](leistung:verteilerbau) angepasst werden. Das übernehmen wir mit.",
        },
        {
          titel: "Stromspeicher und Wallbox",
          text: "Ein Speicher hält Solarstrom für den Abend bereit. Wir beraten Sie, ob und in welcher Größe er zu Ihrem Verbrauch passt. Überschüsse laden Sie mit einer [Wallbox](leistung:wallbox) ins Auto.",
        },
        {
          titel: "Anmeldung und Inbetriebnahme",
          text: "Wir melden die Anlage beim Netzbetreiber an und unterstützen Sie bei der Eintragung im Marktstammdatenregister. Nach der Abnahme erklären wir Ihnen Anlage und Überwachung.",
        },
        {
          titel: "Wartung und Schutz",
          text: "Damit die Anlage dauerhaft Ertrag bringt, prüfen wir sie auf Wunsch regelmäßig. Zum Schutz vor Überspannung gehört ein abgestimmter [Blitzschutz](leistung:blitzschutz) dazu.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Photovoltaik planen",
      gruppen: {
        privat:
          "Auf dem Eigenheim senkt eine PV-Anlage Ihre Stromkosten über viele Jahre. Mit Speicher und Wallbox nutzen Sie mehr vom eigenen Strom.",
        gewerbe:
          "Wir haben langjährige Erfahrung mit PV-Großanlagen für Industrie- und Gewerbekunden. Große Dachflächen und hoher Verbrauch am Tag passen gut zusammen.",
        hausverwaltung:
          "Für Wohnanlagen planen wir Anlagen auf dem Gemeinschaftsdach und stimmen Zählerkonzept und Anschluss mit Ihnen ab.",
      },
    },
    ablauf: {
      titel: "So entsteht Ihre Photovoltaikanlage",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie nennen uns Adresse und Jahresverbrauch. Fotos vom Dach und vom Zählerschrank helfen.",
        },
        {
          titel: "Beratung vor Ort",
          text: "Wir sehen uns Dach, Leitungswege und Zählerschrank an und besprechen Ihre Ziele.",
        },
        {
          titel: "Konzept und Angebot",
          text: "Sie erhalten ein Konzept mit Anlagengröße, Speicher und allen Arbeiten.",
        },
        {
          titel: "Montage",
          text: "Wir montieren Module, Wechselrichter und Speicher und schließen die Anlage an.",
        },
        {
          titel: "Anmeldung und Abnahme",
          text: "Wir melden die Anlage an, nehmen sie in Betrieb und weisen Sie ein.",
        },
      ],
    },
    kosten: {
      titel: "Was eine PV-Anlage kostet und welche Förderung es gibt",
      absaetze: [
        `Die Kosten richten sich nach Anlagengröße, Dachart, Gerüst, Speicher und den nötigen Arbeiten am Zählerschrank. ${offen("Preisrahmen für Photovoltaikanlagen")}`,
        `Vergütung und Förderprogramme ändern sich häufig. Wir prüfen im Beratungsgespräch, was für Ihr Vorhaben aktuell gilt. ${offen("aktuelle Förderung und Vergütung für Photovoltaik in Germering")}`,
      ],
    },
    referenzenTitel: "Photovoltaik-Projekte aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zur Photovoltaik",
    fragen: [
      {
        frage: "Lohnt sich ein Stromspeicher?",
        antwort:
          "Ein Speicher lohnt sich vor allem, wenn Sie abends und nachts viel Strom brauchen. Wir rechnen anhand Ihres Verbrauchs durch, welche Größe sinnvoll ist.",
      },
      {
        frage: "Welche Förderung gibt es für Photovoltaik in Germering?",
        antwort: `Förderprogramme und Vergütungssätze ändern sich häufig. Wir prüfen im Beratungsgespräch, was für Ihr Vorhaben gilt. ${offen("aktuelle Förderprogramme für Germering")}`,
      },
      {
        frage: "Wer meldet die PV-Anlage an?",
        antwort:
          "Die Anmeldung beim Netzbetreiber übernehmen wir. Bei der Eintragung im Marktstammdatenregister der Bundesnetzagentur unterstützen wir Sie.",
      },
      {
        frage: "Was kostet eine Photovoltaikanlage?",
        antwort:
          "Das hängt von Anlagengröße, Dach, Speicher und dem Zustand des Zählerschranks ab. Nach dem Termin vor Ort erhalten Sie ein Angebot mit allen Positionen.",
      },
      {
        frage: "Ist mein Dach für Photovoltaik geeignet?",
        antwort:
          "Geeignet sind die meisten Dächer mit wenig Schatten, auch Ost-West-Dächer und Flachdächer. Wir prüfen Fläche, Ausrichtung, Dacheindeckung und den Leitungsweg zum Zählerschrank.",
      },
      {
        frage: "Muss ich ein Balkonkraftwerk anmelden?",
        antwort:
          "Ja. Steckersolargeräte werden im Marktstammdatenregister eingetragen. Ob Steckdose und Stromkreis dafür geeignet sind, prüfen wir gern.",
      },
    ],
    verwandt: ["wallbox", "verteilerbau", "blitzschutz"],
    bild: bildPvDach,
    bildAlt: "Photovoltaik: schwarze Solarmodule auf einem dunklen Ziegeldach",
    reihenBild: bildPvDach,
    reihenBildAlt: "Photovoltaik: schwarze Solarmodule auf einem dunklen Ziegeldach",
    hausOrt: "Dach",
  },

  /* ------------------------------------------------------------------ 4 */
  "smart-home": {
    name: "Smart Home",
    zeile: "Licht, Jalousien, Klima und Sound zentral steuern",
    kurztext:
      "Licht, Jalousien, Heizung und Sicherheit zentral steuern. Geplant und installiert für Neubau und Nachrüstung.",
    zeichen: "funkschalter",
    seo: {
      titel: "Smart Home & KNX Germering | Mat-Elektrotechnik",
      h1: "Smart Home vom Elektriker in Germering",
      beschreibung:
        "Licht, Jalousien, Heizung und Sicherheit zentral steuern. Planung und Installation für Neubau und Nachrüstung.",
    },
    nutzen:
      "Wir planen und installieren Ihr Smart Home in Germering und im Raum München. Licht, Jalousien, Heizung und Sicherheit steuern Sie zentral, am Schalter oder per Handy.",
    ueberblick: [
      "Licht, Jalousien, Heizung, Tür und Sound in einem System",
      "KNX-Businstallation für Neubau und Sanierung",
      "Bedienung per Schalter, Bedienfeld oder Handy",
      "Beratung passend zu Bedarf und Budget",
    ],
    umfang: {
      titel: "Was Ihr Smart Home kann",
      teile: [
        {
          titel: "Licht und Stimmung",
          text: "Ein Tastendruck schaltet die passende Lichtstimmung für Kochen, Essen oder Fernsehen. Leuchten lassen sich dimmen, gruppieren und nach Uhrzeit oder Bewegung schalten.",
        },
        {
          titel: "Jalousien und Beschattung",
          text: "Jalousien und Rollläden fahren nach Sonnenstand, Uhrzeit oder Wetter. So bleibt es im Sommer kühl, und abends schließt das Haus von selbst.",
        },
        {
          titel: "Heizung und Klima",
          text: "Jeder Raum bekommt seine Temperatur. Die Steuerung senkt die Heizung, wenn niemand da ist, und bindet auf Wunsch auch die Sauna ein.",
        },
        {
          titel: "Tür, Sprechanlage und Sicherheit",
          text: "Türstation, Türöffner und Alarmanlage gehören ins selbe System. Sie sehen am Bedienfeld oder Handy, wer klingelt, und schalten Licht und Alarm auch von unterwegs.",
        },
        {
          titel: "Sound in jedem Raum",
          text: "Musik folgt Ihnen durchs Haus oder spielt in jedem Raum etwas anderes. Die Leitungen dafür verlegen wir zusammen mit dem [Netzwerk](leistung:netzwerktechnik).",
        },
        {
          titel: "KNX-Businstallation",
          text: "KNX ist ein herstellerunabhängiger Standard für die Gebäudesteuerung. Im Neubau planen wir die Busleitung von Anfang an in die [Elektroinstallation](leistung:elektroinstallation) ein, im Bestand rüsten wir schrittweise nach. Strom vom eigenen Dach bindet die Steuerung über die [Photovoltaikanlage](leistung:photovoltaik) ein.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen sich ein Smart Home eignet",
      gruppen: {
        privat:
          "Im Eigenheim beginnen viele mit Licht und Jalousien und erweitern später. Wir planen so, dass das System mit Ihren Wünschen wächst.",
        gewerbe:
          "In Büro und Praxis spart eine Steuerung für Licht, Beschattung und Raumklima Energie und Handgriffe.",
      },
    },
    ablauf: {
      titel: "So entsteht Ihr Smart Home",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie schreiben uns, was Sie steuern möchten und ob Sie neu bauen oder nachrüsten.",
        },
        {
          titel: "Beratung",
          text: "Wir gehen Raum für Raum durch, welche Funktionen Ihren Alltag leichter machen.",
        },
        {
          titel: "Planung und Angebot",
          text: "Sie erhalten ein Konzept mit System, Funktionen und allen Arbeiten.",
        },
        {
          titel: "Installation",
          text: "Wir verlegen die Leitungen, bauen die Geräte ein und programmieren die Anlage.",
        },
        {
          titel: "Einweisung",
          text: "Wir zeigen Ihnen die Bedienung und passen die Szenen an Ihre Gewohnheiten an.",
        },
      ],
    },
    kosten: {
      titel: "Was ein Smart Home kostet",
      absaetze: [
        `Der Preis hängt von der Zahl der Räume und Funktionen, vom gewählten System und davon ab, ob neu gebaut oder nachgerüstet wird. Wir beraten Sie passend zu Bedarf und Budget. ${offen("Preisrahmen für Smart Home")}`,
      ],
    },
    referenzenTitel: "Smart-Home-Projekte aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zum Smart Home",
    fragen: [
      {
        frage: "Was kostet ein Smart Home?",
        antwort:
          "Das hängt von Räumen, Funktionen und System ab. Viele beginnen mit Licht und Jalousien und erweitern später. Nach der Beratung erhalten Sie ein Angebot.",
      },
      {
        frage: "Kann man ein Smart Home nachrüsten?",
        antwort:
          "Ja. Im Bestand arbeiten wir mit Funklösungen oder nutzen vorhandene Leitungen, sodass keine Wände geöffnet werden müssen. Bei einer Sanierung lohnt sich die Busleitung.",
      },
      {
        frage: "Was ist KNX?",
        antwort:
          "KNX ist ein weltweiter, herstellerunabhängiger Standard. Schalter, Sensoren und Antriebe verschiedener Hersteller arbeiten in einem System zusammen.",
      },
      {
        frage: "Funktioniert das Smart Home auch ohne Internet?",
        antwort:
          "Ja. Eine KNX-Anlage arbeitet im Haus eigenständig. Das Internet brauchen Sie nur für den Zugriff von unterwegs.",
      },
      {
        frage: "Wie bediene ich das Smart Home?",
        antwort:
          "Per Schalter an der Wand, über ein Bedienfeld oder mit dem Handy. Die wichtigsten Funktionen bleiben immer am Schalter erreichbar.",
      },
      {
        frage: "Kann ich später Funktionen ergänzen?",
        antwort:
          "Ja. Wir planen Reserven ein, damit Sie weitere Räume und Funktionen später ergänzen können.",
      },
    ],
    verwandt: ["elektroinstallation", "netzwerktechnik", "photovoltaik"],
    bild: bildWohnraum,
    bildAlt:
      "Wohnraum mit Ringleuchten und indirekter Deckenbeleuchtung, gesteuert über das Smart Home",
    reihenBild: bildBedienfeld,
    reihenBildAlt:
      "Smart Home: Bedienfeld mit Kamerabild der Türstation und Raumcontroller an der Wand",
    hausOrt: "Bedienfeld im Flur oder Wohnzimmer",
  },

  /* ------------------------------------------------------------------ 5 */
  verteilerbau: {
    name: "Zählerschrank & Verteilerbau",
    zeile: "Zählerschrank erneuern, Verteiler planen und bauen",
    kurztext:
      "Neuer Zählerschrank für Wärmepumpe, Wallbox oder PV-Anlage. Geplant, gebaut und mit dem Netzbetreiber abgestimmt.",
    zeichen: "sicherungsautomat",
    seo: {
      titel: "Zählerschrank & Verteilerbau Germering | Mat",
      h1: "Zählerschrank erneuern und Verteiler bauen",
      beschreibung:
        "Neuer Zählerschrank für Wärmepumpe, Wallbox oder PV-Anlage. Planung, Bau und Abstimmung mit dem Netzbetreiber.",
    },
    nutzen:
      "Wir erneuern Ihren Zählerschrank in Germering und im Raum München und bauen Verteiler nach Maß. Planung, Bau und Abstimmung mit dem Netzbetreiber kommen aus einer Hand.",
    ueberblick: [
      "Zählerschrank erneuern für Wärmepumpe, Wallbox oder PV",
      "Unterverteilungen und Steuerverteiler nach Maß",
      "Planung in EPLAN, Prüfung vor der Auslieferung",
      "Abstimmung mit dem Netzbetreiber",
    ],
    umfang: {
      titel: "Was wir im Verteilerbau für Sie tun",
      teile: [
        {
          titel: "Zählerschrank erneuern",
          text: "Alte Zählerschränke haben oft keinen Platz für neue Stromkreise und entsprechen nicht mehr den heutigen Anschlussbedingungen. Wir bauen einen neuen Schrank, setzen moderne Schutzeinrichtungen ein und stimmen den Zählerwechsel mit dem Netzbetreiber ab.",
        },
        {
          titel: "Unterverteilungen und Sicherungskästen",
          text: "Für Wohnung, Etage oder Werkstatt planen wir Unterverteilungen mit Reserve. Jeder Stromkreis wird beschriftet, damit Sie und jeder Elektriker nach uns sofort den Überblick haben.",
        },
        {
          titel: "Planung in EPLAN",
          text: "Verteiler und Schaltschränke planen wir in EPLAN. Sie erhalten Schaltpläne, die zur gebauten Anlage passen, und damit eine Grundlage für spätere Erweiterungen.",
        },
        {
          titel: "Schaltschränke für Gewerbe",
          text: "Wir fertigen Wandler- und Zählerverteiler, Steuerverteiler und Motor Control Center, vom Wohnbau bis zur Firmeneinspeisung. Jeder Schaltschrank wird vor der Auslieferung nach den geltenden Normen geprüft.",
        },
        {
          titel: "Steuerungen",
          text: "In den Verteiler bauen wir auch Steuerungen für Heizung, elektrische Jalousien, Tore und Leistung ein.",
        },
        {
          titel: "Sanierung und Wartung",
          text: "Bestehende Verteiler sanieren und modernisieren wir. Eine regelmäßige [Prüfung](leistung:pruefung) zeigt, wann Bauteile getauscht werden sollten. Auf Wunsch übernehmen wir danach die gesamte [Elektroinstallation](leistung:elektroinstallation).",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Verteiler bauen",
      gruppen: {
        privat:
          "Sie planen [Wallbox](leistung:wallbox), Wärmepumpe oder Photovoltaik? Dann ist der Zählerschrank oft der erste Schritt. Wir sagen Ihnen, ob Ihr Schrank reicht.",
        gewerbe:
          "Für Betriebe bauen wir Hauptverteilungen, Wandlermessungen und Steuerverteiler und dokumentieren die Anlage vollständig.",
        hausverwaltung:
          "In Wohnanlagen erneuern wir Zählerplätze und Verteiler Schritt für Schritt und stimmen Abschaltungen mit Ihnen ab.",
      },
    },
    ablauf: {
      titel: "So läuft der Umbau Ihres Zählerschranks ab",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie schicken uns ein Foto des Zählerschranks und schreiben, was dazukommen soll.",
        },
        {
          titel: "Bestandsaufnahme",
          text: "Wir prüfen Schrank, Hausanschluss und Zuleitungen vor Ort.",
        },
        {
          titel: "Planung und Angebot",
          text: "Sie erhalten einen Plan des neuen Verteilers und ein Angebot.",
        },
        {
          titel: "Bau und Umbau",
          text: "Wir stimmen den Termin mit dem Netzbetreiber ab und bauen den neuen Schrank ein.",
        },
        {
          titel: "Prüfung",
          text: "Wir messen die Anlage und übergeben Schaltplan und Dokumentation.",
        },
      ],
    },
    kosten: {
      titel: "Was ein neuer Zählerschrank kostet",
      absaetze: [
        `Die Kosten richten sich nach Größe und Zählerplätzen, nach der Zahl der Stromkreise und danach, ob Hausanschluss oder Zuleitungen angepasst werden müssen. ${offen("Preisrahmen für Zählerschrank und Verteilerbau")}`,
      ],
    },
    referenzenTitel: "Zählerschränke und Verteiler aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zu Zählerschrank und Verteiler",
    fragen: [
      {
        frage: "Wann muss der Zählerschrank erneuert werden?",
        antwort:
          "Solange an der Anlage nichts Wesentliches geändert wird, darf ein alter Zählerschrank meist bleiben. Kommen Wallbox, Wärmepumpe oder Photovoltaik dazu, verlangen die Anschlussbedingungen des Netzbetreibers oft einen Schrank nach heutigem Stand.",
      },
      {
        frage: "Was kostet ein neuer Zählerschrank?",
        antwort:
          "Das hängt von der Zahl der Zählerplätze und Stromkreise und vom Zustand von Hausanschluss und Zuleitungen ab. Nach der Bestandsaufnahme erhalten Sie ein Angebot.",
      },
      {
        frage: "Wie lange bin ich beim Umbau ohne Strom?",
        antwort: `Für den Wechsel muss der Strom abgeschaltet werden. Wir bereiten alles so vor, dass die Abschaltung kurz bleibt, und nennen Ihnen den Termin vorab. ${offen("übliche Dauer der Abschaltung")}`,
      },
      {
        frage: "Wer stimmt den Umbau mit dem Netzbetreiber ab?",
        antwort: "Das übernehmen wir, von der Anmeldung bis zum Zählerwechsel.",
      },
      {
        frage: "Reicht mein Zählerschrank für Wärmepumpe oder Wallbox?",
        antwort:
          "Das hängt von Platz, Absicherung und Baujahr ab. Schicken Sie uns ein Foto, dann geben wir Ihnen eine erste Einschätzung.",
      },
      {
        frage: "Was ist der Unterschied zwischen Zählerschrank und Unterverteilung?",
        antwort:
          "Im Zählerschrank sitzen Zähler und Hauptsicherungen. Die Unterverteilung verteilt den Strom auf die einzelnen Stromkreise einer Wohnung oder Etage.",
      },
    ],
    verwandt: ["elektroinstallation", "wallbox", "pruefung"],
    bild: bildHauptverteilung,
    bildAlt:
      "Verteilerbau: geöffneter Schaltschrank mit Sicherungslasttrennern in einem Technikraum",
    reihenBild: bildSicherungsreihen,
    reihenBildAlt:
      "Verteilerbau: großer Verteiler mit dicht bestückten Reihen aus Sicherungsautomaten",
    hausOrt: "Zählerschrank im Keller oder Hausanschlussraum",
  },

  /* ------------------------------------------------------------------ 6 */
  pruefung: {
    name: pruefungName,
    zeile: "Wiederkehrende Prüfung, Protokoll, Fehlersuche",
    kurztext:
      "Wir prüfen elektrische Anlagen und Geräte und dokumentieren das Ergebnis im Protokoll für Versicherung und Berufsgenossenschaft.",
    zeichen: "messgeraet",
    seo: {
      titel: firma.eCheckBerechtigt
        ? "E-Check & DGUV V3 Prüfung Germering | Mat"
        : "Anlagenprüfung & DGUV V3 Germering | Mat",
      h1: "Elektroprüfung für Betriebe und Hausverwaltungen",
      beschreibung:
        "Prüfung elektrischer Anlagen und Geräte mit Protokoll für Versicherung und Berufsgenossenschaft. Termine auch außerhalb der Betriebszeit.",
    },
    nutzen:
      "Wir prüfen elektrische Anlagen und Geräte für Betriebe und Hausverwaltungen in Germering und im Raum München. Nach der Prüfung erhalten Sie ein Protokoll für Versicherung und Berufsgenossenschaft.",
    ueberblick: [
      "Wiederkehrende Prüfung ortsfester Anlagen",
      "Geräteprüfung nach DGUV Vorschrift 3",
      "Prüfprotokoll als Nachweis",
      "Mängel beheben wir auf Wunsch gleich mit",
    ],
    umfang: {
      titel: "Was wir prüfen und wie",
      teile: [
        {
          titel: "Prüfung elektrischer Anlagen",
          text: "Wir prüfen Verteiler, Stromkreise und Schutzeinrichtungen durch Besichtigen, Erproben und Messen. Auch Anlagen, die unauffällig laufen, haben oft Mängel, die erst die Messung zeigt.",
        },
        {
          titel: "Geräteprüfung nach DGUV Vorschrift 3",
          text: "Ortsveränderliche Geräte wie Rechner, Verlängerungen, Maschinen und Küchengeräte prüfen wir einzeln und kennzeichnen sie mit einer Prüfplakette.",
        },
        {
          titel: "Protokoll und Nachweis",
          text: "Sie erhalten ein Prüfprotokoll mit Messwerten und festgestellten Mängeln. Damit weisen Sie gegenüber Versicherung und Berufsgenossenschaft nach, dass Ihre Anlage geprüft ist.",
        },
        {
          titel: "Mängel beheben",
          text: "Viele Mängel lassen sich mit kleinen Änderungen beheben. Was wir finden, setzen wir auf Wunsch gleich instand, bis hin zum neuen [Verteiler](leistung:verteilerbau).",
        },
        {
          titel: "Wartung und Fehlersuche",
          text: "Zwischen den Prüfungen warten wir Ihre Anlagen und suchen Fehler, wenn Schutzschalter auslösen oder Geräte ausfallen. Hat das Gebäude eine Blitzschutzanlage, prüfen wir den [Blitzschutz](leistung:blitzschutz) mit.",
        },
        {
          titel: "Wo wir prüfen",
          text: "In Wohnhäusern, Gewerbebetrieben, Geschäften, Gastronomie, landwirtschaftlichen Betrieben, Schulen und öffentlichen Gebäuden.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir prüfen",
      gruppen: {
        gewerbe:
          "Als Unternehmer müssen Sie elektrische Anlagen und Betriebsmittel regelmäßig prüfen lassen. Wir übernehmen Prüfung, Kennzeichnung und Dokumentation.",
        hausverwaltung:
          "Für Wohnanlagen prüfen wir Allgemeinstrom, Tiefgarage und Außenbeleuchtung und liefern das Protokoll für Ihre Unterlagen.",
        privat:
          "Vor dem Hauskauf oder bei einer alten Anlage zeigt die Prüfung, wie sicher die Elektrik ist. Was erneuert werden sollte, fließt in die [Elektroinstallation](leistung:elektroinstallation) ein.",
      },
    },
    ablauf: {
      titel: "So läuft die Prüfung ab",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie nennen uns das Objekt und ungefähr, wie viele Verteiler und Geräte zu prüfen sind.",
        },
        {
          titel: "Angebot und Termin",
          text: "Sie erhalten ein Angebot. Den Termin legen wir auf Wunsch außerhalb Ihrer Betriebszeit.",
        },
        {
          titel: "Prüfung vor Ort",
          text: "Wir besichtigen, erproben und messen Anlagen und Geräte und kennzeichnen, was geprüft ist.",
        },
        {
          titel: "Protokoll",
          text: "Sie erhalten das Prüfprotokoll mit Messwerten, Mängeln und dem nächsten Prüftermin.",
        },
        {
          titel: "Mängel beheben",
          text: "Gefährliche Mängel beheben wir nach Absprache sofort, alles andere bieten wir Ihnen an.",
        },
      ],
    },
    kosten: {
      titel: "Was die Prüfung kostet",
      absaetze: [
        `Der Aufwand richtet sich nach der Zahl der Verteiler, Stromkreise und Geräte. ${offen("Preisrahmen für die Prüfung, zum Beispiel Preis je Gerät")}`,
      ],
    },
    referenzenTitel: "Prüfungen aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zur Elektroprüfung",
    fragen: [
      {
        frage: "Wie oft ist die DGUV-V3-Prüfung nötig?",
        antwort:
          "Ortsfeste Anlagen wie Verteiler werden in der Regel spätestens alle vier Jahre geprüft. Für ortsveränderliche Geräte gelten kürzere Fristen, je nach Einsatzort zwischen sechs Monaten und zwei Jahren. Die genaue Frist legt Ihre Gefährdungsbeurteilung fest.",
      },
      {
        frage: "Was passiert, wenn bei der Prüfung Mängel auftauchen?",
        antwort:
          "Mängel stehen im Protokoll. Gefährliche Mängel beheben wir nach Absprache sofort, alles andere bieten wir Ihnen an. Viele Mängel lassen sich mit kleinen Änderungen beheben.",
      },
      {
        frage: "Ist die Prüfung Pflicht?",
        antwort:
          "Für Betriebe ja: Unternehmer müssen elektrische Anlagen und Betriebsmittel regelmäßig prüfen lassen. Für private Wohnhäuser gibt es keine feste Frist. Bei alten Anlagen und vor einem Kauf ist die Prüfung trotzdem sinnvoll.",
      },
      {
        frage: "Was bekomme ich nach der Prüfung?",
        antwort:
          "Ein Prüfprotokoll mit Messwerten, festgestellten Mängeln und dem nächsten Prüftermin. Geprüfte Geräte erhalten eine Plakette.",
      },
      {
        frage: "Muss für die Prüfung der Strom abgeschaltet werden?",
        antwort: `Für einige Messungen schalten wir einzelne Stromkreise kurz ab. Wir planen die Reihenfolge so, dass Ihr Betrieb weiterlaufen kann, auf Wunsch auch außerhalb der Betriebszeit. ${offen("übliche Dauer der Prüfung")}`,
      },
      {
        frage: "Was kostet die Prüfung?",
        antwort:
          "Das hängt von der Zahl der Verteiler, Stromkreise und Geräte ab. Nennen Sie uns den Umfang, dann erhalten Sie ein Angebot.",
      },
    ],
    verwandt: ["verteilerbau", "blitzschutz", "elektroinstallation"],
    bild: bildGeraetepruefung,
    bildAlt:
      "Geräteprüfung nach DGUV Vorschrift 3: zwei Mitarbeiter mit Prüfgerät und gelben Prüfplaketten am Tisch",
    reihenBild: bildGeraetepruefung,
    reihenBildAlt:
      "Geräteprüfung: Prüfgerät und gelbe Prüfplaketten auf einem Tisch, daneben zwei Mitarbeiter",
    reihenBildLage: "62% center",
    hausOrt: "Am Verteiler mit Messgerät",
  },

  /* ------------------------------------------------------------------ 7 */
  netzwerktechnik: {
    name: "Netzwerk & IT-Verkabelung",
    zeile: "LAN, Serverschrank, WLAN und Videotechnik",
    kurztext:
      "Strukturierte Verkabelung für Büro, Praxis und Wohnhaus. Gemessen, dokumentiert und mit Reserve für morgen.",
    zeichen: "datendose",
    seo: {
      titel: "Netzwerkverkabelung Germering | IT-Infrastruktur | Mat",
      h1: "Netzwerkverkabelung und IT-Infrastruktur in Germering",
      beschreibung:
        "Strukturierte Verkabelung, Serverschrank, WLAN und Videotechnik für Büro, Praxis und Wohnhaus. Messprotokoll inklusive.",
    },
    nutzen:
      "Wir planen und verlegen Ihre Netzwerkverkabelung in Germering und im Raum München, für Büro, Praxis und Wohnhaus. Eine strukturierte Verkabelung trägt Daten, Telefon und Video über viele Jahre.",
    ueberblick: [
      "Strukturierte Verkabelung für Daten und Telefon",
      "Serverschrank und Netzwerkverteiler",
      "WLAN und Videoverkabelung",
      "Messprotokoll für jede Strecke",
    ],
    umfang: {
      titel: "Was zur Netzwerkverkabelung gehört",
      teile: [
        {
          titel: "Strukturierte Verkabelung",
          text: "Eine strukturierte Verkabelung folgt einem einheitlichen Plan: Alle Dosen laufen sternförmig im Verteiler zusammen. Dieselben Leitungen tragen LAN und Telefonie, und neue Geräte lassen sich leicht einbinden. Das vermeidet teure Fehlinstallationen und spätere Umbauten.",
        },
        {
          titel: "Serverschrank und Verteiler",
          text: "Wir bauen Netzwerk- und Serverschränke auf, legen Patchfelder auf und beschriften jede Strecke. Im Wohnhaus genügt oft ein kompakter Multimediaverteiler.",
        },
        {
          titel: "WLAN im ganzen Gebäude",
          text: "Für stabiles WLAN setzen wir Zugangspunkte dorthin, wo sie gebraucht werden, und binden sie per Kabel an.",
        },
        {
          titel: "Video und Sicherheitstechnik",
          text: "Kameras, Türstationen und Alarmtechnik brauchen eigene Leitungen. Wir verlegen sie zusammen mit dem Netzwerk und binden sie auf Wunsch in Ihr [Smart Home](leistung:smart-home) ein.",
        },
        {
          titel: "Messen und dokumentieren",
          text: "Jede Strecke wird nach standardisierten Verfahren gemessen. Sie erhalten ein Messprotokoll und einen Plan, auf dem jede Dose zu finden ist.",
        },
        {
          titel: "Fernsehen über das Netzwerk",
          text: "Wer Fernsehen lieber klassisch empfängt, bekommt von uns auch die [SAT- und Antennentechnik](leistung:antennentechnik) dazu.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Netzwerke bauen",
      gruppen: {
        gewerbe:
          "In Büro, Praxis und Betrieb planen wir Arbeitsplätze, Besprechungsräume und Technikraum mit Reserven für mehrere Jahre.",
        privat:
          "Im Wohnhaus bringen Netzwerkdosen stabiles Internet ins Arbeitszimmer, zum Fernseher und ins Kinderzimmer. Im Neubau verlegen wir sie zusammen mit der [Elektroinstallation](leistung:elektroinstallation).",
        hausverwaltung:
          "In Wohnanlagen erneuern wir die Verkabelung vom Hausanschlussraum bis in die Wohnungen.",
      },
    },
    ablauf: {
      titel: "So entsteht Ihr Netzwerk",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie nennen uns Gebäude, Zahl der Arbeitsplätze und was das Netz können soll.",
        },
        {
          titel: "Begehung",
          text: "Wir sehen uns Räume, Leitungswege und den Platz für den Verteiler an.",
        },
        {
          titel: "Planung und Angebot",
          text: "Sie erhalten einen Plan mit allen Dosen, dem Verteiler und den Arbeiten.",
        },
        {
          titel: "Verlegung und Aufbau",
          text: "Wir verlegen die Leitungen, bauen den Schrank auf und schließen alles an.",
        },
        {
          titel: "Messung und Übergabe",
          text: "Wir messen jede Strecke und übergeben Messprotokoll und Plan.",
        },
      ],
    },
    kosten: {
      titel: "Was eine Netzwerkverkabelung kostet",
      absaetze: [
        `Die Kosten hängen von der Zahl der Anschlüsse, den Leitungswegen und der Ausstattung des Verteilers ab. ${offen("Preisrahmen für die Netzwerkverkabelung, zum Beispiel Preis je Doppeldose")}`,
      ],
    },
    referenzenTitel: "Netzwerk-Projekte aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zur Netzwerkverkabelung",
    fragen: [
      {
        frage: "Was ist eine strukturierte Verkabelung?",
        antwort:
          "Ein einheitlicher Aufbau des Netzwerks: Von einem Verteiler führen Leitungen sternförmig zu jeder Dose. Das Netz ist unabhängig von einzelnen Geräten und Anwendungen und lässt sich leicht erweitern.",
      },
      {
        frage: "Reicht WLAN nicht aus?",
        antwort:
          "WLAN ist bequem, aber störanfällig. Für feste Arbeitsplätze, Fernseher, Server und die WLAN-Zugangspunkte selbst ist das Kabel die stabile Grundlage.",
      },
      {
        frage: "Welche Leitungen verlegen Sie?",
        antwort:
          "Wir verlegen standardisierte Datenleitungen mit Reserve bei der Übertragungsleistung, damit das Netz auch künftige Geschwindigkeiten trägt. Welche Kategorie zu Ihrem Vorhaben passt, klären wir in der Planung.",
      },
      {
        frage: "Bekomme ich ein Messprotokoll?",
        antwort: "Ja. Jede Strecke wird gemessen und dokumentiert.",
      },
      {
        frage: "Kann im laufenden Betrieb verkabelt werden?",
        antwort:
          "Ja. Wir arbeiten abschnittsweise und stimmen die Umstellung mit Ihnen ab, damit Ihr Betrieb erreichbar bleibt.",
      },
      {
        frage: "Was kostet eine Netzwerkverkabelung?",
        antwort:
          "Das hängt von der Zahl der Anschlüsse und den Leitungswegen ab. Nach der Begehung erhalten Sie ein Angebot mit allen Positionen.",
      },
    ],
    verwandt: ["smart-home", "elektroinstallation", "antennentechnik"],
    bild: bildNetzwerkSwitches,
    bildAlt:
      "Netzwerkverkabelung: Netzwerkschrank mit Switches und gebündelten Patchkabeln",
    reihenBild: bildPatchfeld,
    reihenBildAlt:
      "Netzwerkschrank mit beschrifteten Patchfeldern und orangefarbenen Datenleitungen",
    hausOrt: "Arbeitszimmer oder Netzwerkschrank",
  },

  /* ------------------------------------------------------------------ 8 */
  blitzschutz: {
    name: "Blitzschutz & Erdung",
    zeile: "Fangeinrichtung, Erdung, Überspannungsschutz",
    kurztext:
      "Äußerer und innerer Blitzschutz, Erdung und Überspannungsschutz. Geplant, gebaut und geprüft.",
    zeichen: "erdung",
    seo: {
      titel: "Blitzschutz & Erdung Germering | Mat-Elektrotechnik",
      h1: "Blitzschutz und Erdungsanlagen im Raum München-West",
      beschreibung:
        "Äußerer und innerer Blitzschutz, Erdung und Überspannungsschutz: Planung, Bau und Prüfung für Wohn- und Gewerbegebäude.",
    },
    nutzen:
      "Wir planen, bauen und prüfen Blitzschutz und Erdungsanlagen im Raum München-West, für Wohnhäuser und Gewerbegebäude. So bleiben Gebäude, Technik und Menschen bei einem Einschlag geschützt.",
    ueberblick: [
      "Äußerer Blitzschutz: Fangeinrichtung, Ableitung, Erdung",
      "Innerer Blitzschutz und Überspannungsschutz",
      "Erdungsanlagen für Neubau und Bestand",
      "Prüfung bestehender Blitzschutzanlagen",
    ],
    umfang: {
      titel: "Was zu einem vollständigen Blitzschutz gehört",
      teile: [
        {
          titel: "Äußerer Blitzschutz",
          text: "Fangstangen und Fangleitungen nehmen den Blitz auf, Ableitungen führen den Strom an der Fassade nach unten, die Erdungsanlage verteilt ihn im Boden. Wir planen und montieren alle drei Teile als ein System.",
        },
        {
          titel: "Überspannungen: die unterschätzte Gefahr",
          text: "Überspannungen sind sehr kurze Spannungsimpulse. Sie entstehen bei direkten, nahen und fernen Blitzeinschlägen und bei Schalthandlungen im Netz. Über Strom-, Telefon- und Datenleitungen gelangen sie ins Haus. Überspannungsschutz im Verteiler leitet sie ab, bevor sie Geräte zerstören.",
        },
        {
          titel: "Erdungsanlagen",
          text: "Die Erdung ist die Grundlage jeder Elektroinstallation. Im Neubau planen wir den Fundamenterder mit ein, im Bestand ergänzen wir die Erdungsanlage.",
        },
        {
          titel: "Prüfung und Wartung",
          text: "Blitzschutzanlagen müssen regelmäßig geprüft werden. Wir messen, dokumentieren und setzen instand. Die übrige Anlage prüfen wir bei der [Anlagenprüfung](leistung:pruefung) gleich mit.",
        },
        {
          titel: "Schutz für Photovoltaik und Antennen",
          text: "Aufbauten auf dem Dach verändern den Blitzschutz. Wir binden [Photovoltaikanlagen](leistung:photovoltaik) und [SAT-Anlagen](leistung:antennentechnik) fachgerecht ein.",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Blitzschutz bauen",
      gruppen: {
        privat:
          "Für Einfamilienhäuser ist vor allem der Überspannungsschutz wichtig. Ob ein äußerer Blitzschutz sinnvoll ist, hängt von Lage und Bauart ab.",
        gewerbe:
          "Bei Gewerbe- und Produktionsgebäuden verlangen Bauordnung oder Versicherer oft eine Blitzschutzanlage mit regelmäßigem Prüfnachweis.",
        hausverwaltung:
          "In Wohnanlagen prüfen und warten wir bestehende Blitzschutzanlagen und liefern das Protokoll für Ihre Unterlagen.",
      },
    },
    ablauf: {
      titel: "So läuft Ihr Blitzschutz-Projekt ab",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie nennen uns Gebäudeart und Dachform. Fotos von Dach und Fassade helfen.",
        },
        {
          titel: "Begehung",
          text: "Wir sehen uns Dach, Fassade und die vorhandene Erdung an.",
        },
        {
          titel: "Planung und Angebot",
          text: "Sie erhalten ein Schutzkonzept mit allen Arbeiten.",
        },
        {
          titel: "Montage",
          text: "Wir montieren Fangeinrichtung, Ableitungen, Erdung und Überspannungsschutz.",
        },
        {
          titel: "Messung",
          text: "Wir messen die Anlage und übergeben das Prüfprotokoll.",
        },
      ],
    },
    kosten: {
      titel: "Was eine Blitzschutzanlage kostet",
      absaetze: [
        `Die Kosten hängen von Gebäudegröße, Dachform, Schutzklasse und dem Zustand der vorhandenen Erdung ab. ${offen("Preisrahmen für Blitzschutz und Erdung")}`,
      ],
    },
    referenzenTitel: "Blitzschutz-Projekte aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zum Blitzschutz",
    fragen: [
      {
        frage: "Ist Blitzschutz Pflicht?",
        antwort:
          "Für die meisten Wohnhäuser nicht. Die Bayerische Bauordnung verlangt Blitzschutz für Gebäude, bei denen ein Einschlag leicht eintreten oder schwere Folgen haben kann. Auch Versicherer können ihn fordern.",
      },
      {
        frage: "Wie oft muss eine Blitzschutzanlage geprüft werden?",
        antwort:
          "Je nach Schutzklasse sieht die Norm umfassende Prüfungen alle zwei bis vier Jahre vor, dazwischen Sichtprüfungen. Nach einem Einschlag oder einem Umbau am Dach sollte sofort geprüft werden.",
      },
      {
        frage: "Was ist der Unterschied zwischen äußerem und innerem Blitzschutz?",
        antwort:
          "Der äußere Blitzschutz fängt den Blitz und leitet ihn in die Erde. Der innere Blitzschutz verhindert, dass dabei gefährliche Spannungen im Gebäude entstehen.",
      },
      {
        frage: "Brauche ich Überspannungsschutz, wenn ich keinen Blitzableiter habe?",
        antwort:
          "Ja. Überspannungen entstehen auch durch entfernte Einschläge und Schaltvorgänge im Netz. In neuen und wesentlich geänderten Anlagen ist Überspannungsschutz vorgeschrieben.",
      },
      {
        frage: "Muss meine Photovoltaikanlage in den Blitzschutz eingebunden werden?",
        antwort:
          "Hat das Gebäude eine Blitzschutzanlage, muss die PV-Anlage in das Schutzkonzept einbezogen werden. Wir prüfen Abstände und Anschlüsse.",
      },
      {
        frage: "Was kostet eine Blitzschutzanlage?",
        antwort:
          "Das hängt von Gebäude, Dachform und Schutzklasse ab. Nach der Begehung erhalten Sie ein Angebot mit allen Positionen.",
      },
    ],
    verwandt: ["photovoltaik", "pruefung", "antennentechnik"],
    bild: bildBlitzschutzDach,
    bildAlt:
      "Blitzschutz: Fangstangen neben den Lichtkuppeln auf dem verschneiten Flachdach eines Wohnhauses",
    reihenBild: bildFangstangen,
    reihenBildAlt:
      "Blitzschutz: Fangstangen auf einem verschneiten Flachdach, im Hintergrund ein Monteur",
    hausOrt: "Fangstange und Ableitung an der Außenwand",
  },

  /* ------------------------------------------------------------------ 9 */
  antennentechnik: {
    name: "SAT- & Antennentechnik",
    zeile: "SAT-Anlagen, Antennen, Verteilung im Haus",
    kurztext:
      "Satellitenanlage, Kabel- und Antennenverteilung für Ein- und Mehrfamilienhäuser. Von der Beratung bis zur Inbetriebnahme.",
    zeichen: "antenne",
    seo: {
      titel: "SAT-Anlagen & Antennentechnik Germering | Mat",
      h1: "SAT-Anlagen und Antennentechnik in Germering",
      beschreibung:
        "Satellitenanlage, Kabel- und Antennenverteilung für Ein- und Mehrfamilienhäuser: Planung, Montage und Störungsbehebung.",
    },
    nutzen:
      "Wir planen und montieren SAT-Anlagen und Antennentechnik in Germering und im Raum München, für Ein- und Mehrfamilienhäuser. Sie bekommen die komplette Anlage, von der Beratung zum Montageplatz bis zur Inbetriebnahme.",
    ueberblick: [
      "SAT-Anlage planen, liefern und montieren",
      "Verteilung des Signals in alle Räume",
      "Gemeinschaftsanlagen für Mehrfamilienhäuser",
      "Störungen finden und beheben",
    ],
    umfang: {
      titel: "Was zur SAT- und Antennentechnik gehört",
      teile: [
        {
          titel: "Satellitenanlagen",
          text: "Wir beraten Sie zum besten Montageplatz, richten die Schüssel millimetergenau aus und liefern auf Wunsch die komplette Anlage. Ein sauber ausgerichteter Spiegel ist die Grundlage für scharfes Bild und guten Ton.",
        },
        {
          titel: "Verteilung im Haus",
          text: "Vom Dach führt das Signal über Multischalter oder Einkabelsystem in jeden Raum. Bestehende Leitungen nutzen wir weiter, wo ihre Qualität reicht.",
        },
        {
          titel: "Gemeinschaftsanlagen",
          text: "Für Mehrfamilienhäuser planen wir Anlagen, die alle Wohnungen versorgen, und stellen ältere Kabel- und Antennenanlagen um.",
        },
        {
          titel: "Antenne und Kabelanschluss",
          text: "Auch Antennenempfang und Kabelfernsehen verteilen wir im Haus und messen die Signalqualität an den Dosen. Wer lieber streamt, bekommt von uns die passende [Netzwerkverkabelung](leistung:netzwerktechnik).",
        },
        {
          titel: "Störungen beheben",
          text: "Bild friert ein, Sender fehlen? Wir messen die Anlage durch, finden die Ursache und tauschen defekte Bauteile.",
        },
        {
          titel: "Erdung und Blitzschutz",
          text: "Antennen auf dem Dach müssen geerdet werden. Wir binden die Anlage in Potentialausgleich und [Blitzschutz](leistung:blitzschutz) ein. Fehlen Steckdosen am Fernsehplatz, ergänzen wir die [Elektroinstallation](leistung:elektroinstallation).",
        },
      ],
    },
    fuerWen: {
      titel: "Für wen wir Empfangsanlagen bauen",
      gruppen: {
        privat:
          "Im Einfamilienhaus versorgt eine Schüssel alle Räume. Wir helfen auch bei der Auswahl der Geräte.",
        hausverwaltung:
          "Für Mehrfamilienhäuser planen wir Gemeinschaftsanlagen und begleiten die Umstellung bestehender Kabel- und Antennenanlagen.",
        gewerbe:
          "Hotels, Gaststätten und Büros erhalten eine Verteilung, die viele Empfangsgeräte zuverlässig versorgt.",
      },
    },
    ablauf: {
      titel: "So kommen Sie zu Ihrer SAT-Anlage",
      schritte: [
        {
          titel: "Anfrage",
          text: "Sie schreiben uns, wie viele Räume und Geräte versorgt werden sollen.",
        },
        {
          titel: "Beratung vor Ort",
          text: "Wir suchen den besten Montageplatz und prüfen die vorhandenen Leitungen.",
        },
        { titel: "Angebot", text: "Sie erhalten ein Angebot für die komplette Anlage." },
        {
          titel: "Montage",
          text: "Wir montieren die Schüssel, richten sie aus und verteilen das Signal im Haus.",
        },
        {
          titel: "Inbetriebnahme",
          text: "Wir messen das Signal und richten auf Wunsch Ihre Geräte ein.",
        },
      ],
    },
    kosten: {
      titel: "Was eine SAT-Anlage kostet",
      absaetze: [
        `Die Kosten hängen von der Zahl der Anschlüsse, vom Montageort und davon ab, ob vorhandene Leitungen weiter genutzt werden können. ${offen("Preisrahmen für SAT-Anlagen")}`,
      ],
    },
    referenzenTitel: "Empfangsanlagen aus unserer Arbeit",
    fragenTitel: "Häufige Fragen zu SAT-Anlage und Antenne",
    fragen: [
      {
        frage: "Was kostet eine SAT-Anlage?",
        antwort:
          "Das hängt von der Zahl der Anschlüsse, vom Montageort und von den vorhandenen Leitungen ab. Nach dem Termin vor Ort erhalten Sie ein Angebot.",
      },
      {
        frage: "Brauche ich eine Genehmigung für die Satellitenschüssel?",
        antwort:
          "Am eigenen Haus in der Regel nicht. Mieter und Wohnungseigentümer sollten die Montage vorab mit Vermieter oder Eigentümergemeinschaft abstimmen.",
      },
      {
        frage: "Kann ich die vorhandenen Kabel weiter nutzen?",
        antwort:
          "Oft ja. Wir messen die Leitungen durch und tauschen nur, was die Signalqualität nicht mehr schafft.",
      },
      {
        frage: "Wie viele Fernseher kann ich anschließen?",
        antwort:
          "Die Anlage wird auf die Zahl Ihrer Räume und Geräte ausgelegt. Multischalter oder Einkabelsystem verteilen das Signal im Haus.",
      },
      {
        frage: "Muss eine Antenne geerdet werden?",
        antwort:
          "Ja. Antennen auf dem Dach müssen geerdet und in den Potentialausgleich einbezogen werden. Das gehört bei uns zur Montage.",
      },
      {
        frage: "Was tun, wenn das Bild gestört ist?",
        antwort:
          "Rufen Sie uns an. Häufige Ursachen sind eine verstellte Schüssel, ein defekter Empfangskopf oder beschädigte Stecker. Wir messen die Anlage und beheben die Störung.",
      },
    ],
    verwandt: ["netzwerktechnik", "blitzschutz", "elektroinstallation"],
    bild: bildSat,
    bildAlt: "SAT-Anlage: Satellitenschüssel mit Empfangskopf auf einem Ziegeldach",
    reihenBild: bildSat,
    reihenBildAlt: "SAT-Anlage: Satellitenschüssel mit Empfangskopf auf einem Ziegeldach",
    reihenBildLage: "38% center",
    hausOrt: "SAT-Schüssel am Dach",
  },
};

export const leistungen: Leistung[] = leistungsReihenfolge.map((id) => ({
  id,
  slug: leistungsAdressen[id],
  pfad: leistungsPfad(id),
  ...daten[id],
}));

export const leistungNachId = (id: LeistungId): Leistung =>
  leistungen.find((l) => l.id === id)!;

export const leistungNachSlug = (slug: string): Leistung | undefined =>
  leistungen.find((l) => l.slug === slug);

/** Hinweis für alle Abläufe: Die Dauer je Schritt ist nicht bestätigt. */
export const ablaufDauerHinweis = ablaufDauer;

/** Ein Satz zum Einzugsgebiet für jede Leistungsseite (Informationsarchitektur.md, Abschnitt 12). */
export const einzugsgebietSatz =
  "Wir arbeiten in Germering und im Umkreis, etwa in Puchheim, Gilching, Eichenau, Gröbenzell, Olching und Fürstenfeldbruck, im Würmtal und im Münchner Westen.";
