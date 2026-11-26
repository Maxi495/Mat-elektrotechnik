"use client";

import { useEffect } from "react";
import { nachrangig, richteSeiteEin, starteSeiteLeicht } from "@/lib/bedienung";

/**
 * Steht am Ende jeder Seite und schaltet deren Bewegung ein, sobald die Seite im Browser steht.
 * So verändert kein Skript die Seite, bevor sie vollständig übernommen ist.
 *
 * - Erscheinen, Sicherungsreihe, Laufband starten sofort (klein, ohne Bibliothek).
 * - Ab 1024 px Breite lädt GSAP nachrangig: Leitung, Ablauf und Auftritt der Sicherungsreihe.
 * - Darunter gibt es keinen Leitungskanal. Knoten und Ablauf laufen dort ohne Bibliothek,
 *   das Handy lädt GSAP gar nicht erst.
 */
export function SeiteBereit() {
  useEffect(() => {
    const seite = richteSeiteEin(document);
    const breit = window.matchMedia("(min-width: 1024px)");
    let bewegung: (() => void) | undefined;
    let abbrechen: (() => void) | undefined;
    let aktiv = true;

    const starte = () => {
      abbrechen?.();
      abbrechen = undefined;
      bewegung?.();
      bewegung = undefined;

      if (!breit.matches) {
        bewegung = starteSeiteLeicht();
        return;
      }
      abbrechen = nachrangig(() => {
        import("@/lib/bewegung").then((m) => {
          // Inzwischen kann die Seite gewechselt oder das Fenster schmal geworden sein.
          if (aktiv && breit.matches && !bewegung) bewegung = m.starteSeite();
        });
      });
    };

    starte();
    // Wird das Fenster über die Grenze gezogen oder das Tablet gedreht, wechselt die Fassung.
    breit.addEventListener("change", starte);

    // Dem Seitenwechsel melden, dass die neue Seite steht.
    window.dispatchEvent(new Event("mat-seite-bereit"));

    // Der Auftakt der Startseite läuft einmal je Besuch.
    const auftakt = window.setTimeout(() => {
      delete document.documentElement.dataset.auftakt;
    }, 2600);

    return () => {
      aktiv = false;
      breit.removeEventListener("change", starte);
      abbrechen?.();
      window.clearTimeout(auftakt);
      delete document.documentElement.dataset.auftakt;
      seite();
      bewegung?.();
    };
  }, []);

  return null;
}
