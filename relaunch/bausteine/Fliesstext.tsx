import Link from "next/link";
import type { ReactNode } from "react";
import { leistungsPfad, type LeistungId } from "@/daten/adressen";

/**
 * Fließtext aus den Datendateien.
 *   [Text](leistung:id)   verlinkt auf eine Leistung (Informationsarchitektur.md, Abschnitt 8:
 *                         eine andere Leistung wird beim ersten Nennen verlinkt)
 *   [Text](/pfad)         verlinkt auf eine andere Seite
 *   [OFFEN: was fehlt]    sichtbarer Platzhalter für fehlende Inhalte
 */
const muster = /\[([^\]]+)\]\((leistung:[a-z-]+|\/[^)]*)\)|\[OFFEN: [^\]]+\]/g;

export function teile(text: string): ReactNode[] {
  const ergebnis: ReactNode[] = [];
  let ende = 0;
  let nr = 0;
  for (const treffer of text.matchAll(muster)) {
    const start = treffer.index ?? 0;
    if (start > ende) ergebnis.push(text.slice(ende, start));
    if (treffer[0].startsWith("[OFFEN:")) {
      ergebnis.push(
        <mark className="offen" key={nr++}>
          {treffer[0]}
        </mark>,
      );
    } else {
      const ziel = treffer[2];
      const href = ziel.startsWith("leistung:")
        ? leistungsPfad(ziel.slice("leistung:".length) as LeistungId)
        : ziel;
      ergebnis.push(
        <Link href={href} key={nr++}>
          {treffer[1]}
        </Link>,
      );
    }
    ende = start + treffer[0].length;
  }
  if (ende < text.length) ergebnis.push(text.slice(ende));
  return ergebnis;
}

export function Fliesstext({ text, className = "" }: { text: string; className?: string }) {
  return <p className={`fliesstext ${className}`.trim()}>{teile(text)}</p>;
}

/** Reiner Text ohne Verweise und ohne Platzhalter, für strukturierte Daten und Meta-Angaben. */
export function klartext(text: string): string {
  return text
    .replace(/\[OFFEN: [^\]]+\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Platzhalter für fehlende Inhalte als eigener Baustein. */
export function Offen({ children }: { children: string }) {
  return <mark className="offen">{children.startsWith("[OFFEN:") ? children : `[OFFEN: ${children}]`}</mark>;
}
