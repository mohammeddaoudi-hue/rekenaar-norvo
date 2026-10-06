/* Controle van de datatabel (data/basis.js + data/<vak>.js): elke post heeft alle velden in de juiste vorm.
   Gebruik: node check-data.cjs   (faalt met code 1 bij een fout; schrijf eerst de data, dan deze controle) */
const { laadRP } = require('./laad.cjs');

const RP = laadRP();
const { DATA, VAKKEN, FASES } = RP;
const EENHEDEN = ['m²', 'lm', 'st', 'm³', 'kg', 'u', 'm', 'l', 'rol', 'zak', 'pak', 'dag'];
const fouten = [];
const fout = (code, tekst) => fouten.push(code + ': ' + tekst);
const getal = (v) => typeof v === 'number' && Number.isFinite(v);

for (const [k, t] of Object.entries(DATA.tarieven)) if (!getal(t) || t < 0) fout('tarieven.' + k, 'geen getal');
for (const [soort, c] of Object.entries(DATA.containers)) {
  if (!c.naam || !getal(c.prijs) || !getal(c.ton) || !getal(c.los) || !getal(c.bigbag)) fout('containers.' + soort, 'naam, prijs, ton, los en bigbag verplicht');
}
for (const [k, d] of Object.entries(DATA.perDag)) if (!d.naam || !getal(d.prijs) || d.prijs < 0) fout('perDag.' + k, 'naam en prijs verplicht');

const codes = Object.keys(DATA.posten);
if (codes.length < 40) fout('posten', 'minder dan 40 posten: ' + codes.length);
const namen = new Map();
for (const code of codes) {
  const p = DATA.posten[code];
  if (!/^[a-z]+(\.[a-z0-9]+)+$/.test(code)) fout(code, 'code moet er zo uitzien: vak.naam of vak.naam.detail (kleine letters, cijfers, punten)');
  if (!VAKKEN[code.split('.')[0]]) fout(code, 'onbekend vak-voorvoegsel; bekend: ' + Object.keys(VAKKEN).join(', '));
  if (!p || typeof p !== 'object') { fout(code, 'geen object'); continue; }
  if (!p.fase || typeof p.fase !== 'string') fout(code, 'fase ontbreekt');
  else if (!FASES.includes(p.fase)) fout(code, 'fase "' + p.fase + '" staat niet in RP.FASES (' + FASES.join(', ') + '); voeg hem daar toe of kies een bestaande');
  if (!p.naam || typeof p.naam !== 'string' || p.naam.length < 8) fout(code, 'naam ontbreekt of te kort');
  if (namen.has(p.naam)) fout(code, 'zelfde naam als ' + namen.get(p.naam)); else namen.set(p.naam, code);
  if (!EENHEDEN.includes(p.eenheid)) fout(code, 'eenheid "' + p.eenheid + '" onbekend; toegestaan: ' + EENHEDEN.join(' '));
  if (!getal(p.uur) || p.uur < 0 || p.uur > 40) fout(code, 'uur (manuren per eenheid) moet een getal tussen 0 en 40 zijn');
  if (p.eenheid === 'm²' && p.uur > 4) fout(code, 'uur per m² groter dan 4: controleer');
  if (p.afvalKg != null) fout(code, 'gebruik afval: [{ soort, kg }] in plaats van afvalKg');
  if (!Array.isArray(p.afval)) fout(code, 'afval moet een lijst zijn ([] als er geen afval is)');
  else for (const a of p.afval) {
    if (!DATA.containers[a.soort]) fout(code, 'afvalsoort "' + a.soort + '" onbekend; bekend: ' + Object.keys(DATA.containers).join(', '));
    if (!getal(a.kg) || a.kg <= 0) fout(code, 'afval kg moet een getal boven 0 zijn');
  }
  if (!Array.isArray(p.mat)) fout(code, 'mat moet een lijst zijn ([] zonder materiaal)');
  else p.mat.forEach((x, i) => {
    const w = code + ' mat[' + i + ']';
    if (!x.naam || typeof x.naam !== 'string') fout(w, 'naam ontbreekt');
    if (!getal(x.per) || x.per <= 0) fout(w, 'per (verbruik per eenheid van de post) moet een getal boven 0 zijn');
    if (!EENHEDEN.includes(x.eenheid)) fout(w, 'eenheid "' + x.eenheid + '" onbekend');
    if (!getal(x.prijs) || x.prijs < 0) fout(w, 'prijs ontbreekt of negatief');
    if (!getal(x.kg) || x.kg < 0) fout(w, 'kg ontbreekt (0 als het niets weegt)');
    if (x.perWeek && !x.huur) fout(w, 'perWeek alleen samen met huur: true');
    if (x.bron && (!x.bron.url || !x.bron.datum)) fout(w, 'bron heeft url en datum nodig');
  });
  if (p.keuze != null && (typeof p.keuze !== 'string' || p.keuze.length < 3)) fout(code, 'keuze moet een korte naam zijn');
  if (p.bron && (!p.bron.url || !p.bron.datum)) fout(code, 'bron heeft url en datum nodig');
  for (const k of Object.keys(p)) if (!['fase', 'naam', 'eenheid', 'uur', 'keuze', 'afval', 'mat', 'bron', 'status', 'opmerking'].includes(k)) fout(code, 'onbekend veld "' + k + '"');
}

/* Positieve controle: de motor rekent met elke post zonder fout en geeft een prijs boven 0 */
for (const code of codes) {
  const m = RP.leegMeetstaat();
  RP.pasRegelToe(m, { t: 'post', code, hoeveelheid: 10 });
  let r;
  try { r = RP.bereken(m, {}); } catch (e) { fout(code, 'motor crasht: ' + e.message); continue; }
  if (!(r.kosten.incl > 0)) fout(code, 'prijs 0 bij 10 eenheden');
}

const perVak = Object.fromEntries(Object.entries(VAKKEN).map(([pre, vak]) => [vak, codes.filter((c) => c.split('.')[0] === pre).length]));
console.log('Datatabel: ' + codes.length + ' posten, ' + RP.telWaarden() + ' waarden. Per vak: ' + Object.entries(perVak).map(([v, n]) => v + ' ' + n).join(', ') + '. Bestanden: ' + RP.DATA_BESTANDEN.join(', '));
if (fouten.length) { console.log(fouten.map((f) => 'FOUT ' + f).join('\n')); console.log(fouten.length + ' FOUT(EN)'); process.exitCode = 1; }
else console.log('ALLES OK');
