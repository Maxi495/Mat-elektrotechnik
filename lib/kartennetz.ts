/**
 * Straßennetz des Einzugsgebiets: liest die Datei aus werkzeuge/kartendaten-bauen.mjs
 * und berechnet darauf die schnellste Strecke mit dem Auto.
 *
 * Läuft ganz im Browser. Es geht keine Anfrage an einen Kartendienst, eine eingegebene Adresse verlässt das Gerät nicht.
 * Die Fahrzeit ist eine Rechnung aus erlaubtem Tempo und Straßenart, ohne Verkehr.
 *
 * Kartendaten: © OpenStreetMap-Mitwirkende, Lizenz ODbL.
 */

/** Klassen in der Reihenfolge der Datei. */
export const KLASSEN = [
  "autobahn",
  "autobahn-auffahrt",
  "schnellstrasse",
  "schnellstrasse-auffahrt",
  "bundesstrasse",
  "hauptstrasse",
  "sammelstrasse",
  "nebenstrasse",
  "wohnstrasse",
  "spielstrasse",
] as const;

export interface Netz {
  /** Linke untere Ecke in Grad und Meter je Grad. Lage in der Datei: Meter ab dieser Ecke. */
  west: number;
  sued: number;
  kx: number;
  ky: number;
  /** Kreuzungen */
  x: Uint16Array;
  y: Uint16Array;
  /** Straßenstücke */
  von: Uint32Array;
  nach: Uint32Array;
  klasse: Uint8Array;
  /** 0 = beide Richtungen, 1 = nur von → nach, 2 = nur nach → von */
  richtung: Uint8Array;
  anlieger: Uint8Array;
  /** Durchschnittstempo in km/h */
  tempo: Uint8Array;
  /** Nummer des Straßennamens in der Namensliste ab 1, 0 = ohne Name */
  name: Uint16Array;
  laenge: Float32Array;
  /** Verlauf je Stück: punkte[2 * verlaufAb[i]] bis punkte[2 * verlaufAb[i + 1]], mit Anfang und Ende */
  verlaufAb: Uint32Array;
  punkte: Uint16Array;
  /** Nachbarn je Kreuzung: bogenZiel und bogenStueck von bogenAb[k] bis bogenAb[k + 1] */
  bogenAb: Uint32Array;
  bogenZiel: Uint32Array;
  /** Nummer des Stücks mal 2, plus 1, wenn es gegen seine Richtung befahren wird */
  bogenStueck: Uint32Array;
}

/** Liest Zahlen in 7-Bit-Häppchen, wie das Bauskript sie schreibt. */
export class Leser {
  private ansicht: DataView;
  private bytes: Uint8Array;
  n = 0;
  constructor(puffer: ArrayBuffer) {
    this.ansicht = new DataView(puffer);
    this.bytes = new Uint8Array(puffer);
  }
  u8(): number {
    return this.bytes[this.n++];
  }
  u16(): number {
    const w = this.ansicht.getUint16(this.n, true);
    this.n += 2;
    return w;
  }
  u32(): number {
    const w = this.ansicht.getUint32(this.n, true);
    this.n += 4;
    return w;
  }
  f64(): number {
    const w = this.ansicht.getFloat64(this.n, true);
    this.n += 8;
    return w;
  }
  zahl(): number {
    let w = 0;
    let stelle = 1;
    for (;;) {
      const b = this.bytes[this.n++];
      w += (b & 127) * stelle;
      if (b < 128) return w;
      stelle *= 128;
    }
  }
  versatz(): number {
    const w = this.zahl();
    return w % 2 ? -(w + 1) / 2 : w / 2;
  }
  /** Prüft das Kennzeichen der Datei und liest Ecke und Maßstab. */
  kopf(): { west: number; sued: number; kx: number; ky: number } {
    if (this.u32() !== 0x4b54414d || this.u8() !== 1) throw new Error("Kartendatei hat ein unbekanntes Format");
    this.n += 3;
    return { west: this.f64(), sued: this.f64(), kx: this.f64(), ky: this.f64() };
  }
}

export function liesNetz(puffer: ArrayBuffer): Netz {
  const l = new Leser(puffer);
  const kopf = l.kopf();
  const anzahlKnoten = l.u32();
  const anzahlStuecke = l.u32();

  const x = new Uint16Array(anzahlKnoten);
  const y = new Uint16Array(anzahlKnoten);
  for (let i = 0; i < anzahlKnoten; i++) {
    x[i] = l.u16();
    y[i] = l.u16();
  }

  const von = new Uint32Array(anzahlStuecke);
  const nach = new Uint32Array(anzahlStuecke);
  const klasse = new Uint8Array(anzahlStuecke);
  const richtung = new Uint8Array(anzahlStuecke);
  const anlieger = new Uint8Array(anzahlStuecke);
  const tempo = new Uint8Array(anzahlStuecke);
  const name = new Uint16Array(anzahlStuecke);
  const laenge = new Float32Array(anzahlStuecke);
  const verlaufAb = new Uint32Array(anzahlStuecke + 1);
  // Die Zahl der Punkte steht erst am Ende fest: großzügig anlegen und danach kürzen.
  let punkte = new Uint16Array(anzahlStuecke * 8);
  let p = 0;
  let zuletzt = 0;

  for (let i = 0; i < anzahlStuecke; i++) {
    const a = (zuletzt += l.zahl());
    const b = a + l.versatz();
    const merkmale = l.u8();
    von[i] = a;
    nach[i] = b;
    klasse[i] = merkmale & 15;
    richtung[i] = (merkmale >> 4) & 3;
    anlieger[i] = (merkmale >> 6) & 1;
    tempo[i] = l.u8();
    name[i] = l.zahl();
    const dazwischen = l.zahl();
    if ((p + dazwischen + 2) * 2 > punkte.length) {
      const groesser = new Uint16Array(punkte.length * 2 + (dazwischen + 2) * 2);
      groesser.set(punkte);
      punkte = groesser;
    }
    verlaufAb[i] = p;
    let px = x[a];
    let py = y[a];
    let weg = 0;
    punkte[2 * p] = px;
    punkte[2 * p + 1] = py;
    p++;
    for (let k = 0; k <= dazwischen; k++) {
      const nx = k < dazwischen ? px + l.versatz() : x[b];
      const ny = k < dazwischen ? py + l.versatz() : y[b];
      weg += Math.hypot(nx - px, ny - py);
      px = nx;
      py = ny;
      punkte[2 * p] = px;
      punkte[2 * p + 1] = py;
      p++;
    }
    laenge[i] = weg;
  }
  verlaufAb[anzahlStuecke] = p;
  punkte = punkte.slice(0, 2 * p);

  // Nachbarschaft: je Kreuzung die Stücke, über die man sie verlassen darf
  const bogenAb = new Uint32Array(anzahlKnoten + 1);
  for (let i = 0; i < anzahlStuecke; i++) {
    if (richtung[i] !== 2) bogenAb[von[i] + 1]++;
    if (richtung[i] !== 1) bogenAb[nach[i] + 1]++;
  }
  for (let k = 0; k < anzahlKnoten; k++) bogenAb[k + 1] += bogenAb[k];
  const frei = bogenAb.slice(0, anzahlKnoten);
  const bogenZiel = new Uint32Array(bogenAb[anzahlKnoten]);
  const bogenStueck = new Uint32Array(bogenAb[anzahlKnoten]);
  for (let i = 0; i < anzahlStuecke; i++) {
    if (richtung[i] !== 2) {
      const platz = frei[von[i]]++;
      bogenZiel[platz] = nach[i];
      bogenStueck[platz] = 2 * i;
    }
    if (richtung[i] !== 1) {
      const platz = frei[nach[i]]++;
      bogenZiel[platz] = von[i];
      bogenStueck[platz] = 2 * i + 1;
    }
  }

  return { ...kopf, x, y, von, nach, klasse, richtung, anlieger, tempo, name, laenge, verlaufAb, punkte, bogenAb, bogenZiel, bogenStueck };
}

/** Lage in Metern → Länge und Breite in Grad. */
export const inGrad = (netz: Pick<Netz, "west" | "sued" | "kx" | "ky">, x: number, y: number): [number, number] => [
  netz.west + x / netz.kx,
  netz.sued + y / netz.ky,
];

/** Länge und Breite in Grad → Lage in Metern. */
export const inMeter = (netz: Pick<Netz, "west" | "sued" | "kx" | "ky">, lon: number, lat: number): [number, number] => [
  (lon - netz.west) * netz.kx,
  (lat - netz.sued) * netz.ky,
];

/** Die Kreuzung, die einer Stelle am nächsten liegt. Stücke nur für Anlieger zählen nicht als Ausgangspunkt. */
export function naechsteKreuzung(netz: Netz, lon: number, lat: number): number {
  const [mx, my] = inMeter(netz, lon, lat);
  let best = 0;
  let weit = Infinity;
  for (let k = 0; k < netz.x.length; k++) {
    const d = (netz.x[k] - mx) ** 2 + (netz.y[k] - my) ** 2;
    if (d < weit) {
      weit = d;
      best = k;
    }
  }
  return best;
}

export interface Strecke {
  /** Reine Fahrzeit in Sekunden, ohne Verkehr */
  sekunden: number;
  meter: number;
  /** Verlauf als Länge und Breite in Grad, vom Start zum Ziel */
  linie: [number, number][];
}

/** Aufschlag beim Suchen für Straßen "Anlieger frei": Sie sollen nur am Ziel benutzt werden. */
const ANLIEGER_FAKTOR = 4;
/**
 * Sekunden je Kreuzung, an der eine gleich wichtige oder wichtigere Straße kreuzt: Vorfahrt achten, Ampel, Abbiegen.
 * Seitenstraßen, die in eine Hauptstraße münden, bremsen die Hauptstraße nicht.
 */
const JE_KREUZUNG = 6;

/**
 * Schnellste Strecke von einer Kreuzung zur anderen (Dijkstra mit Vorrangschlange).
 * Liefert null, wenn es keinen Weg gibt.
 */
export function schnellsteStrecke(netz: Netz, start: number, ziel: number): Strecke | null {
  const n = netz.x.length;
  const kosten = new Float64Array(n).fill(Infinity);
  const zeit = new Float64Array(n);
  const ueber = new Int32Array(n).fill(-1); // Bogen, über den die Kreuzung erreicht wurde
  const vorgaenger = new Int32Array(n).fill(-1);
  const fertig = new Uint8Array(n);

  // Vorrangschlange als Haufen über (Kosten, Kreuzung)
  const haufenK: number[] = [];
  const haufenW: number[] = [];
  const hinein = (k: number, w: number) => {
    let i = haufenK.length;
    haufenK.push(k);
    haufenW.push(w);
    while (i > 0) {
      const eltern = (i - 1) >> 1;
      if (haufenW[eltern] <= w) break;
      haufenK[i] = haufenK[eltern];
      haufenW[i] = haufenW[eltern];
      i = eltern;
    }
    haufenK[i] = k;
    haufenW[i] = w;
  };
  const heraus = (): number => {
    const oben = haufenK[0];
    const k = haufenK.pop() as number;
    const w = haufenW.pop() as number;
    const laenge = haufenK.length;
    if (laenge > 0) {
      let i = 0;
      for (;;) {
        let kind = 2 * i + 1;
        if (kind >= laenge) break;
        if (kind + 1 < laenge && haufenW[kind + 1] < haufenW[kind]) kind++;
        if (haufenW[kind] >= w) break;
        haufenK[i] = haufenK[kind];
        haufenW[i] = haufenW[kind];
        i = kind;
      }
      haufenK[i] = k;
      haufenW[i] = w;
    }
    return oben;
  };

  kosten[start] = 0;
  hinein(start, 0);
  while (haufenK.length) {
    const k = heraus();
    if (fertig[k]) continue;
    fertig[k] = 1;
    if (k === ziel) break;
    for (let b = netz.bogenAb[k]; b < netz.bogenAb[k + 1]; b++) {
      const nachbar = netz.bogenZiel[b];
      if (fertig[nachbar]) continue;
      const stueck = netz.bogenStueck[b] >> 1;
      let sekunden = netz.laenge[stueck] / (netz.tempo[stueck] / 3.6);
      // Kreuzungen kosten Zeit, auf der Autobahn nicht
      const rang = netz.klasse[stueck];
      if (rang > 1) {
        let gleichrangig = 0;
        for (let q = netz.bogenAb[nachbar]; q < netz.bogenAb[nachbar + 1]; q++) {
          if (netz.klasse[netz.bogenStueck[q] >> 1] <= rang) gleichrangig++;
        }
        if (gleichrangig > 2) sekunden += JE_KREUZUNG;
      }
      const neu = kosten[k] + sekunden * (netz.anlieger[stueck] ? ANLIEGER_FAKTOR : 1);
      if (neu < kosten[nachbar]) {
        kosten[nachbar] = neu;
        zeit[nachbar] = zeit[k] + sekunden;
        ueber[nachbar] = b;
        vorgaenger[nachbar] = k;
        hinein(nachbar, neu);
      }
    }
  }
  if (!fertig[ziel]) return null;

  // Weg vom Ziel zurück zum Start aufsammeln
  const boegen: number[] = [];
  for (let k = ziel; k !== start; k = vorgaenger[k]) boegen.push(ueber[k]);
  boegen.reverse();

  const linie: [number, number][] = [inGrad(netz, netz.x[start], netz.y[start])];
  let meter = 0;
  for (const b of boegen) {
    const stueck = netz.bogenStueck[b] >> 1;
    const rueckwaerts = netz.bogenStueck[b] & 1;
    const a = netz.verlaufAb[stueck];
    const e = netz.verlaufAb[stueck + 1];
    meter += netz.laenge[stueck];
    if (rueckwaerts) for (let p = e - 2; p >= a; p--) linie.push(inGrad(netz, netz.punkte[2 * p], netz.punkte[2 * p + 1]));
    else for (let p = a + 1; p < e; p++) linie.push(inGrad(netz, netz.punkte[2 * p], netz.punkte[2 * p + 1]));
  }
  return { sekunden: zeit[ziel], meter, linie };
}
