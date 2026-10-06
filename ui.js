/* Pagina van de Richtprijs-AI: opdrachtkaart, stappen, toelichting, resultaatpaneel, rail, instellingen.
   Rekenwerk staat in motor.js; de server (server.mjs) meet het adres, vraagt de AI en bewaart.
   Eén IIFE: staat (S), tekenfuncties per zone, de stroom van de AI, de events. */
(function () {
  'use strict';
  const RP = globalThis.RP;
  const DATA = RP.DATA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n2 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const eur = (x) => '€ ' + n0.format(Math.round(x));
  const eur2 = (x) => '€ ' + n2.format(x);
  const getal = (x) => (Number.isFinite(Number(x)) ? (Math.abs(x - Math.round(x)) < 1e-9 ? n0.format(x) : n1.format(x)) : String(x == null ? '' : x));
  const gewicht = (kg) => (kg >= 1000 ? n1.format(kg / 1000) + ' ton' : n0.format(Math.round(kg)) + ' kg');
  const dagen = (d) => n1.format(d) + (Math.abs(d - 1) < 0.05 ? ' werkdag' : ' werkdagen');
  const streep = (x, f) => (x > 0 ? f(x) : '—');
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  const sec = (t0) => Math.round((Date.now() - t0) / 1000);
  const KOP = { 'x-richtprijs': '1' };
  const JSON_KOP = Object.assign({ 'content-type': 'application/json' }, KOP);
  const ic = (naam, extra) => '<svg class="ic' + (extra ? ' ' + extra : '') + '" aria-hidden="true"><use href="#i-' + naam + '"/></svg>';
  const chip = (tekst, soort) => '<span class="chip' + (soort ? ' chip--' + soort : '') + '">' + esc(tekst) + '</span>';
  const bronChip = (bron) => (bron === 'data' ? chip('Datatabel', 'merk') : chip('AI-schatting', 'ai'));
  const body = document.body;
  const reduceer = matchMedia('(prefers-reduced-motion: reduce)');
  const telefoon = matchMedia('(max-width: 899px)');
  const smal = matchMedia('(max-width: 1099px)');
  const TABS = ['overzicht', 'werkblad', 'materiaal', 'kenmerken'];
  const BRONTEKST = { beschrijving: 'Uit de klus', gemeten: 'Gemeten', berekend: 'Berekend', standaard: 'Standaard', vast: 'Aangepast' };
  const BRONSOORT = { gemeten: 'merk', standaard: 'ai' };
  const ASBEST = { ja: 'Asbest: ja', nee: 'Asbest: nee', onbekend: 'Asbest: onbekend' };
  const VOORBEELDEN = [
    { kort: 'Zadeldak halfopen woning: pannen, onderdak, sarking 12 cm, 2 dakramen…', klus: RP.VOORBEELD.klus },
    { kort: 'Halfopen woning. Voorgevel 8 m breed en 6 m hoog isoleren met 14 cm EPS en crepi. 3 ramen en 1 deur.', klus: 'Halfopen woning. Voorgevel 8 m breed en 6 m hoog isoleren met 14 cm EPS en crepi. 3 ramen en 1 deur.' },
    { kort: 'Plat dak 60 m² op een aanbouw: oude roofing eraf, 12 cm PIR, EPDM, 2 afvoeren, 1 koepel.', klus: 'Plat dak 60 m² op een aanbouw: oude roofing eraf, 12 cm PIR, EPDM, 2 afvoeren, 1 koepel.' },
  ];
  /* De toelichting bij het voorbeeld: geschreven op 7 oktober 2026 uit de cijfers van RP.analyse(RP.VOORBEELD.meetstaat). */
  const VOORBEELD_UITLEG = [
    'De sarking-isolatie van 12 cm draagt met € 5.825 of 25,6 % het meest: 94 m² maal € 3.649 inkoop aan PIR-platen plus 23,5 manuren, gevolgd door de kleipannen met € 4.000 of 17,6 % omdat het klein formaat van 20,7 stuks per m² 28,2 manuren legwerk vraagt.',
    'De klant vroeg niet om de stelling (€ 1.623), de nok (€ 542), de gevelpannen aan de vrije dakrand (€ 827) en de zinken aansluiting op het dak van de buur (€ 749), maar met de dakrand op 6 m, een nok van 8 m en een gemene zijde van 11,7 m kan geen van die vier weg.',
    'De isolatie verschuift de prijs het meest: zonder sarking valt er € 5.825 af, en elke 10 m² dakvlak meer kost € 1.515; met 4 man gaat de prijs € 590 omlaag en met 2 man € 380 omhoog.',
    'Niets is op het adres gemeten, dus de 94 m² dakvlak, de 11,7 lm vrije rand en de 16 lm goot komen uit de opgegeven 8 × 9 m en 40 graden; één meting van voorgevel, diepte en hellingshoek op het adres zet die hoeveelheden vast.',
    'De zinken aansluiting op het dak van de buur (€ 749) is een AI-schatting en de dakramen van 78 × 118 cm (€ 2.101) zijn een aanname; vraag de klant naar de hoogte van het buurdak en het gewenste raamformaat.',
    'Dakramen op de bestaande plaatsen en 2 afvoeren van elk 6 m zijn aannames uit de meetstaat; bij 21 % btw (woning jonger dan 10 jaar) komt er € 3.419 bij.',
  ].join('\n');

  /* ---------- staat ---------- */
  const S = {
    loopt: false, fase: 'leeg', stapNr: 0, id: null, versie: 1, titel: '', adres: '', klus: '', asbest: 'onbekend', datum: '',
    m: null, gemeten: null, meetFout: '', meetDuur: 0, ploeg: 0, voorbeeld: false,
    uitleg: { tekst: '', staat: 'geen', prijsBij: 0 },
    trail: [], trailDicht: false, trailKop: '', duur: 0,
    origineel: {}, gewijzigd: {}, open: new Set(), openPosten: new Set(), bewaard: false, oudePrijs: 0,
  };
  let inst = { tarieven: {}, standaarden: {}, posten: {}, offerte: {} };
  let tarieven = Object.assign({}, DATA.tarieven);
  let standaarden = RP.standaardWaarden({});
  let lijst = [];
  let laatsteA = null;
  let ctl = null;
  const huidig = () => Object.assign({}, tarieven, S.ploeg ? { ploeg: S.ploeg } : {});
  const analyse = () => (S.m && S.m.posten.length ? RP.analyse(S.m, huidig()) : null);
  const opslag = { lees(k, terug) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? terug : v; } catch (e) { return terug; } }, schrijf(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* opslag is een gemak, geen voorwaarde */ } } };

  /* ---------- instellingen: laden, toepassen, bewaren ---------- */
  function pasInstellingenToe() {
    RP.pasInstellingenToe(inst);
    tarieven = Object.assign({}, DATA.tarieven);
    if (tarieven.btw !== 21) tarieven.btw = 6;
    standaarden = RP.standaardWaarden(inst.standaarden || {});
  }
  async function laadInstellingen() {
    try {
      const a = await fetch('/api/instellingen', { headers: KOP });
      if (a.ok) { const o = await a.json(); if (o && typeof o === 'object' && !Array.isArray(o)) inst = Object.assign(inst, o); }
    } catch (e) { /* server weg: de startwaarden gelden */ }
    for (const k of ['tarieven', 'standaarden', 'posten', 'offerte']) if (!inst[k] || typeof inst[k] !== 'object') inst[k] = {};
    pasInstellingenToe();
  }
  let bewaarTimer = null;
  function bewaarInstellingen() {
    clearTimeout(bewaarTimer);
    $('tarieven-staat').textContent = '';
    bewaarTimer = setTimeout(async () => {
      try {
        /* De pagina bezit alleen tarieven, standaarden en posten. Wat een andere module (offerte) in hetzelfde bestand
           bewaarde, wordt eerst opnieuw gelezen en blijft staan. */
        let basis = {};
        try { const g = await fetch('/api/instellingen', { headers: KOP }); if (g.ok) basis = await g.json(); } catch (e) { basis = {}; }
        if (!basis || typeof basis !== 'object' || Array.isArray(basis)) basis = {};
        if (basis.offerte && typeof basis.offerte === 'object') inst.offerte = basis.offerte;
        const uit = Object.assign({}, basis, { tarieven: inst.tarieven, standaarden: inst.standaarden, posten: inst.posten });
        const a = await fetch('/api/instellingen', { method: 'POST', headers: JSON_KOP, body: JSON.stringify(uit) });
        $('tarieven-staat').textContent = a.ok ? 'Bewaard' : 'Niet bewaard';
      } catch (e) { $('tarieven-staat').textContent = 'Niet bewaard: de server antwoordt niet'; }
    }, 400);
  }
  function zetTarief(k, v) {
    if (k === 'ploeg') { S.ploeg = Math.max(1, Math.round(v)); }
    else {
      tarieven[k] = v;
      inst.tarieven = { uurtarief: tarieven.uurtarief, urenPerDag: tarieven.urenPerDag, materiaalmarge: tarieven.materiaalmarge, onvoorzien: tarieven.onvoorzien, btw: tarieven.btw };
      RP.pasInstellingenToe(inst);
      bewaarInstellingen();
    }
    tariefGewijzigd();
  }
  let oudeTimer = null;
  function tariefGewijzigd() {
    if (laatsteA) { S.oudePrijs = laatsteA.r.kosten.incl; clearTimeout(oudeTimer); oudeTimer = setTimeout(() => { S.oudePrijs = 0; teken(); }, 10000); }
    S.bewaard = false;
    teken();
    tekenUitlegRest();
    tekenTariefLinks();
  }

  /* ---------- kleine helpers voor de pagina ---------- */
  const status = (tekst, fout) => { const s = $('status'); s.textContent = tekst; s.className = fout ? 'fout' : ''; };
  let toastTimer = null;
  function toast(tekst) { const t = $('toast'); t.textContent = String(tekst).slice(0, 30); t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3000); }
  function bevestig(titel, tekst, ja, nee) {
    return new Promise((res) => {
      const d = $('bevestig');
      $('bevestig-titel').textContent = titel; $('bevestig-tekst').textContent = tekst; $('bevestig-ja').textContent = ja; $('bevestig-nee').textContent = nee;
      const klaar = (v) => { d.close(); $('bevestig-ja').onclick = $('bevestig-nee').onclick = null; d.oncancel = null; res(v); };
      $('bevestig-ja').onclick = () => klaar(true);
      $('bevestig-nee').onclick = () => klaar(false);
      d.oncancel = (e) => { e.preventDefault(); klaar(false); };
      d.showModal();
    });
  }
  const zetTab = (t) => { if (TABS.includes(t)) $('paneel').setAttribute('data-tab', t); };
  const zetSeg = (res) => body.classList.toggle('seg-resultaat', !!res);
  function zetLeeg(aan) { body.classList.toggle('leeg', aan); if (aan) body.classList.remove('paneel-open'); tekenTitel(); }
  function tekenTitel() {
    const t = S.titel || (S.m && S.m.titel) || '';
    document.title = t ? 'Richtprijs-AI · ' + t : 'Richtprijs-AI';
    document.querySelectorAll('[data-titel]').forEach((e) => { e.textContent = body.classList.contains('leeg') ? (e.closest('.topbalk') ? 'Richtprijs-AI' : '') : (t || 'Berekening'); });
  }
  function tekenVersie() {
    for (const id of ['versie-kop', 'versie-paneel']) { const e = $(id); e.hidden = body.classList.contains('leeg') || !S.m; e.textContent = 'v' + S.versie; }
  }
  const leesAsbest = () => (document.querySelector('input[name=asbest]:checked') || {}).value || 'onbekend';
  function zetAsbest(v) { const r = document.querySelector('input[name=asbest][value="' + (ASBEST[v] ? v : 'onbekend') + '"]'); if (r) r.checked = true; }
  function datumTekst(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }); }

  /* ---------- rail: eerdere berekeningen ---------- */
  async function laadLijst() {
    try { const a = await fetch('/api/berekeningen', { headers: KOP }); if (a.ok) lijst = await a.json(); } catch (e) { /* server weg: de lijst blijft zoals ze was */ }
    if (!Array.isArray(lijst)) lijst = [];
    tekenRail();
  }
  function groep(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return 'Ouder';
    const dag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((dag(new Date()) - dag(d)) / 86400000);
    return diff <= 0 ? 'Vandaag' : diff === 1 ? 'Gisteren' : diff < 7 ? 'Deze week' : 'Ouder';
  }
  function tekenRail() {
    const el = $('rail-lijst');
    if (!lijst.length) { el.innerHTML = '<div class="rail-leeg"><b>Nog geen berekeningen.</b><span class="klein">Elke berekening komt hier, met adres en prijs.</span></div>'; return; }
    const vakken = new Set(lijst.map((x) => x.vak).filter(Boolean));
    let h = '', vorige = '';
    for (const x of lijst) {
      const g = groep(x.datum);
      if (g !== vorige) { h += '<p class="rail-groep">' + g + '</p>'; vorige = g; }
      const actief = x.id === S.id;
      const sub = [x.prijs ? eur(x.prijs) : '', x.adres || (vakken.size <= 1 ? x.vak : '')].filter(Boolean).join(' · ');
      h += '<div class="rail-rij' + (actief ? ' is-actief' : '') + '">' +
        '<button class="laad" type="button" data-laad="' + esc(x.id) + '"' + (actief ? ' aria-current="true"' : '') + '><b>' + esc(x.titel || 'Berekening') + (vakken.size > 1 && x.vak ? ' ' + chip(x.vak) : '') + '</b><span class="sub">' + esc(sub) + '</span></button>' +
        '<button class="ikoonknop meer" type="button" data-verwijder="' + esc(x.id) + '" title="Verwijderen" aria-label="Verwijderen">' + ic('meer', 'vol') + '</button></div>';
    }
    el.innerHTML = h;
  }
  async function verwijder(id) {
    const ok = await bevestig('Berekening verwijderen?', 'De berekening verdwijnt van deze pc.', 'Verwijderen', 'Behouden');
    if (!ok) return;
    try {
      const a = await fetch('/api/berekeningen/' + encodeURIComponent(id), { method: 'DELETE', headers: KOP });
      if (!a.ok) { toast('Niet verwijderd'); return; }
      toast('Berekening verwijderd');
      if (id === S.id) { S.id = null; S.bewaard = false; tekenKnoppen(); }
      await laadLijst();
    } catch (e) { toast('Niet verwijderd'); }
  }

  /* ---------- paneel ---------- */
  const SKELET_GELD = '<div class="skelet-geld">' + '<div class="r"><span class="skelet" style="height:14px"></span><span class="skelet" style="height:8px"></span><span class="skelet" style="height:14px"></span><span class="skelet" style="height:14px"></span></div>'.repeat(6) + '</div>';
  const SKELET_RIJ = '<div class="skelet-rij">' + '<span class="skelet" style="height:14px"></span>'.repeat(7) + '</div>';
  const skeletLoopt = () => S.loopt && S.fase !== 'uitleg';

  function teken() {
    const a = analyse();
    const skelet = skeletLoopt();
    laatsteA = a && a.r.regels.length ? a : null;
    tekenKenmerken();
    tekenGemeten();
    tekenOverzicht(laatsteA, skelet);
    tekenWerkblad(laatsteA, skelet);
    tekenMateriaal(laatsteA, skelet);
    tekenCompact(laatsteA, skelet);
    tekenKnoppen();
    tekenVersie();
    tekenTitel();
  }

  function tariefChips(r) {
    const start = RP.DATA_START.tarieven;
    const c = [];
    const t = tarieven;
    if (t.uurtarief !== start.uurtarief) c.push(['uurtarief', 'Uurtarief ' + eur2(t.uurtarief)]);
    if (t.urenPerDag !== start.urenPerDag) c.push(['urenPerDag', 'Uren per werkdag ' + getal(t.urenPerDag)]);
    if (t.materiaalmarge !== start.materiaalmarge) c.push(['materiaalmarge', 'Marge ' + getal(t.materiaalmarge) + ' %']);
    if (t.onvoorzien !== start.onvoorzien) c.push(['onvoorzien', 'Onvoorzien ' + getal(t.onvoorzien) + ' %']);
    if (t.btw !== start.btw) c.push(['btw', 'Btw ' + t.btw + ' %']);
    if (S.ploeg && S.m && S.ploeg !== (S.m.ploeg || 3)) c.push(['ploeg', 'Ploeg ' + r.ploeg + ' man']);
    if (!c.length) return '';
    return '<div class="tariefchips">' + c.map(([k, tekst]) => '<span class="chip">' + esc(tekst) + '<button class="x" type="button" data-tarief-terug="' + k + '" title="Terug naar de startwaarde" aria-label="' + esc(tekst) + ': terug naar de startwaarde">' + ic('x', 'klein-ic') + '</button></span>').join('') + '</div>';
  }
  function caveat(m) {
    const n = (m.plaatsbezoek || []).length;
    return 'Richtprijs uit ' + (S.gemeten ? 'de kaartmeting' : 'de maten in de klus') + ', uw tarieven en de datatabel van ' + esc(DATA.stand) + '.' +
      (n ? ' <a href="#plaatsbezoek" data-naar="plaatsbezoek">' + n + (n === 1 ? ' punt' : ' punten') + '</a> controleert u bij het plaatsbezoek.' : '');
  }
  function tekenOverzicht(a, skelet) {
    const uit = $('uitkomst');
    if (!a || skelet) {
      if (!S.m || S.fase === 'leeg') { uit.innerHTML = '<p class="sr">Nog geen berekening.</p>'; $('geld-sectie').innerHTML = ''; }
      else {
        uit.innerHTML = '<div class="skelet-prijs"><span class="skelet" style="width:240px;height:20px"></span><span class="skelet" style="width:280px;height:52px;margin-top:8px"></span>' +
          (a ? '<p class="klein">Tussenstand ' + eur(a.r.kosten.incl) + ' · ' + a.r.regels.length + (a.r.regels.length === 1 ? ' post' : ' posten') + '</p>' : '<span class="skelet" style="width:200px;height:18px"></span>') + '</div>' +
          '<div class="skelet-tegels">' + '<span class="skelet" style="height:44px"></span>'.repeat(5) + '</div>';
        $('geld-sectie').innerHTML = '<div class="sectie-kop"><h3>Waar het geld zit</h3><span class="rechts">excl. btw, met marge</span></div>' + SKELET_GELD;
      }
      $('watals-sectie').innerHTML = '';
      $('kosten-sectie').innerHTML = '';
      return;
    }
    const r = a.r, k = r.kosten, m = S.m;
    const chips = [chip('v' + S.versie)].concat(S.voorbeeld ? [chip('Voorbeeld')] : [], S.fase === 'gestopt' ? [chip('Onvolledig')] : []);
    const bigbags = r.afvoer.filter((x) => x.soort2 === 'bigbag').reduce((s, x) => s + x.aantal, 0);
    const afvoerTekst = [r.containers ? r.containers + (r.containers === 1 ? ' container' : ' containers') : '', bigbags ? bigbags + (bigbags === 1 ? ' big bag' : ' big bags') : ''].filter(Boolean).join(', ');
    const pd = Math.round(r.aandeelData * 100), pa = 100 - pd;
    uit.innerHTML = '<div class="prijskaart"><div class="titel"><span>' + esc(S.titel || m.titel || 'Richtprijs') + '</span>' + chips.join('') + '</div>' +
      '<div class="prijs">' + (S.oudePrijs && Math.round(S.oudePrijs) !== Math.round(k.incl) ? '<span class="oud">' + eur(S.oudePrijs) + '</span>' : '') + '<b>' + eur(k.incl) + '</b><span>incl. ' + r.t.btw + ' % btw</span></div>' +
      '<div class="prijs-onder">' + eur(k.excl) + ' excl. btw' + (r.perM2 ? ' · ' + eur(r.perM2) + ' per m² ' + esc(r.vlakNaam) : '') + '</div>' +
      '<p class="caveat">' + caveat(m) + '</p>' + tariefChips(r) + '</div>' +
      '<div class="tegels"><div class="tegel"><small>Ploeg</small><b>' + r.ploeg + ' man</b></div><div class="tegel"><small>Werkdagen</small><b>' + r.werkdagen + '</b></div>' +
      '<div class="tegel"><small>Manuren</small><b>' + n0.format(Math.round(r.uren)) + '</b><span>' + n1.format(r.mandagen) + ' mandagen</span></div>' +
      '<div class="tegel"><small>Naar boven</small><b>' + gewicht(r.matKg) + '</b></div><div class="tegel"><small>Afval</small><b>' + gewicht(r.afvalKg) + '</b>' + (afvoerTekst ? '<span>' + afvoerTekst + '</span>' : '') + '</div></div>' +
      '<div class="balk" role="img" aria-label="' + pd + ' % van de kostprijs uit de datatabel, ' + pa + ' % AI-schatting"><i class="d" style="width:' + pd + '%"></i><i class="a" style="width:' + pa + '%"></i></div>' +
      '<p class="legende">' + pd + ' % van de kostprijs uit de datatabel · ' + pa + ' % AI-schatting</p>';

    const nietGevraagd = new Set(r.regels.filter((x) => !x.gevraagd).map((x) => x.naam));
    const grootste = Math.max(a.top.length ? a.top[0].bedrag : 1, a.restBedrag, 1);
    const geldRij = (naam, bedrag, aandeel, ai, extra) => '<div class="r"><span class="n"><em>' + esc(naam) + '</em>' + (extra ? chip('Niet gevraagd, wel nodig') : '') + '</span><span class="b"><i class="' + (ai ? 'ai' : '') + '" style="width:' + Math.max(2, Math.round(bedrag / grootste * 100)) + '%"></i></span><span class="g">' + eur(bedrag) + '</span><span class="p">' + Math.round(aandeel * 100) + '&nbsp;%</span></div>';
    let gh = a.top.map((d) => geldRij(d.naam, d.bedrag, d.aandeel, d.bron === 'ai', nietGevraagd.has(d.naam))).join('');
    if (a.restAantal) gh += geldRij(a.restAantal + (a.restAantal === 1 ? ' kleinere post' : ' kleinere posten samen'), a.restBedrag, k.excl > 0 ? a.restBedrag / k.excl : 0, false, false);
    $('geld-sectie').innerHTML = '<div class="sectie-kop"><h3>Waar het geld zit</h3><span class="rechts">excl. btw, met marge</span></div><div class="geld">' + gh + '</div>';

    $('watals-sectie').innerHTML = a.watAls.length ? '<div class="sectie-kop"><h3>Wat de prijs verschuift</h3></div><div class="watals">' + a.watAls.map((w) => {
      const pl = /^Met (\d+) man/.exec(w.label);
      const toepas = pl ? 'ploeg:' + pl[1] : (w.inclBtw ? 'btw' : '');
      return '<div class="r"><span class="l">' + esc(w.label) + '</span>' + (toepas ? '<button class="link" type="button" data-toepassen="' + toepas + '">Toepassen</button>' : '') +
        '<span class="v">' + (w.verschil >= 0 ? '+ ' : '− ') + eur(Math.abs(w.verschil)) + (w.inclBtw ? ' incl. btw' : '') + '</span></div>';
    }).join('') + '</div>' : '';

    const kr = (l, v, som) => '<div class="r' + (som ? ' som' : '') + '"><span class="l">' + l + '</span><span class="v">' + eur(v) + '</span></div>';
    $('kosten-sectie').innerHTML = '<div class="sectie-kop"><h3>Kostenopbouw</h3></div><div class="kosten">' +
      kr('Arbeid: ' + n0.format(Math.round(r.uren)) + ' manuren × ' + eur2(r.t.uurtarief), k.arbeid) +
      kr('Materiaal: inkoop ' + eur(k.materiaalInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge', k.materiaal) +
      kr('Materieel en afvoer: inkoop ' + eur(k.materieelInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge', k.materieel) +
      kr('Subtotaal', k.subtotaal, true) + kr('Onvoorzien ' + getal(r.t.onvoorzien) + ' %', k.onvoorzien) + kr('Prijs excl. btw', k.excl, true) +
      kr('Btw ' + r.t.btw + ' %', k.btw) + kr('Prijs incl. btw', k.incl, true) + '</div>';
  }

  const WERK_KOP = '<div class="tabel-kop rij--kop"><span>Werk</span><span class="g">Hoeveelheid</span><span class="g">Manuren</span><span class="g">Materiaal €</span><span class="g">Naar boven kg</span><span class="g">Afval kg</span><span class="g">Bron</span></div>';
  function rekenpad(x) {
    const regels = [];
    if (x.hoeveelheid > 0) regels.push(getal(x.hoeveelheid) + ' ' + x.eenheid + ' × ' + n2.format(x.uren / x.hoeveelheid) + ' manuur = ' + n1.format(x.uren) + ' manuren');
    for (const y of x.mat) regels.push(getal(y.aantal) + ' ' + y.eenheid + ' ' + y.naam + ' × ' + eur2(y.prijs) + (y.weken ? ' × ' + y.weken + (y.weken === 1 ? ' week' : ' weken') : '') + ' = ' + eur(y.kost));
    for (const y of x.afval) if (y.kg > 0) regels.push('Afval ' + y.soort + ': ' + n0.format(Math.round(y.kg)) + ' kg');
    return regels.map((s) => '<span>' + esc(s) + '</span>').join('');
  }
  function werkRij(x, i) {
    const id = (x.code || x.naam) + '|' + i;
    const open = S.open.has(id);
    return '<div class="rij"><div class="n"><button class="naam-knop" type="button" data-rekenpad="' + esc(id) + '" aria-expanded="' + open + '" title="Rekenpad"><span class="naam"><span>' + esc(x.naam) + '</span>' + (x.gevraagd ? '' : chip('Niet gevraagd, wel nodig')) + ic(open ? 'omhoog' : 'omlaag') + '</span></button>' +
      (!x.gevraagd && x.waarom ? '<small>' + esc(x.waarom) + '</small>' : '') + (x.toelichting ? '<small>' + esc(x.toelichting) + '</small>' : '') + '</div>' +
      '<div class="g" data-l="Hoeveelheid">' + getal(x.hoeveelheid) + ' ' + esc(x.eenheid) + '</div><div class="g" data-l="Manuren">' + n1.format(x.uren) + '</div>' +
      '<div class="g" data-l="Materiaal €">' + streep(x.matKost + x.huurKost, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Naar boven kg">' + streep(x.matKg, (v) => n0.format(Math.round(v))) + '</div>' +
      '<div class="g" data-l="Afval kg">' + streep(x.afvalKg, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Bron">' + bronChip(x.bron) + '</div>' +
      (open ? '<div class="rekenpad">' + rekenpad(x) + '</div>' : '') + '</div>';
  }
  function tekenWerkblad(a, skelet) {
    const el = $('werkblad'), ov = $('overgeslagen');
    if (!a) { el.innerHTML = skelet ? WERK_KOP + SKELET_RIJ : ''; ov.hidden = true; return; }
    const r = a.r;
    let h = WERK_KOP, i = 0;
    for (const f of r.fases) {
      h += '<button class="fase' + (S.open.has('fase|' + f.naam) ? ' is-dicht' : '') + '" type="button" data-fase="' + esc(f.naam) + '" aria-expanded="' + !S.open.has('fase|' + f.naam) + '"><span class="inkt">' + esc(f.naam) + '</span><span class="som">' + n1.format(f.uren) + ' manuren · ' + dagen(f.dagen) + ' met ' + r.ploeg + ' man</span>' + ic('omlaag') + '</button><div class="fase-rijen">';
      for (const x of f.regels) h += werkRij(x, i++);
      h += '</div>';
    }
    if (skelet) h += SKELET_RIJ;
    el.innerHTML = h;
    ov.hidden = !r.overgeslagen.length || skelet;
    ov.textContent = r.overgeslagen.length ? 'Niet meegerekend, omdat de AI geen cijfers gaf: ' + r.overgeslagen.join(', ') + '.' : '';
  }

  function tekenMateriaal(a, skelet) {
    const ml = $('materialen-sectie'), eq = $('materieel-sectie');
    if (!a || skelet) { ml.innerHTML = skelet ? SKELET_GELD.replace('"skelet-geld"', '"skelet-geld" style="padding-top:8px"') : ''; eq.innerHTML = ''; return; }
    const r = a.r;
    ml.innerHTML = '<div class="sectie-kop"><h3>Materiaallijst</h3><span class="rechts">inkoop excl. btw</span></div><div class="tabel kol-mat"><div class="tabel-kop"><span>Materiaal</span><span class="g">Aantal</span><span class="g">Prijs €</span><span class="g">Totaal €</span><span class="g">Gewicht kg</span><span class="g">Bron</span></div>' +
      r.materialen.map((x) => '<div class="rij"><div class="n">' + esc(x.naam) + '</div><div class="g" data-l="Aantal">' + getal(x.aantal) + ' ' + esc(x.eenheid) + '</div><div class="g" data-l="Prijs €">' + n2.format(x.prijs) + '</div><div class="g" data-l="Totaal €">' + streep(x.kost, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Gewicht kg">' + streep(x.kg, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Bron">' + bronChip(x.bron) + '</div></div>').join('') +
      (r.materialen.length ? '' : '<p class="klein" style="padding-top:8px">Geen materiaal in deze klus.</p>') + '</div>';
    const SOORT = { puin: 'Puin', hout: 'Hout', rest: 'Rest', isolatie: 'Isolatie', metaal: 'Metaal', asbest: 'Asbest' };
    eq.innerHTML = '<div class="sectie-kop"><h3>Materieel en afvoer</h3><span class="rechts">inkoop excl. btw</span></div><div class="tabel kol-eq"><div class="tabel-kop"><span>Post</span><span class="g">Aantal</span><span class="g">Prijs €</span><span class="g">Totaal €</span></div>' +
      r.materieel.map((x) => '<div class="rij"><div class="n">' + esc(x.naam) + '</div><div class="g" data-l="Aantal">' + getal(x.aantal) + ' ' + esc(x.eenheid) + '</div><div class="g" data-l="Prijs €">' + n2.format(x.prijs) + '</div><div class="g" data-l="Totaal €">' + streep(x.kost, (v) => n0.format(Math.round(v))) + '</div></div>').join('') + '</div>' +
      (r.afvoer.length ? '<div class="afval"><h4>Afval per soort</h4>' + r.afvoer.map((x) => '<p>' + esc((SOORT[x.soort] || x.soort) + ' ' + n0.format(Math.round(x.kg)) + ' kg → ' + x.aantal + ' ' + x.naam + (x.soort2 === 'container' ? ' (' + x.ton + ' ton per container)' : '')) + '</p>').join('') + '</div>' : '');
  }

  function tekenCompact(a, skelet) {
    const el = $('prijs-compact');
    const seg = $('seg-resultaat');
    if (!a || skelet) { el.innerHTML = ''; seg.textContent = 'Resultaat'; return; }
    const r = a.r, k = r.kosten;
    seg.textContent = 'Resultaat · ' + eur(k.incl);
    el.innerHTML = '<div class="prijs"><b>' + eur(k.incl) + '</b></div><div class="prijs-onder">incl. ' + r.t.btw + ' % btw · ' + eur(k.excl) + ' excl.</div><p class="caveat">' + caveat(S.m) + '</p>' +
      '<div class="mini"><div><small>Ploeg</small><b>' + r.ploeg + ' man</b></div><div><small>Werkdagen</small><b>' + r.werkdagen + '</b></div><div><small>Manuren</small><b>' + n0.format(Math.round(r.uren)) + '</b></div></div>' +
      '<button class="knop knop--stil" type="button" data-seg="resultaat">Bekijk resultaat</button>';
  }

  function tekenKnoppen() {
    const heeft = !!laatsteA && !skeletLoopt();
    const op = $('opslaan');
    op.disabled = !heeft || S.bewaard || S.loopt;
    op.querySelector('span').textContent = heeft && S.bewaard ? 'Opgeslagen' : 'Opslaan';
    document.querySelectorAll('[data-kopieer="alles"],[data-print]').forEach((b) => { b.disabled = !heeft; });
    $('offerte').disabled = !heeft;
    document.querySelectorAll('#menu [data-menu-actie]').forEach((b) => {
      const w = b.getAttribute('data-menu-actie');
      b.disabled = w === 'verwijder' ? !S.id || S.loopt : w === 'opslaan' ? op.disabled : !heeft;
    });
  }

  /* ---------- kenmerken en meting ---------- */
  let kenmerkenSleutel = '';
  const waardeTekst = (x) => (x.tekst ? String(x.waarde) : getal(x.waarde));
  function kenmerkenSleutelNu() { return JSON.stringify(S.m && S.m.kenmerken) + '|' + JSON.stringify(S.gewijzigd) + '|' + S.loopt; }
  function tekenKenmerken() {
    const el = $('kenmerken');
    const sleutel = kenmerkenSleutelNu();
    if (sleutel === kenmerkenSleutel) return;
    kenmerkenSleutel = sleutel;
    const kk = S.m && S.m.kenmerken ? S.m.kenmerken : {};
    const sleutels = Object.keys(kk);
    if (!sleutels.length) {
      el.innerHTML = S.loopt ? '<div class="veld"><span class="skelet" style="width:120px;height:18px;margin-bottom:4px"></span><span class="skelet" style="height:36px"></span></div>'.repeat(6) : '<p class="klein">De kenmerken verschijnen bij de berekening.</p>';
      $('plakbalk').hidden = true;
      return;
    }
    el.innerHTML = sleutels.map((k, i) => {
      const x = kk[k];
      const gew = k in S.gewijzigd;
      const bron = gew ? 'vast' : x.bron;
      return '<div class="veld"><label for="km-' + i + '"><span>' + esc(x.label) + '</span>' + chip(BRONTEKST[bron] || bron, BRONSOORT[bron]) + '</label>' +
        '<div class="in"><input id="km-' + i + '" data-k="' + esc(k) + '" type="text" autocomplete="off"' + (x.tekst ? '' : ' inputmode="decimal"') + ' value="' + esc(waardeTekst(x)) + '">' + (x.eenheid ? '<span class="eenheid">' + esc(x.eenheid) + '</span>' : '') + '</div>' +
        (gew ? '<button class="link terug" type="button" data-terug="' + esc(k) + '">Terug naar ' + esc(waardeTekst(S.gewijzigd[k])) + '</button>' : '') + '</div>';
    }).join('');
    tekenPlakbalk();
  }
  function tekenPlakbalk() {
    const n = Object.keys(S.gewijzigd).length;
    $('plakbalk').hidden = !n;
    $('plakbalk-tekst').textContent = n + (n === 1 ? ' kenmerk aangepast' : ' kenmerken aangepast');
    $('herbereken').disabled = S.loopt;
  }
  let meetbeeldSleutel = '';
  function tekenMeetbeeld() {
    /* Het meetbeeld (luchtfoto met contour en maten) komt uit meetbeeld.js van de hoofdsessie; alleen als de meting een beeld draagt. */
    const wrap = $('meetbeeld');
    const g = S.gemeten;
    const kan = !!(g && g.beeld && globalThis.Meetbeeld && typeof globalThis.Meetbeeld.teken === 'function');
    const sleutel = kan ? g.adres + '|' + g.beeld.bbox.join(',') : '';
    if (sleutel === meetbeeldSleutel) { wrap.hidden = !kan; return; }
    meetbeeldSleutel = sleutel;
    wrap.hidden = !kan;
    wrap.innerHTML = '';
    if (!kan) return;
    try { globalThis.Meetbeeld.teken(wrap, g, { px: 640, animatie: true, compact: true }); } catch (e) { wrap.hidden = true; }
  }
  function tekenGemeten() {
    const el = $('gemeten'), leeg = $('gemeten-leeg'), adr = $('gemeten-adres');
    tekenMeetbeeld();
    if (!S.gemeten) {
      el.hidden = true; el.innerHTML = ''; adr.textContent = S.adres && S.meetFout ? S.adres : ''; leeg.hidden = false;
      leeg.textContent = S.meetFout ? S.meetFout + ' Gerekend met de maten uit de klus.' : 'Geen meting: er was geen adres.';
      return;
    }
    const g = S.gemeten, d = g.dak, b = g.bebouwing, a = g.gebouw;
    el.hidden = false; leeg.hidden = true; adr.textContent = g.adres || S.adres;
    el.innerHTML = '<div class="meting"><div class="f"><small>Grondoppervlak</small><b>' + getal(a.oppervlakte) + ' m²</b><span>' + getal(a.lengte) + ' × ' + getal(a.breedte) + ' m</span></div>' +
      '<div class="f"><small>Bebouwing</small><b>' + esc(b.type) + '</b><span>' + getal(b.gemeneMuur) + ' m gemene muur, ' + getal(b.vrijeGevel) + ' m vrije gevel</span></div>' +
      (d ? '<div class="f"><small>Dak</small><b>' + esc(d.vorm) + '</b><span>' + (d.helling ? 'helling ' + d.helling + '°, ' : '') + Math.round(d.platAandeel * 100) + ' % plat</span></div>' +
        '<div class="f"><small>Dakvlak</small><b>' + getal(d.dakvlak) + ' m²</b><span>zonder oversteek</span></div>' +
        '<div class="f"><small>Nokhoogte</small><b>' + getal(d.nokhoogte) + ' m</b><span>' + (d.kroonlijst ? 'kroonlijst ' + getal(d.kroonlijst) + ' m' : 'kroonlijst niet af te leiden') + '</span></div>' : '') + '</div>' +
      '<p class="klein" style="margin-top:16px">' + esc(g.bron) + (d ? '. ' + d.punten + ' hoogtepunten gemeten.' : '. Geen hoogtemeting voor dit gebouw.') + (g.waarschuwingen || []).map((w) => ' ' + esc(w)).join('') + '</p>';
  }

  /* ---------- stappen (trail) ---------- */
  const STAP_ICOON = { wacht: 'rond', actief: 'spinner', klaar: 'vink', over: 'streep', gestopt: 'streep', fout: 'kruis', waarschuwing: 'driehoek' };
  const vorigeDuur = () => opslag.lees('richtprijs-stapduur', []);
  function duurTekst(s, i) {
    if (s.staat === 'actief') { const v = vorigeDuur()[i]; return sec(s.t0) + ' s' + (v ? ' · vorige keer ' + v + ' s' : ''); }
    if (s.staat === 'wacht') return '';
    if (s.staat === 'over') return '—';
    return s.duur ? s.duur + ' s' : '';
  }
  function rij(i, staat, label, duur, detail) {
    const s = S.trail[i];
    s.staat = staat; s.label = label;
    if (staat === 'actief') { s.t0 = Date.now(); s.duur = 0; } else if (duur != null) s.duur = duur;
    s.detail = detail || '';
    if (staat !== 'actief') s.posten = '';
    tekenTrail();
  }
  function tekenTrail() {
    const el = $('trail');
    if (!S.trail.length) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.classList.toggle('is-dicht', S.trailDicht);
    let h = S.trailKop
      ? '<button class="trail-kop" type="button" data-trail-toggle aria-expanded="' + !S.trailDicht + '">' + ic(S.trailDicht ? 'omlaag' : 'omhoog') + '<span>' + esc(S.trailKop) + '</span></button>'
      : '<div class="trail-kop"><span>Stap ' + S.stapNr + ' van 3</span></div>';
    S.trail.forEach((s, i) => {
      const st = s.staat === 'gestopt' ? 'over' : s.staat;
      h += '<div class="stap is-' + st + '" id="stap-' + i + '">' + ic(STAP_ICOON[s.staat], s.staat === 'actief' ? 'spinner' : '') + '<span class="label">' + esc(s.label) + '</span><span class="duur">' + esc(duurTekst(s, i)) + '</span>' +
        '<span class="detail"' + (s.detail ? '' : ' hidden') + '>' + (s.detail || '') + '</span><div class="posten"' + (s.posten ? '' : ' hidden') + '>' + (s.posten || '') + '</div></div>';
    });
    el.innerHTML = h;
  }
  function tikTrail() {
    S.trail.forEach((s, i) => { if (s.staat === 'actief') { const d = document.querySelector('#stap-' + i + ' .duur'); if (d) d.textContent = duurTekst(s, i); } });
    const a = S.trail[S.stapNr - 1];
    if (a && a.staat === 'actief') status('Stap ' + S.stapNr + ' van 3 · ' + a.label + ' · ' + sec(a.t0) + ' s');
  }
  function postNaam(p) {
    const def = p.code ? DATA.posten[p.code] : null;
    return (def ? def.naam : p.naam || p.code || 'post') + ' · ' + getal(p.hoeveelheid) + ' ' + (def ? def.eenheid : p.eenheid || '');
  }
  function tekenPostenLijst() {
    const s = S.trail[1];
    if (!s || s.staat !== 'actief') return;
    const n = S.m.posten.length;
    s.detail = n ? n + (n === 1 ? ' post' : ' posten') : '';
    const laatste = S.m.posten.slice(-6);
    s.posten = n ? laatste.map((p) => '<span>' + esc(postNaam(p)) + '</span>').join('') + (n > 6 ? '<button class="link eerder" type="button" data-tab-naar="werkblad">+ ' + (n - 6) + ' eerder</button>' : '') : '';
    const d = document.querySelector('#stap-1 .detail'), p = document.querySelector('#stap-1 .posten');
    if (d) { d.innerHTML = s.detail; d.hidden = !s.detail; }
    if (p) { p.innerHTML = s.posten; p.hidden = !s.posten || telefoon.matches; }
  }
  const gemetenLabel = (g) => 'Gemeten: ' + (g.dak ? 'dakvlak ' + getal(g.dak.dakvlak) + ' m², ' : 'grondoppervlak ' + getal(g.gebouw.oppervlakte) + ' m², ') + g.bebouwing.type + ' bebouwing' + (g.dak && g.dak.nokhoogte ? ', nok ' + getal(g.dak.nokhoogte) + ' m' : '');
  function trailStart(meten) {
    S.trail = [
      meten ? { staat: 'actief', label: 'Gebouw opmeten op ' + S.adres, t0: Date.now() }
        : S.gemeten ? { staat: 'klaar', label: gemetenLabel(S.gemeten), duur: S.meetDuur }
          : S.adres && S.meetFout ? { staat: 'waarschuwing', label: 'Geen gebouw gevonden op dit adres · gerekend met de maten uit de klus', duur: S.meetDuur, detail: '<button class="link" type="button" data-adres-aanpassen>Adres aanpassen</button>' }
            : { staat: 'over', label: 'Meting overgeslagen: geen adres' },
      { staat: 'wacht', label: 'Posten schrijven uit de klus' },
      { staat: 'wacht', label: 'Uitleg schrijven' },
    ];
    S.trailDicht = false; S.trailKop = ''; S.stapNr = 1;
    tekenTrail();
  }

  /* ---------- toelichting ---------- */
  let live = null, uitlegBuf = '', uitlegWacht = false;
  const schoon = (s) => String(s).replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim();
  function scroller() { const s = $('stroom'); return s.scrollHeight > s.clientHeight + 1 && getComputedStyle(s).overflowY !== 'visible' ? s : document.scrollingElement; }
  const dichtbijOnder = () => { const s = scroller(); return s.scrollHeight - s.scrollTop - s.clientHeight < 60; };
  const naarOnder = () => { const s = scroller(); s.scrollTop = s.scrollHeight; };
  function uitlegDelta(d) { uitlegBuf += d; if (!uitlegWacht) { uitlegWacht = true; requestAnimationFrame(flushUitleg); } }
  function flushUitleg() {
    uitlegWacht = false;
    if (!uitlegBuf) return;
    S.uitleg.tekst += uitlegBuf; uitlegBuf = '';
    if (reduceer.matches) return;
    tekenUitlegLive();
  }
  function tekenUitlegLive() {
    const ul = $('uitleg');
    const delen = S.uitleg.tekst.split('\n');
    const af = delen.slice(0, -1).map(schoon).filter(Boolean);
    const onder = dichtbijOnder();
    let n = ul.querySelectorAll('li.af').length;
    while (n < af.length) { const li = document.createElement('li'); li.className = 'af'; li.textContent = af[n]; ul.insertBefore(li, live); n++; }
    const laatste = schoon(delen[delen.length - 1]);
    if (laatste) {
      if (!live) {
        live = document.createElement('li');
        live.appendChild(document.createTextNode(''));
        const c = document.createElement('span'); c.className = 'caret'; c.setAttribute('aria-hidden', 'true'); live.appendChild(c);
        ul.appendChild(live);
      }
      live.firstChild.data = laatste;
    } else if (live) { live.remove(); live = null; }
    if (onder) naarOnder();
  }
  function tekenUitleg() {
    const ul = $('uitleg');
    live = null;
    const regels = S.uitleg.tekst.split('\n').map(schoon).filter(Boolean);
    ul.innerHTML = regels.map((s) => '<li class="af">' + esc(s) + '</li>').join('');
    tekenUitlegRest();
  }
  function tekenUitlegRest() {
    const t = $('toelichting');
    const m = S.m;
    const toon = !!m && S.fase !== 'leeg' && (S.uitleg.staat !== 'geen' || S.fase === 'klaar' || S.fase === 'gestopt' || S.fase === 'fout');
    t.hidden = !toon;
    if (!toon) return;
    $('bronnen').innerHTML = (S.gemeten ? chip('Kaartmeting Digitaal Vlaanderen') : '') + chip('Datatabel ' + DATA.stand) + chip('Uw tarieven');
    const u = S.uitleg;
    const prijsNu = laatsteA ? Math.round(laatsteA.r.kosten.incl) : 0;
    const oud = u.staat === 'klaar' && u.prijsBij && prijsNu && Math.round(u.prijsBij) !== prijsNu;
    $('strook').hidden = !oud || S.loopt;
    if (oud) $('strook-tekst').textContent = 'Geschreven bij ' + eur(u.prijsBij) + '; de prijs is nu ' + eur(prijsNu) + '.';
    const st = $('uitleg-staat');
    if (u.staat === 'fout') { st.hidden = false; st.innerHTML = '<span>Uitleg niet volledig aangekomen.</span><button class="link" type="button" data-uitleg-opnieuw>Opnieuw schrijven</button>'; }
    else if (u.staat === 'gestopt') { st.hidden = false; st.innerHTML = '<span>Uitleg gestopt.</span><button class="link" type="button" data-uitleg-opnieuw>Opnieuw schrijven</button>'; }
    else if (u.staat === 'geen' && !S.loopt) { st.hidden = false; st.innerHTML = '<span>Nog geen toelichting.</span><button class="link" type="button" data-uitleg-opnieuw>Schrijf de toelichting</button>'; }
    else st.hidden = true;
    const lijst = (x) => (Array.isArray(x) ? x.slice(0, 12) : []).map((s) => '<li>' + esc(s) + '</li>').join('');
    $('aannames-blok').hidden = !(m.aannames && m.aannames.length);
    $('aannames').innerHTML = lijst(m.aannames);
    $('plaatsbezoek').hidden = !(m.plaatsbezoek && m.plaatsbezoek.length);
    $('plaatsbezoek-lijst').innerHTML = lijst(m.plaatsbezoek);
    $('uitleg-acties').hidden = S.loopt || u.staat === 'geen' || !u.tekst;
    document.querySelectorAll('[data-uitleg-opnieuw]').forEach((b) => { b.disabled = S.loopt || !laatsteA; });
  }

  /* ---------- opdrachtkaart ---------- */
  function hoofdknop() {
    const b = $('bereken');
    const dicht = $('opdracht').classList.contains('is-dicht');
    b.hidden = false;
    if (S.loopt) { b.innerHTML = ic('stop', 'vol') + 'Stop'; b.setAttribute('aria-label', 'Stop de berekening'); }
    else if (!dicht) { b.textContent = 'Bereken richtprijs'; b.removeAttribute('aria-label'); }
    else if (S.fase === 'fout' || S.fase === 'gestopt') { b.textContent = 'Opnieuw berekenen'; b.removeAttribute('aria-label'); }
    else b.hidden = true;
    b.className = dicht ? 'knop knop--36' : 'knop';
    $('wijzig').hidden = !dicht || S.loopt;
  }
  function kaartDicht(aan) {
    const k = $('opdracht');
    k.classList.toggle('is-dicht', aan);
    (aan ? $('opdracht-dicht') : $('opdracht-voet')).appendChild($('bereken'));
    if (aan) {
      const eerste = (S.klus.split('\n').find((r) => r.trim()) || '').trim();
      $('samenvatting').innerHTML = (S.adres ? esc(S.adres) : '<span class="stil">Geen adres</span>') + '<span class="stil"> · </span>' + esc(eerste) + '<span class="stil"> · ' + esc(ASBEST[S.asbest] || ASBEST.onbekend) + '</span>';
      $('samenvatting').title = [S.adres, S.klus, ASBEST[S.asbest]].filter(Boolean).join('\n');
    }
    hoofdknop();
  }
  function tekenVoorbeelden() {
    const weg = opslag.lees('richtprijs-chips-weg', []);
    $('voorbeelden').innerHTML = VOORBEELDEN.map((v, i) => (weg.includes(i) ? '' : '<button type="button" data-voorbeeld-chip="' + i + '" title="' + esc(v.klus) + '"><span>' + esc(v.kort) + '</span><span class="x" data-chip-weg="' + i + '" role="button" aria-label="Verberg dit voorbeeld" tabindex="0">' + ic('x') + '</span></button>')).join('');
  }

  /* ---------- de stroom van de AI ---------- */
  async function stroom(prompt, opDelta, signal) {
    const antwoord = await fetch('/api/ai', { method: 'POST', headers: JSON_KOP, body: JSON.stringify({ prompt }), signal });
    if (!antwoord.ok || !antwoord.body) {
      let tekst = 'De lokale server gaf geen antwoord.';
      try { tekst = (await antwoord.json()).fout || tekst; } catch (e) { /* geen leesbare fout */ }
      const e = new Error(tekst); e.code = antwoord.status; throw e;
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
        if (o.fout) { const e = new Error(o.fout); e.code = 'ai'; throw e; }
        if (o.d) opDelta(o.d);
      }
    }
  }

  let klok = null, t0 = 0, planWacht = false;
  const plan = () => { if (planWacht) return; planWacht = true; requestAnimationFrame(() => { planWacht = false; teken(); }); };
  function bezig(aan) {
    S.loopt = aan;
    if (klok) { clearInterval(klok); klok = null; }
    if (aan) { t0 = Date.now(); klok = setInterval(tikTrail, 500); }
    hoofdknop();
    $('herbereken').disabled = aan;
    tekenKnoppen();
  }
  function bewaarStapDuur() { opslag.schrijf('richtprijs-stapduur', S.trail.map((s) => s.duur || 0)); }

  async function schrijfUitleg() {
    const a = laatsteA;
    S.uitleg = { tekst: '', staat: 'bezig', prijsBij: 0 };
    uitlegBuf = ''; live = null;
    $('uitleg').innerHTML = '';
    tekenUitlegRest();
    const prijs = Math.round(a.r.kosten.incl);
    try {
      await stroom(RP.bouwUitlegPrompt(S.klus, S.gemeten, S.m, huidig()), uitlegDelta, ctl.signal);
      flushUitleg();
      S.uitleg.staat = 'klaar';
      S.uitleg.prijsBij = prijs;
    } catch (e) {
      flushUitleg();
      S.uitleg.staat = e && e.name === 'AbortError' ? 'gestopt' : 'fout';
      throw e;
    } finally {
      if (live) { const c = live.querySelector('.caret'); if (c) c.remove(); live.className = 'af'; live = null; }
      if (reduceer.matches) tekenUitleg();
    }
  }

  async function start(vast) {
    if (S.loopt) return;
    const klus = $('klus').value.trim();
    const adres = $('adres').value.trim();
    if (klus.length < 25) { $('klus-fout').hidden = false; $('klus').focus(); return; }
    $('klus-fout').hidden = true;
    $('banner').hidden = true;
    const herhaal = !!S.id;
    const adresNieuw = adres !== S.adres;
    S.klus = klus.slice(0, 6000); S.adres = adres; S.asbest = leesAsbest();
    if (herhaal) S.versie++; else { S.versie = 1; S.datum = ''; S.titel = ''; }
    /* De meting blijft staan zolang het adres gelijk is (Wijzig, Herbereken); zonder adres is er geen meting. */
    const meten = !!adres && (adresNieuw || !(S.gemeten || S.meetFout));
    if (!adres) { S.gemeten = null; S.meetFout = ''; S.meetDuur = 0; }
    S.m = RP.leegMeetstaat(); S.ploeg = 0; S.voorbeeld = false; S.gewijzigd = {}; S.origineel = {}; S.bewaard = false; S.open = new Set(); S.oudePrijs = 0; S.duur = 0;
    S.uitleg = { tekst: '', staat: 'geen', prijsBij: 0 }; uitlegBuf = ''; live = null;
    S.m.kenmerken.asbest = { label: 'Asbest', eenheid: '', waarde: S.asbest, tekst: true, bron: 'beschrijving' };
    const vraag = S.klus + '\nAsbest: ' + S.asbest + '.';
    const vastMet = vast ? Object.assign({}, vast, { asbest: { label: 'Asbest', eenheid: '', waarde: S.asbest } }) : null;
    S.fase = meten ? 'meting' : 'posten';
    kaartDicht(true); zetLeeg(false); body.classList.add('paneel-open'); body.classList.remove('rail-open', 'lade'); zetTab('overzicht'); zetSeg(false);
    trailStart(meten);
    bezig(true);
    teken(); tekenUitleg();
    status('Stap 1 van 3 · ' + S.trail[0].label);
    ctl = new AbortController();
    try {
      if (meten) {
        const tm = Date.now();
        S.gemeten = null; S.meetFout = '';
        try {
          const antwoord = await fetch('/api/adres?q=' + encodeURIComponent(adres), { headers: KOP, signal: ctl.signal });
          const j = await antwoord.json();
          if (antwoord.ok) S.gemeten = j; else S.meetFout = j.fout || 'Geen gebouw gevonden op dit adres.';
        } catch (e) {
          if (e.name === 'AbortError' || e instanceof TypeError) throw e;
          S.meetFout = 'De kaartdienst van Vlaanderen antwoordt niet.';
        }
        S.meetDuur = sec(tm);
        if (S.gemeten) rij(0, 'klaar', gemetenLabel(S.gemeten), S.meetDuur);
        else rij(0, 'waarschuwing', 'Geen gebouw gevonden op dit adres · gerekend met de maten uit de klus', S.meetDuur, '<button class="link" type="button" data-adres-aanpassen>Adres aanpassen</button>');
        tekenGemeten();
      }
      S.fase = 'posten'; S.stapNr = 2;
      rij(1, 'actief', 'Posten schrijven uit de klus');
      teken();
      let rest = '', alles = '', nKen = 0;
      const eet = (regel) => {
        const s = regel.trim();
        if (s[0] !== '{') return;
        try { RP.pasRegelToe(S.m, JSON.parse(s)); } catch (e) { return; }
        const kk = Object.keys(S.m.kenmerken);
        if (kk.length !== nKen && kk[0] === 'asbest' && kk.length > 1) { const x = S.m.kenmerken.asbest; delete S.m.kenmerken.asbest; S.m.kenmerken.asbest = x; }
        nKen = kk.length;
        if (S.m.titel && S.m.titel !== S.titel) { S.titel = S.m.titel; tekenTitel(); }
        tekenPostenLijst();
        plan();
      };
      await stroom(RP.bouwPrompt(vraag, S.gemeten, standaarden, vastMet), (d) => {
        rest += d; alles += d;
        let i;
        while ((i = rest.indexOf('\n')) >= 0) { eet(rest.slice(0, i)); rest = rest.slice(i + 1); }
      }, ctl.signal);
      eet(rest);
      if (!S.m.posten.length) {
        const a = alles.indexOf('{'), b = alles.lastIndexOf('}');
        if (a >= 0 && b > a) { try { RP.pasRegelToe(S.m, JSON.parse(alles.slice(a, b + 1))); } catch (e) { /* geen JSON */ } }
      }
      const r = RP.bereken(S.m, huidig());
      if (!r.regels.length) { const e = new Error('De AI gaf geen bruikbare posten.'); e.code = 'posten'; throw e; }
      rij(1, 'klaar', 'Posten geschreven: ' + r.regels.length + (r.regels.length === 1 ? ' post' : ' posten') + ' in ' + r.fases.length + (r.fases.length === 1 ? ' fase' : ' fases'), sec(S.trail[1].t0));
      S.origineel = kopie(S.m.kenmerken);
      S.fase = 'uitleg'; S.stapNr = 3;
      teken();
      opslaan(true);
      rij(2, 'actief', 'Uitleg schrijven bij ' + eur(laatsteA.r.kosten.incl));
      await schrijfUitleg();
      rij(2, 'klaar', 'Uitleg geschreven', sec(S.trail[2].t0));
      S.duur = sec(t0);
      S.fase = 'klaar';
      bezig(false);
      bewaarStapDuur();
      status('Klaar in ' + S.duur + ' s.');
      S.trailKop = 'Klaar in ' + S.duur + ' s · 3 stappen';
      tekenTrail();
      setTimeout(() => { if (!S.loopt && S.fase === 'klaar') { S.trailDicht = true; tekenTrail(); } }, 1000);
      opslaan(true);
    } catch (e) {
      bezig(false);
      const nr = Math.max(1, S.stapNr);
      const s = S.trail[nr - 1];
      if (e && e.name === 'AbortError') {
        S.fase = 'gestopt';
        if (s) rij(nr - 1, 'gestopt', 'Gestopt na stap ' + nr + (nr === 2 ? ' · ' + S.m.posten.length + (S.m.posten.length === 1 ? ' post' : ' posten') + ' binnen' : ''), s.t0 ? sec(s.t0) : 0);
        status('Gestopt.');
      } else if (e instanceof TypeError) {
        S.fase = 'fout';
        $('banner').hidden = false;
        if (s) rij(nr - 1, 'fout', 'De lokale server antwoordt niet', s.t0 ? sec(s.t0) : 0);
        status('De lokale server antwoordt niet. Start start.cmd opnieuw.', true);
      } else if (nr === 3) {
        S.fase = 'klaar';
        if (s) rij(2, 'fout', 'Uitleg niet volledig aangekomen', s.t0 ? sec(s.t0) : 0);
        S.trailKop = 'Klaar zonder uitleg · ' + sec(t0) + ' s';
        status('Uitleg niet volledig aangekomen. ' + ((e && e.message) || ''), true);
        opslaan(true);
      } else {
        S.fase = 'fout';
        if (s) rij(nr - 1, 'fout', (e && e.message) || 'De AI gaf geen bruikbare posten.', s.t0 ? sec(s.t0) : 0);
        status((e && e.message) || 'De AI gaf geen bruikbare posten.', true);
      }
      hoofdknop();
      if (S.fase === 'fout' || S.fase === 'gestopt') { const b = $('bereken'); if (!b.hidden) b.focus(); }
    }
    teken();
    tekenUitlegRest();
    tekenRail();
  }

  async function uitlegOpnieuw() {
    if (S.loopt || !laatsteA) return;
    S.trailDicht = true;
    bezig(true);
    ctl = new AbortController();
    const tu = Date.now();
    try { await schrijfUitleg(); bezig(false); status('Uitleg bijgewerkt in ' + sec(tu) + ' s.'); opslaan(true); }
    catch (e) { bezig(false); status(e && e.name === 'AbortError' ? 'Gestopt.' : 'Uitleg niet volledig aangekomen.', !(e && e.name === 'AbortError')); }
    tekenUitlegRest();
    tekenKnoppen();
  }

  /* ---------- bewaren, laden, nieuw, voorbeeld ---------- */
  async function opslaan(stil) {
    if (!laatsteA || S.voorbeeld) return;
    const r = laatsteA.r;
    if (!S.datum) S.datum = new Date().toISOString();
    const o = { id: S.id || undefined, titel: S.titel || S.m.titel || 'Berekening', adres: S.adres, datum: S.datum, prijs: Math.round(r.kosten.incl), vak: r.vak, klus: S.klus, asbest: S.asbest, versie: S.versie,
      meetstaat: S.m, gemeten: S.gemeten, meetFout: S.meetFout, meetDuur: S.meetDuur, tarieven: huidig(), ploeg: S.ploeg, uitleg: S.uitleg.tekst, uitlegPrijs: S.uitleg.prijsBij, duur: S.duur, stappen: S.trail.map((s) => s.duur || 0) };
    try {
      const a = await fetch('/api/berekeningen', { method: 'POST', headers: JSON_KOP, body: JSON.stringify(o) });
      const j = await a.json();
      if (!a.ok || !j.id) throw new Error(j.fout || 'Niet opgeslagen.');
      S.id = j.id; S.bewaard = true;
      tekenKnoppen();
      if (!stil) toast('Opgeslagen');
      laadLijst();
    } catch (e) { if (!stil) toast('Niet opgeslagen'); }
  }
  function zetKlaar(o) {
    /* Bouwt de klaar-staat op uit een bewaarde berekening of het voorbeeld. */
    S.id = o.id || null; S.versie = o.versie || 1; S.titel = o.titel || ''; S.adres = o.adres || ''; S.klus = o.klus || ''; S.asbest = ASBEST[o.asbest] ? o.asbest : 'onbekend'; S.datum = o.datum || '';
    S.m = o.meetstaat ? kopie(o.meetstaat) : RP.leegMeetstaat();
    for (const k of ['kenmerken', 'posten', 'aannames', 'plaatsbezoek', 'materieel_per_dag']) if (!S.m[k]) S.m[k] = k === 'kenmerken' ? {} : [];
    S.gemeten = o.gemeten || null; S.meetFout = o.meetFout || ''; S.meetDuur = o.meetDuur || 0; S.ploeg = o.ploeg || 0; S.voorbeeld = !!o.voorbeeld;
    S.gewijzigd = {}; S.origineel = kopie(S.m.kenmerken); S.open = new Set(); S.bewaard = !!o.id; S.oudePrijs = 0; S.duur = o.duur || 0;
    S.uitleg = { tekst: o.uitleg || '', staat: o.uitleg ? 'klaar' : 'geen', prijsBij: o.uitlegPrijs || 0 };
    uitlegBuf = ''; live = null;
    $('adres').value = S.adres; $('klus').value = S.klus; zetAsbest(S.asbest);
    S.fase = 'klaar';
    const st = o.stappen || [];
    S.trail = [
      S.gemeten ? { staat: 'klaar', label: gemetenLabel(S.gemeten), duur: st[0] || S.meetDuur } : S.adres && S.meetFout ? { staat: 'waarschuwing', label: 'Geen gebouw gevonden op dit adres · gerekend met de maten uit de klus', duur: st[0] || 0 } : { staat: 'over', label: 'Meting overgeslagen: geen adres' },
      { staat: 'klaar', label: 'Posten geschreven', duur: st[1] || 0 },
      S.uitleg.tekst ? { staat: 'klaar', label: 'Uitleg geschreven', duur: st[2] || 0 } : { staat: 'over', label: 'Geen uitleg' },
    ];
    S.trailDicht = true; S.stapNr = 3;
    S.trailKop = o.voorbeeld ? 'Voorbeeld · 3 stappen' : 'Berekend op ' + datumTekst(S.datum) + (S.duur ? ' · ' + S.duur + ' s' : '');
    kaartDicht(true); zetLeeg(false); body.classList.add('paneel-open'); body.classList.remove('lade', 'rail-open'); zetTab('overzicht'); zetSeg(false);
    $('banner').hidden = true;
    teken();
    const r = laatsteA ? laatsteA.r : null;
    if (r) S.trail[1].label = 'Posten geschreven: ' + r.regels.length + (r.regels.length === 1 ? ' post' : ' posten') + ' in ' + r.fases.length + (r.fases.length === 1 ? ' fase' : ' fases');
    tekenTrail();
    tekenUitleg();
    tekenRail();
    status(o.voorbeeld ? 'Voorbeeld geopend.' : 'Berekening geopend.');
  }
  async function laden(id) {
    if (S.loopt) return;
    try {
      const a = await fetch('/api/berekeningen/' + encodeURIComponent(id), { headers: KOP });
      if (!a.ok) { toast('Berekening niet gevonden'); return; }
      zetKlaar(await a.json());
    } catch (e) { toast('Server antwoordt niet'); }
  }
  function laadVoorbeeld() {
    if (S.loopt) return;
    const m = kopie(RP.VOORBEELD.meetstaat);
    /* De kenmerken van het voorbeeld, zoals de AI ze bij deze klus invult (bron per kenmerk). */
    const K = (label, waarde, eenheid, bron, tekst) => ({ label, eenheid, waarde, tekst: !!tekst, bron });
    m.kenmerken = {
      bebouwing: K('Bebouwing', 'halfopen', '', 'beschrijving', true), dakvorm: K('Dakvorm', 'zadeldak', '', 'beschrijving', true),
      gevelbreedte_m: K('Gevelbreedte', 8, 'm', 'beschrijving'), diepte_m: K('Diepte', 9, 'm', 'beschrijving'), helling_graden: K('Dakhelling', 40, '°', 'beschrijving'), kroonlijst_m: K('Kroonlijsthoogte', 6, 'm', 'beschrijving'),
      dakvlak_m2: K('Dakvlak', 94, 'm²', 'berekend'), noklengte_m: K('Noklengte', 8, 'm', 'berekend'), bedekking: K('Bedekking', 'kleipan klein formaat', '', 'standaard', true), isolatie_cm: K('Isolatie sarking PIR', 12, 'cm', 'beschrijving'),
      dakramen_st: K('Dakramen', 2, 'st', 'beschrijving'), schouwen_st: K('Schouwen', 1, 'st', 'beschrijving'), goot_lm: K('Goten', 16, 'lm', 'berekend'), afvoer_lm: K('Regenafvoeren', 12, 'lm', 'berekend'),
      gemene_zijde_lm: K('Gemene zijde', 11.7, 'lm', 'berekend'), vrije_dakrand_lm: K('Vrije dakrand', 11.7, 'lm', 'berekend'), stelling_m2: K('Stelling', 96, 'm²', 'berekend'), asbest: K('Asbest', 'onbekend', '', 'beschrijving', true),
    };
    zetKlaar({ voorbeeld: true, titel: m.titel, klus: RP.VOORBEELD.klus, asbest: 'onbekend', meetstaat: m, uitleg: VOORBEELD_UITLEG, uitlegPrijs: Math.round(RP.analyse(m, huidig()).r.kosten.incl) });
  }
  function nieuw() {
    if (S.loopt) return;
    Object.assign(S, { id: null, versie: 1, titel: '', adres: '', klus: '', asbest: 'onbekend', datum: '', m: null, gemeten: null, meetFout: '', meetDuur: 0, ploeg: 0, voorbeeld: false, trail: [], trailDicht: false, trailKop: '', duur: 0, origineel: {}, gewijzigd: {}, open: new Set(), bewaard: false, oudePrijs: 0, fase: 'leeg', stapNr: 0 });
    S.uitleg = { tekst: '', staat: 'geen', prijsBij: 0 }; uitlegBuf = ''; live = null;
    $('adres').value = ''; $('klus').value = ''; zetAsbest('onbekend'); $('klus-fout').hidden = true; $('banner').hidden = true;
    kaartDicht(false); zetLeeg(true); zetSeg(false); body.classList.remove('lade');
    if (!smal.matches) body.classList.add('rail-open');
    teken(); tekenTrail(); tekenUitleg(); tekenRail();
    status('');
    $('klus').focus();
  }

  /* ---------- kopiëren en afdrukken ---------- */
  function samenvattingTekst(alleenUitleg) {
    const r = laatsteA ? laatsteA.r : null;
    const regels = [];
    const uitleg = S.uitleg.tekst.split('\n').map(schoon).filter(Boolean);
    if (!alleenUitleg && r) {
      const k = r.kosten;
      regels.push(S.titel || S.m.titel || 'Richtprijs', S.adres ? 'Adres: ' + S.adres : 'Geen adres', 'Datum: ' + (datumTekst(S.datum) || datumTekst(new Date().toISOString())), 'Versie v' + S.versie + (S.voorbeeld ? ' (voorbeeld)' : ''), '');
      regels.push('Richtprijs: ' + eur(k.incl) + ' incl. ' + r.t.btw + ' % btw (' + eur(k.excl) + ' excl. btw' + (r.perM2 ? ', ' + eur(r.perM2) + ' per m² ' + r.vlakNaam : '') + ')');
      regels.push('Ploeg ' + r.ploeg + ' man · ' + r.werkdagen + ' werkdagen · ' + n0.format(Math.round(r.uren)) + ' manuren · ' + gewicht(r.matKg) + ' naar boven · ' + gewicht(r.afvalKg) + ' afval', '');
      regels.push('POSTEN');
      for (const f of r.fases) { regels.push(f.naam + ' (' + n1.format(f.uren) + ' manuren)'); for (const x of f.regels) regels.push('- ' + x.naam + ' · ' + getal(x.hoeveelheid) + ' ' + x.eenheid + ' · ' + n1.format(x.uren) + ' manuren · materiaal ' + eur(x.matKost + x.huurKost) + ' · ' + (x.bron === 'data' ? 'datatabel' : 'AI-schatting') + (x.gevraagd ? '' : ' · niet gevraagd, wel nodig: ' + x.waarom)); }
      regels.push('', 'KOSTENOPBOUW', 'Arbeid: ' + n0.format(Math.round(r.uren)) + ' manuren × ' + eur2(r.t.uurtarief) + ' = ' + eur(k.arbeid), 'Materiaal: inkoop ' + eur(k.materiaalInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge = ' + eur(k.materiaal), 'Materieel en afvoer: inkoop ' + eur(k.materieelInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge = ' + eur(k.materieel), 'Subtotaal: ' + eur(k.subtotaal), 'Onvoorzien ' + getal(r.t.onvoorzien) + ' %: ' + eur(k.onvoorzien), 'Prijs excl. btw: ' + eur(k.excl), 'Btw ' + r.t.btw + ' %: ' + eur(k.btw), 'Prijs incl. btw: ' + eur(k.incl), '');
    }
    if (uitleg.length) regels.push('TOELICHTING', ...uitleg.map((s) => '- ' + s), '');
    if (S.m && S.m.aannames.length) regels.push('AANNAMES', ...S.m.aannames.map((s) => '- ' + s), '');
    if (S.m && S.m.plaatsbezoek.length) regels.push('TE CONTROLEREN BIJ HET PLAATSBEZOEK', ...S.m.plaatsbezoek.map((s) => '- ' + s), '');
    if (!alleenUitleg) regels.push('Richtprijs uit ' + (S.gemeten ? 'de kaartmeting' : 'de maten in de klus') + ', uw tarieven en de datatabel van ' + DATA.stand + '. Richtprijs-AI.');
    return regels.join('\n').trim() + '\n';
  }
  async function kopieer(wat) {
    const tekst = samenvattingTekst(wat === 'uitleg');
    try { await navigator.clipboard.writeText(tekst); toast('Gekopieerd'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = tekst; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove(); toast(ok ? 'Gekopieerd' : 'Niet gekopieerd');
    }
  }

  /* ---------- instellingen: tarieven, standaarden, datatabel ---------- */
  const TARIEF = [
    { k: 'uurtarief', label: 'Uurtarief', eenheid: '€/u', toon: (v) => n2.format(v), min: 1 },
    { k: 'urenPerDag', label: 'Uren per werkdag', eenheid: 'u', toon: getal, min: 1 },
    { k: 'ploeg', label: 'Ploeg', eenheid: 'man', toon: getal, min: 1 },
    { k: 'materiaalmarge', label: 'Marge op materiaal', eenheid: '%', toon: getal, min: 0 },
    { k: 'onvoorzien', label: 'Onvoorzien', eenheid: '%', toon: getal, min: 0 },
    { k: 'btw', label: 'Btw', select: true },
  ];
  const GROEPEN = [
    ['Hellend dak', ['dakramen_gesloten', 'dakramen_halfopen', 'dakramen_open', 'schouwen', 'helling', 'kroonlijst', 'isolatie', 'afvoeren', 'overstek_goot', 'overstek_gevel', 'bedekking']],
    ['Gevel', ['gevel_isolatie', 'gevel_openingen', 'gevel_opening_omtrek', 'crepi']],
    ['Plat dak', ['plat_isolatie', 'plat_bedekking']],
    ['Binnen', ['plafondhoogte', 'verf_lagen']],
    ['Ploeg', ['ploeg']],
  ];
  function tekenTarieven() {
    const el = $('tarieven-velden');
    const focus = document.activeElement && document.activeElement.closest('#tarieven-velden') ? document.activeElement.id : '';
    const start = RP.DATA_START.tarieven;
    const ploegNu = laatsteA ? laatsteA.r.ploeg : (S.ploeg || standaarden.ploeg || 3);
    el.innerHTML = TARIEF.map((t) => {
      if (t.select) return '<div class="veld"><label for="t-btw"><span>Btw</span></label><div class="in"><select id="t-btw" data-tarief="btw"><option value="6"' + (tarieven.btw === 6 ? ' selected' : '') + '>6 % (woning ouder dan 10 jaar)</option><option value="21"' + (tarieven.btw === 21 ? ' selected' : '') + '>21 %</option></select></div>' + (tarieven.btw !== start.btw ? '<button class="link terug" type="button" data-tarief-terug="btw">Terug naar ' + start.btw + ' %</button>' : '') + '</div>';
      const v = t.k === 'ploeg' ? ploegNu : tarieven[t.k];
      const anders = t.k === 'ploeg' ? !!(S.ploeg && S.m && S.ploeg !== (S.m.ploeg || 3)) : v !== start[t.k];
      return '<div class="veld"><label for="t-' + t.k + '"><span>' + t.label + '</span></label><div class="in"><input id="t-' + t.k + '" data-tarief="' + t.k + '" type="text" inputmode="decimal" autocomplete="off" value="' + esc(t.toon(v)) + '"><span class="eenheid">' + t.eenheid + '</span></div>' +
        (anders ? '<button class="link terug" type="button" data-tarief-terug="' + t.k + '">Terug naar ' + esc(t.k === 'ploeg' ? ((S.m && S.m.ploeg) || 3) + ' man' : (t.k === 'uurtarief' ? eur2(start[t.k]) : t.toon(start[t.k]) + ' ' + t.eenheid)) + '</button>' : '') + '</div>';
    }).join('');
    if (focus && $(focus)) { const e = $(focus); e.focus(); if (e.setSelectionRange) e.setSelectionRange(e.value.length, e.value.length); }
  }
  /* Alleen de links "Terug naar …" bijwerken: het veld waarin getypt wordt blijft staan. */
  function tekenTariefLinks() {
    const start = RP.DATA_START.tarieven;
    for (const t of TARIEF) {
      const veld = $('t-' + t.k) && $('t-' + t.k).closest('.veld');
      if (!veld) continue;
      const anders = t.k === 'ploeg' ? !!(S.ploeg && S.m && S.ploeg !== (S.m.ploeg || 3)) : tarieven[t.k] !== start[t.k];
      const oud = veld.querySelector('.terug');
      if (!anders) { if (oud) oud.remove(); continue; }
      const tekst = 'Terug naar ' + (t.k === 'ploeg' ? ((S.m && S.m.ploeg) || 3) + ' man' : t.k === 'btw' ? start.btw + ' %' : t.k === 'uurtarief' ? eur2(start[t.k]) : t.toon(start[t.k]) + ' ' + t.eenheid);
      if (oud) oud.textContent = tekst;
      else veld.insertAdjacentHTML('beforeend', '<button class="link terug" type="button" data-tarief-terug="' + t.k + '">' + esc(tekst) + '</button>');
    }
  }
  function tekenStandaarden() {
    const bySleutel = Object.fromEntries(RP.STANDAARDEN.map((s) => [s.k, s]));
    $('standaarden-aantal').textContent = RP.STANDAARDEN.length + ' velden';
    $('standaarden-groepen').innerHTML = GROEPEN.map(([naam, sleutels]) => '<div class="groep"><h4>' + naam + '</h4><div class="velden">' + sleutels.map((k) => {
      const s = bySleutel[k];
      if (!s) return '';
      const over = inst.standaarden[k];
      const eigen = over != null && over !== '' && String(over) !== String(s.std);
      return '<div class="veld"><label for="s-' + k + '"><span>' + esc(s.label) + '</span>' + (eigen ? chip('Eigen cijfer') : chip('Standaard', 'ai')) + '</label><div class="in"><input id="s-' + k + '" data-standaard="' + k + '" type="text" autocomplete="off"' + (s.tekst ? '' : ' inputmode="decimal"') + ' value="' + esc(s.tekst ? standaarden[k] : getal(standaarden[k])) + '">' + (s.eenheid ? '<span class="eenheid">' + esc(s.eenheid) + '</span>' : '') + '</div>' +
        (eigen ? '<button class="link terug" type="button" data-standaard-terug="' + k + '">Terug naar startwaarde (' + esc(s.tekst ? s.std : getal(s.std)) + ')</button>' : '') + '</div>';
    }).join('') + '</div></div>').join('');
  }
  let vakFilter = 'Hellend dak', zoekTekst = '';
  function tekenVakken() {
    const tel = {};
    for (const code of Object.keys(DATA.posten)) { const v = RP.vakVan(code); tel[v] = (tel[v] || 0) + 1; }
    $('vakken').innerHTML = Object.values(RP.VAKKEN).map((v) => '<button type="button" data-vak="' + esc(v) + '" class="' + (vakFilter === v ? 'is-actief' : '') + '" aria-pressed="' + (vakFilter === v) + '">' + esc(v) + ' · ' + (tel[v] || 0) + '</button>').join('');
    $('datatabel-kop').textContent = Object.keys(DATA.posten).length + ' posten · ' + n0.format(RP.telWaarden()) + ' waarden · stand ' + DATA.stand;
  }
  function tekenPosten() {
    const upd = tarieven.urenPerDag;
    const q = zoekTekst.trim().toLowerCase();
    const codes = Object.keys(DATA.posten).filter((code) => (!vakFilter || RP.vakVan(code) === vakFilter) && (!q || code.toLowerCase().includes(q) || DATA.posten[code].naam.toLowerCase().includes(q)));
    if (!codes.length) {
      $('posten').innerHTML = '<div class="post-leeg"><b class="inkt">Geen post met ‘' + esc(zoekTekst.trim()) + '’' + (vakFilter ? ' in ' + esc(vakFilter) : '') + '.</b>' + (vakFilter ? '<button class="link" type="button" data-vak="">Zoek in alle vakken</button>' : '<button class="link" type="button" data-zoek-wis>Zoekopdracht wissen</button>') + '</div>';
      return;
    }
    $('posten').innerHTML = codes.map((code) => {
      const p = DATA.posten[code];
      const start = RP.DATA_START.posten[code];
      const over = inst.posten[code] || {};
      const open = S.openPosten.has(code);
      let h = '<div class="post" data-code="' + esc(code) + '"><button class="kop" type="button" data-post-toggle="' + esc(code) + '" aria-expanded="' + open + '"><span><b>' + esc(p.naam) + '</b><small>' + n2.format(p.uur) + ' manuur per ' + esc(p.eenheid) + ' · 1 man doet ' + getal(p.uur > 0 ? Math.round(upd / p.uur * 10) / 10 : 0) + ' ' + esc(p.eenheid) + ' per werkdag · ' + esc(code) + '</small></span>' + ic(open ? 'omhoog' : 'omlaag') + '</button>';
      if (open) {
        const normEigen = over.uur != null && Number(over.uur) !== start.uur;
        h += '<div class="open"><div class="norm"><span class="klein">Norm</span><span class="in"><input type="text" inputmode="decimal" aria-label="Norm in manuur per ' + esc(p.eenheid) + '" data-norm="' + esc(code) + '" value="' + esc(n2.format(p.uur)) + '"></span><span class="klein">manuur per ' + esc(p.eenheid) + '</span>' + (normEigen ? chip('Eigen cijfer') + '<button class="link" type="button" data-norm-terug="' + esc(code) + '">Terug naar startwaarde (' + n2.format(start.uur) + ')</button>' : chip('Startwaarde')) + '</div>';
        if (p.mat.length) {
          h += '<div class="tabel kol-data"><div class="tabel-kop"><span>Materiaal</span><span class="g">Per</span><span class="g">Eenheid</span><span class="g">Prijs €</span><span class="g">Kg</span><span class="g">Label</span></div>';
          p.mat.forEach((x, i) => {
            const sx = start.mat[i] || x;
            const eigen = over.mat && over.mat[x.naam] && over.mat[x.naam].prijs != null && Number(over.mat[x.naam].prijs) !== sx.prijs;
            const label = eigen ? chip('Eigen cijfer') + '<button class="link" type="button" data-prijs-terug="' + esc(code) + '" data-mat="' + esc(x.naam) + '">Terug naar startwaarde (' + n2.format(sx.prijs) + ')</button>'
              : (x.bron && x.bron.url ? '<a class="chip" href="' + esc(x.bron.url) + '" target="_blank" rel="noopener" title="' + esc(x.bron.wat || 'Bron') + '">' + ic('link') + 'Bron</a>' : chip('Startwaarde'));
            h += '<div class="rij"><div class="n">' + esc(x.naam) + (x.huur ? ' ' + chip(x.perWeek ? 'Huur per week' : 'Huur') : '') + '</div><div class="g" data-l="Per">' + getal(x.per) + '</div><div class="g" data-l="Eenheid">' + esc(x.eenheid) + '</div><div class="g" data-l="Prijs €"><span class="in"><input type="text" inputmode="decimal" aria-label="Prijs van ' + esc(x.naam) + '" data-prijs="' + esc(code) + '" data-mat="' + esc(x.naam) + '" value="' + esc(n2.format(x.prijs)) + '"></span></div><div class="g" data-l="Kg">' + (x.kg ? getal(x.kg) : '—') + '</div><div class="g" data-l="Label">' + label + '</div></div>';
          });
          h += '</div>';
        }
        const afval = (p.afval || (p.afvalKg ? [{ soort: 'rest', kg: p.afvalKg }] : [])).filter((a) => a.kg > 0);
        if (afval.length) h += '<p class="klein">Afval per ' + esc(p.eenheid) + ': ' + afval.map((a) => getal(a.kg) + ' kg ' + esc(a.soort)).join(' · ') + '</p>';
        h += '</div>';
      }
      return h + '</div>';
    }).join('');
  }
  const leesGetal = (s) => { const v = parseFloat(String(s).replace(',', '.')); return Number.isFinite(v) ? v : NaN; };
  function tekenInstellingen() { tekenTarieven(); tekenStandaarden(); tekenVakken(); tekenPosten(); }
  function openInstellingen(aan) {
    body.classList.toggle('instellingen-open', aan);
    body.classList.remove('lade');
    if (aan) { tekenInstellingen(); $('instellingen').scrollTop = 0; }
  }

  /* ---------- events ---------- */
  $('bereken').addEventListener('click', () => { if (S.loopt) { if (ctl) ctl.abort(); } else start(null); });
  $('stop').addEventListener('click', () => { if (ctl && S.loopt) ctl.abort(); });
  $('wijzig').addEventListener('click', () => { kaartDicht(false); $('klus').focus(); });
  $('adres').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!S.loopt) start(null); } });
  $('klus').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!S.loopt) start(null); } });
  $('klus').addEventListener('input', () => { $('klus-fout').hidden = true; const t = $('klus'); t.style.height = 'auto'; t.style.height = Math.min(288, Math.max(72, t.scrollHeight)) + 'px'; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (S.loopt && ctl) ctl.abort(); $('menu').hidden = true; } });
  $('herbereken').addEventListener('click', () => {
    if (S.loopt || !S.m || !S.m.kenmerken) return;
    const vast = {};
    for (const [k, x] of Object.entries(S.m.kenmerken)) if (x.waarde !== '' && x.waarde != null && !Number.isNaN(x.waarde)) vast[k] = { label: x.label, eenheid: x.eenheid, waarde: x.waarde };
    start(vast);
  });
  $('herstel').addEventListener('click', () => {
    if (!S.m) return;
    for (const [k, o] of Object.entries(S.gewijzigd)) if (S.m.kenmerken[k]) { S.m.kenmerken[k].waarde = o.waarde; S.m.kenmerken[k].bron = o.bron; }
    S.gewijzigd = {};
    teken();
  });
  $('kenmerken').addEventListener('input', (e) => {
    const k = e.target.getAttribute('data-k');
    if (!k || !S.m || !S.m.kenmerken[k]) return;
    const x = S.m.kenmerken[k];
    if (!(k in S.gewijzigd)) S.gewijzigd[k] = { waarde: x.waarde, bron: x.bron };
    x.waarde = x.tekst ? e.target.value : leesGetal(e.target.value);
    x.bron = 'vast';
    const veld = e.target.closest('.veld');
    const c = veld.querySelector('.chip'); c.className = 'chip'; c.textContent = BRONTEKST.vast;
    if (!veld.querySelector('.terug')) veld.insertAdjacentHTML('beforeend', '<button class="link terug" type="button" data-terug="' + esc(k) + '">Terug naar ' + esc(waardeTekst(S.gewijzigd[k])) + '</button>');
    kenmerkenSleutel = kenmerkenSleutelNu();
    tekenPlakbalk();
  });
  $('tarieven-velden').addEventListener('input', (e) => {
    const k = e.target.getAttribute('data-tarief');
    if (!k) return;
    if (k === 'btw') { zetTarief('btw', e.target.value === '21' ? 21 : 6); return; }
    const t = TARIEF.find((x) => x.k === k);
    const v = leesGetal(e.target.value);
    if (!Number.isFinite(v) || v < t.min) return;
    zetTarief(k, v);
  });
  $('tarieven-velden').addEventListener('change', () => tekenTarieven());
  $('standaarden-groepen').addEventListener('input', (e) => {
    const k = e.target.getAttribute('data-standaard');
    if (!k) return;
    inst.standaarden[k] = e.target.value;
    standaarden = RP.standaardWaarden(inst.standaarden);
    bewaarInstellingen();
    const s = RP.STANDAARDEN.find((x) => x.k === k);
    const veld = e.target.closest('.veld'), c = veld.querySelector('.chip');
    const eigen = String(e.target.value) !== String(s.std) && e.target.value !== '';
    c.className = 'chip' + (eigen ? '' : ' chip--ai'); c.textContent = eigen ? 'Eigen cijfer' : 'Standaard';
    const terug = veld.querySelector('.terug');
    if (eigen && !terug) veld.insertAdjacentHTML('beforeend', '<button class="link terug" type="button" data-standaard-terug="' + k + '">Terug naar startwaarde (' + esc(s.tekst ? s.std : getal(s.std)) + ')</button>');
    if (!eigen && terug) terug.remove();
  });
  $('data-zoek').addEventListener('input', (e) => { zoekTekst = e.target.value; tekenPosten(); });
  $('posten').addEventListener('input', (e) => {
    const code = e.target.getAttribute('data-norm') || e.target.getAttribute('data-prijs');
    if (!code) return;
    const v = leesGetal(e.target.value);
    if (!Number.isFinite(v) || v < 0) return;
    const o = inst.posten[code] || (inst.posten[code] = {});
    if (e.target.hasAttribute('data-norm')) o.uur = v;
    else { o.mat = o.mat || {}; o.mat[e.target.getAttribute('data-mat')] = { prijs: v }; }
    RP.pasInstellingenToe(inst);
    bewaarInstellingen();
    teken(); tekenUitlegRest();
  });
  $('posten').addEventListener('change', () => tekenPosten());
  $('inst-lijst').addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    document.querySelectorAll('#inst-lijst a').forEach((x) => x.classList.toggle('is-actief', x === a));
    const doel = document.querySelector(a.getAttribute('href'));
    if (doel) doel.scrollIntoView({ block: 'start' });
  });
  $('opslaan').addEventListener('click', () => opslaan(false));
  $('offerte').addEventListener('click', () => toast('Offerte komt in versie 2'));
  $('banner-opnieuw').addEventListener('click', async () => {
    try { const a = await fetch('/api/ping'); if (a.ok) { $('banner').hidden = true; if (S.fase === 'fout') start(null); return; } } catch (e) { /* nog weg */ }
    toast('Server antwoordt nog niet');
  });

  /* Eén luisteraar voor alle knoppen met een data-attribuut. */
  document.addEventListener('click', async (e) => {
    const k = e.target.closest('button, a, [data-chip-weg]');
    if (!k) { if (!e.target.closest('#menu')) $('menu').hidden = true; return; }
    const d = k.dataset;
    if (k.hasAttribute('data-rail')) { body.classList.toggle(smal.matches ? 'lade' : 'rail-open'); return; }
    if (k.hasAttribute('data-nieuw')) { nieuw(); return; }
    if (k.hasAttribute('data-voorbeeld') && !k.hasAttribute('data-voorbeeld-chip')) { laadVoorbeeld(); return; }
    if (d.instellingen) { openInstellingen(d.instellingen === 'open'); return; }
    if (d.tabKnop) { zetTab(d.tabKnop); return; }
    if (d.tabNaar) { zetTab(d.tabNaar); zetSeg(true); return; }
    if (d.seg) { zetSeg(d.seg === 'resultaat'); if (d.seg === 'resultaat') window.scrollTo(0, 0); return; }
    if (k.hasAttribute('data-menu')) { const m = $('menu'); m.hidden = !m.hidden; tekenKnoppen(); return; }
    if (d.menuActie) {
      $('menu').hidden = true;
      if (d.menuActie === 'opslaan') opslaan(false); else if (d.menuActie === 'kopieer') kopieer('alles'); else if (d.menuActie === 'print') window.print(); else if (d.menuActie === 'verwijder' && S.id) verwijder(S.id);
      return;
    }
    if (d.laad) { laden(d.laad); body.classList.remove('lade'); return; }
    if (d.verwijder) { verwijder(d.verwijder); return; }
    if (d.chipWeg != null) { e.stopPropagation(); e.preventDefault(); const weg = opslag.lees('richtprijs-chips-weg', []); weg.push(Number(d.chipWeg)); opslag.schrijf('richtprijs-chips-weg', weg); tekenVoorbeelden(); return; }
    if (d.voorbeeldChip != null) { const v = VOORBEELDEN[Number(d.voorbeeldChip)]; $('adres').value = ''; $('klus').value = v.klus; $('klus-fout').hidden = true; $('klus').focus(); $('klus').setSelectionRange(v.klus.length, v.klus.length); return; }
    if (k.hasAttribute('data-trail-toggle')) { S.trailDicht = !S.trailDicht; tekenTrail(); return; }
    if (k.hasAttribute('data-adres-aanpassen')) { kaartDicht(false); zetSeg(false); $('adres').focus(); return; }
    if (k.hasAttribute('data-uitleg-opnieuw')) { uitlegOpnieuw(); return; }
    if (d.kopieer) { kopieer(d.kopieer); return; }
    if (k.hasAttribute('data-print')) { window.print(); return; }
    if (d.naar) { e.preventDefault(); zetSeg(false); const doel = $(d.naar); if (doel) { doel.hidden = false; doel.scrollIntoView({ block: 'start', behavior: reduceer.matches ? 'auto' : 'smooth' }); } return; }
    if (d.toepassen) {
      if (d.toepassen === 'btw') zetTarief('btw', 21);
      else zetTarief('ploeg', Number(d.toepassen.split(':')[1]));
      return;
    }
    if (d.tariefTerug) {
      if (d.tariefTerug === 'ploeg') { S.ploeg = 0; tariefGewijzigd(); }
      else zetTarief(d.tariefTerug, RP.DATA_START.tarieven[d.tariefTerug]);
      return;
    }
    if (d.rekenpad) { if (S.open.has(d.rekenpad)) S.open.delete(d.rekenpad); else S.open.add(d.rekenpad); tekenWerkblad(laatsteA, skeletLoopt()); return; }
    if (d.fase) { const s = 'fase|' + d.fase; if (S.open.has(s)) S.open.delete(s); else S.open.add(s); k.classList.toggle('is-dicht', S.open.has(s)); k.setAttribute('aria-expanded', !S.open.has(s)); return; }
    if (d.terug) { const o = S.gewijzigd[d.terug]; if (o && S.m && S.m.kenmerken[d.terug]) { S.m.kenmerken[d.terug].waarde = o.waarde; S.m.kenmerken[d.terug].bron = o.bron; } delete S.gewijzigd[d.terug]; teken(); return; }
    if (d.standaardTerug) { delete inst.standaarden[d.standaardTerug]; standaarden = RP.standaardWaarden(inst.standaarden); bewaarInstellingen(); tekenStandaarden(); return; }
    if (d.vak != null) { vakFilter = d.vak; tekenVakken(); tekenPosten(); return; }
    if (k.hasAttribute('data-zoek-wis')) { zoekTekst = ''; $('data-zoek').value = ''; tekenPosten(); return; }
    if (d.postToggle) { if (S.openPosten.has(d.postToggle)) S.openPosten.delete(d.postToggle); else S.openPosten.add(d.postToggle); tekenPosten(); return; }
    if (d.normTerug) { const o = inst.posten[d.normTerug]; if (o) delete o.uur; RP.pasInstellingenToe(inst); bewaarInstellingen(); tekenPosten(); teken(); return; }
    if (d.prijsTerug) { const o = inst.posten[d.prijsTerug]; if (o && o.mat) delete o.mat[d.mat]; RP.pasInstellingenToe(inst); bewaarInstellingen(); tekenPosten(); teken(); return; }
  });
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-chip-weg')) { e.preventDefault(); e.target.click(); } });

  /* ---------- hash-haakjes en start ---------- */
  function hash() {
    const delen = location.hash.replace(/^#/, '').split(',').filter(Boolean);
    for (const t of delen) {
      if (t === 'voorbeeld') laadVoorbeeld();
      else if (t === 'leeg') { nieuw(); openInstellingen(false); }
      else if (t === 'instellingen' || t === 'tarieven' || t === 'standaarden' || t === 'datatabel') { openInstellingen(true); if (t !== 'instellingen') { const doel = $(t); if (doel) doel.scrollIntoView(); } }
      else if (TABS.includes(t)) { zetTab(t); zetSeg(true); }
      else if (t === 'resultaat') zetSeg(true);
      else if (t === 'rail') body.classList.add('rail-open');
      else if (t === 'lade') body.classList.add('lade');
      else if (t === 'donker') document.documentElement.classList.add('donker');
    }
  }
  window.addEventListener('hashchange', hash);

  (async function init() {
    /* De klus van het voorbeeld staat klaar in het veld: zo start een eerste berekening met één klik. */
    $('klus').value = RP.VOORBEELD.klus;
    tekenVoorbeelden();
    kaartDicht(false);
    teken(); tekenTrail(); tekenUitleg();
    await laadInstellingen();
    tekenInstellingen();
    teken();
    laadLijst();
    hash();
  })();
})();
