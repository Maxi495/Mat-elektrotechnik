"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { anfrageZiel } from "@/lib/anfrageziel";

/**
 * Feste Leiste am Handy (Design.md, 9.2): links "Jetzt anrufen", rechts "Anfrage stellen".
 * Sie verschwindet, solange ein Formular im Bild ist.
 */
export function Handyleiste({ telefon }: { telefon: string }) {
  const pfad = usePathname();
  const ziel = anfrageZiel(pfad);
  const [versteckt, setVersteckt] = useState(false);

  useEffect(() => {
    const formulare = document.querySelectorAll("form.formular");
    if (formulare.length === 0) return;
    const sichtbar = new Set<Element>();
    const waechter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) sichtbar.add(e.target);
          else sichtbar.delete(e.target);
        }
        setVersteckt(sichtbar.size > 0);
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    formulare.forEach((f) => waechter.observe(f));
    return () => {
      waechter.disconnect();
      setVersteckt(false);
    };
  }, [pfad]);

  return (
    <div className="handyleiste" data-versteckt={versteckt ? "true" : undefined}>
      <a className="knopf knopf--zweit" href={telefon}>
        <span className="knopf__text">Jetzt anrufen</span>
      </a>
      {ziel.startsWith("#") ? (
        <a className="knopf knopf--haupt" href={ziel}>
          <span className="knopf__text">Anfrage stellen</span>
        </a>
      ) : (
        <Link className="knopf knopf--haupt" href={ziel}>
          <span className="knopf__text">Anfrage stellen</span>
        </Link>
      )}
    </div>
  );
}
