/**
 * Dateien und Ausschnitt der Karte des Einzugsgebiets.
 * Geschrieben von werkzeuge/kartendaten-bauen.mjs. Nicht von Hand ändern.
 * Kartendaten: © OpenStreetMap-Mitwirkende, Lizenz ODbL.
 */
export const karte = {
  dateien: {
    "strassen": "/karte/strassen.f10cbf7632.bin",
    "gelaende": "/karte/gelaende.663b66a085.bin",
    "namen": "/karte/namen.f80a4a8aca.json"
  },
  /** Sichtbarer Ausschnitt in Grad. */
  ausschnitt: {"sued":48.04,"west":11.19,"nord":48.235,"ost":11.51},
  /** Tag, an dem die Daten von OpenStreetMap geholt wurden. */
  stand: "2026-11-26",
} as const;
