"use client";

import { useSyncExternalStore } from "react";
import { Kippschalter } from "./Zeichen";

/**
 * Lichtschalter in der Fußzeile (Design.md, 8.8).
 * "Licht aus" stellt die ganze Seite auf dunkle Darstellung um. Die Kopfzeile mit Logo bleibt weiß.
 * Die Wahl wird im Gerät gemerkt. Das Skript im Kopf der Seite setzt sie schon vor dem ersten Bild.
 */
const SCHLUESSEL = "mat-licht";
const EREIGNIS = "mat-licht-wechsel";

function lies(): boolean {
  return document.documentElement.dataset.licht !== "aus";
}

function abonniere(rueckruf: () => void) {
  window.addEventListener(EREIGNIS, rueckruf);
  return () => window.removeEventListener(EREIGNIS, rueckruf);
}

export function Lichtschalter() {
  const an = useSyncExternalStore(abonniere, lies, () => true);

  function schalte() {
    const neu = an ? "aus" : "an";
    document.documentElement.dataset.licht = neu;
    try {
      localStorage.setItem(SCHLUESSEL, neu);
    } catch {
      /* Speicher gesperrt: Die Wahl gilt dann nur für diese Seite. */
    }
    window.dispatchEvent(new Event(EREIGNIS));
  }

  return (
    <button
      type="button"
      className="lichtschalter fuss__schalter"
      role="switch"
      aria-checked={an}
      onClick={schalte}
    >
      <Kippschalter />
      <span>Licht</span>
      <span className="lichtschalter__zustand">{an ? "an" : "aus"}</span>
    </button>
  );
}
