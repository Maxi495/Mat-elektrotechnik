import type { NextConfig } from "next";
import { weiterleitungen } from "./daten/weiterleitungen";

const nextConfig: NextConfig = {
  // Alle Seiten werden beim Bau statisch erzeugt (siehe ensureStatic in app/layout.tsx).
  cacheComponents: true,
  partialPrefetching: true,

  // Schrägstriche am Ende leiten wir selbst um, damit alte Adressen in einem Schritt mit 301 ankommen.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Anfrageformular mit Foto: Vercel nimmt höchstens 4,5 MB je Anfrage an.
    serverActions: { bodySizeLimit: "4mb" },
  },

  async redirects() {
    return weiterleitungen;
  },

  async headers() {
    return [
      // Kartendaten tragen eine Prüfsumme im Namen, die Hilfsdateien eine Versionsangabe in der Adresse.
      {
        source: "/:ordner(karte|kartenhelfer)/:datei*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:pfad*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
