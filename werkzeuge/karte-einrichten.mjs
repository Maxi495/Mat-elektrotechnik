// Legt zwei Hilfsdateien für die Karte des Einzugsgebiets unter public/kartenhelfer/ ab:
//
//   maplibre-gl-worker.mjs   Hintergrund-Rechner der Kartenbibliothek MapLibre. Er muss als eigene Datei
//                            vom eigenen Server kommen und zur eingerichteten Version passen.
//   figtree-500.woff         Schrift für die Beschriftung der Karte.
//
// Läuft von selbst nach jedem "npm install" (postinstall in package.json), auch beim Bau auf Vercel.
// Der Ordner steht in .gitignore, weil er nur Kopien enthält.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const wurzel = join(import.meta.dirname, "..");
const ziel = join(wurzel, "public", "kartenhelfer");
const kopien = [
  [join(wurzel, "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs"), "maplibre-gl-worker.mjs"],
  [join(wurzel, "schriften", "vorschau", "figtree-500.woff"), "figtree-500.woff"],
];

mkdirSync(ziel, { recursive: true });
for (const [quelle, name] of kopien) {
  if (!existsSync(quelle)) {
    console.warn(`karte-einrichten: ${quelle} fehlt, ${name} wird nicht kopiert`);
    continue;
  }
  copyFileSync(quelle, join(ziel, name));
}
console.log("karte-einrichten: Hilfsdateien liegen in public/kartenhelfer/");
