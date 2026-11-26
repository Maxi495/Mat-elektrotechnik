/**
 * Ziel des Knopfs "Anfrage stellen" (Informationsarchitektur.md, 5.1):
 * Auf Seiten mit eigenem Formular springt er zum Formular auf derselben Seite, sonst führt er zu /kontakt.
 */
const seitenMitFormular = ["/", "/leistungen", "/referenzen", "/kontakt"];

export function anfrageZiel(pfad: string): string {
  if (seitenMitFormular.includes(pfad) || pfad.startsWith("/leistungen/")) return "#anfrage";
  return "/kontakt";
}

/** Menüpunkt gilt als aktiv, wenn die Seite darunter liegt. */
export function istAktiv(pfad: string, ziel: string): boolean {
  if (ziel === "/") return pfad === "/";
  return pfad === ziel || pfad.startsWith(`${ziel}/`);
}
