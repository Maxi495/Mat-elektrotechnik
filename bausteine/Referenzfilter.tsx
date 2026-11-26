"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Zeichen } from "./Zeichen";

type Wahl = { id: string; name: string };

/**
 * Filter der Referenzen (Informationsarchitektur.md, 7.4; Design.md, 8.8 und 9.13):
 * nach Leistung (neun) und nach Kundengruppe (drei). Gewählt: Rot hell mit rotem Text und Haken.
 * Die Karten ordnen sich fließend neu (GSAP Flip, 420 ms), ausgefilterte schrumpfen und verschwinden.
 *
 * Die Karten selbst stehen als normaler Seiteninhalt im Quelltext. Ohne Skript sind alle sichtbar.
 * Die Adresse /referenzen?leistung=wallbox öffnet die Seite schon gefiltert.
 */
export function Referenzfilter({
  leistungen,
  gruppen,
  children,
}: {
  leistungen: Wahl[];
  gruppen: Wahl[];
  children: ReactNode;
}) {
  // Vorauswahl aus der Adresse, zum Beispiel von einer Leistungsseite. Gilt, bis der Besucher selbst wählt.
  const ausAdresse = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("leistung"),
    () => null,
  );
  const [wahl, setWahl] = useState<string | null | undefined>(undefined);
  const leistung =
    wahl !== undefined ? wahl : ausAdresse && leistungen.some((l) => l.id === ausAdresse) ? ausAdresse : null;
  const setLeistung = setWahl;
  const [gruppe, setGruppe] = useState<string | null>(null);
  const [treffer, setTreffer] = useState<number | null>(null);
  const bereich = useRef<HTMLDivElement>(null);
  const ersterLauf = useRef(true);

  useEffect(() => {
    const karten = Array.from(bereich.current?.querySelectorAll<HTMLElement>("[data-referenz]") ?? []);
    if (karten.length === 0) return;

    const passt = (k: HTMLElement) =>
      (!leistung || (k.dataset.leistungen ?? "").split(" ").includes(leistung)) &&
      (!gruppe || k.dataset.gruppe === gruppe);

    const wende = () => {
      let zahl = 0;
      for (const k of karten) {
        const sichtbar = passt(k);
        k.hidden = !sichtbar;
        if (sichtbar) zahl += 1;
      }
      setTreffer(zahl);
    };

    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (ersterLauf.current || ruhig) {
      ersterLauf.current = false;
      wende();
      return;
    }

    let abgebrochen = false;
    Promise.all([import("gsap"), import("gsap/Flip")]).then(([{ gsap }, { Flip }]) => {
      if (abgebrochen) return;
      gsap.registerPlugin(Flip);
      const zustand = Flip.getState(karten);
      wende();
      Flip.from(zustand, {
        duration: 0.42,
        ease: "power3.out",
        absolute: true,
        onEnter: (neu) =>
          gsap.fromTo(neu, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.42, ease: "power3.out" }),
        onLeave: (weg) => gsap.to(weg, { opacity: 0, scale: 0.9, duration: 0.22 }),
      });
    });
    return () => {
      abgebrochen = true;
    };
  }, [leistung, gruppe]);

  const marke = (w: Wahl, aktiv: boolean, schalte: () => void) => (
    <button
      type="button"
      className="marke marke--filter"
      key={w.id}
      aria-pressed={aktiv}
      onClick={schalte}
    >
      <Zeichen name="haken" />
      {w.name}
    </button>
  );

  return (
    <>
      <div className="filter" role="group" aria-label="Projekte filtern">
        <div className="filter__gruppe">
          <p id="filter-leistung">Nach Leistung</p>
          <div className="marken" role="group" aria-labelledby="filter-leistung">
            {marke({ id: "", name: "Alle Leistungen" }, leistung === null, () => setLeistung(null))}
            {leistungen.map((l) =>
              marke(l, leistung === l.id, () => setLeistung(leistung === l.id ? null : l.id)),
            )}
          </div>
        </div>
        <div className="filter__gruppe">
          <p id="filter-gruppe">Nach Kundengruppe</p>
          <div className="marken" role="group" aria-labelledby="filter-gruppe">
            {marke({ id: "", name: "Alle Kunden" }, gruppe === null, () => setGruppe(null))}
            {gruppen.map((g) => marke(g, gruppe === g.id, () => setGruppe(gruppe === g.id ? null : g.id)))}
          </div>
        </div>
        <p className="klein" role="status" aria-live="polite">
          {treffer === null ? "" : treffer === 1 ? "1 Projekt" : `${treffer} Projekte`}
        </p>
      </div>

      <div ref={bereich}>{children}</div>

      <div className="filter__leer" hidden={treffer !== 0}>
        <p>
          Zu dieser Auswahl zeigen wir noch kein Projekt. Wählen Sie eine andere Leistung oder Kundengruppe.
        </p>
      </div>
    </>
  );
}
