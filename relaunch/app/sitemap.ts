import type { MetadataRoute } from "next";
import { leistungen } from "@/daten/leistungen";
import { offeneStellen } from "@/daten/stellen";
import { absolut } from "@/lib/umgebung";

/**
 * Sitemap mit allen Seiten der Seitenübersicht (Informationsarchitektur.md, Abschnitt 3).
 * Nicht enthalten: die Danke-Seite. Neue Leistungen und Stellen erscheinen von selbst.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const eintrag = (pfad: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absolut(pfad),
    changeFrequency: "monthly",
    priority,
  });

  return [
    eintrag("/", 1),
    eintrag("/leistungen", 0.9),
    ...leistungen.map((l) => eintrag(l.pfad, 0.9)),
    eintrag("/referenzen", 0.7),
    eintrag("/unternehmen", 0.6),
    eintrag("/karriere", 0.6),
    ...offeneStellen.map((s) => eintrag(s.pfad, 0.5)),
    eintrag("/kontakt", 0.8),
    eintrag("/haus", 0.4),
    eintrag("/impressum", 0.1),
    eintrag("/datenschutz", 0.1),
  ];
}
