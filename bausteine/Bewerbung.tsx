import { Direktkontakt, Verbindung } from "./Abschnitte";
import { Anfrageformular } from "./Anfrageformular";
import { Offen } from "./Fliesstext";
import { offeneStellen } from "@/daten/stellen";
import type { StelleId } from "@/daten/adressen";

/**
 * Kurzes Bewerbungsformular (Informationsarchitektur.md, 7.6):
 * Name, Telefon oder E-Mail, Lebenslauf freiwillig. Auch ohne passende Stelle nutzbar.
 */
export function Bewerbung({
  titel,
  text,
  vorauswahl,
}: {
  titel: string;
  text?: string;
  vorauswahl?: StelleId;
}) {
  return (
    <section className="abschnitt anfrage anfrage--mit-leitung" id="bewerbung">
      <div className="endstueck" data-erscheint aria-hidden="true">
        <span className="endstueck__weg" />
        <span className="endstueck__bogen" />
      </div>
      <div className="rahmen anfrage__raster">
        <div>
          <header className="abschnitt__kopf" data-erscheint-kopf>
            <h2 data-zeilen>{titel}</h2>
            {text ? <p className="vorspann">{text}</p> : null}
          </header>
          <Anfrageformular
            art="bewerbung"
            auswahl={offeneStellen.map((s) => ({ id: s.id, name: s.titel }))}
            vorauswahl={vorauswahl}
          />
        </div>
        <aside className="anfrage__seite" aria-label="Direkter Kontakt">
          <Verbindung />
          <Direktkontakt />
          <p className="klein">
            <Offen>Ansprechperson für Bewerbungen</Offen>
          </p>
        </aside>
      </div>
    </section>
  );
}
