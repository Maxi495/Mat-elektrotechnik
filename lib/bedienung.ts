/**
 * Bedienung und Erscheinen ohne Bibliothek (Design.md, Abschnitt 8: CSS zuerst).
 *
 * Alles hier verändert nur die Darstellung. Texte und Links stehen schon im Quelltext.
 * Die Leitung, der Ablauf und der Auftritt der Sicherungsreihe liegen in lib/bewegung.ts (GSAP),
 * sie werden erst nach dem ersten Bildaufbau geladen.
 */

type Aufraeumen = () => void;

/** Führt eine Aufgabe aus, sobald der Browser Luft hat. Gibt eine Funktion zum Abbrechen zurück. */
export function nachrangig(aufgabe: () => void): Aufraeumen {
  const w = window as Window & {
    requestIdleCallback?: (rueckruf: () => void, optionen?: { timeout: number }) => number;
    cancelIdleCallback?: (kennung: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const kennung = w.requestIdleCallback(aufgabe, { timeout: 1800 });
    return () => w.cancelIdleCallback?.(kennung);
  }
  const kennung = window.setTimeout(aufgabe, 500);
  return () => window.clearTimeout(kennung);
}

const ruhig = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mitMaus = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const breit = () => window.matchMedia("(min-width: 1024px)").matches;

/* ------------------------------------------------------------------ Erscheinen beim Scrollen */

/** Überschrift in Zeilen teilen, damit sie Zeile für Zeile aus einer Maske nach oben kommt. */
function teileZeilen(el: HTMLElement): (() => void) | null {
  if (el.children.length > 0) return null;
  const text = (el.textContent ?? "").trim();
  if (!text) return null;
  const original = el.innerHTML;

  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="wort">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`)
    .join(" ");
  const woerter = Array.from(el.querySelectorAll<HTMLElement>(".wort"));
  const zeilen: string[][] = [];
  let oben = Number.NaN;
  for (const w of woerter) {
    if (w.offsetTop !== oben) {
      zeilen.push([]);
      oben = w.offsetTop;
    }
    zeilen[zeilen.length - 1].push(w.textContent ?? "");
  }
  if (zeilen.length > 6) {
    el.innerHTML = original;
    return null;
  }
  el.innerHTML = zeilen
    .map(
      (z, i) =>
        `<span class="zeile"><span style="--i:${i}">${z
          .join(" ")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")}</span></span>`,
    )
    .join(" ");
  el.classList.add("zeilen-fertig", "wartet");
  return () => {
    el.innerHTML = original;
    el.classList.remove("zeilen-fertig", "wartet");
  };
}

function erscheinen(wurzel: ParentNode): Aufraeumen {
  const kandidaten = Array.from(
    wurzel.querySelectorAll<HTMLElement>(
      "main [data-zeilen], main .bildrahmen, main [data-reihe], main [data-erscheint], main .zeichen[data-zeichnet], main [data-erscheint-kopf]",
    ),
  ).filter((el) => !el.closest(".start-kopf, .seitenkopf, .sicherung, .raumbild"));

  if (ruhig() || !("IntersectionObserver" in window)) {
    kandidaten.forEach((el) => el.classList.add("ist-da", "ruht"));
    return () => {};
  }

  const zurueck = new Map<HTMLElement, () => void>();
  const zeiten: number[] = [];
  const unten = window.innerHeight * 0.94;

  const zeige = (el: HTMLElement) => {
    el.classList.remove("wartet");
    el.classList.add("ist-da");
    if (el.matches("[data-reihe]")) {
      zeiten.push(window.setTimeout(() => el.classList.add("ruht"), 1400));
    }
    const wiederherstellen = zurueck.get(el);
    if (wiederherstellen) {
      zeiten.push(
        window.setTimeout(() => {
          wiederherstellen();
          zurueck.delete(el);
        }, 1500),
      );
    }
  };

  // Elemente, die im Wartezustand selbst beschnitten sind, meldet der Browser nie als sichtbar.
  // Für sie wacht deshalb das Elternelement.
  const ziele = new Map<Element, HTMLElement[]>();
  const beobachte = (el: HTMLElement) => {
    const wache = el.matches(".bildrahmen, .endstueck") ? (el.parentElement ?? el) : el;
    ziele.set(wache, [...(ziele.get(wache) ?? []), el]);
    waechter.observe(wache);
  };

  const waechter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        (ziele.get(e.target) ?? []).forEach(zeige);
        ziele.delete(e.target);
        waechter.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );

  for (const el of kandidaten) {
    const lage = el.getBoundingClientRect();
    if (lage.top < unten) {
      // Schon im Bild: steht ohne Bewegung da.
      el.classList.add("ist-da", "ruht");
      continue;
    }
    if (el.matches("[data-zeilen]")) {
      const wiederherstellen = teileZeilen(el);
      if (wiederherstellen) zurueck.set(el, wiederherstellen);
    } else {
      if (el.matches(".bildrahmen")) el.setAttribute("data-erscheint", "");
      el.classList.add("wartet");
    }
    beobachte(el);
  }

  return () => {
    waechter.disconnect();
    zeiten.forEach((z) => window.clearTimeout(z));
    zurueck.forEach((wiederherstellen) => wiederherstellen());
  };
}

/* ------------------------------------------------------------------ Licht an */

/** Am Handy gehen Bilder beim Hineinscrollen an. Mit Maus kommt der Lichtschein von der Stelle der Maus. */
function licht(wurzel: ParentNode): Aufraeumen {
  const bilder = Array.from(wurzel.querySelectorAll<HTMLElement>("main [data-licht]"));
  if (bilder.length === 0) return () => {};

  if (ruhig()) {
    bilder.forEach((b) => b.classList.add("ist-an"));
    return () => {};
  }

  if (mitMaus()) {
    const bewegt = (e: PointerEvent) => {
      const ziel = (e.target as Element).closest<HTMLElement>("[data-licht]");
      if (!ziel) return;
      const lage = ziel.getBoundingClientRect();
      ziel.style.setProperty("--licht-x", `${e.clientX - lage.left}px`);
      ziel.style.setProperty("--licht-y", `${e.clientY - lage.top}px`);
    };
    document.addEventListener("pointermove", bewegt, { passive: true });
    return () => document.removeEventListener("pointermove", bewegt);
  }

  const waechter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          e.target.classList.add("ist-an");
          waechter.unobserve(e.target);
        }
      }
    },
    { threshold: 0.55 },
  );
  bilder.forEach((b) => waechter.observe(b));
  return () => waechter.disconnect();
}

/* ------------------------------------------------------------------ Sicherungsreihe */

function sicherungsreihe(wurzel: ParentNode): Aufraeumen {
  const reihen = Array.from(wurzel.querySelectorAll<HTMLElement>("[data-sicherungsreihe]"));
  const abbau: Aufraeumen[] = [];

  for (const reihe of reihen) {
    const sicherungen = Array.from(reihe.querySelectorAll<HTMLElement>(".sicherung"));

    const stelle = (aktiv: HTMLElement | null) => {
      for (const s of sicherungen) {
        const offen = s === aktiv;
        s.dataset.offen = String(offen);
        s.querySelector(".sicherung__schalter")?.setAttribute("aria-expanded", String(offen));
      }
    };

    const hinein = (e: Event) => {
      if (!breit()) return;
      const s = (e.target as Element).closest<HTMLElement>(".sicherung");
      if (s && s.dataset.offen !== "true") stelle(s);
    };

    const fokus = (e: FocusEvent) => {
      // Nur der Fokus per Tastatur öffnet. Beim Antippen folgt sofort der Klick, der selbst schaltet;
      // würde der Fokus hier schon öffnen, schlösse der Klick die Zeile am Handy gleich wieder.
      const ziel = e.target as Element;
      if (!ziel.matches(":focus-visible")) return;
      const s = ziel.closest<HTMLElement>(".sicherung");
      if (s && s.dataset.offen !== "true") stelle(s);
    };

    const klick = (e: MouseEvent) => {
      const knopf = (e.target as Element).closest(".sicherung__schalter");
      if (!knopf) return;
      const s = knopf.closest<HTMLElement>(".sicherung");
      if (!s) return;
      // Ab Laptop bleibt immer ein Streifen offen. Am Handy schließt ein zweites Antippen die Zeile.
      stelle(s.dataset.offen === "true" && !breit() ? null : s);
    };

    reihe.addEventListener("pointerover", hinein);
    reihe.addEventListener("focusin", fokus);
    reihe.addEventListener("click", klick);
    abbau.push(() => {
      reihe.removeEventListener("pointerover", hinein);
      reihe.removeEventListener("focusin", fokus);
      reihe.removeEventListener("click", klick);
    });
  }
  return () => abbau.forEach((a) => a());
}

/* ------------------------------------------------------------------ Laufband der Bewertungen */

/** Tempo des Laufbands in Pixeln je Sekunde, auf jedem Bildschirm gleich. */
const BAND_TEMPO = 28;
/** So viele Pixel darf ein schneller Wisch zwischen zwei Bildern über die Naht hinausschießen. */
const BAND_RESERVE = 240;

/**
 * Laufband als endlose Schleife (Design.md, 8.8). Es zieht langsam nach links und lässt sich mit Finger,
 * Rad, Tastatur und Pfeilen in beide Richtungen endlos weiterblättern.
 *
 * So geht die Schleife: Vor und hinter den echten Karten stehen Kopien der letzten und der ersten Karten.
 * Erreicht die Bahn die Kopien, springt sie um genau eine Runde. Dort sieht alles gleich aus, der Sprung
 * ist nicht zu sehen. Die Kopien sind für Vorleseprogramme und die Tastatur unsichtbar.
 *
 * Von selbst läuft das Band nur ohne "reduzierte Bewegung". Es hält bei Maus darüber, Tastaturfokus,
 * Berührung, aufgeklappter Bewertung und über den Halt-Knopf an und läuft danach weiter.
 */
function laufband(wurzel: ParentNode): Aufraeumen {
  const baender = Array.from(wurzel.querySelectorAll<HTMLElement>("[data-laufband]"));
  const abbau: Aufraeumen[] = [];

  for (const band of baender) {
    const bahn = band.querySelector<HTMLElement>(".laufband__bahn");
    if (!bahn) continue;
    const originale = Array.from(bahn.children) as HTMLElement[];
    if (originale.length < 2) continue;

    const zurueck = band.querySelector<HTMLButtonElement>("[data-laufband-zurueck]");
    const vor = band.querySelector<HTMLButtonElement>("[data-laufband-vor]");
    const halter = band.querySelector<HTMLButtonElement>("[data-laufband-halt]");
    const selbst = !ruhig();

    let kopien: HTMLElement[] = [];
    let schleife = false;
    let schritt = 0; // Kartenbreite plus Lücke
    let runde = 0; // Breite aller echten Karten samt Lücken
    let start = 0; // Lage, bei der die erste echte Karte am Inhaltsrand steht
    let sichtBreite = 0;
    let lage = 0;
    let stelle = 0; // Lage in Karten gezählt, damit nach einer Größenänderung dieselbe Karte vorn steht

    const kopiere = (karte: HTMLElement) => {
      const kopie = karte.cloneNode(true) as HTMLElement;
      kopie.setAttribute("aria-hidden", "true");
      kopie.dataset.kopie = "";
      kopie.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      kopie.querySelectorAll<HTMLElement>("a, button, [tabindex]").forEach((el) => {
        el.tabIndex = -1;
        el.removeAttribute("aria-controls");
      });
      kopien.push(kopie);
      return kopie;
    };

    /** Misst die Bahn und stellt die Kopien für die Schleife auf. Vorn bleibt dieselbe Karte stehen. */
    const baue = () => {
      kopien.forEach((k) => k.remove());
      kopien = [];

      const anzahl = originale.length;
      sichtBreite = bahn.clientWidth;
      schritt = originale[1].getBoundingClientRect().left - originale[0].getBoundingClientRect().left;
      schleife = schritt > 0 && bahn.scrollWidth > sichtBreite + 1;
      if (halter) halter.hidden = !(selbst && schleife);

      if (!schleife) {
        start = 0;
        runde = 0;
        delete band.dataset.schleife;
        bahn.scrollLeft = Math.max(0, stelle * schritt);
        lage = bahn.scrollLeft;
        return;
      }

      const innen = Number.parseFloat(getComputedStyle(bahn).paddingLeft) || 0;
      const vorn = Math.ceil((innen + schritt + BAND_RESERVE) / schritt);
      const hinten = Math.ceil((sichtBreite + schritt + BAND_RESERVE) / schritt);
      const davor = document.createDocumentFragment();
      for (let i = 0; i < vorn; i++) {
        davor.appendChild(kopiere(originale[(((anzahl - vorn + i) % anzahl) + anzahl) % anzahl]));
      }
      const danach = document.createDocumentFragment();
      for (let i = 0; i < hinten; i++) danach.appendChild(kopiere(originale[i % anzahl]));
      bahn.insertBefore(davor, originale[0]);
      bahn.appendChild(danach);

      // Am fertigen Aufbau messen, damit die Runde auch bei krummen Kartenbreiten genau stimmt.
      const erste = originale[0].getBoundingClientRect().left;
      start = erste - kopien[0].getBoundingClientRect().left;
      runde = kopien[vorn].getBoundingClientRect().left - erste;
      band.dataset.schleife = "true";
      bahn.scrollLeft = start + (((stelle % anzahl) + anzahl) % anzahl) * schritt;
      lage = bahn.scrollLeft;
    };

    /** Hält die Bahn innerhalb einer Runde. Der Sprung um eine ganze Runde ändert das Bild nicht. */
    const ordne = () => {
      if (!schleife) return;
      const x = bahn.scrollLeft;
      const rand = schritt + 32; // ein Pfeil-Schritt darf über die Naht laufen, ohne dass sie mittendrin springt
      if (x >= start + runde + rand) bahn.scrollLeft = lage = x - runde;
      else if (x <= start - rand) bahn.scrollLeft = lage = x + runde;
    };

    /* ---------- Anhalten und Weiterlaufen */

    let maus = false;
    let fokus = false;
    let finger = false;
    let sichtbar = false;
    let offen = false;
    let gehalten = false;
    let ruheBis = 0;
    let laeuft = false;
    let bild = 0;
    let zuletzt = 0;

    /** Nach Blättern, Wischen oder Verlassen kurz warten, bevor das Band wieder anläuft. */
    const ruhe = (dauer: number) => {
      ruheBis = Math.max(ruheBis, performance.now() + dauer);
    };

    const darfLaufen = () =>
      schleife && !document.hidden && !maus && !fokus && !finger && !offen && !gehalten && performance.now() >= ruheBis;

    const laufe = (jetzt: number) => {
      bild = requestAnimationFrame(laufe);
      const vergangen = Math.min(64, jetzt - zuletzt);
      zuletzt = jetzt;
      const an = darfLaufen();
      if (an !== laeuft) {
        laeuft = an;
        band.dataset.laeuft = String(an);
        if (an) lage = bahn.scrollLeft;
      }
      if (!an) return;
      lage += (BAND_TEMPO * vergangen) / 1000;
      if (lage >= start + runde) lage -= runde;
      bahn.scrollLeft = lage;
    };

    // Das Band rechnet nur, solange es zu sehen ist.
    const waechter = new IntersectionObserver(([e]) => {
      sichtbar = e.isIntersecting;
      cancelAnimationFrame(bild);
      if (sichtbar && selbst) {
        zuletzt = performance.now();
        bild = requestAnimationFrame(laufe);
      } else {
        laeuft = false;
        band.dataset.laeuft = "false";
      }
    });

    const mausRein = (e: PointerEvent) => {
      if (e.pointerType === "mouse") maus = true;
    };
    const mausRaus = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      maus = false;
      ruhe(900);
    };
    // Nur Tastaturfokus hält an. Ein Mausklick auf einen Pfeil soll das Band nicht für immer stoppen.
    const fokusWechsel = () => {
      window.setTimeout(() => {
        const vorher = fokus;
        fokus = band.querySelector(":focus-visible") !== null;
        if (vorher && !fokus) ruhe(900);
      }, 0);
    };
    const fingerAuf = () => {
      finger = true;
    };
    const fingerAb = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      finger = false;
      ruhe(2500);
    };
    const rollt = () => {
      ordne();
      // Die Stelle nur merken, solange die Maße noch stimmen. Sonst steht ein Neuaufbau an.
      if (schritt > 0 && bahn.clientWidth === sichtBreite) stelle = (bahn.scrollLeft - start) / schritt;
      // Rollt die Bahn, ohne dass das Band selbst läuft, blättert gerade jemand: erst danach weiter.
      if (!laeuft) ruhe(1200);
    };
    const aufgeklappt = () => {
      offen = band.querySelector('[data-offen="true"]') !== null;
    };
    const halte = () => {
      gehalten = !gehalten;
      if (!halter) return;
      halter.dataset.gehalten = String(gehalten);
      halter.setAttribute("aria-label", gehalten ? "Laufband fortsetzen" : "Laufband anhalten");
    };

    /* ---------- Blättern mit den Pfeilen: immer genau bis zur nächsten Kartenkante */

    let ziel: number | null = null;
    let zielZeit = 0;

    const blaettere = (richtung: 1 | -1) => {
      ruhe(4000);
      const art: ScrollBehavior = ruhig() ? "auto" : "smooth";
      if (!schleife) {
        bahn.scrollBy({ left: richtung * (schritt || 320), behavior: art });
        return;
      }
      let x = bahn.scrollLeft;
      const unterwegs = ziel !== null && performance.now() - zielZeit < 700;
      let basis = unterwegs && ziel !== null ? ziel : x;
      // Erst zurück in die Runde, damit der Schritt selbst nicht über die Naht hinausläuft.
      if (richtung > 0 && x >= start + runde) {
        x -= runde;
        basis -= runde;
        bahn.scrollLeft = x;
      } else if (richtung < 0 && x <= start) {
        x += runde;
        basis += runde;
        bahn.scrollLeft = x;
      }
      const stelle = (basis - start) / schritt;
      const naechste = richtung > 0 ? Math.floor(stelle + 0.02) + 1 : Math.ceil(stelle - 0.02) - 1;
      ziel = Math.min(start + runde + schritt, Math.max(start - schritt, start + naechste * schritt));
      zielZeit = performance.now();
      bahn.scrollTo({ left: ziel, behavior: art });
    };
    const klickZurueck = () => blaettere(-1);
    const klickVor = () => blaettere(1);

    // Ändert sich die Breite, werden Kartenbreite und Zahl der Kopien neu bestimmt.
    let neuBauen = 0;
    const groesse = new ResizeObserver(() => {
      if (bahn.clientWidth === sichtBreite) return;
      cancelAnimationFrame(neuBauen);
      neuBauen = requestAnimationFrame(baue);
    });

    baue();
    waechter.observe(band);
    groesse.observe(bahn);
    bahn.addEventListener("scroll", rollt, { passive: true });
    band.addEventListener("pointerenter", mausRein);
    band.addEventListener("pointerleave", mausRaus);
    band.addEventListener("focusin", fokusWechsel);
    band.addEventListener("focusout", fokusWechsel);
    band.addEventListener("touchstart", fingerAuf, { passive: true });
    band.addEventListener("touchend", fingerAb, { passive: true });
    band.addEventListener("touchcancel", fingerAb, { passive: true });
    band.addEventListener("mat-bewertung", aufgeklappt);
    zurueck?.addEventListener("click", klickZurueck);
    vor?.addEventListener("click", klickVor);
    halter?.addEventListener("click", halte);

    abbau.push(() => {
      cancelAnimationFrame(bild);
      cancelAnimationFrame(neuBauen);
      waechter.disconnect();
      groesse.disconnect();
      bahn.removeEventListener("scroll", rollt);
      band.removeEventListener("pointerenter", mausRein);
      band.removeEventListener("pointerleave", mausRaus);
      band.removeEventListener("focusin", fokusWechsel);
      band.removeEventListener("focusout", fokusWechsel);
      band.removeEventListener("touchstart", fingerAuf);
      band.removeEventListener("touchend", fingerAb);
      band.removeEventListener("touchcancel", fingerAb);
      band.removeEventListener("mat-bewertung", aufgeklappt);
      zurueck?.removeEventListener("click", klickZurueck);
      vor?.removeEventListener("click", klickVor);
      halter?.removeEventListener("click", halte);
      kopien.forEach((k) => k.remove());
      kopien = [];
      delete band.dataset.schleife;
      delete band.dataset.laeuft;
      if (halter) {
        halter.hidden = true;
        delete halter.dataset.gehalten;
      }
    });
  }
  return () => abbau.forEach((a) => a());
}

/* ------------------------------------------------------------------ Bewertungen: lange Texte aufklappen */

/**
 * Lange Bewertungen zeigen sechs Zeilen (stil/bausteine.css) und den Knopf "Mehr", wie bei Google.
 * Der Knopf erscheint nur, wo wirklich Text abgeschnitten ist. Kopien im Laufband schalten mit um.
 */
function bewertungen(wurzel: ParentNode): Aufraeumen {
  if (!wurzel.querySelector("[data-bewertung]")) return () => {};

  const pruefe = () => {
    const karten = Array.from(wurzel.querySelectorAll<HTMLElement>("[data-bewertung]"));
    // Erst alles messen, dann schreiben.
    const zuLang = karten.map((karte) => {
      if (karte.dataset.offen === "true") return true;
      const text = karte.querySelector<HTMLElement>(".bewertung__text p");
      return text !== null && text.scrollHeight > text.clientHeight + 1;
    });
    karten.forEach((karte, i) => {
      const knopf = karte.querySelector<HTMLButtonElement>(".bewertung__mehr");
      if (knopf) knopf.hidden = !zuLang[i];
    });
  };

  const klick = (e: MouseEvent) => {
    const knopf = e.target instanceof Element ? e.target.closest(".bewertung__mehr") : null;
    const karte = knopf?.closest<HTMLElement>("[data-bewertung]");
    if (!knopf || !karte) return;
    const auf = karte.dataset.offen !== "true";
    const kennung = CSS.escape(karte.dataset.bewertung ?? "");
    // Original und Kopie derselben Bewertung zeigen denselben Zustand.
    for (const k of wurzel.querySelectorAll<HTMLElement>(`[data-bewertung="${kennung}"]`)) {
      k.dataset.offen = String(auf);
      const b = k.querySelector<HTMLButtonElement>(".bewertung__mehr");
      if (!b) continue;
      b.textContent = auf ? "Weniger" : "Mehr";
      b.setAttribute("aria-expanded", String(auf));
    }
    karte.dispatchEvent(new CustomEvent("mat-bewertung", { bubbles: true }));
  };

  let bild = 0;
  const neuPruefen = () => {
    cancelAnimationFrame(bild);
    bild = requestAnimationFrame(pruefe);
  };

  pruefe();
  // Mit der geladenen Schrift können sich Zeilen verschieben.
  document.fonts?.ready.then(neuPruefen);
  window.addEventListener("resize", neuPruefen, { passive: true });
  document.addEventListener("click", klick);

  return () => {
    cancelAnimationFrame(bild);
    window.removeEventListener("resize", neuPruefen);
    document.removeEventListener("click", klick);
  };
}

/* ------------------------------------------------------------------ Zahlen zählen einmal hoch */

function zaehler(wurzel: ParentNode): Aufraeumen {
  const zahlen = Array.from(wurzel.querySelectorAll<HTMLElement>("[data-zaehler]"));
  if (zahlen.length === 0 || ruhig()) return () => {};
  const bilder: number[] = [];

  const waechter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        waechter.unobserve(e.target);
        const el = e.target as HTMLElement;
        const ziel = Number(el.dataset.zaehler);
        if (!Number.isFinite(ziel)) continue;
        // Jahreszahlen zählen die letzten Jahre hoch, alle anderen Zahlen von null.
        const start = ziel > 1000 ? ziel - 24 : 0;
        el.style.display = "inline-block";
        el.style.minWidth = `${String(ziel).length}ch`;
        const beginn = performance.now();
        const dauer = 900;
        const tick = (jetzt: number) => {
          const t = Math.min(1, (jetzt - beginn) / dauer);
          const sanft = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(start + (ziel - start) * sanft));
          if (t < 1) {
            bilder.push(requestAnimationFrame(tick));
          } else {
            // Fertig gezählt: Die reservierte Breite entfällt, sonst bleibt neben schmalen Ziffern eine Lücke.
            el.style.removeProperty("display");
            el.style.removeProperty("min-width");
          }
        };
        bilder.push(requestAnimationFrame(tick));
      }
    },
    { threshold: 0.6 },
  );
  zahlen.forEach((z) => waechter.observe(z));
  return () => {
    waechter.disconnect();
    bilder.forEach((b) => cancelAnimationFrame(b));
    zahlen.forEach((z) => {
      if (z.dataset.zaehler) z.textContent = z.dataset.zaehler;
      z.style.removeProperty("display");
      z.style.removeProperty("min-width");
    });
  };
}

/* ------------------------------------------------------------------ Kopfzeile beim Scrollen */

/**
 * Kopfzeile: nach 80 px Scrollweg klein, beim Abwärtsscrollen weg, beim Aufwärtsscrollen sofort zurück
 * (Design.md, 8.7). Kommt ohne Bibliothek aus und läuft einmal je Besuch.
 */
export function starteKopf(): Aufraeumen {
  const kopf = document.querySelector<HTMLElement>("[data-kopf]");
  if (!kopf) return () => {};
  let zuletzt = window.scrollY;
  let bild = 0;

  const pruefe = () => {
    bild = 0;
    const weg = window.scrollY;
    const klein = weg > 80;
    if (kopf.dataset.klein !== String(klein)) kopf.dataset.klein = String(klein);
    if (weg < zuletzt || weg <= 320) {
      if (kopf.dataset.weg !== "false") kopf.dataset.weg = "false";
    } else if (weg > zuletzt && kopf.dataset.weg !== "true") {
      kopf.dataset.weg = "true";
    }
    zuletzt = weg;
  };
  const rollt = () => {
    if (!bild) bild = requestAnimationFrame(pruefe);
  };

  window.addEventListener("scroll", rollt, { passive: true });
  pruefe();
  return () => {
    window.removeEventListener("scroll", rollt);
    cancelAnimationFrame(bild);
    delete kopf.dataset.klein;
    delete kopf.dataset.weg;
  };
}

/* ------------------------------------------------------------------ Schmale Bildschirme: Knoten und Ablauf */

/**
 * Unter 1024 px gibt es weder den Leitungskanal noch den Auftritt der Sicherungsreihe.
 * Was dort bleibt, die Knoten der Zeitleiste und die Verbindung im Ablauf, läuft hier ohne Bibliothek.
 * So lädt das Handy GSAP gar nicht erst (Design.md, 13: Skripte unter 200 KB).
 * Ab 1024 px übernimmt starteSeite in lib/bewegung.ts.
 */
export function starteSeiteLeicht(): Aufraeumen {
  const inhalt = document.querySelector<HTMLElement>("main");
  if (!inhalt) return () => {};

  const knoten = Array.from(inhalt.querySelectorAll<HTMLElement>("[data-knoten], .zeitleiste .knoten"));
  const ablaeufe = Array.from(inhalt.querySelectorAll<HTMLElement>("[data-ablauf]"));

  if (ruhig() || !("IntersectionObserver" in window)) {
    knoten.forEach((k) => k.classList.add("ist-an"));
    ablaeufe.forEach((a) => a.querySelectorAll(".ablauf__knoten").forEach((p) => p.classList.add("ist-an")));
    return () => {};
  }

  // Ein Knoten füllt sich, sobald er die oberen 62 Prozent des Bildschirms erreicht.
  const waechter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("ist-an");
        waechter.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -38% 0px" },
  );
  knoten.forEach((k) => waechter.observe(k));

  // Ablauf: Die Verbindung wächst mit dem Scrollweg, jeder Knoten zündet, wenn sie ihn erreicht.
  let bild = 0;
  const zeichne = () => {
    bild = 0;
    const hoehe = window.innerHeight;
    const start = hoehe * 0.72;
    const ende = hoehe * 0.58;
    for (const ablauf of ablaeufe) {
      const bahn = ablauf.querySelector<HTMLElement>(".ablauf__bahn");
      if (!bahn) continue;
      const feld = ablauf.getBoundingClientRect();
      const anteil = Math.max(0, Math.min(1, (start - feld.top) / (feld.height + start - ende)));
      ablauf.style.setProperty("--fortschritt", anteil.toFixed(3));

      const b = bahn.getBoundingClientRect();
      const quer = b.width > b.height;
      ablauf.querySelectorAll<HTMLElement>(".ablauf__knoten:not(.ist-an)").forEach((p) => {
        const r = p.getBoundingClientRect();
        const lage = quer
          ? (r.left + r.width / 2 - b.left) / b.width
          : (r.top + r.height / 2 - b.top) / b.height;
        if (anteil >= Math.max(0, Math.min(0.98, lage))) p.classList.add("ist-an");
      });
    }
  };
  const rollt = () => {
    if (!bild) bild = requestAnimationFrame(zeichne);
  };

  if (ablaeufe.length > 0) {
    window.addEventListener("scroll", rollt, { passive: true });
    window.addEventListener("resize", rollt);
    zeichne();
  }

  return () => {
    waechter.disconnect();
    window.removeEventListener("scroll", rollt);
    window.removeEventListener("resize", rollt);
    cancelAnimationFrame(bild);
    ablaeufe.forEach((a) => a.style.removeProperty("--fortschritt"));
  };
}

/** Alles, was zu einer Seite gehört. Läuft bei jedem Seitenwechsel neu. */
export function richteSeiteEin(wurzel: ParentNode = document): Aufraeumen {
  const abbau = [
    erscheinen(wurzel),
    licht(wurzel),
    sicherungsreihe(wurzel),
    laufband(wurzel),
    bewertungen(wurzel),
    zaehler(wurzel),
  ];
  return () => abbau.forEach((a) => a());
}

/* ------------------------------------------------------------------ Mauszeiger, Anziehung, Neigung */

/**
 * Läuft einmal je Besuch und nur auf Geräten mit Maus:
 * eigener Mauszeiger (der normale bleibt sichtbar), Anziehung der Hauptknöpfe um höchstens 6 px,
 * Neigung der Zielgruppenkarten um höchstens 4 Grad.
 */
export function richteMausEin(): Aufraeumen {
  if (!mitMaus() || ruhig()) return () => {};

  const zeiger = document.createElement("div");
  zeiger.className = "zeiger";
  zeiger.setAttribute("aria-hidden", "true");
  zeiger.innerHTML =
    '<span class="zeiger__punkt"></span><span class="zeiger__ring"></span>' +
    '<span class="zeiger__kreis">Ansehen</span>' +
    '<span class="zeiger__schalter"><span class="kippschalter"><span class="kippschalter__hebel"></span></span></span>';
  document.body.appendChild(zeiger);

  let zielX = 0;
  let zielY = 0;
  let x = 0;
  let y = 0;
  let bild = 0;
  let laeuft = false;
  let magnet: HTMLElement | null = null;
  let karte: HTMLElement | null = null;

  const schleife = () => {
    x += (zielX - x) * 0.22;
    y += (zielY - y) * 0.22;
    zeiger.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    if (Math.abs(zielX - x) + Math.abs(zielY - y) > 0.3) {
      bild = requestAnimationFrame(schleife);
    } else {
      laeuft = false;
    }
  };

  const loese = () => {
    if (magnet) {
      magnet.style.removeProperty("--mx");
      magnet.style.removeProperty("--my");
      magnet = null;
    }
    if (karte) {
      karte.style.removeProperty("--neig-x");
      karte.style.removeProperty("--neig-y");
      karte = null;
    }
  };

  const bewegt = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    zielX = e.clientX;
    zielY = e.clientY;
    if (zeiger.dataset.sichtbar !== "true") {
      x = zielX;
      y = zielY;
      zeiger.dataset.sichtbar = "true";
    }
    if (!laeuft) {
      laeuft = true;
      bild = requestAnimationFrame(schleife);
    }

    const ziel = e.target as Element;
    const art = ziel.closest("[data-zeiger='ansehen']")
      ? "ansehen"
      : ziel.closest("[data-zeiger='schalter'] .sicherung")
        ? "schalter"
        : ziel.closest("a, button, summary, label, [role='button'], input, textarea, select")
          ? "link"
          : "";
    if (zeiger.dataset.art !== art) zeiger.dataset.art = art;

    // Anziehung: Der Hauptknopf folgt der Maus um höchstens 6 px.
    const knopf = ziel.closest<HTMLElement>("[data-magnet]");
    if (knopf !== magnet) {
      if (magnet) {
        magnet.style.removeProperty("--mx");
        magnet.style.removeProperty("--my");
      }
      magnet = knopf;
    }
    if (magnet) {
      const lage = magnet.getBoundingClientRect();
      const dx = (e.clientX - (lage.left + lage.width / 2)) / (lage.width / 2);
      const dy = (e.clientY - (lage.top + lage.height / 2)) / (lage.height / 2);
      magnet.style.setProperty("--mx", `${(Math.max(-1, Math.min(1, dx)) * 6).toFixed(1)}px`);
      magnet.style.setProperty("--my", `${(Math.max(-1, Math.min(1, dy)) * 6).toFixed(1)}px`);
    }

    // Neigung: Die Zielgruppenkarte neigt sich leicht zur Maus, höchstens 4 Grad.
    const neigt = ziel.closest<HTMLElement>("[data-neigt]");
    if (neigt !== karte) {
      if (karte) {
        karte.style.removeProperty("--neig-x");
        karte.style.removeProperty("--neig-y");
      }
      karte = neigt;
    }
    if (karte) {
      const lage = karte.getBoundingClientRect();
      const dx = (e.clientX - lage.left) / lage.width - 0.5;
      const dy = (e.clientY - lage.top) / lage.height - 0.5;
      karte.style.setProperty("--neig-y", `${(dx * 8).toFixed(2)}deg`);
      karte.style.setProperty("--neig-x", `${(-dy * 8).toFixed(2)}deg`);
    }
  };

  const verlassen = () => {
    zeiger.dataset.sichtbar = "false";
    loese();
  };

  document.addEventListener("pointermove", bewegt, { passive: true });
  document.documentElement.addEventListener("pointerleave", verlassen);
  window.addEventListener("blur", verlassen);

  return () => {
    cancelAnimationFrame(bild);
    document.removeEventListener("pointermove", bewegt);
    document.documentElement.removeEventListener("pointerleave", verlassen);
    window.removeEventListener("blur", verlassen);
    loese();
    zeiger.remove();
  };
}
