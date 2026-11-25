"use server";

import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { firma } from "@/daten/firma";
import { leistungen } from "@/daten/leistungen";
import { stellen } from "@/daten/stellen";

/**
 * Versand von Anfrage und Bewerbung (Informationsarchitektur.md, Abschnitt 10).
 *
 * Zugangsdaten kommen ausschließlich aus Umgebungsvariablen:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS   Postausgang, über den die Nachricht verschickt wird
 *   ANFRAGE_EMPFAENGER                           Empfänger der Anfragen (Standard: info@mat-elektrotechnik.de)
 *   BEWERBUNG_EMPFAENGER                         Empfänger der Bewerbungen (Standard: wie Anfragen)
 *   ANFRAGE_ABSENDER                             Absenderadresse (Standard: SMTP_USER)
 *   ANFRAGE_TESTMODUS=1                          verschickt nichts und schreibt die Nachricht ins Protokoll
 */

export type FormularStand = {
  status: "bereit" | "fehler" | "gesendet";
  /** Meldung über dem Knopf, wenn der Versand scheitert. */
  meldung?: string;
  /** Fehlermeldung je Feld. */
  fehler?: Record<string, string>;
  /** Eingaben, damit nach einem Fehler nichts verloren geht. */
  werte?: Record<string, string>;
};

const MAX_DATEI = 3.5 * 1024 * 1024;

const leistungsNamen: Record<string, string> = {
  ...Object.fromEntries(leistungen.map((l) => [l.id, l.name])),
  anderes: "Etwas anderes",
};

const stellenNamen: Record<string, string> = Object.fromEntries(stellen.map((s) => [s.id, s.titel]));

const text = (daten: FormData, feld: string, laenge = 4000): string => {
  const wert = daten.get(feld);
  return typeof wert === "string" ? wert.trim().slice(0, laenge) : "";
};

const einzeilig = (wert: string): string => wert.replace(/[\r\n]+/g, " ").trim();

const istEmail = (wert: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
const istTelefon = (wert: string): boolean => wert.replace(/[^\d]/g, "").length >= 6;

type Anhang = { filename: string; content: Buffer; contentType: string };

async function anhang(
  daten: FormData,
  feld: string,
  erlaubt: (typ: string, name: string) => boolean,
): Promise<{ anhang?: Anhang; fehler?: string }> {
  const datei = daten.get(feld);
  if (!(datei instanceof File) || datei.size === 0) return {};
  if (datei.size > MAX_DATEI) {
    return { fehler: "Die Datei ist größer als 3,5 MB. Bitte wählen Sie eine kleinere Datei." };
  }
  if (!erlaubt(datei.type, datei.name.toLowerCase())) {
    return { fehler: "Dieses Dateiformat können wir nicht annehmen." };
  }
  return {
    anhang: {
      filename: einzeilig(datei.name).slice(0, 120) || "anhang",
      content: Buffer.from(await datei.arrayBuffer()),
      contentType: datei.type || "application/octet-stream",
    },
  };
}

async function verschicke({
  betreff,
  inhalt,
  antwortAn,
  empfaenger,
  anhaenge,
}: {
  betreff: string;
  inhalt: string;
  antwortAn?: string;
  empfaenger: string;
  anhaenge: Anhang[];
}): Promise<boolean> {
  if (process.env.ANFRAGE_TESTMODUS === "1") {
    console.info(`[Testmodus] ${betreff}\n${inhalt}\nAnhänge: ${anhaenge.length}`);
    return true;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Formular-Versand ist nicht eingerichtet: SMTP_HOST, SMTP_USER oder SMTP_PASS fehlt.");
    return false;
  }

  const port = Number(SMTP_PORT ?? 587);
  try {
    const postausgang = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await postausgang.sendMail({
      from: `"${firma.kurzname} Webseite" <${process.env.ANFRAGE_ABSENDER ?? SMTP_USER}>`,
      to: empfaenger,
      replyTo: antwortAn || undefined,
      subject: einzeilig(betreff).slice(0, 180),
      text: inhalt,
      attachments: anhaenge,
    });
    return true;
  } catch (grund) {
    console.error("Formular-Versand gescheitert:", grund);
    return false;
  }
}

const versandFehler = `Ihre Nachricht konnte gerade nicht gesendet werden. Bitte rufen Sie uns an: ${firma.telefon.anzeige}, oder schreiben Sie an ${firma.email}.`;

/** Anfrageformular: überall dasselbe, fünf Pflichtangaben. */
export async function sendeAnfrage(_vorher: FormularStand, daten: FormData): Promise<FormularStand> {
  const werte = {
    leistung: text(daten, "leistung", 40),
    nachricht: text(daten, "nachricht"),
    name: einzeilig(text(daten, "name", 120)),
    telefon: einzeilig(text(daten, "telefon", 40)),
    email: einzeilig(text(daten, "email", 160)),
    ort: einzeilig(text(daten, "ort", 80)),
  };

  // Falle für automatische Einsendungen: Das Feld sieht kein Mensch. Ist es gefüllt, tun wir so, als sei alles gut.
  if (text(daten, "firma_webseite") !== "") {
    return daten.get("mit_skript") === "1" ? { status: "gesendet" } : redirect("/kontakt/danke");
  }

  const fehler: Record<string, string> = {};
  if (!(werte.leistung in leistungsNamen)) fehler.leistung = "Bitte wählen Sie aus, worum es geht.";
  if (werte.nachricht.length < 10) {
    fehler.nachricht = "Bitte beschreiben Sie Ihr Anliegen in ein paar Worten.";
  }
  if (werte.name.length < 2) fehler.name = "Bitte nennen Sie uns Ihren Namen.";
  if (!werte.telefon && !werte.email) {
    fehler.kontakt =
      "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen.";
  } else {
    if (werte.telefon && !istTelefon(werte.telefon)) {
      fehler.telefon = "Bitte prüfen Sie die Telefonnummer.";
    }
    if (werte.email && !istEmail(werte.email)) {
      fehler.email = "Bitte prüfen Sie die E-Mail-Adresse, zum Beispiel name@beispiel.de.";
    }
  }
  if (daten.get("einwilligung") !== "ja") {
    fehler.einwilligung = "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.";
  }

  const foto = await anhang(daten, "foto", (typ) => typ.startsWith("image/"));
  if (foto.fehler) fehler.foto = foto.fehler;

  if (Object.keys(fehler).length > 0) {
    return { status: "fehler", fehler, werte, meldung: "Bitte prüfen Sie die markierten Angaben." };
  }

  const leistung = leistungsNamen[werte.leistung];
  const inhalt = [
    `Neue Anfrage über die Webseite`,
    ``,
    `Worum geht es: ${einzeilig(leistung)}`,
    `Name: ${werte.name}`,
    `Telefon: ${werte.telefon || "nicht angegeben"}`,
    `E-Mail: ${werte.email || "nicht angegeben"}`,
    `PLZ oder Ort: ${werte.ort || "nicht angegeben"}`,
    `Seite: ${einzeilig(text(daten, "seite", 200)) || "unbekannt"}`,
    ``,
    `Nachricht:`,
    werte.nachricht,
    ``,
    `Die Einwilligung zur Verarbeitung wurde im Formular erteilt.`,
  ].join("\n");

  const ok = await verschicke({
    betreff: `Anfrage über die Webseite: ${leistung}`,
    inhalt,
    antwortAn: werte.email,
    empfaenger: process.env.ANFRAGE_EMPFAENGER ?? firma.email,
    anhaenge: foto.anhang ? [foto.anhang] : [],
  });

  if (!ok) return { status: "fehler", werte, meldung: versandFehler };
  if (daten.get("mit_skript") === "1") return { status: "gesendet" };
  redirect("/kontakt/danke");
}

/** Kurzes Bewerbungsformular: Name, Telefon oder E-Mail, Lebenslauf freiwillig. */
export async function sendeBewerbung(_vorher: FormularStand, daten: FormData): Promise<FormularStand> {
  const werte = {
    stelle: text(daten, "stelle", 60),
    name: einzeilig(text(daten, "name", 120)),
    telefon: einzeilig(text(daten, "telefon", 40)),
    email: einzeilig(text(daten, "email", 160)),
    nachricht: text(daten, "nachricht"),
  };

  if (text(daten, "firma_webseite") !== "") {
    return daten.get("mit_skript") === "1" ? { status: "gesendet" } : redirect("/kontakt/danke");
  }

  const fehler: Record<string, string> = {};
  if (werte.name.length < 2) fehler.name = "Bitte nennen Sie uns Ihren Namen.";
  if (!werte.telefon && !werte.email) {
    fehler.kontakt =
      "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen.";
  } else {
    if (werte.telefon && !istTelefon(werte.telefon)) {
      fehler.telefon = "Bitte prüfen Sie die Telefonnummer.";
    }
    if (werte.email && !istEmail(werte.email)) {
      fehler.email = "Bitte prüfen Sie die E-Mail-Adresse, zum Beispiel name@beispiel.de.";
    }
  }
  if (daten.get("einwilligung") !== "ja") {
    fehler.einwilligung = "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.";
  }

  const lebenslauf = await anhang(
    daten,
    "lebenslauf",
    (typ, name) =>
      typ === "application/pdf" ||
      typ.startsWith("image/") ||
      /\.(pdf|docx?|odt|jpe?g|png)$/.test(name),
  );
  if (lebenslauf.fehler) fehler.lebenslauf = lebenslauf.fehler;

  if (Object.keys(fehler).length > 0) {
    return { status: "fehler", fehler, werte, meldung: "Bitte prüfen Sie die markierten Angaben." };
  }

  const stelle = stellenNamen[werte.stelle] ?? "Initiativbewerbung";

  const inhalt = [
    `Neue Bewerbung über die Webseite`,
    ``,
    `Stelle: ${einzeilig(stelle)}`,
    `Name: ${werte.name}`,
    `Telefon: ${werte.telefon || "nicht angegeben"}`,
    `E-Mail: ${werte.email || "nicht angegeben"}`,
    ``,
    `Nachricht:`,
    werte.nachricht || "keine",
    ``,
    `Die Einwilligung zur Verarbeitung wurde im Formular erteilt.`,
  ].join("\n");

  const ok = await verschicke({
    betreff: `Bewerbung über die Webseite: ${stelle}`,
    inhalt,
    antwortAn: werte.email,
    empfaenger:
      process.env.BEWERBUNG_EMPFAENGER ?? process.env.ANFRAGE_EMPFAENGER ?? firma.email,
    anhaenge: lebenslauf.anhang ? [lebenslauf.anhang] : [],
  });

  if (!ok) return { status: "fehler", werte, meldung: versandFehler };
  if (daten.get("mit_skript") === "1") return { status: "gesendet" };
  redirect("/kontakt/danke");
}
