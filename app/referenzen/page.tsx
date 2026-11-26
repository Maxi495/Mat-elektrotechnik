import type { Metadata } from "next";

import { Anfrage, Bewertungsreihe, Gesamtnote } from "@/bausteine/Abschnitte";
import { Offen } from "@/bausteine/Fliesstext";
import { Abschnitt, Seite, Seitenkopf } from "@/bausteine/Geruest";
import { Referenzkarte } from "@/bausteine/Karten";
import { Referenzfilter } from "@/bausteine/Referenzfilter";
import { bewertungenImLaufband } from "@/daten/bewertungen";
import { firma } from "@/daten/firma";
import { gruppenNamen, leistungen, type Gruppe } from "@/daten/leistungen";
import { referenzen } from "@/daten/referenzen";
import { seitenMeta } from "@/lib/seo";

/* Titel, Hauptüberschrift und Meta-Beschreibung: SEO-Optimierung.md, Kapitel 8. */
export const metadata: Metadata = seitenMeta({
  titel: "Referenzen | Elektroprojekte in Germering & München",
  beschreibung:
    "Ausgewählte Projekte: Photovoltaik, Blitzschutz, Netzwerk und Elektroinstallation für Privat- und Gewerbekunden.",
  pfad: "/referenzen",
});

/** Referenzen. Abschnitte: Informationsarchitektur.md, 7.4. */
export default function Referenzen() {
  return (
    <Seite>
      {/* 1. Überschrift, Einleitung, Google-Gesamtnote */}
      <Seitenkopf
        krumen={[{ name: "Referenzen", pfad: "/referenzen" }]}
        titel="Unsere Projekte"
        vorspann={`Zufriedene Kunden sind die beste Werbung. Seit ${firma.gegruendet} arbeiten wir für Privat-, Gewerbe- und Industriekunden im Großraum München, von der einfachen Reparatur über das Smart Home bis zum elektrotechnischen Komplettservice.`}
      >
        <Gesamtnote />
      </Seitenkopf>

      {/* 2. Filter und 3. Projektkarten */}
      <Abschnitt art="nebel" eng titel="Projekte nach Leistung und Kundengruppe">
        <Referenzfilter
          leistungen={leistungen.map((l) => ({ id: l.id, name: l.name }))}
          gruppen={(Object.keys(gruppenNamen) as Gruppe[]).map((g) => ({ id: g, name: gruppenNamen[g] }))}
        >
          <div className="referenzraster">
            {referenzen.map((r) => (
              <Referenzkarte referenz={r} key={r.id} />
            ))}
          </div>
        </Referenzfilter>
        <p className="klein" style={{ marginTop: "var(--a-7)", display: "grid", gap: "var(--a-2)", justifyItems: "start" }}>
          <Offen>Orte und Jahre zu den Projekten</Offen>
          <Offen>Zuordnung der Projekte zu Kundengruppen von Mat prüfen lassen</Offen>
        </p>
      </Abschnitt>

      {/* 4. Bewertungen */}
      <Abschnitt titel="Das sagen unsere Kunden" ohneRahmen>
        <Bewertungsreihe liste={bewertungenImLaufband} />
      </Abschnitt>

      {/* 5. Anfrage */}
      <Anfrage
        titel="Ihr Projekt könnte das nächste sein"
        text="Schreiben Sie uns, was Sie vorhaben. Wir melden uns und beraten Sie."
      />
    </Seite>
  );
}
