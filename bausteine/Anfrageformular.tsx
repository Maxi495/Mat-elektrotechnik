"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { sendeAnfrage, sendeBewerbung, type FormularStand } from "@/app/aktionen";
import { Zeichen, type ZeichenArt } from "./Zeichen";

/**
 * Anfrageformular (Informationsarchitektur.md, Abschnitt 10; Design.md, 9.12 und 8.8).
 * Überall dasselbe Formular, auf Leistungsseiten mit vorausgewählter Leistung.
 *
 * Ohne Skript schickt der Browser das Formular ab, die Server-Funktion prüft und leitet zur Danke-Seite.
 * Mit Skript prüfen wir schon vor dem Absenden, der Knopf wird zum Ladekreis,
 * dann fährt der Stecker in die Dose und die Danke-Seite folgt.
 */

/** zeichen: Schaltzeichen der Leistung, dasselbe wie in Menü, Sicherungsreihe, Karten und Haus. */
type Auswahl = { id: string; name: string; zeichen?: ZeichenArt };

const anfang: FormularStand = { status: "bereit" };

const istEmail = (wert: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
const istTelefon = (wert: string) => wert.replace(/[^\d]/g, "").length >= 6;

/** Große Handyfotos vor dem Hochladen verkleinern, damit die Anfrage sicher ankommt. */
async function verkleinere(datei: File): Promise<File> {
  if (!datei.type.startsWith("image/") || datei.size < 1.2 * 1024 * 1024) return datei;
  try {
    const bild = await createImageBitmap(datei);
    const faktor = Math.min(1, 2000 / Math.max(bild.width, bild.height));
    const flaeche = document.createElement("canvas");
    flaeche.width = Math.round(bild.width * faktor);
    flaeche.height = Math.round(bild.height * faktor);
    flaeche.getContext("2d")?.drawImage(bild, 0, 0, flaeche.width, flaeche.height);
    const blob = await new Promise<Blob | null>((fertig) => flaeche.toBlob(fertig, "image/jpeg", 0.82));
    if (!blob || blob.size >= datei.size) return datei;
    return new File([blob], datei.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return datei;
  }
}

function Feld({
  id,
  name,
  beschriftung,
  art = "text",
  mehrzeilig,
  pflicht,
  zusatz,
  markiert,
  vorgabe,
  fehler,
  gueltig,
  hinweis,
  autoComplete,
  inputMode,
  onEingabe,
}: {
  id: string;
  name: string;
  beschriftung: string;
  art?: "text" | "tel" | "email";
  mehrzeilig?: boolean;
  pflicht?: boolean;
  /** Zusatz hinter der Beschriftung. Standard bei freiwilligen Feldern: "(freiwillig)". */
  zusatz?: string;
  /** Rot umrandet, ohne eigene Meldung: Die Meldung steht dann unter der Feldgruppe. */
  markiert?: boolean;
  vorgabe?: string;
  fehler?: string;
  gueltig?: boolean;
  hinweis?: ReactNode;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email";
  onEingabe: (name: string, wert: string) => void;
}) {
  const gemeinsam = {
    id,
    name,
    className: "feld__eingabe",
    placeholder: " ",
    defaultValue: vorgabe,
    required: pflicht,
    "aria-invalid": fehler || markiert ? true : undefined,
    "aria-describedby": [fehler ? `${id}-fehler` : "", hinweis ? `${id}-hinweis` : ""]
      .filter(Boolean)
      .join(" ") || undefined,
    autoComplete,
  };
  return (
    <div
      className={`feld${mehrzeilig ? " feld--text" : ""}`}
      data-fehler={fehler ? "true" : undefined}
      data-markiert={markiert ? "true" : undefined}
      data-gueltig={gueltig && !fehler && !markiert ? "true" : undefined}
    >
      {mehrzeilig ? (
        <textarea {...gemeinsam} rows={5} onChange={(e) => onEingabe(name, e.target.value)} />
      ) : (
        <input
          {...gemeinsam}
          type={art}
          inputMode={inputMode}
          onChange={(e) => onEingabe(name, e.target.value)}
        />
      )}
      <label className="feld__beschriftung" htmlFor={id}>
        {beschriftung}
        {zusatz ?? (pflicht ? "" : " (freiwillig)")}
      </label>
      <span className="feld__linie" aria-hidden="true" />
      <svg className="feld__haken zeichen" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
      </svg>
      <p className="feld__fehler" id={`${id}-fehler`} role="alert">
        {fehler ? (
          <>
            <Zeichen name="warnung" />
            <span>{fehler}</span>
          </>
        ) : null}
      </p>
      {hinweis ? (
        <p className="feld__hinweis" id={`${id}-hinweis`}>
          {hinweis}
        </p>
      ) : null}
    </div>
  );
}

export function Anfrageformular({
  art = "anfrage",
  auswahl,
  vorauswahl,
  kurz,
}: {
  art?: "anfrage" | "bewerbung";
  /** Anfrage: die neun Leistungen. Bewerbung: die offenen Stellen. */
  auswahl: Auswahl[];
  vorauswahl?: string;
  /** Kurzes Formular ohne Ort und Datei, zum Beispiel am Ende der Startseite. */
  kurz?: boolean;
}) {
  const bewerbung = art === "bewerbung";
  const [stand, aktion, laeuft] = useActionState(bewerbung ? sendeBewerbung : sendeAnfrage, anfang);
  const [eigeneFehler, setEigeneFehler] = useState<Record<string, string>>({});
  const [gueltig, setGueltig] = useState<Record<string, boolean>>({});
  // Im Browser true, beim Vorab-Rendern false: So bleibt die Prüfung des Browsers ohne Skript erhalten.
  const mitSkript = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const fertig = stand.status === "gesendet";
  const formular = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pfad = usePathname();
  const id = useId();

  const fehler = { ...(stand.status === "fehler" ? stand.fehler : {}), ...eigeneFehler };
  const werte = stand.werte ?? {};

  // Erfolg: Stecker fährt in die Dose, die Dose leuchtet, dann folgt die Danke-Seite.
  useEffect(() => {
    if (stand.status !== "gesendet") return;
    const abschnitt = formular.current?.closest("section");
    const verbindung = abschnitt?.querySelector<HTMLElement>(".verbindung");
    verbindung?.setAttribute("data-verbunden", "true");
    verbindung?.querySelector<HTMLElement>(".verbindung__text")?.removeAttribute("hidden");
    if (bewerbung) return;
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const warten = window.setTimeout(() => router.push("/kontakt/danke"), ruhig || !verbindung ? 200 : 1300);
    return () => window.clearTimeout(warten);
  }, [stand.status, bewerbung, router]);

  // Nach einem Fehler vom Server zum ersten markierten Feld springen.
  useEffect(() => {
    if (stand.status !== "fehler" || !stand.fehler) return;
    formular.current?.querySelector<HTMLElement>("[data-fehler='true'] input, [aria-invalid='true']")?.focus();
  }, [stand]);

  function eingabe(name: string, wert: string) {
    const w = wert.trim();
    const ok =
      name === "email"
        ? istEmail(w)
        : name === "telefon"
          ? istTelefon(w)
          : name === "nachricht"
            ? w.length >= 10 || (bewerbung && w.length > 0)
            : w.length >= 2;
    setGueltig((g) => (g[name] === ok ? g : { ...g, [name]: ok }));
    if (eigeneFehler[name] || eigeneFehler.kontakt) {
      setEigeneFehler((f) => {
        const neu = { ...f };
        delete neu[name];
        if (name === "telefon" || name === "email") delete neu.kontakt;
        return neu;
      });
    }
  }

  function pruefe(e: FormEvent<HTMLFormElement>) {
    const daten = new FormData(e.currentTarget);
    const wert = (feld: string) => String(daten.get(feld) ?? "").trim();
    const neu: Record<string, string> = {};

    if (!bewerbung) {
      if (!wert("leistung")) neu.leistung = "Bitte wählen Sie aus, worum es geht.";
      if (wert("nachricht").length < 10) {
        neu.nachricht = "Bitte beschreiben Sie Ihr Anliegen in ein paar Worten.";
      }
    }
    if (wert("name").length < 2) neu.name = "Bitte nennen Sie uns Ihren Namen.";
    if (!wert("telefon") && !wert("email")) {
      neu.kontakt =
        "Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen.";
    } else {
      if (wert("telefon") && !istTelefon(wert("telefon"))) {
        neu.telefon = "Bitte prüfen Sie die Telefonnummer.";
      }
      if (wert("email") && !istEmail(wert("email"))) {
        neu.email = "Bitte prüfen Sie die E-Mail-Adresse, zum Beispiel name@beispiel.de.";
      }
    }
    if (daten.get("einwilligung") !== "ja") {
      neu.einwilligung = "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.";
    }

    setEigeneFehler(neu);
    if (Object.keys(neu).length > 0) {
      e.preventDefault();
      requestAnimationFrame(() =>
        formular.current
          ?.querySelector<HTMLElement>("[data-fehler='true'] input, [aria-invalid='true']")
          ?.focus(),
      );
    }
  }

  async function dateiGewaehlt(feld: HTMLInputElement) {
    const datei = feld.files?.[0];
    if (!datei) return;
    const klein = await verkleinere(datei);
    if (klein !== datei) {
      const ablage = new DataTransfer();
      ablage.items.add(klein);
      feld.files = ablage.files;
    }
    setEigeneFehler((f) => {
      const neu = { ...f };
      delete neu.foto;
      delete neu.lebenslauf;
      if (klein.size > 3.5 * 1024 * 1024) {
        neu[feld.name] = "Die Datei ist größer als 3,5 MB. Bitte wählen Sie eine kleinere Datei.";
      }
      return neu;
    });
  }

  const dateiFeld = bewerbung ? "lebenslauf" : "foto";
  const gewaehlt = werte[bewerbung ? "stelle" : "leistung"] ?? vorauswahl ?? "";

  return (
    <form
      className="formular"
      ref={formular}
      action={aktion}
      onSubmit={pruefe}
      noValidate={mitSkript}
      aria-label={bewerbung ? "Bewerbung" : "Anfrage"}
    >
      <input type="hidden" name="mit_skript" value={mitSkript ? "1" : "0"} />
      <input type="hidden" name="seite" value={pfad} />

      <fieldset
        className="formular__gruppe"
        data-fehler={fehler.leistung ? "true" : undefined}
        aria-describedby={fehler.leistung ? `${id}-leistung-fehler` : undefined}
      >
        <legend>{bewerbung ? "Für welche Stelle?" : "Worum geht es?"}</legend>
        <div className="marken-wahl">
          {(
            [
              ...auswahl,
              bewerbung
                ? { id: "initiativ", name: "Keine bestimmte" }
                : { id: "anderes", name: "Etwas anderes", zeichen: "plus" },
            ] as Auswahl[]
          ).map(
            (a) => (
              <label className="wahlmarke" key={a.id}>
                <input
                  type="radio"
                  name={bewerbung ? "stelle" : "leistung"}
                  value={a.id}
                  defaultChecked={gewaehlt ? gewaehlt === a.id : bewerbung && a.id === "initiativ"}
                  required={!bewerbung}
                  onChange={() =>
                    setEigeneFehler((f) => {
                      if (!f.leistung) return f;
                      const neu = { ...f };
                      delete neu.leistung;
                      return neu;
                    })
                  }
                />
                <span className="marke">
                  {a.zeichen ? (
                    // Beim Wählen tauscht der Haken das Schaltzeichen an derselben Stelle. Nichts verschiebt sich.
                    <span className="marke__bild" aria-hidden="true">
                      <Zeichen name={a.zeichen} />
                      <Zeichen name="haken" className="marke__haken" />
                    </span>
                  ) : (
                    <Zeichen name="haken" />
                  )}
                  {a.name}
                </span>
              </label>
            ),
          )}
        </div>
        <p className="feld__fehler" id={`${id}-leistung-fehler`} role="alert">
          {fehler.leistung ? (
            <>
              <Zeichen name="warnung" />
              <span>{fehler.leistung}</span>
            </>
          ) : null}
        </p>
      </fieldset>

      <Feld
        id={`${id}-nachricht`}
        name="nachricht"
        beschriftung="Ihre Nachricht"
        mehrzeilig
        pflicht={!bewerbung}
        vorgabe={werte.nachricht}
        fehler={fehler.nachricht}
        gueltig={gueltig.nachricht}
        onEingabe={eingabe}
      />

      <Feld
        id={`${id}-name`}
        name="name"
        beschriftung="Name"
        pflicht
        vorgabe={werte.name}
        fehler={fehler.name}
        gueltig={gueltig.name}
        autoComplete="name"
        onEingabe={eingabe}
      />

      <div className="formular__zeile">
        <Feld
          id={`${id}-telefon`}
          name="telefon"
          beschriftung="Telefon"
          art="tel"
          inputMode="tel"
          zusatz=""
          markiert={Boolean(fehler.kontakt)}
          vorgabe={werte.telefon}
          fehler={fehler.telefon}
          gueltig={gueltig.telefon}
          autoComplete="tel"
          onEingabe={eingabe}
        />
        <Feld
          id={`${id}-email`}
          name="email"
          beschriftung="E-Mail"
          art="email"
          inputMode="email"
          zusatz=""
          markiert={Boolean(fehler.kontakt)}
          vorgabe={werte.email}
          fehler={fehler.email}
          gueltig={gueltig.email}
          autoComplete="email"
          onEingabe={eingabe}
        />
      </div>
      {fehler.kontakt ? (
        <p className="feld__fehler feld__fehler--gruppe" role="alert">
          <Zeichen name="warnung" />
          <span>{fehler.kontakt}</span>
        </p>
      ) : (
        <p className="feld__hinweis feld__hinweis--gruppe">Eines von beiden genügt: Telefon oder E-Mail.</p>
      )}

      {!kurz && !bewerbung ? (
        <Feld
          id={`${id}-ort`}
          name="ort"
          beschriftung="PLZ oder Ort"
          vorgabe={werte.ort}
          gueltig={gueltig.ort}
          autoComplete="postal-code"
          hinweis="Hilft uns bei der Einsatzplanung."
          onEingabe={eingabe}
        />
      ) : null}

      {!kurz ? (
        <div className="feld-datei" data-fehler={fehler[dateiFeld] ? "true" : undefined}>
          <label className="formular__beschriftung" htmlFor={`${id}-datei`}>
            {bewerbung ? "Lebenslauf hochladen (freiwillig)" : "Foto hochladen (freiwillig)"}
          </label>
          <input
            id={`${id}-datei`}
            type="file"
            name={dateiFeld}
            accept={bewerbung ? ".pdf,.doc,.docx,.odt,image/*" : "image/*"}
            aria-describedby={`${id}-datei-hinweis`}
            onChange={(e) => dateiGewaehlt(e.currentTarget)}
          />
          <p className="feld__hinweis" id={`${id}-datei-hinweis`}>
            {bewerbung
              ? "PDF, Word oder Foto, höchstens 3,5 MB."
              : "Zum Beispiel vom Zählerschrank. Höchstens 3,5 MB."}
          </p>
          <p className="feld__fehler" role="alert">
            {fehler[dateiFeld] ? (
              <>
                <Zeichen name="warnung" />
                <span>{fehler[dateiFeld]}</span>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <div data-fehler={fehler.einwilligung ? "true" : undefined}>
        <label className="einwilligung" data-fehler={fehler.einwilligung ? "true" : undefined}>
          <input
            type="checkbox"
            name="einwilligung"
            value="ja"
            defaultChecked={werte.einwilligung === "ja"}
            required
            aria-describedby={fehler.einwilligung ? `${id}-einwilligung-fehler` : undefined}
            onChange={() =>
              setEigeneFehler((f) => {
                if (!f.einwilligung) return f;
                const neu = { ...f };
                delete neu.einwilligung;
                return neu;
              })
            }
          />
          <span className="fliesstext">
            Ich bin einverstanden, dass meine Angaben zur Bearbeitung {bewerbung ? "meiner Bewerbung" : "meiner Anfrage"}{" "}
            verarbeitet werden. Näheres steht in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
          </span>
        </label>
        <p className="feld__fehler" id={`${id}-einwilligung-fehler`} role="alert">
          {fehler.einwilligung ? (
            <>
              <Zeichen name="warnung" />
              <span>{fehler.einwilligung}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="formular__falle" aria-hidden="true">
        <label htmlFor={`${id}-falle`}>Dieses Feld bitte leer lassen</label>
        <input id={`${id}-falle`} type="text" name="firma_webseite" tabIndex={-1} autoComplete="off" />
      </div>

      <p
        className="formular__status"
        role="status"
        aria-live="polite"
        data-art={fertig ? "erfolg" : stand.status === "fehler" && stand.meldung ? "fehler" : undefined}
      >
        {fertig ? (
          <>
            <Zeichen name="haken" />
            <span>Verbunden. Wir melden uns.</span>
          </>
        ) : stand.status === "fehler" && stand.meldung ? (
          <>
            <Zeichen name="warnung" />
            <span>{stand.meldung}</span>
          </>
        ) : null}
      </p>

      <div className="formular__fuss">
        <button
          type="submit"
          className="knopf knopf--haupt"
          data-magnet=""
          data-laedt={laeuft ? "true" : undefined}
          aria-busy={laeuft || undefined}
          disabled={fertig}
        >
          <Zeichen name="stecker" className="knopf__stecker" />
          <span className="knopf__text">{bewerbung ? "Jetzt bewerben" : "Anfrage stellen"}</span>
        </button>
      </div>
    </form>
  );
}
