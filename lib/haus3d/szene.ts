import {
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  Mesh,
  NeutralToneMapping,
  PCFShadowMap,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from "three";
import { leistungsReihenfolge, type LeistungId } from "@/daten/adressen";
import { baueDinge, type Wunsch } from "./dinge";
import { AUSSENLICHT, baueHaus, leuchtkugel, RAEUME, type RaumId } from "./haus";
import { Kamera, type Blick, type Halt, type Rand } from "./kamera";
import { baueLeitung } from "./leitung";
import { ORTE } from "./orte";
import { baueStoffe, GLUEHLICHT } from "./stoffe";
import { baueTeile } from "./teile";
import { planeFahrt, type Ziel } from "./wege";

/**
 * Die 3D-Szene des Hauses: Bild, Licht, Kamera, die neun Leistungen und der Takt, in dem gezeichnet wird.
 * Gezeichnet wird nur, wenn sich etwas ändert. Steht alles still, ruht auch die Grafikkarte.
 */

export interface Punktlage {
  id: LeistungId;
  x: number;
  y: number;
  /** Liegt der Punkt im Bild und vor der Kamera? */
  sichtbar: boolean;
}

export interface Szenenwunsch {
  /** In dieses Element kommt die Zeichenfläche */
  buehne: HTMLElement;
  /** "Weniger Bewegung": keine Fahrten, keine Dauerbewegung */
  ruhig: boolean;
  /** Ränder der Bühne in Pixeln, die Text und Knöpfe belegen. Das Haus steht in der Mitte des Rests. */
  frei: () => Rand;
  /** Der Besucher hat im Haus eine Leistung angeklickt */
  beiWahl: (id: LeistungId) => void;
  /** Lage der neun Punkte im Bild, nach jedem gezeichneten Bild */
  beiPunkten: (lagen: Punktlage[]) => void;
  /** Der Besucher hat zum ersten Mal selbst gedreht oder gezoomt */
  beiEingabe?: () => void;
  /** Die Kamera ist nah herangefahren oder wieder zurück in der Übersicht */
  beiNaehe?: (nah: boolean) => void;
  /** Der Browser hat der Szene die Grafik entzogen (true) oder zurückgegeben (false) */
  beiAusfall?: (aus: boolean) => void;
}

export interface Hausszene {
  waehle: (id: LeistungId | null) => void;
  zurUebersicht: () => void;
  zoome: (faktor: number) => void;
  /** Größe neu lesen, zum Beispiel nach dem Wechsel in den Vollbildmodus */
  passeAn: () => void;
  entferne: () => void;
  /** Nur zum Prüfen: Kamera frei stellen */
  stelle?: (blick: { ziel: [number, number, number]; radius: number; phi: number; theta: number }) => void;
  /** Nur zum Prüfen: Zahl der Zeichenaufrufe und Dreiecke des letzten Bilds */
  zahlen?: () => { aufrufe: number; dreiecke: number };
  /** Für das Standbild: das Haus in der Übersicht auf durchsichtigem Grund, als PNG-Daten */
  foto?: (breite: number, hoehe: number) => string;
}

const nah = (a: Vector3, x: number, y: number, z: number, weite: number) => {
  const dx = a.x - x;
  const dy = a.y - y;
  const dz = a.z - z;
  return dx * dx + dy * dy + dz * dz < weite * weite;
};

/** Gibt dem Browser Luft: Der Aufbau der Szene läuft in mehreren kurzen Schritten statt in einem langen. */
const atempause = () => new Promise<void>((weiter) => setTimeout(weiter, 0));

export async function starteSzene(wunsch: Szenenwunsch): Promise<Hausszene> {
  const { buehne, ruhig } = wunsch;

  const bild = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  bild.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  bild.toneMapping = NeutralToneMapping;
  bild.toneMappingExposure = 1.0;
  bild.shadowMap.enabled = true;
  bild.shadowMap.type = PCFShadowMap;
  bild.shadowMap.autoUpdate = false;
  bild.localClippingEnabled = true;
  const flaeche = bild.domElement;
  flaeche.className = "haus3d__flaeche";
  // Three.js setzt "display: block" fest an die Fläche. Das Stylesheet soll sie aber ausblenden können.
  flaeche.style.display = "";
  flaeche.tabIndex = 0;
  // Die Fläche nimmt Tasten an: Pfeile drehen, Plus und Minus zoomen. Die neun Leistungen wählt man über die Knöpfe darunter.
  flaeche.setAttribute("role", "application");
  flaeche.setAttribute("aria-label", "3D-Ansicht des Hauses. Pfeiltasten drehen das Haus, Plus und Minus zoomen, W, A, S und D gehen.");
  buehne.appendChild(flaeche);

  const szene = new Scene();
  const stoffe = baueStoffe();

  // Bewusst ohne gespiegelte Umgebung: Sie kostet beim Start am meisten Rechenzeit und bringt dem matten Modell wenig.
  const HIMMEL = 1.85;
  const himmel = new HemisphereLight(0xf0f4f9, 0x6d727a, HIMMEL);
  szene.add(himmel);
  // Aufhellung von rechts hinten, ohne Schatten: Die Seiten im Schatten der Sonne saufen sonst ab
  const aufhellung = new DirectionalLight(0xe3ebf6, 0.85);
  aufhellung.position.set(4.7 + 12, 9, 3.8 - 9);
  aufhellung.target.position.set(4.7, 3, 3.8);
  szene.add(aufhellung, aufhellung.target);
  const sonne = new DirectionalLight(0xfff2de, 2.45);
  sonne.position.set(4.7 - 10, 18, 3.8 + 13);
  sonne.target.position.set(4.7, 2, 3.8);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  sonne.shadow.camera.left = -14;
  sonne.shadow.camera.right = 14;
  sonne.shadow.camera.top = 14;
  sonne.shadow.camera.bottom = -14;
  sonne.shadow.camera.near = 1;
  sonne.shadow.camera.far = 60;
  sonne.shadow.bias = -0.0004;
  sonne.shadow.normalBias = 0.03;
  sonne.shadow.radius = 2.5;
  szene.add(sonne, sonne.target);

  await atempause();

  // Das Haus: je Werkstoff ein Netz
  const haus = baueHaus();
  const fest: Mesh[] = [];
  for (const name of haus.stoffe()) {
    const stoff = stoffe.nach[name];
    if (!stoff) {
      console.warn("Haus: Werkstoff fehlt:", name);
      continue;
    }
    const netz = new Mesh(haus.geometrie(name), stoff);
    netz.castShadow = name !== "glas";
    netz.receiveShadow = name !== "glas";
    netz.name = name;
    if (name === "glas") netz.renderOrder = 2;
    szene.add(netz);
    fest.push(netz);
  }
  // Wegeleuchten: leuchten immer ein wenig
  const kugel = leuchtkugel();
  const leuchtstoff = stoffe.leuchtend(GLUEHLICHT, 1.1);
  for (const [x, y, z] of AUSSENLICHT) {
    const n = new Mesh(kugel, leuchtstoff);
    n.position.set(x, y, z);
    szene.add(n);
  }

  await atempause();
  const teile = baueTeile(stoffe);
  const dinge = baueDinge(stoffe);
  const leitung = baueLeitung(ruhig);
  szene.add(teile.gruppe, dinge.gruppe, leitung.gruppe);
  await atempause();

  let schmutzig = true;
  let dran = 0;
  // Gezeichnet wird nur, wenn die Szene fertig aufgebaut, die Bühne im Bild und der Tab sichtbar ist
  let zuSehen = false;
  let fertig = false;
  let imBild = true;
  let letzte = performance.now();
  let zeit = 0;
  let istNah = false;
  const melde = () => {
    schmutzig = true;
    fordere();
  };

  const kamera = new Kamera(buehne, melde, ruhig);
  let selbstGedreht = false;
  kamera.beiEingabe = () => {
    kamera.dreheVonSelbst(false);
    if (!selbstGedreht) {
      selbstGedreht = true;
      wunsch.beiEingabe?.();
    }
  };

  /* ------------------------------------------------------------ Treffen: Was liegt unter dem Zeiger? */

  const strahl = new Raycaster();
  const stelle = new Vector2();
  const treffpunkt = new Vector3();
  const waende: Object3D[] = [...fest.filter((n) => n.name !== "glas"), teile.gruppe];
  const richte = (x: number, y: number) => {
    stelle.set((x / Math.max(1, flaeche.clientWidth)) * 2 - 1, -(y / Math.max(1, flaeche.clientHeight)) * 2 + 1);
    strahl.setFromCamera(stelle, kamera.kamera);
  };
  kamera.punktUnter = (x, y) => {
    richte(x, y);
    const treffer = strahl.intersectObjects(waende, true)[0];
    return treffer ? treffer.point : null;
  };
  /** Welche Leistung liegt unter dieser Stelle? Wände davor verdecken sie. */
  const leistungUnter = (x: number, y: number): LeistungId | null => {
    richte(x, y);
    let beste: LeistungId | null = null;
    let abstand = Infinity;
    for (const d of dinge.liste) {
      for (const g of d.griffe) {
        if (!strahl.ray.intersectBox(g, treffpunkt)) continue;
        const weite = treffpunkt.distanceTo(strahl.ray.origin);
        if (weite < abstand) {
          abstand = weite;
          beste = d.id;
        }
      }
    }
    if (!beste) return null;
    const wand = strahl.intersectObjects(waende, true)[0];
    return wand && wand.distance < abstand - 0.45 ? null : beste;
  };

  let gedrueckt = false;
  const druck = () => {
    gedrueckt = true;
  };
  const los = (e: PointerEvent) => {
    if (!gedrueckt) return;
    gedrueckt = false;
    if (kamera.wurdeGezogen || e.button > 0) return;
    const kasten = flaeche.getBoundingClientRect();
    const id = leistungUnter(e.clientX - kasten.left, e.clientY - kasten.top);
    if (id) wunsch.beiWahl(id);
  };
  let zeigerPruefen = 0;
  const schwebt = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.buttons || zeigerPruefen) return;
    const x = e.clientX;
    const y = e.clientY;
    zeigerPruefen = requestAnimationFrame(() => {
      zeigerPruefen = 0;
      const kasten = flaeche.getBoundingClientRect();
      flaeche.style.cursor = leistungUnter(x - kasten.left, y - kasten.top) ? "pointer" : "";
    });
  };
  flaeche.addEventListener("pointerdown", druck);
  flaeche.addEventListener("pointerup", los);
  flaeche.addEventListener("pointermove", schwebt);

  /* ------------------------------------------------------------ Größe */

  const passeAn = () => {
    const b = buehne.clientWidth;
    const h = buehne.clientHeight;
    if (!b || !h) return;
    bild.setSize(b, h, false);
    kamera.passeEin(b, h, wunsch.frei());
    dinge.groesse(b, h);
    leitung.groesse(b, h);
    melde();
  };
  const groesse = new ResizeObserver(passeAn);
  groesse.observe(buehne);

  /* ------------------------------------------------------------ Zoomen mit dem Rad */

  let zuletztGezoomt = -1e9;
  const rad = (e: WheelEvent) => {
    const gezielt = e.ctrlKey || e.metaKey;
    const heran = e.deltaY < 0;
    if (!gezielt) {
      if (window.scrollY > 24) return;
      if (!heran && kamera.istWeit) {
        // Das Haus ist ganz zu sehen: Die Seite scrollt weiter. Nur nicht im selben Schwung, mit dem gerade
        // herausgezoomt wurde, sonst rutscht die Seite ungewollt davon.
        if (e.timeStamp - zuletztGezoomt > 420) return;
        zuletztGezoomt = e.timeStamp;
        e.preventDefault();
        return;
      }
    }
    zuletztGezoomt = e.timeStamp;
    e.preventDefault();
    const kasten = flaeche.getBoundingClientRect();
    const weite = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    const faktor = Math.exp(MathUtils.clamp(weite, -160, 160) * (gezielt ? 0.011 : 0.0021));
    kamera.zoome(faktor, heran ? kamera.punktUnter(e.clientX - kasten.left, e.clientY - kasten.top) : null);
    kamera.beiEingabe();
  };
  buehne.addEventListener("wheel", rad, { passive: false });

  /* ------------------------------------------------------------ Leben: Auswahl, Licht, Türen */

  let aktiv: LeistungId | null = null;
  let gewaehltUm = 0;
  const kraft = new Map<LeistungId, number>(leistungsReihenfolge.map((id) => [id, 0]));
  const raumIds = Object.keys(RAEUME) as RaumId[];
  const blickpunkt = new Vector3();

  /** In welchem Raum steht die Kamera? */
  const raumDer = (p: Vector3): RaumId | null => {
    for (const id of raumIds) {
      const r = RAEUME[id];
      if (p.x > r.x0 - 0.15 && p.x < r.x1 + 0.15 && p.z > r.z0 - 0.15 && p.z < r.z1 + 0.15 && p.y > r.y0 && p.y < r.y1 + 0.2) return id;
    }
    return null;
  };

  function lebe(dt: number): boolean {
    let lebt = false;
    const ort = kamera.kamera.position;

    // Die Leistungen: Die gewählte fährt hoch, die anderen herunter
    let will: Wunsch = {};
    for (const d of dinge.liste) {
      const ziel = d.id === aktiv ? 1 : 0;
      let k = kraft.get(d.id) ?? 0;
      if (k !== ziel) {
        k = ruhig ? ziel : ziel > k ? Math.min(1, k + dt * 1.8) : Math.max(0, k - dt * 2.6);
        kraft.set(d.id, k);
        lebt = true;
        if (k === 0) d.schritt(0, 0, zeit);
      }
      if (k > 0) {
        // Bei "weniger Bewegung" steht jedes Ding in seinem fertigen Zustand: Automaten an, Messung bestanden
        const antwort = d.schritt(k, ruhig ? 5 : Math.max(0, zeit - gewaehltUm), zeit);
        if (d.id === aktiv && antwort) will = antwort;
        if (d.id === aktiv && !ruhig) lebt = true;
      }
    }

    // Türen gehen auf, wenn die Kamera näher kommt
    teile.haustuer.ziel = nah(ort, 5.22, 1.4, 6.6, 3.7) ? 1 : 0;
    teile.tor.ziel = aktiv === "wallbox" || nah(ort, 2.2, 1.3, 7.2, 3.4) ? 1 : 0;
    teile.terrassentuer.ziel = nah(ort, 6.05, 7.4, 5.1, 3.1) ? 1 : 0;
    teile.jalousien.ziel = will.jalousien ?? 0;
    if (teile.schritt(ruhig ? 9 : dt)) {
      bild.shadowMap.needsUpdate = true;
      lebt = true;
    }

    // Licht: an, wo die Kamera steht und wo die gewählte Leistung sitzt
    const hier = raumDer(ort);
    const dort = aktiv ? (ORTE[aktiv].raum ?? null) : null;
    for (const id of raumIds) {
      let ziel = id === hier || id === dort ? 1 : 0;
      if (id === dort && will.raumlicht !== undefined) ziel = will.raumlicht;
      // Steht das Tor offen, ist auch die Garage hell
      if (id === "garage" && teile.tor.stand > 0.25) ziel = Math.max(ziel, 0.85);
      const l = stoffe.raeume[id].licht;
      if (Math.abs(l.value - ziel) > 0.002) {
        l.value = ruhig ? ziel : l.value + (ziel - l.value) * Math.min(1, dt * 4.5);
        lebt = true;
      } else l.value = ziel;
    }

    // Blitzschlag: Die ganze Szene blitzt kurz auf
    const hell = HIMMEL + (will.blitz ?? 0) * 2.4;
    if (himmel.intensity !== hell) {
      himmel.intensity = hell;
      lebt = true;
    }

    if (leitung.schritt(dt, zeit, kamera.innen)) lebt = true;
    return lebt;
  }

  const lagen: Punktlage[] = leistungsReihenfolge.map((id) => ({ id, x: 0, y: 0, sichtbar: false }));
  const meldePunkte = () => {
    const b = flaeche.clientWidth;
    const h = flaeche.clientHeight;
    // Steht die Kamera in einem Raum, zeigen sich nur die Punkte dieses Raums: Die übrigen lägen hinter Wänden
    const hier = raumDer(kamera.kamera.position);
    for (const l of lagen) {
      const a = ORTE[l.id].anker;
      blickpunkt.set(a[0], a[1], a[2]).project(kamera.kamera);
      l.x = (blickpunkt.x * 0.5 + 0.5) * b;
      l.y = (-blickpunkt.y * 0.5 + 0.5) * h;
      const imBild = blickpunkt.z > -1 && blickpunkt.z < 1 && l.x > -30 && l.x < b + 30 && l.y > -30 && l.y < h + 30;
      l.sichtbar = imBild && (!hier || ORTE[l.id].raum === hier);
    }
    wunsch.beiPunkten(lagen);
  };

  /* ------------------------------------------------------------ Takt */

  function zeichne(jetzt: number) {
    dran = 0;
    const dt = Math.min(0.05, Math.max(0.001, (jetzt - letzte) / 1000));
    letzte = jetzt;
    zeit += dt;
    const bewegt = kamera.schritt(dt);
    const lebt = lebe(dt);
    if (bewegt || lebt || schmutzig) {
      schmutzig = false;
      bild.render(szene, kamera.kamera);
      meldePunkte();
      const jetztNah = kamera.abstand < kamera.uebersicht.radius * 0.62;
      if (jetztNah !== istNah) {
        istNah = jetztNah;
        wunsch.beiNaehe?.(istNah);
      }
    }
    if (bewegt || lebt) fordere();
  }
  function fordere() {
    if (!dran && zuSehen) dran = requestAnimationFrame(zeichne);
  }

  const pruefeSicht = () => {
    const vorher = zuSehen;
    zuSehen = fertig && imBild && !document.hidden;
    if (zuSehen && !vorher) {
      letzte = performance.now();
      melde();
    }
  };
  const sicht = new IntersectionObserver(([e]) => {
    imBild = e.isIntersecting;
    pruefeSicht();
  });
  sicht.observe(buehne);
  const tab = pruefeSicht;
  document.addEventListener("visibilitychange", tab);

  // Nimmt der Browser der Seite die Grafik weg (Handy im Hintergrund, knapper Speicher), steht solange das Standbild da
  const verloren = (e: Event) => {
    e.preventDefault();
    fertig = false;
    pruefeSicht();
    wunsch.beiAusfall?.(true);
  };
  const zurueck = () => {
    fertig = true;
    bild.shadowMap.needsUpdate = true;
    pruefeSicht();
    melde();
    wunsch.beiAusfall?.(false);
  };
  flaeche.addEventListener("webglcontextlost", verloren);
  flaeche.addEventListener("webglcontextrestored", zurueck);

  /* ------------------------------------------------------------ Fahrten */

  const haltAus = (b: Blick): Halt => {
    const s = Math.sin(b.phi);
    return { ort: new Vector3(b.ziel.x + b.radius * s * Math.sin(b.theta), b.ziel.y + b.radius * Math.cos(b.phi), b.ziel.z + b.radius * s * Math.cos(b.theta)), blick: b.ziel.clone() };
  };
  const fahreZu = (ziel: Ziel) => {
    // Mindestens 1200 ms nach Design.md. Führt der Weg durchs Haus, dauert die Fahrt entsprechend länger.
    const plan = planeFahrt(kamera.halt(), ziel);
    kamera.fahre(plan.halte, plan.dauer, plan.marken);
  };

  passeAn();
  // Die Programme für die Grafikkarte übersetzen, ohne den Browser dabei anzuhalten. Erst dann das erste Bild.
  await bild.compileAsync(szene, kamera.kamera);
  fertig = true;
  bild.shadowMap.needsUpdate = true;
  kamera.dreheVonSelbst(true);
  pruefeSicht();

  return {
    waehle: (id) => {
      if (id === aktiv) return;
      aktiv = id;
      gewaehltUm = zeit;
      leitung.zeige(id);
      if (id) {
        kamera.dreheVonSelbst(false);
        fahreZu(ORTE[id]);
      }
      melde();
    },
    zurUebersicht: () => {
      const h = haltAus(kamera.uebersicht);
      fahreZu({ auge: [h.ort.x, h.ort.y, h.ort.z], blick: [h.blick.x, h.blick.y, h.blick.z] });
    },
    zoome: (faktor) => {
      kamera.zoome(faktor);
      kamera.beiEingabe();
    },
    passeAn,
    stelle: (b) => {
      kamera.dreheVonSelbst(false);
      kamera.springe({ ziel: new Vector3(b.ziel[0], b.ziel[1], b.ziel[2]), radius: b.radius, phi: b.phi, theta: b.theta });
    },
    zahlen: () => ({ aufrufe: bild.info.render.calls, dreiecke: bild.info.render.triangles }),
    foto: (breite, hoehe) => {
      kamera.dreheVonSelbst(false);
      const dichte = bild.getPixelRatio();
      bild.setPixelRatio(1);
      bild.setSize(breite, hoehe, false);
      kamera.passeEin(breite, hoehe, { links: 0, rechts: 0, oben: 0, unten: 0 });
      // etwas weiter weg als in der Bühne, damit das ganze Grundstück aufs Bild passt
      const ganz = kamera.uebersicht;
      kamera.springe({ ...ganz, radius: ganz.radius * 1.3 });
      dinge.groesse(breite, hoehe);
      leitung.groesse(breite, hoehe);
      bild.render(szene, kamera.kamera);
      const daten = flaeche.toDataURL("image/png");
      bild.setPixelRatio(dichte);
      passeAn();
      return daten;
    },
    entferne: () => {
      cancelAnimationFrame(dran);
      cancelAnimationFrame(zeigerPruefen);
      groesse.disconnect();
      sicht.disconnect();
      document.removeEventListener("visibilitychange", tab);
      buehne.removeEventListener("wheel", rad);
      flaeche.removeEventListener("pointerdown", druck);
      flaeche.removeEventListener("pointerup", los);
      flaeche.removeEventListener("pointermove", schwebt);
      flaeche.removeEventListener("webglcontextlost", verloren);
      flaeche.removeEventListener("webglcontextrestored", zurueck);
      kamera.entferne();
      for (const n of fest) n.geometry.dispose();
      kugel.dispose();
      teile.entferne();
      dinge.entferne();
      leitung.entferne();
      stoffe.entferne();
      bild.dispose();
      flaeche.remove();
    },
  };
}
