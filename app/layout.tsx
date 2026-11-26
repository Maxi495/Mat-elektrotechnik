import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import "@/stil/werte.css";
import "@/stil/grund.css";
import "@/stil/bausteine.css";
import "@/stil/formular.css";
import "@/stil/kopf-fuss.css";
import "@/stil/leitung.css";
import "@/stil/seiten.css";
import "@/stil/karte.css";
import "@/stil/bewegung.css";

import { Bedienung } from "@/bausteine/Bedienung";
import { Fusszeile } from "@/bausteine/Fusszeile";
import { JsonLd } from "@/bausteine/Geruest";
import { Handyleiste } from "@/bausteine/Handyleiste";
import { Kopfzeile } from "@/bausteine/Kopfzeile";
import { firma } from "@/daten/firma";
import { betriebLd } from "@/lib/seo";
import { basisUrl, indexierbar } from "@/lib/umgebung";

/**
 * Jede Seite wird beim Bau vollständig statisch erzeugt.
 * Der Bau bricht ab, sobald eine Seite Daten erst bei der Anfrage laden würde.
 */
export const ensureStatic = "navigation";

/* Zwei variable Schriften vom eigenen Server (Design.md, Abschnitt 4). Keine Verbindung zu Google. */
const bricolage = localFont({
  src: "../schriften/bricolage-grotesque-latin-wdth.woff2",
  variable: "--datei-bricolage",
  weight: "200 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const figtree = localFont({
  src: "../schriften/figtree-latin-wght.woff2",
  variable: "--datei-figtree",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(basisUrl),
  title: {
    default: "Elektriker Germering & München-West | Mat-Elektrotechnik",
    template: "%s | Mat-Elektrotechnik",
  },
  description:
    "Elektroinstallation, Photovoltaik, Wallbox, Blitzschutz und Netzwerktechnik aus Germering. 4,9 Sterne bei Google. Jetzt Angebot anfragen.",
  applicationName: firma.name,
  robots: indexierbar ? { index: true, follow: true } : { index: false, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: { siteName: firma.name, locale: "de_DE", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

/**
 * Läuft vor dem ersten Bild: merkt sich, dass Skripte laufen, stellt die gemerkte Wahl
 * des Lichtschalters wieder her und gibt den Auftakt der Startseite einmal je Besuch frei.
 */
const vorab = `(function(){var d=document.documentElement;d.classList.add("js");try{if(localStorage.getItem("mat-licht")==="aus")d.dataset.licht="aus";if(!sessionStorage.getItem("mat-auftakt")){if(location.pathname==="/")d.dataset.auftakt="1";sessionStorage.setItem("mat-auftakt","1")}}catch(e){}})()`;

export default function Grundgeruest({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de"
      className={`${bricolage.variable} ${figtree.variable}`}
      data-licht="an"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: vorab }} />
      </head>
      <body>
        <a className="sprunglink" href="#inhalt">
          Zum Inhalt springen
        </a>
        <Kopfzeile />
        <main id="inhalt" className="seite">
          <div className="leitung" aria-hidden="true">
            <span className="leitung__bahn" />
            <span className="leitung__strom" />
          </div>
          {children}
        </main>
        <Fusszeile />
        <Handyleiste telefon={firma.telefon.href} />
        <Bedienung />
        <JsonLd daten={betriebLd()} />
      </body>
    </html>
  );
}
