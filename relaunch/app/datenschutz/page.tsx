import type { Metadata } from "next";

import { Offen } from "@/bausteine/Fliesstext";
import { Seite, Seitenkopf } from "@/bausteine/Geruest";
import { adresszeile, firma } from "@/daten/firma";
import { seitenMeta } from "@/lib/seo";

export const metadata: Metadata = seitenMeta({
  titel: "Datenschutz | Mat-Elektrotechnik GmbH Germering",
  beschreibung:
    "Datenschutzerklärung der Mat-Elektrotechnik GmbH: welche Daten diese Webseite verarbeitet, zu welchem Zweck und welche Rechte Sie haben.",
  pfad: "/datenschutz",
});

/**
 * Datenschutzerklärung als Entwurf für die neue Seite.
 * Sie beschreibt, was diese Seite technisch tatsächlich tut. Die Erklärung der alten Seite wurde nicht
 * übernommen, weil sie Dienste nennt, die es hier nicht gibt (Kontext.md, 4.19 und 6).
 * Vor dem Start rechtlich prüfen lassen.
 */
export default function Datenschutz() {
  return (
    <Seite>
      <Seitenkopf krumen={[{ name: "Datenschutz", pfad: "/datenschutz" }]} titel="Datenschutzerklärung" />

      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben">
        <div className="rahmen">
          <div className="rechtstext">
            <p>
              <Offen>Entwurf. Datenschutzerklärung vor dem Start rechtlich prüfen lassen und Datum ergänzen</Offen>
            </p>

            <h2>Verantwortlich</h2>
            <p>
              {firma.name}, {adresszeile}
              <br />
              Telefon: <a href={firma.telefon.href}>{firma.telefon.international}</a>
              <br />
              E-Mail: <a href={`mailto:${firma.email}`}>{firma.email}</a>
            </p>
            <p>Ansprechpartner für den Datenschutz: {firma.geschaeftsfuehrer}</p>

            <h2>Aufruf dieser Webseite</h2>
            <p>
              Wenn Sie diese Webseite aufrufen, verarbeitet der Server technisch notwendige Daten: Ihre
              IP-Adresse, Datum und Uhrzeit, die aufgerufene Adresse, die zuvor besuchte Seite und Angaben
              zu Browser und Betriebssystem. Das ist nötig, um Ihnen die Seite auszuliefern und ihren
              sicheren Betrieb zu gewährleisten (Art. 6 Abs. 1 Buchstabe f DSGVO).
            </p>
            <p>
              Die Webseite wird bei Vercel Inc. betrieben. <Offen>Auftragsverarbeitung mit Vercel, Serverstandort und Speicherdauer der Protokolle</Offen>
            </p>

            <h2>Anfrage- und Bewerbungsformular</h2>
            <p>
              Wenn Sie uns über ein Formular schreiben, verarbeiten wir die Angaben, die Sie eintragen:
              Ihr Anliegen, Ihren Namen, Telefonnummer oder E-Mail-Adresse, auf Wunsch Postleitzahl oder Ort
              und eine hochgeladene Datei. Wir nutzen diese Angaben nur, um Ihre Anfrage oder Bewerbung zu
              bearbeiten. Grundlage ist Ihre Einwilligung (Art. 6 Abs. 1 Buchstabe a DSGVO), bei
              Anfragen zu einem Auftrag auch Art. 6 Abs. 1 Buchstabe b DSGVO, bei Bewerbungen
              § 26 BDSG.
            </p>
            <p>
              Das Formular schickt Ihre Angaben als E-Mail an uns. Sie werden auf dieser Webseite nicht
              gespeichert. <Offen>E-Mail-Dienstleister und Speicherdauer von Anfragen und Bewerbungen</Offen>
            </p>
            <p>
              Ihre Einwilligung können Sie jederzeit widerrufen, zum Beispiel per E-Mail an{" "}
              <a href={`mailto:${firma.email}`}>{firma.email}</a>.
            </p>

            <h2>Telefon und E-Mail</h2>
            <p>
              Wenn Sie uns anrufen oder eine E-Mail schreiben, verarbeiten wir Ihre Angaben, um Ihr
              Anliegen zu beantworten.
            </p>

            <h2>Cookies und Speicher im Browser</h2>
            <p>
              Diese Webseite setzt keine Cookies zur Reichweitenmessung oder Werbung. Im Speicher Ihres
              Browsers merken wir uns zwei Dinge, die nur auf Ihrem Gerät bleiben: ob Sie den Lichtschalter
              in der Fußzeile auf „Licht aus“ gestellt haben und ob die Eingangsbewegung der Startseite
              in diesem Besuch schon gelaufen ist. Beides dient allein der Darstellung.
            </p>

            <h2>Schriften, Karten und andere Dienste</h2>
            <p>
              Die Schriften dieser Webseite liegen auf dem eigenen Server. Es werden keine Schriften von
              Google oder anderen Anbietern nachgeladen. Karten und Videos anderer Anbieter sind nicht
              eingebettet.
            </p>
            <p>
              Links zu Google Maps, zum Google-Profil und zu Facebook öffnen die Seiten dieser Anbieter.
              Erst wenn Sie einen solchen Link anklicken, verarbeitet der jeweilige Anbieter Daten.
            </p>
            <p>
              <Offen>Falls Reichweitenmessung gewünscht ist: Dienst, Einwilligung und Text ergänzen</Offen>
            </p>

            <h2>Ihre Rechte</h2>
            <p>Sie haben das Recht,</p>
            <ul>
              <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten,</li>
              <li>unrichtige Daten berichtigen zu lassen,</li>
              <li>Ihre Daten löschen oder die Verarbeitung einschränken zu lassen,</li>
              <li>der Verarbeitung zu widersprechen,</li>
              <li>Ihre Daten in einem gängigen Format zu erhalten,</li>
              <li>eine erteilte Einwilligung jederzeit zu widerrufen.</li>
            </ul>
            <p>
              Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel
              beim Bayerischen Landesamt für Datenschutzaufsicht.
            </p>
          </div>
        </div>
      </section>
    </Seite>
  );
}
