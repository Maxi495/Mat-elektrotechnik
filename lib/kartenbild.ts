/**
 * Kartenbild des Einzugsgebiets: eigene Karte ohne fremde Server.
 *
 * Gezeichnet wird mit MapLibre GL (BSD-Lizenz) aus den Dateien unter public/karte/, die
 * werkzeuge/kartendaten-bauen.mjs aus OpenStreetMap erzeugt. Es gibt keine Kacheln von außen, keine Schrift von außen
 * und keinen Kartendienst: Die Seite lädt alles vom eigenen Server, gerechnet wird im Browser.
 *
 * Dieses Modul wird erst geladen, wenn die Karte ins Bild kommt (bausteine/Gebietskarte.tsx).
 *
 * Kartendaten: © OpenStreetMap-Mitwirkende, Lizenz ODbL.
 */
import type { ExpressionSpecification, GeoJSONSource, LayerSpecification, Map as Karte, Marker, StyleSpecification } from "maplibre-gl";
import { karte as kartendaten } from "@/daten/karte";
import { inGrad, Leser, liesNetz, naechsteKreuzung, type Netz, type Strecke } from "./kartennetz";
import type { Verzeichnis } from "./kartensuche";

export interface Kartenort {
  name: string;
  lon: number;
  lat: number;
  /** Der Ort, in dem der Betrieb sitzt */
  kern: boolean;
}

export interface Kartengrundlage {
  netz: Netz;
  verzeichnis: Verzeichnis;
  gelaende: ArrayBuffer;
  /** Kreuzung am Betrieb: Start jeder Strecke */
  start: number;
  /** Kreuzung je Ort des Einzugsgebiets */
  ortsziele: { name: string; kreuzung: number }[];
}

/**
 * Die beiden Binärdateien liegen mit gzip gepackt auf dem Server (werkzeuge/kartendaten-bauen.mjs).
 * Ein Browser ohne DecompressionStream (älter als 2023) bekommt keine Karte, dort bleiben Standbild und Ortslisten.
 */
async function entpacke(antwort: Response): Promise<ArrayBuffer> {
  const roh = await antwort.arrayBuffer();
  const kennung = new Uint8Array(roh, 0, 2);
  if (kennung[0] !== 0x1f || kennung[1] !== 0x8b) return roh;
  if (typeof DecompressionStream !== "function") throw new Error("Dieser Browser kann die Kartendaten nicht entpacken");
  return new Response(new Blob([roh]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
}

/** Gibt dem Browser zwischen zwei Rechenschritten Zeit für Eingaben und Bildaufbau. */
const luft = () => new Promise<void>((weiter) => setTimeout(weiter, 0));

/** Lädt Straßennetz, Gelände und Verzeichnis. Braucht die Kartenbibliothek nicht: Suche und Fahrzeit gehen damit schon. */
export async function ladeKartengrundlage(firma: { lon: number; lat: number }, orte: Kartenort[]): Promise<Kartengrundlage> {
  const hole = async (adresse: string) => {
    const antwort = await fetch(adresse);
    if (!antwort.ok) throw new Error(`Kartendatei fehlt: ${adresse}`);
    return antwort;
  };
  const [strassen, gelaende, verzeichnis] = await Promise.all([
    hole(kartendaten.dateien.strassen).then(entpacke),
    hole(kartendaten.dateien.gelaende).then(entpacke),
    hole(kartendaten.dateien.namen).then((a) => a.json() as Promise<Verzeichnis>),
  ]);
  const netz = liesNetz(strassen);
  await luft();
  return {
    netz,
    verzeichnis,
    gelaende,
    start: naechsteKreuzung(netz, firma.lon, firma.lat),
    ortsziele: orte.map((o) => ({ name: o.name, kreuzung: naechsteKreuzung(netz, o.lon, o.lat) })),
  };
}

/* ------------------------------------------------------------------ Farben */

const ROT = "#D70036";

interface Farben {
  land: string;
  siedlung: string;
  wald: string;
  wasser: string;
  bahn: string;
  strasse: string;
  strasseRand: string;
  autobahn: string;
  autobahnRand: string;
  schrift: string;
  schriftLeise: string;
  streckeRand: string;
}

/** Abgeleitet aus stil/werte.css: Nebel, Linie und Anthrazit. Rot bleibt der Strecke vorbehalten. */
const FARBEN: Record<"hell" | "dunkel", Farben> = {
  hell: {
    land: "#F4F4F1",
    siedlung: "#E8E9E4",
    wald: "#DBE8D1",
    wasser: "#C4DCF0",
    bahn: "#BDBDB8",
    strasse: "#FFFFFF",
    strasseRand: "#D2D2CC",
    autobahn: "#FFFFFF",
    autobahnRand: "#B3B3AD",
    schrift: "#1F1F1F",
    schriftLeise: "#6A6A6A",
    streckeRand: "#FFFFFF",
  },
  dunkel: {
    land: "#1B1F25",
    siedlung: "#242932",
    wald: "#1B2A24",
    wasser: "#12283C",
    bahn: "#414752",
    strasse: "#3A404B",
    strasseRand: "#14171C",
    autobahn: "#525A69",
    autobahnRand: "#14171C",
    schrift: "#EDEEF0",
    schriftLeise: "#A3AAB4",
    streckeRand: "#15181D",
  },
};

/* ------------------------------------------------------------------ Daten als GeoJSON */

type Punkt = [number, number];
type Sammlung = GeoJSON.FeatureCollection;
const sammlung = (features: GeoJSON.Feature[]): Sammlung => ({ type: "FeatureCollection", features });

/** Straßenklassen ab dieser Nummer sind Nebenstraßen: eigene Quelle, erst ab Zoom 12 nötig. */
const AB_NEBENSTRASSE = 7;

function strassenAlsGeoJSON(netz: Netz, namen: string[]) {
  const gross: GeoJSON.Feature[] = [];
  const klein: GeoJSON.Feature[] = [];
  const linie = (i: number): Punkt[] => {
    const punkte: Punkt[] = [];
    for (let p = netz.verlaufAb[i]; p < netz.verlaufAb[i + 1]; p++) punkte.push(inGrad(netz, netz.punkte[2 * p], netz.punkte[2 * p + 1]));
    return punkte;
  };
  for (let i = 0; i < netz.von.length; i++) {
    const k = netz.klasse[i];
    (k >= AB_NEBENSTRASSE ? klein : gross).push({
      type: "Feature",
      properties: { k },
      geometry: { type: "LineString", coordinates: linie(i) },
    });
  }

  // Für die Straßennamen: Stücke derselben Straße zu langen Linien verketten, sonst passt kaum ein Name drauf.
  const jeName = new Map<number, number[]>();
  for (let i = 0; i < netz.von.length; i++) {
    if (!netz.name[i]) continue;
    const liste = jeName.get(netz.name[i]);
    if (liste) liste.push(i);
    else jeName.set(netz.name[i], [i]);
  }
  const beschriftung: GeoJSON.Feature[] = [];
  for (const [nr, stuecke] of jeName) {
    const anKreuzung = new Map<number, number[]>();
    for (const i of stuecke) {
      for (const kr of [netz.von[i], netz.nach[i]]) {
        const liste = anKreuzung.get(kr);
        if (liste) liste.push(i);
        else anKreuzung.set(kr, [i]);
      }
    }
    const benutzt = new Set<number>();
    const kette = (erstes: number, ab: number) => {
      const punkte: Punkt[] = [];
      let stueck = erstes;
      let kreuzung = ab;
      let rang = 9;
      for (;;) {
        benutzt.add(stueck);
        rang = Math.min(rang, netz.klasse[stueck]);
        const teil = linie(stueck);
        if (netz.von[stueck] !== kreuzung) teil.reverse();
        punkte.push(...(punkte.length ? teil.slice(1) : teil));
        kreuzung = netz.von[stueck] === kreuzung ? netz.nach[stueck] : netz.von[stueck];
        const weiter = (anKreuzung.get(kreuzung) ?? []).filter((s) => !benutzt.has(s));
        if (weiter.length !== 1) break;
        stueck = weiter[0];
      }
      beschriftung.push({ type: "Feature", properties: { n: namen[nr - 1], k: rang }, geometry: { type: "LineString", coordinates: punkte } });
    };
    // Erst an den Enden der Straße beginnen, dann die Reste (Ringe)
    for (const [kr, liste] of anKreuzung) if (liste.length === 1 && !benutzt.has(liste[0])) kette(liste[0], kr);
    for (const i of stuecke) if (!benutzt.has(i)) kette(i, netz.von[i]);
  }
  return { gross: sammlung(gross), klein: sammlung(klein), beschriftung: sammlung(beschriftung) };
}

function gelaendeAlsGeoJSON(puffer: ArrayBuffer) {
  const l = new Leser(puffer);
  const lage = l.kopf();
  const zug = (): Punkt[] => {
    const anzahl = l.zahl();
    let x = l.u16();
    let y = l.u16();
    const punkte: Punkt[] = [inGrad(lage, x, y)];
    for (let i = 1; i < anzahl; i++) {
      x += l.versatz();
      y += l.versatz();
      punkte.push(inGrad(lage, x, y));
    }
    return punkte;
  };
  const flaechen: GeoJSON.Feature[] = [];
  for (let i = l.u32(); i > 0; i--) {
    const art = l.u8();
    const ringe: Punkt[][] = [];
    for (let r = l.zahl(); r > 0; r--) {
      const ring = zug();
      ring.push(ring[0]);
      ringe.push(ring);
    }
    flaechen.push({ type: "Feature", properties: { a: art }, geometry: { type: "Polygon", coordinates: ringe } });
  }
  const linien: GeoJSON.Feature[] = [];
  for (let i = l.u32(); i > 0; i--) {
    const art = l.u8();
    linien.push({ type: "Feature", properties: { a: art }, geometry: { type: "LineString", coordinates: zug() } });
  }
  return { flaechen: sammlung(flaechen), linien: sammlung(linien) };
}

/**
 * Die berechnete Strecke beginnt an der Kreuzung neben dem Betrieb. Führt sie von dort noch einmal am Betrieb vorbei,
 * entstünde ein Haken. Deshalb beginnt die gezeichnete Linie am Betrieb und steigt an der nächstgelegenen Stelle ein.
 */
function abBetrieb(linie: Punkt[], betrieb: Punkt): Punkt[] {
  if (linie.length < 2) return [betrieb, ...linie];
  const stauchung = Math.cos((betrieb[1] * Math.PI) / 180);
  let besteStelle = 0;
  let besterAnteil = 0;
  let naechste = Infinity;
  let gelaufen = 0;
  // Nur der Anfang zählt: die ersten rund 400 Meter
  for (let i = 0; i + 1 < linie.length && gelaufen < 400 / 111_000; i++) {
    const ax = (linie[i][0] - betrieb[0]) * stauchung;
    const ay = linie[i][1] - betrieb[1];
    const dx = (linie[i + 1][0] - linie[i][0]) * stauchung;
    const dy = linie[i + 1][1] - linie[i][1];
    const quadrat = dx * dx + dy * dy;
    const anteil = quadrat ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / quadrat)) : 0;
    const d = (ax + anteil * dx) ** 2 + (ay + anteil * dy) ** 2;
    if (d < naechste) {
      naechste = d;
      besteStelle = i;
      besterAnteil = anteil;
    }
    gelaufen += Math.sqrt(quadrat);
  }
  const a = linie[besteStelle];
  const b = linie[besteStelle + 1];
  const einstieg: Punkt = [a[0] + (b[0] - a[0]) * besterAnteil, a[1] + (b[1] - a[1]) * besterAnteil];
  return [betrieb, einstieg, ...linie.slice(besteStelle + 1)];
}

/* ------------------------------------------------------------------ Stil */

/** Linienbreite je Zoomstufe, zwischen den Stufen wächst sie gleichmäßig mit der Karte. */
const breite = (...stufen: number[]): ExpressionSpecification => ["interpolate", ["exponential", 1.6], ["zoom"], ...stufen] as ExpressionSpecification;
const klasseIn = (...klassen: number[]): ExpressionSpecification => ["in", ["get", "k"], ["literal", klassen]] as ExpressionSpecification;

const SCHRIFT = ["Karte"];

type Farbstelle = [ebene: string, eigenschaft: Parameters<Karte["setPaintProperty"]>[1], wert: string];

/** Je Farbe die Stellen im Stil, an denen sie steht. Damit lässt sich "Licht aus" ohne Neuaufbau umschalten. */
function faerbung(f: Farben): Farbstelle[] {
  return [
    ["grund", "background-color", f.land],
    ["siedlung", "fill-color", f.siedlung],
    ["wald", "fill-color", f.wald],
    ["wasser", "fill-color", f.wasser],
    ["fluss", "line-color", f.wasser],
    ["bahn", "line-color", f.bahn],
    ["klein-rand", "line-color", f.strasseRand],
    ["sammel-rand", "line-color", f.strasseRand],
    ["haupt-rand", "line-color", f.strasseRand],
    ["autobahn-rand", "line-color", f.autobahnRand],
    ["klein", "line-color", f.strasse],
    ["sammel", "line-color", f.strasse],
    ["haupt", "line-color", f.strasse],
    ["autobahn", "line-color", f.autobahn],
    ["strecke-rand", "line-color", f.streckeRand],
    ["strassennamen", "text-color", f.schriftLeise],
    ["strassennamen", "text-halo-color", f.land],
    ["schilder", "text-color", f.schriftLeise],
    ["schilder", "text-halo-color", f.land],
    ["orte-andere", "text-color", f.schriftLeise],
    ["orte-andere", "text-halo-color", f.land],
    ["orte-knoten", "circle-color", f.land],
    ["orte-namen", "text-color", f.schrift],
    ["orte-namen", "text-halo-color", f.land],
  ];
}

function baueStil(quellen: StyleSpecification["sources"], f: Farben): StyleSpecification {
  const linie = (id: string, source: string, filter: ExpressionSpecification | undefined, minzoom: number, farbe: string, weite: ExpressionSpecification): LayerSpecification => ({
    id,
    type: "line",
    source,
    minzoom,
    ...(filter ? { filter } : {}),
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": farbe, "line-width": weite },
  });

  const layers: LayerSpecification[] = [
    { id: "grund", type: "background", paint: { "background-color": f.land } },
    { id: "siedlung", type: "fill", source: "flaechen", filter: ["==", ["get", "a"], 2], paint: { "fill-color": f.siedlung } },
    { id: "wald", type: "fill", source: "flaechen", filter: ["==", ["get", "a"], 1], paint: { "fill-color": f.wald } },
    { id: "wasser", type: "fill", source: "flaechen", filter: ["==", ["get", "a"], 0], paint: { "fill-color": f.wasser } },
    linie("fluss", "linien", ["==", ["get", "a"], 1], 9, f.wasser, breite(9, 0.8, 13, 2.4, 16, 6)),
    {
      id: "bahn",
      type: "line",
      source: "linien",
      minzoom: 9.5,
      filter: ["==", ["get", "a"], 0],
      paint: { "line-color": f.bahn, "line-width": breite(9.5, 0.6, 13, 1.2, 16, 2.4), "line-dasharray": [5, 3] },
    },

    // Ränder zuerst, damit sich Straßen an Kreuzungen sauber verbinden
    linie("klein-rand", "strassen-klein", undefined, 13.2, f.strasseRand, breite(13.2, 1.6, 14.5, 4, 16, 9, 17, 14)),
    linie("sammel-rand", "strassen-gross", klasseIn(6), 12, f.strasseRand, breite(12, 1.8, 14, 4.4, 16, 11)),
    linie("haupt-rand", "strassen-gross", klasseIn(4, 5), 8, f.strasseRand, breite(8, 1.2, 10.5, 2.4, 12, 3.6, 14, 6.6, 16, 14)),
    linie("autobahn-rand", "strassen-gross", klasseIn(0, 1, 2, 3), 8, f.autobahnRand, breite(8, 1.8, 11, 4, 14, 9, 16, 17)),

    linie("klein", "strassen-klein", undefined, 12.2, f.strasse, breite(12.2, 0.5, 14.5, 2.6, 16, 7, 17, 12)),
    linie("sammel", "strassen-gross", klasseIn(6), 10.2, f.strasse, breite(10.2, 0.5, 12, 1.1, 14, 3, 16, 9)),
    linie("haupt", "strassen-gross", klasseIn(4, 5), 8, f.strasse, breite(8, 0.5, 10.5, 1.2, 12, 2.2, 14, 5, 16, 12)),
    linie("autobahn", "strassen-gross", klasseIn(0, 1, 2, 3), 8, f.autobahn, breite(8, 0.9, 11, 2.4, 14, 7, 16, 15)),

    // Die Strecke: weißer Rand, darauf die rote Leitung
    {
      id: "strecke-rand",
      type: "line",
      source: "strecke",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": f.streckeRand, "line-width": breite(9, 5.5, 13, 8, 16, 12), "line-opacity": 0 },
    },
    {
      id: "strecke",
      type: "line",
      source: "strecke",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROT, "line-width": breite(9, 2.6, 13, 4.4, 16, 7), "line-opacity": 0 },
    },

    {
      id: "strassennamen",
      type: "symbol",
      source: "strassennamen",
      minzoom: 13.4,
      // Nebenstraßen bekommen ihren Namen erst ab Zoom 15
      filter: ["any", ["<", ["get", "k"], AB_NEBENSTRASSE], [">=", ["zoom"], 15]],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 360,
        "text-field": ["get", "n"],
        "text-font": SCHRIFT,
        "text-size": ["interpolate", ["linear"], ["zoom"], 13.4, 10.5, 16, 13],
        "text-max-angle": 28,
        "text-padding": 6,
        "text-letter-spacing": 0.01,
      },
      paint: { "text-color": f.schriftLeise, "text-halo-color": f.land, "text-halo-width": 1.4 },
    },
    {
      id: "schilder",
      type: "symbol",
      source: "schilder",
      minzoom: 9.2,
      layout: { "text-field": ["get", "n"], "text-font": SCHRIFT, "text-size": 10.5, "text-letter-spacing": 0.06, "text-padding": 8 },
      paint: { "text-color": f.schriftLeise, "text-halo-color": f.land, "text-halo-width": 1.6 },
    },
    {
      id: "orte-andere",
      type: "symbol",
      source: "orte-andere",
      // Städte ab der Übersicht, Dörfer ab Zoom 12, Stadtteile ab Zoom 13
      filter: ["<=", ["get", "r"], ["step", ["zoom"], 0, 12, 1, 13, 2]],
      layout: {
        "text-field": ["get", "n"],
        "text-font": SCHRIFT,
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10.5, 14, 13.5],
        "text-padding": 10,
        "text-letter-spacing": 0.02,
      },
      paint: { "text-color": f.schriftLeise, "text-halo-color": f.land, "text-halo-width": 1.6 },
    },
    {
      id: "orte-knoten",
      type: "circle",
      source: "orte",
      filter: ["!=", ["get", "kern"], 1],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 4, 13, 6.5],
        "circle-color": f.land,
        "circle-stroke-color": ROT,
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "an"], false], 5, 2],
      },
    },
    {
      id: "orte-namen",
      type: "symbol",
      source: "orte",
      layout: {
        "text-field": ["get", "n"],
        "text-font": SCHRIFT,
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 12, 13, 15.5],
        "text-variable-anchor": ["left", "right", "top", "bottom"],
        "text-radial-offset": 0.75,
        "text-justify": "auto",
        "text-padding": 3,
        "symbol-sort-key": ["get", "folge"],
      },
      paint: { "text-color": f.schrift, "text-halo-color": f.land, "text-halo-width": 1.8 },
    },
    // Unsichtbar, liegt zuoberst und wird deshalb zuerst gesetzt: hält die Stellen der Knoten und des Betriebs frei.
    {
      id: "platzhalter",
      type: "symbol",
      source: "platzhalter",
      layout: {
        "text-field": ["get", "t"],
        "text-font": SCHRIFT,
        "text-size": 13,
        "text-anchor": ["get", "a"],
        "text-allow-overlap": true,
        "text-padding": 1,
      },
      paint: { "text-opacity": 0 },
    },
  ];

  return {
    version: 8,
    // Schrift vom eigenen Server. Ohne "glyphs" zeichnet MapLibre die Buchstaben selbst aus dieser Datei.
    "font-faces": { Karte: "/kartenhelfer/figtree-500.woff?v=1" },
    sources: quellen,
    layers,
  };
}

/* ------------------------------------------------------------------ Karte */

export interface Kartenbild {
  /** Strecke zeichnen, Ziel markieren, Ausschnitt anpassen. */
  zeige(strecke: Strecke, ziel: { name: string; minuten: number; ort?: string }): void;
  /** Strecke und Ziel entfernen, zurück zur Übersicht. */
  leere(): void;
  zoome(schritt: 1 | -1): void;
  /** true = dunkle Karte ("Licht aus") */
  setzeLicht(aus: boolean): void;
  entferne(): void;
}

export interface Kartenoptionen {
  grundlage: Kartengrundlage;
  orte: Kartenort[];
  firma: { name: string; lon: number; lat: number };
  dunkel: boolean;
  /** Reduzierte Bewegung: keine Kamerafahrt, keine gezeichnete Strecke */
  ruhig: boolean;
  /** Ein Ort des Einzugsgebiets wurde auf der Karte angeklickt. */
  beiOrt(name: string): void;
}

let helferGesetzt = false;

export async function zeichneKarte(behaelter: HTMLElement, o: Kartenoptionen): Promise<Kartenbild> {
  const maplibre = await import("maplibre-gl");
  if (!helferGesetzt) {
    // Der Hintergrund-Rechner liegt als Kopie auf dem eigenen Server (werkzeuge/karte-einrichten.mjs).
    maplibre.setWorkerUrl(`/kartenhelfer/maplibre-gl-worker.mjs?v=${maplibre.getVersion()}`);
    helferGesetzt = true;
  }

  await luft();
  const { netz, verzeichnis, gelaende } = o.grundlage;
  const strassen = strassenAlsGeoJSON(netz, verzeichnis.namen);
  await luft();
  const gelaendeDaten = gelaendeAlsGeoJSON(gelaende);
  await luft();
  const genannt = new Set(o.orte.map((ort) => ort.name));
  const leereLinie: GeoJSON.Feature = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } };

  const quellen: StyleSpecification["sources"] = {
    flaechen: { type: "geojson", data: gelaendeDaten.flaechen, maxzoom: 14, tolerance: 0.5 },
    linien: { type: "geojson", data: gelaendeDaten.linien, maxzoom: 14 },
    "strassen-gross": { type: "geojson", data: strassen.gross, maxzoom: 14, tolerance: 0.3 },
    "strassen-klein": { type: "geojson", data: strassen.klein, maxzoom: 14, tolerance: 0.3 },
    strassennamen: { type: "geojson", data: strassen.beschriftung, maxzoom: 14 },
    strecke: { type: "geojson", data: leereLinie, lineMetrics: true, tolerance: 0.2 },
    schilder: {
      type: "geojson",
      data: sammlung(verzeichnis.schilder.map(([n, x, y]) => ({ type: "Feature", properties: { n }, geometry: { type: "Point", coordinates: inGrad(netz, x, y) } }))),
    },
    "orte-andere": {
      type: "geojson",
      data: sammlung(
        verzeichnis.beschriftung
          .filter(([n]) => !genannt.has(n))
          .map(([n, r, x, y]) => ({ type: "Feature", properties: { n, r }, geometry: { type: "Point", coordinates: inGrad(netz, x, y) } })),
      ),
    },
    platzhalter: {
      type: "geojson",
      data: sammlung([
        ...o.orte.filter((ort) => !ort.kern).map((ort): GeoJSON.Feature => ({ type: "Feature", properties: { t: "●", a: "center" }, geometry: { type: "Point", coordinates: [ort.lon, ort.lat] } })),
        { type: "Feature", properties: { t: `●  ${o.firma.name}  `, a: "left" }, geometry: { type: "Point", coordinates: [o.firma.lon, o.firma.lat] } },
      ]),
    },
    orte: {
      type: "geojson",
      data: sammlung(
        o.orte.map((ort, i) => ({
          type: "Feature",
          id: i,
          properties: { n: ort.name, kern: ort.kern ? 1 : 0, folge: ort.kern ? 0 : i + 1 },
          geometry: { type: "Point", coordinates: [ort.lon, ort.lat] },
        })),
      ),
    },
  };

  const a = kartendaten.ausschnitt;
  const grenzen: [[number, number], [number, number]] = [
    [a.west, a.sued],
    [a.ost, a.nord],
  ];
  let farben = FARBEN[o.dunkel ? "dunkel" : "hell"];

  const karte: Karte = new maplibre.Map({
    container: behaelter,
    style: baueStil(quellen, farben),
    bounds: grenzen,
    maxBounds: grenzen,
    maxZoom: 16.5,
    attributionControl: false,
    maplibreLogo: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    rollEnabled: false,
    renderWorldCopies: false,
    // Das Rad scrollt die Seite, ein Finger auch. Die Karte bewegt man mit Strg oder zwei Fingern.
    cooperativeGestures: true,
    fadeDuration: o.ruhig ? 0 : 250,
    locale: {
      "Map.Title": "Karte des Einzugsgebiets",
      "CooperativeGesturesHandler.WindowsHelpText": "Strg + Scrollen vergrößert die Karte",
      "CooperativeGesturesHandler.MacHelpText": "⌘ + Scrollen vergrößert die Karte",
      "CooperativeGesturesHandler.MobileHelpText": "Karte mit zwei Fingern bewegen",
    },
  });
  karte.touchZoomRotate.disableRotation();
  karte.keyboard.disableRotation();

  await new Promise<void>((fertig, fehler) => {
    karte.once("load", () => fertig());
    karte.once("error", (e) => fehler(e.error ?? new Error("Karte konnte nicht geladen werden")));
  });

  /* ---------- Betrieb und Ziel als Marker */

  const baue = (klasse: string, ...kinder: [string, string][]) => {
    const el = document.createElement("div");
    el.className = klasse;
    el.setAttribute("aria-hidden", "true");
    for (const [kind, text] of kinder) {
      const span = document.createElement("span");
      span.className = kind;
      span.textContent = text;
      el.appendChild(span);
    }
    return el;
  };
  const firmaElement = baue("landkarte__firma", ["landkarte__firma-knoten", ""], ["landkarte__firma-name", o.firma.name]);
  const firmaMarker: Marker = new maplibre.Marker({ element: firmaElement, anchor: "center" })
    .setLngLat([o.firma.lon, o.firma.lat])
    .addTo(karte);
  const zielElement = baue("landkarte__ziel", ["landkarte__ziel-zeit", ""], ["landkarte__ziel-knoten", ""]);
  const zielMarker: Marker = new maplibre.Marker({ element: zielElement, anchor: "center" });

  /* ---------- Orte des Einzugsgebiets: anklickbar */

  let ortAn: number | null = null;
  const markiere = (nr: number | null) => {
    if (ortAn !== null) karte.setFeatureState({ source: "orte", id: ortAn }, { an: false });
    ortAn = nr;
    if (nr !== null) karte.setFeatureState({ source: "orte", id: nr }, { an: true });
  };
  for (const ebene of ["orte-knoten", "orte-namen"]) {
    karte.on("click", ebene, (e) => {
      const name = e.features?.[0]?.properties?.n;
      if (typeof name === "string") o.beiOrt(name);
    });
    karte.on("mouseenter", ebene, () => {
      karte.getCanvas().style.cursor = "pointer";
    });
    karte.on("mouseleave", ebene, () => {
      karte.getCanvas().style.cursor = "";
    });
  }

  /* ---------- Strecke: läuft wie die Leitung vom Betrieb zum Ziel */

  let bild = 0;
  let streckeDa = false;
  let fortschritt = 0;
  const setzeFortschritt = (anteil: number) => {
    // Bis "anteil" ist die Linie zu sehen, dahinter durchsichtig.
    const p = Math.max(0, Math.min(1, anteil));
    fortschritt = p;
    const verlauf = (farbe: string): ExpressionSpecification =>
      (p >= 0.999
        ? ["interpolate", ["linear"], ["line-progress"], 0, farbe, 1, farbe]
        : p <= 0.001
          ? ["interpolate", ["linear"], ["line-progress"], 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0)"]
          : ["interpolate", ["linear"], ["line-progress"], 0, farbe, p, farbe, Math.min(1, p + 0.0005), "rgba(0,0,0,0)", 1, "rgba(0,0,0,0)"]) as ExpressionSpecification;
    karte.setPaintProperty("strecke", "line-gradient", verlauf(ROT));
    karte.setPaintProperty("strecke-rand", "line-gradient", verlauf(farben.streckeRand));
  };

  const zeige: Kartenbild["zeige"] = (strecke, ziel) => {
    cancelAnimationFrame(bild);
    const linie = abBetrieb(strecke.linie, [o.firma.lon, o.firma.lat]);
    (karte.getSource("strecke") as GeoJSONSource).setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: linie } });
    karte.setPaintProperty("strecke", "line-opacity", 1);
    karte.setPaintProperty("strecke-rand", "line-opacity", 1);
    const ortNr = ziel.ort ? -1 : o.orte.findIndex((ort) => ort.name === ziel.name);
    markiere(ortNr >= 0 ? ortNr : null);
    streckeDa = true;

    const ende = strecke.linie[strecke.linie.length - 1];
    (zielElement.firstElementChild as HTMLElement).textContent = `${ziel.minuten} Min.`;
    zielElement.classList.remove("ist-da");
    zielMarker.setLngLat(ende).addTo(karte);

    // Ausschnitt: die ganze Strecke mit Rand
    let west = Infinity;
    let sued = Infinity;
    let ost = -Infinity;
    let nord = -Infinity;
    for (const [lon, lat] of strecke.linie) {
      west = Math.min(west, lon);
      ost = Math.max(ost, lon);
      sued = Math.min(sued, lat);
      nord = Math.max(nord, lat);
    }
    // Das Namensschild des Betriebs steht auf der Seite, auf der die Strecke nicht verläuft, und bekommt dort Platz.
    const nachOsten = (west + ost) / 2 > o.firma.lon;
    firmaElement.classList.toggle("landkarte__firma--links", nachOsten);
    const rand = Math.min(72, behaelter.clientWidth * 0.16);
    const schild = Math.min(104, behaelter.clientWidth * 0.24);
    karte.fitBounds(
      [
        [west, sued],
        [ost, nord],
      ],
      {
        padding: { top: rand + 24, bottom: rand, left: rand + (nachOsten ? schild : 0), right: rand + (nachOsten ? 0 : schild) },
        maxZoom: 14.2,
        duration: o.ruhig ? 0 : 900,
      },
    );

    if (o.ruhig) {
      setzeFortschritt(1);
      zielElement.classList.add("ist-da");
      return;
    }
    const dauer = Math.max(700, Math.min(1500, 500 + strecke.meter / 12));
    const beginn = performance.now();
    setzeFortschritt(0);
    const schritt = (jetzt: number) => {
      const t = Math.min(1, (jetzt - beginn) / dauer);
      // Erst zügig, zum Ziel hin langsamer
      setzeFortschritt(1 - (1 - t) ** 2.4);
      if (t < 1) bild = requestAnimationFrame(schritt);
      else zielElement.classList.add("ist-da");
    };
    bild = requestAnimationFrame(schritt);
  };

  const leere: Kartenbild["leere"] = () => {
    cancelAnimationFrame(bild);
    karte.setPaintProperty("strecke", "line-opacity", 0);
    karte.setPaintProperty("strecke-rand", "line-opacity", 0);
    zielMarker.remove();
    markiere(null);
    firmaElement.classList.remove("landkarte__firma--links");
    streckeDa = false;
    karte.fitBounds(grenzen, { duration: o.ruhig ? 0 : 700 });
  };

  return {
    zeige,
    leere,
    zoome: (schritt) => {
      karte.easeTo({ zoom: karte.getZoom() + schritt, duration: o.ruhig ? 0 : 300 });
    },
    setzeLicht: (aus) => {
      farben = FARBEN[aus ? "dunkel" : "hell"];
      for (const [ebene, eigenschaft, wert] of faerbung(farben)) karte.setPaintProperty(ebene, eigenschaft, wert);
      // Der Rand der Strecke trägt seine Farbe im Verlauf, nicht in der Linienfarbe
      if (streckeDa) setzeFortschritt(fortschritt);
    },
    entferne: () => {
      cancelAnimationFrame(bild);
      firmaMarker.remove();
      zielMarker.remove();
      karte.remove();
    },
  };
}
