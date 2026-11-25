"use client";

import { useEffect } from "react";
import { nachrangig, richteSeiteEin } from "@/lib/bedienung";

/**
 * Steht am Ende jeder Seite und schaltet deren Bewegung ein, sobald die Seite im Browser steht.
 * So verändert kein Skript die Seite, bevor sie vollständig übernommen ist.
 *
 * - Erscheinen, Sicherungsreihe, Laufband starten sofort (klein, ohne Bibliothek).
 * - GSAP für Leitung, Ablauf und Sicherungsreihe lädt nachrangig.
 */
export function SeiteBereit() {
  useEffect(() => {
    const seite = richteSeiteEin(document);
    let leitung: (() => void) | undefined;
    let aktiv = true;
    const abbrechen = nachrangig(() => {
      import("@/lib/bewegung").then((m) => {
        if (aktiv) leitung = m.starteSeite();
      });
    });

    // Dem Seitenwechsel melden, dass die neue Seite steht.
    window.dispatchEvent(new Event("mat-seite-bereit"));

    // Der Auftakt der Startseite läuft einmal je Besuch.
    const auftakt = window.setTimeout(() => {
      delete document.documentElement.dataset.auftakt;
    }, 2600);

    return () => {
      aktiv = false;
      abbrechen();
      window.clearTimeout(auftakt);
      delete document.documentElement.dataset.auftakt;
      seite();
      leitung?.();
    };
  }, []);

  return null;
}
