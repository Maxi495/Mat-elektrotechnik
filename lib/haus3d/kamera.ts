import { MathUtils, PerspectiveCamera, Vector3 } from "three";

/**
 * Freie Kamera für das 3D-Haus.
 *
 * Die Kamera kreist um einen Zielpunkt: ziehen dreht, zoomen fährt auf den Punkt unter dem Zeiger zu.
 * Ist sie ganz nah, schiebt weiteres Zoomen den Zielpunkt nach vorn. So geht man durch Türen ins Haus.
 * Es gibt keine Wände für die Kamera: Sie darf überall hin, nur nicht unter den Boden.
 *
 * Kamerafahrten laufen über eine Spur aus Standorten und Blickpunkten. Jede Eingabe bricht eine Fahrt ab.
 */

export interface Halt {
  ort: Vector3;
  blick: Vector3;
}

/** Ränder der Bühne in Pixeln, die Text und Knöpfe belegen */
export interface Rand {
  links: number;
  rechts: number;
  oben: number;
  unten: number;
}

export interface Blick {
  ziel: Vector3;
  radius: number;
  /** Winkel von der Senkrechten, 0 = von oben */
  phi: number;
  /** Winkel um das Haus, 0 = von vorn, positiv nach rechts */
  theta: number;
}

/** Kurve "Strom" aus Design.md: cubic-bezier(0.65, 0, 0.35, 1), hier als gleichwertige Formel */
export const strom = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Für lange Fahrten: setzt zügiger ein als "Strom", damit die Kamera nicht erst lange steht, und läuft weich aus */
const sanft = (t: number) => 0.5 * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) + 0.5 * (1 - Math.pow(1 - t, 3));

const GRENZE = { x0: -7, x1: 16.4, z0: -7, z1: 17, y0: 0.2, y1: 10.5 };
const NAH = 0.6;
/** Öffnungswinkel: draußen eng wie bei einem Modellfoto, drinnen weit wie im Raum */
const WINKEL_AUSSEN = 31;
const WINKEL_INNEN = 64;

export class Kamera {
  readonly kamera = new PerspectiveCamera(WINKEL_AUSSEN, 1, 0.06, 240);

  private ziel = new Vector3(4.7, 3.3, 4.0);
  private zielSoll = this.ziel.clone();
  private radius = 34;
  private radiusSoll = 34;
  private phi = 1.08;
  private phiSoll = 1.08;
  private theta = 0.72;
  private thetaSoll = 0.72;
  /** Größter Abstand: Das ganze Grundstück passt ins Bild */
  private weit = 34;
  private heim: Blick = { ziel: this.ziel.clone(), radius: 34, phi: 1.08, theta: 0.72 };

  private spur: { halte: Halt[]; laengen: number[]; gesamt: number; dauer: number; zeit: number; fertig?: () => void } | null = null;
  private dreht = false;
  private zeiger = new Map<number, { x: number; y: number; taste: number }>();
  private abstandVorher = 0;
  private mitteVorher = { x: 0, y: 0 };
  private gezogen = 0;
  private aufraeumen: (() => void)[] = [];
  private hilf = new Vector3();
  private hilf2 = new Vector3();

  /** Wird bei jeder Eingabe des Besuchers gerufen: Die Szene hört dann auf, von selbst zu drehen. */
  beiEingabe: () => void = () => {};
  /** Liefert den Punkt im Raum unter einer Stelle der Fläche, für das Zoomen auf den Zeiger */
  punktUnter: (x: number, y: number) => Vector3 | null = () => null;

  /** "flaeche" ist die ganze Bühne samt den Punkten im Haus: Ziehen wirkt überall auf ihr. */
  constructor(
    private flaeche: HTMLElement,
    private melde: () => void,
    private ruhig: boolean,
  ) {
    this.setze();
    this.hoere();
  }

  /* ------------------------------------------------------------ Zustand */

  get zielpunkt(): Vector3 {
    return this.ziel;
  }

  get abstand(): number {
    return this.radius;
  }

  /** Wie weit die Kamera "drinnen" ist: 0 = Blick aufs ganze Haus, 1 = im Raum */
  get innen(): number {
    return 1 - MathUtils.smoothstep(this.radius, 2.6, 13);
  }

  get faehrt(): boolean {
    return this.spur !== null;
  }

  /** Wurde seit dem Drücken gezogen? Dann ist das Loslassen kein Klick. */
  get wurdeGezogen(): boolean {
    return this.gezogen > 6;
  }

  /**
   * Passt den größten Abstand an Form und Größe der Bühne an.
   * "frei" nennt die Ränder in Pixeln, die Text und Knöpfe belegen: Das Haus steht in der Mitte des Rests.
   */
  passeEin(breite: number, hoehe: number, frei: Rand): void {
    const k = this.kamera;
    k.aspect = breite / Math.max(1, hoehe);
    const dx = (frei.links - frei.rechts) / 2;
    const dy = (frei.oben - frei.unten) / 2;
    if (dx || dy) k.setViewOffset(breite, hoehe, -dx, -dy, breite, hoehe);
    else k.clearViewOffset();
    const halb = Math.tan(MathUtils.degToRad(WINKEL_AUSSEN / 2));
    const hoch = Math.atan(halb * Math.max(0.3, (hoehe - frei.oben - frei.unten) / hoehe));
    const quer = Math.atan(halb * k.aspect * Math.max(0.3, (breite - frei.links - frei.rechts) / breite));
    // Für die Höhe zählt das Haus mit Dach, für die Breite das ganze Grundstück. Auf schmalen Bühnen nur das Haus.
    const vorher = this.weit;
    this.weit = MathUtils.clamp(Math.max(7.4 / Math.sin(hoch), (breite < 700 ? 7.6 : 11.4) / Math.sin(quer)), 24, 90);
    this.heim.radius = this.weit;
    // Stand die Kamera in der Übersicht, bleibt sie dort
    if (Math.abs(this.radiusSoll - vorher) < 0.5 || this.radiusSoll > this.weit) {
      this.radiusSoll = this.weit;
      if (!this.spur) this.radius = this.weit;
    }
    this.setze();
    this.melde();
  }

  /** Blick aufs ganze Haus */
  get uebersicht(): Blick {
    return { ziel: this.heim.ziel.clone(), radius: this.weit, phi: this.heim.phi, theta: this.heim.theta };
  }

  get istWeit(): boolean {
    return this.radiusSoll >= this.weit * 0.995;
  }

  /** Aktueller Standort und Blickpunkt */
  halt(): Halt {
    return { ort: this.kamera.position.clone(), blick: this.ziel.clone() };
  }

  dreheVonSelbst(an: boolean): void {
    this.dreht = an && !this.ruhig;
    if (this.dreht) this.melde();
  }

  /* ------------------------------------------------------------ Bewegen */

  /** Dreht um den Zielpunkt. Winkel in Bogenmaß. */
  drehe(dTheta: number, dPhi: number): void {
    this.brichAb();
    this.thetaSoll += dTheta;
    this.phiSoll = this.klemmePhi(this.phiSoll + dPhi);
    this.melde();
  }

  /** Zoomt. faktor < 1 fährt heran. "punkt" bleibt dabei unter dem Zeiger. */
  zoome(faktor: number, punkt?: Vector3 | null): void {
    this.brichAb();
    const vorher = this.radiusSoll;
    const neu = MathUtils.clamp(vorher * faktor, NAH, this.weit);
    if (neu === vorher && faktor < 1) {
      // Schon ganz nah: weitergehen in Blickrichtung
      this.kamera.getWorldDirection(this.hilf);
      this.zielSoll.addScaledVector(this.hilf, (1 - faktor) * 3.2);
    } else {
      const anteil = 1 - neu / vorher;
      if (punkt && anteil > 0) this.zielSoll.lerp(punkt, Math.min(1, anteil));
      else if (anteil < 0 && neu > this.weit * 0.55) {
        // Beim Herauszoomen wandert der Zielpunkt zurück zur Hausmitte
        const zurueck = MathUtils.smoothstep(neu, this.weit * 0.55, this.weit);
        this.zielSoll.lerp(this.heim.ziel, zurueck * 0.5);
        if (neu >= this.weit) this.zielSoll.copy(this.heim.ziel);
      }
      this.radiusSoll = neu;
    }
    this.klemmeZiel();
    this.phiSoll = this.klemmePhi(this.phiSoll);
    this.melde();
  }

  /** Verschiebt den Zielpunkt in der Bildebene. Angaben in Pixeln. */
  schiebe(dx: number, dy: number): void {
    this.brichAb();
    const hoehe = this.flaeche.clientHeight || 1;
    const jePixel = (2 * this.radius * Math.tan(MathUtils.degToRad(this.kamera.fov / 2))) / hoehe;
    const rechts = this.hilf.setFromMatrixColumn(this.kamera.matrixWorld, 0);
    const oben = this.hilf2.setFromMatrixColumn(this.kamera.matrixWorld, 1);
    this.zielSoll.addScaledVector(rechts, -dx * jePixel).addScaledVector(oben, dy * jePixel);
    this.klemmeZiel();
    this.melde();
  }

  /** Geht auf dem Boden: vor und zurück in Blickrichtung, seitlich quer dazu. Angaben in Metern. */
  gehe(vor: number, seit: number): void {
    this.brichAb();
    const s = Math.sin(this.theta);
    const c = Math.cos(this.theta);
    // Blickrichtung auf dem Boden: von der Kamera zum Ziel
    this.zielSoll.x += -s * vor + c * seit;
    this.zielSoll.z += -c * vor - s * seit;
    this.klemmeZiel();
    this.melde();
  }

  /** Springt ohne Fahrt in einen Blick. */
  springe(b: Blick): void {
    this.spur = null;
    this.ziel.copy(b.ziel);
    this.zielSoll.copy(b.ziel);
    this.radius = this.radiusSoll = b.radius;
    this.phi = this.phiSoll = b.phi;
    this.theta = this.thetaSoll = b.theta;
    this.setze();
    this.melde();
  }

  /**
   * Fährt entlang einer Spur. Der letzte Halt wird zum neuen Blick.
   * "marken" verteilt die Zeit auf die Halte (ohne Angabe gleichmäßig nach Strecke).
   */
  fahre(halte: Halt[], dauer: number, marken?: number[], fertig?: () => void): void {
    if (halte.length < 2 || this.ruhig || dauer <= 0) {
      const letzter = halte[halte.length - 1];
      this.uebernimm(letzter);
      fertig?.();
      return;
    }
    let laengen = marken;
    if (!laengen || laengen.length !== halte.length) {
      laengen = [0];
      for (let i = 1; i < halte.length; i++) laengen.push(laengen[i - 1] + Math.max(0.001, halte[i].ort.distanceTo(halte[i - 1].ort)));
    }
    this.spur = { halte, laengen, gesamt: laengen[laengen.length - 1] || 1, dauer, zeit: 0, fertig };
    this.melde();
  }

  /** Bricht eine laufende Fahrt ab. Die Kamera bleibt stehen, wo sie ist. */
  brichAb(): void {
    if (!this.spur) return;
    const fertig = this.spur.fertig;
    this.spur = null;
    this.uebernimm({ ort: this.kamera.position.clone(), blick: this.ziel.clone() });
    fertig?.();
  }

  /** Macht aus Standort und Blickpunkt den Zustand der kreisenden Kamera. */
  private uebernimm(h: Halt): void {
    const v = this.hilf.subVectors(h.ort, h.blick);
    const r = Math.max(NAH * 0.5, v.length());
    this.ziel.copy(h.blick);
    this.zielSoll.copy(h.blick);
    this.radius = this.radiusSoll = r;
    this.phi = this.phiSoll = Math.acos(MathUtils.clamp(v.y / r, -1, 1));
    this.theta = this.thetaSoll = Math.atan2(v.x, v.z);
    this.setze();
    this.melde();
  }

  /**
   * Ein Schritt. Liefert true, solange sich die Kamera noch bewegt.
   */
  schritt(dt: number): boolean {
    if (this.spur) {
      const s = this.spur;
      s.zeit += dt;
      const t = Math.min(1, s.zeit / s.dauer);
      const weg = sanft(t) * s.gesamt;
      let i = 1;
      while (i < s.laengen.length - 1 && s.laengen[i] < weg) i++;
      const a = s.halte[i - 1];
      const b = s.halte[i];
      const stueck = s.laengen[i] - s.laengen[i - 1];
      const u = stueck > 0 ? MathUtils.clamp((weg - s.laengen[i - 1]) / stueck, 0, 1) : 1;
      this.kamera.position.lerpVectors(a.ort, b.ort, u);
      this.ziel.lerpVectors(a.blick, b.blick, u);
      this.radius = this.kamera.position.distanceTo(this.ziel);
      this.richte();
      if (t >= 1) {
        const fertig = s.fertig;
        this.spur = null;
        this.uebernimm(s.halte[s.halte.length - 1]);
        fertig?.();
      }
      return true;
    }

    if (this.dreht) this.thetaSoll += dt * 0.07;
    const k = this.ruhig ? 1 : 1 - Math.exp(-dt * 10);
    const vorher = this.radius + this.phi * 7 + this.theta * 7 + this.ziel.x + this.ziel.y + this.ziel.z;
    this.ziel.lerp(this.zielSoll, k);
    this.radius += (this.radiusSoll - this.radius) * k;
    this.phi += (this.phiSoll - this.phi) * k;
    this.theta += (this.thetaSoll - this.theta) * k;
    this.setze();
    const nachher = this.radius + this.phi * 7 + this.theta * 7 + this.ziel.x + this.ziel.y + this.ziel.z;
    return this.dreht || Math.abs(nachher - vorher) > 0.00015;
  }

  private klemmePhi(phi: number): number {
    // Die Kamera bleibt über dem Boden
    const tiefste = Math.acos(MathUtils.clamp((0.3 - this.zielSoll.y) / Math.max(NAH, this.radiusSoll), -1, 1));
    return MathUtils.clamp(phi, 0.06, Math.min(tiefste, 2.5));
  }

  private klemmeZiel(): void {
    const z = this.zielSoll;
    z.x = MathUtils.clamp(z.x, GRENZE.x0, GRENZE.x1);
    z.y = MathUtils.clamp(z.y, GRENZE.y0, GRENZE.y1);
    z.z = MathUtils.clamp(z.z, GRENZE.z0, GRENZE.z1);
  }

  /** Stellt die Kamera aus Zielpunkt, Abstand und Winkeln. */
  private setze(): void {
    const s = Math.sin(this.phi);
    this.kamera.position.set(this.ziel.x + this.radius * s * Math.sin(this.theta), this.ziel.y + this.radius * Math.cos(this.phi), this.ziel.z + this.radius * s * Math.cos(this.theta));
    this.richte();
  }

  private richte(): void {
    const k = this.kamera;
    k.lookAt(this.ziel);
    const winkel = MathUtils.lerp(WINKEL_AUSSEN, WINKEL_INNEN, this.innen);
    if (Math.abs(k.fov - winkel) > 0.01) {
      k.fov = winkel;
    }
    k.updateProjectionMatrix();
    k.updateMatrixWorld();
  }

  /* ------------------------------------------------------------ Eingaben */

  private hoere(): void {
    const f = this.flaeche;
    const an = <K extends keyof HTMLElementEventMap>(art: K, tu: (e: HTMLElementEventMap[K]) => void, opt?: AddEventListenerOptions) => {
      f.addEventListener(art, tu, opt);
      this.aufraeumen.push(() => f.removeEventListener(art, tu, opt));
    };

    // Der Zeiger wird erst festgehalten, wenn wirklich gezogen wird. So bleibt ein Klick auf einen Punkt im Haus
    // ein Klick, und ein Ziehen, das auf einem Punkt beginnt, dreht trotzdem das Haus.
    const halte = (id: number) => {
      try {
        f.setPointerCapture(id);
      } catch {
        // Der Zeiger ist schon weg: nichts zu halten
      }
    };

    an("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button > 2) return;
      this.zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY, taste: e.button });
      this.gezogen = 0;
      if (this.zeiger.size === 2) {
        this.merkeZwei();
        for (const id of this.zeiger.keys()) halte(id);
      }
      this.beiEingabe();
    });

    an("pointermove", (e) => {
      const z = this.zeiger.get(e.pointerId);
      if (!z) return;
      const dx = e.clientX - z.x;
      const dy = e.clientY - z.y;
      z.x = e.clientX;
      z.y = e.clientY;
      const vorher = this.gezogen;
      this.gezogen += Math.abs(dx) + Math.abs(dy);
      if (this.zeiger.size === 1) {
        if (this.gezogen <= 6) return;
        if (vorher <= 6) halte(e.pointerId);
        if (z.taste === 2 || z.taste === 1 || e.shiftKey) this.schiebe(dx, dy);
        else {
          const tempo = (Math.PI * 1.15) / Math.max(320, f.clientHeight);
          this.drehe(-dx * tempo, -dy * tempo);
        }
      } else if (this.zeiger.size === 2) {
        const [a, b] = Array.from(this.zeiger.values());
        const abstand = Math.hypot(a.x - b.x, a.y - b.y);
        const mitte = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (this.abstandVorher > 0 && abstand > 0) {
          const kasten = f.getBoundingClientRect();
          this.zoome(this.abstandVorher / abstand, this.punktUnter(mitte.x - kasten.left, mitte.y - kasten.top));
        }
        this.schiebe(mitte.x - this.mitteVorher.x, mitte.y - this.mitteVorher.y);
        this.abstandVorher = abstand;
        this.mitteVorher = mitte;
      }
    });

    const los = (e: PointerEvent) => {
      this.zeiger.delete(e.pointerId);
      if (this.zeiger.size === 1) {
        // Vom Zoomen mit zwei Fingern zurück zum Drehen: nicht springen
        this.gezogen = 7;
      }
    };
    an("pointerup", los);
    an("pointercancel", los);
    an("contextmenu", (e) => e.preventDefault());

    an("keydown", (e) => {
      const schritt = e.shiftKey ? 0.32 : 0.14;
      let erkannt = true;
      switch (e.key) {
        case "ArrowLeft":
          this.drehe(-schritt, 0);
          break;
        case "ArrowRight":
          this.drehe(schritt, 0);
          break;
        case "ArrowUp":
          this.drehe(0, -schritt * 0.7);
          break;
        case "ArrowDown":
          this.drehe(0, schritt * 0.7);
          break;
        case "+":
        case "=":
          this.zoome(0.8);
          break;
        case "-":
        case "_":
          this.zoome(1.25);
          break;
        case "w":
        case "W":
          this.gehe(0.8, 0);
          break;
        case "s":
        case "S":
          this.gehe(-0.8, 0);
          break;
        case "a":
        case "A":
          this.gehe(0, -0.8);
          break;
        case "d":
        case "D":
          this.gehe(0, 0.8);
          break;
        default:
          erkannt = false;
      }
      if (erkannt) {
        e.preventDefault();
        this.beiEingabe();
      }
    });
  }

  private merkeZwei(): void {
    const [a, b] = Array.from(this.zeiger.values());
    this.abstandVorher = Math.hypot(a.x - b.x, a.y - b.y);
    this.mitteVorher = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  entferne(): void {
    for (const weg of this.aufraeumen) weg();
    this.aufraeumen = [];
    this.spur = null;
  }
}
