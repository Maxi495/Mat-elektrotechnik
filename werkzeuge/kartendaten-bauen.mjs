// Baut aus den Rohdaten von OpenStreetMap (_aufnahme/osm/, siehe kartendaten-holen.mjs) die Dateien
// für die Karte des Einzugsgebiets:
//
//   public/karte/strassen.<prüfsumme>.bin   Straßennetz: Kreuzungen und Straßenstücke mit Klasse, Richtung, Tempo, Name, Verlauf.
//                                            Dient dem Zeichnen und dem Berechnen der Fahrzeit.
//   public/karte/gelaende.<prüfsumme>.bin   Wald, Wasser und bebaute Flächen, dazu Bahn und Flüsse als Linien.
//   public/karte/namen.<prüfsumme>.json     Straßenverzeichnis für die Adresssuche und Ortsnamen für die Beschriftung.
//   daten/karte.ts                           Dateinamen, Ausschnitt und Stand. Wird von diesem Skript geschrieben.
//
// Aufruf:  node werkzeuge/kartendaten-bauen.mjs
//
// Alle Lagen stehen in Metern ab der linken unteren Ecke des Ausschnitts, auf ganze Meter gerundet.
// Die beiden .bin-Dateien liegen mit gzip gepackt im Ordner: Server packen solche Dateien nicht von selbst,
// der Browser entpackt sie beim Laden (lib/kartenbild.ts).
// Daten: © OpenStreetMap-Mitwirkende, Lizenz ODbL (https://www.openstreetmap.org/copyright).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { AUSSCHNITT } from "./kartendaten-holen.mjs";

const WURZEL = join(import.meta.dirname, "..");
const ROH = join(WURZEL, "_aufnahme", "osm");
const ZIEL = join(WURZEL, "public", "karte");
const lies = (name) => JSON.parse(readFileSync(join(ROH, `${name}.json`), "utf8")).elements;

/* ------------------------------------------------------------------ Lage in Metern */

/** Zugabe um den sichtbaren Ausschnitt in Grad (rund 500 m), damit am Rand nichts abreißt. */
const ZUGABE = 0.006;
const WEST = AUSSCHNITT.west - ZUGABE;
const SUED = AUSSCHNITT.sued - ZUGABE;
const OST = AUSSCHNITT.ost + ZUGABE;
const NORD = AUSSCHNITT.nord + ZUGABE;
const MITTE = (((SUED + NORD) / 2) * Math.PI) / 180;
/** Meter je Grad in der Mitte des Ausschnitts. Die Karte rechnet mit denselben Werten zurück. */
const KY = 111132.92 - 559.82 * Math.cos(2 * MITTE) + 1.175 * Math.cos(4 * MITTE);
const KX = 111412.84 * Math.cos(MITTE) - 93.5 * Math.cos(3 * MITTE);
const BREITE = Math.floor((OST - WEST) * KX);
const HOEHE = Math.floor((NORD - SUED) * KY);
if (BREITE > 65535 || HOEHE > 65535) throw new Error("Ausschnitt zu groß für 16 Bit");
const xy = (lon, lat) => [(lon - WEST) * KX, (lat - SUED) * KY];
const drin = (p) => p[0] >= 0 && p[0] <= BREITE && p[1] >= 0 && p[1] <= HOEHE;
const abstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* ------------------------------------------------------------------ Werkzeuge für Linien und Flächen */

/** Schnittpunkt der Strecke a (innen) nach b (außen) mit dem Rand des Ausschnitts. */
function randpunkt(a, b) {
  let t = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (b[0] < 0) t = Math.min(t, (0 - a[0]) / dx);
  if (b[0] > BREITE) t = Math.min(t, (BREITE - a[0]) / dx);
  if (b[1] < 0) t = Math.min(t, (0 - a[1]) / dy);
  if (b[1] > HOEHE) t = Math.min(t, (HOEHE - a[1]) / dy);
  return [a[0] + dx * t, a[1] + dy * t];
}

/** Linie am Rand des Ausschnitts abschneiden. Ergebnis: zusammenhängende Stücke, Punkte als { p, id }. */
function schneideLinie(punkte) {
  const stuecke = [];
  let lauf = null;
  for (let i = 0; i < punkte.length; i++) {
    const jetzt = punkte[i];
    const innen = drin(jetzt.p);
    const vor = i > 0 ? punkte[i - 1] : null;
    if (innen) {
      if (!lauf) {
        lauf = [];
        if (vor && !drin(vor.p)) lauf.push({ p: randpunkt(jetzt.p, vor.p), id: null });
      }
      lauf.push(jetzt);
    } else if (lauf) {
      lauf.push({ p: randpunkt(vor.p, jetzt.p), id: null });
      if (lauf.length > 1) stuecke.push(lauf);
      lauf = null;
    }
  }
  if (lauf && lauf.length > 1) stuecke.push(lauf);
  return stuecke;
}

/** Fläche am Rand des Ausschnitts abschneiden (Sutherland-Hodgman, ein Ring). */
function schneideRing(ring) {
  const kanten = [
    [(p) => p[0] >= 0, (a, b) => [0, a[1] + ((b[1] - a[1]) * (0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= BREITE, (a, b) => [BREITE, a[1] + ((b[1] - a[1]) * (BREITE - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= 0, (a, b) => [a[0] + ((b[0] - a[0]) * (0 - a[1])) / (b[1] - a[1]), 0]],
    [(p) => p[1] <= HOEHE, (a, b) => [a[0] + ((b[0] - a[0]) * (HOEHE - a[1])) / (b[1] - a[1]), HOEHE]],
  ];
  let aus = ring;
  for (const [innen, schnitt] of kanten) {
    const ein = aus;
    aus = [];
    for (let i = 0; i < ein.length; i++) {
      const a = ein[i];
      const b = ein[(i + 1) % ein.length];
      if (innen(a)) {
        aus.push(a);
        if (!innen(b)) aus.push(schnitt(a, b));
      } else if (innen(b)) aus.push(schnitt(a, b));
    }
    if (aus.length < 3) return [];
  }
  return aus;
}

/** Douglas-Peucker: lässt Punkte weg, die weniger als die Toleranz (Meter) von der Linie abweichen. */
function vereinfache(punkte, toleranz) {
  if (punkte.length < 3) return punkte;
  const behalten = new Uint8Array(punkte.length);
  behalten[0] = behalten[punkte.length - 1] = 1;
  const stapel = [[0, punkte.length - 1]];
  while (stapel.length) {
    const [a, b] = stapel.pop();
    const [ax, ay] = punkte[a];
    const dx = punkte[b][0] - ax;
    const dy = punkte[b][1] - ay;
    const laenge = Math.hypot(dx, dy) || 1e-9;
    let weit = 0;
    let wo = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((punkte[i][0] - ax) * dy - (punkte[i][1] - ay) * dx) / laenge;
      if (d > weit) {
        weit = d;
        wo = i;
      }
    }
    if (weit > toleranz) {
      behalten[wo] = 1;
      stapel.push([a, wo], [wo, b]);
    }
  }
  return punkte.filter((_, i) => behalten[i]);
}

const flaeche = (ring) => {
  let f = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    f += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(f) / 2;
};

function imRing(p, ring) {
  let drinnen = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) drinnen = !drinnen;
  }
  return drinnen;
}

/** Wegstücke einer Relation zu geschlossenen Ringen zusammensetzen. */
function setzeRinge(wege) {
  const schluessel = (p) => `${p.lon},${p.lat}`;
  const offen = wege.filter((w) => w && w.length > 1).map((w) => w.slice());
  const ringe = [];
  while (offen.length) {
    let ring = offen.pop();
    let weiter = true;
    while (weiter && schluessel(ring[0]) !== schluessel(ring[ring.length - 1])) {
      weiter = false;
      const ende = schluessel(ring[ring.length - 1]);
      for (let i = 0; i < offen.length; i++) {
        const w = offen[i];
        if (schluessel(w[0]) === ende) {
          ring = ring.concat(w.slice(1));
        } else if (schluessel(w[w.length - 1]) === ende) {
          ring = ring.concat(w.slice(0, -1).reverse());
        } else continue;
        offen.splice(i, 1);
        weiter = true;
        break;
      }
    }
    if (ring.length > 3 && schluessel(ring[0]) === schluessel(ring[ring.length - 1])) ringe.push(ring.slice(0, -1));
  }
  return ringe;
}

/** Äußere und innere Ringe eines Elements (Weg oder Relation) in Metern. */
function ringeVon(element) {
  const inMetern = (ring) => ring.map((p) => xy(p.lon, p.lat));
  if (element.type === "way") {
    const g = element.geometry;
    if (!g || g.length < 4) return { aussen: [], innen: [] };
    const zu = g[0].lat === g[g.length - 1].lat && g[0].lon === g[g.length - 1].lon;
    return { aussen: zu ? [inMetern(g.slice(0, -1))] : [], innen: [] };
  }
  const teile = (rolle) => element.members.filter((m) => m.type === "way" && (rolle === "inner" ? m.role === "inner" : m.role !== "inner")).map((m) => m.geometry);
  return { aussen: setzeRinge(teile("outer")).map(inMetern), innen: setzeRinge(teile("inner")).map(inMetern) };
}

/* ------------------------------------------------------------------ Schreiben: kompaktes Binärformat */

class Schreiber {
  constructor() {
    this.puffer = new Uint8Array(1 << 20);
    this.ansicht = new DataView(this.puffer.buffer);
    this.n = 0;
  }
  platz(bytes) {
    if (this.n + bytes <= this.puffer.length) return;
    const neu = new Uint8Array(this.puffer.length * 2);
    neu.set(this.puffer);
    this.puffer = neu;
    this.ansicht = new DataView(neu.buffer);
  }
  u8(w) {
    this.platz(1);
    this.puffer[this.n++] = w;
  }
  u16(w) {
    this.platz(2);
    this.ansicht.setUint16(this.n, w, true);
    this.n += 2;
  }
  u32(w) {
    this.platz(4);
    this.ansicht.setUint32(this.n, w, true);
    this.n += 4;
  }
  f64(w) {
    this.platz(8);
    this.ansicht.setFloat64(this.n, w, true);
    this.n += 8;
  }
  /** Ganze Zahl ab 0 in 7-Bit-Häppchen. */
  zahl(w) {
    if (w < 0 || !Number.isInteger(w)) throw new Error(`zahl: ${w}`);
    while (w >= 128) {
      this.u8((w & 127) | 128);
      w = Math.floor(w / 128);
    }
    this.u8(w);
  }
  /** Ganze Zahl mit Vorzeichen (Zickzack). */
  versatz(w) {
    this.zahl(w < 0 ? -2 * w - 1 : 2 * w);
  }
  kopf() {
    this.u32(0x4b54414d); // "MATK"
    this.u8(1);
    this.u8(0);
    this.u16(0);
    this.f64(WEST);
    this.f64(SUED);
    this.f64(KX);
    this.f64(KY);
  }
  fertig() {
    return this.puffer.slice(0, this.n);
  }
}

/* ------------------------------------------------------------------ Straßennetz */

/** Reihenfolge = Nummer der Klasse in der Datei. */
const KLASSEN = ["motorway", "motorway_link", "trunk", "trunk_link", "primary", "secondary", "tertiary", "unclassified", "residential", "living_street"];
const klasseVon = (highway) => KLASSEN.indexOf(highway.replace(/^(primary|secondary|tertiary)_link$/, "$1"));

/** Erlaubtes Tempo, wenn am Weg keines steht (km/h). */
const TEMPO_OHNE_ANGABE = [120, 60, 100, 60, 60, 50, 50, 50, 30, 7];
/**
 * Anteil des erlaubten Tempos, der im Schnitt gefahren wird: Kreuzungen, Ampeln, Anfahren, Kurven.
 * Abgeglichen mit einem Routenplaner (siehe README, Abschnitt Karte).
 */
const ANTEIL = [0.9, 0.7, 0.85, 0.7, 0.72, 0.7, 0.68, 0.65, 0.6, 1];

function tempoVon(tags, klasse) {
  const roh = tags.maxspeed;
  let erlaubt = TEMPO_OHNE_ANGABE[klasse];
  if (roh === "none") erlaubt = 130;
  else if (roh === "walk") erlaubt = 7;
  else if (roh && /^\d+$/.test(roh)) erlaubt = Number(roh);
  const istLink = /_link$/.test(tags.highway);
  const anteil = istLink ? 0.7 : ANTEIL[klasse];
  return Math.max(4, Math.min(120, Math.round(erlaubt * anteil)));
}

const GESPERRT = /^(no|private|agricultural|forestry|permit|delivery|customers)/;
function befahrbar(tags) {
  if (tags.area === "yes") return false;
  for (const k of ["motorcar", "motor_vehicle", "vehicle"]) {
    if (tags[k]) return !GESPERRT.test(tags[k]);
  }
  return !(tags.access && GESPERRT.test(tags.access));
}
const nurAnlieger = (tags) => [tags.motorcar, tags.motor_vehicle, tags.vehicle, tags.access].some((w) => w === "destination");

function richtungVon(tags) {
  const o = tags.oneway;
  if (o === "-1" || o === "reverse") return 2;
  if (o === "yes" || o === "true" || o === "1") return 1;
  if (o === "no") return 0;
  if (tags.junction === "roundabout" || tags.highway === "motorway" || tags.highway === "motorway_link") return 1;
  return 0;
}

function baueStrassen() {
  const wege = lies("strassen").filter((w) => w.tags && befahrbar(w.tags) && klasseVon(w.tags.highway) >= 0);

  // 1. Am Rand abschneiden
  const laeufe = [];
  for (const w of wege) {
    const punkte = w.geometry.map((g, i) => ({ p: xy(g.lon, g.lat), id: w.nodes[i] }));
    for (const stueck of schneideLinie(punkte)) laeufe.push({ stueck, tags: w.tags });
  }

  // 2. Kreuzungen finden: Endpunkte und Punkte, die mehrfach vorkommen
  const haeufig = new Map();
  for (const { stueck } of laeufe) for (const pt of stueck) if (pt.id !== null) haeufig.set(pt.id, (haeufig.get(pt.id) || 0) + 1);
  let kuenstlich = -1;
  const knotenNr = new Map();
  const knotenLage = [];
  const knotenVon = (pt) => {
    const id = pt.id ?? kuenstlich--;
    if (!knotenNr.has(id)) {
      knotenNr.set(id, knotenLage.length);
      knotenLage.push(pt.p);
    }
    return knotenNr.get(id);
  };

  // 3. Wege an den Kreuzungen in Stücke teilen
  let kanten = [];
  for (const { stueck, tags } of laeufe) {
    const klasse = klasseVon(tags.highway);
    const gemeinsam = { klasse, richtung: richtungVon(tags), tempo: tempoVon(tags, klasse), anlieger: nurAnlieger(tags), name: tags.name || null, kennung: tags.ref || null };
    let anfang = 0;
    for (let i = 1; i < stueck.length; i++) {
      const pt = stueck[i];
      const istKreuzung = i === stueck.length - 1 || pt.id === null || haeufig.get(pt.id) > 1;
      if (!istKreuzung) continue;
      const verlauf = vereinfache(stueck.slice(anfang, i + 1).map((q) => q.p), 2.5);
      kanten.push({ ...gemeinsam, von: knotenVon(stueck[anfang]), nach: knotenVon(pt), verlauf });
      anfang = i;
    }
  }

  // 4. Nur das größte zusammenhängende Netz behalten (abgetrennte Reste sind nicht erreichbar)
  const eltern = Int32Array.from({ length: knotenLage.length }, (_, i) => i);
  const finde = (i) => {
    while (eltern[i] !== i) {
      eltern[i] = eltern[eltern[i]];
      i = eltern[i];
    }
    return i;
  };
  for (const k of kanten) eltern[finde(k.von)] = finde(k.nach);
  const groesse = new Map();
  for (const k of kanten) groesse.set(finde(k.von), (groesse.get(finde(k.von)) || 0) + 1);
  const hauptnetz = [...groesse.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const vorher = kanten.length;
  kanten = kanten.filter((k) => finde(k.von) === hauptnetz);

  // 5. Kreuzungen räumlich ordnen (Z-Kurve), das macht die Datei kleiner
  const verschraenkt = (v) => {
    v &= 0xffff;
    v = (v | (v << 8)) & 0x00ff00ff;
    v = (v | (v << 4)) & 0x0f0f0f0f;
    v = (v | (v << 2)) & 0x33333333;
    return (v | (v << 1)) & 0x55555555;
  };
  const benutzt = [...new Set(kanten.flatMap((k) => [k.von, k.nach]))];
  const rang = (i) => {
    const [x, y] = knotenLage[i];
    return (verschraenkt(Math.round(x)) | (verschraenkt(Math.round(y)) << 1)) >>> 0;
  };
  benutzt.sort((a, b) => rang(a) - rang(b));
  const neu = new Map(benutzt.map((alt, i) => [alt, i]));
  const knoten = benutzt.map((alt) => knotenLage[alt].map(Math.round));
  for (const k of kanten) {
    k.von = neu.get(k.von);
    k.nach = neu.get(k.nach);
    // Anfang und Ende liegen genau auf den gerundeten Kreuzungen
    k.verlauf = k.verlauf.map((p) => p.map(Math.round));
    k.verlauf[0] = knoten[k.von];
    k.verlauf[k.verlauf.length - 1] = knoten[k.nach];
    k.laenge = k.verlauf.reduce((s, p, i) => (i ? s + abstand(p, k.verlauf[i - 1]) : 0), 0);
  }
  kanten = kanten.filter((k) => k.von !== k.nach || k.laenge > 20);
  kanten.sort((a, b) => a.von - b.von || a.nach - b.nach || a.klasse - b.klasse);

  // Straßennamen als Liste, jedes Stück verweist mit einer Nummer darauf (0 = ohne Name)
  const namensliste = [...new Set(kanten.map((k) => k.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const namensNr = new Map(namensliste.map((n, i) => [n, i + 1]));

  // 6. Schreiben
  const s = new Schreiber();
  s.kopf();
  s.u32(knoten.length);
  s.u32(kanten.length);
  for (const [x, y] of knoten) {
    s.u16(x);
    s.u16(y);
  }
  let zuletzt = 0;
  for (const k of kanten) {
    s.zahl(k.von - zuletzt);
    zuletzt = k.von;
    s.versatz(k.nach - k.von);
    s.u8(k.klasse | (k.richtung << 4) | (k.anlieger ? 64 : 0));
    s.u8(k.tempo);
    s.zahl(k.name ? namensNr.get(k.name) : 0);
    s.zahl(k.verlauf.length - 2);
    for (let i = 1; i < k.verlauf.length - 1; i++) {
      s.versatz(k.verlauf[i][0] - k.verlauf[i - 1][0]);
      s.versatz(k.verlauf[i][1] - k.verlauf[i - 1][1]);
    }
  }
  console.log(
    `Straßen: ${wege.length} Wege → ${knoten.length} Kreuzungen, ${kanten.length} Stücke (${vorher - kanten.length} abgetrennte entfernt), ` +
      `${kanten.reduce((n, k) => n + k.verlauf.length, 0)} Punkte, ${(kanten.reduce((n, k) => n + k.laenge, 0) / 1000).toFixed(0)} km`,
  );
  return { datei: s.fertig(), knoten, kanten, namensliste, namensNr };
}

/* ------------------------------------------------------------------ Gelände: Wald, Wasser, Bahn, Flüsse */

const WALD = 1;
const WASSER = 0;
const SIEDLUNG = 2;
const BAHN = 0;
const FLUSS = 1;

function baueGelaende() {
  const s = new Schreiber();
  s.kopf();

  // Flächen
  const flaechen = [];
  for (const e of [...lies("flaechen"), ...lies("siedlung")]) {
    const art = e.tags.natural === "water" ? WASSER : e.tags.landuse && e.tags.landuse !== "forest" ? SIEDLUNG : WALD;
    const mindestens = art === WASSER ? 4000 : 25000; // Quadratmeter
    const { aussen, innen } = ringeVon(e);
    for (const ring of aussen) {
      const rand = vereinfache(schneideRing(ring), art === WASSER ? 5 : art === SIEDLUNG ? 8 : 9);
      if (rand.length < 3 || flaeche(rand) < mindestens) continue;
      // Löcher, die in diesem Ring liegen und groß genug sind
      const loecher = innen
        .filter((l) => imRing(l[0], ring))
        .map((l) => vereinfache(schneideRing(l), 9))
        .filter((l) => l.length >= 3 && flaeche(l) > 15000);
      flaechen.push({ art, ringe: [rand, ...loecher].map((r) => r.map((p) => p.map(Math.round))) });
    }
  }
  // Reihenfolge in der Datei: Siedlung, Wald, Wasser
  flaechen.sort((a, b) => b.art - a.art);
  s.u32(flaechen.length);
  for (const f of flaechen) {
    s.u8(f.art);
    s.zahl(f.ringe.length);
    for (const ring of f.ringe) schreibeZug(s, ring);
  }

  // Linien
  const linien = [];
  for (const e of lies("linien")) {
    if (e.tags.tunnel === "yes" || !e.geometry) continue;
    const art = e.tags.railway ? BAHN : FLUSS;
    const punkte = e.geometry.map((g) => ({ p: xy(g.lon, g.lat), id: null }));
    for (const stueck of schneideLinie(punkte)) {
      const zug = vereinfache(stueck.map((q) => q.p), art === BAHN ? 4 : 6).map((p) => p.map(Math.round));
      if (zug.length > 1) linien.push({ art, zug });
    }
  }
  linien.sort((a, b) => a.art - b.art);
  s.u32(linien.length);
  for (const l of linien) {
    s.u8(l.art);
    schreibeZug(s, l.zug);
  }
  console.log(
    `Gelände: ${flaechen.filter((f) => f.art === SIEDLUNG).length} bebaute Flächen, ${flaechen.filter((f) => f.art === WALD).length} Waldflächen, ${flaechen.filter((f) => f.art === WASSER).length} Wasserflächen, ` +
      `${linien.filter((l) => l.art === BAHN).length} Bahnstücke, ${linien.filter((l) => l.art === FLUSS).length} Flussstücke`,
  );
  return s.fertig();
}

/** Punktfolge: Anzahl, erster Punkt, danach Abstände zum Vorgänger. */
function schreibeZug(s, zug) {
  s.zahl(zug.length);
  s.u16(Math.max(0, Math.min(65535, zug[0][0])));
  s.u16(Math.max(0, Math.min(65535, zug[0][1])));
  for (let i = 1; i < zug.length; i++) {
    s.versatz(zug[i][0] - zug[i - 1][0]);
    s.versatz(zug[i][1] - zug[i - 1][1]);
  }
}

/* ------------------------------------------------------------------ Namen: Straßenverzeichnis und Orte */

function baueNamen({ knoten, kanten, namensliste, namensNr }) {
  // Gemeinden (Stufe 8) und die Stadt München (Stufe 6) als Flächen
  const gebiete = [];
  for (const r of lies("grenzen")) {
    const stufe = r.tags.admin_level;
    if (!(stufe === "8" || (stufe === "6" && r.tags.name === "München"))) continue;
    const { aussen } = ringeVon(r);
    if (!aussen.length) continue;
    const xs = aussen.flat().map((p) => p[0]);
    const ys = aussen.flat().map((p) => p[1]);
    gebiete.push({ name: r.tags.name, ringe: aussen, kasten: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] });
  }
  const gebietVon = (p) => {
    for (const g of gebiete) {
      if (p[0] < g.kasten[0] || p[1] < g.kasten[1] || p[0] > g.kasten[2] || p[1] > g.kasten[3]) continue;
      if (g.ringe.some((ring) => imRing(p, ring))) return g.name;
    }
    return null;
  };

  // Ortsnamen: als Zusatz für Münchner Straßen und zur Beschriftung der Karte
  const ortspunkte = lies("orte")
    .filter((o) => o.tags.name)
    .map((o) => ({ name: o.tags.name, art: o.tags.place, p: xy(o.lon, o.lat) }))
    .filter((o) => drin(o.p));
  const naechsterOrt = (p, arten, hoechstens) => {
    let best = null;
    let weit = hoechstens;
    for (const o of ortspunkte) {
      if (!arten.includes(o.art)) continue;
      const d = abstand(p, o.p);
      if (d < weit) {
        weit = d;
        best = o;
      }
    }
    return best;
  };
  const muenchner = ortspunkte.filter((o) => gebietVon(o.p) === "München");
  const stadtteil = (p) => {
    let best = null;
    let weit = 3500;
    for (const o of muenchner) {
      if (o.art !== "suburb" && o.art !== "quarter") continue;
      const d = abstand(p, o.p);
      if (d < weit) {
        weit = d;
        best = o;
      }
    }
    return best ? `München-${best.name}` : "München";
  };

  // Straßenstücke nach Name und Ort sammeln
  const gruppen = new Map();
  for (const k of kanten) {
    if (!k.name) continue;
    const mitte = k.verlauf[Math.floor(k.verlauf.length / 2)];
    const gemeinde = gebietVon(mitte) ?? naechsterOrt(mitte, ["town", "village"], 6000)?.name ?? null;
    if (!gemeinde) continue;
    const ort = gemeinde === "München" ? stadtteil(mitte) : gemeinde;
    const schluessel = `${k.name}|${ort}`;
    if (!gruppen.has(schluessel)) gruppen.set(schluessel, { name: k.name, ort, kanten: [] });
    gruppen.get(schluessel).kanten.push(k);
  }

  // Je Gruppe: weit auseinander liegende Teile trennen (gleicher Straßenname in zwei Ortsteilen)
  const eintraege = [];
  for (const g of gruppen.values()) {
    const haufen = g.kanten.map((k) => ({ kanten: [k], punkte: [knoten[k.von], knoten[k.nach]] }));
    let verbunden = true;
    while (verbunden) {
      verbunden = false;
      aussen: for (let i = 0; i < haufen.length; i++) {
        for (let j = i + 1; j < haufen.length; j++) {
          if (!haufen[i].punkte.some((a) => haufen[j].punkte.some((b) => abstand(a, b) < 600))) continue;
          haufen[i].kanten.push(...haufen[j].kanten);
          haufen[i].punkte.push(...haufen[j].punkte);
          haufen.splice(j, 1);
          verbunden = true;
          break aussen;
        }
      }
    }
    const teile = haufen.map((h) => {
      const laenge = h.kanten.reduce((s, k) => s + k.laenge, 0);
      const mx = h.punkte.reduce((s, p) => s + p[0], 0) / h.punkte.length;
      const my = h.punkte.reduce((s, p) => s + p[1], 0) / h.punkte.length;
      // Zielpunkt: die Kreuzung der Straße, die ihrer Mitte am nächsten liegt
      let ziel = h.kanten[0].von;
      let weit = Infinity;
      for (const k of h.kanten) {
        for (const nr of [k.von, k.nach]) {
          const d = abstand(knoten[nr], [mx, my]);
          if (d < weit) {
            weit = d;
            ziel = nr;
          }
        }
      }
      return { laenge, ziel, mitte: [mx, my] };
    });
    teile.sort((a, b) => b.laenge - a.laenge);
    if (teile.length === 1) {
      eintraege.push({ name: g.name, ort: g.ort, ziel: teile[0].ziel });
      continue;
    }
    // Mehrere Teile: mit dem nächsten Ortsteil unterscheiden, sonst zählt nur der längste
    const gesehen = new Set();
    for (const t of teile) {
      const teilort = naechsterOrt(t.mitte, ["village", "suburb", "quarter", "neighbourhood", "hamlet"], 2000)?.name;
      const ort = teilort && !g.ort.includes(teilort) ? `${g.ort} (${teilort})` : g.ort;
      if (gesehen.has(ort)) continue;
      gesehen.add(ort);
      eintraege.push({ name: g.name, ort, ziel: t.ziel });
    }
  }
  eintraege.sort((a, b) => a.name.localeCompare(b.name, "de") || a.ort.localeCompare(b.ort, "de"));
  const ortsliste = [...new Set(eintraege.map((e) => e.ort))].sort((a, b) => a.localeCompare(b, "de"));

  // Beschriftung: Städte, Dörfer und Stadtteile mit Lage
  const beschriftung = ortspunkte
    .filter((o) => ["town", "village", "suburb"].includes(o.art))
    .map((o) => [o.name, o.art === "town" ? 0 : o.art === "village" ? 1 : 2, Math.round(o.p[0]), Math.round(o.p[1])]);

  // Bundesstraßen und Autobahnen: je Kennung ein Punkt für das Schild, in der Mitte des längsten Stücks
  const schilder = new Map();
  for (const k of kanten) {
    if (!k.kennung || k.klasse > 4) continue;
    for (const kennung of k.kennung.split(";").map((t) => t.trim())) {
      if (!/^(A|B) ?\d+$/.test(kennung)) continue;
      const alt = schilder.get(kennung);
      if (!alt || k.laenge > alt.laenge) schilder.set(kennung, { laenge: k.laenge, p: k.verlauf[Math.floor(k.verlauf.length / 2)] });
    }
  }

  console.log(`Namen: ${eintraege.length} Straßen in ${ortsliste.length} Orten, ${beschriftung.length} Ortsnamen, ${schilder.size} Straßenschilder`);
  return {
    // Alle Straßennamen. Die Stücke in strassen.bin verweisen mit Nummer (ab 1) darauf.
    namen: namensliste,
    orte: ortsliste,
    // Straßenverzeichnis: [Nummer des Namens ab 0, Nummer des Orts, Kreuzung als Ziel]
    strassen: eintraege.map((e) => [namensNr.get(e.name) - 1, ortsliste.indexOf(e.ort), e.ziel]),
    beschriftung,
    schilder: [...schilder.entries()].map(([kennung, v]) => [kennung.replace(/^(A|B) ?/, "$1 "), v.p[0], v.p[1]]),
  };
}

/* ------------------------------------------------------------------ Ablauf */

const netz = baueStrassen();
const gelaende = baueGelaende();
const namen = Buffer.from(JSON.stringify(baueNamen(netz)));

mkdirSync(ZIEL, { recursive: true });
for (const alt of readdirSync(ZIEL)) if (/^(strassen|gelaende|namen)\./.test(alt)) unlinkSync(join(ZIEL, alt));
const ablage = {};
for (const [name, endung, roh] of [["strassen", "bin", netz.datei], ["gelaende", "bin", gelaende], ["namen", "json", namen]]) {
  const inhalt = endung === "bin" ? gzipSync(roh, { level: 9 }) : roh;
  const pruefsumme = createHash("sha256").update(inhalt).digest("hex").slice(0, 10);
  const datei = `${name}.${pruefsumme}.${endung}`;
  writeFileSync(join(ZIEL, datei), inhalt);
  ablage[name] = `/karte/${datei}`;
  console.log(`  ${datei}: ${(inhalt.length / 1024).toFixed(0)} KB`);
}

const stand = statSync(join(ROH, "strassen.json")).mtime.toISOString().slice(0, 10);
writeFileSync(
  join(WURZEL, "daten", "karte.ts"),
  `/**
 * Dateien und Ausschnitt der Karte des Einzugsgebiets.
 * Geschrieben von werkzeuge/kartendaten-bauen.mjs. Nicht von Hand ändern.
 * Kartendaten: © OpenStreetMap-Mitwirkende, Lizenz ODbL.
 */
export const karte = {
  dateien: ${JSON.stringify(ablage, null, 4).replace(/\n}/, "\n  }")},
  /** Sichtbarer Ausschnitt in Grad. */
  ausschnitt: ${JSON.stringify(AUSSCHNITT)},
  /** Tag, an dem die Daten von OpenStreetMap geholt wurden. */
  stand: "${stand}",
} as const;
`,
);
console.log("daten/karte.ts geschrieben, Stand", stand);
