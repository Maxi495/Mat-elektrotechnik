import type { Metadata } from "next";

import { Offen } from "@/bausteine/Fliesstext";
import { Seite, Seitenkopf } from "@/bausteine/Geruest";
import { firma } from "@/daten/firma";
import { seitenMeta } from "@/lib/seo";

export const metadata: Metadata = seitenMeta({
  titel: "Impressum | Mat-Elektrotechnik GmbH Germering",
  beschreibung:
    "Impressum der Mat-Elektrotechnik GmbH, Industriestraße 12, 82110 Germering: Anbieter, Vertretung, Registereintrag und Kontakt.",
  pfad: "/impressum",
});

/** Impressum. Angaben aus Kontext.md, Abschnitt 4.18. Fehlende Pflichtangaben stehen als Platzhalter da. */
export default function Impressum() {
  return (
    <Seite>
      <Seitenkopf krumen={[{ name: "Impressum", pfad: "/impressum" }]} titel="Impressum" />

      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben">
        <div className="rahmen">
          <div className="rechtstext">
            <p>
              <Offen>Impressum vor dem Start rechtlich prüfen lassen</Offen>
            </p>

            <h2>Anbieter</h2>
            <address>
              {firma.name}
              <br />
              {firma.adresse.strasse}
              <br />
              {firma.adresse.plz} {firma.adresse.ort}
            </address>

            <h2>Vertreten durch</h2>
            <p>
              Geschäftsführer: {firma.geschaeftsfuehrer} ({firma.geschaeftsfuehrerTitel})
            </p>

            <h2>Kontakt</h2>
            <p>
              Telefon: <a href={firma.telefon.href}>{firma.telefon.international}</a>
              <br />
              E-Mail: <a href={`mailto:${firma.email}`}>{firma.email}</a>
            </p>

            <h2>Registereintrag</h2>
            <p>
              Handelsregister: {firma.handelsregister}
              <br />
              Registergericht: {firma.registergericht}
            </p>

            <h2>Umsatzsteuer</h2>
            <p>Umsatzsteuer-Identifikationsnummer nach § 27 a Umsatzsteuergesetz: {firma.ustId}</p>

            <h2>Unternehmensgegenstand</h2>
            <p>{firma.unternehmensgegenstand}</p>

            <h2>Berufsrechtliche Angaben</h2>
            <p>
              <Offen>Berufsbezeichnung, zuständige Handwerkskammer und Aufsichtsbehörde</Offen>
            </p>

            <h2>Inhaltlich verantwortlich</h2>
            <p>
              <Offen>Name und Anschrift der inhaltlich verantwortlichen Person</Offen>
            </p>

            <h2>Verbraucherstreitbeilegung</h2>
            <p>
              <Offen>Angabe zur Teilnahme an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle</Offen>
            </p>

            <h2>Bildnachweise</h2>
            <p>
              <Offen>Bildnachweise für Fotos und Firmenvideo</Offen>
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Wir erstellen die Inhalte dieser Seiten mit größter Sorgfalt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>

            <h2>Haftung für Links</h2>
            <p>
              Unsere Seite enthält Links zu Seiten anderer Anbieter, auf deren Inhalte wir keinen Einfluss
              haben. Für diese Inhalte ist der jeweilige Anbieter verantwortlich. Erfahren wir von
              Rechtsverstößen, entfernen wir den betreffenden Link umgehend.
            </p>

            <h2>Urheberrecht</h2>
            <p>
              Die Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
              Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts
              brauchen unsere schriftliche Zustimmung.
            </p>
          </div>
        </div>
      </section>
    </Seite>
  );
}
