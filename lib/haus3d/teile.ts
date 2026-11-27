import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Plane, Vector3, type BufferGeometry, type Material } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { M, OEFFNUNG, TON } from "./haus";
import type { Stoffe } from "./stoffe";

/**
 * Bewegliche Teile des Hauses: Haustür, Garagentor, Schiebetür zur Dachterrasse, Jalousien im Wohnraum.
 * Jedes Teil hat einen Stand zwischen 0 (zu, oben) und 1 (offen, unten) und fährt ruhig auf sein Ziel zu.
 */

export interface Beweglich {
  /** Wohin das Teil soll: 0 bis 1 */
  ziel: number;
  /** Wo es gerade steht */
  stand: number;
  /** Sekunden für den ganzen Weg */
  dauer: number;
  stelle: (stand: number) => void;
}

export interface Teile {
  gruppe: Group;
  haustuer: Beweglich;
  tor: Beweglich;
  terrassentuer: Beweglich;
  jalousien: Beweglich;
  /** Ein Schritt. Liefert true, solange sich etwas bewegt (dann müssen auch die Schatten neu). */
  schritt: (dt: number) => boolean;
  entferne: () => void;
}

const weich = (t: number) => t * t * (3 - 2 * t);

export function baueTeile(stoffe: Stoffe): Teile {
  const gruppe = new Group();
  const geometrien: BufferGeometry[] = [];
  const eigene: Material[] = [];
  const stoff = (farbe: number, rauh = 0.8, metall = 0) => {
    const m = new MeshStandardMaterial({ color: farbe, roughness: rauh, metalness: metall });
    eigene.push(m);
    return m;
  };
  const kasten = (b: number, h: number, t: number, x = 0, y = 0, z = 0) => {
    const g = new BoxGeometry(b, h, t);
    g.translate(x, y, z);
    return g;
  };
  const netz = (g: BufferGeometry, m: Material, schatten = true) => {
    geometrien.push(g);
    const n = new Mesh(g, m);
    n.castShadow = schatten;
    n.receiveShadow = schatten;
    return n;
  };

  /* ---------- Haustür: dreht nach innen, Band rechts */
  const t = OEFFNUNG.haustuer;
  const breite = t.x1 - t.x0;
  const tuer = new Group();
  tuer.position.set(t.x1, 0, M.NISCHE + 0.125);
  const blatt = mergeGeometries([
    kasten(breite - 0.02, t.y1 - 0.02, 0.05, -breite / 2, t.y1 / 2, 0),
    // Griffstange außen
    kasten(0.03, 1.1, 0.03, -breite + 0.14, 1.1, 0.05),
  ]);
  tuer.add(netz(blatt, stoff(TON.dunkel, 0.6)));
  gruppe.add(tuer);

  /* ---------- Garagentor: fährt nach oben, der Sturz schneidet es ab */
  const g = OEFFNUNG.tor;
  const torbreite = g.x1 - g.x0;
  const torstoff = stoff(TON.dunkel, 0.7);
  torstoff.clippingPlanes = [new Plane(new Vector3(0, -1, 0), g.y1)];
  torstoff.clipShadows = true;
  const sektionen: BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const h = g.y1 / 5;
    sektionen.push(kasten(torbreite - 0.02, h - 0.025, 0.05, torbreite / 2, i * h + h / 2, 0));
  }
  sektionen.push(kasten(0.5, 0.04, 0.03, torbreite / 2, 0.24, 0.04));
  const tor = netz(mergeGeometries(sektionen), torstoff);
  tor.position.set(g.x0, 0, M.Z1 - 0.2);
  gruppe.add(tor);

  /* ---------- Schiebetür zur Dachterrasse: gleitet zur Seite */
  const s = OEFFNUNG.terrassentuer;
  const sbreite = s.x1 - s.x0;
  const shoehe = s.y1 - s.y0;
  const schiebe = new Group();
  schiebe.position.set(s.x0, s.y0, M.DZ - 0.19);
  const rahmenteile = mergeGeometries([
    kasten(sbreite, 0.06, 0.05, sbreite / 2, 0.03, 0),
    kasten(sbreite, 0.06, 0.05, sbreite / 2, shoehe - 0.03, 0),
    kasten(0.06, shoehe, 0.05, 0.03, shoehe / 2, 0),
    kasten(0.06, shoehe, 0.05, sbreite - 0.03, shoehe / 2, 0),
  ]);
  schiebe.add(netz(rahmenteile, stoff(TON.rahmen, 0.6)));
  const scheibe = netz(kasten(sbreite - 0.12, shoehe - 0.12, 0.012, sbreite / 2, shoehe / 2, 0), stoffe.glas, false);
  scheibe.renderOrder = 2;
  schiebe.add(scheibe);
  gruppe.add(schiebe);

  /* ---------- Jalousien im Wohnraum: fahren von oben herunter, der Sturz schneidet sie ab */
  const lamellenstoff = stoff(0xd6d9dd, 0.55, 0.25);
  lamellenstoff.clippingPlanes = [new Plane(new Vector3(0, -1, 0), OEFFNUNG.wohnVorn.y1)];
  lamellenstoff.clipShadows = true;
  const behang = (laenge: number, hoehe: number, entlangX: boolean) => {
    const lamellen: BufferGeometry[] = [];
    for (let y = 0.04; y < hoehe; y += 0.085) {
      const l = entlangX ? kasten(laenge, 0.07, 0.012, laenge / 2, y, 0) : kasten(0.012, 0.07, laenge, 0, y, laenge / 2);
      lamellen.push(l);
    }
    return mergeGeometries(lamellen);
  };
  const v = OEFFNUNG.wohnVorn;
  const vorn = netz(behang(v.x1 - v.x0 - 0.02, v.y1 - v.y0, true), lamellenstoff);
  vorn.position.set(v.x0 + 0.01, v.y0, M.Z1 - 0.045);
  const w = OEFFNUNG.wohnSeite;
  const seite = netz(behang(w.z1 - w.z0 - 0.02, w.y1 - w.y0, false), lamellenstoff);
  seite.position.set(M.X1 - 0.045, w.y0, w.z0 + 0.01);
  gruppe.add(vorn, seite);
  const hub = v.y1 - v.y0 + 0.02;

  const teil = (dauer: number, stelle: (stand: number) => void): Beweglich => {
    stelle(0);
    return { ziel: 0, stand: 0, dauer, stelle };
  };
  const haustuer = teil(0.75, (x) => {
    tuer.rotation.y = -weich(x) * 1.5;
  });
  const garagentor = teil(1.5, (x) => {
    tor.position.y = weich(x) * (g.y1 + 0.02);
  });
  const terrassentuer = teil(0.8, (x) => {
    schiebe.position.x = s.x0 + weich(x) * (sbreite + 0.25);
  });
  const jalousien = teil(1.6, (x) => {
    // 0 = oben (verschwunden), 1 = unten
    const y = hub * (1 - weich(x));
    vorn.position.y = v.y0 + y;
    seite.position.y = w.y0 + y;
  });
  const alle = [haustuer, garagentor, terrassentuer, jalousien];

  return {
    gruppe,
    haustuer,
    tor: garagentor,
    terrassentuer,
    jalousien,
    schritt: (dt) => {
      let bewegt = false;
      for (const b of alle) {
        if (b.stand === b.ziel) continue;
        const weg = dt / b.dauer;
        b.stand = b.ziel > b.stand ? Math.min(b.ziel, b.stand + weg) : Math.max(b.ziel, b.stand - weg);
        b.stelle(b.stand);
        bewegt = true;
      }
      return bewegt;
    },
    entferne: () => {
      for (const geo of geometrien) geo.dispose();
      for (const m of eigene) m.dispose();
    },
  };
}
