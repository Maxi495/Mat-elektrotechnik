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
      "main [data-zeilen], main .bildrahmen, main [data-reihe], main [data-erscheint], main .zeichen[data-zeichnet], main [data-portraet], main [data-erscheint-kopf]",
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
      const s = (e.target as Element).closest<HTMLElement>(".sicherung");
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

function laufband(wurzel: ParentNode): Aufraeumen {
  const baender = Array.from(wurzel.querySelectorAll<HTMLElement>("[data-laufband]"));
  const abbau: Aufraeumen[] = [];

  for (const band of baender) {
    const bahn = band.querySelector<HTMLElement>(".laufband__bahn");
    if (!bahn) continue;
    const originale = Array.from(bahn.children) as HTMLElement[];
    if (originale.length === 0) continue;

    const schritt = () => {
      const karte = bahn.firstElementChild as HTMLElement | null;
      const luecke = Number.parseFloat(getComputedStyle(bahn).columnGap || "24") || 24;
      return (karte?.offsetWidth ?? 320) + luecke;
    };

    const zurueck = band.querySelector<HTMLButtonElement>("[data-laufband-zurueck]");
    const vor = band.querySelector<HTMLButtonElement>("[data-laufband-vor]");
    const blaettere = (richtung: number) => {
      pause(4000);
      bahn.scrollBy({ left: richtung * schritt(), behavior: ruhig() ? "auto" : "smooth" });
    };
    const klickZurueck = () => blaettere(-1);
    const klickVor = () => blaettere(1);
    zurueck?.addEventListener("click", klickZurueck);
    vor?.addEventListener("click", klickVor);

    let bild = 0;
    let angehalten = false;
    let sichtbar = false;
    let weiter = 0;
    let lage = 0;
    const kopien: HTMLElement[] = [];

    function pause(dauer: number) {
      angehalten = true;
      band.dataset.laeuft = "false";
      window.clearTimeout(weiter);
      if (dauer > 0) weiter = window.setTimeout(fortsetzen, dauer);
    }

    function fortsetzen() {
      if (band.matches(":hover") || band.contains(document.activeElement)) return;
      angehalten = false;
      lage = bahn!.scrollLeft;
      band.dataset.laeuft = "true";
    }

    if (!ruhig() && bahn.scrollWidth > bahn.clientWidth) {
      // Zweiter Satz Karten, damit das Band ohne Sprung weiterläuft. Für Vorleseprogramme unsichtbar.
      for (const karte of originale) {
        const kopie = karte.cloneNode(true) as HTMLElement;
        kopie.setAttribute("aria-hidden", "true");
        kopie.setAttribute("inert", "");
        bahn.appendChild(kopie);
        kopien.push(kopie);
      }
      band.dataset.laeuft = "true";

      const laufe = () => {
        bild = requestAnimationFrame(laufe);
        if (angehalten || !sichtbar || document.hidden) return;
        const halb = kopien[0].offsetLeft - originale[0].offsetLeft;
        lage += 0.45;
        if (lage >= halb) lage -= halb;
        bahn.scrollLeft = lage;
      };

      const waechter = new IntersectionObserver(([e]) => {
        sichtbar = e.isIntersecting;
      });
      waechter.observe(band);

      const halt = () => pause(0);
      const los = () => pause(1200);
      const beruehrt = () => pause(5000);
      band.addEventListener("pointerenter", halt);
      band.addEventListener("pointerleave", los);
      band.addEventListener("focusin", halt);
      band.addEventListener("focusout", los);
      band.addEventListener("touchstart", beruehrt, { passive: true });
      bild = requestAnimationFrame(laufe);

      abbau.push(() => {
        cancelAnimationFrame(bild);
        window.clearTimeout(weiter);
        waechter.disconnect();
        band.removeEventListener("pointerenter", halt);
        band.removeEventListener("pointerleave", los);
        band.removeEventListener("focusin", halt);
        band.removeEventListener("focusout", los);
        band.removeEventListener("touchstart", beruehrt);
        kopien.forEach((k) => k.remove());
        delete band.dataset.laeuft;
      });
    }

    abbau.push(() => {
      zurueck?.removeEventListener("click", klickZurueck);
      vor?.removeEventListener("click", klickVor);
    });
  }
  return () => abbau.forEach((a) => a());
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
          if (t < 1) bilder.push(requestAnimationFrame(tick));
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
    });
  };
}

/** Alles, was zu einer Seite gehört. Läuft bei jedem Seitenwechsel neu. */
export function richteSeiteEin(wurzel: ParentNode = document): Aufraeumen {
  const abbau = [erscheinen(wurzel), licht(wurzel), sicherungsreihe(wurzel), laufband(wurzel), zaehler(wurzel)];
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
