import type { MetadataRoute } from "next";
import { absolut, indexierbar } from "@/lib/umgebung";

/**
 * robots.txt. Solange die Seite nicht auf der echten Domain läuft, ist sie für Suchmaschinen gesperrt
 * (siehe lib/umgebung.ts). Auf der echten Domain ist alles frei, außer der Danke-Seite.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexierbar) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/kontakt/danke"] }],
    sitemap: absolut("/sitemap.xml"),
  };
}
