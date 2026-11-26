import type { Metadata } from "next";

import { Anfrage, Fragen, Gebiet } from "@/bausteine/Abschnitte";
import { Offen } from "@/bausteine/Fliesstext";
import { Abschnitt, JsonLd, Seite, Seitenkopf } from "@/bausteine/Geruest";
import { KnopfLink } from "@/bausteine/Knopf";
import { adresszeile, firma, offen } from "@/daten/firma";
import { fragenLd, seitenMeta } from "@/lib/seo";

/*
 * Titel, Hauptüberschrift und Meta-Beschreibung: SEO-Optimierung.md, Kapitel 8.
 * Die Uhrzeiten erscheinen in der Beschreibung erst, wenn sie in daten/firma.ts bestätigt sind.
 */
export const metadata: Metadata = seitenMeta({
  titel: "Kontakt & Anfahrt | Mat-Elektrotechnik Germering",
  beschreibung: firma.erreichbarkeit.bestaetigt
    ? `${adresszeile}. Telefon ${firma.telefon.anzeige}. Mo–Fr 7–16 Uhr. Schreiben Sie uns oder rufen Sie an.`
    : `${adresszeile}. Telefon ${firma.telefon.anzeige}. Montag bis Freitag erreichbar. Schreiben Sie uns oder rufen Sie an.`,
  pfad: "/kontakt",
});

const fragen = [
  {
    frage: "Wie schnell melden Sie sich?",
    antwort: `Wir melden uns bei Ihnen, sobald wir Ihre Anfrage gelesen haben. ${offen("übliche Rückmeldezeit")} Wenn es eilt, rufen Sie uns an: ${firma.telefon.anzeige}.`,
  },
  {
    frage: "Was sollte in der Anfrage stehen?",
    antwort:
      "Worum es geht, wo das Objekt liegt und wie wir Sie erreichen. Fotos helfen bei der ersten Einschätzung, zum Beispiel vom Zählerschrank.",
  },
  {
    frage: "Kostet die Beratung etwas?",
    antwort: "Nein. Die Beratung ist kostenlos.",
  },
];

/** Kontakt. Abschnitte: Informationsarchitektur.md, 7.7. */
export default function Kontakt() {
  return (
    <Seite>
      {/* 1. Überschrift, ein Satz zur Rückmeldezeit */}
      <Seitenkopf
        krumen={[{ name: "Kontakt", pfad: "/kontakt" }]}
        titel="Kontakt"
        vorspann={
          <>
            Schreiben Sie uns oder rufen Sie an. Wir sind telefonisch von Montag bis Freitag für Sie da.{" "}
            <Offen>übliche Rückmeldezeit</Offen>
          </>
        }
      />

      {/* 2. Links das Anfrageformular, rechts Telefon, E-Mail, Adresse, Erreichbarkeit */}
      <Anfrage titel="Ihre Anfrage an Mat-Elektrotechnik" />

      {/* 3. Karte und Anfahrt */}
      <Abschnitt
        art="nebel"
        titel="So finden Sie uns in Germering"
        vorspann={
          <>
            {firma.name}, {adresszeile}. Wir freuen uns auf Ihren Besuch.
          </>
        }
      >
        <p className="reihe-knoepfe" style={{ marginBottom: "var(--a-7)" }}>
          <KnopfLink href={firma.routenplaner} art="zweit" extern>
            Route in Google Maps planen
          </KnopfLink>
        </p>
        <Gebiet />
        <p className="klein" style={{ marginTop: "var(--a-6)" }}>
          <Offen>Anfahrtsbeschreibung und Parkmöglichkeiten</Offen>
        </p>
      </Abschnitt>

      {/* 4. Drei häufige Fragen zur Anfrage */}
      <Abschnitt titel="Drei Fragen zur Anfrage">
        <Fragen fragen={fragen} />
        <JsonLd daten={fragenLd(fragen)} />
      </Abschnitt>
    </Seite>
  );
}
