import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { adresszeile, erreichbarkeitText, firma, offen } from "@/daten/firma";
import { ablaufDauerHinweis, leistungen, leistungNachId, type Leistung } from "@/daten/leistungen";
import { kernort, muenchenWest, orte, umkreis } from "@/daten/orte";
import { googleBewertungen, type Bewertung } from "@/daten/bewertungen";
import { teamgroesse } from "@/daten/team";
import { zielgruppen } from "@/daten/zielgruppen";
import { Anfrageformular } from "./Anfrageformular";
import { Fliesstext, Offen, teile } from "./Fliesstext";
import { nr } from "./Geruest";
import { Bewertungskarte } from "./Karten";
import { Kippschalter, Sterne, Zeichen, type ZeichenArt } from "./Zeichen";

/* ------------------------------------------------------------------ Vertrauensleiste */

/**
 * Vertrauensleiste (Design.md, 9.4): fünf Angaben, je Schaltzeichen, Zahl oder Wort groß, Erklärung klein.
 * Zahlen zählen mit Skript einmal hoch. Im Quelltext steht immer der Endwert.
 */
export function Vertrauensleiste() {
  const angaben: { zeichen: ZeichenArt; wert: ReactNode; text: string }[] = [
    { zeichen: "siegel", wert: "Meisterbetrieb", text: "Geführt von einem Elektromeister" },
    {
      zeichen: "uhr",
      wert: (
        <>
          seit <span data-zaehler={firma.gegruendet}>{firma.gegruendet}</span>
        </>
      ),
      text: `Gegründet in Germering, GmbH seit ${firma.gmbhSeit}`,
    },
    { zeichen: "pokal", wert: firma.auszeichnungen[0].kurz, text: "Markenpreis der Elektrobranche" },
    {
      zeichen: "stern",
      wert: (
        <>
          {firma.google.noteAnzeige} von 5
        </>
      ),
      text: `bei Google aus ${firma.google.anzahl} Bewertungen`,
    },
    {
      zeichen: "team",
      wert: (
        <>
          <span data-zaehler={teamgroesse}>{teamgroesse}</span> im Team
        </>
      ),
      text: "Meister, Monteure und Auszubildende",
    },
  ];
  return (
    <ul className="vertrauen" data-reihe aria-label="Auf einen Blick">
      {angaben.map((a, i) => (
        <li key={a.text} style={nr(i)}>
          <Zeichen name={a.zeichen} zeichnet />
          <span className="vertrauen__wert">{a.wert}</span>
          <span className="vertrauen__text">{a.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ Sicherungsreihe */

/**
 * Die Sicherungsreihe (Design.md, 8.3 und 9.5): neun Leistungen wie neun Sicherungsautomaten im Verteiler.
 * Laptop und größer: neun senkrechte Streifen. Maus oder Tastaturfokus kippt den Schalter, der Streifen
 * wird breit, dahinter geht das Foto an. Handy und Tablet: neun Zeilen, Antippen klappt auf.
 *
 * Alle Namen, Texte und Links stehen als echter Text im Quelltext, auch im geschlossenen Zustand.
 */
export function Sicherungsreihe() {
  return (
    <div className="reihe-huelle" data-erscheint data-sicherungsreihe data-zeiger="schalter">
      <div className="sammelschiene" aria-hidden="true">
        <span className="sammelschiene__strom" />
      </div>
      <ul className="sicherungsreihe">
        {leistungen.map((l, i) => (
          <li
            key={l.id}
            className="sicherung"
            data-offen={i === 0 ? "true" : "false"}
            style={{ "--i": i, "--bildlage": l.reihenBildLage } as CSSProperties}
          >
            <span className="sicherung__ader" aria-hidden="true" />
            <div className="sicherung__flaeche">
              <div className="sicherung__bild">
                <Image src={l.reihenBild} alt={l.reihenBildAlt} sizes="(min-width: 1024px) 540px, 100vw" />
              </div>
            </div>
            <Zeichen name={l.zeichen} className="sicherung__zeichen" />
            <h3 className="sicherung__name">{l.name}</h3>
            <button
              type="button"
              className="sicherung__schalter"
              aria-expanded={i === 0}
              aria-controls={`sicherung-${l.id}`}
            >
              <Kippschalter />
              <span className="nur-vorlesen">{l.name} aufklappen</span>
            </button>
            <div className="sicherung__inhalt" id={`sicherung-${l.id}`}>
              <div className="sicherung__inhalt-innen">
                <p>{l.kurztext}</p>
                <Link className="textlink" href={l.pfad}>
                  Mehr zu {l.name}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ Für wen wir arbeiten */

export function Zielgruppen() {
  return (
    <div className="zielgruppen" data-reihe>
      {zielgruppen.map((z, i) => (
        <article className="zielgruppe" key={z.id} style={nr(i)} data-neigt>
          <div className="bildrahmen licht" data-licht>
            <Image src={z.bild} alt={z.bildAlt} sizes="(min-width: 900px) 33vw, 100vw" />
          </div>
          <div className="zielgruppe__inhalt">
            <h3>{z.titel}</h3>
            <p>{z.satz}</p>
            <ul className="zielgruppe__aufgaben">
              {z.aufgaben.map((a, k) => (
                <li key={a.text} style={nr(k)}>
                  <Link href={leistungNachId(a.leistung).pfad}>
                    <Zeichen name="haken" />
                    <span>{a.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Bewertungen */

const standDatum = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" });

/** Gesamtnote bei Google als große Zahl mit Link zum Profil. */
export function Gesamtnote() {
  return (
    <div className="gesamtnote">
      <p className="gesamtnote__zahl" aria-hidden="true">
        {firma.google.noteAnzeige}
      </p>
      <div className="gesamtnote__rest">
        <Sterne wert={firma.google.note} text={`${firma.google.noteAnzeige} von 5 Sternen bei Google`} />
        <p>
          <strong>{firma.google.anzahl} Bewertungen bei Google</strong>
          <span className="klein"> (Stand {standDatum.format(new Date(firma.google.stand))})</span>
        </p>
        <p>
          <a className="textlink" href={firma.google.profil} rel="noopener" target="_blank">
            Bewertungen bei Google ansehen
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Bewertungen (Design.md, 8.8 und 9.9).
 * Als Laufband zieht die Reihe langsam nach links und hält bei Maus, Fokus oder Berührung an.
 * Ohne Skript und bei reduzierter Bewegung ist sie eine Reihe zum Blättern.
 */
export function Bewertungsreihe({ liste, laufband = true }: { liste: Bewertung[]; laufband?: boolean }) {
  const hinweise = (
    <p className="klein" style={{ display: "grid", gap: "var(--a-2)", justifyItems: "start" }}>
      {liste.some((b) => b.sinngemaess) ? (
        <Offen>Originalwortlaut der Kundenstimmen. Sie stehen hier sinngemäß</Offen>
      ) : null}
      {googleBewertungen.length === 0 ? <Offen>Google-Bewertungen im Wortlaut eintragen</Offen> : null}
    </p>
  );

  if (!laufband) {
    return (
      <>
        <div className="kartenraster" data-reihe>
          {liste.map((b) => (
            <Bewertungskarte bewertung={b} key={b.id} />
          ))}
        </div>
        <div style={{ marginTop: "var(--a-5)" }}>{hinweise}</div>
      </>
    );
  }

  return (
    <div className="laufband" data-laufband>
      <div className="laufband__bahn" tabIndex={0} role="group" aria-label="Kundenstimmen, seitlich blätterbar">
        {liste.map((b) => (
          <Bewertungskarte bewertung={b} key={b.id} />
        ))}
      </div>
      <div className="rahmen" style={{ display: "flex", flexWrap: "wrap", gap: "var(--a-5)", justifyContent: "space-between", alignItems: "center" }}>
        {hinweise}
        <div className="laufband__pfeile">
          <button type="button" className="rundknopf rundknopf--zurueck" data-laufband-zurueck aria-label="Vorherige Kundenstimme">
            <Zeichen name="pfeil" />
          </button>
          <button type="button" className="rundknopf" data-laufband-vor aria-label="Nächste Kundenstimme">
            <Zeichen name="pfeil" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Ablauf */

/**
 * Ablauf (Design.md, 9.10 und 8.8): große Ziffern, verbunden durch die Leitung.
 * Jeder Knoten zündet, wenn die Leitung ihn erreicht. Hier ist die Nummerierung echte Reihenfolge.
 */
export function Ablauf({
  schritte,
  dauerHinweis = true,
}: {
  schritte: { titel: string; text: string; dauer?: string }[];
  dauerHinweis?: boolean;
}) {
  return (
    <div className="ablauf" data-ablauf style={{ "--schritte": schritte.length } as CSSProperties}>
      <div className="ablauf__bahn" aria-hidden="true">
        <span className="ablauf__strom" />
      </div>
      <ol className="ablauf__liste">
        {schritte.map((s, i) => (
          <li className="ablauf__schritt" key={s.titel}>
            <span className="ablauf__knoten knoten" aria-hidden="true" />
            <span className="ablauf__ziffer" aria-hidden="true">
              {i + 1}
            </span>
            <h3>
              <span className="nur-vorlesen">Schritt {i + 1}: </span>
              {s.titel}
            </h3>
            <p>{s.text}</p>
            {s.dauer ? <p className="klein">{s.dauer}</p> : null}
          </li>
        ))}
      </ol>
      {dauerHinweis && schritte.every((s) => !s.dauer) ? (
        <p className="klein ablauf__hinweis">
          <Offen>{ablaufDauerHinweis}</Offen>
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Häufige Fragen */

/** Häufige Fragen (Design.md, 9.11): aufklappbare Elemente, ohne Skript lesbar. */
export function Fragen({ fragen }: { fragen: { frage: string; antwort: string }[] }) {
  return (
    <div className="fragen">
      {fragen.map((f) => (
        <details className="frage" key={f.frage}>
          <summary>
            <h3 className="frage__titel">{f.frage}</h3>
            <span className="frage__plus" aria-hidden="true" />
          </summary>
          <div className="frage__antwort">
            <Fliesstext text={f.antwort} />
          </div>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Einzugsgebiet */

const zahl = (n: number) => Number(n.toFixed(2));

/**
 * Einzugsgebiet (Design.md, 8.8): Germering als gefüllter Knoten, Orte als hohle Knoten.
 * Linien laufen beim Erscheinen von Germering nach außen. Schematisch, nicht maßstäblich.
 */
export function Gebiet() {
  return (
    <div className="gebiet">
      <figure className="gebietskarte" data-erscheint aria-label="Schematische Karte des Einzugsgebiets">
        <ul>
          {orte.map((o, i) => {
            const dx = kernort.x - o.x;
            const dy = kernort.y - o.y;
            const laenge = Math.hypot(dx, dy);
            const winkel = (Math.atan2(-dy, -dx) * 180) / Math.PI;
            return (
              <li
                key={o.name}
                className={`ort${o.bereich === "kern" ? " ort--kern" : ""}`}
                data-seite={o.beschriftung}
                style={
                  {
                    "--x": o.x,
                    "--y": o.y,
                    "--dx": zahl(dx),
                    "--dy": zahl(dy),
                    "--d": zahl(laenge),
                    "--w": `${zahl(winkel)}deg`,
                    "--i": i,
                  } as CSSProperties
                }
              >
                {o.bereich === "kern" ? null : <span className="ort__strahl" aria-hidden="true" />}
                <span className="ort__punkt" aria-hidden="true" />
                <span className="ort__name">{o.name}</span>
              </li>
            );
          })}
        </ul>
      </figure>

      <div className="gebiet__listen">
        <div>
          <h3>Rund um Germering</h3>
          <ul className="ortsliste">
            {umkreis.map((o) => (
              <li className="marke" key={o.name}>
                {o.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Münchner Westen</h3>
          <ul className="ortsliste">
            {muenchenWest.map((o) => (
              <li className="marke" key={o.name}>
                {o.name}
              </li>
            ))}
          </ul>
          <p className="klein" style={{ marginTop: "var(--a-3)" }}>
            Auf Anfrage arbeiten wir im ganzen Münchner Stadtgebiet.
          </p>
        </div>
        <p className="klein">
          <Offen>Einzugsgebiet von Mat bestätigen lassen</Offen>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Anfrage */

/**
 * Stecker vor Steckdose: das Ende der Leitung (Design.md, 8.1).
 * Nach dem Absenden fährt der Stecker hinein, die Dose leuchtet, darunter steht "Verbunden. Wir melden uns."
 */
export function Verbindung({ verbunden = false }: { verbunden?: boolean }) {
  return (
    <div className="verbindung" data-erscheint data-verbunden={verbunden ? "true" : undefined} aria-hidden={verbunden ? undefined : "true"}>
      <div className="verbindung__bild" aria-hidden="true">
        <span className="verbindung__schein" />
        <svg className="verbindung__dose" viewBox="0 0 132 92">
          <path d="M30 14a36 36 0 0 0 72 0" />
          <path d="M52 50h28" />
          <path d="M66 50v30" />
          <path d="M48 80h36" />
        </svg>
        <svg className="verbindung__stecker" viewBox="0 0 132 96">
          <path d="M66 -64V22" />
          <path d="M42 32a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10z" />
          <path d="M54 62v24" />
          <path d="M78 62v24" />
        </svg>
      </div>
      <p className="verbindung__text" hidden={!verbunden}>
        Verbunden. Wir melden uns.
      </p>
    </div>
  );
}

/** Direkter Kontakt neben dem Formular: Telefon, Erreichbarkeit, E-Mail. */
export function Direktkontakt() {
  return (
    <div className="stapel">
      <h3>Lieber gleich sprechen?</h3>
      <p>
        <a className="telefon-gross" href={firma.telefon.href}>
          <Zeichen name="telefon" />
          {firma.telefon.anzeige}
        </a>
      </p>
      <ul className="kontaktliste">
        <li>
          <span>
            <Zeichen name="uhr" />
            <span>{teile(erreichbarkeitText)}</span>
          </span>
        </li>
        <li>
          <a href={`mailto:${firma.email}`}>
            <Zeichen name="brief" />
            {firma.email}
          </a>
        </li>
        <li>
          <a href={firma.routenplaner} rel="noopener" target="_blank">
            <Zeichen name="ort" />
            {adresszeile}
          </a>
        </li>
      </ul>
    </div>
  );
}

/**
 * Anfrage-Abschnitt (Design.md, 9.12): links das Formular, rechts Telefon, Erreichbarkeit
 * und die Steckdose mit schwebendem Stecker. Hier endet die Leitung.
 */
export function Anfrage({
  titel,
  text,
  vorauswahl,
  kurz,
}: {
  titel: string;
  text?: ReactNode;
  vorauswahl?: Leistung["id"];
  kurz?: boolean;
}) {
  return (
    <section className="abschnitt anfrage anfrage--mit-leitung" id="anfrage">
      <div className="endstueck" data-erscheint aria-hidden="true">
        <span className="endstueck__weg" />
        <span className="endstueck__bogen" />
      </div>
      <div className="rahmen anfrage__raster">
        <div>
          <header className="abschnitt__kopf" data-erscheint-kopf>
            <h2 data-zeilen>{titel}</h2>
            {text ? <p className="vorspann">{text}</p> : null}
          </header>
          <Anfrageformular
            auswahl={leistungen.map((l) => ({ id: l.id, name: l.name }))}
            vorauswahl={vorauswahl}
            kurz={kurz}
          />
        </div>
        <aside className="anfrage__seite" aria-label="Direkter Kontakt">
          <Verbindung />
          <Direktkontakt />
          <p className="klein">
            <Offen>{`übliche Rückmeldezeit auf Anfragen`}</Offen>
          </p>
        </aside>
      </div>
    </section>
  );
}

export { offen };
