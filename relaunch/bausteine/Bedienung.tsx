"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { nachrangig, richteMausEin } from "@/lib/bedienung";

/**
 * Schaltet ein, was für den ganzen Besuch gilt. Zeigt selbst nichts an.
 *
 * - Mauszeiger, Anziehung der Knöpfe, Neigung der Karten (nur Geräte mit Maus).
 * - Kopfzeile beim Scrollen: lädt mit GSAP nachrangig.
 * - Seitenwechsel: rote Fläche wischt von unten über die Seite, umgesetzt mit der
 *   View-Transitions-Technik des Browsers. Ohne sie bleibt es beim normalen Seitenwechsel.
 *
 * Was zu einer einzelnen Seite gehört, schaltet SeiteBereit am Ende der Seite ein.
 */
export function Bedienung() {
  const router = useRouter();

  useEffect(() => {
    const maus = richteMausEin();
    let kopf: (() => void) | undefined;
    let aktiv = true;
    const abbrechen = nachrangig(() => {
      import("@/lib/bewegung").then((m) => {
        if (aktiv) kopf = m.starteKopf();
      });
    });
    return () => {
      aktiv = false;
      abbrechen();
      maus();
      kopf?.();
    };
  }, []);

  useEffect(() => {
    let wechselFertig: (() => void) | null = null;

    const bereit = () => {
      wechselFertig?.();
      wechselFertig = null;
    };

    const klick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.getAttribute("role") === "button") return;
      const ziel = new URL(link.href, window.location.href);
      if (ziel.origin !== window.location.origin) return;
      if (ziel.pathname === window.location.pathname) return;
      if (typeof document.startViewTransition !== "function") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      document.startViewTransition(
        () =>
          new Promise<void>((fertig) => {
            const sicherung = window.setTimeout(fertig, 2500);
            wechselFertig = () => {
              window.clearTimeout(sicherung);
              // Ein Bild abwarten, damit die neue Seite gezeichnet ist.
              requestAnimationFrame(() => fertig());
            };
            router.push(ziel.pathname + ziel.search + ziel.hash);
          }),
      );
    };

    window.addEventListener("mat-seite-bereit", bereit);
    document.addEventListener("click", klick, true);
    return () => {
      window.removeEventListener("mat-seite-bereit", bereit);
      document.removeEventListener("click", klick, true);
    };
  }, [router]);

  return null;
}
