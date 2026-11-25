# Relaunch mat-elektrotechnik.de

Neue Webseite der Mat-Elektrotechnik GmbH, Germering. Next.js (App Router) mit TypeScript, alle Seiten werden beim Bau statisch erzeugt.

Dieser Ordner ist ein eigenständiges Projekt. Die Dateien im Stammordner des Repos (alte statische Seite) gehören nicht dazu.

## Befehle

Im Ordner `relaunch/` ausführen:

```bash
npm install
npm run dev      # Entwicklung, http://localhost:3000
npm run build    # Bau, bricht ab, sobald eine Seite nicht statisch wäre
npm run start    # fertigen Bau ausliefern
npm run lint     # ESLint
npm run typen    # TypeScript-Prüfung
```

## Vercel

- **Root Directory:** `relaunch`
- **Framework Preset:** Next.js
- Build- und Install-Befehl: Standard

## Umgebungsvariablen

Für den Versand von Anfrage und Bewerbung. Ohne sie zeigt das Formular eine Fehlermeldung mit Telefonnummer.

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `SMTP_HOST` | ja | Postausgangsserver, zum Beispiel `smtp.ionos.de` |
| `SMTP_PORT` | nein | Standard `587`. Bei `465` wird verschlüsselt verbunden |
| `SMTP_USER` | ja | Benutzername des Postfachs |
| `SMTP_PASS` | ja | Passwort des Postfachs |
| `ANFRAGE_EMPFAENGER` | nein | Empfänger der Anfragen. Standard `info@mat-elektrotechnik.de` |
| `BEWERBUNG_EMPFAENGER` | nein | Empfänger der Bewerbungen. Standard wie Anfragen |
| `ANFRAGE_ABSENDER` | nein | Absenderadresse. Standard `SMTP_USER` |
| `INDEXIERUNG` | nein | `an` gibt die Seite für Suchmaschinen frei, `aus` sperrt sie. Ohne Angabe: frei nur auf der echten Domain |
| `ANFRAGE_TESTMODUS` | nein | `1` verschickt nichts und schreibt die Nachricht ins Protokoll. Nur zum Testen |

Zugangsdaten stehen nie im Code.

## Wo was liegt

| Ordner | Inhalt |
|---|---|
| `daten/` | Alle Inhalte an je einer Stelle: Firma, Leistungen, Referenzen, Bewertungen, Stellen, Team, Orte, Weiterleitungen |
| `app/` | Die Seiten. Jede Seite gibt ihren Inhalt im Baustein `Seite` zurück |
| `bausteine/` | Bausteine nach `Design.md`, Abschnitt 9 |
| `stil/` | Gestaltung. `werte.css` enthält die zentralen Variablen aus `Design.md`, Abschnitt 12 |
| `lib/` | Bewegung, Bedienung, SEO, Umgebung |
| `bilder/` | Fotos von der bisherigen Webseite |
| `schriften/` | Bricolage Grotesque und Figtree als variable Dateien, mit Lizenz |

## Inhalte pflegen

- **Neue Leistung, neues Projekt, neue Stelle:** Eintrag in der passenden Datei unter `daten/`. Menü, Kacheln, Formular, Sitemap und Seiten übernehmen ihn.
- **Fehlende Inhalte:** stehen auf der Seite sichtbar als `[OFFEN: ...]`. Suche im Code nach `OFFEN` oder `offen(`.
- **Google-Bewertungen:** in `daten/bewertungen.ts` in die Liste `googleBewertungen` eintragen. Sie ist absichtlich leer.

## Schalter in `daten/firma.ts`

| Schalter | Wirkung |
|---|---|
| `erreichbarkeit.bestaetigt` | `true` zeigt die Uhrzeiten auf der Seite, in der Meta-Beschreibung der Kontaktseite und in den strukturierten Daten |
| `eCheckBerechtigt` | `true` benennt die Prüfleistung "E-Check & Anlagenprüfung". Nur setzen, wenn Mat Innungsbetrieb mit E-CHECK-Berechtigung ist |
| `video` | Pfad zum Firmenvideo. Solange `null`, steht auf "Über uns" ein Platzhalter |

## Vorschaubilder

Die Vorschaubilder für soziale Netzwerke entstehen beim Bau (`lib/vorschaubild.tsx`). Schriften und Logo dafür stehen als Daten in `lib/vorschau-daten.ts`. Ändert sich das Logo oder eine Schrift unter `schriften/vorschau/`, die Datei neu erzeugen: die drei Dateien als Base64 einlesen und die drei Konstanten ersetzen.

## 3D-Haus

`app/haus/page.tsx` hält den Platz frei. Das Element mit `data-haus-buehne` ist die Bühne für das spätere 3D-Haus. Bis dahin stehen dort ein gezeichnetes Standbild und darunter die normale Leistungsübersicht.
