/* Test van de hele keten tegen de draaiende lokale server: adresmeting, Claude via het lokale account, rekenmotor.
   Gebruik: node test-e2e.mjs http://localhost:4791 "Straat 1 Gemeente" */
import { createRequire } from 'node:module';

const BASIS = process.argv[2] || 'http://localhost:4791';
const ADRES = process.argv[3] || 'August van Landeghemstraat 63 Willebroek';
const RP = createRequire(import.meta.url)('./laad.cjs').laadRP();
const KOP = { 'x-richtprijs': '1' };

let fouten = 0;
const toets = (naam, ok, detail) => { if (!ok) fouten++; console.log((ok ? 'OK   ' : 'FOUT ') + naam + (detail ? '  [' + detail + ']' : '')); };

async function stroom(prompt, opDelta) {
  const t0 = Date.now();
  let eerste = 0;
  const r = await fetch(BASIS + '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', ...KOP }, body: JSON.stringify({ prompt }) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
  const dec = new TextDecoder();
  let rest = '';
  for await (const stuk of r.body) {
    rest += dec.decode(stuk, { stream: true });
    let i;
    while ((i = rest.indexOf('\n')) >= 0) {
      const regel = rest.slice(0, i).trim();
      rest = rest.slice(i + 1);
      if (!regel) continue;
      const o = JSON.parse(regel);
      if (o.fout) throw new Error(o.fout);
      if (o.d) { if (!eerste) eerste = Date.now() - t0; opDelta(o.d); }
    }
  }
  return { eerste, totaal: Date.now() - t0 };
}

const ping = await (await fetch(BASIS + '/api/ping')).json();
toets('dit is de richtprijs-server', ping.app === 'richtprijs-ai', 'model ' + ping.model);

const dicht = await fetch(BASIS + '/api/adres?q=' + encodeURIComponent(ADRES));
toets('zonder eigen kop geweigerd (403)', dicht.status === 403, String(dicht.status));

const gm = await (await fetch(BASIS + '/api/adres?q=' + encodeURIComponent(ADRES), { headers: KOP })).json();
toets('adres gemeten', gm.gebouw && gm.gebouw.oppervlakte > 20 && gm.dak && gm.dak.dakvlak > 20, gm.adres + ': ' + (gm.gebouw && gm.gebouw.oppervlakte) + ' m2 grond, dakvlak ' + (gm.dak && gm.dak.dakvlak) + ' m2');
const weg = await fetch(BASIS + '/api/adres?q=' + encodeURIComponent('Bestaatnietstraat 999 Nergenshuizen'), { headers: KOP });
toets('onbestaand adres = 404 met melding', weg.status === 404, (await weg.json()).fout);

/* Vraag 1: de meetstaat, regel per regel */
const klus = RP.VOORBEELD.klus;
const m = RP.leegMeetstaat();
let buf = '', regels = 0, kapot = 0;
const eet = (s) => { s = s.trim(); if (s[0] !== '{') return; try { RP.pasRegelToe(m, JSON.parse(s)); regels++; } catch (e) { kapot++; } };
const tijd1 = await stroom(RP.bouwPrompt(klus, null, RP.standaardWaarden({}), null), (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { eet(buf.slice(0, i)); buf = buf.slice(i + 1); } });
eet(buf);
const r = RP.bereken(m, {});
console.log('\nMEETSTAAT VAN DE AI (' + tijd1.eerste + ' ms tot de eerste tekst, ' + tijd1.totaal + ' ms totaal):');
for (const x of r.regels) console.log('  ' + (x.bron === 'data' ? 'data' : 'AI  ') + ' ' + String(x.hoeveelheid).padStart(6) + ' ' + x.eenheid.padEnd(3) + ' ' + x.naam + (x.gevraagd ? '' : '  [niet gevraagd: ' + x.waarom + ']'));
console.log('  kenmerken: ' + Object.keys(m.kenmerken || {}).length + ' (' + Object.values(m.kenmerken || {}).map((x) => x.label + ' ' + x.waarde + x.eenheid + ' [' + x.bron + ']').join('; ') + ')');
console.log('  aannames: ' + m.aannames.length + ', plaatsbezoek: ' + m.plaatsbezoek.length + ', overgeslagen: ' + r.overgeslagen.join(', '));
toets('elke regel van de AI is geldige JSON', regels >= 8 && kapot === 0, regels + ' regels, ' + kapot + ' kapot');
toets('kenmerken ingevuld met bron', Object.keys(m.kenmerken || {}).length >= 10 && Object.values(m.kenmerken).every((x) => RP.BRONNEN.includes(x.bron)), String(Object.keys(m.kenmerken || {}).length));
toets('vak herkend als hellend dak', r.vak === 'Hellend dak' && r.vlakNaam === 'dakvlak', r.vak + ' / ' + r.vlakNaam);
toets('minstens 9 posten uit de datatabel', r.regels.filter((x) => x.bron === 'data').length >= 9, String(r.regels.filter((x) => x.bron === 'data').length));
toets('geen onbekende codes', r.overgeslagen.length === 0);
/* Zonder overstek is het dakvlak 94 m²; met de standaard-overstek (0,3 m goot, 0,2 m vrije gevel) 8,2 x 9,6 / cos 40° = 103 m². */
toets('dakvlak tussen 94 en 106 m2 (94 zonder overstek, 103 met)', m.dakvlak_m2 >= 94 && m.dakvlak_m2 <= 106, String(m.dakvlak_m2));
const ref = RP.bereken(RP.VOORBEELD.meetstaat, {}).kosten.incl;
toets('prijs binnen 15% van de handmatige meetstaat (die rekent zonder overstek)', Math.abs(r.kosten.incl - ref) / ref <= 0.15, Math.round(r.kosten.incl) + ' tegen ' + Math.round(ref));

/* Vraag 2: de uitleg, met controle dat elk bedrag uit de berekening komt */
const vraag = RP.bouwUitlegPrompt(klus, null, m, {});
/* Tweede vak: een gevelklus moet uit de geveltabel komen, niet uit AI-schattingen */
{
  const mg = RP.leegMeetstaat();
  let bufg = '';
  const eetg = (s) => { s = s.trim(); if (s[0] === '{') { try { RP.pasRegelToe(mg, JSON.parse(s)); } catch (e) { /* onvolledig */ } } };
  const tg = await stroom(RP.bouwPrompt('Rijwoning, voorgevel 6,5 m breed en 9 m hoog tot de kroonlijst, 3 ramen en 1 voordeur. Gevel isoleren en afwerken met crepi, inclusief nieuwe aluminium vensterbanken.', null, RP.standaardWaarden({}), null),
    (d) => { bufg += d; let i; while ((i = bufg.indexOf('\n')) >= 0) { eetg(bufg.slice(0, i)); bufg = bufg.slice(i + 1); } });
  eetg(bufg);
  const rg = RP.bereken(mg, {});
  console.log('\nGEVELKLUS (' + tg.totaal + ' ms): ' + rg.vak + ', ' + rg.vlak + ' m² ' + rg.vlakNaam + ', ' + Math.round(rg.kosten.incl) + ' incl, ' + Math.round(rg.aandeelData * 100) + '% uit de datatabel');
  for (const x of rg.regels) console.log('  ' + (x.bron === 'data' ? 'data' : 'AI  ') + ' ' + String(x.hoeveelheid).padStart(6) + ' ' + x.eenheid.padEnd(3) + ' ' + x.naam);
  toets('gevel: vak en m²-label', rg.vak === 'Gevel' && rg.vlakNaam === 'gevel', rg.vak + ' / ' + rg.vlakNaam);
  toets('gevel: minstens 80% van het subtotaal uit de datatabel', rg.aandeelData >= 0.8, Math.round(rg.aandeelData * 100) + '%');
  toets('gevel: isolatie, crepi, wapening, profielen en stelling aanwezig', ['gevel.isolatie.eps', 'gevel.crepi', 'gevel.wapening', 'gevel.profielen', 'gevel.stelling'].every((c) => rg.regels.some((x) => x.code === c)), rg.regels.map((x) => x.code || 'AI').join(' '));
  toets('gevel: prijs per m² tussen 90 en 260 excl. btw', rg.perM2 >= 90 && rg.perM2 <= 260, String(Math.round(rg.perM2)));
}
let tekst = '';
const tijd2 = await stroom(vraag, (d) => { tekst += d; });
console.log('\nUITLEG VAN DE AI (' + tijd2.eerste + ' ms tot de eerste tekst, ' + tijd2.totaal + ' ms totaal):\n' + tekst.trim() + '\n');
const punten = tekst.split('\n').filter((s) => s.trim());
toets('1 tot 6 punten', punten.length >= 1 && punten.length <= 6, String(punten.length));
/* Elk bedrag in de uitleg moet als getal in de berekening staan (€ 57,5 = het uurtarief 57.5; € 6.385 = 6385). */
const bekend = new Set();
for (const s of (vraag.slice(vraag.indexOf('BEREKENING:')).match(/-?\d+(?:\.\d+)?/g) || [])) { const n = Math.abs(Number(s)); bekend.add(String(Math.round(n))); bekend.add(String(Math.floor(n))); bekend.add(String(n)); }
const bedragen = (tekst.match(/€\s?[\d.]+(?:,\d+)?/g) || []).map((s) => Number(s.replace(/[€\s.]/g, '').replace(',', '.')));
const vreemd = bedragen.filter((n) => !bekend.has(String(n)) && !bekend.has(String(Math.round(n))));
toets('elk bedrag in de uitleg staat in de berekening', bedragen.length > 0 && vreemd.length === 0, bedragen.length + ' bedragen, niet teruggevonden: ' + (vreemd.join(', ') || 'geen'));
toets('geen verboden woorden', !/\b(mogelijk|waarschijnlijk|ongeveer|eventueel|uiteraard|kortom)\b/i.test(tekst));

console.log(fouten ? '\n' + fouten + ' FOUT(EN)' : '\nALLES OK');
process.exitCode = fouten ? 1 : 0;
