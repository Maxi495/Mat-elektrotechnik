import { BoxGeometry, CylinderGeometry, IcosahedronGeometry, SphereGeometry, type BufferGeometry } from "three";
import { Sammler, lage, st, type Loch } from "./bau";

/**
 * Das Haus als Modell in Metern: Grundstück, drei Geschosse mit Räumen und Möbeln.
 * Alles hier steht still. Was sich bewegt (Türen, Tor, Jalousien) und die neun Leistungen kommen aus eigenen Dateien.
 *
 * Achsen: x nach rechts, y nach oben, z nach vorn. Die Hausecke hinten links steht im Ursprung.
 * Erdgeschoss 9,4 × 7,6 m, Obergeschoss kragt vorn bis 7,95 m aus, Dachgeschoss zurückgesetzt mit Dachterrasse.
 */

export const M = {
  /** rechte Außenkante */
  X1: 9.4,
  /** Vorderkante Erdgeschoss */
  Z1: 7.6,
  /** Vorderkante Obergeschoss */
  KRAG: 7.95,
  /** Außenwand, Innenwand */
  W: 0.3,
  I: 0.12,
  /** Fußbodenhöhen */
  OG: 3,
  DG: 6,
  /** Unterkante Dach */
  DACH: 8.5,
  /** lichte Raumhöhe in Erd- und Obergeschoss */
  H: 2.7,
  /** Dachgeschoss: linke Außenkante, Vorderkante */
  D0: 2.6,
  DZ: 5.2,
  /** Wand zwischen Garage und Flur, Wand zwischen Flur und Wohnraum */
  FLUR0: 4.45,
  FLUR1: 6.0,
  WOHN0: 6.12,
  /** Vorderwand des Flurs: Die Haustür liegt in einer Nische */
  NISCHE: 6.35,
  /** Wand zwischen Technikraum und Garage */
  TECH1: 2.48,
  /** Treppe: linke und rechte Kante, oberes und unteres Ende */
  TR0: 4.45,
  TR1: 5.3,
  TRZ0: 1.55,
  TRZ1: 5.6,
} as const;

export const TON = {
  putz: 0xf1efea,
  laibung: 0xdedbd4,
  holz: 0xdccfb9,
  dunkel: 0x4b5159,
  dach: 0xe3e2dd,
  blende: 0x2b2f35,
  rahmen: 0x23272e,
  sockel: 0x0e1014,
  rasen: 0x262c2b,
  pflaster: 0x3d4249,
  platte: 0x50555d,
  deck: 0xc4b59c,
  pflanze: 0x77857c,
  pflanzeHell: 0x93a197,
  stamm: 0x4f453c,
  wand: 0xf4f2ee,
  decke: 0xfbfaf7,
  bodenHolz: 0xcbb999,
  bodenFliese: 0xb9bcbf,
  bodenGarage: 0x8b9096,
  hell: 0xeceae5,
  grau: 0x8a9199,
  mittel: 0xb8bcc1,
  schwarz: 0x30353c,
  eiche: 0xb59a76,
  stoff: 0x9aa2aa,
  auto: 0xe9ebed,
  autoglas: 0x1c2026,
  reifen: 0x16181b,
  metall: 0xa6aeb6,
} as const;

/** Räume mit eigenem Licht. Jeder Raum ist ein Werkstoff: Geht das Licht an, leuchten Wände, Boden und Möbel warm. */
export const RAEUME = {
  garage: { stoff: "raum-garage", name: "Garage", x0: 0.3, x1: 4.2, z0: 2.6, z1: 7.3, y0: 0, y1: 2.7, lampe: [2.25, 2.55, 5.0] },
  technik: { stoff: "raum-technik", name: "Technikraum", x0: 0.3, x1: 4.2, z0: 0.3, z1: 2.48, y0: 0, y1: 2.7, lampe: [2.25, 2.55, 1.4] },
  flur: { stoff: "raum-flur", name: "Flur", x0: 4.45, x1: 6.0, z0: 0.3, z1: 6.35, y0: 0, y1: 2.7, lampe: [5.6, 2.55, 3.4] },
  wohnen: { stoff: "raum-wohnen", name: "Wohnraum", x0: 6.12, x1: 9.1, z0: 0.3, z1: 7.3, y0: 0, y1: 2.7, lampe: [7.6, 2.5, 3.8] },
  og: { stoff: "raum-og", name: "Obergeschoss", x0: 0.3, x1: 9.1, z0: 0.3, z1: 7.65, y0: 3, y1: 5.7, lampe: [4.7, 5.5, 3.9] },
  dg: { stoff: "raum-dg", name: "Arbeitszimmer", x0: 2.9, x1: 9.1, z0: 0.3, z1: 4.9, y0: 6, y1: 8.5, lampe: [6.6, 8.35, 2.6] },
} as const;

export type RaumId = keyof typeof RAEUME;

/** Grundstück */
export const GRUND = { x0: -3.4, x1: 12.8, z0: -3.0, z1: 12.9, tiefe: 0.55, ecke: 1.5 } as const;

/** Öffnungen, die auch andere Dateien brauchen (Türen, Tor, Jalousien) */
export const OEFFNUNG = {
  tor: { x0: 0.5, x1: 3.9, y1: 2.3 },
  haustuer: { x0: 4.72, x1: 5.72, y1: 2.15 },
  terrassentuer: { x0: 5.5, x1: 6.6, y0: M.DG, y1: 8.2 },
  wohnVorn: { x0: 6.7, x1: 8.8, y0: 0.1, y1: 2.5 },
  wohnSeite: { z0: 4.6, z1: 7.0, y0: 0.1, y1: 2.5 },
} as const;

const facettiert = (g: BufferGeometry): BufferGeometry => {
  const f = g.index ? g.toNonIndexed() : g;
  f.computeVertexNormals();
  return f;
};

export function baueHaus(): Sammler {
  const s = new Sammler();
  const A = "bunt";
  const putz = st(A, TON.putz);
  const laib = st(A, TON.laibung);
  const rahmen = st(A, TON.rahmen);
  const innen = (raum: RaumId) => st(RAEUME[raum].stoff, TON.wand);
  const R = (raum: RaumId, ton: number) => st(RAEUME[raum].stoff, ton);

  /* ============================================================ Grundstück */

  {
    const { x0, x1, z0, z1, tiefe, ecke } = GRUND;
    const rand: [number, number][] = [];
    const mitten: [number, number, number][] = [
      [x1 - ecke, z1 - ecke, 0],
      [x0 + ecke, z1 - ecke, 90],
      [x0 + ecke, z0 + ecke, 180],
      [x1 - ecke, z0 + ecke, 270],
    ];
    for (const [mx, mz, start] of mitten) {
      for (let w = 0; w <= 90; w += 10) {
        const b = ((start + w) * Math.PI) / 180;
        rand.push([mx + Math.cos(b) * ecke, mz + Math.sin(b) * ecke]);
      }
    }
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    for (let i = 0; i < rand.length; i++) {
      const [ax, az] = rand[i];
      const [bx, bz] = rand[(i + 1) % rand.length];
      // Oben der Rasen, rundum die Kante des Sockels
      s.dreieck(st(A, TON.rasen), [cx, 0, cz], [bx, 0, bz], [ax, 0, az]);
      s.viereck(st(A, TON.sockel), [bx, -tiefe, bz], [ax, -tiefe, az], [ax, 0, az], [bx, 0, bz]);
    }
  }

  // Einfahrt, Weg zur Haustür, Terrasse
  s.flaecheY(st(A, TON.pflaster), 0.012, 0.35, 4.05, M.Z1, GRUND.z1 - 0.02, true);
  for (let z = M.Z1 + 0.25; z < GRUND.z1 - 0.9; z += 1.05) s.quader(st(A, TON.platte), 4.62, 6.0, 0, 0.03, z, z + 0.9, "-y");
  s.quader(st("holz", TON.deck), 6.4, 10.9, 0, 0.14, M.Z1, 10.6, "-y-z");

  // Hecke hinten und links, Bäume, Sträucher
  s.quader(st(A, TON.pflanze), -2.9, 12.3, 0, 1.25, -2.55, -1.95, "-y");
  s.quader(st(A, TON.pflanze), -2.9, -2.3, 0, 1.25, -1.95, 7.2, "-y-z");
  const baum = (x: number, z: number, h: number, r: number) => {
    s.ton(TON.stamm).nimm(A, new CylinderGeometry(0.09, 0.13, h, 8), lage(x, h / 2, z));
    const kugel = (dx: number, dy: number, dz: number, radius: number, ton: number) =>
      s.ton(ton).nimm(A, facettiert(new IcosahedronGeometry(radius, 1)), lage(x + dx, h + dy, z + dz, 0.3, dx * 2 + dz, 0));
    kugel(0, r * 0.55, 0, r, TON.pflanze);
    kugel(-r * 0.55, r * 0.95, r * 0.3, r * 0.68, TON.pflanzeHell);
    kugel(r * 0.5, r * 1.1, -r * 0.25, r * 0.7, TON.pflanze);
    kugel(0.05, r * 1.6, 0.1, r * 0.55, TON.pflanzeHell);
  };
  baum(11.2, 0.4, 2.3, 1.25);
  baum(-1.4, 9.6, 1.9, 1.05);
  baum(-1.2, -0.6, 2.6, 1.35);
  const strauch = (x: number, z: number, r: number) => {
    s.ton(TON.pflanze).nimm(A, facettiert(new IcosahedronGeometry(r, 1)), lage(x, r * 0.8, z, 0.2, x, 0));
    s.ton(TON.pflanzeHell).nimm(A, facettiert(new IcosahedronGeometry(r * 0.66, 1)), lage(x - r * 0.5, r * 1.25, z + r * 0.35, 0, z, 0.4));
  };
  strauch(11.5, 11.4, 0.7);
  strauch(11.3, 5.4, 0.55);
  strauch(-1.9, 11.6, 0.6);

  // Sitzgruppe auf der Terrasse
  s.quader(st(A, TON.schwarz), 9.2, 10.5, 0.14, 0.5, 8.2, 9.2, "-y");
  s.quader(st(A, TON.schwarz), 9.2, 10.5, 0.5, 0.86, 8.2, 8.42, "-y");
  s.quader(st(A, TON.hell), 9.28, 10.42, 0.5, 0.58, 8.46, 9.14, "-y");
  s.quader(st(A, TON.schwarz), 7.4, 8.15, 0.14, 0.46, 9.5, 10.15, "-y");

  /* ============================================================ Erdgeschoss */

  const E0 = 0;
  const E1 = M.OG; // Außenwände laufen bis zur Oberkante der Decke
  const EH = M.H;

  // Böden
  s.flaecheY(R("technik", TON.bodenFliese), 0.002, M.W, 4.325, M.W, 2.54, true);
  s.flaecheY(R("garage", TON.bodenGarage), 0.002, M.W, 4.2, 2.54, M.Z1 - M.W, true);
  s.flaecheY(R("flur", TON.bodenFliese), 0.002, 4.325, 6.06, M.W, M.NISCHE, true);
  s.flaecheY(R("wohnen", TON.bodenHolz), 0.002, 6.06, M.X1 - M.W, M.W, M.Z1 - M.W, true);
  // Eingangsnische außen: Podest
  s.quader(st(A, TON.platte), M.FLUR0, M.FLUR1, 0, 0.05, M.NISCHE + 0.25, M.Z1 + 0.35, "-y");

  // Decken (Unterseite der Geschossdecke). Der Flur hat das Treppenauge.
  s.flaecheY(R("technik", TON.decke), EH, M.W, 4.325, M.W, 2.54, false);
  s.flaecheY(R("garage", TON.decke), EH, M.W, 4.2, 2.54, M.Z1 - M.W, false);
  s.flaecheY(R("wohnen", TON.decke), EH, 6.06, M.X1 - M.W, M.W, M.Z1 - M.W, false);
  const auge: Loch = { a0: M.TR0, a1: M.TR1 + 0.05, b0: M.TRZ0, b1: 4.65 };
  s.platte(R("og", TON.bodenHolz), R("flur", TON.decke), R("flur", TON.wand), 4.325, 6.06, M.W, M.NISCHE, EH, M.OG, [auge]);

  // Rückwand (z 0 bis 0,3): außen nach hinten
  s.wandX({ vorn: innen("technik"), hinten: putz, kante: laib }, 0, 4.325, 0, M.W, E0, E1, [{ a0: 2.6, a1: 3.5, b0: 1.6, b1: 2.3 }], false);
  s.wandX({ vorn: innen("flur"), hinten: putz, kante: laib }, 4.325, 6.06, 0, M.W, E0, E1, [], false);
  s.wandX({ vorn: innen("wohnen"), hinten: putz, kante: laib }, 6.06, M.X1, 0, M.W, E0, E1, [{ a0: 6.9, a1: 8.5, b0: 1.1, b1: 2.3 }], false);
  // Vorderwand: Garage mit Tor, Nische, Wohnraum mit Fenster
  s.wandX({ vorn: putz, hinten: innen("garage"), kante: laib }, 0, 4.2, M.Z1 - M.W, M.Z1, E0, E1, [{ a0: OEFFNUNG.tor.x0, a1: OEFFNUNG.tor.x1, b0: 0, b1: OEFFNUNG.tor.y1 }], false);
  s.wandX({ vorn: putz, hinten: innen("flur"), kante: laib }, M.FLUR0, M.FLUR1, M.NISCHE, M.NISCHE + 0.25, E0, EH, [{ a0: OEFFNUNG.haustuer.x0, a1: OEFFNUNG.haustuer.x1, b0: 0, b1: OEFFNUNG.haustuer.y1 }, { a0: 5.78, a1: 5.95, b0: 0.2, b1: 2.15 }], false);
  s.wandX({ vorn: putz, hinten: innen("wohnen"), kante: laib }, M.FLUR1, M.X1, M.Z1 - M.W, M.Z1, E0, E1, [{ a0: OEFFNUNG.wohnVorn.x0, a1: OEFFNUNG.wohnVorn.x1, b0: OEFFNUNG.wohnVorn.y0, b1: OEFFNUNG.wohnVorn.y1 }], false);
  s.flaecheX(putz, M.FLUR1, M.Z1 - M.W, M.Z1, E0, EH, false);
  // Decke der Nische (Untersicht) und Sturz darüber
  s.quader(putz, M.FLUR0, M.FLUR1, EH, E1, M.NISCHE, M.Z1, "+y-z-x+x");
  // Linke Wand (x 0 bis 0,3): außen nach links
  s.wandZ({ vorn: innen("technik"), hinten: putz, kante: laib }, M.W, 2.54, 0, M.W, E0, E1, [], false);
  s.wandZ({ vorn: innen("garage"), hinten: putz, kante: laib }, 2.54, M.Z1 - M.W, 0, M.W, E0, E1, [{ a0: 4.0, a1: 5.4, b0: 1.4, b1: 2.2 }], false);
  // Rechte Wand: außen nach rechts
  s.wandZ({ vorn: putz, hinten: innen("wohnen"), kante: laib }, M.W, M.Z1 - M.W, M.X1 - M.W, M.X1, E0, E1, [
    { a0: 1.2, a1: 2.5, b0: 1.1, b1: 2.3 },
    { a0: OEFFNUNG.wohnSeite.z0, a1: OEFFNUNG.wohnSeite.z1, b0: OEFFNUNG.wohnSeite.y0, b1: OEFFNUNG.wohnSeite.y1 },
  ], false);
  // Ecken der Außenwände schließen
  s.flaecheX(putz, 0, 0, M.W, E0, E1, false).flaecheX(putz, 0, M.Z1 - M.W, M.Z1, E0, E1, false);
  s.flaecheX(putz, M.X1, 0, M.W, E0, E1, true).flaecheX(putz, M.X1, M.Z1 - M.W, M.Z1, E0, E1, true);

  // Innenwände
  // Technikraum | Garage
  s.wandX({ vorn: innen("garage"), hinten: innen("technik") }, M.W, 4.2, M.TECH1, 2.6, E0, EH, [], false);
  // Garage und Technikraum | Flur. Vorn bildet die Wand die linke Seite der Eingangsnische.
  s.wandZ({ vorn: innen("flur"), hinten: innen("technik"), kante: R("flur", TON.hell) }, M.W, 2.54, 4.2, M.FLUR0, E0, EH, [{ a0: 0.5, a1: 1.4, b0: 0, b1: 2.05 }], false);
  s.wandZ({ vorn: innen("flur"), hinten: innen("garage") }, 2.54, M.NISCHE, 4.2, M.FLUR0, E0, EH, [], false);
  s.wandZ({ vorn: putz, hinten: innen("garage") }, M.NISCHE, M.Z1, 4.2, M.FLUR0, E0, E1, [], false);
  s.flaecheZ(putz, M.Z1, 4.2, M.FLUR0, E0, E1, true);
  // Flur | Wohnraum, mit breitem Durchgang. Vorn die rechte Seite der Nische.
  s.wandZ({ vorn: innen("wohnen"), hinten: innen("flur"), kante: R("flur", TON.hell) }, M.W, M.NISCHE, M.FLUR1, M.WOHN0, E0, EH, [{ a0: 3.2, a1: 4.6, b0: 0, b1: 2.3 }], false);
  s.wandZ({ vorn: innen("wohnen"), hinten: putz }, M.NISCHE, M.Z1 - M.W, M.FLUR1, M.WOHN0, E0, EH, [], false);
  // Glasfeld neben der Haustür
  s.flaecheZ("glas", M.NISCHE + 0.12, 5.78, 5.95, 0.2, 2.15, true);

  /* ---------- Treppe: zwei gleiche Läufe übereinander, offene Stufen auf zwei Wangen */
  const treppe = (y0: number, raum: RaumId) => {
    const stufen = 15;
    const tritt = (M.TRZ1 - M.TRZ0) / stufen;
    const steigung = 3 / stufen;
    for (let i = 0; i < stufen; i++) {
      const z1 = M.TRZ1 - i * tritt;
      const y = y0 + (i + 1) * steigung;
      s.quader(R(raum, TON.eiche), M.TR0 + 0.02, M.TR1, y - 0.05, y, z1 - tritt - 0.02, z1);
    }
    // Wangen: schräge Balken unter den Stufen
    const laenge = Math.hypot(M.TRZ1 - M.TRZ0, 3);
    const winkel = Math.atan2(3, M.TRZ1 - M.TRZ0);
    for (const x of [M.TR0 + 0.1, M.TR1 - 0.1]) {
      s.ton(TON.schwarz).nimm(RAEUME[raum].stoff, new BoxGeometry(0.06, 0.2, laenge), lage(x, y0 + 1.5 - 0.12, (M.TRZ0 + M.TRZ1) / 2, winkel, 0, 0));
    }
    // Geländer zur offenen Seite
    for (let i = 0; i <= stufen; i += 3) {
      const z = M.TRZ1 - i * tritt;
      const y = y0 + i * steigung;
      s.quader(R(raum, TON.schwarz), M.TR1 - 0.02, M.TR1 + 0.01, y, y + 0.95, z - 0.015, z + 0.015);
    }
    s.ton(TON.schwarz).nimm(RAEUME[raum].stoff, new BoxGeometry(0.04, 0.04, laenge), lage(M.TR1 - 0.005, y0 + 1.5 + 0.95, (M.TRZ0 + M.TRZ1) / 2, winkel, 0, 0));
  };
  treppe(0, "flur");
  treppe(M.OG, "og");

  /* ---------- Fenster */
  /** Fenster in einer Wand entlang x. "vorn": Die Fassade zeigt nach +z. */
  const fensterX = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, felder: number, vorn: boolean, bank = true) => {
    const zm = vorn ? z1 - 0.11 : z0 + 0.11;
    const t = 0.055;
    const d = 0.035;
    s.quader(rahmen, x0, x1, y0, y0 + t, zm - d, zm + d).quader(rahmen, x0, x1, y1 - t, y1, zm - d, zm + d);
    s.quader(rahmen, x0, x0 + t, y0 + t, y1 - t, zm - d, zm + d, "+y-y").quader(rahmen, x1 - t, x1, y0 + t, y1 - t, zm - d, zm + d, "+y-y");
    for (let i = 1; i < felder; i++) {
      const xm = x0 + ((x1 - x0) * i) / felder;
      s.quader(rahmen, xm - t / 2, xm + t / 2, y0 + t, y1 - t, zm - d, zm + d, "+y-y");
    }
    s.flaecheZ("glas", zm, x0 + t, x1 - t, y0 + t, y1 - t, true);
    if (bank) {
      if (vorn) s.quader(laib, x0 - 0.04, x1 + 0.04, y0 - 0.035, y0, z1 - 0.02, z1 + 0.05);
      else s.quader(laib, x0 - 0.04, x1 + 0.04, y0 - 0.035, y0, z0 - 0.05, z0 + 0.02);
    }
  };
  /** Fenster in einer Wand entlang z. "rechts": Die Fassade zeigt nach +x. */
  const fensterZ = (za: number, zb: number, y0: number, y1: number, x0: number, x1: number, felder: number, rechts: boolean, bank = true) => {
    const xm = rechts ? x1 - 0.11 : x0 + 0.11;
    const t = 0.055;
    const d = 0.035;
    s.quader(rahmen, xm - d, xm + d, y0, y0 + t, za, zb).quader(rahmen, xm - d, xm + d, y1 - t, y1, za, zb);
    s.quader(rahmen, xm - d, xm + d, y0 + t, y1 - t, za, za + t, "+y-y").quader(rahmen, xm - d, xm + d, y0 + t, y1 - t, zb - t, zb, "+y-y");
    for (let i = 1; i < felder; i++) {
      const zm = za + ((zb - za) * i) / felder;
      s.quader(rahmen, xm - d, xm + d, y0 + t, y1 - t, zm - t / 2, zm + t / 2, "+y-y");
    }
    s.flaecheX("glas", xm, za + t, zb - t, y0 + t, y1 - t, true);
    if (bank) {
      if (rechts) s.quader(laib, x1 - 0.02, x1 + 0.05, y0 - 0.035, y0, za - 0.04, zb + 0.04);
      else s.quader(laib, x0 - 0.05, x0 + 0.02, y0 - 0.035, y0, za - 0.04, zb + 0.04);
    }
  };

  // Erdgeschoss
  fensterX(2.6, 3.5, 1.6, 2.3, 0, M.W, 1, false);
  fensterX(6.9, 8.5, 1.1, 2.3, 0, M.W, 2, false);
  fensterX(OEFFNUNG.wohnVorn.x0, OEFFNUNG.wohnVorn.x1, OEFFNUNG.wohnVorn.y0, OEFFNUNG.wohnVorn.y1, M.Z1 - M.W, M.Z1, 2, true, false);
  fensterZ(4.0, 5.4, 1.4, 2.2, 0, M.W, 1, false);
  fensterZ(1.2, 2.5, 1.1, 2.3, M.X1 - M.W, M.X1, 1, true);
  fensterZ(OEFFNUNG.wohnSeite.z0, OEFFNUNG.wohnSeite.z1, OEFFNUNG.wohnSeite.y0, OEFFNUNG.wohnSeite.y1, M.X1 - M.W, M.X1, 2, true, false);

  /* ---------- Einrichtung Erdgeschoss */
  // Technikraum: Arbeitsplatte, Regal, Wechselrichter und Speicher an der linken Wand
  s.quader(R("technik", TON.mittel), 0.32, 0.72, 0, 1.75, 0.5, 1.15, "-y-x"); // Batteriespeicher
  s.quader(R("technik", TON.schwarz), 0.72, 0.725, 1.45, 1.6, 0.62, 1.03, "-x");
  s.quader(R("technik", TON.hell), 0.32, 0.56, 1.05, 1.6, 1.45, 2.05, "-x"); // Wechselrichter
  s.quader(R("technik", TON.schwarz), 0.56, 0.565, 1.25, 1.42, 1.6, 1.9, "-x");
  // Garage: Regal und Fahrräder ersparen wir uns, das Auto kommt mit der Wallbox
  s.quader(R("garage", TON.grau), 3.75, 4.18, 0, 1.9, 2.75, 4.3, "-y+x"); // Regal
  for (const y of [0.5, 0.95, 1.4]) s.quader(R("garage", TON.hell), 3.78, 4.15, y, y + 0.28, 2.85 + (y * 0.4), 3.55 + (y * 0.4));
  // Flur: Garderobe, Schuhbank
  s.quader(R("flur", TON.eiche), 5.62, 5.98, 0, 0.42, 4.75, 6.2, "-y+x");
  s.quader(R("flur", TON.schwarz), 5.94, 5.98, 1.55, 1.6, 4.75, 6.2);
  // Wohnraum vorn: Sofa über Eck, Couchtisch, Teppich, Sideboard mit Fernseher an der Flurwand
  s.flaecheY(R("wohnen", TON.mittel), 0.012, 6.75, 8.75, 4.9, 6.9, true);
  s.quader(R("wohnen", TON.stoff), 7.0, 8.95, 0, 0.42, 6.25, 7.15, "-y");
  s.quader(R("wohnen", TON.stoff), 7.0, 8.95, 0.42, 0.82, 6.92, 7.15);
  s.quader(R("wohnen", TON.stoff), 8.2, 8.95, 0, 0.42, 5.1, 6.25, "-y+z");
  s.quader(R("wohnen", TON.stoff), 8.78, 8.95, 0.42, 0.82, 5.1, 6.25);
  s.quader(R("wohnen", TON.hell), 7.1, 7.9, 0.42, 0.5, 6.32, 6.88);
  s.quader(R("wohnen", TON.eiche), 7.05, 7.85, 0.28, 0.34, 5.25, 5.85).quader(R("wohnen", TON.schwarz), 7.4, 7.5, 0, 0.28, 5.5, 5.6, "-y+y");
  s.quader(R("wohnen", TON.eiche), 6.14, 6.55, 0, 0.5, 4.85, 6.8, "-y-x");
  s.quader(R("wohnen", TON.schwarz), 6.16, 6.2, 0.75, 1.5, 5.15, 6.5);
  // Essen: Tisch mit vier Stühlen
  s.quader(R("wohnen", TON.eiche), 7.0, 8.7, 0.72, 0.77, 2.95, 3.85);
  for (const [x, z] of [[7.08, 3.03], [8.56, 3.03], [7.08, 3.71], [8.56, 3.71]] as const) s.quader(R("wohnen", TON.schwarz), x, x + 0.06, 0, 0.72, z, z + 0.06, "-y+y");
  for (const [x, z] of [[7.3, 2.5], [8.05, 2.5], [7.3, 3.95], [8.05, 3.95]] as const) {
    s.quader(R("wohnen", TON.grau), x, x + 0.42, 0.4, 0.46, z, z + 0.42);
    s.quader(R("wohnen", TON.grau), x, x + 0.42, 0.46, 0.9, z < 3 ? z : z + 0.37, z < 3 ? z + 0.05 : z + 0.42);
  }
  // Küche: Zeile an der Rückwand, Hochschrank, Insel
  s.quader(R("wohnen", TON.hell), 6.5, 9.08, 0, 0.9, 0.32, 0.92, "-y-z");
  s.quader(R("wohnen", TON.schwarz), 6.5, 9.08, 0.9, 0.94, 0.32, 0.94, "-y-z");
  s.quader(R("wohnen", TON.hell), 6.14, 6.5, 0, 2.2, 0.32, 0.95, "-y-z-x");
  s.quader(R("wohnen", TON.hell), 7.0, 8.6, 0, 0.9, 1.55, 2.15, "-y").quader(R("wohnen", TON.eiche), 6.95, 8.65, 0.9, 0.94, 1.5, 2.2);

  /* ============================================================ Obergeschoss */

  const O0 = M.OG;
  const O1 = M.DG;
  const OH = M.OG + M.H;
  const holz = st("holz", TON.holz);
  const OZ1 = M.KRAG;

  // Boden über Garage, Technikraum und Wohnraum (der Flur hat seine Decke mit Treppenauge schon)
  s.flaecheY(R("og", TON.bodenHolz), O0 + 0.002, M.W, 4.325, M.W, OZ1 - M.W, true);
  s.flaecheY(R("og", TON.bodenHolz), O0 + 0.002, 6.06, M.X1 - M.W, M.W, OZ1 - M.W, true);
  s.flaecheY(R("og", TON.bodenHolz), O0 + 0.002, 4.325, 6.06, M.NISCHE, OZ1 - M.W, true);
  // Untersicht der Auskragung
  s.flaecheY(st(A, TON.laibung), O0, 0, M.X1, M.Z1, OZ1, false);
  // Decke. Über dem Flur wieder mit Treppenauge, hinauf ins Dachgeschoss.
  const og1: [number, number, number, number][] = [
    [M.W, 4.325, M.W, OZ1 - M.W],
    [6.06, M.X1 - M.W, M.W, OZ1 - M.W],
    [4.325, 6.06, M.NISCHE, OZ1 - M.W],
  ];
  for (const [a, b, c, d] of og1) s.flaecheY(R("og", TON.decke), OH, a, b, c, d, false);
  s.platte(R("dg", TON.bodenHolz), R("og", TON.decke), R("og", TON.wand), 4.325, 6.06, M.W, M.NISCHE, OH, O1, [auge]);

  // Außenwände: Holzschalung
  s.wandX({ vorn: innen("og"), hinten: holz, kante: laib }, 0, M.X1, 0, M.W, O0, O1, [
    { a0: 1.0, a1: 2.2, b0: 4.3, b1: 5.4 },
    { a0: 4.75, a1: 5.7, b0: 3.9, b1: 5.4 },
    { a0: 6.9, a1: 8.5, b0: 3.9, b1: 5.4 },
  ], false);
  s.wandX({ vorn: holz, hinten: innen("og"), kante: laib }, 0, M.X1, OZ1 - M.W, OZ1, O0, O1, [
    { a0: 0.8, a1: 3.4, b0: 3.7, b1: 5.4 },
    { a0: 4.75, a1: 5.7, b0: 3.7, b1: 5.4 },
    { a0: 6.5, a1: 8.7, b0: 3.7, b1: 5.4 },
  ], false);
  s.wandZ({ vorn: innen("og"), hinten: holz, kante: laib }, M.W, OZ1 - M.W, 0, M.W, O0, O1, [{ a0: 4.6, a1: 6.6, b0: 3.7, b1: 5.4 }], false);
  s.wandZ({ vorn: holz, hinten: innen("og"), kante: laib }, M.W, OZ1 - M.W, M.X1 - M.W, M.X1, O0, O1, [
    { a0: 1.0, a1: 2.7, b0: 3.7, b1: 5.4 },
    { a0: 4.6, a1: 7.0, b0: 3.7, b1: 5.4 },
  ], false);
  s.flaecheX(holz, 0, 0, M.W, O0, O1, false).flaecheX(holz, 0, OZ1 - M.W, OZ1, O0, O1, false);
  s.flaecheX(holz, M.X1, 0, M.W, O0, O1, true).flaecheX(holz, M.X1, OZ1 - M.W, OZ1, O0, O1, true);

  // Innenwände: links Bad und Schlafzimmer, in der Mitte der Flur mit der Treppe, rechts zwei Zimmer
  const og = innen("og");
  s.wandZ({ vorn: og, hinten: og }, M.W, OZ1 - M.W, 4.2, M.FLUR0 - 0.13, O0, OH, [{ a0: 0.5, a1: 1.4, b0: O0, b1: O0 + 2.05 }, { a0: 5.9, a1: 6.8, b0: O0, b1: O0 + 2.05 }], false);
  s.wandZ({ vorn: og, hinten: og }, M.W, OZ1 - M.W, M.FLUR1, M.WOHN0, O0, OH, [{ a0: 0.6, a1: 1.5, b0: O0, b1: O0 + 2.05 }, { a0: 5.9, a1: 6.8, b0: O0, b1: O0 + 2.05 }], false);
  s.wandX({ vorn: og, hinten: og }, M.W, 4.2, 3.0, 3.12, O0, OH, [], false);
  s.wandX({ vorn: og, hinten: og }, M.WOHN0, M.X1 - M.W, 3.4, 3.52, O0, OH, [], false);

  fensterX(1.0, 2.2, 4.3, 5.4, 0, M.W, 1, false);
  fensterX(4.75, 5.7, 3.9, 5.4, 0, M.W, 1, false);
  fensterX(6.9, 8.5, 3.9, 5.4, 0, M.W, 2, false);
  fensterX(0.8, 3.4, 3.7, 5.4, OZ1 - M.W, OZ1, 2, true);
  fensterX(4.75, 5.7, 3.7, 5.4, OZ1 - M.W, OZ1, 1, true);
  fensterX(6.5, 8.7, 3.7, 5.4, OZ1 - M.W, OZ1, 2, true);
  fensterZ(4.6, 6.6, 3.7, 5.4, 0, M.W, 2, false);
  fensterZ(1.0, 2.7, 3.7, 5.4, M.X1 - M.W, M.X1, 1, true);
  fensterZ(4.6, 7.0, 3.7, 5.4, M.X1 - M.W, M.X1, 2, true);

  // Einrichtung: Schlafzimmer, Bad, zwei Zimmer
  s.quader(R("og", TON.hell), 0.9, 2.7, O0, O0 + 0.45, 5.4, 7.5, "-y").quader(R("og", TON.stoff), 0.9, 2.7, O0 + 0.45, O0 + 0.52, 5.4, 7.0);
  s.quader(R("og", TON.eiche), 0.9, 2.7, O0, O0 + 1.0, 7.5, 7.62, "-y+z");
  s.quader(R("og", TON.hell), 3.55, 4.18, O0, O0 + 2.2, 3.3, 5.6, "-y+x");
  s.quader(R("og", TON.hell), 0.32, 0.95, O0, O0 + 0.55, 0.5, 2.2, "-y-x"); // Wanne
  s.quader(R("og", TON.hell), 2.3, 3.6, O0, O0 + 0.85, 0.32, 0.8, "-y-z");
  s.quader(R("og", TON.hell), 6.3, 7.3, O0, O0 + 0.45, 0.4, 2.4, "-y").quader(R("og", TON.stoff), 6.3, 7.3, O0 + 0.45, O0 + 0.52, 0.8, 2.4);
  s.quader(R("og", TON.eiche), 8.0, 9.05, O0 + 0.72, O0 + 0.76, 1.0, 2.6);
  s.quader(R("og", TON.hell), 6.3, 8.2, O0, O0 + 0.45, 5.6, 7.5, "-y").quader(R("og", TON.stoff), 6.3, 8.2, O0 + 0.45, O0 + 0.52, 5.6, 7.1);
  s.quader(R("og", TON.eiche), 6.14, 6.6, O0, O0 + 1.9, 3.7, 5.2, "-y-x");

  /* ============================================================ Dachterrasse und Dachgeschoss */

  const D0y = M.DG;
  const DH = M.DACH;
  const dunkel = st(A, TON.dunkel);

  // Terrassenbelag in L-Form um das Dachgeschoss
  s.flaecheY(st("holz", TON.deck), D0y + 0.02, 0, M.D0, 0, OZ1, true);
  s.flaecheY(st("holz", TON.deck), D0y + 0.02, M.D0, M.X1, M.DZ, OZ1, true);
  // Attika: niedriger Rand um die Terrasse
  s.quader(st(A, TON.blende), 0, M.X1, D0y, D0y + 0.12, OZ1 - 0.08, OZ1, "-y");
  s.quader(st(A, TON.blende), 0, 0.08, D0y, D0y + 0.12, 0, OZ1 - 0.08, "-y");
  s.quader(st(A, TON.blende), 0.08, M.D0, D0y, D0y + 0.12, 0, 0.08, "-y");
  s.quader(st(A, TON.blende), M.X1 - 0.08, M.X1, D0y, D0y + 0.12, M.DZ, OZ1 - 0.08, "-y");
  // Brüstung aus Glas mit Handlauf
  const bruestungX = (x0: number, x1: number, z: number) => {
    s.flaecheZ("glas", z, x0, x1, D0y + 0.12, D0y + 1.05, true);
    s.quader(st("metall", TON.metall), x0, x1, D0y + 1.05, D0y + 1.09, z - 0.025, z + 0.025);
  };
  const bruestungZ = (z0: number, z1: number, x: number) => {
    s.flaecheX("glas", x, z0, z1, D0y + 0.12, D0y + 1.05, true);
    s.quader(st("metall", TON.metall), x - 0.025, x + 0.025, D0y + 1.05, D0y + 1.09, z0, z1);
  };
  bruestungX(0.04, M.X1 - 0.04, OZ1 - 0.04);
  bruestungZ(0.04, OZ1 - 0.04, 0.04);
  bruestungX(0.04, M.D0, 0.04);
  bruestungZ(M.DZ, OZ1 - 0.04, M.X1 - 0.04);
  // Pflanzkübel und Liegen
  s.quader(st(A, TON.schwarz), 0.5, 1.6, D0y + 0.02, D0y + 0.55, 6.5, 7.4, "-y");
  s.ton(TON.pflanze).nimm(A, facettiert(new IcosahedronGeometry(0.6, 1)), lage(1.05, D0y + 1.0, 6.95, 0.3, 0.5, 0));
  s.ton(TON.pflanzeHell).nimm(A, facettiert(new IcosahedronGeometry(0.4, 1)), lage(1.3, D0y + 1.35, 6.8, 0, 1.2, 0.3));
  for (const z of [1.2, 2.5]) {
    s.quader(st(A, TON.hell), 0.6, 1.3, D0y + 0.28, D0y + 0.36, z, z + 0.75);
    s.quader(st(A, TON.schwarz), 0.62, 0.68, D0y + 0.02, D0y + 0.28, z + 0.05, z + 0.11, "-y+y").quader(st(A, TON.schwarz), 1.22, 1.28, D0y + 0.02, D0y + 0.28, z + 0.64, z + 0.7, "-y+y");
  }

  // Boden und Decke des Dachgeschosses (über dem Flur liegt die Platte mit Treppenauge schon)
  s.flaecheY(R("dg", TON.bodenHolz), D0y + 0.002, M.D0 + M.W, 4.325, M.W, M.DZ - M.W, true);
  s.flaecheY(R("dg", TON.bodenHolz), D0y + 0.002, 6.06, M.X1 - M.W, M.W, M.DZ - M.W, true);
  s.flaecheY(R("dg", TON.decke), DH, M.D0 + M.W, M.X1 - M.W, M.W, M.DZ - M.W, false);

  // Außenwände: dunkel
  s.wandX({ vorn: innen("dg"), hinten: dunkel, kante: st(A, TON.blende) }, M.D0, M.X1, 0, M.W, D0y, DH, [{ a0: 3.4, a1: 4.4, b0: 7.2, b1: 8.1 }], false);
  s.wandX({ vorn: dunkel, hinten: innen("dg"), kante: st(A, TON.blende) }, M.D0, M.X1, M.DZ - M.W, M.DZ, D0y, DH, [
    { a0: 3.1, a1: 5.2, b0: 6.15, b1: 8.2 },
    { a0: OEFFNUNG.terrassentuer.x0, a1: OEFFNUNG.terrassentuer.x1, b0: D0y, b1: OEFFNUNG.terrassentuer.y1 },
    { a0: 6.9, a1: 8.9, b0: 6.15, b1: 8.2 },
  ], false);
  s.wandZ({ vorn: innen("dg"), hinten: dunkel, kante: st(A, TON.blende) }, M.W, M.DZ - M.W, M.D0, M.D0 + M.W, D0y, DH, [{ a0: 1.5, a1: 3.5, b0: 6.15, b1: 8.2 }], false);
  s.wandZ({ vorn: dunkel, hinten: innen("dg"), kante: st(A, TON.blende) }, M.W, M.DZ - M.W, M.X1 - M.W, M.X1, D0y, DH, [{ a0: 1.1, a1: 4.1, b0: 6.55, b1: 8.2 }], false);
  s.flaecheX(dunkel, M.D0, 0, M.W, D0y, DH, false).flaecheX(dunkel, M.D0, M.DZ - M.W, M.DZ, D0y, DH, false);
  s.flaecheX(dunkel, M.X1, 0, M.W, D0y, DH, true).flaecheX(dunkel, M.X1, M.DZ - M.W, M.DZ, D0y, DH, true);

  fensterX(3.4, 4.4, 7.2, 8.1, 0, M.W, 1, false);
  fensterX(3.1, 5.2, 6.15, 8.2, M.DZ - M.W, M.DZ, 2, true, false);
  fensterX(6.9, 8.9, 6.15, 8.2, M.DZ - M.W, M.DZ, 2, true, false);
  fensterZ(1.5, 3.5, 6.15, 8.2, M.D0, M.D0 + M.W, 2, false, false);
  fensterZ(1.1, 4.1, 6.55, 8.2, M.X1 - M.W, M.X1, 2, true);

  // Geländer um das Treppenauge
  const gl = R("dg", TON.schwarz);
  s.quader(gl, M.TR1 + 0.05, M.TR1 + 0.08, D0y, D0y + 0.95, M.TRZ0, 4.65).quader(gl, M.TR0 - 0.03, M.TR1 + 0.08, D0y, D0y + 0.95, 4.65, 4.68);
  s.quader(gl, M.TR0 - 0.03, M.TR0, D0y, D0y + 0.95, M.TRZ0, 4.65);
  // Geländer am Treppenauge im Obergeschoss, zur Flurseite
  s.quader(R("og", TON.schwarz), M.TR1 + 0.05, M.TR1 + 0.08, O0, O0 + 0.95, M.TRZ0, 4.65);

  // Einrichtung: Schreibtisch am Seitenfenster, Stuhl, Regal, Sofa
  s.quader(R("dg", TON.eiche), 8.2, 9.05, D0y + 0.72, D0y + 0.76, 1.3, 3.3);
  for (const z of [1.34, 3.2]) s.quader(R("dg", TON.schwarz), 8.25, 8.31, D0y, D0y + 0.72, z, z + 0.06, "-y+y").quader(R("dg", TON.schwarz), 8.94, 9.0, D0y, D0y + 0.72, z, z + 0.06, "-y+y");
  s.quader(R("dg", TON.grau), 7.45, 7.95, D0y + 0.42, D0y + 0.5, 2.0, 2.5).quader(R("dg", TON.grau), 7.45, 7.52, D0y + 0.5, D0y + 1.0, 2.0, 2.5);
  s.quader(R("dg", TON.schwarz), 7.67, 7.73, D0y, D0y + 0.42, 2.22, 2.28, "-y+y");
  s.quader(R("dg", TON.hell), 2.92, 3.3, D0y, D0y + 1.9, 3.7, 4.85, "-y-x");
  s.quader(R("dg", TON.stoff), 3.0, 4.2, D0y, D0y + 0.42, 0.4, 1.25, "-y").quader(R("dg", TON.stoff), 3.0, 4.2, D0y + 0.42, D0y + 0.8, 0.32, 0.52);

  /* ---------- Dach mit Überstand */
  s.quader(st(A, TON.blende), M.D0 - 0.3, M.X1 + 0.3, DH, DH + 0.25, -0.3, M.DZ + 0.35, "+y");
  s.flaecheY(st(A, TON.dach), DH + 0.25, M.D0 - 0.3, M.X1 + 0.3, -0.3, M.DZ + 0.35, true);

  /* ---------- Wegeleuchten und Wandleuchte (Körper, das Licht selbst kommt aus der Szene) */
  for (const [x, z] of [[4.36, 8.7], [4.36, 11.2], [6.3, 12.0], [11.2, 9.4]] as const) {
    s.quader(st(A, TON.schwarz), x - 0.04, x + 0.04, 0, 0.55, z - 0.04, z + 0.04, "-y");
  }

  return s;
}

/** Punkte, an denen draußen Licht sitzt: Wegeleuchten und die Leuchte neben der Haustür */
export const AUSSENLICHT: readonly [number, number, number][] = [
  [4.36, 0.62, 8.7],
  [4.36, 0.62, 11.2],
  [6.3, 0.62, 12.0],
  [11.2, 0.62, 9.4],
];

/** Kugel für Leuchten, einmal gebaut */
export const leuchtkugel = () => new SphereGeometry(0.075, 12, 8);
