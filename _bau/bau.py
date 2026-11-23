#!/usr/bin/env python3
"""Baut alle Seiten der Mat-Elektrotechnik-Website.

Aufruf im Projektordner:  python3 _bau/bau.py
Schreibt index.html, 404.html und je Seite einen Ordner mit index.html.
Inhalte stehen in dieser Datei, die Startseite in _bau/start.html.
"""
import html
import os
import sys

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    from PIL import Image
except ImportError:  # ohne Pillow fehlen nur width/height an den Bildern
    Image = None

TEL = '089 23750352'
TEL_LINK = 'tel:+498923750352'
MAIL = 'info@mat-elektrotechnik.de'
KARTE = 'https://www.google.com/maps/search/?api=1&amp;query=Industriestra%C3%9Fe+12%2C+82110+Germering'

PFEIL = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 7h10M7.5 2.5 12 7l-4.5 4.5"/></svg>'
SCHRAEG = '<svg class="schraeg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>'

NAV = [('Leistungen', '/leistungen/'), ('Referenzen', '/referenzen/'), ('Unternehmen', '/unternehmen/'),
       ('Karriere', '/karriere/'), ('Kontakt', '/kontakt/')]


def e(text):
    return html.escape(text, quote=True)


def bild(name, alt, lazy=True):
    """<img> mit Maßen. name ohne Endung, relativ zu bilder/."""
    pfad = os.path.join(WURZEL, 'bilder', name + '.webp')
    if not os.path.exists(pfad):
        sys.exit('Bild fehlt: ' + pfad)
    masse = ''
    if Image:
        b, h = Image.open(pfad).size
        masse = ' width="%d" height="%d"' % (b, h)
    return '<img src="/bilder/%s.webp" alt="%s"%s%s>' % (name, e(alt), masse, ' loading="lazy"' if lazy else '')


def knopf(text, ziel, schraeg=False, linie=False):
    return '<a class="knopf%s" href="%s">%s %s</a>' % (' knopf-linie' if linie else '', ziel, text, SCHRAEG if schraeg else PFEIL)


def kopf(aktiv):
    punkte = ''
    for name, ziel in NAV:
        punkte += '      <li><a href="%s"%s>%s</a></li>\n' % (ziel, ' aria-current="page"' if aktiv == ziel else '', name)
    return '''<header class="kopf">
  <a class="logo" href="/" aria-label="Mat-Elektrotechnik, Startseite">
    <img src="/bilder/logo-mat.svg" alt="mat" width="1184" height="619">
  </a>
  <nav class="nav" id="nav" aria-label="Hauptmenü">
    <ul>
%s    </ul>
  </nav>
  <a class="knopf kopf-tel" href="%s" aria-label="Anrufen: %s">
    <span>%s</span>
    %s
  </a>
  <button class="knopf menue-knopf" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menü">
    <svg class="auf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>
    <svg class="zu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>
  </button>
</header>''' % (punkte, TEL_LINK, TEL, TEL, SCHRAEG)


def fuss(kurz):
    links = ''.join('<li><a href="%s">%s</a></li>' % (z, n) for n, z in NAV)
    return '''<footer class="kontakt%s" id="kontakt" data-fortschritt>
  <svg class="strahlen" data-strahlen viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>
  <div class="kontakt-mitte">
    <div class="kontakt-haupt">
      <p class="etikett etikett-punkt">Sagen Sie uns, was ansteht</p>
      <h2>Kontakt</h2>
      <div class="kontakt-knoepfe">
        <a class="knopf" href="%s">%s %s</a>
        <a class="knopf" href="/kontakt/">Anfrage stellen %s</a>
      </div>
    </div>
    <div class="kontakt-seite links">
      <p class="etikett">Erreichbar</p>
      <p>Montag bis Freitag</p>
      <a href="mailto:%s">%s</a>
    </div>
    <div class="kontakt-seite rechts">
      <p class="etikett">Anschrift</p>
      <p>Industriestraße 12, 82110 Germering</p>
      <a href="%s" rel="noopener">Route planen</a>
    </div>
  </div>
  <div class="kontakt-fuss">
    <p>© 2026 Mat-Elektrotechnik GmbH</p>
    <ul>%s<li><a href="/impressum/">Impressum</a></li><li><a href="/datenschutz/">Datenschutz</a></li></ul>
  </div>
</footer>''' % (' kurz' if kurz else '', TEL_LINK, TEL, SCHRAEG, PFEIL, MAIL, MAIL, KARTE, links)


def seite(pfad, titel, beschreibung, inhalt, aktiv='', datei='index.html'):
    """Schreibt eine Seite. pfad '' ist die Wurzel."""
    ganz = '''<!doctype html>
<html lang="de" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<!-- Entwurf: bis zur Freigabe durch den Kunden nicht indexieren -->
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FFFFFF">
<meta name="color-scheme" content="light">
<link rel="icon" href="/bilder/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/raleway-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/roboto-latin-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/stil.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="sprung" href="#inhalt">Zum Inhalt springen</a>

%s

<main id="inhalt">
%s
</main>

%s

<script src="/skript.js" defer></script>
</body>
</html>
''' % (e(titel), e(beschreibung), kopf(aktiv), inhalt, fuss(kurz=pfad != ''))
    ordner = os.path.join(WURZEL, pfad)
    os.makedirs(ordner, exist_ok=True)
    with open(os.path.join(ordner, datei), 'w', encoding='utf-8') as f:
        f.write(ganz)
    print('  /' + (pfad + '/' if pfad else '') + ('' if datei == 'index.html' else datei))


def seitenkopf(pfad, worte, titel, text):
    """Kopfkachel einer Unterseite. pfad: Liste (Name, Ziel) für die Brotkrumen."""
    krumen = '<a href="/">Start</a>' + ''.join(' <span aria-hidden="true">/</span> <a href="%s">%s</a>' % (z, n) for n, z in pfad)
    spreiz = ''.join('<span>%s</span>' % w for w in worte)
    return '''  <section class="seitenkopf">
    <div class="feld" data-feld data-zelle="8"><canvas aria-hidden="true"></canvas></div>
    <div class="seitenkopf-innen">
      <nav class="pfad etikett" aria-label="Brotkrumen">%s</nav>
      <p class="etikett spreiz spreiz-links">%s</p>
      <h1 class="gross">%s</h1>
      <p class="lauftext">%s</p>
    </div>
  </section>''' % (krumen, spreiz, titel, text)


def k(inhalt, spanne=12, art=''):
    return '<div class="k ein s%d%s">%s</div>' % (spanne, ' ' + art if art else '', inhalt)


def k_bild(name, alt, spanne=6):
    return '<figure class="k k-bild ein s%d">%s</figure>' % (spanne, bild(name, alt))


def haken(punkte):
    return '<ul class="haken">' + ''.join('<li>%s</li>' % p for p in punkte) + '</ul>'


def abschnitt(etikett, titel, inhalt, klasse=''):
    kopfzeile = ''
    if titel:
        kopfzeile = '<div class="abschnittskopf"><p class="etikett etikett-punkt">%s</p><h2 class="ein">%s</h2></div>' % (etikett, titel)
    return '  <section class="abschnitt%s">%s%s</section>' % (' ' + klasse if klasse else '', kopfzeile, inhalt)


# ------------------------------------------------------------------ Leistungen

LEISTUNGEN = [
    dict(slug='elektroinstallation', nr='01', name='Elektroinstallation', kurz='Neuinstallation in Rohbau, Wohnhaus und Betrieb. Verteiler, KNX, Sprechanlagen, Beleuchtung.',
         worte=['Rohbau', 'Haus', 'Betrieb'], titel='Elektro&shy;<em>installation</em>',
         text='Neuinstallation, Erweiterung oder Prüfung einer vorhandenen Anlage: Wir begleiten Sie von der Planung bis zur Ausführung.',
         bloecke=[('Rohbau, Haus, Betrieb', ['Wir installieren in Rohbauten, Wohnhäusern und Betrieben. Zu unseren Auftraggebern gehören Privatkunden ebenso wie Hausverwaltungen, Büros und Produktionsbetriebe.',
                                              'Dazu kommen die kleineren Aufträge: Fehlersuche, Reparaturen und die Wartung bestehender Verteiler.']),
                  ('Smart Home mit KNX', ['Mit einem KNX-Bussystem lassen sich Schalter frei belegen. Licht, Jalousien, Heizung und Alarmanlage werden gemeinsam gesteuert, auf Wunsch auch aus der Ferne.',
                                          'Wir beraten Sie, welche Ausstattung zu Ihrem Bedarf und Ihrem Budget passt.'])],
         liste=('Unser Installationsangebot', ['Elektro-Neuinstallation in Rohbau, Haus und Betrieb', 'Verteileranlagen', 'EIB/KNX-Bussystem', 'Sprechanlagen', 'EDV-Netzwerke', 'Alarmsysteme', 'Notbeleuchtung', 'Beleuchtung und Sicherheitsbeleuchtung']),
         bilder=[('referenz-25', 'Unterverteilung in einer Wandnische'), ('pendelleuchten', 'Montierte Pendelleuchten in einem Wohnraum'), ('sprechanlage1', 'Außenstation einer Sprechanlage mit Kamera'), ('treppenbeleuchtung', 'Treppenbeleuchtung mit eingelassenen Spots')]),
    dict(slug='ladeinfrastruktur', nr='02', name='Ladeinfrastruktur', kurz='Wallbox-Installation. Vorher prüfen wir Ihre Anlage und passen sie an.',
         worte=['Wallbox', 'zu Hause', 'im Betrieb'], titel='Lade&shy;<em>infrastruktur</em>',
         text='Wir installieren Ihre Wallbox, zu Hause wie im Betrieb. Davor prüfen wir, ob Ihre Elektroinstallation dafür ausgelegt ist.',
         bloecke=[('Erst prüfen, dann montieren', ['Eine Wallbox belastet die Anlage über Stunden. Deshalb sehen wir uns zuerst Hausanschluss, Verteilung und Zuleitung an.',
                                                   'Reicht die vorhandene Installation nicht aus, passen wir sie an. Erst danach wird die Wallbox montiert und angeschlossen.'])],
         liste=('So gehen wir vor', ['Prüfung der vorhandenen Elektroinstallation', 'Anpassung von Verteilung und Zuleitung, wo nötig', 'Montage und Anschluss der Wallbox', 'Für Wohnhäuser und Betriebe']),
         bilder=[('bild4-4', 'Beratungsgespräch zur Ladeinfrastruktur an einem Tisch')]),
    dict(slug='blitzschutz', nr='03', name='Blitz- und Überspannungsschutz', kurz='Blitzschutzanlagen, Erdung und Überspannungsschutz.',
         worte=['Blitzschutz', 'Erdung', 'Überspannung'], titel='Blitz- und <em>Über&shy;spannungs&shy;schutz</em>',
         text='Ein Blitzschlag gefährdet das Gebäude und jedes Gerät, das am Stromkreis hängt. Eine Blitzschutzanlage mit Erdung und Überspannungsschutz begrenzt den Schaden.',
         bloecke=[('Überspannungen', ['Überspannungen sind Spannungsimpulse, die nur für Sekundenbruchteile auftreten. Auslöser sind direkte, nahe oder ferne Blitzeinschläge und Schalthandlungen im Netz.',
                                      'Sie werden häufig unterschätzt, weil man sie nicht bemerkt, bis ein Gerät ausfällt.']),
                  ('Direkte und nahe Einschläge', ['Ein Blitz kann in das Gebäude, in die unmittelbare Umgebung oder in eine eingeführte Leitung einschlagen: Stromversorgung, Telefon oder Daten.',
                                                   'Der Blitzstrom hebt das Potenzial an allen geerdeten Geräten um mehrere 100.000 Volt an. Das ist die stärkste Beanspruchung, die eine elektrische Anlage im Gebäude treffen kann.',
                                                   'Zusätzlich induziert das elektromagnetische Feld des Blitzes Überspannungen in der Gebäudeanlage. Ihre Energie ist geringer, für empfindliche Elektronik reicht sie aber aus.'])],
         liste=('Was wir ausführen', ['Blitzschutzanlagen', 'Erdungsanlagen', 'Überspannungsschutz für Stromversorgung, Telekommunikation und Daten']),
         bilder=[('referenz-38', 'Monteur bei Arbeiten auf einem Dach'), ('bild6-6', 'Flachdach mit Lichtkuppeln'), ('bild7-7', 'Dachfläche im Winter')]),
    dict(slug='netzwerktechnik', nr='04', name='Netzwerk- und IT-Infrastruktur', kurz='Strukturierte Gebäudeverkabelung, gemessen und dokumentiert.',
         worte=['Verkabelung', 'Messung', 'Dokumentation'], titel='Netzwerk- und <em>IT-Infrastruktur</em>',
         text='Eine strukturierte Verkabelung ist ein einheitlicher Aufbauplan für das Netzwerk eines Gebäudes. Sprache und Daten laufen über dieselbe Infrastruktur.',
         bloecke=[('Ein Netz für mehrere Jahre', ['Eine strukturierte Verkabelung wird für die Anforderungen mehrerer Jahre geplant und enthält Reserven. Sie ist unabhängig davon, welche Anwendung später darauf läuft.',
                                                  'Üblich ist, dieselbe Verkabelung für das lokale Netzwerk und die Telefonie zu nutzen. Das vermeidet teure Fehlinstallationen und erleichtert jede Erweiterung.'])],
         liste=('Ziele einer strukturierten Verkabelung', ['Unterstützung heutiger und künftiger Kommunikationssysteme', 'Kapazitätsreserve bei der Grenzfrequenz', 'Neutral gegenüber Übertragungsprotokoll und Endgeräten', 'Flexibel erweiterbar', 'Ausfallsicher durch sternförmige Verkabelung', 'Datenschutz und Datensicherheit realisierbar', 'Einhaltung der geltenden Standards', 'Standardisierte Mess-, Prüf- und Dokumentationsverfahren']),
         bilder=[('bild-18', 'Patchfeld mit farbig sortierten Netzwerkleitungen'), ('bild-09', 'Rangierfeld einer strukturierten Verkabelung'), ('bild-01', 'Arbeiten an einem Serverschrank'), ('netzwerkschrank', 'Netzwerkverteilung in einem Serverraum')]),
    dict(slug='verteilerbau', nr='05', name='Verteiler- und Schaltschrankbau', kurz='Planung in EPLAN, typgeprüft nach VDE. Jeder Schrank wird vor Auslieferung geprüft.',
         worte=['Planen', 'Fertigen', 'Montieren'], titel='Verteiler- und <em>Schalt&shy;schrank&shy;bau</em>',
         text='Wir planen, fertigen und montieren Verteileranlagen und installieren die zugehörigen Steuerungen, von der Heizung über die Jalousie bis zur Torsteuerung.',
         bloecke=[('Schaltschränke nach Anforderung', ['Wir konstruieren und bauen Schaltschränke in unterschiedlichen Bauformen, nach Ihren Anforderungen und Betriebsnormen. Geplant wird in EPLAN.',
                                                       'Jeder Schaltschrank wird vor der Auslieferung nach den einschlägigen nationalen und internationalen Normen geprüft.']),
                  ('Sanieren statt ersetzen', ['Bestehende Verteiler sanieren und modernisieren wir, wo das möglich ist.',
                                               'Auf Wunsch übernehmen wir die ganze Kette: Planung, Bau des Schaltschranks und Ausführung der elektrischen Anlage.'])],
         liste=('Bauformen', ['Typgeprüfte Schaltanlagenkombinationen nach VDE', 'Wandler- und Zählerverteiler, vom Einfamilienhaus bis zur Firmeneinspeisung', 'Motor Control Center', 'Steuerverteiler']),
         bilder=[('schaltschrank', 'Geöffneter Schaltschrank mit Zählerfeldern'), ('bild8-8', 'Verteilerschränke in einem Technikraum'), ('bild10-10', 'Zählerverteiler im Hausanschlussraum'), ('bild-04', 'Verteiler mit beschrifteten Abgängen')]),
    dict(slug='antennentechnik', nr='06', name='Antennen- und Empfangstechnik', kurz='TV- und SAT-Anlagen.',
         worte=['TV', 'SAT', 'Montage'], titel='Antennen- und <em>Empfangs&shy;technik</em>',
         text='Wir planen und montieren TV- und SAT-Anlagen, von der Wahl des Montageplatzes bis zum fertigen Empfang.',
         bloecke=[('Die Montage entscheidet', ['Für guten Empfang zählt die genaue Ausrichtung mehr als das Modell. Wir beraten Sie zum Montageplatz und führen die Arbeiten anschließend aus.',
                                               'Wir liefern und installieren die gesamte Anlage.'])],
         liste=('Was dazugehört', ['Beratung zum Montageplatz', 'Lieferung der Anlage', 'Montage und Ausrichtung', 'Verteilung im Gebäude']),
         bilder=[('bild-12', 'Satellitenschüssel auf einem Ziegeldach'), ('multimedia-schrank-03', 'Multimediaverteiler mit Netzwerk- und Antennentechnik')]),
    dict(slug='pruefung-wartung', nr='07', name='Prüfung und Wartung', kurz='Sicherheitsprüfung von Anlagen und Geräten, mit Prüfprotokoll.',
         worte=['Prüfen', 'Protokoll', 'Wartung'], titel='Prüfung und <em>Wartung</em>',
         text='Wir prüfen die Sicherheit Ihrer elektrischen Anlage und Ihrer Geräte. Was wir finden, halten wir in einem Prüfprotokoll fest.',
         bloecke=[('Warum geprüft wird', ['Auch in Installationen, die auf den ersten Blick in Ordnung sind, finden wir bei Prüfungen immer wieder gravierende Fehler.',
                                          'Viele dieser Mängel lassen sich mit kleinen Änderungen beheben, bevor etwas passiert.']),
                  ('Das Prüfprotokoll', ['Nach der Prüfung erhalten Sie ein elektrotechnisches Sicherheitsprotokoll. Es dokumentiert den Zustand der Anlage und die festgestellten Mängel.'])],
         liste=('Wir prüfen Anlagen und Geräte in', ['Wohnhäusern', 'Gewerbebetrieben', 'Geschäftslokalen', 'Gastronomieobjekten', 'landwirtschaftlichen Objekten', 'Schulen und öffentlichen Objekten']),
         bilder=[('installation-wohnung-65', 'Wohnungsverteiler mit Prüfprotokoll an der Innenseite der Tür'), ('bild8-8', 'Verteilerschränke in einem Technikraum'), ('bild10-10', 'Zählerverteiler im Hausanschlussraum')]),
    dict(slug='photovoltaik', nr='08', name='Photovoltaik', kurz='Beratung, Planung und Installation. Schwerpunkt Großanlagen für Industrie und Gewerbe.',
         worte=['Beratung', 'Planung', 'Installation'], titel='Photo<em>voltaik</em>',
         text='Beratung, Planung und Installation aus einem Betrieb. Der Schwerpunkt liegt auf Großanlagen für Industrie und Gewerbe.',
         bloecke=[('Schwerpunkt Gewerbe und Industrie', ['Wir setzen Photovoltaik-Großanlagen für Industrie- und Gewerbekunden um. Jedes Dach und jeder Betrieb stellt andere Anforderungen, deshalb entsteht für jede Anlage ein eigenes Konzept.',
                                                         'Nach der Planung organisieren wir die komplette Umsetzung.'])],
         liste=('Unser Umfang', ['Beratung', 'Planung und Konzept der Anlage', 'Installation', 'Organisation der gesamten Umsetzung']),
         bilder=[('photovoltaik-dach', 'Photovoltaikmodule auf einem Ziegeldach'), ('baustelle-geruest', 'Baustelle mit Gerüst und Bauschild'), ('wechselrichter', 'Wechselrichter einer Photovoltaikanlage'), ('img-1906', 'Batteriespeicher in einem Technikraum')]),
]


def leistungskachel(l, spanne=3):
    return ('<div class="k k-link ein s%d"><span class="nr">%s</span><h3><a href="/leistungen/%s/">%s</a></h3><p>%s</p>%s</div>'
            % (spanne, l['nr'], l['slug'], l['name'], l['kurz'], PFEIL))


def baue_leistungen():
    kacheln = ''.join(leistungskachel(l) for l in LEISTUNGEN)
    inhalt = seitenkopf([('Leistungen', '/leistungen/')], ['Acht', 'Bereiche', 'ein', 'Betrieb'], 'Unsere <em>Leistungen</em>',
                        'Planung, Ausführung und Prüfung liegen in einem Betrieb. Wählen Sie den Bereich, um den es geht.')
    inhalt += '\n' + abschnitt('Übersicht', '', '<div class="bento">%s</div>' % kacheln)
    inhalt += '\n' + abschnitt('Außerdem', 'Was sonst noch <em>anfällt</em>', '<div class="bento">%s%s%s</div>' % (
        k('<h3>Kleinere Aufträge</h3><p>Nicht jeder Auftrag ist ein Projekt. Wir kommen auch für die Arbeiten, die zwischen zwei Baustellen liegen.</p>'
          + haken(['Fehlersuche', 'Reparaturen', 'Wartung von Verteilersystemen', 'Licht- und Kraftinstallationen', 'Video- und Netzwerkverkabelung', 'Anlagenwartung']), 7),
        k_bild('baustelle-3', 'Verlegearbeiten auf einer Rohbaudecke', 5),
        k('<h3>Für wen wir arbeiten</h3><p>Privatkunden, Hausverwaltungen, Büros, Gewerbe, Produktion und Industrie. Im Großraum München, im angrenzenden Bayern und in Österreich.</p><p>%s</p>'
          % knopf('Anfrage stellen', '/kontakt/'), 12, 'k-rot')))
    seite('leistungen', 'Leistungen · Mat-Elektrotechnik GmbH',
          'Elektroinstallation, Ladeinfrastruktur, Blitzschutz, Netzwerktechnik, Verteilerbau, Antennentechnik, Prüfung und Photovoltaik aus einem Meisterbetrieb in Germering.',
          inhalt, '/leistungen/')

    for i, l in enumerate(LEISTUNGEN):
        inhalt = seitenkopf([('Leistungen', '/leistungen/'), (l['name'], '/leistungen/%s/' % l['slug'])], l['worte'], l['titel'], l['text'])
        teile = ''
        bilder = list(l['bilder'])
        erster = l['bloecke'][0]
        teile += k('<h2>%s</h2>%s' % (erster[0], ''.join('<p>%s</p>' % p for p in erster[1])), 7)
        teile += k_bild(bilder[0][0], bilder[0][1], 5)
        teile += k('<h3>%s</h3>%s' % (l['liste'][0], haken(l['liste'][1])), 5, 'k-dunkel')
        if len(l['bloecke']) > 1:
            zweiter = l['bloecke'][1]
            teile += k('<h2>%s</h2>%s' % (zweiter[0], ''.join('<p>%s</p>' % p for p in zweiter[1])), 7)
        elif len(bilder) > 1:
            teile += k_bild(bilder[1][0], bilder[1][1], 7)
            bilder = [bilder[0]] + bilder[2:]
        else:
            teile += k('<h2>Sprechen wir darüber</h2><p>Schildern Sie uns kurz, worum es geht und wo das Objekt liegt. Wir melden uns bei Ihnen.</p><p>%s</p>' % knopf('Anfrage stellen', '/kontakt/'), 7)
        inhalt += '\n' + abschnitt('', '', '<div class="bento">%s</div>' % teile)
        rest = bilder[1:]
        if rest:
            spanne = {1: 12, 2: 6, 3: 4}[len(rest)]
            inhalt += '\n' + abschnitt('Aus unserer Arbeit', 'Beispiele aus <em>Projekten</em>',
                                       '<div class="bento">%s</div>' % ''.join(k_bild(n, a, spanne) for n, a in rest))
        andere = [LEISTUNGEN[(i + d) % len(LEISTUNGEN)] for d in (1, 2, 3)]
        inhalt += '\n' + abschnitt('Weiter', 'Weitere <em>Leistungen</em>',
                                   '<div class="bento">%s%s</div>' % (''.join(leistungskachel(a, 3) for a in andere),
                                                                     '<div class="k k-link k-rot ein s3"><span class="nr">Alle</span><h3><a href="/leistungen/">Alle acht Bereiche</a></h3><p>Zur Übersicht der Leistungen.</p>%s</div>' % PFEIL))
        seite('leistungen/' + l['slug'], '%s · Mat-Elektrotechnik GmbH' % l['name'], l['text'], inhalt, '/leistungen/')


# ------------------------------------------------------------------ Unternehmen

TEAM = [('miodrag-manojlovic', 'Miodrag Manojlovic', 'Geschäftsführer, Elektrotechnikermeister'),
        ('andjelina-manojlovic', 'Andjelina Manojlovic', 'Assistenz der Geschäftsführung'),
        ('srdjana-tomasic', 'Srdjana Tomasic', 'Projektmanagerin'),
        ('borislav-terzic', 'Borislav Terzic', 'Obermonteur'),
        ('andreja-sulejic', 'Andreja Sulejic', 'Obermonteur'),
        ('sadik-sadiku', 'Sadik Sadiku', 'Monteur'),
        ('mohammad-nimrozi', 'Mohammad Nimrozi', 'Monteur'),
        ('ahmed-demic', 'Ahmed Demic', 'Monteur'),
        ('muhamed-demic', 'Muhamed Demic', 'Monteur'),
        ('drazen-valcic', 'Drazen Valcic', 'Monteur'),
        ('veljko-stefanovic', 'Veljko Stefanovic', 'Auszubildender'),
        ('johannes-burger', 'Johannes Burger', 'Auszubildender'),
        ('rahim-hosseini', 'Rahim Hosseini', 'Auszubildender')]


def baue_unternehmen():
    inhalt = seitenkopf([('Unternehmen', '/unternehmen/')], ['Wer', 'wir', 'sind'], 'Meister&shy;betrieb seit <em>2010</em>',
                        'Mat-Elektrotechnik ist ein Elektro-Meisterbetrieb in Germering bei München. Gegründet als Einzelunternehmen, heute eine GmbH mit eigenem Team und eigener Ausbildung.')
    inhalt += '\n' + abschnitt('', '', '<div class="bento">%s%s%s%s%s%s</div>' % (
        k('<h2>Wie es begann</h2><p>2010 gründete Miodrag Manojlovic den Betrieb als Einzelunternehmen. Die Aufträge wurden mehr und größer, das Team wuchs mit. Seit 2019 ist Mat-Elektrotechnik eine GmbH.</p>'
          '<p>Der Name geht auf die frühere Firmierung zurück: Manojlovic Anlagen Technik.</p>'
          '<p>Miodrag Manojlovic führt den Betrieb als Geschäftsführer und Elektrotechnikermeister. Zum Team gehören Projektleitung, Obermonteure, Monteure und Auszubildende.</p>', 7),
        k_bild('team-hof', 'Mitarbeiter neben einem roten Firmenbus vor dem Betriebsgebäude', 5),
        k('<p class="zahl">2010</p><p>Gründung als Einzelunternehmen</p>', 3),
        k('<p class="zahl">2019</p><p>Eintragung als GmbH beim Amtsgericht München</p>', 3),
        k('<p class="zahl">2023</p><p>Markenpreis ELMAR, Kategorie 1</p>', 3, 'k-rot'),
        k('<p class="zahl">8</p><p>Leistungsbereiche, von der Installation bis zur Photovoltaik</p>', 3)))
    team = ''.join('<figure class="ein">%s<figcaption><b>%s</b><span>%s</span></figcaption></figure>' % (bild('team/' + d, 'Porträt von ' + n), n, r) for d, n, r in TEAM)
    inhalt += '\n' + abschnitt('Team', 'Ihre <em>Ansprechpartner</em>', '<div class="team">%s</div>' % team)
    inhalt += '\n' + abschnitt('Auszeichnung', 'ELMAR <em>2023</em>', '<div class="bento">%s%s%s</div>' % (
        k('<h3>Markenpreis der Elektrobranche</h3><p>Am 7. Dezember 2023 wurde Mat-Elektrotechnik mit dem ELMAR 2023 in Kategorie 1 ausgezeichnet. Verliehen wird der Preis von „Elektromarken. Starke Partner.“</p>', 5),
        k_bild('elmar-2023', 'Übergabe des ELMAR-Preises auf der Bühne', 4),
        k_bild('elmar-foto', 'Zwei Personen vor der Sponsorenwand der ELMAR-Verleihung', 3)))
    inhalt += '\n' + abschnitt('Kunden', 'Für wen wir <em>arbeiten</em>', '<div class="bento">%s%s%s%s</div>' % (
        k('<h3>Privatkunden</h3><p>Neuinstallation, Sanierung alter Verteilungen, Wallbox, Beleuchtung und Sprechanlagen.</p>', 3),
        k('<h3>Hausverwaltungen</h3><p>Prüfung und Wartung, Fehlersuche, Sprech- und Antennenanlagen in Wohnanlagen.</p>', 3),
        k('<h3>Büro und Gewerbe</h3><p>Netzwerkverkabelung, Licht- und Kraftinstallation, Notbeleuchtung und Alarmsysteme.</p>', 3),
        k('<h3>Produktion und Industrie</h3><p>Schaltschrankbau, Steuerverteiler, Blitzschutz und Photovoltaik-Großanlagen.</p>', 3)))
    inhalt += '\n' + abschnitt('Weiter', '', '<div class="bento">%s%s%s</div>' % (
        '<div class="k k-link ein s4"><span class="nr">01</span><h3><a href="/leistungen/">Leistungen</a></h3><p>Die acht Bereiche im Überblick.</p>%s</div>' % PFEIL,
        '<div class="k k-link ein s4"><span class="nr">02</span><h3><a href="/referenzen/">Referenzen</a></h3><p>Kundenstimmen und Fotos aus Projekten.</p>%s</div>' % PFEIL,
        '<div class="k k-link ein s4"><span class="nr">03</span><h3><a href="/karriere/">Karriere</a></h3><p>Offene Stellen und Ausbildung.</p>%s</div>' % PFEIL))
    seite('unternehmen', 'Unternehmen · Mat-Elektrotechnik GmbH',
          'Mat-Elektrotechnik: Elektro-Meisterbetrieb in Germering, 2010 gegründet von Miodrag Manojlovic, seit 2019 GmbH. Team, Geschichte und Auszeichnung.',
          inhalt, '/unternehmen/')


# ------------------------------------------------------------------ Karriere

STELLEN = ['Elektroinstallateur (m/w/d)', 'Projektleiter / Elektromeister (m/w/d)',
           'Auszubildender zum Elektroniker für Energie- und Gebäudetechnik (m/w/d)']


def baue_karriere():
    inhalt = seitenkopf([('Karriere', '/karriere/')], ['Arbeiten', 'bei', 'Mat'], 'Kommen Sie ins <em>Team</em>',
                        'Wir suchen Menschen, die ihr Handwerk können und den Kontakt mit Kunden mögen. Kein Projekt gleicht dem anderen.')
    stellen = ''.join('<li class="ein"><span class="nr">%02d</span><h3>%s</h3><a class="knopf" href="mailto:%s?subject=%s">Bewerben %s</a></li>'
                      % (i + 1, s, MAIL, e('Bewerbung: ' + s).replace(' ', '%20'), SCHRAEG) for i, s in enumerate(STELLEN))
    inhalt += '\n' + abschnitt('', '', '<div class="bento">%s%s</div>' % (
        k('<h2>Was Sie bei uns erwartet</h2><p>Sie arbeiten an Elektroinstallationen, Verteilerbau, Netzwerktechnik, Blitzschutz und Photovoltaik. Die Baustellen reichen vom Einfamilienhaus bis zum Industriebetrieb.</p>'
          '<p>Wir bilden selbst aus und schulen unser Team laufend weiter.</p>', 7),
        k_bild('team-studio', 'Sieben Mitarbeiter von Mat-Elektrotechnik in Arbeitskleidung', 5)))
    inhalt += '\n' + abschnitt('Offene Stellen', 'Wen wir <em>suchen</em>', '<ol class="stellen">%s</ol>' % stellen)
    inhalt += '\n' + abschnitt('', '', '<div class="bento">%s</div>' % k(
        '<h2>So bewerben Sie sich</h2><p>Schreiben Sie uns eine E-Mail oder rufen Sie an. Ein kurzer Lebenslauf genügt für den Anfang.</p>'
        '<p class="knopfzeile"><a class="knopf" href="mailto:%s?subject=Bewerbung">%s %s</a> <a class="knopf" href="%s">%s %s</a></p>'
        % (MAIL, MAIL, SCHRAEG, TEL_LINK, TEL, SCHRAEG), 12, 'k-rot'))
    seite('karriere', 'Karriere · Mat-Elektrotechnik GmbH',
          'Offene Stellen bei Mat-Elektrotechnik in Germering: Elektroinstallateur, Projektleiter und Ausbildung zum Elektroniker für Energie- und Gebäudetechnik.',
          inhalt, '/karriere/')


# ------------------------------------------------------------------ Referenzen

STIMMEN = [
    ('Hauptverteilung', 'Wallbox', 'Wir haben eine über 50 Jahre alte Hauptverteilung im Keller auf den aktuellen Stand inkl. Aufbau einer Wallbox-Stromversorgung durchführen lassen. Vom ersten Vorgespräch, über die Planung und bis zur Ausführung der Arbeiten bin ich sehr zufrieden! Hier fühlt man sich rundum sorglos betreut.', 'Thomas Fuchsbichler'),
    ('Stromversorgung', 'Erneuerung', 'Die Firma MAT-Elektrotechnik haben wir anhand der vorherigen guten Bewertungen und der Ortsnähe ausgewählt. Die Mitarbeiter sind sehr freundlich, super zuverlässig und vor allem kompetent. Alles wurde schnell und sauber installiert und das alles zu einem sehr fairen Preis.', 'Margit Riepertinger'),
    ('Sanierung', 'Komplett', 'Wir haben komplett neu saniert und alles musste neu gemacht werden, auch die Elektrik. Super kompetente Beratung mit viel Engagement. Wir haben uns jederzeit gut betreut gefühlt und es war immer jemand erreichbar!', 'Kerstin Dausel'),
    ('Ausführung', 'Privat', 'Sehr professionell, freundlicher Kontakt, alle Arbeiten zur vollsten Zufriedenheit ausgeführt, gerne wieder!', 'Florian Bogner'),
    ('Zusammenarbeit', 'Langjährig', 'Sehr kompetent und absolut zuverlässig. Nettes Team und absolut empfehlenswert. Die Arbeit wurde immer sauber erledigt. Deshalb arbeiten wir schon viele Jahre zusammen.', 'Thomas Fischer'),
    ('Projektierung', 'Ausführung', 'Schnelle unkomplizierte Projektierung, zeitnahe mängelfreie Ausführung, nur zu empfehlen!', 'M. Urban'),
]

GALERIE = [
    ('Verteiler und Schaltschränke', [('schaltschrank', 'Schaltschrank mit Zählerfeldern'), ('bild-04', 'Verteiler mit beschrifteten Abgängen'), ('bild10-10', 'Zählerverteiler im Hausanschlussraum'), ('referenz-25', 'Unterverteilung in einer Wandnische'), ('installation-wohnung-65', 'Wohnungsverteiler mit Prüfprotokoll an der Innenseite'), ('bild8-8', 'Verteilerschränke in einem Technikraum')]),
    ('Netzwerk', [('bild-18', 'Patchfeld mit farbig sortierten Netzwerkleitungen'), ('bild-09', 'Rangierfeld einer strukturierten Verkabelung'), ('bild-01', 'Arbeiten an einem Serverschrank'), ('netzwerkschrank', 'Netzwerkverteilung in einem Serverraum'), ('multimedia-schrank-03', 'Multimediaverteiler mit Netzwerk- und Antennentechnik')]),
    ('Licht', [('treppenbeleuchtung', 'Treppenbeleuchtung mit eingelassenen Spots'), ('treppenspots-09', 'Stufenbeleuchtung in einem Treppenhaus'), ('kuechen-beleuchtung', 'Küchenbeleuchtung mit Unterschrankleuchten'), ('led-beleuchtung', 'Indirekte LED-Beleuchtung in einem Flur'), ('pendelleuchten', 'Montierte Pendelleuchten in einem Wohnraum'), ('beleuchtung-2', 'Wandleuchten mit Lichtkegel nach oben und unten'), ('beleuchtung-4', 'Beleuchteter Flur mit Deckenleuchte'), ('beleuchtung3', 'Indirekte Beleuchtung einer Wandnische'), ('schlafzimmer-beleuchtung', 'Indirekte Deckenbeleuchtung im Schlafzimmer'), ('referenz-34', 'Wandfluter in einem Innenraum'), ('referenz-50', 'Küchenzeile mit Arbeitsplatzbeleuchtung'), ('referenz-13', 'Außenleuchte an einer Natursteinwand'), ('installation-terrassenbeleuchtung', 'Terrassenbeleuchtung an einer Dachkante'), ('bild-10', 'Wegebeleuchtung mit Pollerleuchten bei Dämmerung'), ('referenz-14', 'Beleuchteter Flur mit Blick in den Garten')]),
    ('Sprechanlagen', [('sprechanlage', 'Innenstation einer Video-Sprechanlage'), ('sprechanlage1', 'Außenstation einer Sprechanlage mit Kamera')]),
    ('Photovoltaik', [('photovoltaik-dach', 'Photovoltaikmodule auf einem Ziegeldach'), ('baustelle-geruest', 'Baustelle mit Gerüst und Bauschild'), ('wechselrichter', 'Wechselrichter einer Photovoltaikanlage'), ('img-1906', 'Batteriespeicher in einem Technikraum')]),
    ('Dach und Baustelle', [('referenz-38', 'Monteur bei Arbeiten auf einem Dach'), ('bild-12', 'Satellitenschüssel auf einem Ziegeldach'), ('bild6-6', 'Flachdach mit Lichtkuppeln'), ('bild7-7', 'Dachfläche im Winter'), ('baustelle-3', 'Verlegearbeiten auf einer Rohbaudecke'), ('referenz-46', 'Erdarbeiten für eine Außeninstallation')]),
]


def baue_referenzen():
    inhalt = seitenkopf([('Referenzen', '/referenzen/')], ['Stimmen', 'und', 'Projekte'], 'Unsere <em>Referenzen</em>',
                        'Was Kunden nach dem Auftrag sagen, und Fotos von Anlagen, die wir geplant und gebaut haben.')
    stimmen = ''.join('<li class="ein"><p class="zeile etikett"><span class="etikett-punkt">%s</span><span>%s</span></p><blockquote>„%s“</blockquote><cite>%s</cite></li>'
                      % (a, b, t, n) for a, b, t, n in STIMMEN)
    inhalt += '\n  <section class="stimmen stimmen-seite"><div class="abschnittskopf"><p class="etikett etikett-punkt">Kundenstimmen</p><h2 class="ein">Nach dem <em>Auftrag</em></h2></div><ul>%s</ul></section>' % stimmen
    for titel, fotos in GALERIE:
        inhalt += '\n' + abschnitt('Projektfotos', titel, '<div class="galerie">%s</div>' % ''.join(
            '<figure class="ein">%s<figcaption>%s</figcaption></figure>' % (bild(n, a), a) for n, a in fotos))
    seite('referenzen', 'Referenzen · Mat-Elektrotechnik GmbH',
          'Kundenstimmen und Projektfotos von Mat-Elektrotechnik: Verteiler, Netzwerktechnik, Beleuchtung, Sprechanlagen und Photovoltaik.',
          inhalt, '/referenzen/')


# ------------------------------------------------------------------ Kontakt

def baue_kontakt():
    inhalt = seitenkopf([('Kontakt', '/kontakt/')], ['Anrufen', 'Schreiben', 'Vorbeikommen'], 'So erreichen Sie <em>uns</em>',
                        'Schildern Sie uns kurz, worum es geht und wo das Objekt liegt. Fotos vom Zählerschrank oder ein Plan helfen bei der Einschätzung.')
    optionen = ''.join('<option>%s</option>' % l['name'] for l in LEISTUNGEN) + '<option>Reparatur oder Fehlersuche</option><option>Etwas anderes</option>'
    formular = '''<form class="formular" data-anfrage>
        <h2>Anfrage</h2>
        <p>Das Formular öffnet Ihr E-Mail-Programm mit einer vorbereiteten Nachricht. Erst wenn Sie dort auf Senden drücken, erreicht uns Ihre Anfrage.</p>
        <div class="felder">
          <label>Name <input type="text" name="name" autocomplete="name" required></label>
          <label>Telefon <input type="tel" name="telefon" autocomplete="tel"></label>
          <label>Ort des Objekts <input type="text" name="ort" autocomplete="address-level2"></label>
          <label>Anliegen <select name="anliegen">%s</select></label>
          <label class="breit">Nachricht <textarea name="nachricht" rows="6" required></textarea></label>
        </div>
        <button class="knopf" type="submit">E-Mail vorbereiten %s</button>
      </form>''' % (optionen, SCHRAEG)
    inhalt += '\n' + abschnitt('', '', '<div class="bento">%s%s%s%s%s</div>' % (
        k('<p class="etikett etikett-punkt">Telefon</p><p class="zahl"><a href="%s">%s</a></p><p>Montag bis Freitag</p>' % (TEL_LINK, TEL), 6, 'k-rot'),
        k('<p class="etikett etikett-punkt">E-Mail</p><p class="zahl klein"><a href="mailto:%s">%s</a></p><p>Für Anfragen, Pläne und Fotos</p>' % (MAIL, MAIL), 6),
        k(formular, 7),
        k('<p class="etikett etikett-punkt">Anschrift</p><h3>Mat-Elektrotechnik GmbH</h3><p>Industriestraße 12<br>82110 Germering</p><p>%s</p>' % knopf('Route planen', KARTE, schraeg=True)
          + '<p class="etikett etikett-punkt" style="margin-top:1.5rem">Einzugsgebiet</p><p>Großraum München, angrenzendes Bayern und Österreich.</p>'
          + '<p class="etikett etikett-punkt" style="margin-top:1.5rem">Facebook</p><p><a href="https://www.facebook.com/MAT.Elektrotechnik/" rel="noopener">facebook.com/MAT.Elektrotechnik</a></p>', 5),
        k_bild('team-hof', 'Betriebsgebäude in der Industriestraße 12 mit Firmenfahrzeugen', 12)))
    seite('kontakt', 'Kontakt · Mat-Elektrotechnik GmbH',
          'Mat-Elektrotechnik GmbH, Industriestraße 12, 82110 Germering. Telefon 089 23750352, E-Mail info@mat-elektrotechnik.de.',
          inhalt, '/kontakt/')


# ------------------------------------------------------------------ Recht

def offen(text):
    return '<mark class="offen">Angabe fehlt: %s</mark>' % text


def baue_recht():
    impressum = '''<h2>Angaben gemäß § 5 DDG</h2>
      <p>Mat-Elektrotechnik GmbH<br>Industriestraße 12<br>82110 Germering</p>
      <h2>Vertreten durch</h2>
      <p>Geschäftsführer: Miodrag Manojlovic</p>
      <h2>Kontakt</h2>
      <p>Telefon: <a href="%s">+49 89 23750352</a><br>E-Mail: <a href="mailto:%s">%s</a></p>
      <h2>Registereintrag</h2>
      <p>Registergericht: Amtsgericht München<br>Registernummer: HRB 246899</p>
      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE 323 580 611</p>
      <h2>Berufsbezeichnung und berufsrechtliche Regelungen</h2>
      <p>Berufsbezeichnung: Elektrotechnikermeister, verliehen in Deutschland<br>Zuständige Kammer: Handwerkskammer für München und Oberbayern<br>Eintragung in die Handwerksrolle: %s</p>
      <p>Es gelten die Handwerksordnung und die einschlägigen Vorschriften des Elektrotechniker-Handwerks.</p>
      <h2>Berufshaftpflichtversicherung</h2>
      <p>%s</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>%s</p>
      <h2>Haftung für Inhalte und Links</h2>
      <p>Die Inhalte dieser Seiten wurden mit Sorgfalt erstellt. Für die Inhalte verlinkter fremder Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
      <h2>Umsetzung</h2>
      <p>webgipfel</p>''' % (TEL_LINK, MAIL, MAIL, offen('Nummer in der Handwerksrolle'), offen('Versicherer und räumlicher Geltungsbereich'),
                              offen('Erklärung nach § 36 VSBG, ob die GmbH an Streitbeilegungsverfahren teilnimmt'))
    inhalt = seitenkopf([('Impressum', '/impressum/')], ['Rechtliche', 'Angaben'], '<em>Impressum</em>',
                        'Entwurf. Alle Angaben müssen vor der Veröffentlichung vom Unternehmen gegengezeichnet werden.')
    inhalt += '\n' + abschnitt('', '', '<div class="bento"><div class="k s12 recht">%s</div></div>' % impressum)
    seite('impressum', 'Impressum · Mat-Elektrotechnik GmbH', 'Impressum der Mat-Elektrotechnik GmbH, Germering.', inhalt)

    datenschutz = '''<h2>1. Verantwortlicher</h2>
      <p>Mat-Elektrotechnik GmbH, Industriestraße 12, 82110 Germering<br>Telefon: +49 89 23750352, E-Mail: <a href="mailto:%s">%s</a></p>
      <h2>2. Aufruf der Website</h2>
      <p>Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch notwendige Daten: IP-Adresse, Zeitpunkt des Abrufs, abgerufene Adresse, übertragene Datenmenge sowie Browser und Betriebssystem. Die Verarbeitung ist nötig, um die Seite auszuliefern und den Betrieb abzusichern (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p>Hosting: %s</p>
      <h2>3. Cookies, Analyse und eingebundene Dienste</h2>
      <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Werbedienste. Schriften, Skripte und Bilder werden vom eigenen Webspace geladen. Es sind keine Karten, Videos oder Inhalte sozialer Netzwerke eingebettet.</p>
      <h2>4. Kontakt per E-Mail, Telefon und Anfrageformular</h2>
      <p>Wenn Sie uns anrufen oder schreiben, verarbeiten wir Ihre Angaben, um Ihr Anliegen zu bearbeiten (Art. 6 Abs. 1 lit. b DSGVO, bei allgemeinen Anfragen lit. f).</p>
      <p>Das Anfrageformular überträgt keine Daten an diese Website. Es öffnet Ihr E-Mail-Programm mit einer vorbereiteten Nachricht, die Sie selbst absenden.</p>
      <p>Speicherdauer: %s</p>
      <h2>5. Bewerbungen</h2>
      <p>Bewerbungsunterlagen verarbeiten wir zur Entscheidung über ein Beschäftigungsverhältnis (§ 26 BDSG). Speicherdauer nach einer Absage: %s</p>
      <h2>6. Links zu anderen Anbietern</h2>
      <p>Die Seite verlinkt auf Google Maps (Routenplanung) und Facebook. Daten werden erst übertragen, wenn Sie einen dieser Links anklicken. Dann gelten die Datenschutzhinweise des jeweiligen Anbieters.</p>
      <h2>7. Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Wenden Sie sich dazu an die oben genannte Adresse.</p>
      <p>Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig für uns ist das Bayerische Landesamt für Datenschutzaufsicht in Ansbach.</p>''' % (
        MAIL, MAIL, offen('endgültiger Hosting-Anbieter mit Anschrift und Hinweis auf den Auftragsverarbeitungsvertrag; der Entwurf liegt derzeit bei Vercel'),
        offen('Löschfrist für Anfragen'), offen('Löschfrist für Bewerbungsunterlagen'))
    inhalt = seitenkopf([('Datenschutz', '/datenschutz/')], ['Ihre', 'Daten'], 'Daten<em>schutz</em>',
                        'Entwurf nach dem technischen Stand dieser Website. Vor der Veröffentlichung rechtlich zu prüfen.')
    inhalt += '\n' + abschnitt('', '', '<div class="bento"><div class="k s12 recht">%s</div></div>' % datenschutz)
    seite('datenschutz', 'Datenschutz · Mat-Elektrotechnik GmbH', 'Datenschutzerklärung der Mat-Elektrotechnik GmbH.', inhalt)


def baue_404():
    inhalt = seitenkopf([], ['Fehler', '404'], 'Diese Seite gibt es <em>nicht</em>',
                        'Die Adresse ist falsch oder die Seite wurde verschoben.')
    inhalt += '\n' + abschnitt('', '', '<div class="bento">%s%s%s</div>' % (
        '<div class="k k-link ein s4"><span class="nr">01</span><h3><a href="/">Startseite</a></h3><p>Zurück zum Anfang.</p>%s</div>' % PFEIL,
        '<div class="k k-link ein s4"><span class="nr">02</span><h3><a href="/leistungen/">Leistungen</a></h3><p>Die acht Bereiche im Überblick.</p>%s</div>' % PFEIL,
        '<div class="k k-link ein s4"><span class="nr">03</span><h3><a href="/kontakt/">Kontakt</a></h3><p>Telefon, E-Mail und Anschrift.</p>%s</div>' % PFEIL))
    seite('', 'Seite nicht gefunden · Mat-Elektrotechnik GmbH', 'Diese Seite gibt es nicht.', inhalt, datei='404.html')


def baue_start():
    with open(os.path.join(WURZEL, '_bau', 'start.html'), encoding='utf-8') as f:
        inhalt = f.read()
    seite('', 'Mat-Elektrotechnik GmbH · Elektro-Meisterbetrieb in Germering bei München',
          'Elektroinstallation, Wallbox, Blitzschutz, Netzwerktechnik, Verteilerbau, Prüfung und Photovoltaik. Meisterbetrieb in Germering, seit 2010 im Großraum München tätig.',
          inhalt)


if __name__ == '__main__':
    print('Baue nach', WURZEL)
    baue_start()
    baue_leistungen()
    baue_unternehmen()
    baue_karriere()
    baue_referenzen()
    baue_kontakt()
    baue_recht()
    baue_404()
