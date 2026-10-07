/* Meetbeeld: de luchtfoto van het adres met de gemeten contour, de maatlijnen en de hoogtemeting, als een korte meetanimatie.
   Gebruik: Meetbeeld.teken(element, gemeten, { px: 640, animatie: true, compact: false })
   gemeten = het antwoord van /api/adres (met het veld beeld). Het element krijgt de klasse "meetbeeld" en wordt vierkant.
   Geen afhankelijkheden. De luchtfoto komt van /api/luchtfoto (Digitaal Vlaanderen, open data). */
(function (g) {
  const SVG = 'http://www.w3.org/2000/svg';
  const el = (naam, attrs, ouder) => {
    const n = document.createElementNS(SVG, naam);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, String(v));
    if (ouder) ouder.appendChild(n);
    return n;
  };
  const n1 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });

  function teken(wortel, gemeten, opties) {
    const o = Object.assign({ px: 640, animatie: true, compact: false }, opties || {});
    const b = gemeten && gemeten.beeld;
    if (!wortel || !b) return null;
    const rustig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anim = o.animatie && !rustig;
    const S = 1000; /* viewBox: 1000 eenheden = de zijde van het vierkant */
    const [x1, y1, x2, y2] = b.bbox;
    const sx = (x) => (x - x1) / (x2 - x1) * S;
    const sy = (y) => (y2 - y) / (y2 - y1) * S;
    const pad = (ring) => ring.map((q, i) => (i ? 'L' : 'M') + sx(q[0]).toFixed(1) + ' ' + sy(q[1]).toFixed(1)).join(' ') + ' Z';

    wortel.classList.add('meetbeeld');
    if (o.compact) wortel.classList.add('meetbeeld--compact');
    wortel.classList.toggle('meetbeeld--stil', !anim);
    wortel.innerHTML = '';

    const foto = document.createElement('img');
    foto.className = 'meetbeeld__foto';
    foto.alt = 'Luchtfoto van ' + (gemeten.adres || 'het adres');
    foto.decoding = 'async';
    /* Op een gekoppeld toestel komt de luchtfoto via de tunnel van de pc (RP_API) met de sleutel in ?k= (een <img> stuurt geen kop). */
    foto.src = (globalThis.RP_API || '') + '/api/luchtfoto?bbox=' + b.bbox.join(',') + '&px=' + o.px + (globalThis.RP_K ? '&k=' + globalThis.RP_K : '');
    /* Een haperende tunnel of luchtfotodienst: twee nieuwe pogingen na 1,5 s, met een eigen adres zodat de browser opnieuw vraagt. */
    let pogingen = 0;
    foto.onerror = () => { if (pogingen++ < 2) setTimeout(() => { foto.src = foto.src.replace(/&p=\d+$/, '') + '&p=' + pogingen; }, 1500); };
    wortel.appendChild(foto);

    const svg = el('svg', { class: 'meetbeeld__laag', viewBox: '0 0 ' + S + ' ' + S, preserveAspectRatio: 'xMidYMid slice' }, null);
    wortel.appendChild(svg);
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: 'mb-clip-' + Math.random().toString(36).slice(2, 8) }, defs);
    el('path', { d: pad(b.contour) }, clip);

    /* Andere gebouwen: dun en stil. Aangebouwde buren: iets zichtbaarder, gestreept. */
    for (const ring of (b.andere || [])) el('path', { d: pad(ring), class: 'mb-ander' }, svg);
    for (const ring of (b.buren || [])) el('path', { d: pad(ring), class: 'mb-buur' }, svg);

    /* Hoogtecellen: lichte vulling, donkerder waar het dak hoger is; verschijnen achter de scanlijn. */
    const cellen = b.cellen || [];
    const hs = cellen.map((c) => c[2]);
    const hMin = Math.min(...hs), hMax = Math.max(...hs);
    const groep = el('g', { class: 'mb-cellen', 'clip-path': 'url(#' + clip.id + ')' }, svg);
    const r = (b.raster || 1) * S / (x2 - x1);
    for (const c of cellen) {
      const t = hMax > hMin ? (c[2] - hMin) / (hMax - hMin) : 0.5;
      el('rect', { x: (sx(c[0]) - r / 2).toFixed(1), y: (sy(c[1]) - r / 2).toFixed(1), width: r.toFixed(1), height: r.toFixed(1), class: 'mb-cel', style: 'opacity:' + (0.12 + 0.5 * t).toFixed(2) }, groep);
    }

    /* De contour: een witte zoom eronder voor leesbaarheid op donkere daken, de merklijn erop, getekend als een lijn die loopt. */
    const omtrek = b.contour.reduce((a, q, i) => { const n = b.contour[(i + 1) % b.contour.length]; return a + Math.hypot(sx(n[0]) - sx(q[0]), sy(n[1]) - sy(q[1])); }, 0);
    el('path', { d: pad(b.contour), class: 'mb-zoom' }, svg);
    const lijn = el('path', { d: pad(b.contour), class: 'mb-contour', style: '--lengte:' + omtrek.toFixed(0) }, svg);

    /* Scanlijn: één lijn die van boven naar onder over het gebouw loopt terwijl de hoogte gemeten wordt. */
    const ys = b.contour.map((q) => sy(q[1]));
    const xs = b.contour.map((q) => sx(q[0]));
    const top = Math.min(...ys), onder = Math.max(...ys), links = Math.min(...xs), rechts = Math.max(...xs);
    const scan = el('g', { class: 'mb-scan', 'clip-path': 'url(#' + clip.id + ')', style: '--van:' + (top - 8).toFixed(0) + 'px;--tot:' + (onder + 8).toFixed(0) + 'px' }, svg);
    el('rect', { x: (links - 20).toFixed(0), y: -3, width: (rechts - links + 40).toFixed(0), height: 6, class: 'mb-scanlijn' }, scan);

    /* Maatlijnen met de maat in meter, buiten de contour. */
    const maten = el('g', { class: 'mb-maten' }, svg);
    for (const m of (b.maten || [])) {
      const ax = sx(m.van[0]), ay = sy(m.van[1]), bx = sx(m.tot[0]), by = sy(m.tot[1]);
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L * 9, ny = dx / L * 9; /* korte eindstreepjes dwars op de lijn */
      el('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'mb-maat' }, maten);
      el('line', { x1: ax + nx, y1: ay + ny, x2: ax - nx, y2: ay - ny, class: 'mb-maat' }, maten);
      el('line', { x1: bx + nx, y1: by + ny, x2: bx - nx, y2: by - ny, class: 'mb-maat' }, maten);
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const tekst = n1.format(m.waarde) + ' m';
      const breed = tekst.length * 13 + 18;
      el('rect', { x: (mx - breed / 2).toFixed(1), y: (my - 15).toFixed(1), width: breed, height: 30, rx: 6, class: 'mb-label' }, maten);
      el('text', { x: mx.toFixed(1), y: (my + 6).toFixed(1), class: 'mb-labeltekst', 'text-anchor': 'middle' }, maten).textContent = tekst;
    }

    /* Adrespunt. */
    const ap = b.adrespunt;
    if (ap) {
      const g2 = el('g', { class: 'mb-pin' }, svg);
      el('circle', { cx: sx(ap[0]).toFixed(1), cy: sy(ap[1]).toFixed(1), r: 7, class: 'mb-pinkern' }, g2);
      el('circle', { cx: sx(ap[0]).toFixed(1), cy: sy(ap[1]).toFixed(1), r: 14, class: 'mb-pinring' }, g2);
    }

    /* Onderschrift met de gemeten cijfers, in de hoek van het beeld. */
    const d = gemeten.dak, geb = gemeten.gebouw, beb = gemeten.bebouwing;
    const regels = [
      n1.format(geb.oppervlakte) + ' m² grond · ' + beb.type + (beb.buren ? ' (' + beb.buren + (beb.buren === 1 ? ' buur)' : ' buren)') : ''),
      d ? (d.vorm === 'plat' ? 'plat dak' : d.vorm + ' ' + d.helling + '°') + ' · dakvlak ' + n0.format(d.dakvlak) + ' m² · nok ' + n1.format(d.nokhoogte) + ' m' : 'geen hoogtemeting',
    ];
    const onderschrift = document.createElement('div');
    onderschrift.className = 'meetbeeld__tekst';
    onderschrift.innerHTML = '<b></b><span></span><span></span>';
    onderschrift.querySelector('b').textContent = gemeten.adres || '';
    onderschrift.querySelectorAll('span')[0].textContent = regels[0];
    onderschrift.querySelectorAll('span')[1].textContent = regels[1];
    wortel.appendChild(onderschrift);

    const bron = document.createElement('div');
    bron.className = 'meetbeeld__bron';
    bron.textContent = 'Luchtfoto en contour: Digitaal Vlaanderen';
    wortel.appendChild(bron);

    /* De animatie in vier stappen: inzoomen, contour tekenen, scannen, maten en tekst. Met prefers-reduced-motion staat alles meteen. */
    if (anim) {
      wortel.classList.add('is-start');
      requestAnimationFrame(() => requestAnimationFrame(() => { wortel.classList.remove('is-start'); wortel.classList.add('is-meten'); }));
      setTimeout(() => wortel.classList.add('is-klaar'), 2600);
    } else {
      wortel.classList.add('is-klaar');
    }
    return { svg, foto };
  }

  g.Meetbeeld = { teken };
})(globalThis);
