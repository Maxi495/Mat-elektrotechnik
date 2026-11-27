import { CanvasTexture, Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector3, type Material } from "three";
import { RAEUME, type RaumId } from "./haus";

/**
 * Werkstoffe des 3D-Hauses. Es gibt keine Bilddateien: Die zwei Muster (Fugen im Holz, Zellen der Solarmodule)
 * werden beim Start auf eine kleine Fläche gezeichnet.
 */

export const ROT = 0xd70036;
export const GLUEHLICHT = 0xffd27a;

/** Schmale dunklere Fuge je Brett: für Holzschalung und Dielen */
function fugen(): CanvasTexture {
  const flaeche = document.createElement("canvas");
  flaeche.width = 64;
  flaeche.height = 4;
  const g = flaeche.getContext("2d");
  if (g) {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 64, 4);
    g.fillStyle = "#b4aea3";
    g.fillRect(0, 0, 4, 4);
    g.fillStyle = "#e9e5de";
    g.fillRect(4, 0, 3, 4);
  }
  const t = new CanvasTexture(flaeche);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(1 / 0.16, 1);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Solarmodul: dunkelblaue Zellen mit feinen hellen Stegen, heller Rahmen */
function zellen(): CanvasTexture {
  const flaeche = document.createElement("canvas");
  flaeche.width = 192;
  flaeche.height = 320;
  const g = flaeche.getContext("2d");
  if (g) {
    g.fillStyle = "#c9ced6";
    g.fillRect(0, 0, 192, 320);
    g.fillStyle = "#0d1830";
    g.fillRect(6, 6, 180, 308);
    g.strokeStyle = "#31446f";
    g.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) {
      g.beginPath();
      g.moveTo(6 + i * 30, 6);
      g.lineTo(6 + i * 30, 314);
      g.stroke();
    }
    for (let i = 1; i < 10; i++) {
      g.beginPath();
      g.moveTo(6, 6 + i * 30.8);
      g.lineTo(186, 6 + i * 30.8);
      g.stroke();
    }
  }
  const t = new CanvasTexture(flaeche);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export interface Raumlicht {
  stoff: MeshStandardMaterial;
  /** 0 = Licht aus, 1 = Licht an */
  licht: { value: number };
}

/**
 * Werkstoff eines Raums. Geht das Licht an, leuchten alle Flächen des Raums in ihrer eigenen Farbe warm,
 * nahe der Lampe heller. Das kostet keine echte Lichtquelle.
 */
function raumstoff(lampe: readonly [number, number, number]): Raumlicht {
  const licht = { value: 0 };
  const stoff = new MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  stoff.onBeforeCompile = (shader) => {
    shader.uniforms.uLicht = licht;
    shader.uniforms.uLampe = { value: new Vector3(lampe[0], lampe[1], lampe[2]) };
    shader.uniforms.uLichtfarbe = { value: new Color(0xffe7c6) };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWelt;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 weltOrt = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          weltOrt = instanceMatrix * weltOrt;
        #endif
        vWelt = (modelMatrix * weltOrt).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWelt;\nuniform float uLicht;\nuniform vec3 uLampe;\nuniform vec3 uLichtfarbe;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float lampenAbstand = distance(vWelt, uLampe);
        float schein = uLicht * (0.17 + 0.5 / (1.0 + lampenAbstand * lampenAbstand * 0.16));
        totalEmissiveRadiance += diffuseColor.rgb * uLichtfarbe * schein;`,
      );
  };
  stoff.customProgramCacheKey = () => "haus3d-raum";
  return { stoff, licht };
}

export interface Stoffe {
  /** Werkstoffe nach Namen, wie sie das Hausmodell nennt */
  nach: Record<string, Material>;
  raeume: Record<RaumId, Raumlicht>;
  glas: MeshStandardMaterial;
  /** Für Leuchten, Anzeigen und alles, was selbst leuchtet */
  leuchtend: (farbe: number, kraft?: number) => MeshBasicMaterial;
  entferne: () => void;
}

export function baueStoffe(): Stoffe {
  const texturen = [fugen(), zellen()];
  const raeume = Object.fromEntries((Object.keys(RAEUME) as RaumId[]).map((id) => [id, raumstoff(RAEUME[id].lampe)])) as Record<RaumId, Raumlicht>;
  const glas = new MeshStandardMaterial({
    color: 0xa8bdcd,
    transparent: true,
    opacity: 0.3,
    roughness: 0.12,
    metalness: 0,
    side: DoubleSide,
    depthWrite: false,
  });
  const nach: Record<string, Material> = {
    bunt: new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 }),
    holz: new MeshStandardMaterial({ vertexColors: true, map: texturen[0], roughness: 0.82, metalness: 0 }),
    metall: new MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.15 }),
    pv: new MeshStandardMaterial({ map: texturen[1], roughness: 0.3, metalness: 0.1 }),
    glas,
  };
  for (const id of Object.keys(RAEUME) as RaumId[]) nach[RAEUME[id].stoff] = raeume[id].stoff;

  const eigene: Material[] = [];
  const leuchtend = (farbe: number, kraft = 1) => {
    const m = new MeshBasicMaterial({ color: new Color(farbe).multiplyScalar(kraft), toneMapped: false });
    eigene.push(m);
    return m;
  };

  return {
    nach,
    raeume,
    glas,
    leuchtend,
    entferne: () => {
      for (const t of texturen) t.dispose();
      for (const m of Object.values(nach)) m.dispose();
      for (const m of eigene) m.dispose();
    },
  };
}
