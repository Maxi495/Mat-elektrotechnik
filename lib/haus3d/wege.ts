import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { M } from "./haus";
import type { Halt } from "./kamera";
import { DRAUSSEN, WEGNETZ, WEGPUNKTE, type P, type Wegpunkt } from "./orte";

/**
 * Plant Kamerafahrten: außen im Bogen um das Haus, innen von Wegpunkt zu Wegpunkt durch die Türen.
 * Steht die Kamera schon im Haus, geht sie von dort los; liegt das Ziel woanders, geht sie erst hinaus.
 */

const MITTE = new Vector3(4.7, 3.2, 3.9);
const punkt = (p: P) => new Vector3(p[0], p[1], p[2]);

/** Steht dieser Punkt im Haus? "eg" meint Erd- und Obergeschoss, "dg" das Dachgeschoss. */
export function imHaus(p: Vector3): "eg" | "dg" | null {
  if (p.x < 0 || p.x > M.X1 || p.z < 0 || p.y < 0) return null;
  if (p.y >= M.DG - 0.15) return p.y < M.DACH + 0.2 && p.x > M.D0 && p.z < M.DZ ? "dg" : null;
  if (p.z > M.KRAG) return null;
  if (p.y < M.OG - 0.1) {
    // Die Eingangsnische liegt im Freien
    const nische = p.x > M.FLUR0 && p.x < M.FLUR1;
    if (p.z > (nische ? M.NISCHE + 0.2 : M.Z1)) return null;
  }
  return "eg";
}

const TEILE: Record<"eg" | "dg", { hinaus: Wegpunkt; innen: Wegpunkt[] }> = {
  eg: { hinaus: "vorplatz", innen: ["tuer", "flurVorn", "flurMitte", "flurHinten", "technik", "wohnen"] },
  dg: { hinaus: "luft", innen: ["dgTuer", "dgInnen"] },
};

/** Kürzester Weg im Netz der Wegpunkte */
function pfad(von: Wegpunkt, nach: Wegpunkt): Wegpunkt[] | null {
  if (von === nach) return [von];
  const vorher = new Map<Wegpunkt, Wegpunkt | null>([[von, null]]);
  const offen: Wegpunkt[] = [von];
  while (offen.length) {
    const hier = offen.shift() as Wegpunkt;
    for (const [a, b] of WEGNETZ) {
      const naechster = a === hier ? b : b === hier ? a : null;
      if (!naechster || vorher.has(naechster)) continue;
      vorher.set(naechster, hier);
      if (naechster === nach) {
        const weg: Wegpunkt[] = [nach];
        let z: Wegpunkt | null = hier;
        while (z) {
          weg.unshift(z);
          z = vorher.get(z) ?? null;
        }
        return weg;
      }
      offen.push(naechster);
    }
  }
  return null;
}

/** Bogen um das Haus von a nach b: Winkel, Abstand und Höhe gehen gleichmäßig über. */
function bogen(a: Vector3, b: Vector3): Vector3[] {
  const wa = Math.atan2(a.x - MITTE.x, a.z - MITTE.z);
  const wb = Math.atan2(b.x - MITTE.x, b.z - MITTE.z);
  let dw = wb - wa;
  while (dw > Math.PI) dw -= Math.PI * 2;
  while (dw < -Math.PI) dw += Math.PI * 2;
  const ra = Math.hypot(a.x - MITTE.x, a.z - MITTE.z);
  const rb = Math.hypot(b.x - MITTE.x, b.z - MITTE.z);
  const weit = Math.min(1, Math.abs(dw) / (Math.PI * 0.5));
  const schritte = Math.max(8, Math.round(10 + Math.abs(dw) * 8));
  const aus: Vector3[] = [];
  for (let i = 1; i <= schritte; i++) {
    const t = i / schritte;
    const bauch = Math.sin(Math.PI * t) * weit;
    // Bei weiten Schwenks außen herum und etwas höher, damit die Kamera nicht durch Haus und Bäume fährt
    const r = MathUtils.lerp(ra, rb, t) + Math.max(0, 12.5 - MathUtils.lerp(ra, rb, t)) * bauch;
    const w = wa + dw * t;
    const y = MathUtils.lerp(a.y, b.y, t) + Math.max(0, 4.5 - MathUtils.lerp(a.y, b.y, t)) * bauch * 0.6;
    aus.push(new Vector3(MITTE.x + Math.sin(w) * r, y, MITTE.z + Math.cos(w) * r));
  }
  aus[aus.length - 1].copy(b);
  return aus;
}

/** Gang durch Wegpunkte: weiche Kurve, alle 30 cm ein Punkt */
function gang(start: Vector3, punkte: Vector3[]): Vector3[] {
  const alle = [start, ...punkte];
  if (alle.length < 2) return [];
  const kurve = new CatmullRomCurve3(alle, false, "catmullrom", 0.28);
  const laenge = kurve.getLength();
  const schritte = Math.max(2, Math.round(laenge / 0.3));
  const aus: Vector3[] = [];
  for (let i = 1; i <= schritte; i++) aus.push(kurve.getPointAt(i / schritte));
  return aus;
}

export interface Ziel {
  auge: P;
  blick: P;
  weg?: readonly Wegpunkt[];
}

export interface Fahrt {
  halte: Halt[];
  /** Zeitmarke jedes Halts in Sekunden: Im Haus geht die Kamera im Schritttempo, draußen fliegt sie */
  marken: number[];
  dauer: number;
}

/** Tempo im Haus in Metern je Sekunde */
const GEHEN = 4.3;

export function planeFahrt(von: Halt, ziel: Ziel): Fahrt {
  const auge = punkt(ziel.auge);
  const blick = punkt(ziel.blick);
  /** Strecke aus Standorten. "gehen" merkt, welche Stücke im Haus liegen: Dort blickt die Kamera voraus. */
  const orte: Vector3[] = [von.ort.clone()];
  const gehen: boolean[] = [false];
  /** Hinaus geht die Kamera rückwärts: Sie blickt weiter ins Haus statt ins Leere */
  const rueckwaerts: boolean[] = [false];
  const abschnitte: { imGang: boolean; hinaus: boolean; start: number; ende: number }[] = [];
  const haenge = (stuecke: Vector3[], imGang: boolean, hinaus = false) => {
    if (!stuecke.length) return;
    abschnitte.push({ imGang, hinaus, start: orte.length, ende: orte.length + stuecke.length - 1 });
    for (const s of stuecke) {
      orte.push(s);
      gehen.push(imGang);
      rueckwaerts.push(hinaus);
    }
  };
  const letzter = () => orte[orte.length - 1];
  const zielweg = ziel.weg ? [...ziel.weg] : [];

  const drin = imHaus(von.ort);
  let rest: Wegpunkt[] = zielweg;
  if (drin) {
    const teil = TEILE[drin];
    let naechster = teil.innen[0];
    let bester = Infinity;
    for (const w of teil.innen) {
      const d = punkt(WEGPUNKTE[w]).distanceTo(von.ort);
      if (d < bester) {
        bester = d;
        naechster = w;
      }
    }
    const letztes = zielweg[zielweg.length - 1];
    const direkt = letztes ? pfad(naechster, letztes) : null;
    if (direkt && !direkt.some((w) => DRAUSSEN.includes(w))) {
      // Ziel im selben Teil des Hauses: drinnen bleiben
      haenge(gang(letzter(), direkt.map((w) => punkt(WEGPUNKTE[w]))), true);
      rest = [];
    } else {
      // Erst hinaus
      const hinaus = pfad(naechster, teil.hinaus) ?? [teil.hinaus];
      haenge(gang(letzter(), hinaus.map((w) => punkt(WEGPUNKTE[w]))), true, true);
    }
  }
  if (rest.length) {
    // Außen herum zum Einstieg, dann hinein
    haenge(bogen(letzter(), punkt(WEGPUNKTE[rest[0]])), false);
    haenge(gang(letzter(), rest.slice(1).map((w) => punkt(WEGPUNKTE[w]))), true);
    haenge(gang(letzter(), [auge]), true);
  } else if (zielweg.length) {
    haenge(gang(letzter(), [auge]), true);
  } else {
    haenge(bogen(letzter(), auge), false);
  }
  orte[orte.length - 1].copy(auge);

  // Weglängen
  const weg = [0];
  for (let i = 1; i < orte.length; i++) weg.push(weg[i - 1] + orte[i].distanceTo(orte[i - 1]));
  const laenge = weg[weg.length - 1] || 1;

  // Blickpunkte: im Gang zwei Meter voraus, im Bogen vom alten zum neuen Blick
  const voraus = (i: number): Vector3 => {
    const soll = weg[i] + 2.3;
    if (soll >= laenge) return blick.clone();
    let j = i;
    while (j < weg.length - 1 && weg[j] < soll) j++;
    return orte[j].clone();
  };
  const zurueck = (i: number): Vector3 => {
    const soll = weg[i] - 2.6;
    if (soll <= 0) return von.blick.clone();
    let j = i;
    while (j > 0 && weg[j] > soll) j--;
    return orte[j].clone();
  };
  const roh = orte.map((_, i) => (rueckwaerts[i] ? zurueck(i) : gehen[i] ? voraus(i) : von.blick.clone().lerp(MITTE, Math.min(1, (weg[i] / laenge) * 2.2))));
  const halte: Halt[] = orte.map((ort, i) => {
    // glätten über die Nachbarn
    const mittel = new Vector3();
    let zahl = 0;
    for (let k = Math.max(0, i - 3); k <= Math.min(orte.length - 1, i + 3); k++) {
      mittel.add(roh[k]);
      zahl++;
    }
    mittel.divideScalar(zahl);
    const anteil = weg[i] / laenge;
    const anfang = MathUtils.smoothstep(anteil, 0, 0.12);
    const ende = MathUtils.smoothstep(anteil, 0.62, 1);
    const b = von.blick.clone().lerp(mittel, anfang).lerp(blick, ende);
    return { ort, blick: b };
  });
  halte[halte.length - 1].blick.copy(blick);

  // Zeitmarken: Im Haus Schritttempo. Der Bogen draußen ist schnell und bremst vor der Tür ab,
  // damit das Tempo nicht springt.
  const marken = new Array<number>(orte.length).fill(0);
  abschnitte.forEach((a, k) => {
    const strecke = weg[a.ende] - weg[a.start - 1];
    const flug = strecke / MathUtils.clamp(0.6 + strecke * 0.03, 0.7, 2.0);
    for (let i = a.start; i <= a.ende; i++) {
      // Hinaus geht es doppelt so schnell wie hinein
      let tempo = a.hinaus ? GEHEN * 2 : GEHEN;
      if (!a.imGang) {
        const anteil = strecke > 0 ? (weg[i] - weg[a.start - 1]) / strecke : 1;
        tempo = flug;
        if (abschnitte[k + 1]?.imGang) tempo = MathUtils.lerp(tempo, GEHEN, MathUtils.smoothstep(anteil, 0.45, 1));
        if (abschnitte[k - 1]?.imGang) tempo = MathUtils.lerp(GEHEN, tempo, MathUtils.smoothstep(anteil, 0, 0.5));
      }
      marken[i] = marken[i - 1] + (weg[i] - weg[i - 1]) / Math.max(0.5, tempo);
    }
  });
  const dauer = Math.max(1.2, marken[marken.length - 1]);
  return { halte, marken, dauer };
}
