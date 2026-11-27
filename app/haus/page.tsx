import type { Metadata } from "next";
import Link from "next/link";

import { Abschlussband, Abschnitt, Brotkrumen, Seite, nr } from "@/bausteine/Geruest";
import { Haus3D, type Hauspunkt } from "@/bausteine/Haus3D";
import { Zeichen } from "@/bausteine/Zeichen";
import standbild from "@/bilder/haus-3d-standbild.webp";
import { leistungen } from "@/daten/leistungen";
import { seitenMeta } from "@/lib/seo";

export const metadata: Metadata = seitenMeta({
  titel: "Alle Leistungen im Haus | Mat-Elektrotechnik Germering",
  beschreibung:
    "Vom Dach bis zum Technikraum: Sehen Sie im 3D-Haus, wo Photovoltaik, Wallbox, Smart Home, Zählerschrank und die anderen Leistungen von Mat-Elektrotechnik sitzen.",
  pfad: "/haus",
});

/**
 * 3D-Haus (Informationsarchitektur.md, Abschnitt 9; Design.md, Abschnitt 11).
 *
 * Oben die Bühne mit dem Haus zum Drehen und Hineingehen (bausteine/Haus3D.tsx, lib/haus3d/).
 * Darunter stehen alle neun Punkte noch einmal als normaler Seiteninhalt: für Suchmaschinen, Vorleseprogramme
 * und Geräte ohne 3D. Reihenfolge und Namen wie im Menü.
 */
export default function Haus() {
  const punkte: Hauspunkt[] = leistungen.map((l) => ({ id: l.id, name: l.name, kurz: l.kurztext, ort: l.hausOrt, pfad: l.pfad, zeichen: l.zeichen }));
  return (
    <Seite>
      <Haus3D
        punkte={punkte}
        standbild={{
          bild: standbild,
          alt: "Das Haus als 3D-Modell: drei Geschosse mit Garage, Dachterrasse, Solarmodulen und SAT-Schüssel auf dem Dach",
        }}
      >
        <Brotkrumen krumen={[{ name: "3D-Haus", pfad: "/haus" }]} />
        <h1>Alle Leistungen in einem Haus</h1>
        <p className="vorspann">
          Vom Dach bis zum Technikraum: Neun Punkte zeigen, wo wir für Sie arbeiten. Drehen Sie das Haus, gehen Sie hinein und wählen Sie einen Punkt.
        </p>
      </Haus3D>

      {/* Ausweichlösung: alle neun Punkte als normaler Seiteninhalt */}
      <Abschnitt art="nebel" eng titel="Neun Punkte im Haus, neun Leistungen">
        <ol className="hausliste" data-reihe>
          {leistungen.map((l, i) => (
            <li key={l.id} style={nr(i)}>
              <article className="karte karte--hebt karte--umlauf leistungskarte">
                <div className="hausliste__kopf">
                  <Zeichen name={l.zeichen} groesse="gross" zeichnet />
                  <span className="hausliste__nummer" aria-hidden="true">
                    {i + 1}
                  </span>
                </div>
                <h3>{l.name}</h3>
                <p className="klein">{l.hausOrt}</p>
                <p>{l.kurztext}</p>
                <p>
                  <Link className="textlink karte__verweis" href={l.pfad}>
                    Mehr zu {l.name}
                  </Link>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <Abschlussband
        titel="Sie wissen jetzt, was Sie brauchen?"
        text="Dann schreiben Sie uns. Wir melden uns und beraten Sie."
      />
    </Seite>
  );
}
