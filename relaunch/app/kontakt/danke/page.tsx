import type { Metadata } from "next";
import Link from "next/link";

import { Verbindung } from "@/bausteine/Abschnitte";
import { Offen } from "@/bausteine/Fliesstext";
import { Seite } from "@/bausteine/Geruest";
import { KnopfLink } from "@/bausteine/Knopf";
import { firma } from "@/daten/firma";
import { seitenMeta } from "@/lib/seo";

/* Nicht im Menü, nicht in Google (Informationsarchitektur.md, Abschnitt 3). */
export const metadata: Metadata = seitenMeta({
  titel: "Danke für Ihre Nachricht | Mat-Elektrotechnik",
  beschreibung: "Ihre Nachricht ist bei Mat-Elektrotechnik angekommen. Wir melden uns bei Ihnen.",
  pfad: "/kontakt/danke",
  index: false,
});

/** Danke-Seite: Bestätigung, nächste Schritte, Telefon für Eiliges, Links (Informationsarchitektur.md, 7.8). */
export default function Danke() {
  return (
    <Seite>
      <section className="abschnitt">
        <div className="rahmen mitte">
          <Verbindung verbunden />
          <h1>Ihre Nachricht ist angekommen</h1>
          <p className="vorspann">Danke. So geht es jetzt weiter:</p>
          <ol className="naechste-schritte">
            <li>
              <span>Wir lesen Ihre Nachricht und sehen uns mitgeschickte Fotos an.</span>
            </li>
            <li>
              <span>
                Wir melden uns bei Ihnen per Telefon oder E-Mail. <Offen>übliche Rückmeldezeit</Offen>
              </span>
            </li>
            <li>
              <span>Wir vereinbaren einen Termin für die Beratung.</span>
            </li>
          </ol>
          <p>
            Es eilt? Rufen Sie uns an:{" "}
            <a className="textlink" href={firma.telefon.href}>
              {firma.telefon.anzeige}
            </a>
          </p>
          <div className="reihe-knoepfe">
            <KnopfLink href="/referenzen" art="zweit">
              Referenzen ansehen
            </KnopfLink>
            <Link className="textlink" href="/unternehmen">
              Team und Geschichte kennenlernen
            </Link>
          </div>
        </div>
      </section>
    </Seite>
  );
}
