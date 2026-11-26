"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { anfrageZiel, istAktiv } from "@/lib/anfrageziel";
import { Kippschalter, Zeichen } from "./Zeichen";

export type MenueLeistung = {
  id: string;
  name: string;
  pfad: string;
  zeile: string;
  zeichen: ReactNode;
  bild: StaticImageData;
};

type Hauptpunkt = { name: string; pfad: string };

export function KopfInnen({
  leistungen,
  hauptpunkte,
  telefon,
  firmenname,
}: {
  leistungen: MenueLeistung[];
  hauptpunkte: Hauptpunkt[];
  telefon: { anzeige: string; href: string };
  firmenname: string;
}) {
  const pfad = usePathname();
  const [aufklappOffen, setAufklappOffen] = useState(false);
  const [gesperrt, setGesperrt] = useState(false);
  const [vorschau, setVorschau] = useState<number | null>(null);
  const [handyOffen, setHandyOffen] = useState(false);
  const menuePunkt = useRef<HTMLLIElement>(null);
  const handyMenue = useRef<HTMLDivElement>(null);
  const handyKnopf = useRef<HTMLAnchorElement>(null);

  const anfrage = anfrageZiel(pfad);
  const leistungenAktiv = istAktiv(pfad, "/leistungen");

  const schliesseAufklapp = useCallback((sperren: boolean) => {
    setAufklappOffen(false);
    if (sperren) setGesperrt(true);
  }, []);

  // Nach einem Seitenwechsel sind beide Menüs zu.
  const [letzterPfad, setLetzterPfad] = useState(pfad);
  if (pfad !== letzterPfad) {
    setLetzterPfad(pfad);
    setHandyOffen(false);
    setAufklappOffen(false);
  }

  // Klick auf einen Eintrag: Das Menü schließt und bleibt zu, bis die Maus es verlassen hat.
  const eintragGewaehlt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as Element).closest("a")) return;
    setAufklappOffen(false);
    setGesperrt(true);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  // Menü am Handy: Seite dahinter sperren, Fokus ins Menü, Escape schließt.
  useEffect(() => {
    const wurzel = document.documentElement;
    const hinten = document.querySelectorAll<HTMLElement>("main, footer, .handyleiste");
    if (!handyOffen) {
      delete wurzel.dataset.menue;
      hinten.forEach((el) => el.removeAttribute("inert"));
      return;
    }
    wurzel.dataset.menue = "offen";
    hinten.forEach((el) => el.setAttribute("inert", ""));
    handyMenue.current?.querySelector<HTMLElement>("a, summary")?.focus({ preventScroll: true });

    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHandyOffen(false);
        handyKnopf.current?.focus();
      }
    };
    document.addEventListener("keydown", taste);
    return () => {
      document.removeEventListener("keydown", taste);
      delete wurzel.dataset.menue;
      hinten.forEach((el) => el.removeAttribute("inert"));
    };
  }, [handyOffen]);

  // Aufklappmenü: Escape und Klick daneben schließen.
  useEffect(() => {
    if (!aufklappOffen) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        schliesseAufklapp(true);
        menuePunkt.current?.querySelector<HTMLElement>("button")?.focus();
      }
    };
    const klick = (e: PointerEvent) => {
      if (!menuePunkt.current?.contains(e.target as Node)) schliesseAufklapp(false);
    };
    document.addEventListener("keydown", taste);
    document.addEventListener("pointerdown", klick);
    return () => {
      document.removeEventListener("keydown", taste);
      document.removeEventListener("pointerdown", klick);
    };
  }, [aufklappOffen, schliesseAufklapp]);

  return (
    <>
      <header className="kopf" data-kopf data-menue={handyOffen ? "offen" : undefined}>
        <div className="kopf__leiste">
          <div className="kopf__innen">
            <Link className="kopf__logo" href="/" aria-label={`${firmenname}: zur Startseite`}>
              {/* Original-Logo als unveränderte Datei, mit festen Maßen. Bewusst kein Bildbaustein, der es umrechnet. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mat.svg" width={96} height={50} alt={`Logo ${firmenname}`} />
            </Link>

            <nav className="kopf__nav" aria-label="Hauptmenü">
              <ul>
                <li
                  className="hat-menue"
                  ref={menuePunkt}
                  data-offen={aufklappOffen ? "true" : undefined}
                  data-gesperrt={gesperrt ? "true" : undefined}
                  onPointerLeave={() => {
                    setGesperrt(false);
                    setVorschau(null);
                  }}
                  onPointerEnter={() => setVorschau((v) => v ?? 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      schliesseAufklapp(true);
                      (e.currentTarget.querySelector("button") as HTMLElement | null)?.focus();
                    }
                  }}
                  onBlur={(e) => {
                    // Verlässt der Fokus den Menüpunkt, schließt das Menü.
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setGesperrt(false);
                      setAufklappOffen(false);
                    }
                  }}
                >
                  <button
                    type="button"
                    className="kopf__link"
                    aria-expanded={aufklappOffen}
                    aria-controls="menue-leistungen"
                    aria-current={leistungenAktiv ? "true" : undefined}
                    onClick={() => {
                      setGesperrt(false);
                      setVorschau((v) => v ?? 0);
                      setAufklappOffen((o) => !o);
                    }}
                  >
                    <span>Leistungen</span>
                    <Zeichen name="winkel" />
                  </button>

                  <div className="aufklapp" id="menue-leistungen" onClick={eintragGewaehlt}>
                    <div className="aufklapp__innen">
                      <ul className="aufklapp__liste">
                        {leistungen.map((l, i) => (
                          <li key={l.id} style={{ "--spalte-nr": Math.floor(i / 3) } as CSSProperties}>
                            <Link
                              href={l.pfad}
                              className="menuepunkt"
                              aria-current={pfad === l.pfad ? "page" : undefined}
                              onPointerEnter={() => setVorschau(i)}
                              onFocus={() => setVorschau(i)}
                            >
                              {l.zeichen}
                              <span className="menuepunkt__name">{l.name}</span>
                              <span className="menuepunkt__zeile">{l.zeile}</span>
                              <Kippschalter />
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="aufklapp__vorschau" aria-hidden="true">
                        {vorschau !== null &&
                          leistungen.map((l, i) => (
                            <Image
                              key={l.id}
                              src={l.bild}
                              alt=""
                              sizes="300px"
                              loading={i === vorschau ? "eager" : "lazy"}
                              data-aktiv={i === vorschau ? "true" : undefined}
                            />
                          ))}
                      </div>

                      <p className="aufklapp__fuss">
                        <Link className="textlink" href="/leistungen">
                          Alle Leistungen im Überblick
                        </Link>
                        <Link className="textlink" href="/haus">
                          Leistungen im 3D-Haus entdecken
                        </Link>
                      </p>
                    </div>
                  </div>
                </li>

                {hauptpunkte.map((p) => (
                  <li key={p.pfad}>
                    <Link
                      className="kopf__link"
                      href={p.pfad}
                      aria-current={istAktiv(pfad, p.pfad) ? "page" : undefined}
                    >
                      <span>{p.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a className="kopf__telefon" href={telefon.href} aria-label={`Jetzt anrufen: ${telefon.anzeige}`}>
              <Zeichen name="telefon" />
              <span>{telefon.anzeige}</span>
            </a>

            {anfrage.startsWith("#") ? (
              <a className="knopf knopf--haupt knopf--klein kopf__anfrage" href={anfrage} data-magnet="">
                <Zeichen name="stecker" className="knopf__stecker" />
                <span className="knopf__text">Anfrage stellen</span>
              </a>
            ) : (
              <Link className="knopf knopf--haupt knopf--klein kopf__anfrage" href={anfrage} data-magnet="">
                <Zeichen name="stecker" className="knopf__stecker" />
                <span className="knopf__text">Anfrage stellen</span>
              </Link>
            )}

            {/* Ohne Skript führt der Menüknopf zur Fußzeile, in der alle Links stehen. */}
            <a
              className="kopf__menueknopf"
              href="#fuss"
              role="button"
              ref={handyKnopf}
              aria-expanded={handyOffen}
              aria-controls="handymenue"
              aria-label={handyOffen ? "Menü schließen" : "Menü öffnen"}
              onClick={(e) => {
                e.preventDefault();
                setHandyOffen((o) => !o);
              }}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                  setHandyOffen((o) => !o);
                }
              }}
            >
              <span />
              <span />
              <span />
            </a>
          </div>
        </div>
      </header>

      <div
        className="handymenue auf-rot"
        id="handymenue"
        ref={handyMenue}
        data-offen={handyOffen ? "true" : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
      >
        <ul className="handymenue__liste">
          <li style={{ "--i": 0 } as CSSProperties}>
            <details open={leistungenAktiv || undefined}>
              <summary>
                Leistungen
                <Zeichen name="winkel" />
              </summary>
              <ul className="handymenue__unterliste">
                {leistungen.map((l) => (
                  <li key={l.id}>
                    <Link href={l.pfad} aria-current={pfad === l.pfad ? "page" : undefined}>
                      {l.zeichen}
                      {l.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/leistungen" aria-current={pfad === "/leistungen" ? "page" : undefined}>
                    <Zeichen name="pfeil" />
                    Alle Leistungen im Überblick
                  </Link>
                </li>
              </ul>
            </details>
          </li>
          {hauptpunkte.map((p, i) => (
            <li key={p.pfad} style={{ "--i": i + 1 } as CSSProperties}>
              <Link
                className="handymenue__link"
                href={p.pfad}
                aria-current={istAktiv(pfad, p.pfad) ? "page" : undefined}
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="handymenue__fuss">
          <a className="knopf knopf--zweit" href={telefon.href}>
            <span className="knopf__text">Jetzt anrufen</span>
          </a>
          {anfrage.startsWith("#") ? (
            <a className="knopf knopf--weiss" href={anfrage} onClick={() => setHandyOffen(false)}>
              <span className="knopf__text">Anfrage stellen</span>
            </a>
          ) : (
            <Link className="knopf knopf--weiss" href={anfrage}>
              <span className="knopf__text">Anfrage stellen</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
