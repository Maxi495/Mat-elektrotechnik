// Holt die Rohdaten für die Karte des Einzugsgebiets von OpenStreetMap (Overpass-Schnittstelle)
// und legt sie unter _aufnahme/osm/ ab. Der Ordner steht in .gitignore.
//
// Aufruf:  node werkzeuge/kartendaten-holen.mjs [name ...]
// Ohne Namen werden alle Abfragen geholt, die noch nicht im Ordner liegen. Mit Namen wird neu geholt.
//
// Daten: © OpenStreetMap-Mitwirkende, Lizenz ODbL (https://www.openstreetmap.org/copyright).
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Ausschnitt: Süd, West, Nord, Ost. Alle Orte aus daten/orte.ts mit rund 3 km Rand. */
export const AUSSCHNITT = { sued: 48.04, west: 11.19, nord: 48.235, ost: 11.51 };
const B = `${AUSSCHNITT.sued},${AUSSCHNITT.west},${AUSSCHNITT.nord},${AUSSCHNITT.ost}`;

const STRASSEN =
  "motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street";

export const ABFRAGEN = {
  // Fahrbare Straßen mit Knotennummern (für die Kreuzungen) und Verlauf
  strassen: `way["highway"~"^(${STRASSEN})$"](${B}); out body geom qt;`,
  // Ortsnamen für Beschriftung und Zielpunkte
  orte: `node["place"~"^(city|town|village|suburb|quarter|neighbourhood|hamlet)$"](${B}); out body qt;`,
  // Gemeinden und Münchner Stadtbezirke, damit jede Straße ihren Ort bekommt
  grenzen: `relation["boundary"="administrative"]["admin_level"~"^(6|8|9|10)$"](${B}); out body geom qt;`,
  // Wasser und Wald als Flächen
  flaechen: `(way["natural"="water"](${B}); relation["natural"="water"](${B}); way["landuse"="forest"](${B}); relation["landuse"="forest"](${B}); way["natural"="wood"](${B}); relation["natural"="wood"](${B});); out body geom qt;`,
  // Bebaute Flächen: Wohnen, Gewerbe, Industrie, Handel
  siedlung: `(way["landuse"~"^(residential|commercial|industrial|retail)$"](${B}); relation["landuse"~"^(residential|commercial|industrial|retail)$"](${B});); out body geom qt;`,
  // Bahnstrecken und Flüsse als Linien
  linien: `(way["railway"="rail"]["service"!~"."](${B}); way["waterway"~"^(river|canal)$"](${B});); out body geom qt;`,
};

const SERVER = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const ZIEL = join(import.meta.dirname, "..", "_aufnahme", "osm");

async function hole(name) {
  const abfrage = `[out:json][timeout:240];${ABFRAGEN[name]}`;
  for (const server of SERVER) {
    try {
      const antwort = await fetch(server, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "kartendaten-skript/1.0" },
        body: "data=" + encodeURIComponent(abfrage),
      });
      if (!antwort.ok) throw new Error(`${antwort.status} ${antwort.statusText}`);
      const text = await antwort.text();
      const daten = JSON.parse(text);
      writeFileSync(join(ZIEL, `${name}.json`), text);
      console.log(`${name}: ${daten.elements.length} Elemente, ${(text.length / 1e6).toFixed(1)} MB (${new URL(server).host})`);
      return;
    } catch (fehler) {
      console.log(`${name}: ${new URL(server).host} antwortet nicht (${fehler.message})`);
    }
  }
  throw new Error(`${name}: kein Server hat geantwortet`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(ZIEL, { recursive: true });
  const gewuenscht = process.argv.slice(2);
  const namen = gewuenscht.length ? gewuenscht : Object.keys(ABFRAGEN).filter((n) => !existsSync(join(ZIEL, `${n}.json`)));
  for (const name of namen) {
    if (!ABFRAGEN[name]) throw new Error(`Unbekannte Abfrage: ${name}`);
    await hole(name);
    await new Promise((r) => setTimeout(r, 2000)); // den Server schonen
  }
}
