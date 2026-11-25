import type { Metadata } from "next";
import { firma } from "@/daten/firma";
import { areaServed } from "@/daten/orte";
import type { Leistung } from "@/daten/leistungen";
import type { Stelle } from "@/daten/stellen";
import { klartext } from "@/bausteine/Fliesstext";
import { absolut, indexierbar } from "./umgebung";

/**
 * Titel, Meta-Beschreibung, Canonical und Vorschau je Seite (SEO-Optimierung.md, Kapitel 8 und 11).
 * Der Titel wird wortgleich übernommen, ohne angehängten Firmennamen.
 */
export function seitenMeta({
  titel,
  beschreibung,
  pfad,
  index = true,
}: {
  titel: string;
  beschreibung: string;
  pfad: string;
  /** false für Seiten, die nie in Suchmaschinen stehen sollen (Danke-Seite). */
  index?: boolean;
}): Metadata {
  return {
    title: { absolute: titel },
    description: beschreibung,
    alternates: { canonical: pfad },
    robots: index && indexierbar ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: titel,
      description: beschreibung,
      url: pfad,
      siteName: firma.name,
      locale: "de_DE",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: titel, description: beschreibung },
  };
}

/* ---------- Strukturierte Daten (SEO-Optimierung.md, 11.4) ---------- */

const firmenId = `${firma.domain}/#betrieb`;

/**
 * Electrician auf jeder Seite. Öffnungszeiten erscheinen erst, wenn sie in daten/firma.ts bestätigt sind.
 * Keine Bewertungssterne im Markup: Google zeigt selbst vergebene Sterne für lokale Firmen nicht an.
 */
export function betriebLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": firmenId,
    name: firma.name,
    url: `${firma.domain}/`,
    telephone: firma.telefon.international,
    email: firma.email,
    foundingDate: String(firma.gegruendet),
    image: absolut("/opengraph-image"),
    logo: absolut("/logo-mat.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: firma.adresse.strasse,
      postalCode: firma.adresse.plz,
      addressLocality: firma.adresse.ort,
      addressRegion: firma.adresse.bundesland,
      addressCountry: firma.adresse.land,
    },
    ...(firma.erreichbarkeit.bestaetigt
      ? {
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: firma.erreichbarkeit.von,
              closes: firma.erreichbarkeit.bis,
            },
          ],
        }
      : {}),
    areaServed,
    sameAs: [firma.facebook],
  };
}

export type Krume = { name: string; pfad: string };

export function brotkrumenLd(krumen: Krume[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: krumen.map((k, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: k.name,
      item: absolut(k.pfad),
    })),
  };
}

export function leistungLd(l: Leistung) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: l.name,
    serviceType: l.name,
    description: l.seo.beschreibung,
    url: absolut(l.pfad),
    provider: { "@id": firmenId },
    areaServed,
  };
}

export function fragenLd(fragen: { frage: string; antwort: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: klartext(f.antwort) },
    })),
  };
}

/** JobPosting nur, wenn das Datum der Veröffentlichung bekannt ist (daten/stellen.ts). */
export function stelleLd(s: Stelle) {
  if (!s.veroeffentlicht) return null;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: s.titel,
    description: [
      `<p>${s.einleitung}</p>`,
      "<p>Aufgaben</p>",
      `<ul>${s.aufgaben.map((a) => `<li>${a}</li>`).join("")}</ul>`,
      "<p>Anforderungen</p>",
      `<ul>${s.anforderungen.map((a) => `<li>${a}</li>`).join("")}</ul>`,
      "<p>Unser Angebot</p>",
      `<ul>${s.angebot.map((a) => `<li>${a}</li>`).join("")}</ul>`,
    ].join(""),
    datePosted: s.veroeffentlicht,
    url: absolut(s.pfad),
    hiringOrganization: {
      "@type": "Organization",
      name: firma.name,
      sameAs: `${firma.domain}/`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: firma.adresse.strasse,
        postalCode: firma.adresse.plz,
        addressLocality: firma.adresse.ort,
        addressRegion: firma.adresse.bundesland,
        addressCountry: firma.adresse.land,
      },
    },
  };
}
