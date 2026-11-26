"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { Kippschalter } from "./Zeichen";

/**
 * Smart-Home-Bedienfeld im Kopfbereich (Design.md, 8.8):
 * drei echte Schalter für Licht, Jalousie und Stimmung. Jeder Schalter verändert das Raumbild sofort.
 * Der Besucher probiert Smart Home aus, statt darüber zu lesen.
 *
 * Ohne Skript steht das Raumbild als normales Foto da, die Schalter sind ausgeblendet.
 */
export function Bedienfeld({ bild, alt }: { bild: StaticImageData; alt: string }) {
  const [licht, setLicht] = useState(true);
  const [jalousie, setJalousie] = useState(false);
  const [abend, setAbend] = useState(false);

  const zustand = [
    licht ? "Licht an" : "Licht aus",
    jalousie ? "Jalousien geschlossen" : "Jalousien offen",
    abend && licht ? "Abendstimmung" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bedienfeld">
      <div
        className="raumbild"
        data-licht={licht ? "an" : "aus"}
        data-jalousie={jalousie ? "zu" : "auf"}
        data-stimmung={abend ? "abend" : "tag"}
      >
        <Image
          src={bild}
          alt={alt}
          sizes="(min-width: 1024px) 40vw, 100vw"
          loading="eager"
          fetchPriority="high"
        />
        {/* Die beiden Fensterflächen des Fotos */}
        <span
          className="raumbild__jalousie"
          aria-hidden="true"
          style={{ left: "0%", top: "44%", width: "23.5%", height: "56%" }}
        />
        <span
          className="raumbild__jalousie"
          aria-hidden="true"
          style={{ left: "33.4%", top: "48%", width: "22.4%", height: "45%" }}
        />
        <span className="raumbild__ton" aria-hidden="true" />
        <span className="raumbild__zustand" role="status" aria-live="polite">
          {zustand}
        </span>
      </div>

      <div className="bedientafel" role="group" aria-label="Smart Home ausprobieren">
        <button
          type="button"
          className="bedientaste"
          role="switch"
          aria-checked={licht}
          onClick={() => setLicht((an) => !an)}
        >
          <Kippschalter />
          <span>
            Licht<small>{licht ? "an" : "aus"}</small>
          </span>
        </button>
        <button
          type="button"
          className="bedientaste"
          role="switch"
          aria-checked={jalousie}
          onClick={() => setJalousie((zu) => !zu)}
        >
          <Kippschalter />
          <span>
            Jalousie<small>{jalousie ? "zu" : "auf"}</small>
          </span>
        </button>
        <button
          type="button"
          className="bedientaste"
          role="switch"
          aria-checked={abend}
          onClick={() => setAbend((an) => !an)}
        >
          <Kippschalter />
          <span>
            Stimmung<small>{abend ? "Abend" : "Tag"}</small>
          </span>
        </button>
      </div>
    </div>
  );
}
