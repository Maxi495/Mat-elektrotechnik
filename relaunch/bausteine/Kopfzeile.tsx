import { leistungen } from "@/daten/leistungen";
import { firma } from "@/daten/firma";
import { Zeichen } from "./Zeichen";
import { KopfInnen, type MenueLeistung } from "./KopfInnen";

/**
 * Kopfzeile (Design.md, 9.1; Informationsarchitektur.md, 5.1 und 5.2).
 * Weiß auf jeder Seite, damit das Logo immer auf Weiß steht.
 * Die Leistungen kommen aus der Datendatei. An den Teil im Browser gehen nur die Angaben, die das Menü braucht.
 */
export const hauptpunkte = [
  { name: "Referenzen", pfad: "/referenzen" },
  { name: "Über uns", pfad: "/unternehmen" },
  { name: "Karriere", pfad: "/karriere" },
  { name: "Kontakt", pfad: "/kontakt" },
] as const;

export function Kopfzeile() {
  const menue: MenueLeistung[] = leistungen.map((l) => ({
    id: l.id,
    name: l.name,
    pfad: l.pfad,
    zeile: l.zeile,
    zeichen: <Zeichen name={l.zeichen} />,
    bild: l.reihenBild,
  }));

  return (
    <KopfInnen
      leistungen={menue}
      hauptpunkte={[...hauptpunkte]}
      telefon={firma.telefon}
      firmenname={firma.kurzname}
    />
  );
}
