/* Pagina van de Richtprijs-AI: invoer, stroom van de AI, weergave. Rekenwerk staat in motor.js. */
(function () {
  const RP = globalThis.RP;
  const DATA = RP.DATA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n2 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const eur = (x) => '€ ' + n0.format(Math.round(x));
  const eur2 = (x) => '€ ' + n2.format(x);
  const getal = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? n0.format(x) : n1.format(x));
  const gewicht = (kg) => (kg >= 1000 ? n1.format(kg / 1000) + ' ton' : n0.format(Math.round(kg)) + ' kg');
  const man = (n) => n + ' man';
  const dagen = (d) => n1.format(d) + (Math.abs(d - 1) < 0.05 ? ' werkdag' : ' werkdagen');
  const KOP = { 'x-richtprijs': '1' };

  const VELDEN = { uurtarief: 't-uurtarief', urenPerDag: 't-uren', materiaalmarge: 't-marge', onvoorzien: 't-onvoorzien', btw: 't-btw' };
  let tarieven = Object.assign({}, DATA.tarieven);
  try {
    /* v2: het model met uurtarief + materiaalmarge (6 okt); de oude sleutel met uurkost/AK/winst wordt niet meer gelezen. */
    const bewaard = JSON.parse(localStorage.getItem('richtprijs-tarieven-v2') || 'null');
    if (bewaard && typeof bewaard === 'object') for (const k of Object.keys(VELDEN)) if (bewaard[k] !== null && Number(bewaard[k]) >= 0) tarieven[k] = Number(bewaard[k]);
  } catch (e) { /* zonder opslag werkt de pagina met de startwaarden */ }
  if (!(tarieven.uurtarief > 0)) tarieven.uurtarief = DATA.tarieven.uurtarief;
  if (!(tarieven.urenPerDag > 0)) tarieven.urenPerDag = DATA.tarieven.urenPerDag;
  if (tarieven.btw !== 21) tarieven.btw = 6;

  /* Standaarden van de sector: bewaard op deze pc, aanpasbaar in de pagina. */
  let standaardenOver = {};
  try { standaardenOver = JSON.parse(localStorage.getItem('richtprijs-standaarden') || '{}') || {}; } catch (e) { standaardenOver = {}; }
  let standaarden = RP.standaardWaarden(standaardenOver);
  function tekenStandaarden() {
    $('standaarden').innerHTML = RP.STANDAARDEN.map((s) => '<div><label for="s-' + s.k + '">' + esc(s.label) + (s.eenheid ? ' (' + esc(s.eenheid) + ')' : '') + '</label>' +
      '<input id="s-' + s.k + '" type="' + (s.tekst ? 'text' : 'number') + '"' + (s.tekst ? '' : ' inputmode="decimal" min="0" step="any"') + ' value="' + esc(standaarden[s.k]) + '"></div>').join('');
    for (const s of RP.STANDAARDEN) $('s-' + s.k).addEventListener('input', () => {
      standaardenOver[s.k] = $('s-' + s.k).value;
      standaarden = RP.standaardWaarden(standaardenOver);
      try { localStorage.setItem('richtprijs-standaarden', JSON.stringify(standaardenOver)); } catch (e) { /* opslag is een gemak, geen voorwaarde */ }
    });
  }

  const BRONTEKST = { beschrijving: 'Uit de beschrijving', gemeten: 'Gemeten op het adres', berekend: 'Berekend', standaard: 'Standaard van de sector', vast: 'Aangepast' };
  let kenmerkenGetekend = '';
  function tekenKenmerken() {
    const blok = $('kenmerken-blok');
    const heeft = !!(m && m.kenmerken && Object.keys(m.kenmerken).length);
    blok.hidden = !heeft;
    if (!heeft) { kenmerkenGetekend = ''; $('kenmerken').innerHTML = ''; return; }
    /* Alleen opnieuw tekenen als de inhoud veranderde, zodat een veld waarin getypt wordt blijft staan. */
    const sleutel = JSON.stringify(m.kenmerken);
    if (sleutel === kenmerkenGetekend) return;
    kenmerkenGetekend = sleutel;
    const sleutels = Object.keys(m.kenmerken);
    $('kenmerken').innerHTML = sleutels.map((k, i) => {
      const x = m.kenmerken[k];
      return '<div><label for="km-' + i + '">' + esc(x.label) + (x.eenheid ? ' (' + esc(x.eenheid) + ')' : '') + '</label>' +
        '<input id="km-' + i + '" type="' + (x.tekst ? 'text' : 'number') + '"' + (x.tekst ? '' : ' inputmode="decimal" min="0" step="any"') + ' value="' + esc(x.waarde) + '">' +
        '<span class="bronchip bronchip--' + esc(x.bron) + '">' + esc(BRONTEKST[x.bron] || x.bron) + '</span></div>';
    }).join('');
    sleutels.forEach((k, i) => {
      const el = $('km-' + i);
      el.addEventListener('input', () => {
        const x = m.kenmerken[k];
        x.waarde = x.tekst ? el.value : parseFloat(String(el.value).replace(',', '.'));
        x.bron = 'vast';
        kenmerkenGetekend = JSON.stringify(m.kenmerken);
        el.nextElementSibling.className = 'bronchip bronchip--vast';
        el.nextElementSibling.textContent = BRONTEKST.vast;
        $('herbereken').hidden = loopt;
      });
    });
    $('herbereken').hidden = true;
  }

  let m = null;            /* de meetstaat, groeit terwijl de AI schrijft */
  let gemeten = null;      /* de meting op het adres */
  let ploeg = 0;           /* 0 = het voorstel van de AI */
  let voorbeeld = false;
  let loopt = false;
  let uitleg = { tekst: '', staat: 'geen' };
  let laatsteKlus = '';
  const huidig = () => Object.assign({}, tarieven, ploeg ? { ploeg } : {});

  function tekenGemeten(fout) {
    const el = $('gemeten');
    if (!gemeten && !fout) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    if (!gemeten) { el.innerHTML = '<h2>Gemeten op het adres</h2><p class="fout">' + esc(fout) + ' De AI rekent met de maten uit de beschrijving.</p>'; return; }
    const g = gemeten, d = g.dak, b = g.bebouwing;
    el.innerHTML = '<h2>Gemeten op het adres</h2><p>' + esc(g.adres) + '</p><dl class="meting">' +
      '<div><dt>Grondoppervlak</dt><dd>' + getal(g.gebouw.oppervlakte) + ' m²<span>' + getal(g.gebouw.lengte) + ' × ' + getal(g.gebouw.breedte) + ' m</span></dd></div>' +
      '<div><dt>Bebouwing</dt><dd>' + esc(b.type) + '<span>' + getal(b.gemeneMuur) + ' m gemene muur, ' + getal(b.vrijeGevel) + ' m vrije gevel</span></dd></div>' +
      (d ? '<div><dt>Dak</dt><dd>' + esc(d.vorm) + (d.helling ? '<span>helling ' + d.helling + '°, ' + Math.round(d.platAandeel * 100) + '% plat</span>' : '') + '</dd></div>' +
        '<div><dt>Dakvlak</dt><dd>' + getal(d.dakvlak) + ' m²<span>zonder oversteek</span></dd></div>' +
        '<div><dt>Nokhoogte</dt><dd>' + getal(d.nokhoogte) + ' m<span>kroonlijst ' + getal(d.kroonlijst) + ' m</span></dd></div>' : '') +
      '</dl><p class="klein">' + esc(g.bron) + (d ? '. ' + d.punten + ' hoogtepunten gemeten.' : '. Geen hoogtemeting voor dit gebouw.') +
      (g.gebouw.afstandTotAdres > 0 ? ' Het adrespunt ligt ' + getal(g.gebouw.afstandTotAdres) + ' m naast dit gebouw: controleer het grondoppervlak.' : '') + '</p>';
  }

  function teken() {
    tekenKenmerken();
    const a = m && m.posten.length ? RP.analyse(m, huidig()) : null;
    const heeft = !!(a && a.r.regels.length);
    document.querySelectorAll('.na').forEach((e) => { e.hidden = !heeft; });
    if (!heeft) {
      $('uitkomst').innerHTML = '<p class="leeg">' + (loopt ? 'De berekening loopt.' : 'Nog geen berekening. Beschrijf de klus en klik op Bereken richtprijs.') + '</p>';
      return;
    }
    const r = a.r;
    if (document.activeElement !== $('t-ploeg')) $('t-ploeg').value = String(r.ploeg);
    const pd = Math.round(r.aandeelData * 100);
    const pa = 100 - pd;

    $('uitkomst').innerHTML =
      '<h2>' + (voorbeeld ? '<span class="vlag">Voorbeeld</span>' : '') + esc(m.titel || 'Richtprijs') + '</h2>' +
      '<div><p class="prijs">' + eur(r.kosten.incl) + '<small>incl. ' + r.t.btw + '% btw</small></p>' +
      '<p class="onder">' + eur(r.kosten.excl) + ' excl. btw' + (r.perM2 ? ' · ' + eur(r.perM2) + ' per m² ' + esc(r.vlakNaam) : '') + '</p></div>' +
      '<dl class="feiten">' +
        '<div><dt>Ploeg</dt><dd>' + man(r.ploeg) + '</dd></div>' +
        '<div><dt>Duur</dt><dd>' + r.werkdagen + (r.werkdagen === 1 ? ' werkdag' : ' werkdagen') + '</dd></div>' +
        '<div><dt>Arbeid</dt><dd>' + n0.format(Math.round(r.uren)) + ' manuren<span>' + n1.format(r.mandagen) + ' mandagen</span></dd></div>' +
        '<div><dt>Materiaal naar boven</dt><dd>' + gewicht(r.matKg) + '</dd></div>' +
        '<div><dt>Afval naar beneden</dt><dd>' + gewicht(r.afvalKg) + '<span>' + r.containers + (r.containers === 1 ? ' container' : ' containers') + '</span></dd></div>' +
      '</dl>' +
      '<div><div class="balk" role="img" aria-label="' + pd + '% van de kostprijs uit de datatabel, ' + pa + '% AI-schatting">' +
        '<i class="d" style="width:' + pd + '%"></i><i class="a" style="width:' + pa + '%"></i></div>' +
      '<p class="legende"><span><i class="stip" style="background:var(--paneel-data)"></i><b>' + pd + '%</b> van de kostprijs uit de datatabel</span>' +
        '<span><i class="stip" style="background:var(--paneel-ai)"></i><b>' + pa + '%</b> AI-schatting</span></p></div>';

    const grootste = Math.max(a.top.length ? a.top[0].bedrag : 1, a.restBedrag);
    let gh = a.top.map((d) => '<div class="r"><span class="n">' + esc(d.naam) + '</span><span class="b"><i class="' + (d.bron === 'ai' ? 'ai' : '') + '" style="width:' + Math.max(2, Math.round(d.bedrag / grootste * 100)) + '%"></i></span>' +
      '<span class="g">' + eur(d.bedrag) + '</span><span class="g p">' + Math.round(d.aandeel * 100) + '%</span></div>').join('');
    if (a.restAantal) gh += '<div class="r"><span class="n">' + a.restAantal + ' kleinere posten samen</span><span class="b"><i style="width:' + Math.max(2, Math.round(a.restBedrag / grootste * 100)) + '%"></i></span>' +
      '<span class="g">' + eur(a.restBedrag) + '</span><span class="g p">' + Math.round(a.restBedrag / r.kosten.excl * 100) + '%</span></div>';
    $('geld').innerHTML = gh + '<p class="klein">Bedragen excl. btw, met algemene kosten en winst.</p>';
    $('watals').innerHTML = a.watAls.map((w) => '<div><dt>' + esc(w.label) + '</dt><dd>' + (w.verschil >= 0 ? '+ ' : '− ') + eur(Math.abs(w.verschil)) + (w.inclBtw ? ' incl. btw' : ' excl. btw') + '</dd></div>').join('');

    let w = '<div class="tabel kol-werk"><div class="rij rij--kop"><span>Werk</span><span class="g">Hoeveelheid</span><span class="g">Manuren</span><span class="g">Materiaal</span><span class="g">Naar boven</span><span class="g">Afval</span><span class="g">Bron</span></div>';
    for (const f of r.fases) {
      w += '<div class="fase"><b>' + esc(f.naam) + '</b><span>' + n1.format(f.uren) + ' manuren · ' + dagen(f.dagen) + ' met ' + man(r.ploeg) + '</span></div>';
      for (const x of f.regels) {
        const sub = [x.gevraagd ? '' : x.waarom, x.toelichting].filter(Boolean).join(' · ');
        w += '<div class="rij"><span class="naam">' + esc(x.naam) + (x.gevraagd ? '' : '<em>Niet gevraagd, wel nodig</em>') + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
          '<span class="g" data-l="Hoeveelheid">' + getal(x.hoeveelheid) + ' ' + esc(x.eenheid) + '</span>' +
          '<span class="g" data-l="Manuren">' + n1.format(x.uren) + '</span>' +
          '<span class="g" data-l="Materiaal">' + eur(x.matKost + x.huurKost) + '</span>' +
          '<span class="g" data-l="Naar boven">' + gewicht(x.matKg) + '</span>' +
          '<span class="g" data-l="Afval">' + gewicht(x.afvalKg) + '</span>' +
          '<span class="g" data-l="Bron"><span class="bron bron--' + x.bron + '">' + (x.bron === 'data' ? 'Datatabel' : 'AI-schatting') + '</span></span></div>';
      }
    }
    w += '</div>';
    if (r.overgeslagen.length) w += '<p class="klein">Niet meegerekend, omdat de AI geen cijfers gaf: ' + esc(r.overgeslagen.join(', ')) + '.</p>';
    $('werkblad').innerHTML = w;

    let ml = '<div class="tabel kol-mat"><div class="rij rij--kop"><span>Materiaal</span><span class="g">Aantal</span><span class="g">Prijs</span><span class="g">Totaal</span><span class="g">Gewicht</span><span class="g">Bron</span></div>';
    for (const x of r.materialen) {
      ml += '<div class="rij"><span class="naam">' + esc(x.naam) + '</span>' +
        '<span class="g" data-l="Aantal">' + getal(x.aantal) + ' ' + esc(x.eenheid) + '</span>' +
        '<span class="g" data-l="Prijs">' + eur2(x.prijs) + '</span>' +
        '<span class="g" data-l="Totaal">' + eur(x.kost) + '</span>' +
        '<span class="g" data-l="Gewicht">' + gewicht(x.kg) + '</span>' +
        '<span class="g" data-l="Bron"><span class="bron bron--' + x.bron + '">' + (x.bron === 'data' ? 'Datatabel' : 'AI-schatting') + '</span></span></div>';
    }
    $('materialen').innerHTML = ml + '</div>';

    let eq = '<div class="tabel kol-eq"><div class="rij rij--kop"><span>Post</span><span class="g">Aantal</span><span class="g">Prijs</span><span class="g">Totaal</span></div>';
    for (const x of r.materieel) {
      eq += '<div class="rij"><span class="naam">' + esc(x.naam) + '</span>' +
        '<span class="g" data-l="Aantal">' + getal(x.aantal) + ' ' + esc(x.eenheid) + '</span>' +
        '<span class="g" data-l="Prijs">' + eur2(x.prijs) + '</span>' +
        '<span class="g" data-l="Totaal">' + eur(x.kost) + '</span></div>';
    }
    eq += '</div>';
    if (r.afvoer.length) eq += '<p class="klein">Afval: ' + r.afvoer.map((x) => gewicht(x.kg) + ' ' + esc(x.soort) + (x.soort2 === 'container' ? ' (' + x.ton + ' ton per container)' : ' (big bag)')).join(' · ') + '.</p>';
    $('materieel').innerHTML = eq;

    const k = r.kosten;
    $('kosten').innerHTML =
      '<div><dt>Arbeid: ' + n0.format(Math.round(r.uren)) + ' manuren × ' + eur2(r.t.uurtarief) + '</dt><dd>' + eur(k.arbeid) + '</dd></div>' +
      '<div><dt>Materiaal: inkoop ' + eur(k.materiaalInkoop) + ' + ' + getal(r.t.materiaalmarge) + '% marge</dt><dd>' + eur(k.materiaal) + '</dd></div>' +
      '<div><dt>Materieel en afvoer: inkoop ' + eur(k.materieelInkoop) + ' + ' + getal(r.t.materiaalmarge) + '% marge</dt><dd>' + eur(k.materieel) + '</dd></div>' +
      '<div class="som"><dt>Subtotaal</dt><dd>' + eur(k.subtotaal) + '</dd></div>' +
      '<div><dt>Onvoorzien ' + getal(r.t.onvoorzien) + '%</dt><dd>' + eur(k.onvoorzien) + '</dd></div>' +
      '<div class="som"><dt>Prijs excl. btw</dt><dd>' + eur(k.excl) + '</dd></div>' +
      '<div><dt>Btw ' + r.t.btw + '%</dt><dd>' + eur(k.btw) + '</dd></div>' +
      '<div class="som"><dt>Prijs incl. btw</dt><dd>' + eur(k.incl) + '</dd></div>';

    const lijst = (x, leeg) => (Array.isArray(x) && x.length ? x.slice(0, 12).map((s) => '<li>' + esc(s) + '</li>').join('') : '<li>' + leeg + '</li>');
    $('aannames').innerHTML = lijst(m.aannames, loopt ? 'De AI schrijft nog.' : 'De beschrijving en de meting gaven alle maten.');
    $('plaatsbezoek').innerHTML = lijst(m.plaatsbezoek, loopt ? 'De AI schrijft nog.' : 'De AI gaf geen punten op.');
  }

  function tekenUitleg() {
    const regels = uitleg.tekst.split('\n').map((s) => s.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim()).filter(Boolean);
    let h = regels.length ? '<ul class="punten">' + regels.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '';
    if (uitleg.staat === 'geen') h = '<p class="klein">De uitleg verschijnt na de berekening.</p>';
    if (uitleg.staat === 'bezig' && !regels.length) h = '<p class="klein">De AI schrijft de uitleg.</p>';
    if (uitleg.staat === 'oud') h += '<p class="klein">Deze uitleg hoort bij de vorige tarieven.</p>';
    if (uitleg.staat === 'fout') h += '<p class="klein fout">De uitleg is niet volledig aangekomen.</p>';
    $('uitleg').innerHTML = h;
    $('uitleg-opnieuw').hidden = loopt || !(uitleg.staat === 'oud' || uitleg.staat === 'fout');
  }

  function tekenData() {
    const upd = tarieven.urenPerDag;
    $('data-kop').textContent = 'Datatabel: ' + Object.keys(DATA.posten).length + ' werken in ' + Object.keys(RP.VAKKEN).length + ' vakken, ' + RP.telWaarden() + ' waarden';
    let h = '<p class="klein">Startwaarden van ' + esc(DATA.stand) + '. Inkoopprijzen zonder btw.</p>';
    for (const [code, p] of Object.entries(DATA.posten)) {
      h += '<article><h3>' + esc(RP.vakVan(code)) + ' · ' + esc(p.naam) + '</h3>' +
        '<p>' + n2.format(p.uur) + ' manuur per ' + esc(p.eenheid) + ': 1 man doet ' + getal(Math.round(upd / p.uur * 10) / 10) + ' ' + esc(p.eenheid) + ' per werkdag.</p>' +
        p.mat.map((x) => '<p>' + esc(x.naam) + ': ' + getal(x.per) + ' ' + esc(x.eenheid) + ' per ' + esc(p.eenheid) + ' aan ' + eur2(x.prijs) + (x.kg ? ', ' + getal(x.kg) + ' kg per ' + esc(x.eenheid) : '') + '.</p>').join('') +
        (p.afvalKg ? '<p>Afval: ' + getal(p.afvalKg) + ' kg per ' + esc(p.eenheid) + '.</p>' : '') + '</article>';
    }
    h += '<article><h3>Afvoer</h3>' + Object.entries(DATA.containers).map(([soort, c]) => '<p>' + esc(soort) + ': ' + esc(c.naam) + ' ' + eur2(c.prijs) + ', ' + c.ton + ' ton per container' + (c.bigbag ? '; onder ' + c.los + ' kg in big bags aan ' + eur2(c.bigbag) : '') + '.</p>').join('') + '</article>';
    h += '<article><h3>Materieel per werkdag</h3>' + Object.values(DATA.perDag).map((x) => '<p>' + esc(x.naam) + ': ' + eur2(x.prijs) + ' per werkdag.</p>').join('') + '</article>';
    $('data').innerHTML = h;
  }

  function vulVelden() { for (const [k, id] of Object.entries(VELDEN)) $(id).value = String(tarieven[k]); }
  function leesVelden(ev) {
    const lees = (id, min, terug) => { const v = parseFloat(String($(id).value).replace(',', '.')); return Number.isFinite(v) && v >= min ? v : terug; };
    tarieven.uurtarief = lees('t-uurtarief', 1, tarieven.uurtarief);
    tarieven.urenPerDag = lees('t-uren', 1, tarieven.urenPerDag);
    tarieven.materiaalmarge = lees('t-marge', 0, tarieven.materiaalmarge);
    tarieven.onvoorzien = lees('t-onvoorzien', 0, tarieven.onvoorzien);
    tarieven.btw = $('t-btw').value === '21' ? 21 : 6;
    if (ev && ev.target === $('t-ploeg')) ploeg = Math.round(lees('t-ploeg', 1, ploeg));
    try { localStorage.setItem('richtprijs-tarieven-v2', JSON.stringify(tarieven)); } catch (e) { /* opslag is een gemak, geen voorwaarde */ }
    if (uitleg.staat === 'klaar') uitleg.staat = 'oud';
    teken();
    tekenUitleg();
    tekenData();
  }
  for (const id of Object.values(VELDEN).concat('t-ploeg')) $(id).addEventListener('input', leesVelden);

  /* Eén vraag aan Claude via de lokale server; het antwoord komt binnen terwijl het geschreven wordt. */
  async function stroom(prompt, opDelta, signal) {
    const antwoord = await fetch('/api/ai', { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, KOP), body: JSON.stringify({ prompt }), signal });
    if (!antwoord.ok || !antwoord.body) {
      let tekst = 'De lokale server gaf geen antwoord.';
      try { tekst = (await antwoord.json()).fout || tekst; } catch (e) { /* geen leesbare fout */ }
      throw new Error(tekst);
    }
    const lezer = antwoord.body.getReader();
    const dec = new TextDecoder();
    let rest = '';
    for (;;) {
      const { value, done } = await lezer.read();
      if (done) break;
      rest += dec.decode(value, { stream: true });
      let i;
      while ((i = rest.indexOf('\n')) >= 0) {
        const regel = rest.slice(0, i).trim();
        rest = rest.slice(i + 1);
        if (!regel) continue;
        const o = JSON.parse(regel);
        if (o.fout) throw new Error('Claude gaf een fout: ' + o.fout);
        if (o.d) opDelta(o.d);
      }
    }
  }

  let ctl = null, klok = null, stap = '', t0 = 0, wacht = false;
  const status = (tekst, fout) => { const s = $('status'); s.textContent = tekst; s.className = fout ? 'fout' : ''; };
  const plan = () => { if (wacht) return; wacht = true; requestAnimationFrame(() => { wacht = false; teken(); }); };
  function bezig(aan) {
    loopt = aan;
    $('bereken').disabled = aan;
    $('stop').hidden = !aan;
    if (klok) { clearInterval(klok); klok = null; }
    if (aan) { t0 = Date.now(); klok = setInterval(() => status(stap + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s'), 500); }
  }

  async function schrijfUitleg() {
    uitleg = { tekst: '', staat: 'bezig' };
    tekenUitleg();
    try {
      await stroom(RP.bouwUitlegPrompt(laatsteKlus, gemeten, m, huidig()), (d) => { uitleg.tekst += d; tekenUitleg(); }, ctl.signal);
      uitleg.staat = 'klaar';
    } catch (e) {
      uitleg.staat = 'fout';
      throw e;
    } finally {
      tekenUitleg();
    }
  }

  async function start(vast) {
    const klus = $('klus').value.trim();
    const adres = $('adres').value.trim();
    if (klus.length < 25) { status('Beschrijf de klus met de soort werk en de maten.', true); return; }
    laatsteKlus = klus.slice(0, 6000);
    /* Met vaste kenmerken (Herbereken) blijft de meting op het adres staan; anders begint alles opnieuw. */
    const meten = !!adres && !vast;
    voorbeeld = false; m = RP.leegMeetstaat(); ploeg = 0; uitleg = { tekst: '', staat: 'geen' };
    if (!vast) gemeten = null;
    const stappen = meten ? 3 : 2;
    let nr = 1;
    stap = 'Start';
    bezig(true);
    tekenGemeten(); teken(); tekenUitleg();
    ctl = new AbortController();
    try {
      if (meten) {
        stap = 'Stap ' + nr++ + ' van ' + stappen + ': gebouw opmeten uit de kaartdata';
        let meetFout = '';
        try {
          const antwoord = await fetch('/api/adres?q=' + encodeURIComponent(adres), { headers: KOP, signal: ctl.signal });
          const j = await antwoord.json();
          if (antwoord.ok) gemeten = j; else meetFout = j.fout || 'De adresmeting is mislukt.';
        } catch (e) {
          if (e.name === 'AbortError') throw e;
          meetFout = 'De adresmeting is mislukt.';
        }
        tekenGemeten(meetFout);
      }
      stap = 'Stap ' + nr++ + ' van ' + stappen + ': de AI meet de klus op';
      let buf = '', alles = '';
      const eet = (regel) => {
        const s = regel.trim();
        if (s[0] !== '{') return;
        try { RP.pasRegelToe(m, JSON.parse(s)); stap = stap.replace(/( \(\d+ posten\))?$/, ' (' + m.posten.length + ' posten)'); plan(); } catch (e) { /* onvolledige regel: de volgende telt weer */ }
      };
      await stroom(RP.bouwPrompt(laatsteKlus, gemeten, standaarden, vast || null), (d) => {
        buf += d; alles += d;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) { eet(buf.slice(0, i)); buf = buf.slice(i + 1); }
      }, ctl.signal);
      eet(buf);
      if (!m.posten.length) {
        const a = alles.indexOf('{'), b = alles.lastIndexOf('}');
        if (a >= 0 && b > a) { try { RP.pasRegelToe(m, JSON.parse(alles.slice(a, b + 1))); } catch (e) { /* geen JSON */ } }
      }
      if (!RP.bereken(m, huidig()).regels.length) throw new Error('De AI gaf geen bruikbare meetstaat. Klik opnieuw op Bereken richtprijs.');
      teken();
      stap = 'Stap ' + nr++ + ' van ' + stappen + ': de AI legt de prijs uit';
      await schrijfUitleg();
      const duur = Math.round((Date.now() - t0) / 1000);
      bezig(false);
      status('Klaar in ' + duur + ' s.');
    } catch (e) {
      bezig(false);
      if (e && e.name === 'AbortError') status('Gestopt.');
      else status(e instanceof TypeError ? 'De lokale server antwoordt niet. Start start.cmd opnieuw.' : (e && e.message) || 'Er ging iets mis.', true);
    }
    teken();
    tekenUitleg();
  }

  $('bereken').addEventListener('click', () => start(null));
  $('herbereken').addEventListener('click', () => {
    if (loopt || !m || !m.kenmerken) return;
    const vast = {};
    for (const [k, x] of Object.entries(m.kenmerken)) if (x.waarde !== '' && x.waarde != null && !Number.isNaN(x.waarde)) vast[k] = { label: x.label, eenheid: x.eenheid, waarde: x.waarde };
    start(vast);
  });
  $('stop').addEventListener('click', () => { if (ctl) ctl.abort(); });
  $('uitleg-opnieuw').addEventListener('click', async () => {
    if (loopt || !m) return;
    stap = 'De AI legt de prijs uit';
    bezig(true);
    ctl = new AbortController();
    try { await schrijfUitleg(); bezig(false); status('Uitleg bijgewerkt.'); }
    catch (e) { bezig(false); status(e && e.name === 'AbortError' ? 'Gestopt.' : (e && e.message) || 'Er ging iets mis.', !(e && e.name === 'AbortError')); }
    tekenUitleg();
  });

  $('klus').value = RP.VOORBEELD.klus;
  if (location.hash === '#voorbeeld') { m = JSON.parse(JSON.stringify(RP.VOORBEELD.meetstaat)); voorbeeld = true; }
  vulVelden();
  tekenStandaarden();
  teken();
  tekenUitleg();
  tekenData();
})();
