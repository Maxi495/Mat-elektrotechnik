import { Group } from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { leistungsReihenfolge, type LeistungId } from "@/daten/adressen";
import { strom } from "./kamera";
import { ORTE } from "./orte";
import { ROT } from "./stoffe";

/**
 * Die Leitung im Haus (Design.md, Abschnitt 11): Wird eine Leistung gewählt, leuchtet die rote Leitung
 * vom Zählerschrank bis zu ihrem Punkt auf. Danach läuft Strom als helle Punkte durch die Leitung.
 * Die Linie liegt über allem, damit man ihren Weg auch hinter Wänden sieht, wie in einem Schaltplan.
 */

export interface Leitung {
  gruppe: Group;
  zeige: (id: LeistungId | null) => void;
  /**
   * Liefert true, solange die Leitung sich zeichnet oder Strom läuft.
   * "innen" (0 bis 1) sagt, wie nah die Kamera ist: Im Raum verschwindet das feine Netz, nur die gewählte Strecke bleibt.
   */
  schritt: (dt: number, zeit: number, innen: number) => boolean;
  groesse: (breite: number, hoehe: number) => void;
  entferne: () => void;
}

/** Bei Photovoltaik fließt der Strom vom Dach zum Zählerschrank */
const RUECKWAERTS: LeistungId[] = ["photovoltaik"];

export function baueLeitung(ruhig: boolean): Leitung {
  const gruppe = new Group();
  const bahnen = new Map<LeistungId, { g: LineGeometry; laenge: number }>();
  for (const id of leistungsReihenfolge) {
    const p = ORTE[id].leitung;
    const g = new LineGeometry();
    g.setPositions(p.flatMap((q) => [q[0], q[1], q[2]]));
    let laenge = 0;
    for (let i = 1; i < p.length; i++) laenge += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
    bahnen.set(id, { g, laenge });
  }

  const stoff = (farbe: number, breite: number, deckkraft: number) => {
    const m = new LineMaterial({ color: farbe, linewidth: breite, transparent: true, opacity: deckkraft, depthTest: false, depthWrite: false, dashed: true });
    return m;
  };
  const schein = stoff(ROT, 12, 0.2);
  const kern = stoff(ROT, 3.4, 1);
  const funken = stoff(0xffe3ea, 4.6, 1);
  const stoffe = [schein, kern, funken];
  const erste = bahnen.get(leistungsReihenfolge[0])?.g as LineGeometry;
  const linien = stoffe.map((m, i) => {
    const l = new Line2(erste, m);
    l.computeLineDistances();
    l.renderOrder = 8 + i;
    l.frustumCulled = false;
    l.visible = false;
    gruppe.add(l);
    return l;
  });

  // Das ganze Netz, fein und blass: So sieht man, dass alle Punkte an derselben Leitung hängen
  const netzstoff = new LineMaterial({ color: ROT, linewidth: 1.4, transparent: true, opacity: 0.4, depthTest: false, depthWrite: false });
  stoffe.push(netzstoff);
  for (const bahn of bahnen.values()) {
    const l = new Line2(bahn.g, netzstoff);
    l.renderOrder = 7;
    l.frustumCulled = false;
    gruppe.add(l);
  }

  let aktiv: LeistungId | null = null;
  let laenge = 1;
  let stand = 0;
  let sichtbar = 0;

  return {
    gruppe,
    zeige: (id) => {
      aktiv = id;
      if (!id) return;
      const bahn = bahnen.get(id);
      if (!bahn) return;
      laenge = bahn.laenge;
      for (const l of linien) {
        l.geometry = bahn.g;
        l.computeLineDistances();
      }
      for (const m of [schein, kern]) {
        m.dashSize = laenge;
        m.gapSize = laenge;
      }
      funken.dashSize = 0.16;
      funken.gapSize = 1.25;
      stand = ruhig ? 1 : 0;
      sichtbar = 1;
    },
    schritt: (dt, zeit, innen) => {
      netzstoff.opacity = 0.4 * Math.max(0, 1 - innen * 1.6);
      netzstoff.visible = netzstoff.opacity > 0.01;
      if (!aktiv) {
        if (sichtbar <= 0) return false;
        sichtbar = Math.max(0, sichtbar - dt * 3.2);
      } else {
        stand = Math.min(1, stand + dt / Math.min(1.6, 0.5 + laenge * 0.055));
      }
      const zeigen = sichtbar > 0;
      for (const l of linien) l.visible = zeigen;
      if (!zeigen) return true;
      const gezeichnet = strom(stand);
      schein.dashOffset = laenge * (1 - gezeichnet);
      kern.dashOffset = laenge * (1 - gezeichnet);
      schein.opacity = 0.2 * sichtbar;
      kern.opacity = sichtbar;
      // Strom läuft erst, wenn die Leitung steht
      const rueck = aktiv ? RUECKWAERTS.includes(aktiv) : false;
      funken.dashOffset = ruhig ? 0 : (rueck ? 1 : -1) * zeit * 2.1;
      funken.opacity = stand >= 1 ? sichtbar * 0.95 : 0;
      return !ruhig || stand < 1;
    },
    groesse: (breite, hoehe) => {
      for (const m of stoffe) m.resolution.set(breite, hoehe);
    },
    entferne: () => {
      for (const b of bahnen.values()) b.g.dispose();
      for (const m of stoffe) m.dispose();
    },
  };
}
