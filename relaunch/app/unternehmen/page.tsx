import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Gebiet, Vertrauensleiste } from "@/bausteine/Abschnitte";
import { Offen } from "@/bausteine/Fliesstext";
import { Abschlussband, Abschnitt, Hakenliste, Seite, Seitenkopf, nr } from "@/bausteine/Geruest";
import { Portraet } from "@/bausteine/Karten";
import { KnopfLink } from "@/bausteine/Knopf";
import { firma } from "@/daten/firma";
import { team } from "@/daten/team";
import { seitenMeta } from "@/lib/seo";

import teamHof from "@/bilder/team-fahrzeuge-hof.webp";
import elmar from "@/bilder/elmar-2023-preisuebergabe.webp";

export const metadata: Metadata = seitenMeta({
  titel: "Über uns | Elektro-Meisterbetrieb Germering | Mat",
  beschreibung:
    "Mat-Elektrotechnik aus Germering: 2010 gegründet, seit 2018 GmbH. Lernen Sie Team, Geschichte und Auszeichnungen des Elektro-Meisterbetriebs kennen.",
  pfad: "/unternehmen",
});

const geschichte = [
  {
    jahr: String(firma.gegruendet),
    titel: "Die Gründung",
    text: `${firma.geschaeftsfuehrer} macht sich als Elektromeister selbstständig. Von Beginn an gilt sein Interesse neuen Technologien und Lösungen mit Zukunft. Nach kurzer Anlaufphase wächst der Betrieb schnell.`,
  },
  {
    jahr: String(firma.gmbhSeit),
    titel: "Aus dem Einzelunternehmen wird die GmbH",
    text: "Weil der Betrieb stetig wächst, wird das Einzelunternehmen in die Mat-Elektrotechnik GmbH umgewandelt.",
  },
  {
    jahr: "2023",
    titel: "Markenpreis ELMAR",
    text: "Beim Markenforum der Elektrobranche wird Mat-Elektrotechnik mit dem Markenpreis ELMAR 2023 in Kategorie 1 ausgezeichnet.",
  },
  {
    jahr: "Heute",
    titel: "Ein Team für alles rund um Strom",
    text: "Bei uns arbeiten Elektromeister, ausgebildete Elektroinstallateure, Elektrohelfer und Auszubildende, dazu Kolleginnen und Kollegen für Rechnungswesen und Buchhaltung.",
  },
];

const werte = [
  {
    titel: "Tradition und Innovation",
    text: "Neue Technik und traditionelle menschliche Werte gehören bei uns zusammen. Das ist der Kern unserer Arbeit.",
  },
  {
    titel: "Laufend geschult",
    text: "Unser Team arbeitet mit aktuellen Produkten und Anwendungen und wird dafür laufend geschult.",
  },
  {
    titel: "Ihr Anliegen ist unseres",
    text: "Wir behandeln Ihr Anliegen wie unser eigenes: mit Fachkompetenz, persönlichem Einsatz und dem Blick für die Lösung.",
  },
  {
    titel: "Zusammenarbeit über Jahre",
    text: "Uns geht es um zufriedene Kunden und dauerhafte Beziehungen. Einige Kunden sind seit der Gründung dabei.",
  },
];

/** Über uns. Abschnitte: Informationsarchitektur.md, 7.5. */
export default function UeberUns() {
  const preis = firma.auszeichnungen[0];
  return (
    <Seite>
      {/* 1. Überschrift, Teamfoto */}
      <Seitenkopf
        krumen={[{ name: "Über uns", pfad: "/unternehmen" }]}
        titel={`Elektro-Meisterbetrieb in Germering, seit ${firma.gegruendet} für Sie da`}
        vorspann="Wir planen, installieren, warten und reparieren für gewerbliche und private Kunden im Raum München. Ein Betrieb, ein Ansprechpartner, alles rund um Strom."
        bild={teamHof}
        bildAlt="Vier Mitarbeiter von Mat-Elektrotechnik vor dem Firmengebäude in Germering, daneben die Firmenfahrzeuge"
      >
        <div className="reihe-knoepfe">
          <KnopfLink href="/kontakt">Anfrage stellen</KnopfLink>
        </div>
      </Seitenkopf>

      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben" aria-label="Der Betrieb auf einen Blick">
        <div className="rahmen">
          <Vertrauensleiste />
        </div>
      </section>

      {/* 2. Geschichte als Zeitleiste an der Leitung */}
      <Abschnitt titel="Wie alles begann: vom Einzelunternehmen zur GmbH">
        <ol className="zeitleiste">
          {geschichte.map((g) => (
            <li key={g.jahr}>
              <span className="knoten" aria-hidden="true" />
              <p className="zeitleiste__jahr">{g.jahr}</p>
              <h3>{g.titel}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ol>
      </Abschnitt>

      {/* 3. Wofür die Firma steht */}
      <Abschnitt art="nebel" titel="Wofür wir stehen">
        <ul className="aussagen" data-reihe>
          {werte.map((w, i) => (
            <li key={w.titel} style={nr(i)}>
              <h3>{w.titel}</h3>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>
        <figure style={{ marginTop: "var(--a-8)", maxWidth: "820px" }}>
          <blockquote className="titel-3">
            <p>„Zu unserem Kundenkreis zählen viele Gewerbekunden sowie unzählige Privatkunden.“</p>
          </blockquote>
          <figcaption className="klein" style={{ marginTop: "var(--a-3)" }}>
            {firma.geschaeftsfuehrer}, Geschäftsführer
          </figcaption>
        </figure>
      </Abschnitt>

      {/* 4. Team mit Fotos und Funktion */}
      <Abschnitt
        art="dunkel"
        titel="Die Menschen hinter Mat-Elektrotechnik"
        vorspann="Know-how hat viele Gesichter. Diese hier kommen zu Ihnen."
      >
        <div className="teamraster" data-reihe>
          {team.map((m, i) => (
            <Portraet mitglied={m} key={m.name} i={i} />
          ))}
        </div>
        <p style={{ marginTop: "var(--a-7)" }}>
          <Link className="textlink" href="/karriere">
            Offene Stellen ansehen
          </Link>
        </p>
      </Abschnitt>

      {/* 5. Auszeichnungen und Nachweise */}
      <Abschnitt titel="Ausgezeichnet: Markenpreis ELMAR 2023">
        <div className="zweiteiler zweiteiler--text-links">
          <div className="zweiteiler__text">
            <p>{preis.text}</p>
            <Hakenliste
              punkte={[`Meisterbetrieb, geführt von Elektromeister ${firma.geschaeftsfuehrer}`]}
            />
            <p className="klein">
              <Offen>Innung, Partner und weitere Nachweise</Offen>
            </p>
          </div>
          <div className="bildrahmen bildrahmen--16-10 licht" data-licht>
            <Image
              src={elmar}
              alt="Übergabe des Markenpreises ELMAR 2023 auf der Bühne des Markenforums der Elektrobranche"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </div>
        </div>
      </Abschnitt>

      {/* 6. Einzugsgebiet mit Karte */}
      <Abschnitt
        art="nebel"
        titel="Unser Einzugsgebiet: Germering, Umkreis und Münchner Westen"
        vorspann="Wir arbeiten im Großraum München. Am schnellsten sind wir rund um Germering."
      >
        <Gebiet />
      </Abschnitt>

      {/* 7. Firmenvideo */}
      <Abschnitt titel="Mat-Elektrotechnik im Film">
        {firma.video ? (
          <video className="video" controls preload="none" poster={firma.video.poster}>
            <source src={firma.video.src} type="video/mp4" />
          </video>
        ) : (
          <div className="videoplatz">
            <p>
              <Offen>Firmenvideo als Datei. Es liegt bisher nur auf dem alten Server</Offen>
            </p>
          </div>
        )}
      </Abschnitt>

      {/* 8. Zwei Wege am Ende */}
      <Abschlussband
        titel="Wir sind für Sie da und freuen uns auf Ihre Nachricht"
        text="Sie haben ein Vorhaben oder möchten bei uns arbeiten? Beides beginnt mit einem Klick."
      >
        <KnopfLink href="/kontakt" art="weiss">
          Anfrage stellen
        </KnopfLink>
        <Link href="/karriere">Zum Team gehören</Link>
      </Abschlussband>
    </Seite>
  );
}
