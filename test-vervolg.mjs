/* Test van "verder vragen" tegen de draaiende lokale server, met de echte AI op het voorbeeld (24.160 incl. btw).
   Vier soorten vragen: een gewone vraag, een wijziging, een "wat als" en een andere ploeg. De AI noemt bij een wijziging geen bedrag;
   de motor past de regels toe en het verschil per post sluit op het verschil excl. btw.
   Gebruik: node test-vervolg.mjs http://localhost:4791 */
import { createRequire } from 'node:module';

const BASIS = process.argv[2] || 'http://localhost:4791';
const RP = createRequire(import.meta.url)('./laad.cjs').laadRP();
const KOP = { 'x-richtprijs': '1' };

let fouten = 0;
const toets = (naam, ok, detail) => { if (!ok) fouten++; console.log((ok ? 'OK   ' : 'FOUT ') + naam + (detail ? '  [' + detail + ']' : '')); };
const kopie = (x) => JSON.parse(JSON.stringify(x));

async function vraagAI(prompt) {
  const t0 = Date.now();
  const r = await fetch(BASIS + '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', ...KOP }, body: JSON.stringify({ prompt }) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()));
  const dec = new TextDecoder();
  let rest = '', tekst = '';
  for await (const stuk of r.body) {
    rest += dec.decode(stuk, { stream: true });
    let i;
    while ((i = rest.indexOf('\n')) >= 0) {
      const regel = rest.slice(0, i).trim();
      rest = rest.slice(i + 1);
      if (!regel) continue;
      const o = JSON.parse(regel);
      if (o.fout) throw new Error(o.fout);
      if (o.d) tekst += o.d;
    }
  }
  return { tekst, ms: Date.now() - t0 };
}

const ping = await (await fetch(BASIS + '/api/ping')).json();
toets('dit is de richtprijs-server', ping.app === 'richtprijs-ai', 'model ' + ping.model);

const m = kopie(RP.VOORBEELD.meetstaat);
const tar = {};
const a = RP.analyse(m, tar);
const id = (code) => 'p' + (m.posten.findIndex((p) => p.code === code) + 1);
const vragen = [];
const sluit = (v) => Math.abs(v.rijen.reduce((s, y) => s + y.verschil, 0) + v.materieel - v.verschilExcl) < 0.0001;
const geenBedrag = (s) => !/€\s?\d/.test(s);
const verboden = (s) => new RegExp('\\b(' + RP.VERBODEN.join('|') + ')\\b', 'i').test(s);
async function stel(vraag, gesprek) {
  const prompt = RP.bouwVervolgPrompt(RP.VOORBEELD.klus, null, m, tar, {}, gesprek || [], vraag, '');
  const { tekst, ms } = await vraagAI(prompt);
  const uit = RP.leesVervolg(tekst);
  console.log('\nVRAAG: ' + vraag + '  (' + ms + ' ms)\n' + tekst.trim().split('\n').map((s) => '  | ' + s).join('\n'));
  vragen.push({ vraag, uit, prompt });
  return uit;
}

/* 1. Een gewone vraag: alleen tekst, elk bedrag staat in de berekening. */
{
  const uit = await stel('Waarom zit er een stelling in de prijs? De klant vroeg er niet om.');
  const tekst = uit.antwoord.join('\n');
  toets('vraag: tekst zonder wijziging', uit.ops.length === 0 && uit.actie === '' && uit.antwoord.length >= 1 && uit.antwoord.length <= 4, uit.antwoord.length + ' zinnen, ' + uit.ops.length + ' regels');
  const prompt = vragen[vragen.length - 1].prompt;
  const bekend = new Set();
  for (const s of (prompt.slice(prompt.indexOf('BEREKENING:')).match(/-?\d+(?:\.\d+)?/g) || [])) { const n = Math.abs(Number(s)); bekend.add(String(Math.round(n))); bekend.add(String(n)); }
  const bedragen = (tekst.match(/€\s?[\d.]+(?:,\d+)?/g) || []).map((s) => Number(s.replace(/[€\s.]/g, '').replace(',', '.')));
  const vreemd = bedragen.filter((n) => !bekend.has(String(n)) && !bekend.has(String(Math.round(n))));
  toets('vraag: elk bedrag staat in de berekening', vreemd.length === 0, bedragen.length + ' bedragen, niet teruggevonden: ' + (vreemd.join(', ') || 'geen'));
  toets('vraag: noemt een maat of bedrag van deze klus', /\d/.test(tekst));
  toets('vraag: geen verboden woorden', !verboden(tekst));
}

/* 2. Een wijziging: 2 dakramen erbij. Alleen de dakraampost verandert; de AI noemt geen bedrag. */
{
  const uit = await stel('Zet er 2 dakramen bij, dus 4 in totaal.');
  const w = RP.pasWijzigingToe(m, uit.ops);
  const v = RP.vergelijk(m, tar, w.m, tar, w.herkomst);
  const dakramen = w.m.posten.filter((p) => /^dak\.dakraam/.test(p.code || '')).reduce((s, p) => s + Number(p.hoeveelheid), 0);
  const nieuweDakramen = w.m.posten.filter((p) => p.code === 'dak.dakraam').reduce((s, p) => s + Number(p.hoeveelheid), 0);
  toets('wijziging: actie toepassen', uit.actie === 'toepassen', uit.actie);
  toets('wijziging: 4 nieuwe dakramen, geen fouten', nieuweDakramen === 4 && dakramen === 4 && w.fouten.length === 0, 'dak.dakraam ' + nieuweDakramen + ', alle dakramen ' + dakramen + ', fouten ' + JSON.stringify(w.fouten));
  const anderePosten = v.rijen.filter((x) => !/dakraam/i.test(x.naam) && x.soort !== 'duur');
  toets('wijziging: geen andere post veranderd', anderePosten.length === 0, JSON.stringify(anderePosten.map((x) => [x.soort, x.naam])));
  toets('wijziging: prijs omhoog en het verschil sluit', v.verschilExcl > 1500 && sluit(v), Math.round(v.verschilExcl) + ' excl.');
  toets('wijziging: de AI noemt geen bedrag', geenBedrag(uit.antwoord.join(' ')), uit.antwoord.join(' '));
}

/* 3. Wat als: 16 cm sarking. Een voorstel: de 12 cm-post weg, de 16 cm-post erbij met hetzelfde dakvlak. */
{
  const uit = await stel('Wat kost het met 16 cm sarking in plaats van 12 cm?');
  const w = RP.pasWijzigingToe(m, uit.ops);
  const v = RP.vergelijk(m, tar, w.m, tar, w.herkomst);
  const s16 = w.m.posten.filter((p) => p.code === 'dak.sarking160');
  toets('wat als: actie voorstel', uit.actie === 'voorstel', uit.actie);
  toets('wat als: 12 cm weg, 16 cm erbij op 94 m²', !w.m.posten.some((p) => p.code === 'dak.sarking120') && s16.length === 1 && Number(s16[0].hoeveelheid) === 94 && w.fouten.length === 0, JSON.stringify(uit.ops));
  toets('wat als: alleen de isolatie verandert, het verschil sluit', v.rijen.filter((x) => !/sarking/i.test(x.naam) && x.soort !== 'duur').length === 0 && v.verschilExcl > 0 && sluit(v), Math.round(v.verschilExcl) + ' excl.');
  toets('wat als: de AI noemt geen bedrag', geenBedrag(uit.antwoord.join(' ')), uit.antwoord.join(' '));
}

/* 4. Een andere ploeg: 4 man. Dezelfde uitkomst als "Met 4 man" bij Wat de prijs verschuift. */
{
  const uit = await stel('Reken met 4 man.');
  const w = RP.pasWijzigingToe(m, uit.ops);
  const v = RP.vergelijk(m, tar, w.m, Object.assign({}, tar, w.ploeg ? { ploeg: w.ploeg } : {}), w.herkomst);
  const watAls = a.watAls.find((x) => /^Met 4 man/.test(x.label));
  toets('ploeg: actie toepassen met ploeg 4, posten onaangeroerd', uit.actie === 'toepassen' && w.ploeg === 4 && JSON.stringify(w.m.posten) === JSON.stringify(m.posten), uit.actie + ' ploeg ' + w.ploeg);
  toets('ploeg: verschil = wat-als "Met 4 man"', !!watAls && Math.abs(v.verschilExcl - watAls.verschil) < 0.001, Math.round(v.verschilExcl) + ' tegen ' + (watAls && Math.round(watAls.verschil)));
}

console.log(fouten ? '\n' + fouten + ' FOUT(EN)' : '\nALLES OK');
process.exitCode = fouten ? 1 : 0;
