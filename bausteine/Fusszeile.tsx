import Link from "next/link";
import { adresszeile, erreichbarkeitText, firma } from "@/daten/firma";
import { leistungen } from "@/daten/leistungen";
import { teile } from "./Fliesstext";
import { Lichtschalter } from "./Lichtschalter";
import { Sterne, Zeichen } from "./Zeichen";

/**
 * Fußzeile (Design.md, 9.15; Informationsarchitektur.md, 5.4).
 * Anthrazit, vier Spalten, Firmenname groß als Abschluss, Lichtschalter rechts unten.
 * Das Logo steht hier nicht, weil keine offizielle Negativ-Version vorliegt.
 */
export function Fusszeile() {
  return (
    <footer className="fuss dunkel" id="fuss">
      <div className="rahmen">
        <div className="fuss__spalten">
          <div>
            <h2>Kontakt</h2>
            <p className="fuss__firma">{firma.name}</p>
            <address>
              <ul className="fuss__liste">
                <li>
                  <a href={firma.routenplaner} rel="noopener" target="_blank">
                    <Zeichen name="ort" />
                    {adresszeile}
                  </a>
                </li>
                <li>
                  <a href={firma.telefon.href}>
                    <Zeichen name="telefon" />
                    {firma.telefon.anzeige}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${firma.email}`}>
                    <Zeichen name="brief" />
                    {firma.email}
                  </a>
                </li>
                <li>
                  <span>
                    <Zeichen name="uhr" />
                    <span>{teile(erreichbarkeitText)}</span>
                  </span>
                </li>
              </ul>
            </address>
            <a className="fuss__bewertung" href={firma.google.profil} rel="noopener" target="_blank">
              <Sterne
                wert={firma.google.note}
                text={`${firma.google.noteAnzeige} von 5 Sternen bei Google`}
              />
              <span>
                {firma.google.noteAnzeige} bei Google, {firma.google.anzahl} Bewertungen
              </span>
            </a>
          </div>

          <nav aria-label="Leistungen">
            <h2>Leistungen</h2>
            <ul className="fuss__liste">
              {leistungen.map((l) => (
                <li key={l.id}>
                  <Link href={l.pfad}>{l.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Unternehmen">
            <h2>Unternehmen</h2>
            <ul className="fuss__liste">
              <li>
                <Link href="/unternehmen">Über uns</Link>
              </li>
              <li>
                <Link href="/referenzen">Referenzen</Link>
              </li>
              <li>
                <Link href="/karriere">Karriere</Link>
              </li>
              <li>
                <Link href="/kontakt">Kontakt</Link>
              </li>
              <li>
                <Link href="/haus">3D-Haus</Link>
              </li>
              <li>
                <a href={firma.facebook} rel="noopener" target="_blank">
                  Facebook
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Rechtliches">
            <h2>Rechtliches</h2>
            <ul className="fuss__liste">
              <li>
                <Link href="/impressum">Impressum</Link>
              </li>
              <li>
                <Link href="/datenschutz">Datenschutz</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="fuss__gebiet">
          <p>{firma.einzugsgebietZeile}</p>
          <Lichtschalter />
        </div>

        <div className="fuss__name-rahmen">
          <p className="fuss__name" aria-hidden="true">
            {firma.kurzname}
          </p>
        </div>
      </div>
    </footer>
  );
}
