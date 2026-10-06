/* Test van de rekenmotor (motor.js + data/*.js). Gebruik: node test-motor.cjs */
const { laadRP } = require('./laad.cjs');
const RP = laadRP();
const { DATA, bereken, analyse, telWaarden, bouwPrompt, bouwUitlegPrompt, pasRegelToe, leegMeetstaat, VOORBEELD } = RP;

let fouten = 0;
const toets = (naam, ok, detail) => { if (!ok) fouten++; console.log((ok ? 'OK   ' : 'FOUT ') + naam + (detail ? '  [' + detail + ']' : '')); };
const bijna = (a, b, marge) => Math.abs(a - b) <= marge;
const kopie = (x) => JSON.parse(JSON.stringify(x));

const r = bereken(VOORBEELD.meetstaat, {});

/* 1. Positieve controle: manuren los met de hand uitgerekend uit de datatabel.
      stelling 96x0,12 + afbraak 94x0,22 + onderdak 94x0,05 + sarking 94x0,25 + tengel 94x0,05 + panlat 94x0,10
      + pannen 94x0,30 + nok 8x0,35 + gevelpan 11,7x0,25 + aansluiting 11,7x0,5 + schouw 5 + dakramen 10 + goot 16x0,6 + afvoer 12x0,4 */
const hand = 11.52 + 20.68 + 4.7 + 23.5 + 4.7 + 9.4 + 28.2 + 2.8 + 2.925 + 5.85 + 5 + 10 + 9.6 + 4.8;
toets('manuren = handberekening', bijna(r.uren, hand, 0.01), r.uren.toFixed(2) + ' tegen ' + hand.toFixed(2));
toets('werkdagen = ceil(manuren / 8 / 3)', r.werkdagen === Math.ceil(hand / 8 / 3), String(r.werkdagen));

/* 2. Afval per soort: puin 94x45 = 4230 kg -> 1 container van 12 ton; hout 94x5 = 470 kg -> 1 container hout (4 ton);
      rest 1x5 + 16x3 + 12x1,5 = 71 kg -> 1 big bag */
toets('afval = 4771 kg', bijna(r.afvalKg, 4771, 0.01), String(r.afvalKg));
toets('puin 4230 kg in 1 container', r.afvoer.some((x) => x.soort === 'puin' && x.soort2 === 'container' && x.aantal === 1 && bijna(x.kg, 4230, 0.01)), JSON.stringify(r.afvoer.map((x) => [x.soort, x.soort2, x.aantal, Math.round(x.kg)])));
toets('hout 470 kg in 1 container', r.afvoer.some((x) => x.soort === 'hout' && x.soort2 === 'container' && x.aantal === 1));
toets('rest 71 kg in 1 big bag', r.afvoer.some((x) => x.soort === 'rest' && x.soort2 === 'bigbag' && x.aantal === 1 && bijna(x.kg, 71, 0.01)));
toets('2 containers in totaal', r.containers === 2, String(r.containers));
const zwaar = kopie(VOORBEELD.meetstaat);
zwaar.posten.find((p) => p.code === 'dak.afbraak').hoeveelheid = 280;
toets('12,6 ton puin = 2 containers puin', bereken(zwaar, {}).afvoer.find((x) => x.soort === 'puin').aantal === 2, String(bereken(zwaar, {}).afvoer.find((x) => x.soort === 'puin').kg));
const asbest = kopie(VOORBEELD.meetstaat);
asbest.posten.push({ fase: 'Afbraak', naam: 'Asbestleien van de schouw verwijderen', eenheid: 'm²', hoeveelheid: 2, uur_per_eenheid: 1, materiaal_eur_per_eenheid: 0, kg_per_eenheid: 0, afval_kg_per_eenheid: 20, afval_soort: 'asbest' });
toets('asbest gaat altijd apart (big bag asbest)', bereken(asbest, {}).afvoer.some((x) => x.soort === 'asbest' && x.soort2 === 'bigbag'));
toets('stelling huur = m² x prijs x weken (6 werkdagen = 2 weken)', r.weken === 2 && bijna(r.regels.find((x) => x.code === 'dak.stelling').huurKost, 96 * 4 * 2, 0.01), String(r.regels.find((x) => x.code === 'dak.stelling').huurKost));

/* 3. Pannen: 94 x 21,3 = 2002,2 -> 2003 stuks, 2003 x 2,1 kg */
const pan = r.materialen.find((x) => x.naam === 'Kleipan');
toets('kleipannen 2003 stuks', pan && pan.aantal === 2003, pan && String(pan.aantal));
toets('kleipannen 4206,3 kg', pan && bijna(pan.kg, 4206.3, 0.01), pan && String(pan.kg));

/* 4. Kostenopbouw sluit */
const k = r.kosten;
toets('subtotaal = arbeid + materiaal + materieel', bijna(k.subtotaal, k.arbeid + k.materiaal + k.materieel, 0.001));
toets('arbeid = manuren x uurtarief 57,5', bijna(k.arbeid, hand * 57.5, 0.5), k.arbeid.toFixed(2));
toets('materiaal = inkoop x 1,15', bijna(k.materiaal, k.materiaalInkoop * 1.15, 0.001));
toets('materieel = inkoop x 1,15', bijna(k.materieel, k.materieelInkoop * 1.15, 0.001));
toets('excl = subtotaal x 1,05 (onvoorzien)', bijna(k.excl, k.subtotaal * 1.05, 0.001));
toets('incl = excl x 1,06', bijna(k.incl, k.excl * 1.06, 0.001));
toets('btw 21% rekent door', bijna(bereken(VOORBEELD.meetstaat, { btw: 21 }).kosten.incl, k.excl * 1.21, 0.001));
toets('eigen uurtarief rekent door', bijna(bereken(VOORBEELD.meetstaat, { uurtarief: 60 }).kosten.arbeid, hand * 60, 0.5));
toets('som materiaallijst = materiaal inkoop', bijna(r.materialen.reduce((a, x) => a + x.kost, 0), k.materiaalInkoop, 0.001));
toets('som materieellijst = materieel inkoop', bijna(r.materieel.reduce((a, x) => a + x.kost, 0), k.materieelInkoop, 0.001));

/* 5. Schaal: dubbele hoeveelheden = dubbele manuren */
const dubbel = kopie(VOORBEELD.meetstaat);
dubbel.posten.forEach((p) => { p.hoeveelheid *= 2; });
toets('dubbele hoeveelheid = dubbele manuren', bijna(bereken(dubbel, {}).uren, 2 * r.uren, 0.01));

/* 6. Bron: de post zonder code is AI-schatting en telt mee in het aandeel */
const ai = r.regels.filter((x) => x.bron === 'ai');
toets('1 regel AI-schatting', ai.length === 1, String(ai.length));
const aiKost = ai[0].arbeidKost + ai[0].matKost * 1.15;
toets('aandeel datatabel = 1 - AI-kost / subtotaal', bijna(r.aandeelData, 1 - aiKost / k.subtotaal, 1e-9), (r.aandeelData * 100).toFixed(1) + '%');
const zonderAi = kopie(VOORBEELD.meetstaat);
zonderAi.posten = zonderAi.posten.filter((p) => p.code);
toets('zonder AI-post = 100% datatabel', bereken(zonderAi, {}).aandeelData === 1);

/* 7. Onbekende code zonder cijfers wordt overgeslagen en gemeld, niet stil meegeteld */
const vreemd = kopie(VOORBEELD.meetstaat);
vreemd.posten.push({ code: 'dak.bestaat-niet', hoeveelheid: 10 });
const rv = bereken(vreemd, {});
toets('onbekende code gemeld', rv.overgeslagen.length === 1 && rv.overgeslagen[0] === 'dak.bestaat-niet');
toets('onbekende code verandert de prijs niet', bijna(rv.kosten.incl, k.incl, 0.001));

/* 8. Ploeg: 2 man duurt langer, de manuren blijven gelijk */
const r2 = bereken(VOORBEELD.meetstaat, { ploeg: 2 });
toets('2 man: zelfde manuren, meer werkdagen', bijna(r2.uren, r.uren, 0.001) && r2.werkdagen > r.werkdagen, r2.werkdagen + ' tegen ' + r.werkdagen);

/* 9. Lege of kapotte meetstaat geeft nul, geen crash */
const leeg = bereken({ posten: [] }, {});
toets('lege meetstaat = € 0', leeg.kosten.incl === 0 && leeg.werkdagen === 0);
toets('kapotte meetstaat = € 0', bereken(null, {}).kosten.incl === 0);

/* 10. De vraag aan de AI bevat elke code en de klus */
const vraag = bouwPrompt('TESTKLUS 123');
toets('prompt bevat alle codes', Object.keys(DATA.posten).every((c) => vraag.includes(c)));
toets('prompt bevat de klus', vraag.includes('TESTKLUS 123'));
toets('telWaarden > 0', telWaarden() > 0, String(telWaarden()));

/* 11. Realtime: dezelfde meetstaat regel per regel opgebouwd geeft dezelfde prijs */
const stroom = leegMeetstaat();
const v = VOORBEELD.meetstaat;
pasRegelToe(stroom, { t: 'kop', titel: v.titel, dakvlak_m2: v.dakvlak_m2, ploeg: v.ploeg, materieel_per_dag: v.materieel_per_dag });
let halverwege = 0;
v.posten.forEach((p, i) => { pasRegelToe(stroom, Object.assign({ t: 'post' }, p)); if (i === 5) halverwege = bereken(stroom, {}).kosten.incl; });
v.aannames.forEach((tekst) => pasRegelToe(stroom, { t: 'aanname', tekst }));
toets('regel per regel = zelfde prijs', bijna(bereken(stroom, {}).kosten.incl, k.incl, 0.001));
toets('halverwege is de prijs lager en groter dan 0', halverwege > 0 && halverwege < k.incl, halverwege.toFixed(0));
toets('aannames komen mee', stroom.aannames.length === v.aannames.length);
const inEens = pasRegelToe(leegMeetstaat(), kopie(v));
toets('één JSON-object in plaats van regels werkt ook', bijna(bereken(inEens, {}).kosten.incl, k.incl, 0.001));

/* 12. Analyse: de delen tellen op tot de prijs en elke wat-als komt uit een herberekening */
const a = analyse(v, {});
toets('top 5 + rest = prijs excl. btw', bijna(a.top.reduce((s, d) => s + d.bedrag, 0) + a.restBedrag, k.excl, 0.01));
toets('grootste post is de sarking-isolatie', /Sarking/.test(a.top[0].naam), a.top[0].naam + ' ' + a.top[0].bedrag.toFixed(0));
const wa = (re) => a.watAls.find((w) => re.test(w.label));
toets('10 m2 dakvlak meer kost geld', !!wa(/10 m² dakvlak meer/) && wa(/10 m² dakvlak meer/).verschil > 500, wa(/10 m²/) && wa(/10 m²/).verschil.toFixed(0));
const zonder = kopie(v);
zonder.posten = zonder.posten.filter((p) => p.code !== 'dak.sarking120');
toets('zonder sarking = herberekening', !!wa(/Zonder sarking/) && bijna(wa(/Zonder sarking/).verschil, bereken(zonder, {}).kosten.excl - k.excl, 0.001), wa(/Zonder sarking/) && wa(/Zonder sarking/).verschil.toFixed(0));
toets('21% btw = excl x 0,15', !!wa(/21% btw/) && bijna(wa(/21% btw/).verschil, k.excl * 0.15, 0.001));
toets('geen btw-regel als er al 21% staat', !analyse(v, { btw: 21 }).watAls.some((w) => /21% btw/.test(w.label)));
toets('niet gevraagd, wel nodig: 4 werken + lift + werfwagen + 3 afvoerposten', a.extras.length === 9, a.extras.map((d) => d.naam.slice(0, 14)).join(' | '));
const bijnaVol = kopie(v);
bijnaVol.posten.find((p) => p.code === 'dak.afbraak').hoeveelheid = 250;
toets('container puin bijna vol wordt gemeld', analyse(bijnaVol, {}).watAls.some((w) => /puin meer en er komt een container bij/.test(w.label)), analyse(bijnaVol, {}).watAls.map((w) => w.label).join(' | '));
toets('container puin op 35% wordt niet gemeld', !a.watAls.some((w) => /puin meer/.test(w.label)));

/* 13. Prompts: de meting en de berekening gaan mee */
const gm = { adres: 'Teststraat 1, 2800 Mechelen', gebouw: { oppervlakte: 72, omtrek: 36, lengte: 12, breedte: 6 }, bebouwing: { type: 'gesloten', buren: 2, gemeneMuur: 24, vrijeGevel: 12 },
  dak: { vorm: 'hellend', helling: 42, platAandeel: 0.1, dakvlak: 94, nokhoogte: 10.2, kroonlijst: 6.1, noklengte: 6, overspanning: 12 } };
toets('prompt met meting bevat de gemeten maten', /GEMETEN OP HET ADRES/.test(bouwPrompt('x', gm)) && bouwPrompt('x', gm).includes('helling 42 graden'));
toets('prompt zonder meting bevat geen meetblok', !/GEMETEN OP HET ADRES/.test(bouwPrompt('x', null)));
const up = bouwUitlegPrompt(VOORBEELD.klus, null, v, {});
toets('uitlegvraag bevat de uitgerekende prijs en de wat-als', up.includes('"incl_btw":' + Math.round(k.incl)) && up.includes('"wat_als"'), String(Math.round(k.incl)));

console.log('\nVOORBEELD: ' + r.uren.toFixed(1) + ' manuren, ' + r.ploeg + ' man, ' + r.werkdagen + ' werkdagen, ' +
  Math.round(r.matKg) + ' kg naar boven, ' + Math.round(r.afvalKg) + ' kg afval, ' + r.containers + ' container');
console.log('arbeid ' + k.arbeid.toFixed(0) + ' | materiaal ' + k.materiaal.toFixed(0) + ' (inkoop ' + k.materiaalInkoop.toFixed(0) + ') | materieel ' + k.materieel.toFixed(0) +
  ' | subtotaal ' + k.subtotaal.toFixed(0) + ' | excl ' + k.excl.toFixed(0) + ' | incl ' + k.incl.toFixed(0) + ' | per m2 ' + r.perM2.toFixed(0));
console.log(fouten ? '\n' + fouten + ' FOUT(EN)' : '\nALLES OK');
process.exit(fouten ? 1 : 0);
