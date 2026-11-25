import { leistungen, leistungNachSlug } from "@/daten/leistungen";
import { vorschaubild, vorschauGroesse, vorschauTyp } from "@/lib/vorschaubild";

export const alt = "Leistung von Mat-Elektrotechnik in Germering";
export const size = vorschauGroesse;
export const contentType = vorschauTyp;

export function generateStaticParams() {
  return leistungen.map((l) => ({ leistung: l.slug }));
}

/** Eigenes Vorschaubild je Leistung mit der Hauptüberschrift der Seite. */
export default async function Bild({ params }: { params: Promise<{ leistung: string }> }) {
  const { leistung } = await params;
  const l = leistungNachSlug(leistung);
  return vorschaubild({
    titel: l?.seo.h1 ?? "Leistungen von Mat-Elektrotechnik",
    zeile: l ? `${l.name} vom Elektro-Meisterbetrieb` : "Elektro-Meisterbetrieb seit 2010",
  });
}
