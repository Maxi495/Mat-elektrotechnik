import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Bewegung mit GSAP und ScrollTrigger (Design.md, Abschnitt 8 und 12):
 * die Leitung, die Knotenpunkte, die Verbindung im Ablauf, der Auftritt der Sicherungsreihe
 * und das Verhalten der Kopfzeile beim Scrollen.
 *
 * Diese Datei wird erst nach dem ersten Bildaufbau geladen (Design.md, Abschnitt 13, Punkt 5).
 * Ohne sie steht alles fertig da: Leitung gezeichnet, Knoten gefüllt, erste Sicherung offen.
 */
gsap.registerPlugin(ScrollTrigger);

const ruhig = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Kopfzeile: nach 80 px Scrollweg klein, beim Abwärtsscrollen weg, beim Aufwärtsscrollen sofort zurück. */
export function starteKopf(): () => void {
  const kopf = document.querySelector<HTMLElement>("[data-kopf]");
  if (!kopf) return () => {};
  const waechter = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const weg = self.scroll();
      const klein = weg > 80;
      if (kopf.dataset.klein !== String(klein)) kopf.dataset.klein = String(klein);
      const verstecken = weg > 320 && self.direction === 1;
      if (self.direction === -1 || weg <= 320) {
        if (kopf.dataset.weg !== "false") kopf.dataset.weg = "false";
      } else if (verstecken && kopf.dataset.weg !== "true") {
        kopf.dataset.weg = "true";
      }
    },
  });
  return () => {
    waechter.kill();
    delete kopf.dataset.klein;
    delete kopf.dataset.weg;
  };
}

/** Alles, was zu einer Seite gehört. Läuft bei jedem Seitenwechsel neu. */
export function starteSeite(): () => void {
  const inhalt = document.querySelector<HTMLElement>("main");
  if (!inhalt) return () => {};
  const still = ruhig();

  const kontext = gsap.context(() => {
    /* ---------- Die Leitung: zeichnet sich mit dem Scrollfortschritt ---------- */
    const strom = inhalt.querySelector<HTMLElement>(".leitung__strom");
    if (strom && !still) {
      let ziel = 0;
      let jetzt = Number.NaN;

      const messe = () => {
        ziel = Math.max(0, window.scrollY + window.innerHeight * 0.62 - inhalt.offsetTop);
      };
      const ziehe = () => {
        if (Number.isNaN(jetzt)) jetzt = ziel;
        const rest = ziel - jetzt;
        if (Math.abs(rest) < 0.4) return;
        jetzt += rest * 0.16;
        strom.style.setProperty("--zug", `${jetzt.toFixed(1)}px`);
      };

      messe();
      ScrollTrigger.create({
        trigger: inhalt,
        start: "top bottom",
        end: "bottom top",
        onUpdate: messe,
        onRefresh: messe,
      });
      gsap.ticker.add(ziehe);
      return () => gsap.ticker.remove(ziehe);
    }
  }, inhalt);

  const kontext2 = gsap.context(() => {
    /* ---------- Knotenpunkte: füllen sich, wenn die Leitung sie erreicht ---------- */
    const knoten = gsap.utils.toArray<HTMLElement>("[data-knoten], .zeitleiste .knoten", inhalt);
    if (still) {
      knoten.forEach((k) => k.classList.add("ist-an"));
    } else {
      knoten.forEach((k) => {
        ScrollTrigger.create({
          trigger: k,
          start: "top 62%",
          once: true,
          onEnter: () => k.classList.add("ist-an"),
        });
      });
    }

    /* ---------- Ablauf: Die Leitung verbindet die Schritte, jeder Knoten zündet ---------- */
    gsap.utils.toArray<HTMLElement>("[data-ablauf]", inhalt).forEach((ablauf) => {
      const punkte = gsap.utils.toArray<HTMLElement>(".ablauf__knoten", ablauf);
      const bahn = ablauf.querySelector<HTMLElement>(".ablauf__bahn");
      if (!bahn) return;
      if (still) {
        punkte.forEach((p) => p.classList.add("ist-an"));
        return;
      }

      // Lage jedes Knotens auf der Bahn als Anteil zwischen 0 und 1
      const schwellen = () => {
        const b = bahn.getBoundingClientRect();
        const quer = b.width > b.height;
        return punkte.map((p) => {
          const r = p.getBoundingClientRect();
          const anteil = quer
            ? (r.left + r.width / 2 - b.left) / b.width
            : (r.top + r.height / 2 - b.top) / b.height;
          return Math.max(0, Math.min(0.98, anteil));
        });
      };
      let grenzen = schwellen();

      gsap.fromTo(
        ablauf,
        { "--fortschritt": 0 },
        {
          "--fortschritt": 1,
          ease: "none",
          scrollTrigger: {
            trigger: ablauf,
            start: "top 72%",
            end: "bottom 58%",
            scrub: 0.5,
            onRefresh: () => {
              grenzen = schwellen();
            },
            onUpdate: (self) => {
              punkte.forEach((p, i) => {
                if (self.progress >= grenzen[i]) p.classList.add("ist-an");
              });
            },
          },
        },
      );
    });

    /* ---------- Sicherungsreihe: Sammelschiene, Adern, dann legt die erste Sicherung um ---------- */
    gsap.utils.toArray<HTMLElement>("[data-sicherungsreihe]", inhalt).forEach((reihe) => {
      if (still || !window.matchMedia("(min-width: 1024px)").matches) return;
      if (reihe.getBoundingClientRect().top < window.innerHeight * 0.9) return;

      const schiene = reihe.querySelector(".sammelschiene__strom");
      const adern = reihe.querySelectorAll(".sicherung__ader");
      const sicherungen = gsap.utils.toArray<HTMLElement>(".sicherung", reihe);
      const stelle = (aktiv: HTMLElement | null) =>
        sicherungen.forEach((s) => {
          const offen = s === aktiv;
          s.dataset.offen = String(offen);
          s.querySelector(".sicherung__schalter")?.setAttribute("aria-expanded", String(offen));
        });

      stelle(null);
      gsap
        .timeline({
          scrollTrigger: { trigger: reihe, start: "top 78%", once: true },
          onComplete: () => {
            gsap.set(adern, { clearProps: "transform" });
          },
        })
        .fromTo(schiene, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" })
        .fromTo(
          adern,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.42, ease: "power2.inOut", stagger: 0.06 },
          "-=0.45",
        )
        .add(() => {
          // Hat der Besucher inzwischen selbst geschaltet, bleibt seine Wahl stehen.
          if (!sicherungen.some((s) => s.dataset.offen === "true")) stelle(sicherungen[0]);
        }, "-=0.1");
    });
  }, inhalt);

  // Schriften und Bilder können die Höhe der Seite noch ändern.
  const neuMessen = () => ScrollTrigger.refresh();
  window.addEventListener("load", neuMessen, { once: true });
  document.fonts?.ready.then(neuMessen).catch(() => {});

  return () => {
    window.removeEventListener("load", neuMessen);
    kontext.revert();
    kontext2.revert();
  };
}
