import { BufferGeometry, Color, Float32BufferAttribute, Matrix3, Matrix4, Vector3 } from "three";

/**
 * Baukasten für das 3D-Haus: sammelt Flächen je Werkstoff und macht am Ende je Werkstoff ein einziges Netz.
 * So bleibt die Zahl der Zeichenaufrufe klein, auch wenn das Haus aus tausenden Flächen besteht.
 *
 * Maße in Metern. Achsen: x nach rechts, y nach oben, z nach vorn zum Betrachter (Vorderseite des Hauses).
 */

export type V3 = readonly [number, number, number];

/** Rechteckige Öffnung in einer Fläche: a entlang der Fläche, b quer dazu (bei Wänden die Höhe) */
export interface Loch {
  a0: number;
  a1: number;
  b0: number;
  b1: number;
}

interface Lager {
  p: number[];
  n: number[];
  uv: number[];
  c: number[];
}

/**
 * Zerlegt ein Rechteck mit rechteckigen Löchern in Rechtecke ohne Loch.
 * Liefert Kacheln als [a0, a1, b0, b1].
 */
export function kacheln(a0: number, a1: number, b0: number, b1: number, loecher: readonly Loch[]): [number, number, number, number][] {
  const innen = loecher
    .map((l) => ({ a0: Math.max(a0, l.a0), a1: Math.min(a1, l.a1), b0: Math.max(b0, l.b0), b1: Math.min(b1, l.b1) }))
    .filter((l) => l.a1 - l.a0 > 1e-6 && l.b1 - l.b0 > 1e-6);
  if (innen.length === 0) return [[a0, a1, b0, b1]];
  const schnitte = Array.from(new Set([a0, a1, ...innen.flatMap((l) => [l.a0, l.a1])])).sort((x, y) => x - y);
  const aus: [number, number, number, number][] = [];
  for (let i = 0; i < schnitte.length - 1; i++) {
    const s0 = schnitte[i];
    const s1 = schnitte[i + 1];
    if (s1 - s0 < 1e-6) continue;
    const mitte = (s0 + s1) / 2;
    const quer = innen.filter((l) => l.a0 < mitte && l.a1 > mitte).sort((x, y) => x.b0 - y.b0);
    let unten = b0;
    for (const l of quer) {
      if (l.b0 - unten > 1e-6) aus.push([s0, s1, unten, l.b0]);
      unten = Math.max(unten, l.b1);
    }
    if (b1 - unten > 1e-6) aus.push([s0, s1, unten, b1]);
  }
  // Nachbarn gleicher Höhe zusammenfassen: weniger Flächen
  const fertig: [number, number, number, number][] = [];
  for (const k of aus) {
    const vor = fertig.find((f) => Math.abs(f[1] - k[0]) < 1e-6 && Math.abs(f[2] - k[2]) < 1e-6 && Math.abs(f[3] - k[3]) < 1e-6);
    if (vor) vor[1] = k[1];
    else fertig.push([...k]);
  }
  return fertig;
}

/** Werkstoffe einer Wand: Vorderseite (+z oder +x), Rückseite, Laibung der Öffnungen, Oberkante */
export interface Wandstoffe {
  vorn: string;
  hinten: string;
  kante?: string;
  oben?: string;
}

/** Werkstoff mit festem Farbton, zum Beispiel "bunt#f1efea". Der Ton gilt nur für diese eine Fläche. */
export function st(stoff: string, ton: number): string {
  return `${stoff}#${ton.toString(16).padStart(6, "0")}`;
}

export class Sammler {
  private lager = new Map<string, Lager>();
  private farbe: [number, number, number] = [1, 1, 1];
  private grundton: [number, number, number] = [1, 1, 1];
  private hilf = new Color();
  private toene = new Map<string, [number, number, number]>();

  /** Liefert das Lager des Werkstoffs. Trägt der Name einen Ton ("stoff#rrggbb"), gilt er für diese Fläche. */
  private fach(stoff: string): Lager {
    let name = stoff;
    const raute = stoff.indexOf("#");
    if (raute >= 0) {
      name = stoff.slice(0, raute);
      let ton = this.toene.get(stoff);
      if (!ton) {
        this.hilf.set(parseInt(stoff.slice(raute + 1), 16));
        ton = [this.hilf.r, this.hilf.g, this.hilf.b];
        this.toene.set(stoff, ton);
      }
      this.farbe = ton;
    } else {
      this.farbe = this.grundton;
    }
    let l = this.lager.get(name);
    if (!l) {
      l = { p: [], n: [], uv: [], c: [] };
      this.lager.set(name, l);
    }
    return l;
  }

  /** Farbton aller folgenden Flächen, deren Werkstoff keinen eigenen Ton nennt. */
  ton(hex: number): this {
    this.hilf.set(hex);
    this.grundton = [this.hilf.r, this.hilf.g, this.hilf.b];
    return this;
  }

  /** Viereck aus vier Ecken, gegen den Uhrzeigersinn von außen gesehen. */
  viereck(stoff: string, a: V3, b: V3, c: V3, d: V3, uv?: readonly [number, number, number, number, number, number, number, number]): this {
    const l = this.fach(stoff);
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = d[0] - a[0];
    const vy = d[1] - a[1];
    const vz = d[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const laenge = Math.hypot(nx, ny, nz) || 1;
    nx /= laenge;
    ny /= laenge;
    nz /= laenge;
    const ecken = [a, b, c, a, c, d];
    const uvs = uv ? [uv[0], uv[1], uv[2], uv[3], uv[4], uv[5], uv[0], uv[1], uv[4], uv[5], uv[6], uv[7]] : null;
    for (let i = 0; i < 6; i++) {
      const e = ecken[i];
      l.p.push(e[0], e[1], e[2]);
      l.n.push(nx, ny, nz);
      l.c.push(this.farbe[0], this.farbe[1], this.farbe[2]);
      if (uvs) l.uv.push(uvs[i * 2], uvs[i * 2 + 1]);
      else if (Math.abs(ny) > 0.9) l.uv.push(e[0], e[2]);
      else if (Math.abs(nx) > Math.abs(nz)) l.uv.push(e[2], e[1]);
      else l.uv.push(e[0], e[1]);
    }
    return this;
  }

  dreieck(stoff: string, a: V3, b: V3, c: V3): this {
    const l = this.fach(stoff);
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const laenge = Math.hypot(nx, ny, nz) || 1;
    nx /= laenge;
    ny /= laenge;
    nz /= laenge;
    for (const e of [a, b, c]) {
      l.p.push(e[0], e[1], e[2]);
      l.n.push(nx, ny, nz);
      l.c.push(this.farbe[0], this.farbe[1], this.farbe[2]);
      l.uv.push(e[0], e[1]);
    }
    return this;
  }

  /** Fläche in der Ebene z, Blick nach vorn (+z) oder nach hinten */
  flaecheZ(stoff: string, z: number, x0: number, x1: number, y0: number, y1: number, nachVorn: boolean): this {
    return nachVorn
      ? this.viereck(stoff, [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z])
      : this.viereck(stoff, [x1, y0, z], [x0, y0, z], [x0, y1, z], [x1, y1, z]);
  }

  /** Fläche in der Ebene x, Blick nach rechts (+x) oder nach links */
  flaecheX(stoff: string, x: number, z0: number, z1: number, y0: number, y1: number, nachRechts: boolean): this {
    return nachRechts
      ? this.viereck(stoff, [x, y0, z1], [x, y0, z0], [x, y1, z0], [x, y1, z1])
      : this.viereck(stoff, [x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]);
  }

  /** Fläche in der Höhe y, Blick nach oben oder nach unten */
  flaecheY(stoff: string, y: number, x0: number, x1: number, z0: number, z1: number, nachOben: boolean): this {
    return nachOben
      ? this.viereck(stoff, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0])
      : this.viereck(stoff, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]);
  }

  /** Quader. "ohne" nennt Seiten, die wegfallen: "+x-x+y-y+z-z" */
  quader(stoff: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, ohne = ""): this {
    if (!ohne.includes("+x")) this.flaecheX(stoff, x1, z0, z1, y0, y1, true);
    if (!ohne.includes("-x")) this.flaecheX(stoff, x0, z0, z1, y0, y1, false);
    if (!ohne.includes("+y")) this.flaecheY(stoff, y1, x0, x1, z0, z1, true);
    if (!ohne.includes("-y")) this.flaecheY(stoff, y0, x0, x1, z0, z1, false);
    if (!ohne.includes("+z")) this.flaecheZ(stoff, z1, x0, x1, y0, y1, true);
    if (!ohne.includes("-z")) this.flaecheZ(stoff, z0, x0, x1, y0, y1, false);
    return this;
  }

  /**
   * Wand entlang x, dünn in z (von z0 bis z1). Löcher: a = x, b = Höhe.
   * "vorn" ist die Seite nach +z, "hinten" die nach -z.
   */
  wandX(stoffe: Wandstoffe, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, loecher: readonly Loch[] = [], enden = true): this {
    const kante = stoffe.kante ?? stoffe.vorn;
    for (const [a0, a1, b0, b1] of kacheln(x0, x1, y0, y1, loecher)) {
      this.flaecheZ(stoffe.vorn, z1, a0, a1, b0, b1, true);
      this.flaecheZ(stoffe.hinten, z0, a0, a1, b0, b1, false);
    }
    this.flaecheY(stoffe.oben ?? kante, y1, x0, x1, z0, z1, true);
    if (enden) {
      this.flaecheX(kante, x0, z0, z1, y0, y1, false);
      this.flaecheX(kante, x1, z0, z1, y0, y1, true);
    }
    for (const l of loecher) {
      this.flaecheX(kante, l.a0, z0, z1, l.b0, l.b1, true);
      this.flaecheX(kante, l.a1, z0, z1, l.b0, l.b1, false);
      this.flaecheY(kante, l.b1, l.a0, l.a1, z0, z1, false);
      if (l.b0 - y0 > 1e-6) this.flaecheY(kante, l.b0, l.a0, l.a1, z0, z1, true);
    }
    return this;
  }

  /**
   * Wand entlang z, dünn in x (von x0 bis x1). Löcher: a = z, b = Höhe.
   * "vorn" ist die Seite nach +x, "hinten" die nach -x.
   */
  wandZ(stoffe: Wandstoffe, z0: number, z1: number, x0: number, x1: number, y0: number, y1: number, loecher: readonly Loch[] = [], enden = true): this {
    const kante = stoffe.kante ?? stoffe.vorn;
    for (const [a0, a1, b0, b1] of kacheln(z0, z1, y0, y1, loecher)) {
      this.flaecheX(stoffe.vorn, x1, a0, a1, b0, b1, true);
      this.flaecheX(stoffe.hinten, x0, a0, a1, b0, b1, false);
    }
    this.flaecheY(stoffe.oben ?? kante, y1, x0, x1, z0, z1, true);
    if (enden) {
      this.flaecheZ(kante, z0, x0, x1, y0, y1, false);
      this.flaecheZ(kante, z1, x0, x1, y0, y1, true);
    }
    for (const l of loecher) {
      this.flaecheZ(kante, l.a0, x0, x1, l.b0, l.b1, true);
      this.flaecheZ(kante, l.a1, x0, x1, l.b0, l.b1, false);
      this.flaecheY(kante, l.b1, x0, x1, l.a0, l.a1, false);
      if (l.b0 - y0 > 1e-6) this.flaecheY(kante, l.b0, x0, x1, l.a0, l.a1, true);
    }
    return this;
  }

  /** Decke oder Boden als Platte mit Löchern (Treppenauge). Löcher: a = x, b = z. */
  platte(oben: string, unten: string, kante: string, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, loecher: readonly Loch[] = []): this {
    for (const [a0, a1, b0, b1] of kacheln(x0, x1, z0, z1, loecher)) {
      this.flaecheY(oben, y1, a0, a1, b0, b1, true);
      this.flaecheY(unten, y0, a0, a1, b0, b1, false);
    }
    this.flaecheX(kante, x0, z0, z1, y0, y1, false);
    this.flaecheX(kante, x1, z0, z1, y0, y1, true);
    this.flaecheZ(kante, z0, x0, x1, y0, y1, false);
    this.flaecheZ(kante, z1, x0, x1, y0, y1, true);
    for (const l of loecher) {
      this.flaecheX(kante, l.a0, l.b0, l.b1, y0, y1, true);
      this.flaecheX(kante, l.a1, l.b0, l.b1, y0, y1, false);
      this.flaecheZ(kante, l.b0, l.a0, l.a1, y0, y1, true);
      this.flaecheZ(kante, l.b1, l.a0, l.a1, y0, y1, false);
    }
    return this;
  }

  /** Übernimmt eine fertige Geometrie (Zylinder, Kugel, Rohr), verschoben und gedreht durch die Matrix. */
  nimm(stoff: string, geometrie: BufferGeometry, matrix?: Matrix4): this {
    const l = this.fach(stoff);
    const g = geometrie.index ? geometrie.toNonIndexed() : geometrie;
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const uv = g.getAttribute("uv");
    const punkt = new Vector3();
    const richtung = new Vector3();
    const normalmatrix = matrix ? new Matrix3().getNormalMatrix(matrix) : null;
    for (let i = 0; i < p.count; i++) {
      punkt.fromBufferAttribute(p, i);
      if (matrix) punkt.applyMatrix4(matrix);
      l.p.push(punkt.x, punkt.y, punkt.z);
      if (n) {
        richtung.fromBufferAttribute(n, i);
        if (normalmatrix) richtung.applyMatrix3(normalmatrix).normalize();
        l.n.push(richtung.x, richtung.y, richtung.z);
      } else l.n.push(0, 1, 0);
      l.c.push(this.farbe[0], this.farbe[1], this.farbe[2]);
      if (uv) l.uv.push(uv.getX(i), uv.getY(i));
      else l.uv.push(0, 0);
    }
    if (g !== geometrie) g.dispose();
    return this;
  }

  /** Namen aller Werkstoffe, zu denen Flächen gesammelt wurden */
  stoffe(): string[] {
    return Array.from(this.lager.keys());
  }

  /** Fertiges Netz eines Werkstoffs */
  geometrie(stoff: string): BufferGeometry {
    const l = this.lager.get(stoff) ?? { p: [], n: [], uv: [], c: [] };
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(l.p, 3));
    g.setAttribute("normal", new Float32BufferAttribute(l.n, 3));
    g.setAttribute("uv", new Float32BufferAttribute(l.uv, 2));
    g.setAttribute("color", new Float32BufferAttribute(l.c, 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  /** Zahl der Dreiecke, zur Kontrolle */
  dreiecke(): number {
    let summe = 0;
    for (const l of this.lager.values()) summe += l.p.length / 9;
    return summe;
  }
}

/** Matrix: erst skalieren, dann drehen (Winkel um x, y, z in Bogenmaß), dann verschieben */
export function lage(x: number, y: number, z: number, drehX = 0, drehY = 0, drehZ = 0, sx = 1, sy = 1, sz = 1): Matrix4 {
  const m = new Matrix4();
  const d = new Matrix4();
  m.makeScale(sx, sy, sz);
  if (drehZ) m.premultiply(d.makeRotationZ(drehZ));
  if (drehX) m.premultiply(d.makeRotationX(drehX));
  if (drehY) m.premultiply(d.makeRotationY(drehY));
  m.premultiply(d.makeTranslation(x, y, z));
  return m;
}
