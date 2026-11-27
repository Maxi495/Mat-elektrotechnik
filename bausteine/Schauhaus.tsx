import type { CSSProperties, ReactNode } from "react";
import { Kippschalter } from "./Zeichen";

/**
 * Schauhaus für die Smart-Home-Seite: ein gezeichnetes Haus in 3D-Ansicht mit vier Schaltern darunter.
 * Licht, Jalousien, Garagentor und Abendstimmung lassen sich schalten. Der Besucher probiert Smart Home aus,
 * statt darüber zu lesen (Design.md, 8.8).
 *
 * Das Haus ist ein Modell aus echten Maßen in Metern. Diese Datei rechnet jede Fläche aus dem Raum
 * in die Zeichenebene um (schräge Ansicht von vorn rechts oben, ohne Fluchtpunkt) und gibt ein SVG aus.
 * Es gibt keine Bilddatei und kein Skript: Die Schalter sind echte Kontrollkästchen, das Schalten macht
 * allein das Stylesheet (stil/schauhaus.css, über :has). Deshalb geht es auch ohne JavaScript.
 *
 * Achsen: x nach rechts entlang der Vorderseite, y nach vorn zum Betrachter, z nach oben.
 * Sichtbar sind die Flächen nach vorn (+y), nach rechts (+x) und nach oben.
 */

type P3 = [number, number, number];

/** Pixel je Meter und Neigung der Bodenachsen */
const MASS = 44;
const NEIGUNG = (27 * Math.PI) / 180;
const KX = Math.cos(NEIGUNG) * MASS;
const KY = Math.sin(NEIGUNG) * MASS;

/** Fläche nach vorn: Ebene y, von x0 bis x1 und z0 bis z1 */
const vorn = (y: number, x0: number, x1: number, z0: number, z1: number): P3[] => [
  [x0, y, z0],
  [x1, y, z0],
  [x1, y, z1],
  [x0, y, z1],
];
/** Fläche nach rechts: Ebene x, von y0 bis y1 und z0 bis z1 */
const seite = (x: number, y0: number, y1: number, z0: number, z1: number): P3[] => [
  [x, y0, z0],
  [x, y1, z0],
  [x, y1, z1],
  [x, y0, z1],
];
/** Fläche nach oben: Höhe z, von x0 bis x1 und y0 bis y1 */
const decke = (z: number, x0: number, x1: number, y0: number, y1: number): P3[] => [
  [x0, y0, z],
  [x1, y0, z],
  [x1, y1, z],
  [x0, y1, z],
];

interface Fenster {
  /** "v" liegt in einer Vorderseite (Ebene y), "s" in einer rechten Seite (Ebene x) */
  lage: "v" | "s";
  /** Ebene: y bei "v", x bei "s" */
  ebene: number;
  /** Von bis entlang der Wand: x bei "v", y bei "s" */
  a0: number;
  a1: number;
  z0: number;
  z1: number;
  /** Zahl der Scheiben nebeneinander */
  scheiben: number;
  /** Ohne Jalousie (kleine Fenster) */
  ohneJalousie?: boolean;
}

/** Baut die ganze Szene. Liefert die Zeichnung in drei Schichten und den Bildausschnitt. */
function baueSzene() {
  const p2 = ([x, y, z]: P3): [number, number] => [(x - y) * KX, (x + y) * KY - z * MASS];
  const pts = (ecken: P3[]) =>
    ecken
      .map((e) => {
        const [a, b] = p2(e);
        return `${a.toFixed(1)},${b.toFixed(1)}`;
      })
      .join(" ");
  /** Linienzug als Pfad: mehrere Strecken in einem Element */
  const strecken = (linien: [P3, P3][]) =>
    linien
      .map(([a, b]) => {
        const [ax, ay] = p2(a);
        const [bx, by] = p2(b);
        return `M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`;
      })
      .join("");

  let nr = 0;
  const F = (klasse: string, ecken: P3[], stil?: CSSProperties) => <polygon key={`f${nr++}`} className={klasse} points={pts(ecken)} style={stil} />;
  const L = (klasse: string, linien: [P3, P3][]) => <path key={`l${nr++}`} className={klasse} d={strecken(linien)} />;

  /** Quader: die drei sichtbaren Flächen mit Klassen für oben, vorn, rechts */
  const quader = (k: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => [
    F(`${k} ${k}--rechts`, seite(x1, y0, y1, z0, z1)),
    F(`${k} ${k}--vorn`, vorn(y1, x0, x1, z0, z1)),
    F(`${k} ${k}--oben`, decke(z1, x0, x1, y0, y1)),
  ];

  /** Schatten eines Quaders auf dem Boden. Die Sonne steht links vorn, der Schatten fällt nach rechts hinten. */
  const schatten = (x0: number, x1: number, y0: number, y1: number, h: number): P3[] => {
    const a = 0.52 * h;
    const b = 0.4 * h;
    return [
      [x0, y1, 0.02],
      [x1, y1, 0.02],
      [x1 + a, y1 - b, 0.02],
      [x1 + a, y0 - b, 0.02],
      [x0 + a, y0 - b, 0.02],
      [x0, y0, 0.02],
    ];
  };

  /** Kreis in der Zeichenebene um einen Punkt im Raum (Kugel, Lichthof) */
  const kreis = (klasse: string, mitte: P3, radius: number, stil?: CSSProperties) => {
    const [cx, cy] = p2(mitte);
    return <circle key={`k${nr++}`} className={klasse} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={(radius * MASS).toFixed(1)} style={stil} />;
  };
  /** Liegender Kreis auf dem Boden (Lichtkegel, Schatten) */
  const scheibe = (klasse: string, mitte: P3, radius: number, stil?: CSSProperties) => {
    const [cx, cy] = p2(mitte);
    return (
      <ellipse
        key={`e${nr++}`}
        className={klasse}
        cx={cx.toFixed(1)}
        cy={cy.toFixed(1)}
        rx={(radius * KX * 1.2).toFixed(1)}
        ry={(radius * KY * 1.2).toFixed(1)}
        style={stil}
      />
    );
  };

  const unten: ReactNode[] = []; // alles, was die Abendstimmung abdunkelt
  const oben: ReactNode[] = []; // Licht, Jalousien und Tor: liegen über der Abendstimmung und färben sich selbst
  const ausschnitte: ReactNode[] = []; // Fensteröffnungen als Zuschnitt

  /* ------------------------------------------------------------ Grundstück */

  const G = { x0: -1.5, x1: 11.5, y0: -1.2, y1: 11.6 };
  const rund = (z: number): P3[] => {
    const r = 1.2;
    const ecken: [number, number, number][] = [
      [G.x1 - r, G.y1 - r, 0],
      [G.x0 + r, G.y1 - r, 90],
      [G.x0 + r, G.y0 + r, 180],
      [G.x1 - r, G.y0 + r, 270],
    ];
    const punkte: P3[] = [];
    for (const [mx, my, start] of ecken) {
      for (let w = 0; w <= 90; w += 15) {
        const bogen = ((start + w) * Math.PI) / 180;
        punkte.push([mx + Math.cos(bogen) * r, my + Math.sin(bogen) * r, z]);
      }
    }
    return punkte;
  };
  unten.push(
    <polygon key="sockel" className="sh-sockel" points={pts(rund(-0.55))} />,
    <polygon key="rasen" className="sh-rasen" points={pts(rund(0))} />,
  );
  ausschnitte.push(
    <clipPath key="grund" id="sh-grund">
      <polygon points={pts(rund(0))} />
    </clipPath>,
  );

  const boden: ReactNode[] = [];
  // Mähstreifen im Rasen
  for (let x = G.x0; x < G.x1; x += 2) boden.push(F("sh-rasen-streifen", decke(0.005, x, x + 1, G.y0, G.y1)));
  // Schatten von Haus und Dachgeschoss
  boden.push(F("sh-schatten", schatten(0, 9.4, 0, 7.95, 6)), F("sh-schatten", schatten(2.6, 9.7, -0.3, 5.6, 8.95)));
  // Einfahrt und Weg zur Haustür
  boden.push(F("sh-pflaster", decke(0.01, 0.3, 4.1, 7.6, G.y1)));
  boden.push(
    L(
      "sh-fuge",
      [8.6, 9.6, 10.6].map((y): [P3, P3] => [
        [0.3, y, 0.012],
        [4.1, y, 0.012],
      ]),
    ),
  );
  for (let y = 7.78; y < 11.3; y += 1) boden.push(F("sh-platte", decke(0.012, 4.65, 6.1, y, y + 0.86)));
  // Schatten des Baums rechts hinten
  const baum = { x: 10.6, y: 0.3 };
  boden.push(scheibe("sh-schatten", [baum.x + 0.35, baum.y - 0.15, 0.02], 0.95));
  unten.push(
    <g key="boden" clipPath="url(#sh-grund)">
      {boden}
    </g>,
  );

  /* ------------------------------------------------------------ Hecke hinter dem Haus */

  // Links verdeckt sie das Haus, zu sehen ist nur das Stück rechts
  unten.push(...quader("sh-hecke", 7, 11.2, -0.95, -0.45, 0, 1.1));

  /* ------------------------------------------------------------ Fenster */

  let fensterNr = 0;
  /** Ein Fenster: Laibung, Rahmen und Glas unten, Licht und Jalousie oben. */
  const fenster = (f: Fenster) => {
    const id = `sh-f${fensterNr}`;
    const i = fensterNr++;
    const tief = 0.2;
    const rahmen = 0.07;
    /** Rechteck in der Wandebene oder um "t" Meter dahinter */
    const flaeche = (t: number, a0: number, a1: number, z0: number, z1: number) =>
      f.lage === "v" ? vorn(f.ebene - t, a0, a1, z0, z1) : seite(f.ebene - t, a0, a1, z0, z1);
    const oeffnung = flaeche(0, f.a0, f.a1, f.z0, f.z1);
    ausschnitte.push(
      <clipPath key={id} id={id}>
        <polygon points={pts(oeffnung)} />
      </clipPath>,
    );

    // Scheiben nebeneinander, zwischen ihnen ein Pfosten
    const breite = (f.a1 - f.a0 - rahmen * (f.scheiben + 1)) / f.scheiben;
    const scheiben = Array.from({ length: f.scheiben }, (_, n) => {
      const a = f.a0 + rahmen + n * (breite + rahmen);
      return [a, a + breite] as const;
    });
    const glasZ0 = f.z0 + rahmen;
    const glasZ1 = f.z1 - rahmen - 0.1; // oben sitzt der Kasten der Jalousie

    // Sichtbare Tiefe der Öffnung: Fensterbank und die Laibung auf der abgewandten Seite
    const bank: P3[] =
      f.lage === "v" ? decke(f.z0, f.a0, f.a1, f.ebene - tief, f.ebene) : decke(f.z0, f.ebene - tief, f.ebene, f.a0, f.a1);
    const laibung: P3[] = f.lage === "v" ? seite(f.a0, f.ebene - tief, f.ebene, f.z0, f.z1) : vorn(f.a0, f.ebene - tief, f.ebene, f.z0, f.z1);
    /** Schräges Band über eine Scheibe: die Spiegelung im Glas */
    const band = (a0: number, a1: number, von: number, bis: number): P3[] => {
      const b = a1 - a0;
      const lauf = (anteil: number, z: number): P3 => (f.lage === "v" ? [a0 + b * anteil, f.ebene - tief, z] : [f.ebene - tief, a0 + b * anteil, z]);
      return [lauf(von, glasZ0), lauf(bis, glasZ0), lauf(Math.min(1, bis + 0.4), glasZ1), lauf(Math.min(1, von + 0.4), glasZ1)];
    };

    unten.push(
      <g key={`${id}-u`} clipPath={`url(#${id})`}>
        {F("sh-oeffnung", oeffnung)}
        {F("sh-rahmen", flaeche(tief, f.a0, f.a1, f.z0, f.z1))}
        {scheiben.map(([a0, a1]) => F(`sh-glas sh-glas--${f.lage}`, flaeche(tief, a0, a1, glasZ0, glasZ1)))}
        {scheiben.map(([a0, a1]) => F("sh-spiegelung", band(a0, a1, 0.1, 0.3)))}
        {scheiben.map(([a0, a1]) => F("sh-spiegelung sh-spiegelung--schmal", band(a0, a1, 0.38, 0.45)))}
        {F("sh-bank", bank)}
        {F(`sh-laibung sh-laibung--${f.lage}`, laibung)}
      </g>,
    );

    const hub = (f.z1 - f.z0) * MASS;
    const lamellen: [P3, P3][] = [];
    for (let z = f.z0 + 0.12; z < f.z1 - 0.05; z += 0.11) {
      lamellen.push(f.lage === "v" ? [[f.a0, f.ebene - 0.04, z], [f.a1, f.ebene - 0.04, z]] : [[f.ebene - 0.04, f.a0, z], [f.ebene - 0.04, f.a1, z]]);
    }
    oben.push(
      <g key={`${id}-o`} clipPath={`url(#${id})`} style={{ "--i": i } as CSSProperties}>
        <g className="sh-licht">
          {scheiben.map(([a0, a1]) => F(`sh-lichtglas sh-lichtglas--${f.lage}`, flaeche(tief, a0, a1, glasZ0, glasZ1)))}
          {/* Unten im Fenster ein dunklerer Streifen: Möbel vor dem Licht */}
          {scheiben.map(([a0, a1]) => F("sh-moebel", flaeche(tief, a0, a1, glasZ0, glasZ0 + (glasZ1 - glasZ0) * 0.2)))}
        </g>
        {F("sh-kasten", flaeche(0.04, f.a0, f.a1, f.z1 - 0.16, f.z1))}
        {f.ohneJalousie ? null : (
          <g className="sh-jalousie" style={{ "--hub": `${hub.toFixed(1)}px` } as CSSProperties}>
            {F(`sh-behang sh-behang--${f.lage}`, flaeche(0.04, f.a0, f.a1, f.z0, f.z1))}
            {L("sh-lamelle", lamellen)}
            {F("sh-durchschein", flaeche(0.04, f.a0, f.a1, f.z0, f.z1))}
          </g>
        )}
      </g>,
    );
  };

  /* ------------------------------------------------------------ Erdgeschoss: Putz, Garage, Eingang */

  const X1 = 9.4; // rechte Hauswand
  const Y1 = 7.6; // Vorderwand des Erdgeschosses
  const KRAG = 7.95; // Vorderwand des Obergeschosses, kragt aus

  unten.push(F("sh-putz sh-putz--rechts", seite(X1, 0, Y1, 0, 3)), F("sh-putz sh-putz--vorn", vorn(Y1, 0, X1, 0, 3)));
  // Dunkler Strich am Boden: lässt das Haus stehen statt schweben
  unten.push(F("sh-fuss", vorn(Y1 + 0.001, 0, X1, 0, 0.1)), F("sh-fuss", seite(X1 + 0.001, 0, Y1, 0, 0.1)));

  // Garage im Erdgeschoss
  const tor = { x0: 0.45, x1: 3.95, z1: 2.35 };
  ausschnitte.push(
    <clipPath key="tor" id="sh-tor">
      <polygon points={pts(vorn(Y1, tor.x0, tor.x1, 0, tor.z1))} />
    </clipPath>,
  );
  /*
   * Auto mit der Schnauze zum Tor. Durch das Tor sieht man von schräg oben nur gut einen Meter weit hinein:
   * Schnauze, Haube und der Fuß der Frontscheibe. Danach richten sich Stellplatz und Form.
   */
  const auto = { x0: 1.35, x1: 3.1, y0: 3.3, y1: 7.28 };
  const haube = auto.y1 - 0.72; // hier endet die Motorhaube
  const dachkante = auto.y1 - 1.5; // Oberkante der Frontscheibe
  const mitte = (auto.x0 + auto.x1) / 2;
  const rad = (y: number): ReactNode => {
    const punkte: P3[] = [];
    for (let w = 0; w < 360; w += 12) punkte.push([auto.x1 + 0.02, y + Math.cos((w * Math.PI) / 180) * 0.33, 0.33 + Math.sin((w * Math.PI) / 180) * 0.33]);
    return F("sh-rad", punkte);
  };
  const tornuten: [P3, P3][] = [0.47, 0.94, 1.41, 1.88].map((z) => [
    [tor.x0, Y1 - 0.12, z],
    [tor.x1, Y1 - 0.12, z],
  ]);
  // Die Wallbox hängt vorn an der linken Wand, wo man sie durch das Tor ganz sieht
  const wallbox = { y0: 6.78, y1: 7.2, z0: 0.95, z1: 1.5 };
  const buchse: P3 = [auto.x0 + 0.24, auto.y1 + 0.006, 0.46]; // Ladebuchse vorn links in der Schnauze
  const kabel = (() => {
    const [ax, ay] = p2([tor.x0 + 0.03, (wallbox.y0 + wallbox.y1) / 2, wallbox.z0]);
    const [bx, by] = p2([tor.x0 + 0.55, 7.22, -0.12]);
    const [cx, cy] = p2(buchse);
    return `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${bx.toFixed(1)} ${by.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
  })();
  oben.push(
    <g key="garage" clipPath="url(#sh-tor)">
      {/* Innenraum */}
      {F("sh-innen sh-innen--boden", decke(0, tor.x0, tor.x1, 2.2, Y1))}
      {F("sh-innen sh-innen--wand", seite(tor.x0, 2.2, Y1, 0, tor.z1))}
      {F("sh-innen sh-innen--hinten", vorn(2.2, tor.x0, tor.x1, 0, tor.z1))}
      {F("sh-innenlicht", decke(0.005, tor.x0, tor.x1, 4, Y1))}
      {/* Wallbox mit Ladelicht */}
      {F("sh-wallbox", seite(tor.x0 + 0.01, wallbox.y0, wallbox.y1, wallbox.z0, wallbox.z1))}
      {F("sh-wallbox-blende", seite(tor.x0 + 0.012, wallbox.y0 + 0.07, wallbox.y1 - 0.07, wallbox.z0 + 0.07, wallbox.z0 + 0.25))}
      {kreis("sh-wallbox-licht", [tor.x0 + 0.02, (wallbox.y0 + wallbox.y1) / 2, wallbox.z1 - 0.15], 0.07)}
      {/* Auto */}
      {scheibe("sh-autoschatten", [mitte + 0.25, auto.y1 - 1.1, 0.01], 1.25)}
      {F("sh-auto sh-auto--rechts", [
        [auto.x1, auto.y0, 0.28],
        [auto.x1, auto.y1, 0.28],
        [auto.x1, auto.y1, 0.74],
        [auto.x1, haube, 0.94],
        [auto.x1, auto.y0, 0.94],
      ])}
      {rad(auto.y1 - 0.6)}
      {F("sh-auto sh-auto--vorn", vorn(auto.y1, auto.x0, auto.x1, 0.28, 0.74))}
      {F("sh-auto sh-auto--oben", decke(0.94, auto.x0, auto.x1, auto.y0, haube))}
      {F("sh-auto sh-auto--haube", [
        [auto.x0, auto.y1, 0.74],
        [auto.x1, auto.y1, 0.74],
        [auto.x1, haube, 0.94],
        [auto.x0, haube, 0.94],
      ])}
      {F("sh-autoglas", [
        [auto.x1 - 0.06, haube, 0.94],
        [auto.x1 - 0.2, dachkante, 1.46],
        [auto.x1 - 0.2, auto.y0 + 0.8, 1.46],
        [auto.x1 - 0.06, auto.y0 + 0.25, 0.94],
      ])}
      {F("sh-autoglas", [
        [auto.x0 + 0.06, haube, 0.94],
        [auto.x1 - 0.06, haube, 0.94],
        [auto.x1 - 0.2, dachkante, 1.46],
        [auto.x0 + 0.2, dachkante, 1.46],
      ])}
      {F("sh-auto sh-auto--oben", decke(1.46, auto.x0 + 0.2, auto.x1 - 0.2, auto.y0 + 0.8, dachkante))}
      {F("sh-kuehler", vorn(auto.y1 + 0.004, auto.x0 + 0.42, auto.x1 - 0.42, 0.32, 0.52))}
      {F("sh-kennzeichen", vorn(auto.y1 + 0.006, mitte - 0.26, mitte + 0.26, 0.36, 0.48))}
      {F("sh-scheinwerfer", vorn(auto.y1 + 0.004, auto.x0 + 0.1, auto.x0 + 0.56, 0.57, 0.68))}
      {F("sh-scheinwerfer", vorn(auto.y1 + 0.004, auto.x1 - 0.56, auto.x1 - 0.1, 0.57, 0.68))}
      {/* Ladekabel von der Wallbox zur Buchse in der Schnauze */}
      <path key="kabel" className="sh-kabel" d={kabel} />
      {kreis("sh-stecker", buchse, 0.07)}
      {/* Laibung und Tor */}
      {F("sh-torlaibung", seite(tor.x0, Y1 - 0.12, Y1, 0, tor.z1))}
      <g className="sh-torblatt" style={{ "--hub": `${(tor.z1 * MASS).toFixed(1)}px` } as CSSProperties}>
        {F("sh-tor", vorn(Y1 - 0.12, tor.x0, tor.x1, 0, tor.z1))}
        {L("sh-tornut", tornuten)}
        {F("sh-torgriff", vorn(Y1 - 0.115, 2.0, 2.4, 0.2, 0.26))}
      </g>
    </g>,
  );

  // Eingang: Nische mit Holz, Haustür, Glasfeld, Sprechanlage
  const nische = { x0: 4.45, x1: 6.3, z1: 2.55, tief: 1 };
  const hinten = Y1 - nische.tief;
  ausschnitte.push(
    <clipPath key="nische" id="sh-nische">
      <polygon points={pts(vorn(Y1, nische.x0, nische.x1, 0, nische.z1))} />
    </clipPath>,
  );
  const holzfugen = (x0: number, x1: number, y: number, z0: number, z1: number, schritt = 0.16): [P3, P3][] => {
    const linien: [P3, P3][] = [];
    for (let x = x0 + schritt; x < x1 - 0.02; x += schritt) linien.push([[x, y, z0], [x, y, z1]]);
    return linien;
  };
  unten.push(
    <g key="eingang" clipPath="url(#sh-nische)">
      {F("sh-holz sh-holz--vorn", vorn(hinten, nische.x0, nische.x1, 0, nische.z1))}
      {L("sh-holzfuge", holzfugen(nische.x0, nische.x1, hinten, 0, nische.z1))}
      {F("sh-tuer", vorn(hinten + 0.01, 4.82, 5.84, 0.04, 2.2))}
      {F("sh-tuerglas", vorn(hinten + 0.012, 5.92, 6.16, 0.2, 2.1))}
      {F("sh-tuergriff", vorn(hinten + 0.02, 5.68, 5.73, 0.7, 1.6))}
      {F("sh-holz sh-holz--rechts", seite(nische.x0, hinten, Y1, 0, nische.z1))}
      {F("sh-sprech", seite(nische.x0 + 0.005, 7.05, 7.25, 1.25, 1.62))}
      {F("sh-stufe", decke(0.06, nische.x0, nische.x1, hinten, Y1))}
      {F("sh-nischenschatten", vorn(hinten + 0.015, nische.x0, nische.x1, 2.05, nische.z1))}
    </g>,
  );
  oben.push(
    <g key="eingang-licht" clipPath="url(#sh-nische)" className="sh-licht" style={{ "--i": 0 } as CSSProperties}>
      {F("sh-lichtfleck", decke(0.065, nische.x0, nische.x1, hinten, Y1))}
      {F("sh-lichtglas sh-lichtglas--v", vorn(hinten + 0.013, 5.92, 6.16, 0.2, 2.1))}
      {F("sh-lichtwand", vorn(hinten + 0.016, nische.x0, nische.x1, 0, nische.z1))}
    </g>,
  );

  fenster({ lage: "v", ebene: Y1, a0: 6.8, a1: 8.95, z0: 0.12, z1: 2.62, scheiben: 2 });
  fenster({ lage: "s", ebene: X1, a0: 4.5, a1: 7.2, z0: 0.12, z1: 2.62, scheiben: 2 });
  fenster({ lage: "s", ebene: X1, a0: 1.2, a1: 2.5, z0: 1.15, z1: 2.4, scheiben: 1, ohneJalousie: true });

  // Schatten unter dem auskragenden Obergeschoss
  unten.push(F("sh-kragschatten", vorn(Y1 + 0.002, 0, X1, 2.42, 3)));

  /* ------------------------------------------------------------ Terrasse vorn rechts */

  unten.push(...quader("sh-deck", 6.45, 10.7, Y1, 10.5, 0, 0.14));
  unten.push(
    L(
      "sh-diele",
      Array.from({ length: 13 }, (_, n): [P3, P3] => [
        [6.45, 7.82 + n * 0.21, 0.142],
        [10.7, 7.82 + n * 0.21, 0.142],
      ]),
    ),
  );
  // Liege und Tisch
  unten.push(...quader("sh-sitz", 9.05, 10.3, 8.25, 8.45, 0.14, 0.86), ...quader("sh-sitz", 9.05, 10.3, 8.45, 9.2, 0.14, 0.48), F("sh-polster", decke(0.485, 9.13, 10.22, 8.5, 9.12)));
  unten.push(...quader("sh-sitz", 7.5, 8.2, 9.45, 10.05, 0.14, 0.44));

  /* ------------------------------------------------------------ Obergeschoss: Holz, kragt vorn aus */

  unten.push(F("sh-holz sh-holz--rechts", seite(X1, 0, KRAG, 3, 6)), F("sh-holz sh-holz--vorn", vorn(KRAG, 0, X1, 3, 6)));
  unten.push(L("sh-holzfuge", holzfugen(0, X1, KRAG, 3, 6)));
  unten.push(
    L(
      "sh-holzfuge sh-holzfuge--rechts",
      Array.from({ length: 49 }, (_, n): [P3, P3] => [
        [X1, 0.16 + n * 0.16, 3],
        [X1, 0.16 + n * 0.16, 6],
      ]),
    ),
  );
  fenster({ lage: "v", ebene: KRAG, a0: 0.8, a1: 3.4, z0: 3.7, z1: 5.4, scheiben: 2 });
  fenster({ lage: "v", ebene: KRAG, a0: 4.6, a1: 8.6, z0: 3.7, z1: 5.4, scheiben: 3 });
  fenster({ lage: "s", ebene: X1, a0: 1.0, a1: 2.7, z0: 3.7, z1: 5.4, scheiben: 1 });
  fenster({ lage: "s", ebene: X1, a0: 4.6, a1: 7.0, z0: 3.7, z1: 5.4, scheiben: 2 });

  /* ------------------------------------------------------------ Dachterrasse und Dachgeschoss */

  const D0 = 2.6; // linke Wand des Dachgeschosses
  const DY = 5.2; // seine Vorderwand
  // Deck in L-Form um das zurückgesetzte Dachgeschoss
  unten.push(
    F("sh-deck sh-deck--oben", [
      [0, 0, 6.02],
      [D0, 0, 6.02],
      [D0, DY, 6.02],
      [X1, DY, 6.02],
      [X1, KRAG, 6.02],
      [0, KRAG, 6.02],
    ]),
  );
  unten.push(
    L(
      "sh-diele",
      Array.from({ length: 12 }, (_, n): [P3, P3] => [
        [0, 5.42 + n * 0.21, 6.022],
        [X1, 5.42 + n * 0.21, 6.022],
      ]),
    ),
  );
  // Brüstung aus Glas: erst die hinteren Felder
  unten.push(F("sh-bruestung", vorn(0.02, 0, D0, 6, 7)), F("sh-bruestung", seite(0.02, 0, KRAG, 6, 7)));
  unten.push(L("sh-handlauf", [[[0, 0.02, 7], [D0, 0.02, 7]], [[0.02, 0, 7], [0.02, KRAG, 7]]]));
  // Pflanzkübel mit Strauch
  unten.push(...quader("sh-kuebel", 0.45, 1.5, 6.5, 7.45, 6.02, 6.55), kreis("sh-krone", [0.98, 6.98, 7.05], 0.62), kreis("sh-krone sh-krone--hell", [1.2, 6.85, 7.3], 0.42));

  // Dachgeschoss
  unten.push(F("sh-dunkel sh-dunkel--rechts", seite(X1, 0, DY, 6, 8.7)), F("sh-dunkel sh-dunkel--vorn", vorn(DY, D0, X1, 6, 8.7)));
  fenster({ lage: "v", ebene: DY, a0: 3.3, a1: 8.6, z0: 6.14, z1: 8.3, scheiben: 3 });
  fenster({ lage: "s", ebene: X1, a0: 1.1, a1: 4.1, z0: 6.55, z1: 8.2, scheiben: 2 });
  unten.push(F("sh-kragschatten", vorn(DY + 0.002, D0, X1, 8.42, 8.7)), F("sh-kragschatten", seite(X1 + 0.002, 0, DY, 8.42, 8.7)));
  // Dach mit Blende und Photovoltaik
  unten.push(
    F("sh-blende sh-blende--rechts", seite(X1 + 0.3, -0.3, DY + 0.4, 8.7, 8.96)),
    F("sh-blende sh-blende--vorn", vorn(DY + 0.4, D0 - 0.3, X1 + 0.3, 8.7, 8.96)),
    F("sh-dach", decke(8.96, D0 - 0.3, X1 + 0.3, -0.3, DY + 0.4)),
  );
  const pvModule: ReactNode[] = [];
  const zellen: [P3, P3][] = [];
  for (const [mx0, mx1] of [[2.75, 4.3], [4.4, 5.95], [6.05, 7.6], [7.7, 9.25]] as const) {
    for (const [my0, my1] of [[0.05, 2.5], [2.65, 5.1]] as const) {
      pvModule.push(F("sh-modul", decke(8.975, mx0, mx1, my0, my1)));
      for (let n = 1; n < 3; n++) zellen.push([[mx0 + ((mx1 - mx0) * n) / 3, my0, 8.977], [mx0 + ((mx1 - mx0) * n) / 3, my1, 8.977]]);
      for (let n = 1; n < 5; n++) zellen.push([[mx0, my0 + ((my1 - my0) * n) / 5, 8.977], [mx1, my0 + ((my1 - my0) * n) / 5, 8.977]]);
    }
  }
  unten.push(...pvModule, L("sh-zelle", zellen));

  // Brüstung vorn und rechts: liegt vor dem Dachgeschoss
  unten.push(F("sh-bruestung sh-bruestung--nah", seite(X1 - 0.02, DY, KRAG, 6, 7)), F("sh-bruestung sh-bruestung--nah", vorn(KRAG - 0.02, 0, X1, 6, 7)));
  unten.push(
    L("sh-handlauf", [
      [[X1 - 0.02, DY, 7], [X1 - 0.02, KRAG, 7]],
      [[0, KRAG - 0.02, 7], [X1, KRAG - 0.02, 7]],
      [[X1, KRAG - 0.02, 6], [X1, KRAG - 0.02, 7]],
      [[0, KRAG - 0.02, 6], [0, KRAG - 0.02, 7]],
      [[3.13, KRAG - 0.02, 6], [3.13, KRAG - 0.02, 7]],
      [[6.27, KRAG - 0.02, 6], [6.27, KRAG - 0.02, 7]],
    ]),
  );

  /* ------------------------------------------------------------ Baum neben dem Haus, Strauch, Wegeleuchten */

  // Der Baum steht rechts hinten vor der Hecke und ragt ein Stück vor die Hausecke: das gibt dem Bild Tiefe
  unten.push(
    F("sh-stamm sh-stamm--rechts", seite(baum.x + 0.09, baum.y - 0.16, baum.y, 0, 2.5)),
    F("sh-stamm", vorn(baum.y, baum.x - 0.09, baum.x + 0.09, 0, 2.5)),
    kreis("sh-krone", [baum.x, baum.y - 0.05, 3.3], 1.12),
    kreis("sh-krone sh-krone--hell", [baum.x - 0.32, baum.y + 0.3, 3.95], 0.8),
    kreis("sh-krone", [baum.x + 0.3, baum.y - 0.2, 4.15], 0.85),
    kreis("sh-krone sh-krone--hell", [baum.x - 0.02, baum.y + 0.12, 4.6], 0.68),
  );
  unten.push(scheibe("sh-schatten", [10.85, 11.0, 0.02], 0.7), kreis("sh-krone", [10.8, 11.05, 0.7], 0.72), kreis("sh-krone sh-krone--hell", [10.58, 11.18, 1.05], 0.46));
  const leuchten: [number, number][] = [
    [4.36, 8.7],
    [4.36, 10.7],
    [6.3, 11.05],
    [11.05, 9.3],
  ];
  for (const [x, y] of leuchten) {
    unten.push(F("sh-poller", vorn(y, x - 0.05, x + 0.05, 0, 0.55)), kreis("sh-pollerkopf", [x, y, 0.6], 0.09));
  }
  // Wandleuchte zwischen Garage und Eingang
  unten.push(F("sh-wandleuchte", vorn(Y1 + 0.005, 4.14, 4.26, 1.8, 2.15)));

  /* ------------------------------------------------------------ Licht im Freien: über der Abendstimmung */

  const frei: ReactNode[] = [];
  // Lichtschein aus dem Wohnzimmer auf die Terrasse
  frei.push(
    F("sh-lichtteppich", [
      [6.8, Y1 + 0.02, 0.15],
      [8.95, Y1 + 0.02, 0.15],
      [9.7, 10.3, 0.15],
      [6.5, 10.3, 0.15],
    ]),
  );
  for (const [x, y] of leuchten) {
    frei.push(scheibe("sh-lichthof", [x, y + 0.1, 0.02], 1.15), kreis("sh-leuchtpunkt", [x, y, 0.6], 0.1));
  }
  frei.push(kreis("sh-lichthof sh-lichthof--wand", [4.2, Y1 + 0.02, 1.95], 0.95), F("sh-leuchtpunkt", vorn(Y1 + 0.006, 4.14, 4.26, 1.8, 2.15)));
  oben.push(
    <g key="frei" className="sh-licht sh-licht--frei" style={{ "--i": 2 } as CSSProperties}>
      {frei}
    </g>,
  );
  // Licht aus der offenen Garage auf die Einfahrt
  oben.push(
    F("sh-torlicht", [
      [tor.x0, Y1 + 0.02, 0.02],
      [tor.x1, Y1 + 0.02, 0.02],
      [tor.x1 + 0.5, 10.1, 0.02],
      [tor.x0 - 0.3, 10.1, 0.02],
    ]),
  );

  // Bildausschnitt: das Grundstück samt Sockel und das Dach
  const umriss = [...rund(0), ...rund(-0.55), ...decke(8.96, D0 - 0.3, X1 + 0.3, -0.3, DY + 0.4)].map(p2);
  const kasten = {
    minX: Math.min(...umriss.map((q) => q[0])),
    maxX: Math.max(...umriss.map((q) => q[0])),
    minY: Math.min(...umriss.map((q) => q[1])),
    maxY: Math.max(...umriss.map((q) => q[1])),
  };
  return { unten, oben, ausschnitte, kasten };
}

const SCHALTER: { art: "licht" | "jalousie" | "garage" | "abend"; name: string; an: string; aus: string; anfangs?: boolean }[] = [
  { art: "licht", name: "Licht", an: "an", aus: "aus", anfangs: true },
  { art: "jalousie", name: "Jalousien", an: "unten", aus: "oben" },
  { art: "garage", name: "Garage", an: "offen", aus: "zu" },
  { art: "abend", name: "Abend", an: "an", aus: "aus" },
];

export function Schauhaus() {
  const { unten, oben, ausschnitte, kasten } = baueSzene();
  const rand = 22;
  const x = kasten.minX - rand;
  const y = kasten.minY - rand * 1.8;
  const breite = kasten.maxX - kasten.minX + rand * 2;
  const hoehe = kasten.maxY - kasten.minY + rand * 2.9;

  // Sterne und Mond im freien Himmel links und rechts über dem Haus
  const sterne: [number, number, number][] = [
    [0.06, 0.1, 1.4], [0.13, 0.22, 1], [0.2, 0.07, 1.2], [0.27, 0.17, 0.9], [0.09, 0.33, 0.9], [0.34, 0.05, 1],
    [0.72, 0.06, 1], [0.8, 0.16, 1.3], [0.9, 0.09, 1], [0.95, 0.24, 0.9], [0.86, 0.3, 1.1], [0.66, 0.13, 0.8],
  ];

  return (
    <div className="schauhaus">
      <div className="schauhaus__buehne">
        <svg
          className="schauhaus__bild"
          viewBox={`${x.toFixed(0)} ${y.toFixed(0)} ${breite.toFixed(0)} ${hoehe.toFixed(0)}`}
          role="img"
          aria-label="Gezeichnetes Haus mit drei Geschossen, Garage, Dachterrasse und Photovoltaik auf dem Dach. Die Schalter darunter schalten Licht, Jalousien, Garagentor und Abendstimmung."
        >
          <defs>
            {ausschnitte}
            <linearGradient id="sh-verlauf-glas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="sh-stop-glas-oben" />
              <stop offset="1" className="sh-stop-glas-unten" />
            </linearGradient>
            <linearGradient id="sh-verlauf-licht" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF3CF" />
              <stop offset="1" stopColor="#FFC65C" />
            </linearGradient>
            <linearGradient id="sh-verlauf-sockel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" className="sh-stop-sockel-vorn" />
              <stop offset="0.52" className="sh-stop-sockel-vorn" />
              <stop offset="0.6" className="sh-stop-sockel-rechts" />
              <stop offset="1" className="sh-stop-sockel-rechts" />
            </linearGradient>
            <radialGradient id="sh-verlauf-krone" cx="0.36" cy="0.3" r="0.75">
              <stop offset="0" className="sh-stop-krone-hell" />
              <stop offset="1" className="sh-stop-krone-dunkel" />
            </radialGradient>
            <radialGradient id="sh-verlauf-krone-hell" cx="0.36" cy="0.3" r="0.75">
              <stop offset="0" className="sh-stop-krone-licht" />
              <stop offset="1" className="sh-stop-krone-mittel" />
            </radialGradient>
            <radialGradient id="sh-verlauf-hof">
              <stop offset="0" stopColor="#FFD27A" stopOpacity="0.85" />
              <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sh-verlauf-teppich" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD27A" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="schauhaus__szene">{unten}</g>

          {/* Abendstimmung: dunkelt alles darunter ab, auch den Himmel der Bühne */}
          <rect className="sh-nacht" x={x} y={y} width={breite} height={hoehe} />
          <g className="sh-himmel">
            {sterne.map(([sx, sy, r], i) => (
              <circle key={i} cx={(x + sx * breite).toFixed(0)} cy={(y + sy * hoehe).toFixed(0)} r={r * 1.6} />
            ))}
            <circle className="sh-mond" cx={(x + breite * 0.88).toFixed(0)} cy={(y + hoehe * 0.11).toFixed(0)} r="15" />
          </g>

          <g className="schauhaus__lichter">{oben}</g>
        </svg>
      </div>

      <fieldset className="schauhaus__tafel">
        <legend className="nur-vorlesen">Smart Home ausprobieren</legend>
        {SCHALTER.map((s) => (
          <label className="schauhaus__taste" key={s.art}>
            <input className={`schauhaus__schalter schauhaus__schalter--${s.art}`} type="checkbox" role="switch" defaultChecked={s.anfangs} />
            <Kippschalter />
            <span className="schauhaus__name">
              {s.name}
              <small aria-hidden="true">
                <span className="schauhaus__an">{s.an}</span>
                <span className="schauhaus__aus">{s.aus}</span>
              </small>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
