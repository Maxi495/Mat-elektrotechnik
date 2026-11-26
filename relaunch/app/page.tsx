import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import {
  Ablauf,
  Anfrage,
  Bewertungsreihe,
  Gebiet,
  Gesamtnote,
  Sicherungsreihe,
  Vertrauensleiste,
  Zielgruppen,
} from "@/bausteine/Abschnitte";
import { Abschnitt, Seite } from "@/bausteine/Geruest";
import { Referenzkarte } from "@/bausteine/Karten";
import { KnopfLink } from "@/bausteine/Knopf";
import { Sterne } from "@/bausteine/Zeichen";
import { alleBewertungen } from "@/daten/bewertungen";
import { firma } from "@/daten/firma";
import { startReferenzen } from "@/daten/referenzen";
import { seitenMeta } from "@/lib/seo";

import startbild from "@/bilder/wandleuchten-lichtkegel.webp";
import teambild from "@/bilder/team-studio.webp";

/* Titel, Hauptüberschrift und Meta-Beschreibung: SEO-Optimierung.md, Kapitel 8. */
export const metadata: Metadata = seitenMeta({
  titel: "Elektriker Germering & München-West | Mat-Elektrotechnik",
  beschreibung:
    "Elektroinstallation, Photovoltaik, Wallbox, Blitzschutz und Netzwerktechnik aus Germering. 4,9 Sterne bei Google. Jetzt Angebot anfragen.",
  pfad: "/",
});

const zeilen = ["Ihr Elektriker", "in Germering", "und im Münchner", "Westen"];

const schritte = [
  { titel: "Anfrage", text: "Sie schreiben uns oder rufen an und schildern Ihr Vorhaben." },
  {
    titel: "Beratung vor Ort",
    text: "Wir sehen uns die Situation an und beraten Sie. Die Beratung ist kostenlos.",
  },
  { titel: "Angebot", text: "Sie erhalten ein Angebot mit allen Positionen." },
  {
    titel: "Umsetzung",
    text: "Wir führen die Arbeiten aus, prüfen die Anlage und übergeben sie Ihnen.",
  },
];

/**
 * Startseite. Abschnitte und Reihenfolge: Informationsarchitektur.md, 7.1.
 * Farbrhythmus: Design.md, 3.3.
 */
export default function Startseite() {
  return (
    <Seite>
      {/* 1. Erster Bildschirm: was, wo, wie anfragen */}
      <section className="start-kopf">
        <div className="start-kopf__text">
          <h1 className="titel-schau start-kopf__titel">
            {zeilen.map((z, i) => (
              <span className="zeile" key={z}>
                <span style={{ "--i": i } as CSSProperties}>{z}</span>{" "}
              </span>
            ))}
          </h1>
          <p className="vorspann">
            Elektro-Meisterbetrieb seit {firma.gegruendet}. Wir planen, installieren und prüfen für
            Privatkunden, Gewerbe und Hausverwaltungen.
          </p>
          <div className="reihe-knoepfe">
            <KnopfLink href="#anfrage">Anfrage stellen</KnopfLink>
            <KnopfLink href="#leistungen" art="zweit">
              Leistungen ansehen
            </KnopfLink>
          </div>
          <a className="start-kopf__google" href={firma.google.profil} rel="noopener" target="_blank">
            <Sterne
              wert={firma.google.note}
              text={`${firma.google.noteAnzeige} von 5 Sternen bei Google`}
            />
            <span>{firma.google.noteAnzeige} bei Google</span>
            <span>{firma.google.anzahl} Bewertungen</span>
          </a>
        </div>

        <div className="start-kopf__bild bildrahmen">
          <Image
            src={startbild}
            alt="Zwei Wandleuchten werfen warme Lichtkegel auf eine graue Wand, installiert von Mat-Elektrotechnik"
            sizes="(min-width: 1024px) 42vw, 100vw"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <div className="start-kopf__leitung" aria-hidden="true">
          <span className="start-kopf__strom" />
          <span className="knoten" />
        </div>
      </section>

      {/* 2. Vertrauensleiste */}
      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben" aria-label="Der Betrieb auf einen Blick">
        <div className="rahmen">
          <Vertrauensleiste />
        </div>
      </section>

      {/* 3. Leistungen: die Sicherungsreihe */}
      <Abschnitt
        id="leistungen"
        art="dunkel"
        className="leistungen-reihe"
        titel="Alles rund um Strom, aus einer Hand in Germering"
        vorspann="Neun Leistungen, ein Ansprechpartner. Legen Sie einen Schalter um und sehen Sie, was wir für Sie tun."
      >
        <Sicherungsreihe />
        <p className="leistungen-reihe__fuss">
          <Link className="textlink" href="/leistungen">
            Alle Leistungen im Überblick
          </Link>
          <Link className="textlink" href="/haus">
            Leistungen im 3D-Haus entdecken
          </Link>
        </p>
      </Abschnitt>

      {/* 4. Für wen wir arbeiten */}
      <Abschnitt
        titel="Für Eigenheim, Betrieb und Wohnanlage"
        vorspann="Wir arbeiten für Privatkunden, Gewerbe und Hausverwaltungen im Raum München."
      >
        <Zielgruppen />
      </Abschnitt>

      {/* 5. Referenzen */}
      <Abschnitt art="nebel" titel="So sieht unsere Arbeit aus">
        <div className="referenzraster referenzraster--drei" data-reihe>
          {startReferenzen.map((r, i) => (
            <Referenzkarte referenz={r} key={r.id} i={i} />
          ))}
        </div>
        <p style={{ marginTop: "var(--a-7)" }}>
          <KnopfLink href="/referenzen" art="zweit">
            Alle Referenzen ansehen
          </KnopfLink>
        </p>
      </Abschnitt>

      {/* 6. Bewertungen */}
      <Abschnitt titel="Das sagen unsere Kunden" ohneRahmen>
        <div className="rahmen">
          <Gesamtnote />
        </div>
        <Bewertungsreihe liste={alleBewertungen} />
      </Abschnitt>

      {/* 7. So läuft es ab */}
      <Abschnitt art="nebel" titel="In vier Schritten von der Anfrage zur fertigen Anlage">
        <Ablauf schritte={schritte} />
      </Abschnitt>

      {/* 8. Über uns kurz */}
      <Abschnitt art="dunkel">
        <div className="zweiteiler">
          <div className="bildrahmen bildrahmen--16-10 licht" data-licht>
            <Image
              src={teambild}
              alt="Sieben Mitarbeiter von Mat-Elektrotechnik in grauen Poloshirts mit verschränkten Armen"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </div>
          <div className="zweiteiler__text">
            <h2 data-zeilen>Ein Meisterbetrieb aus Germering, seit {firma.gegruendet}</h2>
            <p>
              {firma.geschaeftsfuehrer} hat Mat-Elektrotechnik {firma.gegruendet} gegründet, seit{" "}
              {firma.gmbhSeit} ist der Betrieb eine GmbH. Heute arbeiten hier Meister, Monteure und
              Auszubildende zusammen. Einige Kunden sind seit der Gründung dabei.
            </p>
            <KnopfLink href="/unternehmen" art="zweit">
              Team und Geschichte kennenlernen
            </KnopfLink>
          </div>
        </div>
      </Abschnitt>

      {/* 9. Einzugsgebiet */}
      <Abschnitt
        titel="Wir kommen zu Ihnen: Germering, Umkreis und Münchner Westen"
        vorspann="Unser Betrieb sitzt in der Industriestraße in Germering. Von dort sind wir schnell im Landkreis Fürstenfeldbruck und im Münchner Westen."
      >
        <Gebiet />
      </Abschnitt>

      {/* 10. Karriere-Hinweis */}
      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben">
        <span className="abschnitt__knoten knoten" data-knoten aria-hidden="true" style={{ "--knoten-oben": "40px" } as CSSProperties} />
        <div className="rahmen">
          <div className="karrierestreifen auf-rot">
            <div>
              <h2>Wir suchen Verstärkung</h2>
              <p>
                Elektroinstallateure, Projektleiter und Auszubildende: Kommen Sie in unser Team.
              </p>
            </div>
            <KnopfLink href="/karriere" art="weiss">
              Offene Stellen ansehen
            </KnopfLink>
          </div>
        </div>
      </section>

      {/* 11. Abschluss: kurzes Anfrageformular, Telefon */}
      <Anfrage
        titel="Sagen Sie uns, was Sie vorhaben"
        text="Wir melden uns bei Ihnen und beraten Sie. Die Beratung ist kostenlos."
        kurz
      />
    </Seite>
  );
}
