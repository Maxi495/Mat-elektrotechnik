import type { StaticImageData } from "next/image";
import type { LeistungId } from "./adressen";

import bildAndreasP from "@/bilder/bewertungen/andreas-p.webp";
import bildAnkeBlackert from "@/bilder/bewertungen/anke-blackert.webp";
import bildBassamMona from "@/bilder/bewertungen/bassam-mona.webp";
import bildDanTheMan from "@/bilder/bewertungen/dan-the-man.webp";
import bildDanieleEngelmann from "@/bilder/bewertungen/daniele-engelmann.webp";
import bildFlorianZenker from "@/bilder/bewertungen/florian-zenker.webp";
import bildGerhardHantel from "@/bilder/bewertungen/gerhard-hantel.webp";
import bildHeidiSaers from "@/bilder/bewertungen/heidi-saers.webp";
import bildKerstinDausel from "@/bilder/bewertungen/kerstin-dausel.webp";
import bildKristijanVasic from "@/bilder/bewertungen/kristijan-vasic.webp";
import bildMU from "@/bilder/bewertungen/m-u.webp";
import bildMaryanaMona from "@/bilder/bewertungen/maryana-mona.webp";
import bildMichaelBaumgartner from "@/bilder/bewertungen/michael-baumgartner.webp";
import bildPeter from "@/bilder/bewertungen/peter.webp";
import bildPeterHuber from "@/bilder/bewertungen/peter-huber.webp";
import bildUweBetz from "@/bilder/bewertungen/uwe-betz.webp";
import bildUweJockel from "@/bilder/bewertungen/uwe-jockel.webp";
import bildWilhelmBerchtold from "@/bilder/bewertungen/wilhelm-berchtold.webp";

/**
 * Bewertungen aus dem Google-Profil von Mat-Elektrotechnik. Einzige Stelle für Startseite,
 * Referenzen und Leistungsseiten.
 *
 * Stand der Erfassung: firma.google.stand. Erfasst sind alle Bewertungen mit fünf Sternen, die einen Text haben
 * (48 von 67). Bewertungen ohne Text und die beiden Bewertungen mit weniger als fünf Sternen fehlen hier.
 *
 * - text: Wortlaut bei Google, unverändert, auch mit Tippfehlern. Zeilenumbrüche wie dort, Leerzeilen entfernt.
 * - name: Anzeigename bei Google, Schreibweise wie dort.
 * - bild: eigenes Profilbild des Verfassers. Ohne eigenes Bild zeigt Google einen Buchstaben auf Farbe;
 *   farbe ist dann der Farbton aus dem Google-Profil.
 * - Die Reihenfolge ist die von Google ("Relevanteste" am Tag der Erfassung).
 *
 * Neue Bewertungen kommen von Hand dazu. Die Seite holt nichts von Google nach.
 */
export interface Bewertung {
  id: string;
  name: string;
  text: string;
  /** Leer = allgemeine Stimme ohne Bezug zu einer Leistung. */
  leistungen: LeistungId[];
  bild: StaticImageData | null;
  farbe: string | null;
  /** Google zeigt diese Bewertung als Übersetzung an. */
  uebersetzt?: boolean;
}

export const googleBewertungen: Bewertung[] = [
  {
    id: "sylvia-betzl",
    name: "Sylvia Betzl",
    text: "Meine Mutter ist 88 Jahre alt, in der Wohnung war die Deckenlampe in der Küche ausgebrannt, noch schlimmer, sie hat rum gebastelt, es gab einen Kurzschluss und einen Schwelbrand, nix ging mehr. Zudem ein ausgebranntes Kühlschranklamperl, wo wir die Abdeckung nicht lösen konnten und eine ausgebrannte Lampe im Schlafzimmer. Kein Elektriker weit und breit wollte uns helfen, es waren ja nur Kleinigkeiten, kein großer Auftrag. Ich habe am Montag bei Mat angerufen und sofort für Dienstag einen Termin bekommen. 3 x musste das Mat Team anfahren, um alles zu erledigen\nHeute ist Freitag und meine Mutter ist glücklich. Super, dass es noch Handwerker mit Herz gibt, die freundlich, hilfsbereit und schnell sind. Ich sage 1000 Mal danke, bis zum nächsten Mal",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#512DA8",
  },
  {
    id: "dan-the-man",
    name: "Dan the Man",
    text: "Wir sind seit Jahren Kunde der Mat-Elektrotechnik GmbH und rundum zufrieden.\nDie Arbeiten werden stets zuverlässig, sauber und fachgerecht ausgeführt.\nBesonders schätzen wir die schnelle Reaktionszeit, die freundliche Kommunikation und das hohe technische Know-how.",
    leistungen: [],
    bild: bildDanTheMan,
    farbe: null,
  },
  {
    id: "gerhard-hantel",
    name: "Gerhard Hantel",
    text: "Installation Smart Meter von Shelly für mein Balkonkraftwerk. Habe innerhalb von einer Woche einen Termin bekommen. Das Smart Meter wurde installiert und der Monteur hat auch gleich geholfen die App dafür mit einzurichten. Funktioniert alles super.",
    leistungen: ["photovoltaik"],
    bild: bildGerhardHantel,
    farbe: null,
  },
  {
    id: "mihajlo",
    name: "Mihajlo",
    text: "Die Zusammenarbeit mit MAT war durchweg positiv und professionell. Von der ersten Beratung bis zur finalen Umsetzung hat das Team hervorragende Arbeit geleistet.\nDie Zuverlässigkeit hat uns wirklich besonders beeindruckt: Termine wurden exakt eingehalten, Absprachen wurden stets transparent und verbindlich umgesetzt. Auch die Installation war nicht nur technisch einwandfrei, sondern auch handwerklich auf höchstem Niveau.\nWir können daher die gesamte Firma uneingeschränkt weiterempfehlen und werden bei zukünftigen Projekten definitiv wieder auf sie zurückkommen.",
    leistungen: [],
    bild: null,
    farbe: "#C2185B",
  },
  {
    id: "daniele-engelmann",
    name: "Daniele Engelmann",
    text: "Mit der Mat-Elektrotechnik arbeiten wir seit vielen Jahren äußerst erfolgreich zusammen.\nDas Team überzeugt durch hohe Fachkompetenz, Zuverlässigkeit und eine professionelle, angenehme Kommunikation.\nAlle Arbeiten werden präzise, termingerecht und in bester Qualität ausgeführt – man merkt, dass hier mit Leidenschaft und Verantwortung gearbeitet wird.",
    leistungen: [],
    bild: bildDanieleEngelmann,
    farbe: null,
  },
  {
    id: "denis-hodzic",
    name: "Denis Hodzic",
    text: "ich bin sehr zufrieden mit der Arbeit der Firma MAT aus Germering. Die Installation unserer Wallbox wurde schnell, sauber und fachgerecht durchgeführt. Vom ersten Beratungsgespräch bis zur finalen Inbetriebnahme lief alles reibungslos. Die Mitarbeiter waren pünktlich, freundlich und haben auf alle Fragen kompetent geantwortet. Besonders positiv fand ich die flexible Terminvereinbarung und die transparente Kommunikation. Klare Empfehlung – jederzeit gerne wieder!",
    leistungen: ["wallbox"],
    bild: null,
    farbe: "#F4511E",
  },
  {
    id: "marco-hantel",
    name: "Marco Hantel",
    text: "Ich bin begeistert von der Arbeit und dem tollen Service der Mat Electrotechnik GmbH. Vielen Dank für die Installation der Wallbox! Kann die Firma weiterempfehlen.",
    leistungen: ["wallbox"],
    bild: null,
    farbe: "#689F38",
  },
  {
    id: "heidi-saers",
    name: "Heidi Saers",
    text: "Die Elektriker haben in meiner Wohnung die komplette Elektrik professionell und zuverlässig erneuert. Seitdem bringen sie auch alle Lampen schnell und sauber an. Die Arbeiten werden stets sorgfältig und mit einem hohen Qualitätsanspruch ausgeführt. Besonders schätze ich die kompetente Beratung und die freundliche Art. Ich kann das Team uneingeschränkt weiterempfehlen.",
    leistungen: ["elektroinstallation"],
    bild: bildHeidiSaers,
    farbe: null,
  },
  {
    id: "milan-stojanovic",
    name: "Milan Stojanovic",
    text: "Hervorragender Service und echte Fachkompetenz!\nIch bin absolut begeistert von der Mat-Elektrotechnik GmbH. Vom ersten Kontakt bis zur fertigen Ausführung lief alles reibungslos, professionell und zuverlässig. Das Team ist nicht nur sehr freundlich, sondern auch extrem kompetent – man merkt sofort, dass hier echte Fachleute am Werk sind.\nBesonders positiv: Termine wurden pünktlich eingehalten, die Kommunikation war jederzeit transparent, und auch bei komplexeren Anforderungen wurde immer eine passende Lösung gefunden. Die Qualität der Arbeit ist top – sauber, präzise und nachhaltig ausgeführt.\nIch kann Mat-Elektrotechnik uneingeschränkt weiterempfehlen und werde auch zukünftig gerne auf dieses Unternehmen zurückgreifen. Vielen Dank für die tolle Zusammenarbeit!",
    leistungen: [],
    bild: null,
    farbe: "#8D6E63",
  },
  {
    id: "wilhelm-berchtold",
    name: "Wilhelm Berchtold",
    text: "Wir haben unsere PV Anlage mit Speicher planen und installieren lassen. Wirklich alles perfekt gelaufen von der ersten Anfrage über Änderungswünsche und Wechsel auf ein anderes System. Die Entscheidung für MAT Ist zudem auch gefallen, da die Firma und der Inhaber uns schon lange Jahre bekannt sind und auch bei Fragen, die nichts mit dem Projekt zu tun haben, schnell geantwortet wird.\nAbsolut empfehlenswerte Firma. Würde ich nicht die meisten elektrischen Themen in meinem Haus selbst abdecken, würden Sie mir Aufträge von mir erhalten! 😄",
    leistungen: ["photovoltaik"],
    bild: bildWilhelmBerchtold,
    farbe: null,
  },
  {
    id: "bassam-mona",
    name: "Bassam Mona",
    text: "Wir haben mit der Elektrofirma MAT Elektrotechnik in Germering zusammengearbeitet und sind rundum zufrieden. Die Mitarbeiter waren nicht nur kompetent, sondern auch ausgesprochen freundlich und zuverlässig. Unser Projekt wurde termingerecht und absolut reibungslos umgesetzt. Besonders schätzen wir die offene Kommunikation und die lösungsorientierte Arbeitsweise. Wir können das Unternehmen uneingeschränkt weiterempfehlen.",
    leistungen: [],
    bild: bildBassamMona,
    farbe: null,
  },
  {
    id: "lili-manoj",
    name: "Lili Manoj",
    text: "Ein sehr guter und auch schneller Service. Das Team von MATelektrik war sehr freundlich und konnte meine Wünsche, bezüglich der Beleuchtung, wunderbar umsetzen. MAT-Elektrotechnik ist absolut empfehlenswert!",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#EF6C00",
  },
  {
    id: "maryana-mona",
    name: "Maryana Mona",
    text: "Ich kann MAT-Elektrotechnik echt nur empfehlen! Ausgezeichnete Leistung rund um Elektrotechnik. Man merkt, dass sie wissen, was sie tun – von der Beratung bis zur Ausführung einfach top. Vielen Dank nochmal!",
    leistungen: [],
    bild: bildMaryanaMona,
    farbe: null,
  },
  {
    id: "margit-riepertinger",
    name: "margit riepertinger",
    text: "Die Firma MAT-Elektrotechnik haben wir anhand der vorherigen guten Bewertungen und der Ortsnähe ausgewählt. Die Mitarbeiter sind sehr freundlich, super zuverlässig und vor allem kompetent. Alles wurde schnell und sauber installiert und auch zu einem sehr fairen Preis.Wir können die Firma nur weiterempfehlen , da auch der Chef uns gut beraten hat und unsere alte Stromversorgung zu erneuern.Vielen Dank",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#7B1FA2",
  },
  {
    id: "doris-huppert-fessler",
    name: "Doris Huppert-Feßler",
    text: "Wir haben in unserem Reihenhaus in Germering Anfang 2023 die komplette Elektroinstallation erneuert. Wir waren mit der Firma MAT von der Angebotserstellung und der Durchführung äußerst zufrieden. Zwar verschob sich der Beginn auf Grund von Krankheit der Mitarbeiter. Danach war alles pünktlich, zuverlässig, korrekt und sehr empfehlenswert. Wir würden die Firma MAT- Elektrotechnik jederzeit wieder beauftragen und bedanken uns herzlich für die professionelle Arbeit und die wirklich gute Zusammenarbeit.",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#455A64",
  },
  {
    id: "thomas-fuchsbichler",
    name: "Thomas Fuchsbichler",
    text: "Haben eine über 50 Jahre alte Hauptverteilung im Keller auf den aktuellen Stand inkl. Aufbau einer Wallbox-Stromversorgung durchführen lassen.\nVom ersten Vorgespräch, über die Planung und bis zur Ausführen der Arbeiten bin ich sehr zufrieden! Alles lief problemlos, Fragen und offene Punkte wurden ausführlich besprochen und man merkt, dass hier auf den Kunden eingegangen wird. Das gesamte MAT-Team trat sehr freundlich und professionell auf, alle Arbeiten wurden final besprochen und mit dem Kunden abgenommen.\nAuch zukünftig werde ich wieder die Firma MAT-Elektrotechnik bei Bedarf beauftragen, hier fühlt man sich rundum sorglos betreut!",
    leistungen: ["verteilerbau", "wallbox"],
    bild: null,
    farbe: "#5D4037",
  },
  {
    id: "uwe-koehler",
    name: "Uwe Köhler",
    text: "Das Team von MAT denkt mit, vor allem auch lösungsorientiert, und berät den Bauherren auch bei kniffligen Fragestellungen. Diese Eigenschaft würde ich mir von allen Handwerkern wünschen. Außerdem wird in hoher Qualität ausgeführt und wenn doch einmal etwas schief gelaufen ist, wird es offen angesprochen und anstandsfrei ausgebessert. Ich kann MAT Elektrotechnik daher gutem Gewissen weiterempfehlen!",
    leistungen: [],
    bild: null,
    farbe: "#5D4037",
  },
  {
    id: "kai-ansorge",
    name: "Kai Ansorge",
    text: "Absolute Fachkompetenz und ein super Handwerksmeister Betrieb! So macht Handwerk Spaß.\nSehr freundlicher Kontakt, hilfsbereit, zuverlässig und empfehlenswert!\nDie Mitarbeiter haben zügig gearbeitet und die Baustelle ordentlich und sauber verlassen!!! Daumen hoch!! Immer wieder gerne!! Ich habe Sie meinen Freunden und Bekannten weiter empfohlen.",
    leistungen: [],
    bild: null,
    farbe: "#5C6BC0",
  },
  {
    id: "uwe-betz",
    name: "Uwe Betz",
    text: "Kundenwunsch auch bei den Produkten wird ernst genommen und umgesetzt. Rückgabe bei am Ende nicht verwendeten Produkten kein Problem. Saubere Arbeit und nette, kompetente Mitarbeiter. Pünktlichkeit und Zuverlässigkeit. Gerne wieder beim nächsten Vorhaben. Empfehlenswert.",
    leistungen: [],
    bild: bildUweBetz,
    farbe: null,
  },
  {
    id: "hator-master",
    name: "hator master",
    text: "Also für diese Firma nur Lobende Worte. Von den ersten Anruf bis zu der fertigen Arbeit. Professionell, schnell, pünktlich, sauber, was will man mehr. Die preise sind auch MEGA fair. Ich empfehle diese Firma jeden in der Umgebung glauben sie mir. Ich könne bis morgen schreiben aber denke das die paar Stichwörter ausreichend sind.",
    leistungen: [],
    bild: null,
    farbe: "#F4511E",
  },
  {
    id: "timo-stengel",
    name: "Timo Stengel",
    text: "Wir haben die komplette Elektroinstallation im Haus von MAT-Elektrotechnik erneuern lassen. Wir waren sehr zufrieden, die Mitarbeiter waren nett, pünktlich und professionell, es war immer jemand erreichbar und auf unvorhergesehene Änderungen wurde schnell und unkompliziert eingegangen.",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#512DA8",
  },
  {
    id: "ralf-buehring",
    name: "Ralf Buehring",
    text: "Die Fa. Mat-Elektrotechnik hat im August einige Elektroarbeiten in unserem Haus erledigt. Die Arbeiten wurden von 2 sehr kompetenten und sehr freundlichen Mitarbeitern der Fa Mat-Elektrotechnik ausgeführt.\nWir können die Firma uneingeschränkt empfehlen und werden bei Bedarf sehr gerne wieder die Dienste in Anspruch nehmen",
    leistungen: [],
    bild: null,
    farbe: "#C2185B",
  },
  {
    id: "manfred-k",
    name: "Manfred K.",
    text: "Ich habe die Fa. MAT-Elektrotechnik sowohl im privaten als auch im geschäftlichen Bereich bereits mehrmals mit verschiedenen Themen beauftragt. Dazu gehörten komplette Elektrosanierungsmaßnahmen im Bestand, Anbringen diverser Lampen, Außenbeleuchtung im Garten, bis hin zur Installation einer Wallbox in der TG. Alle von der Fa. Mat-Elektrotechnik durchgeführten Arbeiten wurden kompetent und zuverlässig ausgeführt. Ich kann die Firma mit gutem Gewissen vorbehaltlos weiter empfehlen",
    leistungen: ["elektroinstallation", "wallbox"],
    bild: null,
    farbe: "#C2185B",
  },
  {
    id: "hoki",
    name: "Hoki",
    text: "Großes Lob an das Unternehmen und an die fleißigen Monteure. Es gibt kein Problem was nicht zu lösen wäre. Saubere Arbeit und wenn Fragen sind haben Sie immer ein offenes Ohr.",
    leistungen: [],
    // Profilbild bei Google ist eine Manga-Figur (fremdes Werk) und wird nicht übernommen. Farbe frei gewählt.
    bild: null,
    farbe: "#0097A7",
  },
  {
    id: "kerstin-dausel",
    name: "Kerstin Dausel",
    text: "Wir haben komplett neu saniert und alles musste neu gemacht werden auch die Elektrik. Super kompetente Beratung mit viel Engagement. Wir haben uns jederzeit gut betreut gefühlt und es war immer jemand erreichbar! Weiter so!",
    leistungen: ["elektroinstallation"],
    bild: bildKerstinDausel,
    farbe: null,
  },
  {
    id: "kristijan-vasic",
    name: "Kristijan Vasic",
    text: "Ich bin mit dem Service sehr zufrieden gewesen. Die Mitarbeiter wahren sehr pünktlich und zuvorkommend. Die Arbeiten wurden schnell und professionell erledigt. Ich kann das unternehmen Mat-Elektrotechnik sehr empfehlen.",
    leistungen: [],
    bild: bildKristijanVasic,
    farbe: null,
  },
  {
    id: "l-l",
    name: "L L",
    text: "schnell, kompetent, günstig, zuverlässig.\nHaben bei uns Starkstromkabel verlegt und Wallboxen installiert. Alles nach Plan verlaufen. Endpreis hat Schätzun des KVA entsprochen. Jederzeit wieder",
    leistungen: ["wallbox"],
    bild: null,
    farbe: "#0288D1",
  },
  {
    id: "novica-erkic",
    name: "Novica Erkic",
    text: "Sehr kompetent, pünktlich und flexibel.\nBedanke mich herzlich für die unkomplizierte Installation Badezimmer und die schöne helle Beleuchtung.",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#EC407A",
  },
  {
    id: "anke-blackert",
    name: "Anke Blackert",
    text: "Herzlichen Dank für die schnellen Termine, die jedesmal professionelle und zügige Arbeit und den immer sehr netten Kontakt! Wir geben sechs Sterne und empfehlen die Firma wärmstens weiter :)\nFamilie Blackert",
    leistungen: [],
    bild: bildAnkeBlackert,
    farbe: null,
  },
  {
    id: "angelika-feder",
    name: "Angelika Feder",
    text: "Habe die alle Elektroleitungen im Zuge einer Sanierung von mat erneuern lassen! Super Beratung, schnelle und saubere Umsetzung! Immer erreichbar! Fairer Preis! Rundum war ich sehr zufrieden!",
    leistungen: ["elektroinstallation"],
    bild: null,
    farbe: "#0097A7",
  },
  {
    id: "peter-huber",
    name: "Peter Huber",
    text: "Handwerklich super Ausbau der Elektrik in 2023 und 2024 an unseren Mietwohnungseinheiten. Jederzeit wieder.\nGrüsse vom jetzt pensionierten Handwerksmeister",
    leistungen: ["elektroinstallation"],
    bild: bildPeterHuber,
    farbe: null,
  },
  {
    id: "andreas-p",
    name: "Andreas P.",
    text: "Sehr kompetenter und freundlicher Betrieb mit fairen Preisen. Liefert top Arbeit ab. Schon mehrfach im Bekanntenkreis weiter empfohlen.",
    leistungen: [],
    bild: bildAndreasP,
    farbe: null,
  },
  {
    id: "max-h",
    name: "Max H.",
    text: "Umfangreichen Auftrag (privat) sehr zeitnah und äußerst zuverlässig ausgeführt. Von uns eine klare Empfehlung!",
    leistungen: [],
    bild: null,
    farbe: "#EF6C00",
  },
  {
    id: "florian-zenker",
    name: "Florian Zenker",
    text: "Toller Betrieb, super freundlich, professionell und einfach top Abwicklung. Ich kann dieses Betrieb wärmstens empfehlen",
    leistungen: [],
    bild: bildFlorianZenker,
    farbe: null,
  },
  {
    id: "i-karamarkovic",
    name: "I. Karamarkovic",
    text: "Weltklasse bei MAT. Zuverlässig, kompetent, absolute saubere Arbeit und freundlich.\nProffesionell ist schon untertrieben......!\nVielen Dank!",
    leistungen: [],
    // Profilbild bei Google ist das Foto eines Prominenten (fremdes Werk) und wird nicht übernommen. Farbe frei gewählt.
    bild: null,
    farbe: "#689F38",
  },
  {
    id: "markus-schulze",
    name: "Markus Schulze",
    text: "Sehr zuverlässige und ordentliche Arbeit! Von der Angebotserstellung bis zur Durchführung sehr pünktlich und korrekt!",
    leistungen: [],
    bild: null,
    farbe: "#455A64",
  },
  {
    id: "uwe-jockel",
    name: "Uwe Jockel",
    text: "Toller Service, tolles Team. Nächstes Jahr sind die Aufträge schon wieder vergeben.",
    leistungen: [],
    bild: bildUweJockel,
    farbe: null,
  },
  {
    id: "m-u",
    name: "M U",
    text: "Schnelle unkomplizierte Projektierung, zeitnahe mängelfreie Ausführung, dabei preislich unschlagbar - nur zu empfehlen",
    leistungen: [],
    bild: bildMU,
    farbe: null,
  },
  {
    id: "peter",
    name: "Peter",
    text: "Wir hatten 2 Kurzschlüsse auf der FBHZ, wurden gefunden und repariert, sehr freundlicher Techniker, pünktlich gerne wieder.",
    leistungen: ["elektroinstallation"],
    bild: bildPeter,
    farbe: null,
  },
  {
    id: "florian-bogner",
    name: "Florian Bogner",
    text: "Sehr professionell, freundlicher Kontakt, alle Arbeiten zur vollsten Zufriedenheit ausgeführt - gerne wieder!",
    leistungen: [],
    bild: null,
    farbe: "#0097A7",
  },
  {
    id: "franz-trauner",
    name: "Franz Trauner",
    text: "Alle arbeiten wurden bestens erledigt.\nEin zuverlässiger Elektriker wie man es sich wünscht!",
    leistungen: [],
    bild: null,
    farbe: "#78909C",
  },
  {
    id: "michael-baumgartner",
    name: "Michael Baumgartner",
    text: "Top Elektriker. Bei Notfällen immer erreichbar.",
    leistungen: [],
    bild: bildMichaelBaumgartner,
    farbe: null,
  },
  {
    id: "s-w",
    name: "S. W.",
    text: "Sehr nettes und professionelles Personal. Preise mehr wie fair. Top!",
    leistungen: [],
    bild: null,
    farbe: "#F4511E",
  },
  {
    id: "patrick-morda",
    name: "Patrick Morda",
    text: "Freundlich uns zuverlässig",
    leistungen: [],
    bild: null,
    farbe: "#33691E",
  },
  {
    id: "malal-bathily",
    name: "Malal Bathily",
    text: "Professionell und zuverlässig",
    leistungen: [],
    bild: null,
    farbe: "#F4511E",
  },
  {
    id: "markus-auer",
    name: "markus auer",
    text: "professionell und unkompliziert!",
    leistungen: [],
    bild: null,
    farbe: "#AB47BC",
  },
  {
    id: "milivoje-manojlovic",
    name: "Milivoje Manojlovic",
    text: "Top Elektriker",
    leistungen: [],
    bild: null,
    farbe: "#33691E",
  },
  {
    id: "goran-jezercic",
    name: "Goran Jezercic",
    text: "Alle Ehre!",
    leistungen: [],
    // Profilbild bei Google ist eine Karikatur, die auf einer Firmenseite nichts verloren hat. Farbe frei gewählt.
    bild: null,
    farbe: "#5C6BC0",
    uebersetzt: true,
  },
];

/**
 * Zwei Stimmen der früheren Webseite, die es im Google-Profil nicht gibt. In Kontext.md stehen sie nur
 * sinngemäß, der Originalwortlaut fehlt. Sie werden deshalb zurzeit nicht angezeigt und bleiben hier erhalten.
 * Die anderen fünf Stimmen der früheren Webseite stehen oben im Wortlaut aus Google.
 */
export const stimmenOhneWortlaut = [
  {
    name: "A. G.",
    sinngemaess:
      "Kompetent und schnell, mit korrekter Rechnung ohne Mehrkosten, nachdem ein anderer Elektriker mangelhaft gearbeitet hatte.",
  },
  {
    name: "Thomas Fischer",
    sinngemaess: "Kompetent und zuverlässig. Die Zusammenarbeit besteht seit vielen Jahren.",
  },
];

/* Texte ab dieser Länge gelten im Laufband als lang, darunter als kurz. Zeichen, nicht Zeilen. */
const AB_LANG = 280;
const BIS_KURZ = 100;

/**
 * Reihenfolge für das Laufband: lange, mittlere und kurze Bewertungen wechseln sich ab,
 * statt dass am Ende zehn Einzeiler hintereinander stehen. Innerhalb jeder Länge bleibt Googles Reihenfolge.
 */
function gemischt(liste: Bewertung[]): Bewertung[] {
  const lang = liste.filter((b) => b.text.length >= AB_LANG);
  const kurz = liste.filter((b) => b.text.length < BIS_KURZ);
  const mittel = liste.filter((b) => b.text.length >= BIS_KURZ && b.text.length < AB_LANG);
  // Jede Gruppe verteilt sich gleichmäßig über die ganze Runde. Die Verschiebung legt fest, wer beginnt.
  const verteilt = (gruppe: Bewertung[], verschiebung: number) =>
    gruppe.map((b, i) => ({ b, platz: (i + verschiebung) / gruppe.length }));
  return [...verteilt(lang, 0), ...verteilt(mittel, 0.5), ...verteilt(kurz, 0.75)]
    .sort((a, z) => a.platz - z.platz)
    .map((e) => e.b);
}

export const bewertungenImLaufband: Bewertung[] = gemischt(googleBewertungen);

/**
 * Zwei Bewertungen für eine Leistungsseite: zuerst solche mit Bezug zur Leistung, dann allgemeine.
 * Die allgemeinen wechseln je Leistung, damit nicht überall dieselben stehen.
 */
export function bewertungenFuer(leistung: LeistungId, position: number, anzahl = 2): Bewertung[] {
  const passend = googleBewertungen.filter((b) => b.leistungen.includes(leistung));
  const allgemein = googleBewertungen.filter((b) => b.leistungen.length === 0);
  const gedreht = allgemein.map((_, i) => allgemein[(i + position * anzahl) % allgemein.length]);
  return [...passend, ...gedreht].slice(0, anzahl);
}

export const hatBewertungZurLeistung = (leistung: LeistungId): boolean =>
  googleBewertungen.some((b) => b.leistungen.includes(leistung));
