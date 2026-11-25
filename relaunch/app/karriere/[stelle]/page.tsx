import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bewerbung } from "@/bausteine/Bewerbung";
import { Offen } from "@/bausteine/Fliesstext";
import { Abschnitt, JsonLd, Seite, Seitenkopf } from "@/bausteine/Geruest";
import { KnopfLink } from "@/bausteine/Knopf";
import { firma } from "@/daten/firma";
import { stelleNachSlug, stellen } from "@/daten/stellen";
import { seitenMeta, stelleLd } from "@/lib/seo";

/**
 * Der Inhalt hängt von der Adresse ab und liegt fertig erzeugt bereit.
 * Beim Seitenwechsel wartet der Browser kurz auf diese Seite, statt zuerst einen leeren Platzhalter zu zeigen.
 */
export const instant = false;

export function generateStaticParams() {
  return stellen.map((s) => ({ stelle: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/karriere/[stelle]">): Promise<Metadata> {
  const { stelle: slug } = await params;
  const s = stelleNachSlug(slug);
  if (!s) return {};
  return seitenMeta({
    titel: `${s.titel} in Germering | Mat-Elektrotechnik`,
    beschreibung: `${s.kurz} Stelle bei der ${firma.name} in Germering. Bewerbung in wenigen Minuten, Lebenslauf freiwillig.`,
    pfad: s.pfad,
  });
}

/** Stellenseite: Aufgaben, Anforderungen, Angebot, Ansprechperson, Bewerbungsformular (Informationsarchitektur.md, 7.6). */
export default async function Stellenseite({ params }: PageProps<"/karriere/[stelle]">) {
  const { stelle: slug } = await params;
  const s = stelleNachSlug(slug);
  if (!s) notFound();

  const listen = [
    { titel: "Ihre Aufgaben", punkte: s.aufgaben },
    { titel: "Das bringen Sie mit", punkte: s.anforderungen },
    { titel: "Das bieten wir", punkte: s.angebot },
  ];

  return (
    <Seite>
      <Seitenkopf
        krumen={[
          { name: "Karriere", pfad: "/karriere" },
          { name: s.titel, pfad: s.pfad },
        ]}
        titel={s.titel}
        vorspann={s.einleitung}
      >
        <div className="reihe-knoepfe">
          <KnopfLink href="#bewerbung">Jetzt bewerben</KnopfLink>
        </div>
        <p className="klein">
          {firma.name}, {firma.adresse.strasse}, {firma.adresse.plz} {firma.adresse.ort}
        </p>
      </Seitenkopf>

      <Abschnitt art="nebel" eng titel="Aufgaben, Anforderungen und unser Angebot">
        <div className="fuerwen">
          {listen.map((l) => (
            <div className="fuerwen__gruppe" key={l.titel}>
              <h3>{l.titel}</h3>
              <ul className="punktliste">
                {l.punkte.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt eng titel="Ihre Ansprechperson">
        <div className="text">
          <p>
            <Offen>Ansprechperson für Bewerbungen mit Name und Durchwahl</Offen>
          </p>
          <p>
            Fragen zur Stelle beantworten wir gern am Telefon:{" "}
            <a href={firma.telefon.href}>{firma.telefon.anzeige}</a>. Weitere Stellen finden Sie auf der
            Seite <Link href="/karriere">Karriere</Link>.
          </p>
        </div>
      </Abschnitt>

      <Bewerbung
        titel={`Jetzt bewerben: ${s.titel}`}
        text="Name und eine Telefonnummer oder E-Mail-Adresse genügen. Ein Lebenslauf ist freiwillig."
        vorauswahl={s.id}
      />

      <JsonLd daten={stelleLd(s)} />
    </Seite>
  );
}
