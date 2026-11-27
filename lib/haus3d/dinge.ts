import {
  AdditiveBlending,
  Box3,
  BoxGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  type MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import type { LeistungId } from "@/daten/adressen";
import { Sammler, lage, st } from "./bau";
import { M, RAEUME, TON, type RaumId } from "./haus";
import { ROT, type Stoffe } from "./stoffe";

/**
 * Die neun Leistungen als Dinge im Haus, jedes mit seiner Bewegung:
 * Zählerschrank mit Automaten, Messgerät, Wallbox mit Auto, Solarmodule, Schalter und Leuchten,
 * Bedienfeld, Netzwerkschrank, Fangstange mit Blitz, SAT-Schüssel.
 *
 * Jedes Ding bekommt je Bild seine "kraft" (0 = ruht, 1 = gewählt) und die Sekunden seit der Wahl.
 */

export interface Wunsch {
  /** Helligkeit des Raumlichts, das die Leistung selbst schaltet (0 bis 1). Ohne Angabe: voll an. */
  raumlicht?: number;
  /** Jalousien im Wohnraum: 0 oben, 1 unten */
  jalousien?: number;
  /** Aufblitzen der ganzen Szene (Blitzschlag), 0 bis 1 */
  blitz?: number;
}

export interface Ding {
  id: LeistungId;
  /** Unsichtbare Kästen um das Ding: Ein Klick hinein wählt die Leistung */
  griffe: Box3[];
  /** Ein Bild weiter. Liefert, was das Ding vom Haus will. */
  schritt: (kraft: number, seit: number, zeit: number) => Wunsch | void;
}

export interface Dinge {
  gruppe: Group;
  liste: Ding[];
  /** Linien brauchen die Größe der Zeichenfläche */
  groesse: (breite: number, hoehe: number) => void;
  entferne: () => void;
}

const GRUEN = 0x3fd47c;
const GELB = 0xffb648;
const WARM = 0xffe2b0;

export function baueDinge(stoffe: Stoffe): Dinge {
  const gruppe = new Group();
  const geometrien: BufferGeometry[] = [];
  const eigene: Material[] = [];
  const linien: LineMaterial[] = [];
  const liste: Ding[] = [];

  /* ---------- Helfer */
  const merke = <T extends BufferGeometry>(g: T): T => {
    geometrien.push(g);
    return g;
  };
  /** Selbstleuchtende Fläche. "kraft" setzt die Helligkeit, ohne die Farbe zu verlieren. */
  const licht = (farbe: number, opt: { durchsichtig?: boolean; additiv?: boolean; beidseitig?: boolean } = {}) => {
    const grund = new Color(farbe);
    const m = new MeshBasicMaterial({ color: grund.clone(), toneMapped: false, transparent: !!opt.durchsichtig || !!opt.additiv });
    if (opt.beidseitig) m.side = DoubleSide;
    if (opt.additiv) {
      m.blending = AdditiveBlending;
      m.depthWrite = false;
    }
    eigene.push(m);
    return {
      stoff: m,
      /** 0 = dunkel (fast schwarz), 1 = volle Farbe */
      helle: (kraft: number) => m.color.copy(grund).multiplyScalar(0.07 + 0.93 * Math.max(0, kraft)),
      deck: (kraft: number) => {
        m.opacity = Math.max(0, Math.min(1, kraft));
        m.visible = m.opacity > 0.004;
      },
    };
  };
  const netz = (g: BufferGeometry, m: Material, schatten = false) => {
    const n = new Mesh(merke(g), m);
    n.castShadow = schatten;
    n.receiveShadow = schatten;
    gruppe.add(n);
    return n;
  };
  /** Baut aus einem Sammler je Werkstoff ein Netz und hängt es ein. */
  const haenge = (s: Sammler) => {
    for (const name of s.stoffe()) {
      const n = new Mesh(merke(s.geometrie(name)), stoffe.nach[name]);
      n.castShadow = true;
      n.receiveShadow = true;
      gruppe.add(n);
    }
  };
  const R = (raum: RaumId, ton: number) => st(RAEUME[raum].stoff, ton);
  const kasten = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => new Box3(new Vector3(x0, y0, z0), new Vector3(x1, y1, z1));
  const quader = (b: number, h: number, t: number, x: number, y: number, z: number) => {
    const g = new BoxGeometry(b, h, t);
    g.translate(x, y, z);
    return g;
  };
  /** Dicke Linie durch Punkte. Liegt über allem, damit man sie auch hinter Wänden sieht. */
  const linie = (punkte: Vector3[], farbe: number, breite: number, deckkraft = 1) => {
    const g = merke(new LineGeometry());
    g.setPositions(punkte.flatMap((p) => [p.x, p.y, p.z]));
    const m = new LineMaterial({ color: farbe, linewidth: breite, transparent: true, opacity: deckkraft, depthTest: false, depthWrite: false });
    linien.push(m);
    const l = new Line2(g, m);
    l.computeLineDistances();
    l.renderOrder = 6;
    l.frustumCulled = false;
    l.visible = false;
    gruppe.add(l);
    return { l, m, g };
  };
  const puls = (zeit: number, tempo = 1, versatz = 0) => 0.5 + 0.5 * Math.sin(zeit * tempo * Math.PI * 2 + versatz);
  /** Kugeln, die eine Kurve entlanglaufen: Strom im Kabel */
  const perlen = (kurve: CatmullRomCurve3, anzahl: number, farbe: number, radius = 0.028, schweif = 0) => {
    const stoff = licht(farbe);
    const kugeln = Array.from({ length: anzahl }, () => netz(new SphereGeometry(radius, 10, 8), stoff.stoff));
    const ort = new Vector3();
    return {
      stoff,
      /** "lauf" von 0 bis 1 entlang der Kurve. Mit Schweif folgen die Kugeln dicht hintereinander, sonst laufen sie im Kreis. */
      setze: (lauf: number, sichtbar: boolean) => {
        kugeln.forEach((k, i) => {
          const u = schweif ? lauf - i * schweif : (((lauf + i / anzahl) % 1) + 1) % 1;
          k.visible = sichtbar && u >= 0 && u <= 1;
          if (!k.visible) return;
          kurve.getPointAt(u, ort);
          k.position.copy(ort);
        });
      },
    };
  };

  /* ============================================================ 5 Zählerschrank & Verteilerbau */
  {
    const x0 = 1.2;
    const x1 = 2.3;
    const y0 = 0.35;
    const y1 = 2.05;
    const z0 = M.W;
    const z1 = 0.5;
    const s = new Sammler();
    const weiss = R("technik", 0xeef0f2);
    const grau = R("technik", 0xcfd4d9);
    // Gehäuse, nach vorn offen
    s.quader(weiss, x0, x1, y0, y1, z0 + 0.002, z0 + 0.02, "-z");
    s.quader(weiss, x0, x0 + 0.02, y0, y1, z0, z1, "-z").quader(weiss, x1 - 0.02, x1, y0, y1, z0, z1, "-z");
    s.quader(weiss, x0, x1, y1 - 0.02, y1, z0, z1, "-z").quader(weiss, x0, x1, y0, y0 + 0.02, z0, z1, "-z");
    // Abdeckung mit Feldern
    s.quader(grau, x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, z0 + 0.02, z0 + 0.1, "-z");
    // Zählerfeld oben: zwei Zähler mit Anzeige
    for (const x of [1.36, 1.86]) {
      s.quader(R("technik", TON.schwarz), x, x + 0.34, 1.52, 1.95, z0 + 0.1, z0 + 0.16, "-z");
      s.quader(R("technik", 0xe9eef2), x + 0.05, x + 0.29, 1.78, 1.9, z0 + 0.16, z0 + 0.163, "-z");
    }
    // Hutschienen
    for (const y of [0.62, 0.92, 1.22]) s.quader(R("technik", TON.mittel), x0 + 0.08, x1 - 0.08, y - 0.012, y + 0.012, z0 + 0.1, z0 + 0.115, "-z");
    // Hausanschlusskasten links an der Wand
    s.quader(R("technik", TON.grau), 0.31, 0.5, 0.85, 1.35, 0.32, 0.56, "-x");
    haenge(s);

    // 36 Sicherungsautomaten: Gehäuse, Hebel und Leuchtpunkt als Vielfache
    const reihen = [0.62, 0.92, 1.22];
    const jeReihe = 12;
    const anzahl = reihen.length * jeReihe;
    const koerper = new InstancedMesh(merke(new BoxGeometry(0.058, 0.12, 0.05)), stoffe.nach[RAEUME.technik.stoff], anzahl);
    koerper.geometry.setAttribute("color", koerper.geometry.getAttribute("position").clone());
    {
      const farbe = koerper.geometry.getAttribute("color");
      const c = new Color(0xf3f4f5);
      for (let i = 0; i < farbe.count; i++) farbe.setXYZ(i, c.r, c.g, c.b);
    }
    const hebelstoff = licht(0x2d3238);
    const hebel = new InstancedMesh(merke(new BoxGeometry(0.022, 0.036, 0.03)), hebelstoff.stoff, anzahl);
    const punktstoff = licht(0xffffff);
    const punkte = new InstancedMesh(merke(new BoxGeometry(0.016, 0.012, 0.004)), punktstoff.stoff, anzahl);
    const plaetze: Vector3[] = [];
    const m4 = new Matrix4();
    for (let r = 0; r < reihen.length; r++) {
      for (let i = 0; i < jeReihe; i++) {
        const p = new Vector3(x0 + 0.13 + i * 0.0705, reihen[r], z0 + 0.14);
        plaetze.push(p);
        koerper.setMatrixAt(r * jeReihe + i, m4.makeTranslation(p.x, p.y, p.z));
      }
    }
    koerper.castShadow = false;
    gruppe.add(koerper, hebel, punkte);
    const aus = new Color(0x40464d);
    const an = new Color(GRUEN);
    const haupt = new Color(ROT);
    const stelleAutomaten = (zahlAn: number) => {
      for (let i = 0; i < anzahl; i++) {
        const p = plaetze[i];
        const ein = i < zahlAn;
        hebel.setMatrixAt(i, m4.makeTranslation(p.x, p.y + (ein ? 0.022 : -0.022), p.z + 0.035));
        punkte.setMatrixAt(i, m4.makeTranslation(p.x, p.y + 0.048, p.z + 0.027));
        punkte.setColorAt(i, ein ? (i % jeReihe === 0 ? haupt : an) : aus);
      }
      hebel.instanceMatrix.needsUpdate = true;
      punkte.instanceMatrix.needsUpdate = true;
      if (punkte.instanceColor) punkte.instanceColor.needsUpdate = true;
    };
    stelleAutomaten(0);

    // Tür: Band links, schwingt nach vorn auf
    const tuer = new Group();
    tuer.position.set(x0, 0, z1);
    const blatt = new Sammler();
    blatt.quader(R("technik", 0xf2f3f4), 0, x1 - x0, y0, y1, 0, 0.018);
    blatt.quader(R("technik", TON.schwarz), x1 - x0 - 0.1, x1 - x0 - 0.07, 1.05, 1.3, 0.018, 0.04);
    const blattnetz = new Mesh(merke(blatt.geometrie(RAEUME.technik.stoff)), stoffe.nach[RAEUME.technik.stoff]);
    blattnetz.castShadow = true;
    tuer.add(blattnetz);
    gruppe.add(tuer);

    // Anzeige der Zähler leuchtet, wenn der Schrank gewählt ist
    const anzeige = licht(0xbfe8ff);
    netz(quader(0.24, 0.12, 0.002, 1.53, 1.84, z0 + 0.165), anzeige.stoff);
    netz(quader(0.24, 0.12, 0.002, 2.03, 1.84, z0 + 0.165), anzeige.stoff);

    let gezeigt = -1;
    liste.push({
      id: "verteilerbau",
      griffe: [kasten(x0 - 0.05, x1 + 0.05, y0 - 0.05, y1 + 0.05, z0, 0.75)],
      schritt: (kraft, seit) => {
        tuer.rotation.y = -kraft * 1.95;
        anzeige.helle(kraft * (0.75 + 0.25 * puls(seit, 0.5)));
        // Automaten schalten nacheinander ein, dann alle aus und von vorn
        const runde = seit % 7.5;
        const zahl = kraft < 0.5 ? 0 : Math.min(anzahl, Math.max(0, Math.floor((runde - 0.7) / 0.075)));
        if (zahl !== gezeigt) {
          gezeigt = zahl;
          stelleAutomaten(zahl);
        }
      },
    });
  }

  /* ============================================================ 6 Prüfung: Messgerät am Verteiler */
  {
    const s = new Sammler();
    // Kleiner Rollwagen
    s.quader(R("technik", TON.mittel), 2.55, 3.1, 0.9, 0.94, 0.55, 1.0);
    s.quader(R("technik", TON.mittel), 2.55, 3.1, 0.3, 0.33, 0.55, 1.0);
    for (const [x, z] of [[2.57, 0.57], [3.05, 0.57], [2.57, 0.95], [3.05, 0.95]] as const) s.quader(R("technik", TON.schwarz), x, x + 0.03, 0.04, 0.9, z, z + 0.03, "+y");
    // Koffer auf dem unteren Boden
    s.quader(R("technik", TON.schwarz), 2.62, 3.02, 0.33, 0.55, 0.62, 0.92, "-y");
    haenge(s);

    // Messgerät: steht schräg auf dem Wagen, Anzeige nach vorn
    const geraet = new Group();
    geraet.position.set(2.82, 0.94, 0.74);
    geraet.rotation.x = -0.38;
    const koerper = new Sammler();
    koerper.quader(R("technik", 0xf1f1ee), -0.14, 0.14, 0, 0.36, -0.04, 0.04);
    koerper.quader(R("technik", ROT), -0.14, 0.14, 0, 0.05, -0.045, 0.045);
    koerper.quader(R("technik", ROT), -0.14, 0.14, 0.31, 0.36, -0.045, 0.045);
    koerper.quader(R("technik", TON.schwarz), -0.11, 0.11, 0.17, 0.3, 0.04, 0.044);
    koerper.ton(TON.schwarz).nimm(RAEUME.technik.stoff, new CylinderGeometry(0.045, 0.045, 0.02, 20), lage(0, 0.105, 0.05, Math.PI / 2, 0, 0));
    const koerpernetz = new Mesh(merke(koerper.geometrie(RAEUME.technik.stoff)), stoffe.nach[RAEUME.technik.stoff]);
    koerpernetz.castShadow = true;
    geraet.add(koerpernetz);
    const balkenstoff = licht(0xd9f3ff);
    const balken = new Mesh(merke(new PlaneGeometry(0.18, 0.035)), balkenstoff.stoff);
    balken.geometry.translate(0.09, 0, 0);
    balken.position.set(-0.09, 0.205, 0.0455);
    geraet.add(balken);
    const lampen = [0, 1, 2].map((i) => {
      const l = licht(GRUEN);
      const n = new Mesh(merke(new CircleGeometry(0.014, 14)), l.stoff);
      n.position.set(-0.05 + i * 0.05, 0.265, 0.0455);
      geraet.add(n);
      return l;
    });
    gruppe.add(geraet);

    // Messleitungen zum Schrank: rot und schwarz
    const leitung = (ziel: Vector3, farbe: number, start: number) => {
      const kurve = new CatmullRomCurve3([new Vector3(2.82 + start, 0.98, 0.72), new Vector3(2.62 + start, 0.78, 0.86), new Vector3(2.4, 0.62, 0.78), ziel]);
      const stoff = licht(farbe);
      stoff.helle(1);
      netz(new TubeGeometry(kurve, 24, 0.009, 6), stoff.stoff);
    };
    leitung(new Vector3(2.16, 0.62, 0.52), ROT, -0.05);
    leitung(new Vector3(2.08, 0.62, 0.52), 0x1b1e23, 0.05);

    // Prüfplakette: springt am Ende der Messung auf die Schranktür
    const plakette = new Group();
    plakette.position.set(2.12, 1.42, 0.521);
    const rand = licht(ROT);
    rand.helle(1);
    const mitte = licht(0xffffff);
    mitte.helle(1);
    plakette.add(new Mesh(merke(new CircleGeometry(0.07, 28)), rand.stoff));
    const innen = new Mesh(merke(new CircleGeometry(0.052, 28)), mitte.stoff);
    innen.position.z = 0.001;
    plakette.add(innen);
    gruppe.add(plakette);

    liste.push({
      id: "pruefung",
      griffe: [kasten(2.5, 3.15, 0, 1.45, 0.5, 1.05)],
      schritt: (kraft, seit) => {
        const runde = seit % 6;
        const messung = Math.min(1, Math.max(0, (runde - 0.5) / 2.4));
        balken.scale.x = Math.max(0.001, kraft > 0.5 ? messung : 0);
        balkenstoff.helle(kraft);
        lampen.forEach((l, i) => l.helle(kraft > 0.5 && runde > 1.3 + i * 0.8 ? 1 : 0));
        const klebt = kraft > 0.5 && runde > 3.3 ? Math.min(1, (runde - 3.3) / 0.25) : 0;
        // kurzes Überschwingen beim Aufkleben
        plakette.scale.setScalar(klebt === 0 ? 0.0001 : klebt < 1 ? klebt * 1.25 : 1);
      },
    });
  }

  /* ============================================================ 2 Wallbox mit Auto */
  {
    const auto = { x0: 1.4, x1: 3.15, z0: 3.0, z1: 7.0 };
    const s = new Sammler();
    const lack = R("garage", TON.auto);
    const glas = R("garage", TON.autoglas);
    const haube = 6.15;
    // Unterbau und Gürtel
    s.quader(lack, auto.x0, auto.x1, 0.28, 0.72, auto.z0, auto.z1);
    s.quader(lack, auto.x0, auto.x1, 0.72, 0.9, auto.z0, haube, "-y+z");
    // Motorhaube fällt nach vorn ab
    s.viereck(lack, [auto.x0, 0.72, auto.z1], [auto.x1, 0.72, auto.z1], [auto.x1, 0.9, haube], [auto.x0, 0.9, haube]);
    s.dreieck(lack, [auto.x1, 0.72, auto.z1], [auto.x1, 0.72, haube], [auto.x1, 0.9, haube]);
    s.dreieck(lack, [auto.x0, 0.72, haube], [auto.x0, 0.72, auto.z1], [auto.x0, 0.9, haube]);
    // Kabine: Scheiben rundum, Dach
    const d0 = 3.25;
    const dv = 5.35;
    const dh = 3.8;
    const ix = 0.14;
    s.viereck(glas, [auto.x0 + 0.02, 0.9, haube], [auto.x1 - 0.02, 0.9, haube], [auto.x1 - ix, 1.46, dv], [auto.x0 + ix, 1.46, dv]);
    s.viereck(glas, [auto.x1 - 0.02, 0.9, d0], [auto.x0 + 0.02, 0.9, d0], [auto.x0 + ix, 1.46, dh], [auto.x1 - ix, 1.46, dh]);
    s.viereck(glas, [auto.x1 - 0.02, 0.9, haube], [auto.x1 - 0.02, 0.9, d0], [auto.x1 - ix, 1.46, dh], [auto.x1 - ix, 1.46, dv]);
    s.viereck(glas, [auto.x0 + 0.02, 0.9, d0], [auto.x0 + 0.02, 0.9, haube], [auto.x0 + ix, 1.46, dv], [auto.x0 + ix, 1.46, dh]);
    s.flaecheY(lack, 1.46, auto.x0 + ix, auto.x1 - ix, dh, dv, true);
    // Räder
    for (const z of [3.8, 6.2]) {
      for (const x of [auto.x0 + 0.1, auto.x1 - 0.1]) s.ton(TON.reifen).nimm(RAEUME.garage.stoff, new CylinderGeometry(0.33, 0.33, 0.24, 18), lage(x, 0.33, z, 0, 0, Math.PI / 2));
    }
    // Kühlerblende und Kennzeichen
    s.quader(R("garage", TON.schwarz), auto.x0 + 0.4, auto.x1 - 0.4, 0.34, 0.52, auto.z1, auto.z1 + 0.012, "-z");
    s.quader(R("garage", 0xf4f6f8), 2.275 - 0.26, 2.275 + 0.26, 0.38, 0.49, auto.z1 + 0.012, auto.z1 + 0.018, "-z");
    // Wallbox an der linken Wand
    s.quader(R("garage", 0xf2f3f4), M.W, M.W + 0.13, 0.98, 1.52, 6.3, 6.7, "-x");
    s.quader(R("garage", TON.schwarz), M.W + 0.13, M.W + 0.134, 1.02, 1.2, 6.36, 6.64, "-x");
    haenge(s);

    const scheinwerfer = licht(0xf4fbff);
    netz(quader(0.46, 0.1, 0.01, auto.x0 + 0.33, 0.63, auto.z1 + 0.006), scheinwerfer.stoff);
    netz(quader(0.46, 0.1, 0.01, auto.x1 - 0.33, 0.63, auto.z1 + 0.006), scheinwerfer.stoff);

    // Leuchtring und Ladebalken an der Wallbox
    const ring = licht(GRUEN, { beidseitig: true });
    const ringnetz = netz(new RingGeometry(0.06, 0.085, 28), ring.stoff);
    ringnetz.rotation.y = Math.PI / 2;
    ringnetz.position.set(M.W + 0.136, 1.36, 6.5);
    const balken = [0, 1, 2, 3, 4].map((i) => {
      const l = licht(GRUEN);
      netz(quader(0.004, 0.022, 0.04, M.W + 0.136, 1.06 + i * 0.03, 6.5), l.stoff);
      return l;
    });

    // Ladekabel hängt durch und steckt vorn links am Auto
    const kurve = new CatmullRomCurve3([new Vector3(M.W + 0.08, 0.98, 6.5), new Vector3(0.62, 0.3, 6.6), new Vector3(1.0, 0.16, 6.52), new Vector3(auto.x0 - 0.02, 0.7, 6.42)]);
    const kabel = new Mesh(merke(new TubeGeometry(kurve, 40, 0.018, 8)), stoffe.nach[RAEUME.garage.stoff]);
    kabel.geometry.setAttribute("color", kabel.geometry.getAttribute("position").clone());
    {
      const farbe = kabel.geometry.getAttribute("color");
      const c = new Color(TON.schwarz);
      for (let i = 0; i < farbe.count; i++) farbe.setXYZ(i, c.r, c.g, c.b);
    }
    kabel.castShadow = true;
    gruppe.add(kabel);
    const strom = perlen(kurve, 4, GRUEN, 0.03);

    liste.push({
      id: "wallbox",
      griffe: [kasten(M.W, 0.6, 0.85, 1.65, 6.15, 6.85), kasten(auto.x0, auto.x1, 0.2, 1.5, auto.z0, auto.z1 + 0.05)],
      schritt: (kraft, seit, zeit) => {
        const laedt = kraft > 0.5;
        ring.helle(laedt ? 0.55 + 0.45 * puls(seit, 0.6) : 0.35 + 0.1 * puls(zeit, 0.25));
        const stand = (seit * 0.9) % 6;
        balken.forEach((l, i) => l.helle(laedt && stand > i ? 1 : 0.08));
        strom.setze(seit * 0.45, laedt);
        scheinwerfer.helle(kraft * 0.9);
      },
    });
  }

  /* ============================================================ 3 Photovoltaik */
  {
    const dach = M.DACH + 0.25;
    const neigung = 0.21;
    const b = 1.05;
    const t = 1.75;
    const felder: { x: number; z: number }[] = [];
    for (const z of [1.3, 3.55]) for (let i = 0; i < 4; i++) felder.push({ x: 5.05 + i * 1.17, z });
    const hoehe = dach + 0.07 + (t / 2) * Math.sin(neigung);
    const s = new Sammler();
    const glanz: ReturnType<typeof licht>[] = [];
    for (const { x, z } of felder) {
      s.nimm("pv", new BoxGeometry(b, 0.035, t), lage(x, hoehe, z, neigung, 0, 0));
      // Gestell
      s.ton(TON.metall);
      s.nimm("metall", new BoxGeometry(0.04, 0.38, 0.04), lage(x - 0.42, dach + 0.19, z - t * 0.42));
      s.nimm("metall", new BoxGeometry(0.04, 0.38, 0.04), lage(x + 0.42, dach + 0.19, z - t * 0.42));
      s.nimm("metall", new BoxGeometry(0.04, 0.06, 0.04), lage(x - 0.42, dach + 0.03, z + t * 0.42));
      s.nimm("metall", new BoxGeometry(0.04, 0.06, 0.04), lage(x + 0.42, dach + 0.03, z + t * 0.42));
      const l = licht(0xbfd8ff, { additiv: true });
      const n = netz(new PlaneGeometry(b - 0.06, t - 0.06), l.stoff);
      n.rotation.x = -Math.PI / 2 + neigung;
      n.position.set(x, hoehe + 0.022 * Math.cos(neigung), z + 0.022 * Math.sin(neigung));
      glanz.push(l);
    }
    haenge(s);

    liste.push({
      id: "photovoltaik",
      griffe: [kasten(4.45, 9.3, dach, dach + 0.75, 0.3, 4.6)],
      schritt: (kraft, seit) => {
        glanz.forEach((l, i) => {
          // Eine Welle aus Licht zieht über die Module
          const welle = Math.pow(Math.max(0, Math.sin(seit * 2.4 - (i % 4) * 0.7 - Math.floor(i / 4) * 0.35)), 6);
          l.deck(kraft * (0.05 + 0.5 * welle));
        });
      },
    });
  }

  /* ============================================================ 9 SAT- und Antennentechnik */
  {
    const dach = M.DACH + 0.25;
    const fuss = new Vector3(3.0, dach, 0.72);
    const s = new Sammler();
    s.ton(TON.metall);
    s.nimm("metall", new CylinderGeometry(0.028, 0.028, 1.75, 10), lage(fuss.x, dach + 0.875, fuss.z));
    s.nimm("metall", new BoxGeometry(0.34, 0.03, 0.34), lage(fuss.x, dach + 0.015, fuss.z));
    // Stabantenne oben: Träger mit Querstäben
    s.nimm("metall", new BoxGeometry(1.0, 0.025, 0.025), lage(fuss.x, dach + 1.68, fuss.z));
    for (let i = 0; i < 6; i++) s.nimm("metall", new BoxGeometry(0.014, 0.014, 0.62 - i * 0.07), lage(fuss.x - 0.45 + i * 0.18, dach + 1.68, fuss.z));
    haenge(s);

    // Schüssel: blickt nach vorn oben
    const richtung = new Vector3(0.28, 0.5, 0.82).normalize();
    const schuessel = new Group();
    schuessel.position.set(fuss.x, dach + 1.05, fuss.z + 0.08);
    schuessel.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), richtung);
    const profil = Array.from({ length: 9 }, (_, i) => {
      const r = (i / 8) * 0.44;
      return new Vector2(r, r * r * 0.62);
    });
    const schalenstoff = (stoffe.nach.bunt as MeshStandardMaterial).clone();
    schalenstoff.side = DoubleSide;
    eigene.push(schalenstoff);
    const schale = new Mesh(merke(new LatheGeometry(profil, 28)), schalenstoff);
    schale.geometry.setAttribute("color", schale.geometry.getAttribute("position").clone());
    {
      const farbe = schale.geometry.getAttribute("color");
      const c = new Color(0xe9ebed);
      for (let i = 0; i < farbe.count; i++) farbe.setXYZ(i, c.r, c.g, c.b);
    }
    schale.castShadow = true;
    schuessel.add(schale);
    const arm = new Sammler();
    arm.ton(TON.metall).nimm("metall", new CylinderGeometry(0.012, 0.012, 0.52, 6), lage(0.2, 0.3, 0, 0, 0, 0.42));
    arm.ton(TON.schwarz).nimm("metall", new BoxGeometry(0.07, 0.11, 0.07), lage(0, 0.52, 0));
    const armnetz = new Mesh(merke(arm.geometrie("metall")), stoffe.nach.metall);
    schuessel.add(armnetz);
    const lnb = licht(GRUEN);
    const lnbnetz = new Mesh(merke(new SphereGeometry(0.02, 10, 8)), lnb.stoff);
    lnbnetz.position.set(0.04, 0.5, 0);
    schuessel.add(lnbnetz);
    gruppe.add(schuessel);

    // Funkwellen laufen auf die Schüssel zu
    const wellen = [0, 1, 2].map(() => {
      const l = licht(ROT, { durchsichtig: true, beidseitig: true });
      const n = netz(new RingGeometry(0.93, 1.0, 40), l.stoff);
      n.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), richtung);
      return { l, n };
    });
    const start = schuessel.position.clone().addScaledVector(richtung, 0.3);

    liste.push({
      id: "antennentechnik",
      griffe: [kasten(2.4, 3.6, dach, dach + 1.85, 0.2, 1.4)],
      schritt: (kraft, seit) => {
        wellen.forEach(({ l, n }, i) => {
          const lauf = (seit * 0.42 + i / 3) % 1;
          // weit draußen groß und blass, an der Schüssel klein und kräftig
          const weg = 1 - lauf;
          n.position.copy(start).addScaledVector(richtung, weg * 2.2);
          n.scale.setScalar(0.16 + weg * 0.5);
          l.deck(kraft * Math.sin(lauf * Math.PI) * 0.85);
        });
        lnb.helle(kraft > 0.5 ? 0.4 + 0.6 * puls(seit, 1.4) : 0.2);
      },
    });
  }

  /* ============================================================ 8 Blitzschutz & Erdung */
  {
    const dach = M.DACH + 0.25;
    const x = 9.56;
    const z = 4.3;
    const spitze = new Vector3(x, dach + 1.8, z);
    const s = new Sammler();
    s.ton(TON.metall);
    // Fangstange mit Fuß, Ableitung an der Wand, Klemmen
    s.nimm("metall", new CylinderGeometry(0.008, 0.014, 1.8, 8), lage(x, dach + 0.9, z));
    s.nimm("metall", new BoxGeometry(0.2, 0.05, 0.2), lage(x, dach + 0.025, z));
    s.nimm("metall", new BoxGeometry(0.014, dach - 0.05, 0.014), lage(9.46, (dach + 0.05) / 2, z));
    s.nimm("metall", new BoxGeometry(0.014, 0.014, 0.02), lage(9.46, dach + 0.03, z));
    s.nimm("metall", new BoxGeometry(0.12, 0.014, 0.014), lage(9.51, dach + 0.03, z));
    for (let y = 0.9; y < dach - 0.3; y += 1.25) s.nimm("metall", new BoxGeometry(0.07, 0.03, 0.03), lage(9.435, y, z));
    // Trennstelle und Erdeinführung
    s.ton(TON.grau).nimm("metall", new BoxGeometry(0.05, 0.14, 0.06), lage(9.46, 1.35, z));
    s.ton(TON.schwarz).nimm("metall", new BoxGeometry(0.16, 0.03, 0.16), lage(9.5, 0.015, z));
    // Ringleitung auf dem Dachrand und zweite Fangstange hinten links
    s.ton(TON.metall);
    const r0 = M.D0 - 0.2;
    const r1 = M.X1 + 0.2;
    const rz0 = -0.2;
    const rz1 = M.DZ + 0.25;
    s.nimm("metall", new BoxGeometry(r1 - r0, 0.012, 0.012), lage((r0 + r1) / 2, dach + 0.03, rz0));
    s.nimm("metall", new BoxGeometry(r1 - r0, 0.012, 0.012), lage((r0 + r1) / 2, dach + 0.03, rz1));
    s.nimm("metall", new BoxGeometry(0.012, 0.012, rz1 - rz0), lage(r0, dach + 0.03, (rz0 + rz1) / 2));
    s.nimm("metall", new BoxGeometry(0.012, 0.012, rz1 - rz0), lage(r1, dach + 0.03, (rz0 + rz1) / 2));
    s.nimm("metall", new CylinderGeometry(0.008, 0.012, 1.1, 8), lage(r0, dach + 0.55, rz0));
    haenge(s);

    // Der Blitz: gezackte Linie vom Himmel in die Spitze, darunter ein breiter Schein
    const himmel = new Vector3(x + 2.4, dach + 9.5, z + 1.6);
    const zacken = 9;
    const bahn = () => {
      const p: Vector3[] = [];
      for (let i = 0; i <= zacken; i++) {
        const u = i / zacken;
        const q = himmel.clone().lerp(spitze, u);
        if (i > 0 && i < zacken) q.add(new Vector3((Math.random() - 0.5) * 1.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 1.3));
        p.push(q);
      }
      return p;
    };
    const kern = linie(bahn(), 0xffffff, 3.2);
    const schein = linie(bahn(), 0xbfd4ff, 13, 0.3);
    const neueBahn = () => {
      const p = bahn().flatMap((q) => [q.x, q.y, q.z]);
      kern.g.setPositions(p);
      schein.g.setPositions(p);
    };

    // Der Strom läuft die Ableitung hinunter in die Erde
    const ableitung = new CatmullRomCurve3([spitze, new Vector3(x, dach + 0.05, z), new Vector3(9.46, dach, z), new Vector3(9.46, 4, z), new Vector3(9.46, 0.05, z)], false, "catmullrom", 0.01);
    const strom = perlen(ableitung, 4, 0xffffff, 0.045, 0.05);
    const ringe = [0, 1].map(() => {
      const l = licht(ROT, { durchsichtig: true, beidseitig: true });
      const n = netz(new RingGeometry(0.9, 1.0, 44), l.stoff);
      n.rotation.x = -Math.PI / 2;
      n.position.set(9.52, 0.04, z);
      return { l, n };
    });

    let schlag = -1;
    liste.push({
      id: "blitzschutz",
      griffe: [kasten(9.35, 9.8, dach - 0.1, dach + 1.9, z - 0.25, z + 0.25), kasten(9.38, 9.62, 0, dach, z - 0.2, z + 0.2)],
      schritt: (kraft, seit) => {
        const aktiv = kraft > 0.6;
        const takt = 3.6;
        const runde = (seit + takt - 0.7) % takt;
        const nummer = Math.floor((seit + takt - 0.7) / takt);
        if (aktiv && nummer !== schlag) {
          schlag = nummer;
          neueBahn();
        }
        // Zwei kurze Zuckungen
        const zuckt = aktiv && (runde < 0.07 || (runde > 0.11 && runde < 0.2));
        kern.l.visible = zuckt;
        schein.l.visible = zuckt;
        const lauf = (runde - 0.04) / 0.55;
        strom.setze(lauf, aktiv && lauf > 0 && lauf < 1.2);
        ringe.forEach(({ l, n }, i) => {
          const u = (runde - 0.45 - i * 0.28) / 1.3;
          const sichtbar = aktiv && u > 0 && u < 1;
          n.scale.setScalar(0.2 + Math.max(0, u) * 1.5);
          l.deck(sichtbar ? (1 - u) * 0.8 : 0);
        });
        return { blitz: zuckt ? 1 : 0 };
      },
    });
  }

  /* ============================================================ 1 Elektroinstallation: Steckdosen, Schalter, Licht */
  {
    const wand = M.WOHN0;
    const s = new Sammler();
    const rahmen = R("wohnen", 0x2b2f35);
    const einsatz = 0xf4f4f2;
    // Doppelsteckdose unten, Schalter in Griffhöhe, Steckdosen über der Küchenzeile: dunkle Rahmen, helle Einsätze
    s.quader(rahmen, wand, wand + 0.012, 0.255, 0.375, 2.5, 2.74, "-x");
    s.quader(rahmen, wand, wand + 0.012, 1.015, 1.135, 2.56, 2.68, "-x");
    s.quader(rahmen, 6.54, 6.84, 1.025, 1.145, M.W, M.W + 0.012, "-z");
    for (const z of [2.565, 2.675]) s.ton(einsatz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.036, 0.036, 0.004, 20), lage(wand + 0.014, 0.315, z, 0, 0, Math.PI / 2));
    for (const x of [6.625, 6.755]) s.ton(einsatz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.036, 0.036, 0.004, 20), lage(x, 1.085, M.W + 0.014, Math.PI / 2, 0, 0));
    // Pendelleuchte über dem Esstisch
    s.ton(TON.schwarz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.006, 0.006, 0.85, 6), lage(7.85, 2.275, 3.4));
    s.ton(TON.schwarz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.1, 0.26, 0.17, 24, 1, true), lage(7.85, 1.78, 3.4));
    haenge(s);

    // Wippe des Schalters
    const wippe = new Mesh(merke(new BoxGeometry(0.01, 0.085, 0.085)), stoffe.nach[RAEUME.wohnen.stoff]);
    wippe.geometry.setAttribute("color", wippe.geometry.getAttribute("position").clone());
    {
      const farbe = wippe.geometry.getAttribute("color");
      const c = new Color(0xf0f0ee);
      for (let i = 0; i < farbe.count; i++) farbe.setXYZ(i, c.r, c.g, c.b);
    }
    wippe.position.set(wand + 0.016, 1.075, 2.62);
    gruppe.add(wippe);

    const birne = licht(WARM);
    const birnennetz = netz(new CircleGeometry(0.2, 24), birne.stoff);
    birnennetz.rotation.x = Math.PI / 2;
    birnennetz.position.set(7.85, 1.7, 3.4);
    const strahler = [[6.9, 1.3], [7.75, 1.3], [8.6, 1.3], [7.75, 2.2]].map(([x, z]) => {
      const l = licht(WARM);
      const n = netz(new CircleGeometry(0.07, 18), l.stoff);
      n.rotation.x = Math.PI / 2;
      n.position.set(x, M.H - 0.004, z);
      return l;
    });
    // Kontrolllicht an den Steckdosen
    const kontrolle = licht(ROT);
    netz(quader(0.003, 0.012, 0.012, wand + 0.0145, 0.345, 2.62), kontrolle.stoff);
    netz(quader(0.012, 0.012, 0.003, 6.69, 1.115, M.W + 0.0145), kontrolle.stoff);

    liste.push({
      id: "elektroinstallation",
      griffe: [kasten(wand, wand + 0.3, 0.15, 1.3, 2.35, 2.9), kasten(7.55, 8.15, 1.55, 2.0, 3.1, 3.7), kasten(6.5, 6.9, 0.95, 1.2, M.W, M.W + 0.2)],
      schritt: (kraft, seit) => {
        // Der Schalter geht an, die Leuchten folgen nacheinander. Nach einer Weile aus und wieder an.
        const runde = seit % 7;
        const ein = kraft > 0.5 && runde > 0.9 && runde < 6.2;
        wippe.rotation.z = ein ? -0.14 : 0.14;
        strahler.forEach((l, i) => l.helle(ein && runde > 1.0 + i * 0.16 ? 1 : 0.04));
        const haengt = ein && runde > 1.7;
        birne.helle(haengt ? 1 : 0.04);
        kontrolle.helle(kraft);
        const an = !ein ? 0.12 : Math.min(1, 0.12 + (runde - 0.9) * 0.9);
        return { raumlicht: kraft > 0.5 ? an : undefined };
      },
    });
  }

  /* ============================================================ 4 Smart Home: Bedienfeld, Jalousien, Lichtszene */
  {
    // Das Bedienfeld sitzt an der rechten Wand zwischen den Fenstern
    const wand = M.X1 - M.W;
    const s = new Sammler();
    s.quader(R("wohnen", TON.schwarz), wand - 0.014, wand, 1.24, 1.5, 4.09, 4.31, "+x");
    // Stehleuchte neben dem Sofa
    s.ton(TON.schwarz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.012, 0.012, 1.5, 8), lage(6.55, 0.75, 7.0));
    s.ton(TON.schwarz).nimm(RAEUME.wohnen.stoff, new CylinderGeometry(0.14, 0.14, 0.02, 20), lage(6.55, 0.01, 7.0));
    haenge(s);
    const kacheln = [0, 1, 2, 3].map((i) => {
      const l = licht(i === 0 ? ROT : 0xdfe6ee);
      netz(quader(0.003, 0.08, 0.075, wand - 0.0155, 1.42 - Math.floor(i / 2) * 0.1, 4.155 + (i % 2) * 0.09), l.stoff);
      return l;
    });
    const schirm = licht(WARM);
    netz(new CylinderGeometry(0.13, 0.19, 0.3, 24, 1, true), schirm.stoff).position.set(6.55, 1.55, 7.0);
    (schirm.stoff as MeshBasicMaterial).side = DoubleSide;

    liste.push({
      id: "smart-home",
      griffe: [kasten(wand - 0.2, wand, 1.1, 1.65, 3.95, 4.45), kasten(6.35, 6.75, 0, 1.75, 6.8, 7.2)],
      schritt: (kraft, seit) => {
        if (kraft <= 0.5) {
          kacheln.forEach((l) => l.helle(0.12));
          schirm.helle(0.05);
          return;
        }
        // Szene "Abend": Jalousien fahren herunter, das Licht wird warm und leise. Danach "Tag".
        const runde = seit % 11;
        const abend = runde > 1 && runde < 7;
        kacheln[0].helle(abend ? 1 : 0.25);
        kacheln[1].helle(abend ? 0.25 : 1);
        kacheln[2].helle(0.4 + 0.3 * puls(seit, 0.3));
        kacheln[3].helle(abend ? 0.9 : 0.3);
        schirm.helle(abend ? 1 : 0.08);
        return { jalousien: abend ? 1 : 0, raumlicht: abend ? 0.42 : 1 };
      },
    });
  }

  /* ============================================================ 7 Netzwerk & IT-Verkabelung */
  {
    const y0 = M.DG;
    const s = new Sammler();
    // Netzwerkschrank an der Rückwand
    s.quader(R("dg", TON.schwarz), 6.48, 7.12, y0 + 1.15, y0 + 1.75, M.W, M.W + 0.4, "-z");
    s.quader(R("dg", 0x4b5159), 6.52, 7.08, y0 + 1.19, y0 + 1.71, M.W + 0.4, M.W + 0.405, "-z");
    for (const y of [1.28, 1.42, 1.56]) s.quader(R("dg", 0x23272e), 6.54, 7.06, y0 + y, y0 + y + 0.085, M.W + 0.405, M.W + 0.412, "-z");
    // Sender an der Decke
    s.ton(0xf6f6f4).nimm(RAEUME.dg.stoff, new CylinderGeometry(0.11, 0.12, 0.035, 28), lage(6.6, M.DACH - 0.018, 2.6));
    // Bildschirm, Tastatur und Rechner auf dem Schreibtisch
    s.quader(R("dg", TON.schwarz), 8.88, 8.91, y0 + 0.92, y0 + 1.32, 2.0, 2.62);
    s.quader(R("dg", TON.schwarz), 8.86, 8.93, y0 + 0.76, y0 + 0.92, 2.27, 2.35, "-y").quader(R("dg", TON.schwarz), 8.78, 8.98, y0 + 0.76, y0 + 0.775, 2.2, 2.42);
    s.quader(R("dg", TON.mittel), 8.5, 8.64, y0 + 0.76, y0 + 0.775, 2.1, 2.52);
    haenge(s);

    // Leuchtpunkte der Anschlüsse: blinken unregelmäßig
    const jeReihe = 16;
    const anzahl = jeReihe * 3;
    const punktstoff = licht(0xffffff);
    const punkte = new InstancedMesh(merke(new BoxGeometry(0.014, 0.014, 0.004)), punktstoff.stoff, anzahl);
    const m4 = new Matrix4();
    for (let i = 0; i < anzahl; i++) {
      const r = Math.floor(i / jeReihe);
      punkte.setMatrixAt(i, m4.makeTranslation(6.57 + (i % jeReihe) * 0.0305, y0 + 1.32 + r * 0.14, M.W + 0.414));
    }
    gruppe.add(punkte);
    const dunkel = new Color(0x1c2025);
    const gruen = new Color(GRUEN);
    const gelb = new Color(GELB);

    const schirm = licht(0xcfe6ff);
    const schirmnetz = netz(new PlaneGeometry(0.58, 0.36), schirm.stoff);
    schirmnetz.rotation.y = -Math.PI / 2;
    schirmnetz.position.set(8.878, y0 + 1.12, 2.31);

    const sender = licht(GRUEN);
    const senderlicht = netz(new CircleGeometry(0.016, 12), sender.stoff);
    senderlicht.rotation.x = Math.PI / 2;
    senderlicht.position.set(6.6, M.DACH - 0.037, 2.6);
    // Funkwellen: Ringe, die vom Sender aus nach unten in den Raum laufen und dabei weiter werden
    const wellen = [0, 1, 2].map(() => {
      const l = licht(ROT, { durchsichtig: true, beidseitig: true });
      l.stoff.depthWrite = false;
      const n = netz(new RingGeometry(0.92, 1.0, 56), l.stoff);
      n.rotation.x = Math.PI / 2;
      n.position.set(6.6, M.DACH - 0.06, 2.6);
      return { l, n };
    });
    const zufall = (n: number) => {
      const x = Math.sin(n * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    let bild = -1;
    liste.push({
      id: "netzwerktechnik",
      griffe: [kasten(6.4, 7.2, y0 + 1.05, y0 + 1.85, M.W, M.W + 0.5), kasten(8.4, 9.05, y0 + 0.7, y0 + 1.4, 1.9, 2.75)],
      schritt: (kraft, seit) => {
        const aktiv = kraft > 0.5;
        const jetzt = aktiv ? Math.floor(seit * 9) : 0;
        if (jetzt !== bild) {
          bild = jetzt;
          for (let i = 0; i < anzahl; i++) {
            const belegt = zufall(i * 3.7) > 0.22;
            const blinkt = zufall(i * 1.3 + jetzt * 0.71) > 0.45;
            punkte.setColorAt(i, !aktiv || !belegt ? dunkel : blinkt ? (zufall(i * 9.1) > 0.82 ? gelb : gruen) : dunkel);
          }
          if (punkte.instanceColor) punkte.instanceColor.needsUpdate = true;
        }
        schirm.helle(kraft * 0.9);
        sender.helle(aktiv ? 1 : 0.25);
        wellen.forEach(({ l, n }, i) => {
          const lauf = (seit * 0.38 + i / 3) % 1;
          n.scale.setScalar(0.14 + lauf * 1.25);
          n.position.y = M.DACH - 0.06 - lauf * 1.35;
          l.deck(kraft * (1 - lauf) * 0.9 * Math.min(1, lauf * 6));
        });
      },
    });
  }

  // Einmal alles in den Ruhezustand stellen
  for (const d of liste) d.schritt(0, 0, 0);

  return {
    gruppe,
    liste,
    groesse: (breite, hoehe) => {
      for (const m of linien) m.resolution.set(breite, hoehe);
    },
    entferne: () => {
      for (const g of geometrien) g.dispose();
      for (const m of eigene) m.dispose();
      for (const m of linien) m.dispose();
    },
  };
}
