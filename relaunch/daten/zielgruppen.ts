import type { StaticImageData } from "next/image";
import type { LeistungId } from "./adressen";
import type { Gruppe } from "./leistungen";

import kueche from "@/bilder/kueche-led-beleuchtung.webp";
import netzwerk from "@/bilder/netzwerkschrank-switches.webp";
import flachdach from "@/bilder/blitzschutz-flachdach-fangstangen.webp";

/**
 * Für wen wir arbeiten (Informationsarchitektur.md, 7.1, Abschnitt 4):
 * drei gleich große Karten, jede mit drei typischen Aufgaben und Links zu den passenden Leistungen.
 */
export interface Zielgruppe {
  id: Gruppe;
  titel: string;
  satz: string;
  bild: StaticImageData;
  bildAlt: string;
  aufgaben: { text: string; leistung: LeistungId }[];
}

export const zielgruppen: Zielgruppe[] = [
  {
    id: "privat",
    titel: "Privatkunden",
    satz: "Für Haus und Wohnung, vom Neubau bis zur Sanierung.",
    bild: kueche,
    bildAlt: "Offene Küche in einem Wohnhaus mit Lichtlinie an der Decke und Einbauspots",
    aufgaben: [
      { text: "Wallbox in Garage oder Carport", leistung: "wallbox" },
      { text: "Zählerschrank erneuern", leistung: "verteilerbau" },
      { text: "Strom vom eigenen Dach", leistung: "photovoltaik" },
    ],
  },
  {
    id: "gewerbe",
    titel: "Gewerbe",
    satz: "Für Büro, Praxis, Werkstatt und Produktionshalle.",
    bild: netzwerk,
    bildAlt: "Netzwerkschrank mit Switches und gebündelten Patchkabeln in einem Betrieb",
    aufgaben: [
      { text: "Anlagen und Geräte prüfen lassen", leistung: "pruefung" },
      { text: "Netzwerk für Büro und Praxis", leistung: "netzwerktechnik" },
      { text: "Betriebsinstallation planen und bauen", leistung: "elektroinstallation" },
    ],
  },
  {
    id: "hausverwaltung",
    titel: "Hausverwaltungen",
    satz: "Für Wohnanlagen, Tiefgaragen und Gemeinschaftsanlagen.",
    bild: flachdach,
    bildAlt: "Flachdach eines Wohnhauses mit Lichtkuppeln und Fangstangen für den Blitzschutz",
    aufgaben: [
      { text: "Blitzschutz prüfen und warten", leistung: "blitzschutz" },
      { text: "Ladepunkte in der Tiefgarage", leistung: "wallbox" },
      { text: "Empfangsanlage für alle Wohnungen", leistung: "antennentechnik" },
    ],
  },
];
