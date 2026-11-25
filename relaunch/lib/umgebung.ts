import { firma } from "@/daten/firma";

/**
 * Adresse, unter der die Seite gerade läuft, und die Frage, ob Suchmaschinen sie aufnehmen dürfen.
 *
 * Solange die Seite auf der Vercel-Adresse liegt und noch [OFFEN: ...]-Platzhalter enthält,
 * bleibt sie für Suchmaschinen gesperrt. Sobald die echte Domain als Produktionsadresse
 * am Vercel-Projekt hängt, schaltet sich die Aufnahme von selbst frei.
 *
 * Umgebungsvariable INDEXIERUNG überschreibt das: "an" gibt frei, "aus" sperrt.
 */
const echteDomain = new URL(firma.domain).hostname.replace(/^www\./, "");
const vercelProduktion = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "";

const aufEchterDomain =
  process.env.VERCEL_ENV === "production" && vercelProduktion.endsWith(echteDomain);

export const indexierbar =
  process.env.INDEXIERUNG === "an" || (process.env.INDEXIERUNG !== "aus" && aufEchterDomain);

/** Basis für Canonical, Vorschaubilder und Sitemap. */
export const basisUrl: string = indexierbar
  ? firma.domain
  : vercelProduktion
    ? `https://${vercelProduktion}`
    : "http://localhost:3000";

export const absolut = (pfad: string): string => new URL(pfad, basisUrl).toString();
