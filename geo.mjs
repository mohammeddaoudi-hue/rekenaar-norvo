/* Meet een gebouw op vanuit de openbare kaartdata van Vlaanderen (geo.api.vlaanderen.be):
   adres -> coördinaat (Geolocation), contour (GRB, laag GBG), hoogte (DHMV II, 1 m raster).
   Coördinaten in Lambert 72, dus alle afstanden zijn meters. Test: node geo.mjs "Straat 1 Gemeente" */
const BASE = 'https://geo.api.vlaanderen.be';

async function haal(url, tekst) {
  for (let poging = 0; ; poging++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return tekst ? await r.text() : await r.json();
    } catch (e) {
      if (poging === 1) throw e;
    }
  }
}

const oppervlak = (ring) => Math.abs(ring.reduce((a, p, i) => { const q = ring[(i + 1) % ring.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const lengte = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const omtrek = (ring) => ring.reduce((a, p, i) => a + lengte(p, ring[(i + 1) % ring.length]), 0);
function binnen(p, ring) {
  let in_ = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
}
function afstandSegment(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const afstandRing = (p, ring) => ring.reduce((m, a, i) => Math.min(m, afstandSegment(p, a, ring[(i + 1) % ring.length])), Infinity);
const mediaan = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const percentiel = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * p)))] : NaN; };
const rond = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;

async function pixel(laag, cx, cy) {
  const url = `${BASE}/DHMV/wms?service=WMS&version=1.3.0&request=GetFeatureInfo&layers=${laag}&query_layers=${laag}&styles=&crs=EPSG:31370` +
    `&bbox=${cx - 0.5},${cy - 0.5},${cx + 0.5},${cy + 0.5}&width=1&height=1&i=0&j=0&info_format=text/plain`;
  const t = await haal(url, true);
  const m = t.match(/Pixel Value;\s*(-?[\d.]+)/);
  const v = m ? parseFloat(m[1]) : NaN;
  return Number.isFinite(v) && v > -100 && v < 1000 ? v : NaN;
}
async function parallel(taken, tegelijk, opVoortgang) {
  const uit = new Array(taken.length);
  let volgende = 0, klaar = 0;
  await Promise.all(Array.from({ length: Math.min(tegelijk, taken.length) }, async () => {
    while (volgende < taken.length) {
      const i = volgende++;
      try { uit[i] = await taken[i](); } catch (e) { uit[i] = NaN; }
      klaar++;
      if (opVoortgang && klaar % 20 === 0) opVoortgang(klaar, taken.length);
    }
  }));
  return uit;
}

export async function meetAdres(vraag, opVoortgang = () => {}) {
  const loc = await haal(`${BASE}/geolocation/v4/Location?q=${encodeURIComponent(vraag)}&c=1`);
  const hit = loc && loc.LocationResult && loc.LocationResult[0];
  if (!hit || !hit.Housenumber) throw Object.assign(new Error('Adres met huisnummer niet gevonden.'), { code: 'adres' });
  const p = [hit.Location.X_Lambert72, hit.Location.Y_Lambert72];

  const d = 60;
  const fc = await haal(`${BASE}/GRB/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=GRB:GBG&outputFormat=application/json&srsName=EPSG:31370` +
    `&bbox=${p[0] - d},${p[1] - d},${p[0] + d},${p[1] + d},EPSG:31370&count=500`);
  const gebouwen = (fc.features || []).map((f) => {
    const g = f.geometry;
    const ring = g && (g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : null);
    return ring && ring.length > 3 ? { id: f.id, type: f.properties.LBLTYPE, opname: f.properties.OPNDATUM, ring: ring.slice(0, -1) } : null;
  }).filter(Boolean);
  const hoofd = gebouwen.filter((g) => g.type === 'hoofdgebouw');
  let doel = hoofd.find((g) => binnen(p, g.ring)) || gebouwen.find((g) => binnen(p, g.ring));
  let afstandTotAdres = 0;
  if (!doel) {
    for (const g of hoofd) { const a = afstandRing(p, g.ring); if (a < 30 && (!doel || a < afstandTotAdres)) { doel = g; afstandTotAdres = a; } }
  }
  if (!doel) throw Object.assign(new Error('Geen gebouw gevonden op dit adres.'), { code: 'gebouw' });
  const ring = doel.ring;
  const A = oppervlak(ring);
  const O = omtrek(ring);

  /* Rechthoek rond het gebouw, gericht op de langste gevel */
  let langste = [ring[0], ring[1]];
  ring.forEach((a, i) => { const b = ring[(i + 1) % ring.length]; if (lengte(a, b) > lengte(langste[0], langste[1])) langste = [a, b]; });
  const L = lengte(langste[0], langste[1]);
  const u = [(langste[1][0] - langste[0][0]) / L, (langste[1][1] - langste[0][1]) / L];
  const v = [-u[1], u[0]];
  const pu = ring.map((q) => q[0] * u[0] + q[1] * u[1]);
  const pv = ring.map((q) => q[0] * v[0] + q[1] * v[1]);
  const maatU = Math.max(...pu) - Math.min(...pu);
  const maatV = Math.max(...pv) - Math.min(...pv);

  /* Gemene muren: stukken gevel die tegen een ander gebouw liggen (minder dan 30 cm) */
  const tegen = new Map();
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length];
    const len = lengte(a, b);
    const n = Math.max(1, Math.ceil(len / 0.5));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const s = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      for (const g of gebouwen) {
        if (g === doel) continue;
        if (afstandRing(s, g.ring) < 0.3) { tegen.set(g, (tegen.get(g) || 0) + len / n); break; }
      }
    }
  });
  const buren = [...tegen].filter(([g, l]) => g.type === 'hoofdgebouw' && l >= 2);
  const gemeneMuur = buren.reduce((a, [, l]) => a + l, 0);
  const aanbouw = [...tegen].filter(([g, l]) => g.type !== 'hoofdgebouw' && l >= 1).reduce((a, [, l]) => a + l, 0);

  /* Hoogte: elk rastervak van het oppervlaktemodel binnen de contour, 0,7 m weg van de gevel */
  const xs = ring.map((q) => q[0]), ys = ring.map((q) => q[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let stap = 1, cellen = [];
  for (; stap <= 4; stap++) {
    cellen = [];
    for (let ix = Math.floor(minX); ix <= maxX; ix += stap) for (let iy = Math.floor(minY); iy <= maxY; iy += stap) {
      const c = [ix + 0.5, iy + 0.5];
      if (binnen(c, ring) && afstandRing(c, ring) >= 0.7) cellen.push({ ix, iy, c });
    }
    if (cellen.length <= 340) break;
  }
  const rand = [[minX - 3, minY - 3], [maxX + 3, minY - 3], [minX - 3, maxY + 3], [maxX + 3, maxY + 3],
    [(minX + maxX) / 2, minY - 3], [(minX + maxX) / 2, maxY + 3], [minX - 3, (minY + maxY) / 2], [maxX + 3, (minY + maxY) / 2]];
  const [grond, dsm] = await Promise.all([
    parallel(rand.map((q) => () => pixel('DHMVII_DTM_1m', Math.floor(q[0]) + 0.5, Math.floor(q[1]) + 0.5)), 8),
    parallel(cellen.map((q) => () => pixel('DHMVII_DSM_1m', q.c[0], q.c[1])), 12, opVoortgang),
  ]);
  const maaiveld = mediaan(grond.filter(Number.isFinite));
  const rooster = new Map();
  cellen.forEach((q, i) => { const h = dsm[i] - maaiveld; if (Number.isFinite(h) && h > 1.5) { q.h = h; rooster.set(q.ix + ',' + q.iy, h); } });
  const gemeten = cellen.filter((q) => q.h != null);

  let dak = null;
  if (gemeten.length >= 12 && Number.isFinite(maaiveld)) {
    const hellingen = [];
    let somU = 0, somV = 0;
    for (const q of gemeten) {
      const h = (dx, dy) => rooster.get((q.ix + dx * stap) + ',' + (q.iy + dy * stap));
      const afgeleide = (a, b) => (a != null && b != null ? (a - b) / (2 * stap) : a != null ? (a - q.h) / stap : b != null ? (q.h - b) / stap : null);
      const gx = afgeleide(h(1, 0), h(-1, 0)), gy = afgeleide(h(0, 1), h(0, -1));
      if (gx == null && gy == null) continue;
      const hoek = Math.atan(Math.hypot(gx || 0, gy || 0)) * 180 / Math.PI;
      hellingen.push(hoek);
      if (hoek >= 15 && hoek <= 60) { somU += Math.abs((gx || 0) * u[0] + (gy || 0) * u[1]); somV += Math.abs((gx || 0) * v[0] + (gy || 0) * v[1]); }
    }
    const schuin = hellingen.filter((x) => x >= 15 && x <= 60);
    const platAandeel = hellingen.length ? hellingen.filter((x) => x < 10).length / hellingen.length : 1;
    const helling = schuin.length >= 5 ? mediaan(schuin) : 0;
    const hoogtes = gemeten.map((q) => q.h);
    const vorm = !helling || platAandeel > 0.7 ? 'plat' : platAandeel < 0.3 ? 'hellend' : 'gemengd (hellend en plat)';
    const rad = helling * Math.PI / 180;
    const valtLangsU = somU > somV;
    dak = {
      vorm,
      helling: vorm === 'plat' ? 0 : Math.round(helling),
      platAandeel: rond(platAandeel, 2),
      dakvlak: rond(vorm === 'plat' ? A : A * (platAandeel + (1 - platAandeel) / Math.cos(rad)), 0),
      nokhoogte: rond(percentiel(hoogtes, 0.98)),
      kroonlijst: rond(Math.max(2, percentiel(hoogtes, 0.05) - (vorm === 'plat' ? 0 : 0.7 * Math.tan(rad)))),
      noklengte: vorm === 'plat' ? 0 : rond(valtLangsU ? maatV : maatU),
      overspanning: vorm === 'plat' ? 0 : rond(valtLangsU ? maatU : maatV),
      punten: gemeten.length,
      raster: stap,
    };
  }

  return {
    adres: hit.FormattedAddress,
    gebouw: { type: doel.type, oppervlakte: rond(A), omtrek: rond(O), lengte: rond(Math.max(maatU, maatV)), breedte: rond(Math.min(maatU, maatV)), opname: doel.opname || '', afstandTotAdres: rond(afstandTotAdres) },
    bebouwing: { type: buren.length === 0 ? 'open' : buren.length === 1 ? 'halfopen' : 'gesloten', buren: buren.length, gemeneMuur: rond(gemeneMuur), aanbouw: rond(aanbouw), vrijeGevel: rond(O - gemeneMuur - aanbouw) },
    dak,
    bron: 'Digitaal Vlaanderen: adressenregister, GRB-gebouwcontour, hoogtemodel DHMV II (1 m raster, vlucht 2013-2015)',
  };
}

if (process.argv[1] && process.argv[1].endsWith('geo.mjs') && process.argv[2]) {
  const start = Date.now();
  meetAdres(process.argv.slice(2).join(' '), (k, n) => process.stderr.write(`hoogte ${k}/${n}\n`))
    .then((r) => { console.log(JSON.stringify(r, null, 1)); console.log('duur ' + (Date.now() - start) + ' ms'); })
    .catch((e) => { console.error('FOUT: ' + e.message); process.exitCode = 1; });
}
