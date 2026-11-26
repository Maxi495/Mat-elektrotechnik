/**
 * Adresssuche für die Karte des Einzugsgebiets: sucht Straßen und Orte im Verzeichnis aus
 * werkzeuge/kartendaten-bauen.mjs. Läuft ganz im Browser, die Eingabe verlässt das Gerät nicht.
 *
 * Das Verzeichnis kennt Straßen, keine Hausnummern. Eine Hausnummer in der Eingabe wird überlesen,
 * das Ziel ist die Mitte der Straße im gewählten Ort.
 */

export interface Verzeichnis {
  /** Alle Straßennamen */
  namen: string[];
  /** Orte und Ortsteile, in denen Straßen liegen */
  orte: string[];
  /** [Nummer des Namens, Nummer des Orts, Kreuzung als Ziel] */
  strassen: [number, number, number][];
  /** Ortsnamen für die Karte: [Name, Rang (0 Stadt, 1 Dorf, 2 Stadtteil), x, y in Metern] */
  beschriftung: [string, number, number, number][];
  /** Autobahnen und Bundesstraßen: [Kennung, x, y in Metern] */
  schilder: [string, number, number][];
}

export interface Treffer {
  /** Straße oder Ort */
  name: string;
  /** Ort der Straße. Leer, wenn der Treffer selbst ein Ort ist. */
  ort: string;
  /** Kreuzung im Straßennetz, zu der die Strecke führt */
  kreuzung: number;
}

/** Vereinheitlicht Schreibweisen: klein, ohne Umlaute, "Straße", "Strasse" und "Str." werden zu "str". */
export function einfach(text: string): string {
  return text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/str(asse|\.)?(?![a-z])/g, "str")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface Eintrag extends Treffer {
  /** Name und Ort in einfacher Schreibweise, je Wort */
  nameWorte: string[];
  ortWorte: string[];
  nameEinfach: string;
  /** Straßen im Kernort und in den genannten Orten stehen bei gleicher Güte vorn */
  vorrang: number;
}

export interface Suche {
  (eingabe: string, hoechstens?: number): Treffer[];
}

/**
 * Bereitet die Suche vor.
 * @param ortsziele Orte, die selbst als Ziel wählbar sind (Name und Kreuzung), zum Beispiel die Orte des Einzugsgebiets
 * @param kernort Ort, dessen Straßen bei gleicher Güte zuerst stehen
 */
export function bereiteSucheVor(verzeichnis: Verzeichnis, ortsziele: { name: string; kreuzung: number }[], kernort: string): Suche {
  const eintraege: Eintrag[] = [];
  for (const o of ortsziele) {
    const nameEinfach = einfach(o.name);
    eintraege.push({ name: o.name, ort: "", kreuzung: o.kreuzung, nameEinfach, nameWorte: nameEinfach.split(" "), ortWorte: [], vorrang: 3 });
  }
  const genannt = new Set(ortsziele.map((o) => o.name));
  for (const [nameNr, ortNr, kreuzung] of verzeichnis.strassen) {
    const name = verzeichnis.namen[nameNr];
    const ort = verzeichnis.orte[ortNr];
    const nameEinfach = einfach(name);
    const hauptort = ort.replace(/^München-/, "").replace(/ \(.*$/, "");
    eintraege.push({
      name,
      ort,
      kreuzung,
      nameEinfach,
      nameWorte: nameEinfach.split(" "),
      ortWorte: einfach(ort).split(" "),
      vorrang: ort === kernort ? 2 : genannt.has(hauptort) ? 1 : 0,
    });
  }

  return (eingabe, hoechstens = 6) => {
    // Hausnummern ("12", "12a") und Postleitzahlen sagen dem Verzeichnis nichts
    const worte = einfach(eingabe)
      .split(" ")
      .filter((w) => w && !/^\d+[a-z]?$/.test(w));
    if (worte.length === 0 || worte.join("").length < 2) return [];
    const ganz = worte.join(" ");

    const gefunden: { e: Eintrag; guete: number }[] = [];
    for (const e of eintraege) {
      let imNamen = 0;
      let passt = true;
      for (const w of worte) {
        if (e.nameWorte.some((n) => n.startsWith(w))) imNamen++;
        else if (!e.ortWorte.some((o) => o.startsWith(w))) {
          // "hauptstr" soll auch "hauptstrasse" in einem Wort finden, "berg" nicht mitten in "landsberger"
          passt = false;
          break;
        }
      }
      if (!passt || imNamen === 0) continue;
      let guete = e.vorrang;
      if (e.nameEinfach === ganz) guete += 40;
      else if (e.nameEinfach.startsWith(ganz)) guete += 30;
      else if (e.nameEinfach.startsWith(worte[0])) guete += 20;
      else guete += 10;
      if (imNamen < worte.length) guete += 4; // der Ort wurde mitgenannt und passt
      guete -= e.nameEinfach.length / 100;
      gefunden.push({ e, guete });
    }
    gefunden.sort((a, b) => b.guete - a.guete || a.e.name.localeCompare(b.e.name, "de") || a.e.ort.localeCompare(b.e.ort, "de"));
    return gefunden.slice(0, hoechstens).map(({ e }) => ({ name: e.name, ort: e.ort, kreuzung: e.kreuzung }));
  };
}
