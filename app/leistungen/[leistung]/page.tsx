import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { Ablauf, Anfrage, Bewertungsreihe, Fragen } from "@/bausteine/Abschnitte";
import { Bedienfeld } from "@/bausteine/Bedienfeld";
import { Fliesstext, Offen } from "@/bausteine/Fliesstext";
import { Abschnitt, Brotkrumen, Hakenliste, JsonLd, Seite, Seitenkopf } from "@/bausteine/Geruest";
import { Leistungskarte, Referenzkarte } from "@/bausteine/Karten";
import { KnopfLink } from "@/bausteine/Knopf";
import { Zeichen } from "@/bausteine/Zeichen";
import { bewertungenFuer, hatBewertungZurLeistung } from "@/daten/bewertungen";
import { firma } from "@/daten/firma";
import {
  einzugsgebietSatz,
  gruppenNamen,
  leistungen,
  leistungNachId,
  leistungNachSlug,
  type Gruppe,
} from "@/daten/leistungen";
import { referenzenFuer } from "@/daten/referenzen";
import { fragenLd, leistungLd, seitenMeta } from "@/lib/seo";

/**
 * Der Inhalt hängt von der Adresse ab und liegt fertig erzeugt bereit.
 * Beim Seitenwechsel wartet der Browser kurz auf diese Seite, statt zuerst einen leeren Platzhalter zu zeigen.
 */
export const instant = false;

/** Alle neun Leistungsseiten werden beim Bau erzeugt. Andere Adressen enden bei "Seite nicht gefunden". */
export function generateStaticParams() {
  return leistungen.map((l) => ({ leistung: l.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/leistungen/[leistung]">): Promise<Metadata> {
  const { leistung: slug } = await params;
  const l = leistungNachSlug(slug);
  if (!l) return {};
  return seitenMeta({
    titel: l.seo.titel,
    beschreibung: l.seo.beschreibung,
    pfad: l.pfad,
    // Jede Leistung hat ihr eigenes Vorschaubild mit der Hauptüberschrift der Seite.
    vorschau: { pfad: `${l.pfad}/opengraph-image`, alt: l.seo.h1 },
  });
}

const reihenfolge: Gruppe[] = ["privat", "gewerbe", "hausverwaltung"];

/**
 * Leistungsseite. Für alle neun gleich, mit allen zehn Abschnitten
 * in der Reihenfolge aus Informationsarchitektur.md, 7.3.
 */
export default async function Leistungsseite({ params }: PageProps<"/leistungen/[leistung]">) {
  const { leistung: slug } = await params;
  const l = leistungNachSlug(slug);
  if (!l) notFound();

  const position = leistungen.findIndex((x) => x.id === l.id);
  const projekte = referenzenFuer(l.id, 3);
  const stimmen = bewertungenFuer(l.id, position, 2);
  const gruppen = reihenfolge.filter((g) => l.fuerWen.gruppen[g]);
  const krumen = [
    { name: "Leistungen", pfad: "/leistungen" },
    { name: l.name, pfad: l.pfad },
  ];
  const knoepfe = (
    <div className="reihe-knoepfe">
      <KnopfLink href="#anfrage">Anfrage stellen</KnopfLink>
      <KnopfLink href={firma.telefon.href} art="zweit">
        Jetzt anrufen
      </KnopfLink>
    </div>
  );

  return (
    <Seite>
      {/* 1. Kopf: Überschrift mit Leistung und Ort, zwei Sätze Nutzen, Knopf, Foto aus einem echten Projekt */}
      {l.id === "smart-home" ? (
        <header className="seitenkopf seitenkopf--bild">
          <div className="rahmen">
            <Brotkrumen krumen={krumen} />
            <div className="seitenkopf__raster">
              <div className="seitenkopf__text">
                <h1>{l.seo.h1}</h1>
                <p className="vorspann">{l.nutzen}</p>
                {knoepfe}
              </div>
              <Bedienfeld bild={l.bild} alt={l.bildAlt} />
            </div>
          </div>
        </header>
      ) : (
        <Seitenkopf
          krumen={krumen}
          titel={l.seo.h1}
          vorspann={l.nutzen}
          bild={l.bild}
          bildAlt={l.bildAlt}
          bildHinweis={l.bildHinweis}
        >
          {knoepfe}
        </Seitenkopf>
      )}

      {/* 2. Kurzüberblick: was der Kunde bekommt */}
      <section className="abschnitt abschnitt--eng abschnitt--ohne-oben" aria-labelledby="ueberblick">
        <div className="rahmen">
          <h2 className="nur-vorlesen" id="ueberblick">
            {l.name} auf einen Blick
          </h2>
          <div className="ueberblick">
            <Hakenliste punkte={l.ueberblick} />
          </div>
        </div>
      </section>

      {/* 3. Leistungsumfang in Teilabschnitten */}
      <Abschnitt titel={l.umfang.titel}>
        <div className="umfang">
          {l.umfang.teile.map((t) => (
            <div className="umfang__teil" key={t.titel}>
              <h3>{t.titel}</h3>
              <Fliesstext text={t.text} />
            </div>
          ))}
        </div>
      </Abschnitt>

      {/* 4. Für wen */}
      <Abschnitt art="nebel" titel={l.fuerWen.titel}>
        <div className="fuerwen" style={{ "--anzahl": gruppen.length } as CSSProperties}>
          {gruppen.map((g) => (
            <div className="fuerwen__gruppe" key={g}>
              <h3>{gruppenNamen[g]}</h3>
              <Fliesstext text={l.fuerWen.gruppen[g] ?? ""} />
            </div>
          ))}
        </div>
        <p className="klein" style={{ marginTop: "var(--a-7)", maxWidth: "68ch" }}>
          {einzugsgebietSatz}
        </p>
      </Abschnitt>

      {/* 5. Ablauf von Anfrage bis Abnahme, dazu Kosten und Förderung */}
      <Abschnitt titel={l.ablauf.titel}>
        <Ablauf schritte={l.ablauf.schritte} />
        <div className="kostenfeld">
          <h3>{l.kosten.titel}</h3>
          <div className="kostenfeld__text">
            {l.kosten.absaetze.map((a) => (
              <Fliesstext text={a} key={a} />
            ))}
          </div>
        </div>
      </Abschnitt>

      {/* 6. Referenzen dieser Leistung */}
      <Abschnitt art="nebel" titel={l.referenzenTitel}>
        {projekte.length > 0 ? (
          <div className="referenzraster referenzraster--drei" data-reihe>
            {projekte.map((r, i) => (
              <Referenzkarte referenz={r} key={r.id} verlinkt={false} i={i} />
            ))}
          </div>
        ) : (
          <div className="referenzkarte referenzkarte--leer">
            <Zeichen name={l.zeichen} groesse="gross" />
            <p>
              <Offen>{`Referenzprojekt mit Foto zu ${l.name}`}</Offen>
            </p>
          </div>
        )}
        <p style={{ marginTop: "var(--a-7)" }}>
          <Link className="textlink" href={`/referenzen?leistung=${l.id}`}>
            {projekte.length > 0 ? `Alle Referenzen zu ${l.name} ansehen` : "Alle Referenzen ansehen"}
          </Link>
        </p>
      </Abschnitt>

      {/* 7. Bewertungen, möglichst zu dieser Leistung */}
      <Abschnitt titel="Das sagen Kunden über unsere Arbeit">
        <Bewertungsreihe liste={stimmen} laufband={false} />
        {hatBewertungZurLeistung(l.id) ? null : (
          <p className="klein" style={{ marginTop: "var(--a-3)" }}>
            <Offen>{`Bewertung zu ${l.name}`}</Offen>
          </p>
        )}
      </Abschnitt>

      {/* 8. Häufige Fragen */}
      <Abschnitt art="nebel" titel={l.fragenTitel}>
        <Fragen fragen={l.fragen} />
        <JsonLd daten={fragenLd(l.fragen)} />
      </Abschnitt>

      {/* 9. Verwandte Leistungen */}
      <Abschnitt art="dunkel" titel={`Das passt zu ${l.name}`}>
        <div className="kartenraster" data-reihe>
          {l.verwandt.map((id, i) => (
            <Leistungskarte leistung={leistungNachId(id)} key={id} i={i} />
          ))}
        </div>
      </Abschnitt>

      {/* 10. Anfrage mit vorausgewählter Leistung */}
      <Anfrage
        titel={`Anfrage zu ${l.name} stellen`}
        text="Schreiben Sie uns, was Sie vorhaben. Ein Foto hilft bei der ersten Einschätzung."
        vorauswahl={l.id}
      />

      <JsonLd daten={leistungLd(l)} />
    </Seite>
  );
}
