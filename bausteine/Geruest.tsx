import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { brotkrumenLd, type Krume } from "@/lib/seo";
import { Offen } from "./Fliesstext";
import { KnopfLink } from "./Knopf";
import { SeiteBereit } from "./SeiteBereit";
import { Zeichen } from "./Zeichen";

/**
 * Rahmen jeder Seite: der Inhalt und am Ende der Baustein, der die Bewegung dieser Seite einschaltet.
 * Jede Seite unter app/ gibt ihren Inhalt in diesem Rahmen zurück.
 */
export function Seite({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SeiteBereit />
    </>
  );
}

/** Strukturierte Daten als JSON-LD. */
export function JsonLd({ daten }: { daten: object | null }) {
  if (!daten) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(daten).replace(/</g, "\\u003c") }}
    />
  );
}

/** Brotkrumen-Pfad (Design.md, 9.16) mit strukturierten Daten. Die letzte Stufe ist die aktuelle Seite. */
export function Brotkrumen({ krumen }: { krumen: Krume[] }) {
  const alle: Krume[] = [{ name: "Start", pfad: "/" }, ...krumen];
  return (
    <nav aria-label="Brotkrumen">
      <ol className="brotkrumen">
        {alle.map((k, i) =>
          i === alle.length - 1 ? (
            <li key={k.pfad}>
              <span aria-current="page">{k.name}</span>
            </li>
          ) : (
            <li key={k.pfad}>
              <Link href={k.pfad}>{k.name}</Link>
            </li>
          ),
        )}
      </ol>
      <JsonLd daten={brotkrumenLd(alle)} />
    </nav>
  );
}

/**
 * Abschnitt mit Knotenpunkt der Leitung (Design.md, 8.1).
 * Die Überschrift steht linksbündig über dem Inhalt, nie als Stichwort mit Etikett darüber.
 */
export function Abschnitt({
  id,
  art,
  eng,
  titel,
  vorspann,
  kopfBreit,
  className = "",
  ohneRahmen,
  children,
}: {
  id?: string;
  art?: "nebel" | "dunkel";
  eng?: boolean;
  titel?: ReactNode;
  vorspann?: ReactNode;
  kopfBreit?: boolean;
  className?: string;
  /** Inhalt bekommt keinen Rahmen, zum Beispiel für ein Laufband über die volle Breite. */
  ohneRahmen?: boolean;
  children: ReactNode;
}) {
  const klassen = [
    "abschnitt",
    art ? `abschnitt--${art}` : "",
    eng ? "abschnitt--eng" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const kopf = titel ? (
    <header className={`abschnitt__kopf${kopfBreit ? " abschnitt__kopf--breit" : ""}`} data-erscheint-kopf>
      <h2 data-zeilen>{titel}</h2>
      {vorspann ? <p className="vorspann">{vorspann}</p> : null}
    </header>
  ) : null;

  return (
    <section className={klassen} id={id}>
      <span className="abschnitt__knoten knoten" data-knoten aria-hidden="true" />
      {ohneRahmen ? (
        <>
          {kopf ? <div className="rahmen">{kopf}</div> : null}
          {children}
        </>
      ) : (
        <div className="rahmen">
          {kopf}
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Kopfbereich der Unterseiten (Design.md, 9.3).
 * Überschrift und Anfrage-Knopf stehen sofort da, das Kopfbild wird bevorzugt geladen.
 */
export function Seitenkopf({
  krumen,
  titel,
  vorspann,
  bild,
  bildAlt,
  bildHinweis,
  dunkel,
  children,
}: {
  krumen: Krume[];
  titel: string;
  vorspann?: ReactNode;
  bild?: StaticImageData;
  bildAlt?: string;
  bildHinweis?: string;
  dunkel?: boolean;
  children?: ReactNode;
}) {
  const klassen = [
    "seitenkopf",
    bild ? "seitenkopf--bild" : "",
    dunkel ? "seitenkopf--dunkel abschnitt--dunkel" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <header className={klassen}>
      <div className="rahmen">
        <Brotkrumen krumen={krumen} />
        <div className="seitenkopf__raster">
          <div className="seitenkopf__text">
            <h1>{titel}</h1>
            {vorspann ? <p className="vorspann">{vorspann}</p> : null}
            {children}
          </div>
          {bild ? (
            <figure className="seitenkopf__bild">
              <div className="bildrahmen bildrahmen--16-10">
                <Image
                  src={bild}
                  alt={bildAlt ?? ""}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              {bildHinweis ? (
                <figcaption className="klein">
                  <Offen>{bildHinweis}</Offen>
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/** Abschluss-Band (Design.md, 9.14): volle Breite in Mat-Rot, vor der Fußzeile auf Seiten ohne eigenes Formular. */
export function Abschlussband({
  titel,
  text,
  children,
}: {
  titel: string;
  text?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="band auf-rot">
      <span className="band__dose" aria-hidden="true">
        <Zeichen name="steckdose" groesse="klein" />
      </span>
      <div className="rahmen">
        <h2>{titel}</h2>
        {text ? <p>{text}</p> : null}
        <div className="reihe-knoepfe">
          {children ?? (
            <KnopfLink href="/kontakt" art="weiss">
              Anfrage stellen
            </KnopfLink>
          )}
        </div>
      </div>
    </section>
  );
}

/** Liste mit Haken, zum Beispiel für den Kurzüberblick einer Leistung. */
export function Hakenliste({ punkte }: { punkte: string[] }) {
  return (
    <ul className="hakenliste">
      {punkte.map((p) => (
        <li key={p}>
          <Zeichen name="haken" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kurzer Helfer für die Reihenfolge in Kartenreihen (Versatz 60 ms je Element). */
export const nr = (i: number) => ({ "--i": i }) as CSSProperties;
