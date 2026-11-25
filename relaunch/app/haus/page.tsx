import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Offen } from "@/bausteine/Fliesstext";
import { Abschlussband, Abschnitt, Seite, Seitenkopf, nr } from "@/bausteine/Geruest";
import { Zeichen } from "@/bausteine/Zeichen";
import type { LeistungId } from "@/daten/adressen";
import { leistungen } from "@/daten/leistungen";
import { seitenMeta } from "@/lib/seo";

export const metadata: Metadata = seitenMeta({
  titel: "Alle Leistungen im Haus | Mat-Elektrotechnik Germering",
  beschreibung:
    "Vom Dach bis zum Keller: Sehen Sie, wo im Haus Photovoltaik, Wallbox, Smart Home, Zählerschrank und die anderen Leistungen von Mat-Elektrotechnik sitzen.",
  pfad: "/haus",
});

/**
 * Lage der neun Punkte im Schnitt des Hauses, in Prozent der Bühne.
 * Orte nach Informationsarchitektur.md, Abschnitt 9. Gleiche Reihenfolge und Namen wie im Menü.
 */
const lage: Record<LeistungId, { x: number; y: number }> = {
  elektroinstallation: { x: 36.5, y: 68 },
  wallbox: { x: 81, y: 70 },
  photovoltaik: { x: 36, y: 22 },
  "smart-home": { x: 61, y: 45 },
  verteilerbau: { x: 33, y: 89 },
  pruefung: { x: 45, y: 89 },
  netzwerktechnik: { x: 36.5, y: 45 },
  blitzschutz: { x: 26.2, y: 55 },
  antennentechnik: { x: 62, y: 20.5 },
};

/**
 * 3D-Haus (Informationsarchitektur.md, Abschnitt 9; Design.md, Abschnitt 11).
 *
 * Das 3D-Haus selbst kommt später aus einem eigenen Projekt. Bis dahin steht hier die Ausweichlösung:
 * ein gezeichneter Schnitt als Standbild mit den neun Punkten und darunter die normale Leistungsübersicht.
 * Alle Texte und Links des Hauses stehen als normaler Seiteninhalt bereit.
 *
 * PLATZ FÜR DAS 3D-HAUS: Das Element mit data-haus-buehne ist die Bühne. Das spätere Projekt
 * hängt seine Szene dort ein und lädt sie erst, wenn die Bühne ins Bild kommt.
 */
export default function Haus() {
  return (
    <Seite>
      <Seitenkopf
        krumen={[{ name: "3D-Haus", pfad: "/haus" }]}
        titel="Alle Leistungen in einem Haus"
        vorspann="Vom Dach bis zum Keller: Neun Punkte zeigen, wo wir für Sie arbeiten. Wählen Sie einen Punkt und lesen Sie, was dahintersteckt."
      />

      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben" aria-labelledby="haus-buehne">
        <div className="rahmen">
          <h2 className="nur-vorlesen" id="haus-buehne">
            Das Haus im Schnitt mit neun Punkten
          </h2>
          <div className="hausbuehne" data-haus-buehne>
            <div className="hausbuehne__bild">
              <svg viewBox="0 0 1600 1000" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                {/* Gelände */}
                <path d="M60 820h360M1180 820h360" />
                {/* Dach */}
                <path d="M380 330L800 120l420 210" />
                {/* Außenwände und Geschosse */}
                <path d="M420 330v630h760V330" />
                <path d="M420 560h760M420 820h760" />
                <path d="M800 330v230M800 560v260" />
                <path d="M700 820v140" />
                {/* Garage */}
                <path d="M1180 600h300v220" />
                <path d="M1240 820v-70h180v70M1260 750l24-44h112l24 44" />
                <circle cx="1280" cy="820" r="18" />
                <circle cx="1380" cy="820" r="18" />
                <path d="M1210 640h36v70h-36z" />
                {/* Solarmodule auf dem linken Dach */}
                <path d="M470 276l230-115M494 300l230-115M470 276l24 24M585 218l24 24M700 161l24 24" />
                {/* SAT-Schüssel auf dem rechten Dach */}
                <path d="M990 214l20 10M972 176a34 34 0 0 0 56 28" />
                <path d="M1000 190l22-22" />
                {/* Fenster und Einrichtung */}
                <path d="M480 620h130v120H480zM545 620v120" />
                <path d="M890 620h200v200M890 620v200" />
                <path d="M480 390h130v110H480zM890 390h130v110H890z" />
                <path d="M660 500v-70h80v70" />
                {/* Zählerschrank und Messgerät im Keller */}
                <path d="M480 850h110v90H480zM500 872h70M500 894h70M500 916h70" />
                <circle cx="720" cy="890" r="26" />
                <path d="M708 880l12 22 12-22" />
                {/* Blitzschutz: Fangstange und Ableitung an der Außenwand */}
                <path className="hausbuehne__leitung" d="M800 120V70" />
                <path className="hausbuehne__leitung" d="M800 120L380 330M392 324v496" />
                <path className="hausbuehne__leitung" d="M362 820h60M372 836h40M382 852h20" />
                {/* Leitung vom Zählerschrank durch das Haus */}
                <path className="hausbuehne__leitung" d="M535 850V560M535 560V330" />
                <path className="hausbuehne__leitung" d="M535 700h60M535 470h60M535 640h440V470" />
                <path className="hausbuehne__leitung" d="M590 895h104M746 890h454v-180h10" />
              </svg>

              {leistungen.map((l, i) => (
                <Link
                  key={l.id}
                  className="hauspunkt"
                  href={l.pfad}
                  style={{ "--x": lage[l.id].x, "--y": lage[l.id].y } as CSSProperties}
                  aria-label={`${i + 1}: ${l.name}. ${l.hausOrt}`}
                >
                  <span aria-hidden="true">{i + 1}</span>
                </Link>
              ))}
            </div>
            <p className="hausbuehne__hinweis">
              <Offen>Das 3D-Haus aus dem eigenen Projekt wird hier eingebunden. Bis dahin steht dieses Standbild</Offen>
            </p>
          </div>
        </div>
      </section>

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
