import type { Metadata } from "next";
import Link from "next/link";

import { Anfrage } from "@/bausteine/Abschnitte";
import { Abschnitt, Seite, Seitenkopf } from "@/bausteine/Geruest";
import { Leistungskarte } from "@/bausteine/Karten";
import { KnopfLink } from "@/bausteine/Knopf";
import { leistungen } from "@/daten/leistungen";
import { seitenMeta } from "@/lib/seo";

export const metadata: Metadata = seitenMeta({
  titel: "Leistungen | Elektriker Germering | Mat-Elektrotechnik",
  beschreibung:
    "Neun Leistungen aus einer Hand: Elektroinstallation, Wallbox, Photovoltaik, Smart Home, Zählerschrank, Prüfung, Netzwerk, Blitzschutz und SAT-Anlagen.",
  pfad: "/leistungen",
});

/** Leistungsübersicht. Abschnitte: Informationsarchitektur.md, 7.2. */
export default function Leistungsuebersicht() {
  return (
    <Seite>
      {/* 1. Überschrift und zwei Sätze Einleitung */}
      <Seitenkopf
        krumen={[{ name: "Leistungen", pfad: "/leistungen" }]}
        titel="Elektro-Leistungen in Germering und im Raum München"
        vorspann="Wir planen, installieren und prüfen elektrische Anlagen für Privatkunden, Gewerbe und Hausverwaltungen. Hier finden Sie alle neun Leistungen auf einen Blick."
      >
        <div className="reihe-knoepfe">
          <KnopfLink href="#anfrage">Anfrage stellen</KnopfLink>
        </div>
      </Seitenkopf>

      {/* 2. Neun gleich große Karten */}
      <Abschnitt art="nebel" eng titel="Neun Leistungen, ein Ansprechpartner">
        <div className="kartenraster" data-reihe>
          {leistungen.map((l, i) => (
            <Leistungskarte leistung={l} key={l.id} i={i} />
          ))}
        </div>
      </Abschnitt>

      {/* 3. Hinweis auf das 3D-Haus */}
      <Abschnitt
        art="dunkel"
        eng
        titel="Sehen Sie, wo im Haus welche Leistung steckt"
        vorspann="Vom Dach bis zum Keller: Im Haus zeigen wir, an welcher Stelle wir für Sie arbeiten."
      >
        <KnopfLink href="/haus" art="zweit">
          Leistungen im 3D-Haus entdecken
        </KnopfLink>
      </Abschnitt>

      {/* 4. Nicht sicher, was Sie brauchen? */}
      <Anfrage
        titel="Nicht sicher, was Sie brauchen?"
        text={
          <>
            Beschreiben Sie uns einfach Ihr Vorhaben. Wir sagen Ihnen, welche Leistung dazu passt.
            Projekte aus unserer Arbeit finden Sie bei den <Link href="/referenzen">Referenzen</Link>.
          </>
        }
      />
    </Seite>
  );
}
