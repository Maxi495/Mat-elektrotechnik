/* Mat-Elektrotechnik — Bewegung der Startseite. Ohne Bibliotheken. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var klemme = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* ---------- Menü ---------- */
  var knopf = $('.menue-knopf'), nav = $('#nav');
  function menue(auf) {
    nav.classList.toggle('offen', auf);
    knopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
    document.body.style.overflow = auf ? 'hidden' : '';
  }
  knopf.addEventListener('click', function () { menue(!nav.classList.contains('offen')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) menue(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menue(false); });

  /* ---------- Einblenden ---------- */
  var seher = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); seher.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  $$('.ein').forEach(function (el) { seher.observe(el); });

  /* ---------- Scrollgebundene Werte ---------- */
  var fort = $$('[data-fortschritt]'), hero = $('.hero'), bloecke = $$('.block'), standbilder = $$('.stand img');
  var wartet = false;
  function rechnen() {
    wartet = false;
    var vh = innerHeight;
    if (hero) hero.style.setProperty('--h', klemme(scrollY / (vh * 0.8)).toFixed(3));
    fort.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = klemme((vh - r.top) / (vh * 0.62));
      p = 1 - Math.pow(1 - p, 3);
      el.style.setProperty('--p', p.toFixed(3));
    });
    // aktiver Block neben dem stehenden Bild
    var best = 0, nah = Infinity;
    bloecke.forEach(function (b, i) {
      var r = b.getBoundingClientRect(), d = Math.abs(r.top + r.height * 0.6 - vh * 0.5);
      if (d < nah) { nah = d; best = i; }
    });
    bloecke.forEach(function (b, i) { b.classList.toggle('aktiv', i === best); });
    standbilder.forEach(function (b, i) { b.classList.toggle('aktiv', i === best); });
  }
  function anstossen() { if (!wartet) { wartet = true; requestAnimationFrame(rechnen); } }
  addEventListener('scroll', anstossen, { passive: true });
  addEventListener('resize', anstossen);
  rechnen();

  /* ---------- Anfrageformular: öffnet das Mailprogramm, sendet nichts an einen Server ---------- */
  var formular = $('[data-anfrage]');
  if (formular) formular.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = formular.elements, zeilen = [
      'Name: ' + f.name.value, 'Telefon: ' + f.telefon.value, 'Ort des Objekts: ' + f.ort.value,
      'Anliegen: ' + f.anliegen.value, '', f.nachricht.value
    ];
    location.href = 'mailto:info@mat-elektrotechnik.de?subject=' + encodeURIComponent('Anfrage: ' + f.anliegen.value) +
      '&body=' + encodeURIComponent(zeilen.join('\n'));
  });

  /* ---------- Wechselnde Zeile im Hero ---------- */
  var wechsel = $('[data-wechsel]');
  if (wechsel && !ruhig) {
    var saetze = JSON.parse(wechsel.dataset.wechsel), nr = 0;
    setInterval(function () {
      if (document.hidden) return;
      wechsel.classList.add('weg');
      setTimeout(function () {
        nr = (nr + 1) % saetze.length;
        wechsel.textContent = saetze[nr][0] + ' ';
        var em = document.createElement('em'); em.textContent = saetze[nr][1]; wechsel.appendChild(em);
        wechsel.classList.remove('weg');
      }, 700);
    }, 3800);
  }

  /* ---------- Pixelfeld: fließendes Rauschen als Punktraster ---------- */
  var P = new Uint8Array(512);
  (function () { var s = 7; for (var i = 0; i < 256; i++) P[i] = i;
    for (i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; var j = s % (i + 1), t = P[i]; P[i] = P[j]; P[j] = t; }
    for (i = 0; i < 256; i++) P[256 + i] = P[i]; })();
  function rausch(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    xi &= 255; yi &= 255;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = P[P[xi] + yi], b = P[P[xi + 1] + yi], c = P[P[xi] + yi + 1], d = P[P[xi + 1] + yi + 1];
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) / 255;
  }
  function feld(huelle) {
    var cv = $('canvas', huelle), ctx = cv.getContext('2d');
    var zelle = +huelle.dataset.zelle || 6, sp, ze, bild, korn, sichtbar = false, lauf = 0, zuletzt = 0;
    var mx = -9, my = -9, zx = -9, zy = -9;
    huelle.style.setProperty('--zelle', zelle + 'px');
    function mass() {
      sp = Math.ceil(huelle.clientWidth / zelle); ze = Math.ceil(huelle.clientHeight / zelle);
      if (!sp || !ze) return;
      cv.width = sp; cv.height = ze; cv.style.width = sp * zelle + 'px'; cv.style.height = ze * zelle + 'px';
      bild = ctx.createImageData(sp, ze); korn = new Float32Array(sp * ze);
      for (var i = 0; i < korn.length; i++) korn[i] = Math.random();
      zeichnen(performance.now());
    }
    function zeichnen(jetzt) {
      if (!bild) return;
      var t = jetzt / 1000, d = bild.data, s = 0.045 * (zelle / 6), n = korn.length, schub = Math.floor(t * 5) * 7919;
      mx += (zx - mx) * 0.08; my += (zy - my) * 0.08;
      for (var y = 0, i = 0; y < ze; y++) {
        for (var x = 0; x < sp; x++, i++) {
          var nx = x * s, ny = y * s;
          var wx = rausch(nx * 0.7 + t * 0.045, ny * 0.7 + 3.1), wy = rausch(nx * 0.7 + 11.7, ny * 0.7 - t * 0.04);
          var v = rausch(nx + wx * 3.2, ny + wy * 3.2 + t * 0.02) * 0.72 + rausch(nx * 2.3 + wy * 2, ny * 2.3 + wx * 2) * 0.28;
          var ader = 1 - Math.abs(v * 2 - 1);                 // Grate des Rauschens: Adern
          var dx = x - mx, dy = y - my;
          ader += 0.16 * Math.exp(-(dx * dx + dy * dy) / 260); // Zeiger hellt das Feld auf
          var k = korn[(i + schub) % n], o = i * 4;
          if (ader > 0.905 + (k - 0.5) * 0.26) {
            d[o] = 215 + 30 * k; d[o + 1] = 10 * k; d[o + 2] = 54 + 15 * k; d[o + 3] = 150 + 105 * k;
          } else if (k > 0.994) { d[o] = 215; d[o + 1] = 0; d[o + 2] = 54; d[o + 3] = 120; }
          else d[o + 3] = 0;
        }
      }
      ctx.putImageData(bild, 0, 0);
    }
    function bild_fuer_bild(jetzt) {
      if (!sichtbar) { lauf = 0; return; }
      lauf = requestAnimationFrame(bild_fuer_bild);
      if (jetzt - zuletzt < 40) return;
      zuletzt = jetzt; zeichnen(jetzt);
    }
    new IntersectionObserver(function (es) {
      sichtbar = es[0].isIntersecting && !ruhig;
      if (sichtbar && !lauf) lauf = requestAnimationFrame(bild_fuer_bild);
    }).observe(huelle);
    huelle.parentElement.addEventListener('pointermove', function (e) {
      var r = huelle.getBoundingClientRect(); zx = (e.clientX - r.left) / zelle; zy = (e.clientY - r.top) / zelle;
    });
    new ResizeObserver(mass).observe(huelle);
    mass();
  }
  $$('[data-feld]').forEach(feld);

  /* ---------- Karussell ---------- */
  $$('[data-karussell]').forEach(function (k) {
    var bahn = $('.bahn', k), karten = $$('.karte', k), text = $('.karten-text', k), punkte = $('.punkte', k);
    var titel = text.children[0], zeile = text.children[1], aktiv = 0, uhr = 0, erstes = true;
    karten.forEach(function (karte, i) {
      var p = document.createElement('button'); p.type = 'button';
      p.setAttribute('aria-label', 'Bild ' + (i + 1) + ': ' + karte.dataset.titel);
      p.addEventListener('click', function () { gehe(i, true); });
      punkte.appendChild(p);
      karte.addEventListener('click', function () { if (!gezogen) gehe(i, true); });
    });
    var pk = $$('button', punkte);
    function lage() {
      var karte = karten[aktiv];
      bahn.style.transform = 'translateX(' + (k.clientWidth / 2 - karte.offsetLeft - karte.offsetWidth / 2) + 'px)';
    }
    function gehe(i, vonHand) {
      aktiv = (i + karten.length) % karten.length;
      karten.forEach(function (c, j) { if (j === aktiv) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
      pk.forEach(function (c, j) { if (j === aktiv) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
      lage();
      var karte = karten[aktiv];
      function setzen() { titel.textContent = karte.dataset.titel; zeile.textContent = karte.dataset.text; text.classList.remove('weg'); }
      if (erstes) { erstes = false; setzen(); } else { text.classList.add('weg'); setTimeout(setzen, 350); }
      if (vonHand) takt();
    }
    function takt() { clearInterval(uhr); if (!ruhig) uhr = setInterval(function () { if (!document.hidden && !halt) gehe(aktiv + 1); }, 5200); }
    var halt = false, gezogen = false, startX = null;
    k.addEventListener('pointerenter', function () { halt = true; });
    k.addEventListener('pointerleave', function () { halt = false; });
    k.addEventListener('focusin', function () { halt = true; });
    k.addEventListener('focusout', function () { halt = false; });
    k.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') gehe(aktiv + 1, true);
      if (e.key === 'ArrowLeft') gehe(aktiv - 1, true);
    });
    bahn.addEventListener('pointerdown', function (e) { startX = e.clientX; gezogen = false; });
    addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) { gezogen = true; gehe(aktiv + (dx < 0 ? 1 : -1), true); setTimeout(function () { gezogen = false; }, 50); }
    });
    new ResizeObserver(lage).observe(k);
    gehe(0); takt();
  });

  /* ---------- Strahlen im Kontakt ---------- */
  var st = $('[data-strahlen]');
  if (st) {
    var ns = 'http://www.w3.org/2000/svg', cx = 800, cy = 450, html = '<defs>';
    var winkel = [-158, -112, -74, -22, 24, 71, 106, 127, 166], teile = '';
    winkel.forEach(function (w, i) {
      var a = w * Math.PI / 180, r1 = 250 + (i % 3) * 40, r2 = 1100;
      var x1 = cx + Math.cos(a) * r1 * 1.25, y1 = cy + Math.sin(a) * r1 * 0.8, x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
      html += '<linearGradient id="s' + i + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + (x1 + (x2 - x1) * 0.35) + '" y2="' + (y1 + (y2 - y1) * 0.35) + '"><stop offset="0" stop-color="#D70036" stop-opacity="0"/><stop offset="1" stop-color="#D70036"/></linearGradient>';
      teile += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="url(#s' + i + ')" style="--d:-' + (i * 0.7) + 's"/>';
    });
    st.innerHTML = html + '</defs>' + teile;
  }
})();
