"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { karte as kartendaten } from "@/daten/karte";
import type { Kartenbild, Kartengrundlage } from "@/lib/kartenbild";
import type { Strecke } from "@/lib/kartennetz";
import type { Suche, Treffer } from "@/lib/kartensuche";
import { Zeichen } from "./Zeichen";

export interface KartenOrt {
  name: string;
  bereich: "kern" | "umkreis" | "muenchen";
  lon: number;
  lat: number;
}

interface Ergebnis {
  name: string;
  /** Ort der Straße. Leer, wenn das Ziel selbst ein Ort ist. */
  ort: string;
  minuten: number;
  km: number;
}

const kmText = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const standText = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });

/**
 * Karte des Einzugsgebiets mit Fahrzeit ab Betrieb (Design.md, 8.8: "Beim Einzugsgebiet läuft die Leitung von Germering zu den Orten").
 *
 * - Die Karte ist eine eigene Karte aus Daten von OpenStreetMap. Sie lädt nichts von fremden Servern.
 * - Ein Ort aus der Liste oder eine eingegebene Straße wird zum Ziel: Die rote Leitung läuft vom Betrieb dorthin,
 *   daneben stehen Fahrzeit und Entfernung. Gerechnet wird im Browser, die Eingabe verlässt das Gerät nicht.
 * - Karte und Daten laden erst, wenn der Abschnitt ins Bild kommt. Bis dahin und ohne Skript steht ein Standbild da.
 * - Die Ortslisten stehen als Text im Quelltext.
 */
export function Gebietskarte({
  orte,
  firma,
  standbild,
  children,
}: {
  orte: KartenOrt[];
  firma: { name: string; strasse: string; lon: number; lat: number };
  /** Standbild der Karte: Platzhalter, bis die Karte geladen ist, und Ersatz ohne Skript. */
  standbild?: { bild: StaticImageData; alt: string };
  /** Hinweise unter den Ortslisten */
  children?: React.ReactNode;
}) {
  const feldId = useId();
  const listeId = useId();
  const rahmen = useRef<HTMLElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  const feld = useRef<HTMLInputElement>(null);

  /** "ruht": noch nichts geladen. "laedt". "bereit": Suche und Fahrzeit gehen. "fehler": Daten fehlen. */
  const [zustand, setZustand] = useState<"ruht" | "laedt" | "bereit" | "fehler">("ruht");
  const [mitKarte, setMitKarte] = useState(false);
  // Auf dem Server und beim ersten Aufbau im Browser false, danach true: Erst dann werden die Orte zu Knöpfen.
  const montiert = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [eingabe, setEingabe] = useState("");
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const [ergebnis, setErgebnis] = useState<Ergebnis | "kein-weg" | null>(null);
  /** Die Suche im Straßenverzeichnis, sobald es geladen ist */
  const [suche, setSuche] = useState<Suche | null>(null);

  const grundlage = useRef<Kartengrundlage | null>(null);
  const bild = useRef<Kartenbild | null>(null);
  const laden = useRef<Promise<boolean> | null>(null);
  const berechne = useRef<((ziel: number) => Strecke | null) | null>(null);
  const waehleOrt = useRef<(name: string) => void>(() => {});

  /** Lädt Daten und Karte, höchstens einmal. Liefert false, wenn die Daten fehlen. */
  const lade = useCallback((): Promise<boolean> => {
    if (laden.current) return laden.current;
    setZustand("laedt");
    laden.current = (async () => {
      try {
        const [kartenbild, kartensuche, kartennetz] = await Promise.all([import("@/lib/kartenbild"), import("@/lib/kartensuche"), import("@/lib/kartennetz")]);
        const kartenorte = orte.map((o) => ({ name: o.name, lon: o.lon, lat: o.lat, kern: o.bereich === "kern" }));
        const g = await kartenbild.ladeKartengrundlage(firma, kartenorte);
        grundlage.current = g;
        const sucheImVerzeichnis = kartensuche.bereiteSucheVor(g.verzeichnis, g.ortsziele, orte.find((o) => o.bereich === "kern")?.name ?? "");
        setSuche(() => sucheImVerzeichnis);
        berechne.current = (ziel) => kartennetz.schnellsteStrecke(g.netz, g.start, ziel);
        setZustand("bereit");

        // Die Karte selbst ist eine Zugabe: Ohne sie (kein WebGL) gehen Suche und Fahrzeit trotzdem.
        if (flaeche.current) {
          try {
            bild.current = await kartenbild.zeichneKarte(flaeche.current, {
              grundlage: g,
              orte: kartenorte,
              firma,
              dunkel: document.documentElement.dataset.licht === "aus",
              ruhig: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
              beiOrt: (name) => waehleOrt.current(name),
            });
            setMitKarte(true);
          } catch (fehler) {
            console.warn("Karte ohne Kartenbild:", fehler);
          }
        }
        return true;
      } catch (fehler) {
        console.warn("Kartendaten nicht geladen:", fehler);
        setZustand("fehler");
        return false;
      }
    })();
    return laden.current;
  }, [firma, orte]);

  /** Ziel setzen: Strecke rechnen, zeichnen, Ergebnis zeigen. */
  const waehle = useCallback(
    async (ziel: Treffer) => {
      setOffen(false);
      setEingabe(ziel.ort ? `${ziel.name}, ${ziel.ort}` : ziel.name);
      if (!(await lade()) || !berechne.current) return;
      const strecke = berechne.current(ziel.kreuzung);
      if (!strecke) {
        setErgebnis("kein-weg");
        return;
      }
      const minuten = Math.max(1, Math.round(strecke.sekunden / 60));
      setErgebnis({ name: ziel.name, ort: ziel.ort, minuten, km: strecke.meter / 1000 });
      bild.current?.zeige(strecke, { name: ziel.name, minuten, ort: ziel.ort });

      // Am Handy liegt die Karte über der Liste: ins Bild holen, wenn sie kaum zu sehen ist.
      const lage = rahmen.current?.getBoundingClientRect();
      if (lage && (lage.top < 0 || lage.bottom > window.innerHeight)) {
        rahmen.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    },
    [lade],
  );

  useEffect(() => {
    waehleOrt.current = (name) => {
      const kreuzung = grundlage.current?.ortsziele.find((o) => o.name === name)?.kreuzung;
      if (kreuzung !== undefined) void waehle({ name, ort: "", kreuzung });
    };
  }, [waehle]);

  const leere = useCallback(() => {
    setErgebnis(null);
    setEingabe("");
    setOffen(false);
    bild.current?.leere();
  }, []);

  // Laden, sobald der Abschnitt in die Nähe des Bildschirms kommt. Im Sparmodus erst bei der ersten Bedienung.
  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const sparen = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const waechter = new IntersectionObserver(
      (eintraege) => {
        if (!eintraege.some((e) => e.isIntersecting)) return;
        waechter.disconnect();
        if (!sparen) void lade();
      },
      { rootMargin: "600px 0px" },
    );
    waechter.observe(el);

    // "Licht aus" schaltet auch die Karte um
    const licht = new MutationObserver(() => bild.current?.setzeLicht(document.documentElement.dataset.licht === "aus"));
    licht.observe(document.documentElement, { attributes: true, attributeFilter: ["data-licht"] });

    return () => {
      waechter.disconnect();
      licht.disconnect();
      bild.current?.entferne();
      bild.current = null;
      grundlage.current = null;
      setSuche(null);
      berechne.current = null;
      laden.current = null;
      setMitKarte(false);
      setZustand("ruht");
      setErgebnis(null);
    };
  }, [lade]);

  const treffer = useMemo(() => (suche && eingabe.trim().length >= 2 ? suche(eingabe) : []), [eingabe, suche]);
  const listeOffen = offen && eingabe.trim().length >= 2 && zustand !== "ruht";

  const tippe = (wert: string) => {
    setEingabe(wert);
    setAktiv(0);
    setOffen(true);
    void lade();
  };

  const taste = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (treffer.length === 0) return;
      e.preventDefault();
      setOffen(true);
      setAktiv((a) => (a + (e.key === "ArrowDown" ? 1 : treffer.length - 1)) % treffer.length);
    } else if (e.key === "Escape") {
      if (listeOffen) {
        e.preventDefault();
        setOffen(false);
      }
    }
  };

  const absenden = (e: FormEvent) => {
    e.preventDefault();
    const ziel = treffer[Math.min(aktiv, treffer.length - 1)];
    if (ziel) void waehle(ziel);
  };

  const gewaehlt = ergebnis && ergebnis !== "kein-weg" && !ergebnis.ort ? ergebnis.name : null;
  const gruppen: { titel: string; orte: KartenOrt[] }[] = [
    { titel: "Rund um Germering", orte: orte.filter((o) => o.bereich === "umkreis") },
    { titel: "Münchner Westen", orte: orte.filter((o) => o.bereich === "muenchen") },
  ];

  return (
    <div className="gebiet" data-zustand={zustand} data-mit-karte={mitKarte ? "ja" : undefined}>
      <div className="gebiet__suche">
        <h3>Wie weit ist es zu Ihnen?</h3>
        <form className="kartensuche" role="search" onSubmit={absenden}>
          <label htmlFor={feldId}>Ihre Straße oder Ihr Ort</label>
          <div className="kartensuche__feld">
            <Zeichen name="lupe" />
            <input
              ref={feld}
              id={feldId}
              type="text"
              role="combobox"
              aria-expanded={listeOffen}
              aria-controls={listeId}
              aria-autocomplete="list"
              aria-activedescendant={listeOffen && treffer.length ? `${listeId}-${aktiv}` : undefined}
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="search"
              placeholder="z. B. Hartstraße, Germering"
              value={eingabe}
              onChange={(e) => tippe(e.target.value)}
              onFocus={(e) => {
                // Steht schon ein Ziel im Feld, ersetzt die nächste Eingabe es ganz
                if (ergebnis) e.target.select();
                setOffen(true);
                void lade();
              }}
              onBlur={() => setOffen(false)}
              onKeyDown={taste}
            />
            {eingabe ? (
              <button type="button" className="kartensuche__leeren" aria-label="Eingabe löschen" onClick={() => {
                leere();
                feld.current?.focus();
              }}>
                <Zeichen name="kreuz" />
              </button>
            ) : null}
          </div>
          <ul className="kartensuche__liste" id={listeId} role="listbox" aria-label="Vorschläge" hidden={!listeOffen}>
            {treffer.map((t, i) => (
              <li
                key={`${t.name}|${t.ort}`}
                id={`${listeId}-${i}`}
                role="option"
                aria-selected={i === aktiv}
                // Vor dem Verlassen des Felds auslösen, sonst schließt sich die Liste vor dem Klick
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => void waehle(t)}
                onPointerEnter={() => setAktiv(i)}
              >
                <Zeichen name="ort" groesse="klein" />
                <span>
                  <strong>{t.name}</strong>
                  {t.ort ? <span className="kartensuche__ort">{t.ort}</span> : <span className="kartensuche__ort">Ort</span>}
                </span>
              </li>
            ))}
            {treffer.length === 0 ? (
              <li className="kartensuche__leer" role="presentation">
                {zustand === "laedt"
                  ? "Die Karte lädt …"
                  : zustand === "fehler"
                    ? "Die Karte lässt sich gerade nicht laden."
                    : "Keine Straße gefunden. Die Karte kennt Germering, den Umkreis und den Münchner Westen."}
              </li>
            ) : null}
          </ul>
        </form>
      </div>

      <figure className="landkarte" ref={rahmen} aria-label="Karte des Einzugsgebiets">
        {standbild ? (
          // Sobald die echte Karte steht, liegt sie darüber. Vorleseprogramme hören dann nur noch die Karte.
          <Image
            className="landkarte__standbild"
            src={standbild.bild}
            alt={mitKarte ? "" : standbild.alt}
            aria-hidden={mitKarte || undefined}
            sizes="(min-width: 900px) 720px, 100vw"
          />
        ) : null}
        <div className="landkarte__flaeche" ref={flaeche} />
        <div className="landkarte__knoepfe">
          <button type="button" className="kartenknopf" aria-label="Karte vergrößern" disabled={!mitKarte} onClick={() => bild.current?.zoome(1)}>
            <Zeichen name="plus" />
          </button>
          <button type="button" className="kartenknopf" aria-label="Karte verkleinern" disabled={!mitKarte} onClick={() => bild.current?.zoome(-1)}>
            <Zeichen name="minus" />
          </button>
        </div>
        <figcaption className="landkarte__quelle">
          <a href="https://www.openstreetmap.org/copyright" rel="noopener" target="_blank">
            © OpenStreetMap
          </a>
        </figcaption>
      </figure>

      <div className="kartenergebnis" aria-live="polite">
        {ergebnis === null ? (
          <p className="kartenergebnis__hinweis">
            Wählen Sie einen Ort oder geben Sie Ihre Straße ein. Die Karte zeigt den Weg von unserem Betrieb zu Ihnen.
          </p>
        ) : ergebnis === "kein-weg" ? (
          <p className="kartenergebnis__hinweis">Zu diesem Ziel hat die Karte keine Strecke gefunden.</p>
        ) : (
          <>
            <p className="kartenergebnis__weg">
              Von uns in der {firma.strasse} nach <strong>{ergebnis.ort ? `${ergebnis.name}, ${ergebnis.ort}` : ergebnis.name}</strong>
            </p>
            <p className="kartenergebnis__zeit">
              <span>etwa</span>
              <span className="kartenergebnis__zahl">{ergebnis.minuten}</span>
              <span>
                {ergebnis.minuten === 1 ? "Minute" : "Minuten"} Fahrzeit
                <span className="kartenergebnis__km">{kmText.format(ergebnis.km)} km</span>
              </span>
            </p>
            <p className="klein">
              Reine Fahrzeit mit dem Auto ohne Verkehr, berechnet aus Straßendaten von OpenStreetMap (Stand {standText.format(new Date(kartendaten.stand))}).
              {ergebnis.ort ? " Gerechnet bis zur Mitte der Straße." : ""}
            </p>
            <p>
              <button type="button" className="textknopf" onClick={leere}>
                Auswahl aufheben
              </button>
            </p>
          </>
        )}
      </div>

      <div className="gebiet__listen">
        {gruppen.map((g) => (
          <div key={g.titel}>
            <h3>{g.titel}</h3>
            <ul className="ortsliste">
              {g.orte.map((o) =>
                montiert ? (
                  <li key={o.name}>
                    <button
                      type="button"
                      className="marke marke--filter"
                      aria-pressed={gewaehlt === o.name}
                      onClick={async () => {
                        if (gewaehlt === o.name) return leere();
                        if (!(await lade())) return;
                        waehleOrt.current(o.name);
                      }}
                    >
                      {o.name}
                    </button>
                  </li>
                ) : (
                  // Ohne Skript sind die Orte schlichter Text
                  <li className="marke" key={o.name}>
                    {o.name}
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}
