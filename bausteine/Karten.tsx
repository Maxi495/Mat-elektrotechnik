import Image from "next/image";
import Link from "next/link";
import { leistungNachId, type Leistung } from "@/daten/leistungen";
import type { Referenz } from "@/daten/referenzen";
import type { Bewertung } from "@/daten/bewertungen";
import type { Teammitglied } from "@/daten/team";
import { offen } from "@/daten/firma";
import { nr } from "./Geruest";
import { Zeichen } from "./Zeichen";

/** Leistungskarte (Design.md, 9.6): Schaltzeichen, Name, zwei Zeilen Text, Link. */
export function Leistungskarte({ leistung, i = 0 }: { leistung: Leistung; i?: number }) {
  return (
    <article className="karte karte--hebt karte--umlauf leistungskarte" style={nr(i)}>
      <Zeichen name={leistung.zeichen} groesse="gross" zeichnet />
      <h3>{leistung.name}</h3>
      <p>{leistung.kurztext}</p>
      <p>
        <Link className="textlink karte__verweis" href={leistung.pfad}>
          Mehr zu {leistung.name}
        </Link>
      </p>
    </article>
  );
}

/**
 * Referenzkarte (Design.md, 9.8): Bild 4:5, Titel, Zeile mit Ort und Leistung als Marken.
 * Jedes Projekt verlinkt auf seine Leistungsseite (Informationsarchitektur.md, Abschnitt 8).
 * Auf der Leistungsseite selbst entfällt der Link.
 */
export function Referenzkarte({
  referenz: r,
  verlinkt = true,
  i = 0,
}: {
  referenz: Referenz;
  verlinkt?: boolean;
  i?: number;
}) {
  const haupt = leistungNachId(r.leistungen[0]);
  const bild = (
    <>
      <Image
        src={r.bild}
        alt={r.bildAlt}
        sizes="(min-width: 1280px) 400px, (min-width: 700px) 45vw, 92vw"
      />
      <span className="referenzkarte__einschub" aria-hidden="true">
        {r.ort ? <span>{r.ort}</span> : null}
        <span>{haupt.name}</span>
      </span>
    </>
  );

  return (
    <article
      className="referenzkarte"
      style={nr(i)}
      data-referenz
      data-leistungen={r.leistungen.join(" ")}
      data-gruppe={r.gruppe ?? ""}
    >
      {verlinkt ? (
        <Link
          className="referenzkarte__bild bildrahmen bildrahmen--4-5 licht"
          href={haupt.pfad}
          data-zeiger="ansehen"
          data-licht
          aria-label={`${r.titel}: mehr zu ${haupt.name}`}
        >
          {bild}
        </Link>
      ) : (
        <div className="referenzkarte__bild bildrahmen bildrahmen--4-5 licht" data-licht>
          {bild}
        </div>
      )}
      <h3>{r.titel}</h3>
      <p className="marken">
        {r.ort ? (
          <span className="marke">
            <Zeichen name="ort" groesse="klein" />
            {r.ort}
            {r.jahr ? `, ${r.jahr}` : ""}
          </span>
        ) : (
          <span className="marke marke--offen">{offen("Ort")}</span>
        )}
        {r.leistungen.map((id) => {
          const l = leistungNachId(id);
          return verlinkt ? (
            <Link className="marke" href={l.pfad} key={id}>
              {l.name}
            </Link>
          ) : (
            <span className="marke" key={id}>
              {l.name}
            </span>
          );
        })}
      </p>
      <p>{r.satz}</p>
    </article>
  );
}

/**
 * Bewertungskarte (Design.md, 9.9), aufgebaut wie eine Rezension bei Google:
 * Profilbild, Name, fünf Sterne, Wortlaut, Google-Zeichen als Quelle.
 *
 * Hat der Verfasser kein eigenes Profilbild, steht wie bei Google sein Anfangsbuchstabe auf Farbe.
 * Lange Texte zeigen mit Skript sechs Zeilen und den Knopf "Mehr" (lib/bedienung.ts).
 * Ohne Skript steht der ganze Text da. Im Quelltext steht er immer vollständig.
 */
export function Bewertungskarte({ bewertung: b }: { bewertung: Bewertung }) {
  const textId = `bewertung-${b.id}`;
  return (
    <figure className="bewertung" data-bewertung={b.id}>
      <figcaption className="bewertung__kopf">
        {b.bild ? (
          <Image className="bewertung__bild" src={b.bild} alt="" width={44} height={44} unoptimized />
        ) : (
          <span
            className="bewertung__bild bewertung__bild--buchstabe"
            style={{ backgroundColor: b.farbe ?? undefined }}
            aria-hidden="true"
          >
            {b.name.trim().charAt(0)}
          </span>
        )}
        <span className="bewertung__wer">
          <span className="bewertung__name">{b.name}</span>
          <span className="sternreihe" role="img" aria-label="5 von 5 Sternen" />
        </span>
        <span className="bewertung__google" role="img" aria-label="Bewertung bei Google" />
      </figcaption>
      <blockquote className="bewertung__text" id={textId}>
        <p>{b.text}</p>
      </blockquote>
      {b.uebersetzt ? <p className="bewertung__hinweis">Übersetzt von Google</p> : null}
      {/* Eine übersetzte Kurzbewertung braucht den Knopf nicht, ihr Hinweis füllt dieselbe Zeile. */}
      {b.uebersetzt && b.text.length < 200 ? null : (
        <button type="button" className="bewertung__mehr" aria-expanded="false" aria-controls={textId} hidden>
          Mehr
        </button>
      )}
    </figure>
  );
}

/** Team-Porträt in Farbe, Name und Funktion. */
export function Portraet({ mitglied: m, i = 0 }: { mitglied: Teammitglied; i?: number }) {
  return (
    <figure className="portraet" style={nr(i)}>
      <div className="bildrahmen bildrahmen--1-1">
        <Image
          src={m.bild}
          alt={`${m.name}, ${m.funktion} bei Mat-Elektrotechnik`}
          sizes="(min-width: 1280px) 240px, (min-width: 640px) 30vw, 46vw"
        />
      </div>
      <figcaption className="portraet__text">
        <span className="portraet__name">{m.name}</span>
        <span className="klein">{m.funktion}</span>
      </figcaption>
    </figure>
  );
}
