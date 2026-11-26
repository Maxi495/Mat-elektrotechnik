# Relaunch mat-elektrotechnik.de

Neue Webseite der Mat-Elektrotechnik GmbH, Germering. Next.js (App Router) mit TypeScript, alle Seiten werden beim Bau statisch erzeugt.

Das Projekt liegt im Stammordner des Repos. Die frühere statische Seite wurde am 26.11.2026 entfernt; sie steht in der Git-Historie bis einschließlich Commit `9afc6ad`.

## Befehle

Im Stammordner ausführen:

```bash
npm install
npm run dev      # Entwicklung, http://localhost:3000
npm run build    # Bau, bricht ab, sobald eine Seite nicht statisch wäre
npm run start    # fertigen Bau ausliefern
npm run lint     # ESLint
npm run typen    # TypeScript-Prüfung
```

## Vercel

- Vercel baut aus dem Stammordner und veröffentlicht bei jedem Push auf `main`.
- `vercel.json` legt Next.js als Framework fest. In den Projekteinstellungen muss dafür nichts umgestellt werden.
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
| `lib/` | Bewegung, Bedienung, SEO, Umgebung, Karte |
| `werkzeuge/` | Skripte, die Daten für die Seite bauen (Karte) |
| `public/karte/` | Kartendaten, gebaut aus OpenStreetMap |
| `bilder/` | Fotos von der bisherigen Webseite. `bilder/bewertungen/`: Profilbilder zu den Google-Bewertungen |
| `schriften/` | Bricolage Grotesque und Figtree als variable Dateien, mit Lizenz |

## Inhalte pflegen

- **Neue Leistung, neues Projekt, neue Stelle:** Eintrag in der passenden Datei unter `daten/`. Menü, Kacheln, Formular, Sitemap und Seiten übernehmen ihn.
- **Fehlende Inhalte:** stehen auf der Seite sichtbar als `[OFFEN: ...]`. Suche im Code nach `OFFEN` oder `offen(`.
- **Google-Bewertungen:** stehen in `daten/bewertungen.ts` in der Liste `googleBewertungen`, im Wortlaut aus dem Google-Profil (Stand in `daten/firma.ts`, `google.stand`). Die Seite holt nichts von Google nach. Eine neue Bewertung kommt von Hand dazu: Name und Text unverändert übernehmen, Leistung zuordnen, das Profilbild als WebP mit 96 × 96 px nach `bilder/bewertungen/` legen. Ohne eigenes Bild `bild: null` und bei `farbe` den Farbton des Buchstaben-Bilds eintragen. Danach `google.anzahl`, `google.note` und `google.stand` anpassen.

## Karte des Einzugsgebiets

Die Karte auf Startseite, "Über uns" und Kontakt ist eine eigene Karte. Sie lädt nichts von fremden Servern: keine Kacheln, keine Schrift, kein Kartendienst. Eine eingegebene Adresse verlässt den Browser nicht, gerechnet wird auf dem Gerät.

| Teil | Wo |
|---|---|
| Kartendaten (Straßennetz, Gelände, Straßenverzeichnis) | `public/karte/`, gebaut aus OpenStreetMap |
| Lesen des Netzes und Berechnen der schnellsten Strecke | `lib/kartennetz.ts` |
| Adresssuche im Straßenverzeichnis | `lib/kartensuche.ts` |
| Kartenbild mit MapLibre GL (BSD-Lizenz): Stil, Beschriftung, Marker, Strecke | `lib/kartenbild.ts` |
| Bedienung: Suchfeld, Ortswahl, Ergebnis | `bausteine/Gebietskarte.tsx`, `stil/karte.css` |
| Standbild, bis die Karte geladen ist, und ohne Skript | `bilder/karte-einzugsgebiet.webp` |

- **Laden:** Karte und Daten (zusammen rund 600 KB) laden erst, wenn der Abschnitt in die Nähe des Bildschirms kommt.
- **Hilfsdateien:** `npm install` kopiert den Hintergrund-Rechner von MapLibre und die Kartenschrift nach `public/kartenhelfer/` (`werkzeuge/karte-einrichten.mjs`, Ordner steht in `.gitignore`).
- **Daten erneuern:** `npm run karte:holen strassen orte grenzen flaechen siedlung linien` holt die Rohdaten neu nach `_aufnahme/osm/`, `npm run karte:bauen` schreibt `public/karte/` und `daten/karte.ts`. Den Ausschnitt legt `AUSSCHNITT` in `werkzeuge/kartendaten-holen.mjs` fest.
- **Standbild erneuern:** nach Änderungen am Kartenstil die Karte in der Übersicht in doppelter Auflösung aufnehmen (ohne Knöpfe und Quellenangabe) und als WebP ablegen.
- **Fahrzeit:** Je Straßenstück zählt das erlaubte Tempo mal einem Anteil je Straßenart (Autobahn 0,9, Wohnstraße 0,6), dazu 6 Sekunden je Kreuzung mit einer gleich wichtigen oder wichtigeren Straße. Abgeglichen am 26.11.2026 für alle 14 Orte mit einem Routenplaner auf OSM-Daten: Die Entfernungen stimmen auf 1 bis 2 Prozent, die Zeiten liegen im Mittel 16 Prozent darüber. Das ist gewollt, weil der Routenplaner ohne Verkehr eher zu kurz rechnet. Die Seite nennt die Zeit als "etwa" und als reine Fahrzeit ohne Verkehr, nicht als Zusage.
- **Grenzen:** Das Verzeichnis kennt Straßen, keine Hausnummern. Ziel ist die Mitte der Straße im gewählten Ort. Adressen außerhalb des Ausschnitts findet die Suche nicht.
- **Quellenangabe:** "© OpenStreetMap" auf der Karte ist Pflicht (Lizenz ODbL) und bleibt stehen.
- **Abweichung von `Design.md`, 8.8:** Dort ist die Karte schematisch. Am 26.11.2026 wollte der Auftraggeber eine echte, bedienbare Karte mit Adresseingabe und Fahrzeit. Die Leitung läuft weiter von Germering zu den Orten, jetzt entlang der wirklichen Strecke.

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
