"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { LeistungId } from "@/daten/adressen";
import type { ZeichenName } from "@/daten/leistungen";
import type { Hausszene } from "@/lib/haus3d/szene";
import { Zeichen } from "./Zeichen";

export interface Hauspunkt {
  id: LeistungId;
  name: string;
  /** Zwei Zeilen zur Leistung */
  kurz: string;
  /** Ort im Haus */
  ort: string;
  pfad: string;
  zeichen: ZeichenName;
}

const TASTFRAGE = "(hover: none) and (pointer: coarse)";
const horcheTasten = (melde: () => void) => {
  const frage = window.matchMedia(TASTFRAGE);
  frage.addEventListener("change", melde);
  return () => frage.removeEventListener("change", melde);
};

/**
 * 3D-Haus (Informationsarchitektur.md, Abschnitt 9; Design.md, Abschnitt 11).
 *
 * - Das Haus lässt sich frei drehen, kippen und zoomen. Wer nah heranfährt, geht durch die Türen hinein.
 * - Neun Punkte im Haus und dieselben neun Knöpfe darunter wählen eine Leistung: Die Kamera fährt hin,
 *   die Leitung leuchtet vom Zählerschrank bis dorthin, eine Tafel nennt Name, zwei Zeilen und den Link.
 * - Die Szene lädt erst, wenn die Bühne ins Bild kommt, am Handy erst auf Knopfdruck. Bis dahin und ohne Skript
 *   steht ein Standbild da. Alle Texte und Links stehen zusätzlich als normaler Seiteninhalt unter der Bühne.
 */
export function Haus3D({ punkte, standbild, children }: { punkte: Hauspunkt[]; standbild?: { bild: StaticImageData; alt: string }; children?: ReactNode }) {
  const router = useRouter();
  const rahmen = useRef<HTMLElement>(null);
  const buehne = useRef<HTMLDivElement>(null);
  const leiste = useRef<HTMLDivElement>(null);
  const unten = useRef<HTMLDivElement>(null);
  const knoten = useRef<(HTMLButtonElement | null)[]>([]);
  /** Liegt für das geöffnete Haus ein eigener Eintrag im Verlauf? Dann schließt auch die Zurück-Taste. */
  const eintrag = useRef(false);
  /** Ist der Baustein schon wieder abgebaut? Dann darf eine noch ladende Szene nicht mehr starten. */
  const abgebaut = useRef(false);
  const szene = useRef<Hausszene | null>(null);
  const laden = useRef<Promise<boolean> | null>(null);
  const aktivJetzt = useRef<LeistungId | null>(null);

  /** "ruht": nichts geladen. "laedt". "bereit": Die Szene läuft. "fehler": kein 3D auf diesem Gerät. */
  const [zustand, setZustand] = useState<"ruht" | "laedt" | "bereit" | "fehler">("ruht");
  const [aktiv, setAktiv] = useState<LeistungId | null>(null);
  /** Am Handy läuft das Haus bildschirmfüllend, damit Wischen das Haus bewegt und nicht die Seite */
  const [offen, setOffen] = useState(false);
  const [bedient, setBedient] = useState(false);
  const [nah, setNah] = useState(false);
  const tasten = useSyncExternalStore(
    horcheTasten,
    () => window.matchMedia(TASTFRAGE).matches,
    () => false,
  );

  const waehle = useCallback((id: LeistungId | null) => {
    aktivJetzt.current = id;
    setAktiv(id);
    szene.current?.waehle(id);
  }, []);

  /** Lädt die Szene, höchstens einmal. */
  const lade = useCallback((): Promise<boolean> => {
    if (laden.current) return laden.current;
    setZustand("laedt");
    laden.current = (async () => {
      try {
        const { starteSzene } = await import("@/lib/haus3d/szene");
        if (!buehne.current || abgebaut.current) return false;
        const neu = await starteSzene({
          buehne: buehne.current,
          ruhig: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          frei: () => {
            const b = buehne.current?.clientWidth ?? 0;
            // Am Rechner liegt links der Text über der Bühne, unten die Auswahl. Am Handy unten Tafel und Auswahl.
            if (b >= 1024) return { links: Math.min(b * 0.36, 560), rechts: 24, oben: 24, unten: (leiste.current?.offsetHeight ?? 0) + 8 };
            return { links: 0, rechts: 0, oben: 56, unten: (unten.current?.offsetHeight ?? 0) + 8 };
          },
          beiWahl: (id) => {
            // Zweiter Klick auf dieselbe Leistung im Haus führt zur Leistungsseite. Am Handy nur über den Link der Tafel.
            if (id && id === aktivJetzt.current) {
              if (window.matchMedia(TASTFRAGE).matches) return;
              const ziel = punkte.find((p) => p.id === id);
              if (ziel) router.push(ziel.pfad);
              return;
            }
            aktivJetzt.current = id;
            setAktiv(id);
            szene.current?.waehle(id);
          },
          beiPunkten: (lagen) => {
            for (let i = 0; i < lagen.length; i++) {
              const el = knoten.current[i];
              if (!el) continue;
              const l = lagen[i];
              el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
              el.style.visibility = l.sichtbar ? "visible" : "hidden";
            }
          },
          beiEingabe: () => setBedient(true),
          beiNaehe: setNah,
          beiAusfall: (aus) => setZustand(aus ? "laedt" : "bereit"),
        });
        if (abgebaut.current) {
          neu.entferne();
          return false;
        }
        szene.current = neu;
        if (aktivJetzt.current) neu.waehle(aktivJetzt.current);
        if (process.env.NODE_ENV !== "production") (window as unknown as { __haus3d?: Hausszene }).__haus3d = neu;
        setZustand("bereit");
        return true;
      } catch (fehler) {
        console.warn("3D-Haus nicht gestartet:", fehler);
        setZustand("fehler");
        return false;
      }
    })();
    return laden.current;
  }, [punkte, router]);

  // Am Rechner: laden, sobald die Bühne ins Bild kommt und die Seite steht
  useEffect(() => {
    if (tasten || !rahmen.current) return;
    let warten = 0;
    const sicht = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        sicht.disconnect();
        warten = window.setTimeout(() => void lade(), 350);
      },
      { rootMargin: "200px" },
    );
    sicht.observe(rahmen.current);
    return () => {
      sicht.disconnect();
      window.clearTimeout(warten);
    };
  }, [tasten, lade]);

  // Beim Verlassen der Seite alles freigeben
  useEffect(() => {
    abgebaut.current = false;
    return () => {
      abgebaut.current = true;
      szene.current?.entferne();
      szene.current = null;
      laden.current = null;
    };
  }, []);

  const schliesse = useCallback(() => {
    // Der eigene Eintrag im Verlauf geht mit zurück. Das Schließen selbst erledigt dann "popstate".
    if (eintrag.current) window.history.back();
    else setOffen(false);
  }, []);

  // Bildschirmfüllend am Handy: Die Seite dahinter scrollt nicht mit. Escape und die Zurück-Taste schließen.
  useEffect(() => {
    if (!offen) return;
    const vorher = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") schliesse();
    };
    const zurueck = () => {
      eintrag.current = false;
      setOffen(false);
    };
    window.addEventListener("keydown", taste);
    window.addEventListener("popstate", zurueck);
    return () => {
      document.documentElement.style.overflow = vorher;
      window.removeEventListener("keydown", taste);
      window.removeEventListener("popstate", zurueck);
    };
  }, [offen, schliesse]);

  // Tafel und Vollbild ändern den freien Platz der Bühne: Das Haus rückt nach
  useEffect(() => {
    const dran = requestAnimationFrame(() => szene.current?.passeAn());
    return () => cancelAnimationFrame(dran);
  }, [aktiv, offen, zustand]);

  const starte = () => {
    setOffen(true);
    window.history.pushState(null, "", window.location.href);
    eintrag.current = true;
    void lade();
  };

  const gewaehlt = punkte.find((p) => p.id === aktiv) ?? null;
  const nummer = gewaehlt ? punkte.indexOf(gewaehlt) : -1;
  const laeuft = zustand === "bereit";

  return (
    <section className="haus3d dunkel" ref={rahmen} data-zustand={zustand} data-offen={offen ? "" : undefined} data-tasten={tasten ? "" : undefined} data-nah={nah || aktiv ? "" : undefined} aria-label="Das Haus in 3D mit neun Leistungen">
      <div className="haus3d__kopf rahmen">{children}</div>

      {/* Der äußere Kasten hält den Platz in der Seite. Der innere füllt ihn und am Handy, geöffnet, den ganzen Bildschirm. */}
      <div className="haus3d__spiel">
        <div className="haus3d__voll">
        <div className="haus3d__buehne" ref={buehne}>
          {standbild ? (
            <Image className="haus3d__standbild" src={standbild.bild} alt={standbild.alt} sizes="(min-width: 1024px) 60vw, 100vw" loading="eager" fetchPriority="high" />
          ) : null}
          {/* Die neun Punkte im Haus. Für Tastatur und Vorleseprogramme gibt es dieselbe Auswahl als Knöpfe darunter. */}
          <div className="haus3d__punkte" aria-hidden="true">
            {punkte.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="haus3d__punkt"
                tabIndex={-1}
                data-aktiv={p.id === aktiv ? "" : undefined}
                ref={(el) => {
                  knoten.current[i] = el;
                }}
                onClick={() => (p.id === aktiv && !tasten ? router.push(p.pfad) : waehle(p.id))}
              >
                <Zeichen name={p.zeichen} />
                <span className="haus3d__punktname">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="haus3d__unten" ref={unten}>
        {/* Tafel zum Punkt: Name, zwei Zeilen, Link */}
        <div className="haus3d__tafel" aria-live="polite">
          {gewaehlt ? (
            <article className="haus3d__karte" key={gewaehlt.id}>
              <div className="haus3d__kartenkopf">
                <p className="haus3d__ort">
                  <span className="haus3d__nummer" aria-hidden="true">
                    {nummer + 1}
                  </span>
                  {gewaehlt.ort}
                </p>
                <span className="haus3d__blaettern">
                  <button type="button" className="rundknopf rundknopf--zurueck" aria-label="Vorherige Leistung" onClick={() => waehle(punkte[(nummer + punkte.length - 1) % punkte.length].id)}>
                    <Zeichen name="pfeil" />
                  </button>
                  <button type="button" className="rundknopf" aria-label="Nächste Leistung" onClick={() => waehle(punkte[(nummer + 1) % punkte.length].id)}>
                    <Zeichen name="pfeil" />
                  </button>
                </span>
              </div>
              <h3>{gewaehlt.name}</h3>
              <p>{gewaehlt.kurz}</p>
              <p>
                <Link className="textlink karte__verweis" href={gewaehlt.pfad}>
                  Mehr zu {gewaehlt.name}
                </Link>
              </p>
            </article>
          ) : null}
        </div>

        {/* Auswahl unter dem Haus */}
        <div className="haus3d__leiste" ref={leiste} role="group" aria-label="Leistung im Haus zeigen">
          <button type="button" className="haus3d__wahl haus3d__wahl--haus" onClick={() => { waehle(null); szene.current?.zurUebersicht(); }} disabled={!laeuft}>
            <Zeichen name="haus" />
            <span>Ganzes Haus</span>
          </button>
          {punkte.map((p) => (
            <button key={p.id} type="button" className="haus3d__wahl" aria-pressed={p.id === aktiv} onClick={() => waehle(p.id === aktiv ? null : p.id)} disabled={!laeuft}>
              <Zeichen name={p.zeichen} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
        </div>

        <div className="haus3d__werkzeug">
          <button type="button" className="rundknopf" aria-label="Näher heran" onClick={() => szene.current?.zoome(0.72)} disabled={!laeuft}>
            <Zeichen name="plus" />
          </button>
          <button type="button" className="rundknopf" aria-label="Weiter weg" onClick={() => szene.current?.zoome(1.4)} disabled={!laeuft}>
            <Zeichen name="minus" />
          </button>
          {offen ? (
            <button type="button" className="rundknopf haus3d__zu" aria-label="3D-Haus schließen" onClick={schliesse}>
              <Zeichen name="kreuz" />
            </button>
          ) : null}
        </div>

        {tasten && !offen ? (
          <button type="button" className="knopf haus3d__start" onClick={starte}>
            3D-Haus öffnen
          </button>
        ) : null}

        <p className="haus3d__hinweis" data-weg={bedient || aktiv || !laeuft ? "" : undefined} aria-hidden="true">
          {tasten ? "Wischen dreht das Haus, zwei Finger zoomen" : "Ziehen dreht das Haus, das Mausrad zoomt hinein"}
        </p>
        {zustand === "laedt" ? (
          <p className="haus3d__meldung" role="status">
            Das Haus wird aufgebaut
          </p>
        ) : null}
        {zustand === "fehler" ? (
          <p className="haus3d__meldung" role="status">
            Dieses Gerät zeigt das Haus nicht in 3D. Alle neun Leistungen stehen direkt darunter.
          </p>
        ) : null}
        </div>
      </div>
    </section>
  );
}
