import type { Metadata } from "next";
import Link from "next/link";

import { Ablauf } from "@/bausteine/Abschnitte";
import { Bewerbung } from "@/bausteine/Bewerbung";
import { Offen } from "@/bausteine/Fliesstext";
import { Abschnitt, Seite, Seitenkopf, nr } from "@/bausteine/Geruest";
import { KnopfLink } from "@/bausteine/Knopf";
import { Zeichen } from "@/bausteine/Zeichen";
import { offeneStellen, stellen, vorteile } from "@/daten/stellen";
import { seitenMeta } from "@/lib/seo";

import arbeitsalltag from "@/bilder/rohbau-leerrohre-decke.webp";

export const metadata: Metadata = seitenMeta({
  titel: "Karriere | Jobs für Elektriker in Germering | Mat",
  beschreibung:
    "Elektroinstallateur, Projektleiter oder Ausbildung zum Elektroniker: offene Stellen bei Mat-Elektrotechnik in Germering. Jetzt in wenigen Minuten bewerben.",
  pfad: "/karriere",
});

const schritte = [
  {
    titel: "Bewerbung senden",
    text: "Füllen Sie das kurze Formular aus. Ein Lebenslauf ist freiwillig.",
  },
  {
    titel: "Kennenlernen",
    text: "Wir melden uns bei Ihnen und vereinbaren ein Vorstellungsgespräch.",
  },
  {
    titel: "Loslegen",
    text: "Passt es für beide Seiten, klären wir den Einstieg.",
  },
];

/** Karriere. Abschnitte: Informationsarchitektur.md, 7.6. Dunkler Auftritt nach Design.md, Abschnitt 14. */
export default function Karriere() {
  const ausbildung = stellen.find((s) => s.art === "Ausbildung");
  return (
    <Seite>
      {/* 1. Überschrift, Foto aus dem Arbeitsalltag */}
      <Seitenkopf
        dunkel
        krumen={[{ name: "Karriere", pfad: "/karriere" }]}
        titel="Arbeiten bei Mat-Elektrotechnik in Germering"
        vorspann="Gemeinsam sind wir stark! Wir wachsen und suchen Menschen, die Elektrotechnik können und Freude am Kundenkontakt haben."
        bild={arbeitsalltag}
        bildAlt="Monteur von Mat-Elektrotechnik verlegt Leerrohre auf der Bewehrung einer Rohbaudecke"
      >
        <div className="reihe-knoepfe">
          <KnopfLink href="#bewerbung">Jetzt bewerben</KnopfLink>
          <KnopfLink href="#stellen" art="zweit">
            Offene Stellen ansehen
          </KnopfLink>
        </div>
      </Seitenkopf>

      {/* 2. Warum hier arbeiten */}
      <Abschnitt art="dunkel" eng titel="Sechs Gründe, bei uns zu arbeiten">
        <ul className="aussagen" data-reihe>
          {vorteile.map((v, i) => (
            <li key={v.titel} style={nr(i)}>
              <h3>{v.titel}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </Abschnitt>

      {/* 3. Offene Stellen */}
      <Abschnitt
        id="stellen"
        art="dunkel"
        eng
        titel={`${offeneStellen.length === 3 ? "Drei" : offeneStellen.length} offene Stellen in Germering`}
      >
        <div className="stellenliste">
          {offeneStellen.map((s) => (
            <Link className="stellenzeile" href={s.pfad} key={s.id}>
              <span className="stellenzeile__titel">{s.titel}</span>
              <span className="stellenzeile__kurz">{s.kurz}</span>
              <Zeichen name="pfeil" className="stellenzeile__pfeil" />
            </Link>
          ))}
        </div>
      </Abschnitt>

      {/* 4. Ausbildung */}
      {ausbildung ? (
        <Abschnitt
          titel="Ausbildung: Elektroniker für Energie- und Gebäudetechnik"
          vorspann={ausbildung.einleitung}
        >
          <div className="fuerwen">
            <div className="fuerwen__gruppe">
              <h3>Das bringen Sie mit</h3>
              <ul className="punktliste">
                {ausbildung.anforderungen.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="fuerwen__gruppe">
              <h3>Das bieten wir</h3>
              <ul className="punktliste">
                {ausbildung.angebot.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="fuerwen__gruppe">
              <h3>So geht es weiter</h3>
              <p>Alle Einzelheiten zur Ausbildung stehen in der Stellenanzeige.</p>
              <p>
                <Link className="textlink" href={ausbildung.pfad}>
                  Mehr zur Ausbildung
                </Link>
              </p>
            </div>
          </div>
        </Abschnitt>
      ) : null}

      {/* 5. Stimmen aus dem Team */}
      <Abschnitt art="nebel" eng titel="Das sagt unser Team">
        <div className="videoplatz" style={{ aspectRatio: "auto", minHeight: "180px" }}>
          <p>
            <Offen>Stimmen aus dem Team, zum Beispiel von Monteuren und Auszubildenden</Offen>
          </p>
        </div>
        <p style={{ marginTop: "var(--a-6)" }}>
          <Link className="textlink" href="/unternehmen">
            Team und Geschichte kennenlernen
          </Link>
        </p>
      </Abschnitt>

      {/* 6. Ablauf der Bewerbung in drei Schritten */}
      <Abschnitt titel="In drei Schritten zum neuen Arbeitsplatz">
        <Ablauf schritte={schritte} dauerHinweis={false} />
      </Abschnitt>

      {/* 7. Kurzes Bewerbungsformular */}
      <Bewerbung
        titel="Jetzt bewerben, auch ohne passende Stelle"
        text="Name und eine Telefonnummer oder E-Mail-Adresse genügen. Den Rest klären wir im Gespräch."
      />
    </Seite>
  );
}
