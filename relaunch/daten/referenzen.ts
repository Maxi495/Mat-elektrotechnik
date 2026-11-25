import type { StaticImageData } from "next/image";
import type { LeistungId } from "./adressen";
import type { Gruppe } from "./leistungen";

import schlafzimmer from "@/bilder/schlafzimmer-led-beleuchtung.webp";
import treppe from "@/bilder/treppe-stufenbeleuchtung.webp";
import kueche from "@/bilder/kueche-led-beleuchtung.webp";
import wohnraum from "@/bilder/wohnraum-ringleuchten.webp";
import altbau from "@/bilder/altbau-indirekte-beleuchtung.webp";
import wandleuchten from "@/bilder/wandleuchten-lichtkegel.webp";
import steinwand from "@/bilder/steinwand-einbaustrahler.webp";
import terrasse from "@/bilder/terrasse-beleuchtung.webp";
import bodenstrahler from "@/bilder/aussenbeleuchtung-bodenstrahler.webp";
import arbeitsplatte from "@/bilder/kueche-arbeitsplatte-led.webp";
import flur from "@/bilder/flur-deckenspots.webp";
import badRing from "@/bilder/bad-ringleuchten.webp";
import badNische from "@/bilder/bad-nische-beleuchtet.webp";
import rohbau from "@/bilder/rohbau-leerrohre-decke.webp";
import tuerstation from "@/bilder/sprechanlage-tuerstation.webp";
import unterverteilung from "@/bilder/unterverteilung-wohnung.webp";
import verdrahtung from "@/bilder/unterverteilung-verdrahtung.webp";
import zaehlerschrank from "@/bilder/zaehlerschrank-digitalzaehler.webp";
import hauptverteilung from "@/bilder/hauptverteilung-schaltschrank.webp";
import sicherungsreihen from "@/bilder/verteiler-sicherungsreihen.webp";
import pvNeubau from "@/bilder/photovoltaik-neubau-geruest.webp";
import pvDach from "@/bilder/photovoltaik-module-dach.webp";
import wechselrichter from "@/bilder/photovoltaik-wechselrichter.webp";
import speicher from "@/bilder/photovoltaik-stromspeicher.webp";
import bedienfeld from "@/bilder/smart-home-bedienfeld.webp";
import switches from "@/bilder/netzwerkschrank-switches.webp";
import patchfeld from "@/bilder/netzwerkschrank-patchfeld.webp";
import multimedia from "@/bilder/multimediaverteiler-wohnhaus.webp";
import flachdach from "@/bilder/blitzschutz-flachdach-fangstangen.webp";
import fangstangen from "@/bilder/blitzschutz-fangstangen-winter.webp";
import geraetepruefung from "@/bilder/geraetepruefung-pruefplaketten.webp";

/**
 * Referenzprojekte. Einzige Stelle für Projektkarten auf Startseite, Referenzen und Leistungsseiten.
 *
 * Die Fotos stammen von der bisherigen Webseite. Titel und Satz beschreiben nur, was auf dem Foto zu sehen ist.
 * Ort und Jahr sind nicht bekannt und bleiben leer, bis Mat sie liefert (Informationsarchitektur.md, Annahme A2).
 * Die Kundengruppe ist nur dort gesetzt, wo das Motiv sie nahelegt. Bitte von Mat prüfen lassen.
 *
 * Eine eigene Seite /referenzen/[projekt] bekommt ein Projekt erst mit mindestens drei Fotos,
 * Beschreibung (Aufgabe, Lösung, Ergebnis) und möglichst einer Kundenstimme (Informationsarchitektur.md, 7.4).
 */
export interface Referenz {
  id: string;
  titel: string;
  /** null = noch nicht geliefert, erscheint als [OFFEN: Ort] */
  ort: string | null;
  jahr: number | null;
  /** Erste Leistung ist die Hauptleistung des Projekts. */
  leistungen: LeistungId[];
  gruppe: Gruppe | null;
  bild: StaticImageData;
  bildAlt: string;
  satz: string;
  /** Erscheint auf der Startseite. */
  start?: boolean;
  /** Für spätere Einzelseiten. */
  aufgabe?: string;
  loesung?: string;
  ergebnis?: string;
}

export const referenzen: Referenz[] = [
  {
    id: "schlafzimmer-indirektes-licht",
    titel: "Indirektes Licht im Schlafzimmer",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: schlafzimmer,
    bildAlt:
      "Elektroinstallation: LED-Bänder unter dem Bettpodest und hinter dem Wandpaneel eines Schlafzimmers",
    satz: "LED-Bänder unter Bett und Wandpaneel geben dem Raum warmes, blendfreies Licht.",
    start: true,
  },
  {
    id: "photovoltaik-neubau",
    titel: "Photovoltaik auf dem Neubau",
    ort: null,
    jahr: null,
    leistungen: ["photovoltaik"],
    gruppe: null,
    bild: pvNeubau,
    bildAlt:
      "Photovoltaik: eingerüsteter Neubau mit Solarmodulen auf dem Dach und Bauschild von Mat",
    satz: "Die Module liegen schon auf dem Dach, während am Haus noch gebaut wird.",
    start: true,
  },
  {
    id: "blitzschutz-flachdach",
    titel: "Blitzschutz auf dem Flachdach",
    ort: null,
    jahr: null,
    leistungen: ["blitzschutz"],
    gruppe: "hausverwaltung",
    bild: flachdach,
    bildAlt:
      "Blitzschutz: Fangstangen neben Lichtkuppeln auf dem verschneiten Flachdach eines Wohnhauses",
    satz: "Fangstangen schützen die Lichtkuppeln und Aufbauten auf dem Dach vor direkten Einschlägen.",
    start: true,
  },
  {
    id: "treppe-stufenlicht",
    titel: "Stufenlicht an der Holztreppe",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: treppe,
    bildAlt: "Elektroinstallation: Wandeinbauleuchten beleuchten die Stufen einer Holztreppe",
    satz: "Wandeinbauleuchten beleuchten jede Stufe und machen die Treppe auch nachts sicher.",
  },
  {
    id: "kueche-lichtkonzept",
    titel: "Licht für die offene Küche",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: kueche,
    bildAlt:
      "Elektroinstallation: offene Küche mit Lichtlinie an der Decke und Einbauspots",
    satz: "Eine Lichtlinie an der Decke und Einbauspots leuchten die offene Küche aus.",
  },
  {
    id: "wohnraum-ringleuchten",
    titel: "Ringleuchten und Lichtvoute im Wohnraum",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: wohnraum,
    bildAlt:
      "Elektroinstallation: Wohnraum mit Ringleuchten und indirekter Beleuchtung in der Deckenvoute",
    satz: "Ringleuchten und eine umlaufende Voute geben dem Raum Licht auf zwei Ebenen.",
  },
  {
    id: "wandleuchten-lichtkegel",
    titel: "Wandleuchten mit Lichtkegel",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: wandleuchten,
    bildAlt:
      "Elektroinstallation: zwei Wandleuchten werfen Lichtkegel nach oben und unten auf eine graue Wand",
    satz: "Zwei Wandleuchten zeichnen Lichtkegel auf die Wand, darüber liegt indirektes Licht.",
  },
  {
    id: "altbau-indirekte-beleuchtung",
    titel: "Indirekte Beleuchtung im Altbau",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: null,
    bild: altbau,
    bildAlt:
      "Elektroinstallation: Raum mit Rundbogenfenstern, Parkett und warmer indirekter Deckenbeleuchtung",
    satz: "Eine umlaufende Lichtvoute hebt die Decke hervor, ohne dass eine Leuchte zu sehen ist.",
  },
  {
    id: "steinwand-einbaustrahler",
    titel: "Einbaustrahler an der Natursteinwand",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: steinwand,
    bildAlt:
      "Elektroinstallation: Strahler oben und unten beleuchten eine Wand aus Naturstein",
    satz: "Strahler von oben und unten bringen die Struktur des Steins zur Geltung.",
  },
  {
    id: "kueche-arbeitsplatte",
    titel: "Arbeitslicht über dem Kochfeld",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: arbeitsplatte,
    bildAlt:
      "Elektroinstallation: LED-Band unter den Hängeschränken beleuchtet Arbeitsplatte und Kochfeld",
    satz: "Ein LED-Band unter den Hängeschränken leuchtet die Arbeitsplatte gleichmäßig aus.",
  },
  {
    id: "flur-deckenspots",
    titel: "Deckenspots im Flur",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: flur,
    bildAlt: "Elektroinstallation: Flur mit einer Reihe von Einbauspots in der Decke",
    satz: "Eine Reihe Einbauspots führt durch den Flur bis zur Glastür.",
  },
  {
    id: "bad-ringleuchten",
    titel: "Ringleuchten im Bad",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: badRing,
    bildAlt:
      "Elektroinstallation: Bad mit zwei Ringleuchten an der Decke und beleuchtetem Spiegel",
    satz: "Zwei Ringleuchten an der Decke und Licht am Spiegel leuchten das Bad aus.",
  },
  {
    id: "bad-nische",
    titel: "Beleuchtete Nische im Bad",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: badNische,
    bildAlt: "Elektroinstallation: beleuchtete Wandnische in einem gefliesten Bad",
    satz: "Ein Lichtband in der Wandnische setzt einen ruhigen Akzent.",
  },
  {
    id: "terrasse-beleuchtung",
    titel: "Licht auf der Dachterrasse",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: terrasse,
    bildAlt:
      "Elektroinstallation: Leuchten auf den Pfosten der Brüstung einer Dachterrasse",
    satz: "Leuchten auf den Pfosten der Brüstung geben der Terrasse abends Licht.",
  },
  {
    id: "aussenbeleuchtung-bodenstrahler",
    titel: "Bodenstrahler an der Fassade",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: "privat",
    bild: bodenstrahler,
    bildAlt:
      "Elektroinstallation: zwei Bodeneinbaustrahler im Kiesstreifen strahlen eine Hauswand an",
    satz: "Zwei Bodenstrahler im Kiesstreifen heben die Hauswand hervor.",
  },
  {
    id: "rohbau-leerrohre",
    titel: "Rohinstallation im Neubau",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation"],
    gruppe: null,
    bild: rohbau,
    bildAlt:
      "Elektroinstallation im Rohbau: Monteur verlegt Leerrohre auf der Bewehrung einer Decke",
    satz: "Die Leerrohre liegen auf der Bewehrung, bevor die Decke betoniert wird.",
  },
  {
    id: "sprechanlage-tuerstation",
    titel: "Türstation im Natursteinpfeiler",
    ort: null,
    jahr: null,
    leistungen: ["elektroinstallation", "smart-home"],
    gruppe: "privat",
    bild: tuerstation,
    bildAlt:
      "Sprechanlage: Video-Türstation aus Edelstahl, eingelassen in einen Pfeiler aus Naturstein",
    satz: "Die Video-Türstation sitzt bündig im Pfeiler am Eingang.",
  },
  {
    id: "smart-home-bedienfeld",
    titel: "Bedienfeld und Raumcontroller",
    ort: null,
    jahr: null,
    leistungen: ["smart-home"],
    gruppe: "privat",
    bild: bedienfeld,
    bildAlt:
      "Smart Home: Bedienfeld mit Kamerabild der Türstation, darunter ein Raumcontroller",
    satz: "Das Bedienfeld zeigt, wer an der Tür steht. Der Raumcontroller darunter schaltet den Raum.",
  },
  {
    id: "unterverteilung-wohnung",
    titel: "Unterverteilung in der Wohnung",
    ort: null,
    jahr: null,
    leistungen: ["verteilerbau", "elektroinstallation"],
    gruppe: "privat",
    bild: unterverteilung,
    bildAlt:
      "Verteilerbau: geöffnete Unterverteilung im Flur einer Wohnung mit beschriftetem Stromkreisverzeichnis",
    satz: "Jeder Stromkreis ist beschriftet, das Verzeichnis hängt in der Tür.",
  },
  {
    id: "unterverteilung-verdrahtung",
    titel: "Verteiler während der Verdrahtung",
    ort: null,
    jahr: null,
    leistungen: ["verteilerbau", "elektroinstallation"],
    gruppe: null,
    bild: verdrahtung,
    bildAlt:
      "Verteilerbau: Unterverteilung mit Sicherungsautomaten und sortierten Leitungen während der Verdrahtung",
    satz: "Die Leitungen sind sortiert eingeführt, die Automaten werden reihenweise angeschlossen.",
  },
  {
    id: "zaehlerschrank-digitalzaehler",
    titel: "Zählerschrank mit digitalem Zähler",
    ort: null,
    jahr: null,
    leistungen: ["verteilerbau"],
    gruppe: null,
    bild: zaehlerschrank,
    bildAlt:
      "Zählerschrank: digitaler Zähler, Sicherungsautomaten und ein Feld für Netzwerktechnik",
    satz: "Zähler, Sicherungen und Netzwerktechnik sitzen getrennt in einem Schrank.",
  },
  {
    id: "hauptverteilung-schaltschrank",
    titel: "Hauptverteilung im Technikraum",
    ort: null,
    jahr: null,
    leistungen: ["verteilerbau"],
    gruppe: "gewerbe",
    bild: hauptverteilung,
    bildAlt:
      "Verteilerbau: geöffneter Schaltschrank mit Sicherungslasttrennern in einem Technikraum",
    satz: "Der Schaltschrank nimmt die Einspeisung des Gebäudes auf und verteilt sie weiter.",
  },
  {
    id: "verteiler-sicherungsreihen",
    titel: "Großer Verteiler mit vielen Stromkreisen",
    ort: null,
    jahr: null,
    leistungen: ["verteilerbau"],
    gruppe: null,
    bild: sicherungsreihen,
    bildAlt:
      "Verteilerbau: großer Verteiler mit dicht bestückten Reihen aus Sicherungsautomaten",
    satz: "Reihe für Reihe sitzen Sicherungsautomaten, Schutzschalter und Klemmen an ihrem Platz.",
  },
  {
    id: "photovoltaik-module-dach",
    titel: "Solarmodule auf dem Ziegeldach",
    ort: null,
    jahr: null,
    leistungen: ["photovoltaik"],
    gruppe: null,
    bild: pvDach,
    bildAlt: "Photovoltaik: schwarze Solarmodule auf einem dunklen Ziegeldach",
    satz: "Schwarze Module fügen sich in die dunkle Dachfläche ein.",
  },
  {
    id: "photovoltaik-wechselrichter",
    titel: "Wechselrichter im Keller",
    ort: null,
    jahr: null,
    leistungen: ["photovoltaik"],
    gruppe: null,
    bild: wechselrichter,
    bildAlt:
      "Photovoltaik: Wechselrichter mit Anschlusskasten an einer Kellerwand",
    satz: "Der Wechselrichter wandelt den Strom vom Dach für das Hausnetz um.",
  },
  {
    id: "photovoltaik-stromspeicher",
    titel: "Stromspeicher im Technikraum",
    ort: null,
    jahr: null,
    leistungen: ["photovoltaik"],
    gruppe: null,
    bild: speicher,
    bildAlt: "Photovoltaik: Stromspeicher als schmaler Standschrank in einem Technikraum",
    satz: "Der Speicher hält den Solarstrom für Abend und Nacht bereit.",
  },
  {
    id: "netzwerkschrank-switches",
    titel: "Netzwerkschrank mit Switches",
    ort: null,
    jahr: null,
    leistungen: ["netzwerktechnik"],
    gruppe: "gewerbe",
    bild: switches,
    bildAlt:
      "Netzwerkverkabelung: Netzwerkschrank mit Switches und gebündelten Patchkabeln",
    satz: "Alle Strecken des Gebäudes laufen im Netzwerkschrank zusammen.",
  },
  {
    id: "netzwerkschrank-patchfeld",
    titel: "Patchfelder im Netzwerkschrank",
    ort: null,
    jahr: null,
    leistungen: ["netzwerktechnik"],
    gruppe: "gewerbe",
    bild: patchfeld,
    bildAlt:
      "Netzwerkverkabelung: beschriftete Patchfelder und gebündelte orangefarbene Datenleitungen",
    satz: "Jede Dose hat ihren beschrifteten Platz auf dem Patchfeld.",
  },
  {
    id: "multimediaverteiler-wohnhaus",
    titel: "Multimediaverteiler im Wohnhaus",
    ort: null,
    jahr: null,
    leistungen: ["netzwerktechnik"],
    gruppe: "privat",
    bild: multimedia,
    bildAlt:
      "Netzwerkverkabelung: Multimediaverteiler in der Wand mit Router, Verteiler und Datenleitungen",
    satz: "Router, Verteiler und Datenleitungen finden im Wandverteiler Platz.",
  },
  {
    id: "blitzschutz-fangstangen",
    titel: "Fangstangen an den Lichtkuppeln",
    ort: null,
    jahr: null,
    leistungen: ["blitzschutz"],
    gruppe: "hausverwaltung",
    bild: fangstangen,
    bildAlt:
      "Blitzschutz: Fangstangen auf einem verschneiten Flachdach, im Hintergrund ein Monteur",
    satz: "Jede Lichtkuppel liegt im Schutzbereich einer Fangstange.",
  },
  {
    id: "geraetepruefung-pruefplaketten",
    titel: "Geräteprüfung mit Prüfplakette",
    ort: null,
    jahr: null,
    leistungen: ["pruefung"],
    gruppe: "gewerbe",
    bild: geraetepruefung,
    bildAlt:
      "Geräteprüfung nach DGUV Vorschrift 3: Prüfgerät und gelbe Prüfplaketten auf einem Tisch",
    satz: "Jedes geprüfte Gerät bekommt eine Plakette mit dem nächsten Prüftermin.",
  },
];

/** Projekte einer Leistung. Hauptleistung zuerst, dann Projekte, in denen die Leistung mit vorkommt. */
export function referenzenFuer(leistung: LeistungId, anzahl = 3): Referenz[] {
  const haupt = referenzen.filter((r) => r.leistungen[0] === leistung);
  const neben = referenzen.filter(
    (r) => r.leistungen[0] !== leistung && r.leistungen.includes(leistung),
  );
  return [...haupt, ...neben].slice(0, anzahl);
}

export const startReferenzen = referenzen.filter((r) => r.start);
