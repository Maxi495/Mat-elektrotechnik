import { vorschaubild, vorschauGroesse, vorschauTyp } from "@/lib/vorschaubild";

export const alt = "Mat-Elektrotechnik: Ihr Elektriker in Germering und im Münchner Westen";
export const size = vorschauGroesse;
export const contentType = vorschauTyp;

/** Vorschaubild für alle Seiten ohne eigenes Bild. */
export default function Bild() {
  return vorschaubild({
    titel: "Ihr Elektriker in Germering und im Münchner Westen",
    zeile: "Elektro-Meisterbetrieb seit 2010",
  });
}
