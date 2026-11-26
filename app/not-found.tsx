import type { Metadata } from "next";
import Link from "next/link";

import { Seite } from "@/bausteine/Geruest";
import { KnopfLink } from "@/bausteine/Knopf";

export const metadata: Metadata = {
  title: { absolute: "Seite nicht gefunden | Mat-Elektrotechnik" },
  description: "Diese Seite gibt es nicht oder nicht mehr.",
  robots: { index: false, follow: true },
};

/**
 * Seite nicht gefunden (Design.md, 8.8): großes Schaltzeichen "Stromkreis unterbrochen",
 * die Leitung endet offen und funkt. Der Knopf "Zurück zur Startseite" schließt den Kreis.
 */
export default function NichtGefunden() {
  return (
    <Seite>
      <section className="abschnitt">
        <div className="rahmen mitte stromkreis">
          <svg className="unterbrochen" viewBox="0 0 420 180" aria-hidden="true">
            {/* Stromkreis mit offenem Schalter */}
            <path className="unterbrochen__leitung" d="M20 120V40a16 16 0 0 1 16-16h348a16 16 0 0 1 16 16v80" />
            <path className="unterbrochen__leitung" d="M20 120h140" />
            <path className="unterbrochen__leitung" d="M260 120h140" />
            <circle cx="160" cy="120" r="7" />
            <circle cx="260" cy="120" r="7" />
            <path className="unterbrochen__hebel" d="M166 116L246 74" />
            {/* Funken am offenen Ende */}
            <path className="unterbrochen__funke" d="M256 96l10-14" />
            <path className="unterbrochen__funke" d="M270 104l16-6" />
            <path className="unterbrochen__funke" d="M244 92l-2-16" />
            {/* Leuchte im Kreis, sie bleibt dunkel */}
            <circle cx="210" cy="24" r="16" fill="var(--weiss)" />
            <path d="M199 13l22 22M221 13l-22 22" />
          </svg>
          <h1>Hier ist der Stromkreis unterbrochen</h1>
          <p className="vorspann">
            Diese Seite gibt es nicht oder nicht mehr. Über die Startseite kommen Sie zu allen Leistungen.
          </p>
          <div className="reihe-knoepfe">
            <KnopfLink href="/">Zurück zur Startseite</KnopfLink>
            <Link className="textlink" href="/leistungen">
              Alle Leistungen im Überblick
            </Link>
          </div>
        </div>
      </section>
    </Seite>
  );
}
