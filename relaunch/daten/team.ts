import type { StaticImageData } from "next/image";

import miodrag from "@/bilder/team/miodrag-manojlovic.webp";
import andjelina from "@/bilder/team/andjelina-manojlovic.webp";
import srdjana from "@/bilder/team/srdjana-tomasic.webp";
import borislav from "@/bilder/team/borislav-terzic.webp";
import andreja from "@/bilder/team/andreja-sulejic.webp";
import sadik from "@/bilder/team/sadik-sadiku.webp";
import mohammad from "@/bilder/team/mohammad-nimrozi.webp";
import ahmed from "@/bilder/team/ahmed-demic.webp";
import muhamed from "@/bilder/team/muhamed-demic.webp";
import drazen from "@/bilder/team/drazen-valcic.webp";
import veljko from "@/bilder/team/veljko-stefanovic.webp";
import johannes from "@/bilder/team/johannes-burger.webp";
import rahim from "@/bilder/team/rahim-hosseini.webp";

/**
 * Team. Einzige Stelle für "Über uns", Karriere und die Teamgröße in der Vertrauensleiste.
 * Namen und Funktionen: Kontext.md, Abschnitt 4.3 (Stand der bisherigen Webseite).
 */
export interface Teammitglied {
  name: string;
  funktion: string;
  bild: StaticImageData;
}

export const team: Teammitglied[] = [
  { name: "Miodrag Manojlovic", funktion: "Geschäftsführer, Elektromeister", bild: miodrag },
  { name: "Andjelina Manojlovic", funktion: "Assistenz der Geschäftsführung", bild: andjelina },
  { name: "Srdjana Tomasic", funktion: "Projektmanagerin", bild: srdjana },
  { name: "Borislav Terzic", funktion: "Obermonteur", bild: borislav },
  { name: "Andreja Sulejic", funktion: "Obermonteur", bild: andreja },
  { name: "Sadik Sadiku", funktion: "Monteur", bild: sadik },
  { name: "Mohammad Nimrozi", funktion: "Monteur", bild: mohammad },
  { name: "Ahmed Demic", funktion: "Monteur", bild: ahmed },
  { name: "Muhamed Demic", funktion: "Monteur", bild: muhamed },
  { name: "Drazen Valcic", funktion: "Monteur", bild: drazen },
  { name: "Veljko Stefanovic", funktion: "Auszubildender", bild: veljko },
  { name: "Johannes Burger", funktion: "Auszubildender", bild: johannes },
  { name: "Rahim Hosseini", funktion: "Auszubildender", bild: rahim },
];

/** Teamgröße laut Teamliste der bisherigen Webseite. Bitte von Mat bestätigen lassen. */
export const teamgroesse = team.length;
