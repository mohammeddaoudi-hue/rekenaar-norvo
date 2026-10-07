/* ============================================================================================================
   OFFERTE: de vertaling van een kostprijsberekening naar offerteregels, volgens ontwerp/OFFERTE-spec.txt (7 okt 2026).
   Geen DOM: RP.offerteVan(m, tarieven, instOfferte, keuzes) is een pure functie, testbaar buiten de browser.
   ============================================================================================================ */
(function (g) {
  'use strict';
  const RP = g.RP;
  const DATA = RP.DATA;
  const num = (v) => { const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v); return Number.isFinite(n) ? n : 0; };
  /* Afronden op de cent, met een correctie tegen binaire restjes (zelfde aanpak als omhoog() in motor.js). */
  const cent = (x) => Math.round(x * 100 + (x >= 0 ? 1e-7 : -1e-7)) / 100;
  const n2 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nH = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 2 });
  const eur = (x) => '€ ' + n2.format(x);
  const hoev = (x) => nH.format(x);
  const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const datumVoluit = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? d.getDate() + ' ' + MAANDEN[d.getMonth()] + ' ' + d.getFullYear() : ''; };
  const isoDag = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const plusDagen = (iso, n) => { const d = new Date(iso); if (isNaN(d)) return ''; d.setDate(d.getDate() + n); return isoDag(d); };
  const plusMaanden = (iso, n) => { const d = new Date(iso); if (isNaN(d)) return ''; d.setMonth(d.getMonth() + n); return isoDag(d); };

  /* Startwaarden van de vaste instellingen (instellingen.offerte); de aannemer past ze aan in het formulier. */
  const UITSLUITINGEN_START = [
    { tekst: 'Verwijdering van niet-hechtgebonden asbest door een erkende asbestverwijderaar.', vakken: ['Hellend dak', 'Gevel', 'Plat dak'] },
    { tekst: 'Elektriciteitswerken en het los- en aankoppelen van zonnepanelen door een installateur.', vakken: ['*'] },
    { tekst: 'Binnenafwerking na de werken: plafonds, pleisterwerk en schilderwerk.', vakken: ['Hellend dak', 'Plat dak', 'Ramen en deuren'] },
    { tekst: 'Vergunningen, meldingen en parkeerverbod, tenzij als post opgenomen.', vakken: ['*'] },
    { tekst: 'Nutsaansluitingen en werken aan leidingen van water, gas of elektriciteit.', vakken: ['*'] },
    { tekst: 'Herstel van verborgen gebreken aan de draagstructuur die pas na afbraak zichtbaar worden; wordt als meerwerk geprijsd.', vakken: ['Hellend dak', 'Plat dak', 'Gevel', 'Vloeren en tegels'] },
    { tekst: 'Stabiliteitsstudie, EPB-verslag en andere studies.', vakken: ['*'] },
  ];
  const MEERWERK = 'Werken die niet in deze offerte staan, prijzen wij vooraf schriftelijk (e-mail volstaat) en voeren wij pas uit na uw schriftelijk akkoord. Prijsbasis voor meerwerken in regie: € {regietarief} per uur en per arbeider, excl. btw; materiaal en materieel aan inkoopprijs plus {marge} %; afvoer van afval aan kostprijs. Minderwerk wordt aan dezelfde eenheidsprijzen verrekend.';
  const VOORWAARDEN_START = [
    '1. Toepassing. Deze voorwaarden horen bij de offerte waarop ze gedrukt zijn. Afwijkingen gelden alleen schriftelijk. Samen vormen zij de aannemingsovereenkomst.',
    '2. Geldigheid. De offerte geldt tot de datum op de voorzijde. Na die datum maakt {Aannemer} op vraag een nieuwe offerte.',
    '3. Prijs. De prijs is vast en inclusief btw zoals vermeld. Posten met de aard VH worden na opmeting verrekend aan de vermelde eenheidsprijs. Voor werken die starten binnen zes maanden na de offertedatum is er geen prijsherziening. Het btw-tarief van 6 % geldt onder de voorwaarden op de voorzijde; is daaraan niet voldaan, dan geldt 21 %.',
    '4. Meerwerken. {meerwerken}',
    '5. Uitvoering. De termijn geldt in werkdagen zoals op de voorzijde omschreven. Weerverlet, bouwverlof, wachttijd op keuzes, toegang of betalingen van de klant en leveringsvertragingen buiten de wil van {Aannemer} schorsen de termijn. {Aannemer} meldt elke schorsing schriftelijk.',
    '6. Werf. De klant geeft vrije toegang tot de werf, water en stroom, en een vrije werkzone voor stelling, container en materiaal. De klant meldt vooraf wat hij weet over leidingen, asbest en verborgen constructies.',
    '7. Betaling. De schijven en de betaaltermijn staan op de voorzijde. Blijft een factuur onbetaald op de vervaldag, dan stuurt {Aannemer} een kosteloze herinnering. Betaalt de klant niet binnen 14 kalenderdagen na die herinnering, dan is interest verschuldigd. De interest is de referentierentevoet van de wet van 2 augustus 2002, vermeerderd met 8 procentpunt. Daarbij komt een forfaitaire vergoeding: 20 euro bij een schuld tot 150 euro. Van 150,01 tot 500 euro: 30 euro plus 10 % van het bedrag. Boven 500 euro: 65 euro plus 5 % van het bedrag, met een maximum van 2.000 euro. Blijft {Aannemer} 14 kalenderdagen na een herinnering van de klant zelf in gebreke, dan gelden dezelfde interest en vergoeding voor de klant.',
    '8. Eigendom. Geleverde maar nog niet verwerkte materialen blijven eigendom van {Aannemer} tot de volledige betaling.',
    '9. Oplevering. Bij het einde van de werken ondertekenen beide partijen een opleveringsverslag. Zichtbare gebreken vermeldt de klant in dat verslag; {Aannemer} herstelt ze binnen 30 kalenderdagen. De aanvaarding start de garantietermijnen. Het saldo wordt na de oplevering gefactureerd.',
    '10. Garantie. {Aannemer} is tien jaar aansprakelijk voor ernstige gebreken die de stabiliteit of de waterdichtheid van het werk aantasten, vanaf de oplevering. Lichte verborgen gebreken meldt de klant schriftelijk binnen twee maanden na de vaststelling; {Aannemer} herstelt ze binnen 30 kalenderdagen. Op materialen geldt de garantie van de fabrikant. Normale slijtage, verkeerd gebruik, gebrek aan onderhoud en werk van derden vallen buiten de garantie.',
    '11. Verzekering. {Aannemer} is verzekerd voor zijn burgerlijke aansprakelijkheid uitbating. Is een architect wettelijk verplicht, dan sluit {Aannemer} de verzekering tienjarige aansprakelijkheid af en overhandigt het attest vóór de start.',
    '12. Verbreking. Verbreekt de klant de overeenkomst na ondertekening, dan betaalt hij de uitgevoerde werken en de bestelde, niet-retourneerbare materialen aan de prijzen van deze offerte. Daarbij komt {verbreking} % van het niet-uitgevoerde deel. Verbreekt {Aannemer} zonder reden, dan betaalt {Aannemer} de klant dezelfde {verbreking} % van het niet-uitgevoerde deel.',
    '13. Herroeping. Is de offerte bij de klant thuis of op de werf ondertekend, dan kan de klant ze binnen 14 kalenderdagen herroepen. Een reden opgeven hoeft niet (artikel VI.47 WER). Het modelformulier voor herroeping hoort dan bij de offerte. Bij een dringende herstelling op uitdrukkelijk verzoek van de klant geldt geen herroepingsrecht.',
    '14. Klachten en geschillen. Klachten stuurt de klant schriftelijk naar {e-mail}. {Aannemer} bevestigt de ontvangst binnen 2 werkdagen en antwoordt binnen 10 werkdagen. Technische geschillen leggen beide partijen eerst voor aan de Verzoeningscommissie Bouw (North Gate III, Koning Albert II-laan 16, 1000 Brussel). Daarna is de rechtbank bevoegd die de wet aanwijst. Belgisch recht is van toepassing.',
  ].join('\n\n');
  const TEKSTEN_START = {
    termijn: 'De termijn geldt in werkdagen. Zaterdagen, zondagen, feestdagen, het bouwverlof en dagen met weerverlet tellen niet mee. Weerverlet = regen, vorst of blijvende sneeuw die het werk gedurende ten minste vier uur onmogelijk maken, genoteerd in het werfboek. Wachttijd op keuzes, toegang of betalingen van de klant en leveringsvertragingen buiten onze wil schorsen de termijn; wij melden elke schorsing schriftelijk.',
    garantie: 'Garantie: tien jaar op de stabiliteit en de waterdichtheid van het uitgevoerde werk vanaf de oplevering; lichte verborgen gebreken herstellen wij na schriftelijke melding; fabrieksgarantie op materialen volgens de fabrikant.',
    veiligheid: 'Veiligheid: vóór de start maken wij een plaatsbeschrijving met foto’s van de werf en de aanpalende delen. Het postinterventiedossier (foto’s en technische fiches van de uitgevoerde werken) wordt bij de oplevering overhandigd.',
    afval: 'Afval: al het afval van de werken voeren wij af en verwerken wij volgens de wettelijke regels; de kost zit in de posten.',
    bestelbon: 'Deze ondertekende offerte geldt als bestelbon.',
    optiesZin: 'Kruis aan wat u wenst; een aangekruiste optie wordt bij ondertekening deel van de opdracht en van de prijs.',
    vhZin: 'VH = vermoedelijke hoeveelheid: na de werken wordt de werkelijk uitgevoerde hoeveelheid opgemeten en verrekend aan de vermelde eenheidsprijs. FH = forfaitaire hoeveelheid: vaste prijs voor de vermelde hoeveelheid.',
    akkoord: 'Door ondertekening aanvaardt de klant deze offerte, het betalingsschema en de algemene voorwaarden bij deze offerte; deze offerte geldt als bestelbon en wordt de aannemingsovereenkomst.',
  };
  const BTW6 = 'Btw-tarief: Bij gebrek aan schriftelijke betwisting binnen een termijn van één maand vanaf de ontvangst van de factuur, wordt de klant geacht te erkennen dat: (1) de werken worden verricht aan een woning waarvan de eerste ingebruikneming heeft plaatsgevonden in een kalenderjaar dat ten minste tien jaar voorafgaat aan de datum van de eerste factuur met betrekking tot die werken, (2) de woning, na uitvoering van die werken, uitsluitend of hoofdzakelijk als privéwoning wordt gebruikt en (3) de werken worden verstrekt en gefactureerd aan een eindverbruiker. Wanneer minstens één van die voorwaarden niet is voldaan, zal het normale btw-tarief van 21 % van toepassing zijn en is de afnemer ten aanzien van die voorwaarden aansprakelijk voor de betaling van de verschuldigde belasting, interesten en geldboeten.';
  const ASBEST_ZIN = {
    ja: 'Asbest: de asbestposten betreffen hechtgebonden asbest, verwijderd met eenvoudige handelingen door opgeleid personeel, dubbel verpakt en afgevoerd naar een vergunde verwerker. Niet-hechtgebonden asbest (leidingisolatie, spuitasbest, asbesthoudend pleisterwerk of lijmlagen) valt buiten deze offerte en wordt door een erkende asbestverwijderaar verwijderd tegen afzonderlijke offerte.',
    nee: 'Asbest: deze offerte gaat uit van de afwezigheid van asbest.',
    onbekend: 'Asbest: deze offerte gaat uit van de afwezigheid van asbest. Wordt asbest vastgesteld, dan stoppen de werken op dat onderdeel en prijzen wij de verwijdering apart (hechtgebonden: eigen opgeleid personeel; niet-hechtgebonden: erkende asbestverwijderaar).',
  };
  const PREMIE_ZIN = 'Premies: de aannemer verbindt zich ertoe om alle documenten, die nodig zijn voor aanvraag van Mijn VerbouwLening/Mijn VerbouwPremie, te bezorgen aan de bouwheer.';
  const RECHTSVORMEN = ['BV', 'NV', 'CommV', 'VOF', 'eenmanszaak', 'andere'];
  const START = { geldigheidDagen: 30, betaling: { p1: 30, p2: 40, p3: 30 }, betaaltermijn: 14, verbreking: 10, verbrekingMax: 15, volgnummer: 0, volgnummerJaar: 0 };

  /* Volledige instellingen: wat in instellingen.offerte staat, aangevuld met de startwaarden. */
  function vulInstellingen(inst, uurtarief) {
    const o = inst && typeof inst === 'object' ? inst : {};
    const a = Object.assign({ naam: '', rechtsvorm: '', adres: '', ondernemingsnummer: '', btw: '', rpr: '', telefoon: '', email: '', website: '', iban: '', logo: '', baVerzekeraar: '', baPolis: '', tienjarigeVerzekeraar: '', tienjarigeOndernemingsnummer: '', tienjarigePolis: '' }, o.aannemer || {});
    const u = Object.assign({}, START, o, { aannemer: a });
    u.betaling = Object.assign({}, START.betaling, o.betaling || {});
    u.regietarief = num(o.regietarief) > 0 ? num(o.regietarief) : Math.ceil(num(uurtarief) > 0 ? num(uurtarief) : DATA.tarieven.uurtarief);
    u.uitsluitingen = Array.isArray(o.uitsluitingen) && o.uitsluitingen.length ? o.uitsluitingen : UITSLUITINGEN_START.map((x) => ({ tekst: x.tekst, vakken: x.vakken.slice(), aan: true }));
    u.voorwaarden = typeof o.voorwaarden === 'string' && o.voorwaarden.trim() ? o.voorwaarden : VOORWAARDEN_START;
    u.teksten = Object.assign({}, TEKSTEN_START, o.teksten || {});
    return u;
  }

  /* 2a: de omschrijving zonder interne toevoegingen tussen haakjes. */
  const SCHRAP = ['forfait', 'interventie', 'per lopende meter', 'per paneel', 'per m² raam', 'per m² glas', 'per m² rolluik', 'per lm omtrek', 'hoeveelheid ='];
  function schoneNaam(naam, forfait) {
    let s = String(naam || '').replace(/\s*\(([^)]*)\)/g, (m, binnen) => (SCHRAP.some((w) => binnen.toLowerCase().includes(w)) ? '' : m));
    if (forfait) s = s.replace(/,\s*per (dag|rit)$/i, '');
    return s.replace(/\s{2,}/g, ' ').trim();
  }
  const DAG_NAAM = { 'Pannenlift': 'Pannenlift voor aan- en afvoer van materiaal', 'Werfwagen en verplaatsing': 'Werfwagen, vervoer en verplaatsingen', 'Hoogwerker': 'Hoogwerker, huur en transport' };
  const SOORT_NAAM = { puin: 'steenpuin', hout: 'hout', rest: 'gemengd bouwafval', isolatie: 'isolatie', asbest: 'asbestcement (verpakt)', metaal: 'oud metaal' };
  const stapVoor = (ep) => (ep < 10 ? 0.1 : ep < 100 ? 0.5 : ep < 1000 ? 1 : 5);
  const rondOp = (x, stap) => cent(Math.round(x / stap + 1e-9) * stap);
  const isStelling = (l) => !!l.code && (/\.stelling/.test(l.code) || l.code === 'alg.valbeveiliging');

  /* Stap 1: één lijn per regel van r.regels en per rij van r.materieel met een kost (2a-2d). */
  function maakLijnen(a, keuzes) {
    const r = a.r;
    const lijnen = [];
    const teller = {};
    for (const x of r.regels) {
      let sleutel;
      if (x.code) { teller[x.code] = (teller[x.code] || 0) + 1; sleutel = x.code + '#' + teller[x.code]; } else sleutel = 'ai:' + x.naam;
      const forfait = x.fase === 'Werfinrichting' || x.eenheid === 'u' || x.eenheid === 'dag';
      const def = x.code ? DATA.posten[x.code] : null;
      lijnen.push({ sleutel, code: x.code || '', fase: x.fase, naamStart: schoneNaam(x.naam, forfait), forfait, hoeveelheid: forfait ? 0 : x.hoeveelheid, eenheid: forfait ? 'forfait' : x.eenheid,
        exact: a.inPrijs(x), ai: x.bron === 'ai', keuzeNaam: def && def.keuze ? def.keuze : '', afvoer: false, dag: false });
    }
    const dagLijnen = [], afvoerLijnen = [];
    for (const x of r.materieel) {
      if (x.soort === 'huur' || !(x.kost > 0)) continue;
      const bedrag = x.kost * a.fMat;
      if (x.soort === 'dag') dagLijnen.push({ sleutel: 'mat:dag:' + x.naam, code: '', fase: 'Werfinrichting', naamStart: DAG_NAAM[x.naam] || x.naam, forfait: true, hoeveelheid: 0, eenheid: 'forfait', exact: bedrag, ai: false, keuzeNaam: '', afvoer: false, dag: true });
      else if (x.soort === 'container' || x.soort === 'bigbag') {
        const soort = SOORT_NAAM[x.afvalSoort] || x.afvalSoort || 'afval';
        const n = x.aantal;
        const naam = 'Afvoer en verwerking ' + soort + ': ' + n + (x.soort === 'container' ? (n === 1 ? ' container' : ' containers') + ' 10 m³' : (n === 1 ? ' big bag' : ' big bags'));
        afvoerLijnen.push({ sleutel: 'mat:' + x.soort + ':' + (x.afvalSoort || x.naam), code: '', fase: 'Werfinrichting', naamStart: naam, forfait: true, hoeveelheid: 0, eenheid: 'forfait', exact: bedrag, ai: false, keuzeNaam: '', afvoer: true, dag: false });
      }
    }
    /* Werfinrichting: eerst de posten (stelling), dan het materieel per dag, dan de afvoer; de rest in volgorde van de berekening. */
    const werf = lijnen.filter((l) => l.fase === 'Werfinrichting');
    const rest = lijnen.filter((l) => l.fase !== 'Werfinrichting');
    const alles = werf.concat(dagLijnen, afvoerLijnen, rest);
    const kr = (keuzes && keuzes.regels) || {};
    for (const l of alles) {
      const k = kr[l.sleutel] || {};
      l.omschrijving = typeof k.omschrijving === 'string' && k.omschrijving.trim() ? k.omschrijving.trim() : l.naamStart;
      l.optie = !!(k.optie && l.keuzeNaam && !l.forfait);
      l.aardKeuze = k.aard === 'VH' || k.aard === 'FH' ? k.aard : '';
    }
    return alles;
  }

  /* Stap 3 en 4: afronden en de sluitpost zetten zodat de hoofdtabel exact T_hoofd is. */
  function prijsLijnen(lijnen, T, deler) {
    for (const l of lijnen) {
      l.sluitpost = false; l.rest = 0;
      if (l.forfait) { l.eenheidsprijs = 0; l.totaal = rondOp(l.exact, 5 / deler); }
      else {
        const ep = l.exact / l.hoeveelheid;
        l.eenheidsprijs = rondOp(ep, Math.max(0.01, stapVoor(ep) / deler));
        l.totaal = cent(l.eenheidsprijs * l.hoeveelheid);
      }
    }
    const opties = lijnen.filter((l) => l.optie);
    const hoofd = lijnen.filter((l) => !l.optie);
    const Thoofd = cent(T - opties.reduce((s, l) => s + l.totaal, 0));
    const D = cent(Thoofd - hoofd.reduce((s, l) => s + l.totaal, 0));
    let sluit = null, restVerschil = 0;
    if (hoofd.length && Math.abs(D) >= 0.005) {
      const forfaits = hoofd.filter((l) => l.forfait);
      if (forfaits.length) {
        sluit = forfaits.reduce((a, b) => (b.exact > a.exact ? b : a));
        sluit.totaal = cent(sluit.totaal + D);
      } else {
        sluit = hoofd.reduce((a, b) => (b.totaal > a.totaal ? b : a));
        sluit.eenheidsprijs = cent((sluit.totaal + D) / sluit.hoeveelheid);
        sluit.totaal = cent(sluit.eenheidsprijs * sluit.hoeveelheid);
        restVerschil = cent(Thoofd - hoofd.reduce((s, l) => s + l.totaal, 0));
      }
      sluit.sluitpost = true;
    }
    return { hoofd, opties, Thoofd, D, sluit, restVerschil };
  }

  function offerteVan(m, tarieven, instOfferte, keuzes) {
    const k = keuzes && typeof keuzes === 'object' ? keuzes : {};
    const a = RP.analyse(m, tarieven);
    const r = a.r;
    const inst = vulInstellingen(instOfferte, r.t.uurtarief);
    const A = inst.aannemer;
    const lijnen = maakLijnen(a, k);
    const T = cent(r.kosten.excl);
    let p = null;
    for (let deler = 1; deler <= 25; deler *= 5) {
      p = prijsLijnen(lijnen, T, deler);
      if (!p.sluit || p.sluit.totaal >= 0.5 * p.sluit.exact) break;
    }
    /* 2g: VH of FH per regel; forfaits en opties altijd FH. */
    const opgemeten = !!(k.offerte && k.offerte.opgemeten);
    for (const l of lijnen) l.aard = l.forfait || l.optie ? 'FH' : (l.aardKeuze || (opgemeten ? 'FH' : 'VH'));
    /* 2e: hoofdstukken per fase met subtotaal; nummering 1, 1.1, ... */
    const fasen = RP.FASES.concat(p.hoofd.map((l) => l.fase).filter((f, i, arr) => !RP.FASES.includes(f) && arr.indexOf(f) === i));
    const hoofdstukken = [];
    for (const naam of fasen) {
      const rs = p.hoofd.filter((l) => l.fase === naam);
      if (!rs.length) continue;
      const nr = hoofdstukken.length + 1;
      rs.forEach((l, i) => { l.nr = nr + '.' + (i + 1); });
      hoofdstukken.push({ nr, naam: naam === 'Werfinrichting' && rs.some((l) => l.afvoer) ? 'Werfinrichting en afvoer' : naam, regels: rs, subtotaal: cent(rs.reduce((s, l) => s + l.totaal, 0)) });
    }
    const excl = cent(hoofdstukken.reduce((s, h) => s + h.subtotaal, 0));
    const btwTarief = r.t.btw;
    const btw = cent(excl * btwTarief / 100);
    const incl = cent(excl + btw);
    const bet = Object.assign({}, inst.betaling, (k.betaling && typeof k.betaling === 'object') ? Object.fromEntries(Object.entries(k.betaling).filter(([, v]) => v !== '' && v != null)) : {});
    const p1 = num(bet.p1), p2 = num(bet.p2), p3 = num(bet.p3);
    const s1 = cent(incl * p1 / 100), s2 = cent(incl * p2 / 100), s3 = cent(incl - s1 - s2);
    const opties = p.opties.map((l) => Object.assign(l, { incl: cent(l.totaal * (1 + btwTarief / 100)) }));
    const heeftVH = p.hoofd.some((l) => l.aard === 'VH');

    /* Kop: nummer, datum, geldig tot, titel, omschrijving. */
    const ko = k.offerte || {};
    const datum = ko.datum || isoDag(new Date());
    const geldigTot = ko.geldigTot || plusDagen(datum, num(inst.geldigheidDagen) || 30);
    const titel = (ko.titel && ko.titel.trim()) || m.titel || 'Werken';
    const werf = (k.werf && k.werf.adres) || '';
    const omschrijvingStart = titel + (werf ? ' op het adres ' + werf : '') + '. De werken omvatten: ' + hoofdstukken.map((h) => h.naam.toLowerCase()).join(', ') + '.';
    const omschrijving = (ko.omschrijving && ko.omschrijving.trim()) || omschrijvingStart;

    /* 3.7: Inbegrepen. */
    const stellingNrs = p.hoofd.filter(isStelling).map((l) => l.nr);
    const inbegrepenStart = [];
    if (stellingNrs.length) inbegrepenStart.push('Plaatsen, huur en wegnemen van de stelling en de valbeveiliging zoals in ' + (stellingNrs.length === 1 ? 'post ' + stellingNrs[0] : 'de posten ' + stellingNrs.slice(0, -1).join(', ') + ' en ' + stellingNrs[stellingNrs.length - 1]) + '.');
    if (p.hoofd.some((l) => l.afvoer)) inbegrepenStart.push('Afvoer en verwerking van het afval zoals in de posten van hoofdstuk 1.');
    inbegrepenStart.push('Afvoer van kleine restfracties en van oud metaal (zink, lood) naar de schroothandel.', 'Vervoer, werfwagen en verplaatsingen.', 'Opkuis van de werf na de werken.');
    const baZin = A.baVerzekeraar && A.baPolis ? 'Verzekering burgerlijke aansprakelijkheid uitbating: ' + A.baVerzekeraar + ', polis ' + A.baPolis + '.' : '';
    if (baZin) inbegrepenStart.push(baZin);
    /* 2i: Opmerkingen en uitsluitingen. */
    const vak = r.vak;
    const uitsluitingenStart = [];
    for (const z of m.aannames || []) uitsluitingenStart.push('Uitgangspunt: ' + z);
    /* Een kale code zonder naam (onbekende post uit de AI) zegt de klant niets: die blijft in het werkblad, niet op de offerte. */
    for (const z of (r.overgeslagen || []).filter((x) => !/^[a-z]+(\.[\w-]+)+$/i.test(String(x)))) uitsluitingenStart.push('Niet inbegrepen: ' + String(z).replace(/\s*\(hoeveelheid[^)]*\)\s*$/, '') + ' (geen hoeveelheid gekend; wordt apart geprijsd).');
    if (!opgemeten) for (const z of m.plaatsbezoek || []) uitsluitingenStart.push('Voorbehoud: ' + z + (/[.!?]$/.test(z) ? '' : '.') + ' Wordt na vaststelling als meerwerk geprijsd (zie Meerwerken).');
    for (const u of inst.uitsluitingen) if (u && u.aan !== false && Array.isArray(u.vakken) && (u.vakken.includes('*') || u.vakken.includes(vak)) && u.tekst) uitsluitingenStart.push('Niet inbegrepen: ' + u.tekst);
    const kt = k.teksten || {};
    const inbegrepen = Array.isArray(kt.inbegrepen) ? kt.inbegrepen.filter(Boolean) : inbegrepenStart;
    const uitsluitingenLijst = Array.isArray(kt.uitsluitingen) ? kt.uitsluitingen.filter(Boolean) : uitsluitingenStart;
    let uitsluitingen = uitsluitingenLijst;
    if (kt.opmerking && String(kt.opmerking).trim()) uitsluitingen = uitsluitingen.concat([String(kt.opmerking).trim()]);

    /* 3.8 uitvoering, 2h meerwerken, 3.11 voorwaarden op de offerte. */
    const ku = k.uitvoering || {};
    const werkdagenStart = r.werkdagen + Math.max(1, Math.ceil(r.werkdagen / 5));
    const werkdagen = num(ku.werkdagen) > 0 ? num(ku.werkdagen) : werkdagenStart;
    const meerwerken = MEERWERK.replace('{regietarief}', n2.format(inst.regietarief)).replace('{marge}', nH.format(r.t.materiaalmarge));
    const asbest = ASBEST_ZIN[k.asbest] || ASBEST_ZIN.onbekend;
    const voorwaardenKort = [
      'Geldigheid: deze offerte geldt tot ' + datumVoluit(geldigTot) + '.',
      'Prijs: vaste prijs; geen prijsherziening voor werken die starten vóór ' + datumVoluit(plusMaanden(datum, 6)) + '.',
      inst.teksten.garantie,
    ];
    if (baZin) voorwaardenKort.push('Verzekering: ' + baZin.charAt(0).toLowerCase() + baZin.slice(1));
    if (ko.architect) voorwaardenKort.push('Verzekering tienjarige aansprakelijkheid (wet van 31 mei 2017): ' + (A.tienjarigeVerzekeraar || '…') + ', ondernemingsnummer ' + (A.tienjarigeOndernemingsnummer || '…') + ', polis ' + (A.tienjarigePolis || '…') + '; het attest wordt vóór de start aan de bouwheer en de architect overhandigd.');
    voorwaardenKort.push(asbest);
    voorwaardenKort.push(inst.teksten.veiligheid + (num(ko.aannemers) >= 2 ? ' Veiligheidscoördinatie verwezenlijking: aangesteld door ' + A.naam + '; de afspraken over de opeenvolgende werkzaamheden worden vóór de start schriftelijk vastgelegd.' : ''));
    voorwaardenKort.push(inst.teksten.afval);
    if (ko.premiewerk) voorwaardenKort.push(PREMIE_ZIN);

    /* 3.12 herroeping. */
    const particulier = !(k.klant && k.klant.type === 'onderneming');
    /* Herroepingsrecht en bijlage alleen als het vinkje "Ondertekend bij de klant thuis" aanstaat (opdracht 7 okt; startwaarde uit). */
    const thuis = ko.thuis === true || ko.thuis === 'ja';
    const dringend = ko.aard === 'dringend';
    const herroeping = particulier && thuis;
    const herroepingTekst = dringend
      ? 'U hebt ' + A.naam + ' uitdrukkelijk verzocht deze dringende herstelling onmiddellijk uit te voeren; op deze interventie geldt geen herroepingsrecht.'
      : 'U hebt het recht deze overeenkomst binnen 14 kalenderdagen na de ondertekening zonder opgave van reden te herroepen. Gebruik daarvoor het formulier in bijlage of een andere duidelijke verklaring, per post naar ' + A.adres + ' of per e-mail naar ' + A.email + '. Betaalde bedragen betalen wij binnen 14 dagen terug met hetzelfde betaalmiddel.';

    /* 3.14 algemene voorwaarden met de instelwaarden ingevuld, en de toetsing vóór uitgifte. */
    const naamVol = A.naam + (A.rechtsvorm && A.rechtsvorm !== 'eenmanszaak' && A.rechtsvorm !== 'andere' ? ' ' + A.rechtsvorm : '');
    const voorwaardenTekst = inst.voorwaarden.replace(/\{meerwerken\}/g, meerwerken).replace(/\{Aannemer\}/g, A.naam || 'de aannemer').replace(/\{verbreking\}/g, nH.format(num(inst.verbreking))).replace(/\{e-mail\}/g, A.email || '…').replace(/\{regietarief\}/g, n2.format(inst.regietarief)).replace(/\{marge\}/g, nH.format(r.t.materiaalmarge));
    const artikelen = voorwaardenTekst.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).map((s) => { const mm = /^(\d+)\.\s*([^.]+)\.\s*([\s\S]*)$/.exec(s); return mm ? { nr: Number(mm[1]), titel: mm[2].trim(), tekst: mm[3].trim() } : { nr: 0, titel: '', tekst: s }; });
    const toetsing = toetsVoorwaarden(voorwaardenTekst, num(inst.verbrekingMax) || 15);

    return {
      r, inst, aannemer: A, naamVol, lijnen, hoofdstukken, opties, heeftVH, afronding: p.sluit ? { nr: p.sluit.nr || '', bedrag: p.D, rest: p.restVerschil, omschrijving: p.sluit.omschrijving } : null,
      totalen: { excl, btwTarief, btw, incl, schijven: [{ p: p1, label: 'bij ondertekening van deze offerte', bedrag: s1 }, { p: p2, label: 'bij de aanvang van de werken', bedrag: s2 }, { p: p3, label: 'na de oplevering', bedrag: s3 }], somP: p1 + p2 + p3 },
      kop: { nummer: ko.nummer || '', datum, geldigTot, titel, omschrijving, omschrijvingStart, werkdagenStart },
      klant: Object.assign({ type: 'particulier', naam: '', straat: '', gemeente: '', email: '', telefoon: '' }, k.klant || {}),
      werf: { adres: werf },
      woning: Object.assign({ jaar: '', prive: true, eindverbruiker: true }, k.woning || {}),
      uitvoering: { start: ku.start || '', werkdagen },
      teksten: { inbegrepen, uitsluitingen, uitsluitingenLijst, inbegrepenStart, uitsluitingenStart, meerwerken, voorwaardenKort, termijn: inst.teksten.termijn, bestelbon: inst.teksten.bestelbon, optiesZin: inst.teksten.optiesZin, vhZin: inst.teksten.vhZin, akkoord: inst.teksten.akkoord, btw6: btwTarief === 6 ? BTW6 : '', herroeping: herroepingTekst, betaaltermijn: num(inst.betaaltermijn) || 14 },
      vlaggen: { herroeping, dringend, particulier, thuis, opgemeten, alleenHoofdstukken: !!ko.alleenHoofdstukken, architect: !!ko.architect, premiewerk: !!ko.premiewerk, aannemers: num(ko.aannemers) || 1 },
      artikelen, toetsing,
    };
  }

  /* Toetsing van de algemene voorwaarden (3.14): zinnen van hoogstens 25 woorden, geen eenzijdige bedingen, verbreking binnen de grens. */
  function toetsVoorwaarden(tekst, max) {
    const fouten = [];
    const woorden = (z) => z.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    for (const art of tekst.split(/\n\s*\n/)) {
      const zinnen = art.split(/(?<=[.!?;])\s+(?=[A-ZÀ-Ý(])/);
      for (const z of zinnen) { const n = woorden(z); if (n > 25) fouten.push('Zin van ' + n + ' woorden (hoogstens 25): “' + z.trim().slice(0, 80) + '…”'); }
      for (const w of ['beslist eenzijdig', 'zonder verhaal', 'uitsluitend bevoegd', 'rechtbank van']) if (art.toLowerCase().includes(w)) fouten.push('Onrechtmatig beding “' + w + '” in: “' + art.trim().slice(0, 60) + '…”');
      if (/^\d+\.\s*Verbreking/i.test(art.trim())) for (const mm of art.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)) if (num(mm[1]) > max) fouten.push('Verbrekingsvergoeding ' + mm[1] + ' % ligt boven de grens van ' + max + ' %.');
    }
    return fouten;
  }

  /* IBAN-controle (modulo 97) voor een Belgisch nummer. */
  function ibanOk(s) {
    const t = String(s || '').replace(/\s+/g, '').toUpperCase();
    if (!/^BE\d{14}$/.test(t)) return false;
    const herschikt = (t.slice(4) + t.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
    let rest = 0;
    for (const c of herschikt) rest = (rest * 10 + Number(c)) % 97;
    return rest === 1;
  }

  /* 4.4: de lijst "Nog in te vullen". Elke regel: { veld, tekst }; veld = het formulierveld waar de klik naartoe springt. */
  function nogInTeVullen(o, ctx) {
    const L = [];
    const leeg = (v) => v == null || String(v).trim() === '';
    const A = o.aannemer, kl = o.klant, ko = o.kop, w = o.woning;
    const c = ctx || {};
    if (c.loopt || !o.r.regels.length) L.push({ veld: '', tekst: 'Geen posten: bereken eerst.' });
    if (leeg(A.naam)) L.push({ veld: 'a-naam', tekst: 'Handelsnaam van de aannemer.' });
    if (leeg(A.rechtsvorm)) L.push({ veld: 'a-rechtsvorm', tekst: 'Rechtsvorm van de aannemer.' });
    if (leeg(A.adres)) L.push({ veld: 'a-adres', tekst: 'Adres van de aannemer.' });
    if (!/^[01]\d{3}\.\d{3}\.\d{3}$/.test(String(A.ondernemingsnummer || '').trim())) L.push({ veld: 'a-ondernemingsnummer', tekst: 'Ondernemingsnummer (0xxx.xxx.xxx of 1xxx.xxx.xxx).' });
    if (leeg(A.btw)) L.push({ veld: 'a-btw', tekst: 'Btw-nummer van de aannemer.' });
    if (leeg(A.rpr) && A.rechtsvorm && A.rechtsvorm !== 'eenmanszaak') L.push({ veld: 'a-rpr', tekst: 'RPR (rechtbank van de zetel).' });
    if (leeg(A.telefoon)) L.push({ veld: 'a-telefoon', tekst: 'Telefoon van de aannemer.' });
    if (leeg(A.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(A.email)) L.push({ veld: 'a-email', tekst: 'E-mail van de aannemer.' });
    if (!ibanOk(A.iban)) L.push({ veld: 'a-iban', tekst: 'IBAN van de aannemer (BE + 14 cijfers).' });
    if ((A.baVerzekeraar && !A.baPolis) || (!A.baVerzekeraar && A.baPolis)) L.push({ veld: 'a-baVerzekeraar', tekst: 'BA-verzekering: beide velden of geen van beide.' });
    if (o.vlaggen.architect && (leeg(A.tienjarigeVerzekeraar) || leeg(A.tienjarigeOndernemingsnummer) || leeg(A.tienjarigePolis))) L.push({ veld: 'a-tienjarigeVerzekeraar', tekst: 'Verzekering tienjarige aansprakelijkheid: verzekeraar, ondernemingsnummer en polis.' });
    if (leeg(kl.naam)) L.push({ veld: 'k-naam', tekst: 'Naam van de klant.' });
    if (leeg(kl.straat)) L.push({ veld: 'k-straat', tekst: 'Straat en nummer van de klant.' });
    if (leeg(kl.gemeente)) L.push({ veld: 'k-gemeente', tekst: 'Postcode en gemeente van de klant.' });
    if (o.vlaggen.thuis && o.vlaggen.particulier && (leeg(kl.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kl.email))) L.push({ veld: 'k-email', tekst: 'E-mail van de klant (de herroeping gaat per e-mail).' });
    if (leeg(o.werf.adres)) L.push({ veld: 'w-adres', tekst: 'Werfadres.' });
    const nu = new Date().getFullYear();
    if (o.totalen.btwTarief === 6) {
      const j = num(w.jaar);
      if (!/^\d{4}$/.test(String(w.jaar || '').trim())) L.push({ veld: 'w-jaar', tekst: 'Jaar eerste ingebruikname van de woning (btw 6 %).' });
      else if (j > nu - 10) L.push({ veld: 'w-jaar', tekst: 'Woning jonger dan 10 jaar: zet de btw in de tarieven op 21 %.' });
      if (!w.prive) L.push({ veld: 'w-prive', tekst: 'Woning voor meer dan 50 % privé bewoond (btw 6 %).' });
      if (!w.eindverbruiker) L.push({ veld: 'w-eindverbruiker', tekst: 'Gefactureerd aan de bewoner (btw 6 %).' });
    }
    if (leeg(ko.datum)) L.push({ veld: 'o-datum', tekst: 'Datum van de offerte.' });
    if (leeg(ko.geldigTot)) L.push({ veld: 'o-geldigTot', tekst: 'Geldig tot.' });
    else if (ko.geldigTot < isoDag(new Date())) L.push({ veld: 'o-geldigTot', tekst: 'Vervallen: zet een nieuwe datum (nieuwe versie).' });
    if (leeg(ko.titel)) L.push({ veld: 'o-titel', tekst: 'Titel van de offerte.' });
    if (leeg(ko.omschrijving)) L.push({ veld: 'o-omschrijving', tekst: 'Omschrijving van de werken.' });
    if (!(num(o.vlaggen.aannemers) >= 1)) L.push({ veld: 'o-aannemers', tekst: 'Aantal aannemers op de werf.' });
    for (const l of o.lijnen) if (leeg(l.omschrijving)) L.push({ veld: 'r-' + l.sleutel, tekst: 'Omschrijving van post ' + (l.nr || l.naamStart) + '.' });
    if (o.lijnen.length && !o.hoofdstukken.length) L.push({ veld: '', tekst: 'Minstens één post in de hoofdtabel.' });
    if (leeg(o.uitvoering.start)) L.push({ veld: 'u-start', tekst: 'Aanvang van de werken.' });
    else if (/^\d{4}-\d{2}-\d{2}$/.test(o.uitvoering.start) && o.uitvoering.start > plusMaanden(ko.datum, 6)) L.push({ veld: 'u-start', tekst: 'Start later dan 6 maanden na de offerte: maak een nieuwe offerte op de startdatum.' });
    if (!(o.uitvoering.werkdagen > 0)) L.push({ veld: 'u-werkdagen', tekst: 'Uitvoeringstermijn in werkdagen.' });
    const s = o.totalen.schijven;
    if (s[0].p > 50) L.push({ veld: 'b-p1', tekst: 'Voorschot boven 50 %: verlaag het.' });
    if (Math.abs(o.totalen.somP - 100) > 1e-9) L.push({ veld: 'b-p1', tekst: 'Betalingsschema telt niet op tot 100 %.' });
    for (const f of o.toetsing) L.push({ veld: 'v-voorwaarden', tekst: f });
    return L;
  }

  RP.offerteVan = offerteVan;
  RP.OFFERTE = { START, UITSLUITINGEN_START, VOORWAARDEN_START, TEKSTEN_START, MEERWERK, BTW6, ASBEST_ZIN, RECHTSVORMEN, vulInstellingen, nogInTeVullen, toetsVoorwaarden, ibanOk, cent, eur, hoev, datumVoluit, isoDag, plusDagen, plusMaanden, schoneNaam };
})(globalThis);

/* Pagina van Norvo Richtprijs: opdrachtkaart, stappen, toelichting, verder vragen, resultaatpaneel, rail, instellingen, offerte.
   Rekenwerk staat in motor.js; de server (server.mjs) meet het adres, vraagt de AI en bewaart.
   Eén IIFE: staat (S), tekenfuncties per zone, de stroom van de AI, de events. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return; /* buiten de browser (tests) bestaat alleen het offertedeel hierboven */
  const RP = globalThis.RP;
  const DATA = RP.DATA;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const n2 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /* Normen (manuur per eenheid) met ten minste 2 en hoogstens 4 decimalen: 0,012 blijft 0,012. */
  const nNorm = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const eur = (x) => '€ ' + n0.format(Math.round(x));
  const eur2 = (x) => '€ ' + n2.format(x);
  /* Een getal nooit grover dan de bron: standaard tot 2 decimalen, in de datatabel tot 4 (per 0,0125, kg 0,004), zonder nullen
     achteraan (1,05 blijft 1,05; 94 blijft 94). */
  const nTot = {};
  const getal = (x, decimalen) => {
    if (!Number.isFinite(Number(x))) return String(x == null ? '' : x);
    const d = decimalen > 0 ? decimalen : 2;
    if (!nTot[d]) nTot[d] = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: d });
    return nTot[d].format(Number(x));
  };
  const gewicht = (kg) => (kg >= 1000 ? n1.format(kg / 1000) + ' ton' : n0.format(Math.round(kg)) + ' kg');
  const dagen = (d) => n1.format(d) + (Math.abs(d - 1) < 0.05 ? ' werkdag' : ' werkdagen');
  const streep = (x, f) => (x > 0 ? f(x) : '—');
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  /* Duur in seconden sinds t0, op 0,1 s en ten minste 0,1: zo blijft "korter dan een seconde" te onderscheiden van een onbekende duur (0). */
  const sec = (t0) => Math.max(0.1, Math.round((Date.now() - t0) / 100) / 10);
  /* Seconden op het scherm: altijd een geheel getal vanaf 1; korter dan een seconde = "minder dan 1 s"; 0 of onbekend = niets. */
  const secTekst = (x) => (!(Number(x) > 0) ? '' : Number(x) < 1 ? 'minder dan 1 s' : Math.round(Number(x)) + ' s');
  /* Een lopende teller telt vanaf 1 s (nooit "0 s"). */
  const secLoopt = (t0) => Math.max(1, Math.round((Date.now() - t0) / 1000)) + ' s';
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
    'De sarking-isolatie van 12 cm draagt met € 5.825 of 25,6 % het meest: 98,7 m² PIR-platen × € 33,16 = € 3.273 plus € 376 schroeven en tape, en 23,5 manuren; daarna de kleipannen met € 4.000 of 17,6 %, omdat het klein formaat van 20,7 stuks per m² 28,2 manuren legwerk vraagt.',
    'De klant vroeg niet om de stelling (€ 1.623), de nok (€ 542), de gevelpannen aan de vrije dakrand (€ 827) en de zinken aansluiting op het dak van de buur (€ 749), maar met de dakrand op 6 m, een nok van 8 m en een gemene zijde van 11,7 m kan geen van die vier weg.',
    'De isolatie verschuift de prijs het meest: zonder sarking valt er € 5.825 af, en elke 10 m² dakvlak meer kost € 1.515; met 4 man gaat de prijs € 590 omlaag en met 2 man € 380 omhoog.',
    'Niets is op het adres gemeten, dus de 94 m² dakvlak, de 11,7 lm vrije rand en de 16 lm goot komen uit de opgegeven 8 × 9 m en 40 graden; één meting van voorgevel, diepte en hellingshoek op het adres zet die hoeveelheden vast.',
    'De zinken aansluiting op het dak van de buur (€ 749) is een AI-schatting en de dakramen van 78 × 118 cm (€ 2.101) zijn een aanname; vraag de klant naar de hoogte van het buurdak en het gewenste raamformaat.',
    'Dakramen op de bestaande plaatsen en 2 afvoeren van elk 6 m zijn aannames uit de meetstaat; bij 21 % btw (woning jonger dan 10 jaar) komt er € 3.419 bij.',
  ].join('\n');
  /* De prijs waarbij de voorbeeldtekst geschreven is (startwaarden van de datatabel en de tarieven, ploeg 3, btw 6 %). */
  const VOORBEELD_PRIJS = 24160;

  /* ---------- staat ---------- */
  const S = {
    loopt: false, fase: 'leeg', stapNr: 0, id: null, versie: 1, titel: '', adres: '', klus: '', asbest: 'onbekend', datum: '',
    m: null, gemeten: null, meetFout: '', meetDuur: 0, ploeg: 0, voorbeeld: false,
    /* btw: een overschrijving van het btw-tarief voor deze ene berekening (Toepassen bij "Aan 21 % btw"); 0 = het tarief uit de instellingen.
       onvolledig: de posten kwamen niet volledig binnen (gestopt of fout in stap 2). foutTekst: de laatste foutmelding voor het paneel. */
    btw: 0, onvolledig: false, foutTekst: '',
    /* beeldAnimatie: het meetbeeld in de stappen speelt zijn meetanimatie (alleen bij een verse meting); kenmerkenBeeldVers: de tab
       Kenmerken speelt de animatie de eerste keer dat hij na een meting opengaat. */
    beeldAnimatie: false, kenmerkenBeeldVers: false,
    /* offerte: de formulierwaarden en regelkeuzes van de offerte bij deze berekening (bewaard in het veld offerte). */
    offerte: null,
    /* versies: de vorige versies van deze berekening (v1 bij een v2); bekijk = index van de versie die alleen-lezen open staat. */
    versies: [], bekijk: null, bekijkTerug: null,
    /* gesprek: verder vragen na de berekening, één beurt per vraag: { vraag, antwoord, staat, versie, wijziging? }.
       Het gesprek hoort bij de berekening (alle versies), niet bij één versie. */
    gesprek: [],
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
  const huidig = () => Object.assign({}, tarieven, S.ploeg ? { ploeg: S.ploeg } : {}, S.btw ? { btw: S.btw } : {});
  const analyse = () => (S.m && S.m.posten.length ? RP.analyse(S.m, huidig()) : null);
  /* Eén lopende opslag tegelijk: de tweede wacht op het id van de eerste, anders ontstaan twee bestanden voor één berekening. */
  let opslaanKeten = Promise.resolve();
  const opslag = { lees(k, terug) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? terug : v; } catch (e) { return terug; } }, schrijf(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* opslag is een gemak, geen voorwaarde */ } } };

  /* ---------- instellingen: laden, toepassen, bewaren ---------- */
  function pasInstellingenToe() {
    RP.pasInstellingenToe(inst);
    tarieven = Object.assign({}, DATA.tarieven);
    if (tarieven.btw !== 21) tarieven.btw = 6;
    standaarden = RP.standaardWaarden(inst.standaarden || {});
  }
  /* zonderServer: /api/instellingen gaf bij het laden geen antwoord (statische demo zoals GitHub Pages, of start.cmd draait niet).
     Dan gelden de startwaarden, toont de rail geen geschiedenis en bewaart de pagina niets: zo overschrijven startwaarden nooit
     het instellingenbestand van de aannemer als de server later wel antwoordt. Bereken toont dan de banner. */
  let zonderServer = false;
  async function laadInstellingen(vers) {
    if (vers) inst = { tarieven: {}, standaarden: {}, posten: {}, offerte: {} };
    try {
      const a = await fetch('/api/instellingen', { headers: KOP });
      if (!a.ok) throw new Error('Instellingen: status ' + a.status);
      const o = await a.json();
      if (o && typeof o === 'object' && !Array.isArray(o)) inst = Object.assign(inst, o);
      zonderServer = false;
    } catch (e) { zonderServer = true; }
    for (const k of ['tarieven', 'standaarden', 'posten', 'offerte']) if (!inst[k] || typeof inst[k] !== 'object') inst[k] = {};
    pasInstellingenToe();
    $('tarieven-staat').textContent = zonderServer ? 'Niet bewaard: geen lokale server' : 'Bewaard';
  }
  /* Antwoordt de lokale server (en is het deze app)? Voor de demo zonder server en de knop Opnieuw proberen. */
  async function serverLeeft() {
    try { const a = await fetch('/api/ping', { headers: KOP }); if (!a.ok) return false; const j = await a.json(); return !!j && j.app === 'richtprijs-ai'; } catch (e) { return false; }
  }
  /* De server antwoordt (weer) na een lading zonder server: de instellingen van de aannemer opnieuw lezen in plaats van de startwaarden. */
  async function serverTerug() {
    await laadInstellingen(true);
    if (zonderServer) return false;
    tekenInstellingen(); teken(); tekenUitlegRest(); laadLijst();
    return true;
  }
  let bewaarTimer = null;
  function bewaarInstellingen() {
    clearTimeout(bewaarTimer);
    if (zonderServer) { $('tarieven-staat').textContent = 'Niet bewaard: geen lokale server'; return; }
    $('tarieven-staat').textContent = '';
    bewaarTimer = setTimeout(schrijfInstellingen, 400);
  }
  /* Schrijft meteen (zonder de wachttijd van 400 ms); geeft true als de server het bestand bewaarde. */
  async function schrijfInstellingen() {
    clearTimeout(bewaarTimer); bewaarTimer = null;
    if (zonderServer) { $('tarieven-staat').textContent = 'Niet bewaard: geen lokale server'; return false; }
    try {
      /* De pagina bezit tarieven, standaarden, posten en offerte (aannemergegevens, vaste teksten, volgnummer). Andere sleutels
         in hetzelfde bestand worden eerst opnieuw gelezen en blijven staan. */
      let basis = {};
      try { const g = await fetch('/api/instellingen', { headers: KOP }); if (g.ok) basis = await g.json(); } catch (e) { basis = {}; }
      if (!basis || typeof basis !== 'object' || Array.isArray(basis)) basis = {};
      const uit = Object.assign({}, basis, { tarieven: inst.tarieven, standaarden: inst.standaarden, posten: inst.posten, offerte: inst.offerte });
      const a = await fetch('/api/instellingen', { method: 'POST', headers: JSON_KOP, body: JSON.stringify(uit) });
      $('tarieven-staat').textContent = a.ok ? 'Bewaard' : 'Niet bewaard';
      return a.ok;
    } catch (e) { $('tarieven-staat').textContent = 'Niet bewaard: de server antwoordt niet'; return false; }
  }
  function zetTarief(k, v) {
    if (k === 'ploeg') { S.ploeg = Math.max(1, Math.round(v)); }
    else {
      tarieven[k] = v;
      if (k === 'btw') S.btw = 0; /* het veld in de instellingen zet het tarief voor elke berekening; de overschrijving van deze berekening vervalt */
      inst.tarieven = { uurtarief: tarieven.uurtarief, urenPerDag: tarieven.urenPerDag, materiaalmarge: tarieven.materiaalmarge, onvoorzien: tarieven.onvoorzien, btw: tarieven.btw };
      RP.pasInstellingenToe(inst);
      bewaarInstellingen();
    }
    tariefGewijzigd();
  }
  /* "Toepassen" bij "Aan 21 % btw": alleen voor deze berekening, de instelling op deze pc blijft staan. */
  function zetBtwBerekening(v) { S.btw = v === tarieven.btw ? 0 : v; tariefGewijzigd(); }
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
  const zetTab = (t) => { if (TABS.includes(t)) { $('paneel').setAttribute('data-tab', t); beeldKenmerkenCheck(); } };
  const zetSeg = (res) => { body.classList.toggle('seg-resultaat', !!res); beeldKenmerkenCheck(); };
  function zetLeeg(aan) { body.classList.toggle('leeg', aan); if (aan) body.classList.remove('paneel-open'); tekenTitel(); }
  function tekenTitel() {
    const t = S.titel || (S.m && S.m.titel) || '';
    document.title = t ? 'Norvo Richtprijs · ' + t : 'Norvo Richtprijs';
    /* Leeg: de topbalk op de telefoon toont het Norvo-merk (CSS), geen titel. */
    document.querySelectorAll('[data-titel]').forEach((e) => { e.textContent = body.classList.contains('leeg') ? '' : (t || 'Berekening'); });
  }
  function tekenVersie() {
    const leeg = body.classList.contains('leeg') || !S.m;
    for (const id of ['versie-kop', 'versie-paneel']) { const e = $(id); e.hidden = leeg; e.textContent = 'v' + S.versie + (S.bekijk != null ? ' · bekijken' : ''); }
    const t = $('versie-terug');
    t.hidden = leeg || !S.versies.length || S.bekijk != null || S.loopt;
    if (!t.hidden) { const v = S.versies[S.versies.length - 1]; t.textContent = '← v' + v.versie; t.setAttribute('data-bekijk', String(S.versies.length - 1)); }
    const balk = $('versie-balk');
    balk.hidden = S.bekijk == null;
    if (S.bekijk != null && S.bekijkTerug) {
      $('versie-balk-tekst').textContent = 'U bekijkt v' + S.versie + (S.datum ? ' van ' + datumTekst(S.datum) : '') + (laatsteA ? ' · ' + eur(laatsteA.r.kosten.incl) : '') + '. Alleen lezen.';
      $('versie-herstel').textContent = 'Herstel v' + S.versie;
      $('versie-weg').textContent = 'Terug naar v' + S.bekijkTerug.versie;
    }
  }
  /* Vorige versies: bij een v2 (Wijzig of Herbereken) wordt v1 bewaard; de pijl bij de versiechip toont v1 alleen-lezen. */
  function snapshotNu() {
    return { versie: S.versie, titel: S.titel, adres: S.adres, klus: S.klus, asbest: S.asbest, datum: S.datum, meetstaat: kopie(S.m), gemeten: S.gemeten, meetFout: S.meetFout, meetDuur: S.meetDuur, ploeg: S.ploeg, btw: S.btw,
      uitleg: S.uitleg.tekst, uitlegPrijs: S.uitleg.prijsBij, duur: S.duur, stappen: S.trail.map((s) => s.duur || 0), prijs: laatsteA ? Math.round(laatsteA.r.kosten.incl) : 0 };
  }
  function bekijkVersie(i) {
    if (S.loopt) return;
    const s = S.versies[i];
    if (!s) return;
    const terug = S.bekijkTerug || Object.assign(snapshotNu(), { id: S.id, versies: S.versies, offerte: S.offerte, bewaard: S.bewaard, gesprek: S.gesprek });
    zetKlaar(Object.assign({}, s, { id: terug.id, offerte: terug.offerte, versies: terug.versies, gesprek: terug.gesprek }));
    S.bekijkTerug = terug; S.bekijk = i; S.bewaard = terug.bewaard;
    teken(); hoofdknop();
    status('v' + s.versie + ' geopend om te bekijken.');
  }
  function bekijkWeg() {
    const t = S.bekijkTerug;
    if (!t) return;
    zetKlaar(Object.assign({}, t, { id: t.id, offerte: t.offerte, versies: t.versies }));
    S.bewaard = t.bewaard; S.bekijk = null; S.bekijkTerug = null;
    teken(); hoofdknop();
  }
  async function herstelVersie() {
    const i = S.bekijk, t = S.bekijkTerug;
    if (i == null || !t) return;
    const ok = await bevestig('v' + t.versie + ' verwijderen en v' + S.versie + ' herstellen?', 'De latere versie verdwijnt uit deze berekening; de offertegegevens blijven staan.', 'Herstel', 'Behoud v' + t.versie);
    if (!ok) return;
    S.versies = S.versies.slice(0, i); S.bekijk = null; S.bekijkTerug = null; S.bewaard = false;
    /* Beurten van de verwijderde versies vallen weg: gevraagd op een latere versie, of hun wijziging maakte een latere versie. */
    S.gesprek = S.gesprek.filter((b) => (b.versie || 1) <= S.versie && !(b.wijziging && b.wijziging.toegepast && b.wijziging.naarVersie > S.versie));
    S.trailKop = 'v' + S.versie + ' hersteld · ' + datumTekst(S.datum);
    teken(); tekenTrail(); tekenGesprek();
    await opslaan(true);
    status('v' + S.versie + ' hersteld.');
  }
  const leesAsbest = () => (document.querySelector('input[name=asbest]:checked') || {}).value || 'onbekend';
  function zetAsbest(v) { const r = document.querySelector('input[name=asbest][value="' + (ASBEST[v] ? v : 'onbekend') + '"]'); if (r) r.checked = true; }
  function datumTekst(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }); }

  /* ---------- rail: eerdere berekeningen ---------- */
  async function laadLijst() {
    /* Zonder server (demo) is er geen geschiedenis: geen aanvraag die toch mislukt. */
    if (zonderServer) { lijst = []; tekenRail(); return; }
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
  /* Chip "Offerte {nummer}" uit het veld offerte van GET /api/berekeningen ({ nummer, uitgegeven, geldigTot } of null):
     groen met "uitgegeven" als ze uitgegeven is; grijs met "vervallen" als "geldig tot" voorbij is (spec 4.6). */
  function railOfferte(of) {
    if (!of || typeof of !== 'object' || !of.nummer) return '';
    const vervallen = /^\d{4}-\d{2}-\d{2}$/.test(String(of.geldigTot || '')) && of.geldigTot < RP.OFFERTE.isoDag(new Date());
    const tekst = 'Offerte ' + of.nummer + (vervallen ? ' · vervallen' : of.uitgegeven ? ' · uitgegeven' : '');
    return '<span class="rail-chips">' + chip(tekst, vervallen ? 'grijs' : 'merk') + '</span>';
  }
  let railZoek = '';
  function tekenRail() {
    const el = $('rail-lijst');
    /* Het zoekveld verschijnt vanaf 8 berekeningen en zoekt in titel en adres. */
    $('rail-zoek').hidden = lijst.length < 8;
    if (lijst.length < 8 && railZoek) { railZoek = ''; $('rail-zoek-veld').value = ''; }
    if (!lijst.length) { el.innerHTML = zonderServer ? '' : '<div class="rail-leeg"><b>Nog geen berekeningen.</b><span class="klein">Elke berekening komt hier, met adres en prijs.</span></div>'; return; }
    const q = railZoek.trim().toLowerCase();
    const zichtbaar = q ? lijst.filter((x) => (x.titel || '').toLowerCase().includes(q) || (x.adres || '').toLowerCase().includes(q)) : lijst;
    if (!zichtbaar.length) { el.innerHTML = '<div class="rail-leeg"><b>Geen berekening met ‘' + esc(railZoek.trim()) + '’.</b><button class="link" type="button" data-rail-zoek-wis>Zoekopdracht wissen</button></div>'; return; }
    const vakken = new Set(lijst.map((x) => x.vak).filter(Boolean));
    let h = '', vorige = '';
    for (const x of zichtbaar) {
      const g = groep(x.datum);
      if (g !== vorige) { h += '<p class="rail-groep">' + g + '</p>'; vorige = g; }
      const actief = x.id === S.id;
      const sub = [x.prijs ? eur(x.prijs) : '', x.adres || (vakken.size <= 1 ? x.vak : '')].filter(Boolean).join(' · ');
      h += '<div class="rail-rij' + (actief ? ' is-actief' : '') + '">' +
        '<button class="laad" type="button" data-laad="' + esc(x.id) + '"' + (actief ? ' aria-current="true"' : '') + '><b>' + esc(x.titel || 'Berekening') + (vakken.size > 1 && x.vak ? ' ' + chip(x.vak) : '') + '</b><span class="sub">' + esc(sub) + '</span>' + railOfferte(x.offerte) + '</button>' +
        '<button class="ikoonknop meer" type="button" data-verwijder="' + esc(x.id) + '" title="Verwijderen" aria-label="Verwijderen">' + ic('prullenbak') + '</button></div>';
    }
    el.innerHTML = h;
  }
  async function verwijder(id) {
    if (S.loopt) { toast('Eerst de berekening afwachten'); return; }
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
  const skeletLoopt = () => S.loopt && S.fase !== 'uitleg' && S.fase !== 'vervolg';

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
    /* Tijdens een lopend antwoord tekent de stroom zelf de laatste beurt. */
    if (!(S.loopt && S.fase === 'vervolg')) tekenGesprek();
    tekenVervolg();
  }

  /* Eigen cijfers in de datatabel (instellingen.posten) tellen: elke post met een eigen norm of eigen materiaalprijs. */
  const eigenCijfers = () => Object.values(inst.posten || {}).filter((o) => o && typeof o === 'object' && (o.uur != null || (o.mat && Object.values(o.mat).some((x) => x && x.prijs != null)))).length;
  function tariefChips(r) {
    const start = RP.DATA_START.tarieven;
    const c = [];
    const t = tarieven;
    if (t.uurtarief !== start.uurtarief) c.push(['uurtarief', 'Uurtarief ' + eur2(t.uurtarief)]);
    if (t.urenPerDag !== start.urenPerDag) c.push(['urenPerDag', 'Uren per werkdag ' + getal(t.urenPerDag)]);
    if (t.materiaalmarge !== start.materiaalmarge) c.push(['materiaalmarge', 'Marge ' + getal(t.materiaalmarge) + ' %']);
    if (t.onvoorzien !== start.onvoorzien) c.push(['onvoorzien', 'Onvoorzien ' + getal(t.onvoorzien) + ' %']);
    if (r.t.btw !== start.btw) c.push(['btw', 'Btw ' + r.t.btw + ' %' + (S.btw ? ' (deze berekening)' : '')]);
    if (S.ploeg && S.m && S.ploeg !== (S.m.ploeg || 3)) c.push(['ploeg', 'Ploeg ' + r.ploeg + ' man']);
    const n = eigenCijfers();
    if (!c.length && !n) return '';
    return '<div class="tariefchips">' + c.map(([k, tekst]) => '<span class="chip">' + esc(tekst) + '<button class="x" type="button" data-tarief-terug="' + k + '" title="Terug naar de startwaarde" aria-label="' + esc(tekst) + ': terug naar de startwaarde">' + ic('x', 'klein-ic') + '</button></span>').join('') +
      (n ? '<button class="chip chip--merk" type="button" data-instellingen="open" data-inst-doel="datatabel" title="Open de datatabel">' + n + (n === 1 ? ' eigen cijfer' : ' eigen cijfers') + ' in de datatabel</button>' : '') + '</div>';
  }
  function caveat(m, r) {
    const n = (m.plaatsbezoek || []).length;
    const ov = r && r.overgeslagen ? r.overgeslagen.length : 0;
    return (S.onvolledig ? '<b class="inkt">Onvolledig: ' + (S.fase === 'gestopt' ? 'gestopt' : 'afgebroken') + ' na ' + (r ? r.regels.length : 0) + (r && r.regels.length === 1 ? ' post' : ' posten') + '.</b> ' : '') +
      'Richtprijs uit ' + (S.gemeten ? 'de kaartmeting' : 'de maten in de klus') + ', uw tarieven en de datatabel van ' + esc(DATA.stand) + '.' +
      (n ? ' <a href="#plaatsbezoek" data-naar="plaatsbezoek">' + n + (n === 1 ? ' punt' : ' punten') + '</a> controleert u bij het plaatsbezoek.' : '') +
      (ov ? ' <button class="link" type="button" data-tab-knop="werkblad">' + ov + (ov === 1 ? ' post' : ' posten') + '</button> niet meegerekend.' : '');
  }
  /* Kostenopbouw in hele euro's die optellen. Subtotaal, prijs excl. en incl. btw zijn exact afgerond; Arbeid, Materiaal en Materieel
     worden afgekapt en de ontbrekende euro's gaan naar de delen met de grootste rest (grootste-restmethode), zodat ze samen precies
     het Subtotaal zijn en elk deel hoogstens € 1 van zijn eigen afronding afwijkt. Onvoorzien en btw sluiten als verschil. */
  function verdeelAfgerond(waarden, totaal) {
    const uit = waarden.map((w) => Math.floor(w));
    let rest = totaal - uit.reduce((s, x) => s + x, 0);
    const volgorde = waarden.map((w, i) => [w - Math.floor(w), i]).sort((p, q) => q[0] - p[0]);
    for (let j = 0; rest > 0 && j < volgorde.length; j++, rest--) uit[volgorde[j][1]]++;
    return uit;
  }
  function kostenAfgerond(k) {
    const sub = Math.round(k.subtotaal), excl = Math.round(k.excl), incl = Math.round(k.incl);
    const [arbeid, materiaal, materieel] = verdeelAfgerond([k.arbeid, k.materiaal, k.materieel], sub);
    return { arbeid, materiaal, materieel, subtotaal: sub, onvoorzien: excl - sub, excl, btw: incl - excl, incl };
  }
  function tekenOverzicht(a, skelet) {
    const uit = $('uitkomst');
    if (!a || skelet) {
      if (!S.m || S.fase === 'leeg') { uit.innerHTML = '<p class="sr">Nog geen berekening.</p>'; $('geld-sectie').innerHTML = ''; }
      else if (!S.loopt) {
        /* Gestopt of mislukt vóór er posten waren: geen skelet dat blijft glimmen, maar de reden. */
        const ovs = overgeslagenNu();
        uit.innerHTML = '<div class="prijskaart"><div class="titel"><span>' + esc(S.titel || S.m.titel || 'Richtprijs') + '</span>' + chip('v' + S.versie) + chip('Geen prijs') + '</div>' +
          '<p class="caveat">' + esc(S.fase === 'gestopt' ? 'Gestopt vóór er posten binnen waren.' : (S.foutTekst || 'Geen bruikbare posten uit de klus.')) + ' Zie de stappen bij de berekening.</p>' +
          (ovs.length ? '<p class="caveat">Niet meegerekend: ' + esc(ovs.join(', ')) + '.</p>' : '') + '</div>';
        $('geld-sectie').innerHTML = '';
      } else {
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
    const chips = [chip('v' + S.versie)].concat(S.voorbeeld ? [chip('Voorbeeld')] : [], S.onvolledig ? [chip('Onvolledig')] : []);
    const bigbags = r.afvoer.filter((x) => x.soort2 === 'bigbag').reduce((s, x) => s + x.aantal, 0);
    const afvoerTekst = [r.containers ? r.containers + (r.containers === 1 ? ' container' : ' containers') : '', bigbags ? bigbags + (bigbags === 1 ? ' big bag' : ' big bags') : ''].filter(Boolean).join(', ');
    const pd = Math.round(r.aandeelData * 100), pa = 100 - pd;
    uit.innerHTML = '<div class="prijskaart"><div class="titel"><span>' + esc(S.titel || m.titel || 'Richtprijs') + '</span>' + chips.join('') + '</div>' +
      '<div class="prijs">' + (S.oudePrijs && Math.round(S.oudePrijs) !== Math.round(k.incl) ? '<span class="oud">' + eur(S.oudePrijs) + '</span>' : '') + '<b>' + eur(k.incl) + '</b><span>incl. ' + r.t.btw + ' % btw</span></div>' +
      /* Een onvolledige berekening (gestopt of afgebroken) krijgt geen prijs per m²: een deelsom per m² misleidt. */
      '<div class="prijs-onder">' + eur(k.excl) + ' excl. btw' + (r.perM2 && !S.onvolledig ? ' · ' + eur(r.perM2) + ' per m² ' + esc(r.vlakNaam) : '') + '</div>' +
      '<p class="caveat">' + caveat(m, r) + '</p>' + tariefChips(r) + '</div>' +
      '<div class="tegels"><div class="tegel"><small>Ploeg</small><b>' + r.ploeg + ' man</b></div><div class="tegel"><small>Werkdagen</small><b>' + r.werkdagen + '</b></div>' +
      '<div class="tegel"><small>Manuren</small><b>' + n1.format(r.uren) + '</b><span>' + n1.format(r.mandagen) + ' mandagen</span></div>' +
      '<div class="tegel"><small>Naar boven</small><b>' + gewicht(r.matKg) + '</b></div><div class="tegel"><small>Afval</small><b>' + gewicht(r.afvalKg) + '</b>' + (afvoerTekst ? '<span>' + afvoerTekst + '</span>' : '') + '</div></div>' +
      '<div class="balk" role="img" aria-label="' + pd + ' % van de kostprijs uit de datatabel, ' + pa + ' % AI-schatting"><i class="d" style="width:' + pd + '%"></i><i class="a" style="width:' + pa + '%"></i></div>' +
      '<p class="legende">' + pd + ' % van de kostprijs uit de datatabel · ' + pa + ' % AI-schatting</p>';

    const nietGevraagd = new Set(r.regels.filter((x) => !x.gevraagd).map((x) => x.naam));
    /* De balk meet aan de grootste post; de restrij (som van de kleine posten) is grijs en sluit de kolom op de prijs excl. btw. */
    const grootste = Math.max(a.top.length ? a.top[0].bedrag : 1, 1);
    const geldRij = (naam, bedrag, aandeel, ai, extra, rest) => '<div class="r"><span class="n"><em>' + esc(naam) + '</em>' + (extra ? chip('Niet gevraagd, wel nodig') : '') + '</span><span class="b"><i class="' + (ai ? 'ai' : rest ? 'rest' : '') + '" style="width:' + Math.min(100, Math.max(2, Math.round(bedrag / grootste * 100))) + '%"></i></span><span class="g">' + eur(bedrag) + '</span><span class="p">' + Math.round(aandeel * 100) + '&nbsp;%</span></div>';
    let gh = a.top.map((d) => geldRij(d.naam, d.bedrag, d.aandeel, d.bron === 'ai', nietGevraagd.has(d.naam), false)).join('');
    if (a.restAantal) { const restBedrag = Math.round(k.excl) - a.top.reduce((s, d) => s + Math.round(d.bedrag), 0); gh += geldRij(a.restAantal + (a.restAantal === 1 ? ' kleinere post' : ' kleinere posten samen'), restBedrag, k.excl > 0 ? restBedrag / k.excl : 0, false, false, true); }
    $('geld-sectie').innerHTML = '<div class="sectie-kop"><h3>Waar het geld zit</h3><span class="rechts">excl. btw, met marge</span></div><div class="geld">' + gh + '</div>';

    $('watals-sectie').innerHTML = a.watAls.length ? '<div class="sectie-kop"><h3>Wat de prijs verschuift</h3></div><div class="watals">' + a.watAls.map((w) => {
      const pl = /^Met (\d+) man/.exec(w.label);
      const toepas = pl ? 'ploeg:' + pl[1] : (w.inclBtw ? 'btw:21' : '');
      return '<div class="r"><span class="l">' + esc(w.label) + '</span>' + (toepas ? '<button class="link" type="button" data-toepassen="' + toepas + '">Toepassen</button>' : '') +
        '<span class="v">' + (w.verschil >= 0 ? '+ ' : '− ') + eur(Math.abs(w.verschil)) + (w.inclBtw ? ' incl. btw' : '') + '</span></div>';
    }).join('') + '</div>' : '';

    const kr = (l, v, som) => '<div class="r' + (som ? ' som' : '') + '"><span class="l">' + l + '</span><span class="v">' + eur(v) + '</span></div>';
    const ka = kostenAfgerond(k);
    $('kosten-sectie').innerHTML = '<div class="sectie-kop"><h3>Kostenopbouw</h3></div><div class="kosten">' +
      kr('Arbeid: ' + n1.format(r.uren) + ' manuren × ' + eur2(r.t.uurtarief), ka.arbeid) +
      kr('Materiaal: inkoop ' + eur(k.materiaalInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge', ka.materiaal) +
      kr('Materieel en afvoer: inkoop ' + eur(k.materieelInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge', ka.materieel) +
      kr('Subtotaal', ka.subtotaal, true) + kr('Onvoorzien ' + getal(r.t.onvoorzien) + ' %', ka.onvoorzien) + kr('Prijs excl. btw', ka.excl, true) +
      kr('Btw ' + r.t.btw + ' %', ka.btw) + kr('Prijs incl. btw', ka.incl, true) + '</div>';
  }

  const WERK_KOP = '<div class="tabel-kop rij--kop"><span>Werk</span><span class="g">Hoeveelheid</span><span class="g">Manuren</span><span class="g">Materiaal, huur €</span><span class="g">Naar boven kg</span><span class="g">Afval kg</span><span class="g">Bron</span></div>';
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
    return '<div class="rij"><div class="n"><button class="naam-knop" type="button" data-rekenpad="' + esc(id) + '" aria-expanded="' + open + '" title="Rekenpad"><span class="naam"><span class="naamtekst">' + esc(x.naam) + (x.gevraagd ? '' : ' ' + chip('Niet gevraagd, wel nodig')) + '</span>' + ic(open ? 'omhoog' : 'omlaag') + '</span></button>' +
      (!x.gevraagd && x.waarom ? '<small>' + esc(x.waarom) + '</small>' : '') + (x.toelichting ? '<small>' + esc(x.toelichting) + '</small>' : '') + '</div>' +
      '<div class="g" data-l="Hoeveelheid">' + getal(x.hoeveelheid) + ' ' + esc(x.eenheid) + '</div><div class="g" data-l="Manuren">' + n1.format(x.uren) + '</div>' +
      '<div class="g" data-l="Materiaal, huur €">' + streep(x.matKost + x.huurKost, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Naar boven kg">' + streep(x.matKg, (v) => n0.format(Math.round(v))) + '</div>' +
      '<div class="g" data-l="Afval kg">' + streep(x.afvalKg, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Bron">' + bronChip(x.bron) + '</div>' +
      (open ? '<div class="rekenpad">' + rekenpad(x) + '</div>' : '') + '</div>';
  }
  /* Posten die de motor oversloeg (geen leesbare hoeveelheid, onbekende code), leesbaar gemaakt: een kale code wordt "onbekende post …". */
  const overgeslagenTekst = (lijst) => (lijst || []).map((s) => (/^[a-z]+(\.[\w-]+)+$/i.test(String(s)) ? 'onbekende post ' + s : String(s)));
  /* Ook zonder één bruikbare post (laatsteA leeg) tonen wat overgeslagen werd, zodra de berekening niet meer loopt. */
  const overgeslagenNu = () => (S.m && !S.loopt && S.m.posten && S.m.posten.length ? overgeslagenTekst(RP.bereken(S.m, huidig()).overgeslagen) : []);
  function tekenWerkblad(a, skelet) {
    const el = $('werkblad'), ov = $('overgeslagen');
    if (!a) {
      el.innerHTML = skelet ? WERK_KOP + SKELET_RIJ : '';
      const ovs = skelet ? [] : overgeslagenNu();
      ov.hidden = !ovs.length;
      ov.textContent = ovs.length ? 'Niet meegerekend: ' + ovs.join(', ') + '.' : '';
      return;
    }
    const r = a.r;
    /* De toetsenbordfocus blijft op dezelfde knop staan na het hertekenen (rekenpad openen, fase inklappen). */
    const act = document.activeElement, focus = act && el.contains(act) ? (act.getAttribute('data-rekenpad') != null ? '[data-rekenpad="' + CSS.escape(act.getAttribute('data-rekenpad')) + '"]' : act.getAttribute('data-fase') != null ? '[data-fase="' + CSS.escape(act.getAttribute('data-fase')) + '"]' : '') : '';
    let h = WERK_KOP, i = 0;
    for (const f of r.fases) {
      h += '<button class="fase' + (S.open.has('fase|' + f.naam) ? ' is-dicht' : '') + '" type="button" data-fase="' + esc(f.naam) + '" aria-expanded="' + !S.open.has('fase|' + f.naam) + '"><span class="inkt">' + esc(f.naam) + '</span>' + ic('omlaag') + '<span class="som">' + n1.format(f.uren) + ' manuren · ' + dagen(f.dagen) + ' met ' + r.ploeg + ' man</span></button><div class="fase-rijen">';
      for (const x of f.regels) h += werkRij(x, i++);
      h += '</div>';
    }
    if (skelet) h += SKELET_RIJ;
    el.innerHTML = h;
    if (focus) { const k = el.querySelector(focus); if (k) k.focus(); }
    ov.hidden = !r.overgeslagen.length || skelet;
    ov.textContent = r.overgeslagen.length ? 'Niet meegerekend: ' + overgeslagenTekst(r.overgeslagen).join(', ') + '.' : '';
  }

  function tekenMateriaal(a, skelet) {
    const ml = $('materialen-sectie'), eq = $('materieel-sectie');
    if (!a || skelet) { ml.innerHTML = skelet ? SKELET_GELD.replace('"skelet-geld"', '"skelet-geld" style="padding-top:8px"') : ''; eq.innerHTML = ''; return; }
    const r = a.r;
    ml.innerHTML = '<div class="sectie-kop"><h3>Materiaallijst</h3><span class="rechts">inkoop excl. btw</span></div><div class="tabel kol-mat"><div class="tabel-kop"><span>Materiaal</span><span class="g">Aantal</span><span class="g">Prijs €</span><span class="g">Totaal €</span><span class="g">Gewicht kg</span><span class="g">Bron</span></div>' +
      r.materialen.map((x) => '<div class="rij"><div class="n">' + esc(x.naam) + '</div><div class="g" data-l="Aantal">' + getal(x.aantal) + ' ' + esc(x.eenheid) + '</div><div class="g" data-l="Prijs €">' + n2.format(x.prijs) + '</div><div class="g" data-l="Totaal €">' + streep(x.kost, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Gewicht kg">' + streep(x.kg, (v) => n0.format(Math.round(v))) + '</div><div class="g" data-l="Bron">' + bronChip(x.bron) + '</div></div>').join('') +
      (r.materialen.length ? '' : '<p class="klein" style="padding-top:8px">Geen materiaal in deze klus.</p>') + '</div>';
    const SOORT = { puin: 'Puin', hout: 'Hout', rest: 'Rest', isolatie: 'Isolatie', metaal: 'Metaal', asbest: 'Asbest' };
    /* De afvalsoort in een zin: 'rest' is gemengd afval (geen soortcode in de tekst). */
    const SOORT_WOORD = { puin: 'steenpuin', hout: 'hout', rest: 'gemengd afval', isolatie: 'isolatie', metaal: 'metaal', asbest: 'asbest' };
    /* Restjes in de werfwagen en metaal naar de schroothandel zijn geen stuks met een prijs: zonder aantal en eenheid. */
    const zonderAantal = (x) => x.soort === 'werfwagen' || x.soort === 'afvoer';
    const afvoerNaam = (x) => (x.soort2 === 'werfwagen' ? 'mee in de werfwagen' : x.soort2 === 'afvoer' ? 'naar de schroothandel' : x.aantal + ' ' + x.naam.toLowerCase() + (x.soort2 === 'container' ? ' (' + x.ton + ' ton per container)' : ''));
    eq.innerHTML = '<div class="sectie-kop"><h3>Materieel en afvoer</h3><span class="rechts">inkoop excl. btw</span></div><div class="tabel kol-eq"><div class="tabel-kop"><span>Post</span><span class="g">Aantal</span><span class="g">Prijs €</span><span class="g">Totaal €</span></div>' +
      r.materieel.map((x) => '<div class="rij"><div class="n">' + esc(zonderAantal(x) ? (x.soort === 'werfwagen' ? 'Klein restje ' + (SOORT_WOORD[x.afvalSoort] || SOORT_WOORD.rest) + ': mee in de werfwagen' : x.naam) : x.naam) + '</div><div class="g" data-l="Aantal">' + (zonderAantal(x) ? '—' : getal(x.aantal) + ' ' + esc(x.eenheid)) + '</div><div class="g" data-l="Prijs €">' + (zonderAantal(x) ? '—' : n2.format(x.prijs)) + '</div><div class="g" data-l="Totaal €">' + streep(x.kost, (v) => n0.format(Math.round(v))) + '</div></div>').join('') + '</div>' +
      (r.afvoer.length ? '<div class="afval"><h4>Afval per soort</h4>' + r.afvoer.map((x) => '<p>' + esc((SOORT[x.soort] || x.soort) + ' ' + n0.format(Math.round(x.kg)) + ' kg: ' + afvoerNaam(x)) + '</p>').join('') + '</div>' : '');
  }

  function tekenCompact(a, skelet) {
    const el = $('prijs-compact');
    const seg = $('seg-resultaat');
    if (!a || skelet) { el.innerHTML = ''; seg.textContent = 'Resultaat'; return; }
    const r = a.r, k = r.kosten;
    seg.textContent = 'Resultaat · ' + eur(k.incl) + (S.onvolledig ? ' · onvolledig' : '');
    el.innerHTML = '<div class="prijs"><b>' + eur(k.incl) + '</b>' + (S.onvolledig ? chip('Onvolledig') : '') + '</div><div class="prijs-onder">incl. ' + r.t.btw + ' % btw · ' + eur(k.excl) + ' excl.</div><p class="caveat">' + caveat(S.m, r) + '</p>' +
      '<div class="mini"><div><small>Ploeg</small><b>' + r.ploeg + ' man</b></div><div><small>Werkdagen</small><b>' + r.werkdagen + '</b></div><div><small>Manuren</small><b>' + n1.format(r.uren) + '</b></div></div>' +
      '<button class="knop knop--stil" type="button" data-seg="resultaat">Bekijk resultaat</button>';
  }

  function tekenKnoppen() {
    const heeft = !!laatsteA && !skeletLoopt();
    const op = $('opslaan');
    op.disabled = !heeft || S.bewaard || S.loopt || S.bekijk != null || S.voorbeeld;
    op.querySelector('span').textContent = heeft && S.bewaard ? 'Opgeslagen' : 'Opslaan';
    op.title = S.voorbeeld ? 'Het voorbeeld wordt niet bewaard' : '';
    document.querySelectorAll('[data-kopieer="alles"],[data-print]').forEach((b) => { b.disabled = !heeft; });
    const uitg = S.offerte && S.offerte.status === 'uitgegeven' && S.offerte.uitgegeven;
    $('offerte').disabled = !heeft || S.bekijk != null;
    $('offerte').querySelector('span').textContent = uitg ? 'Offerte ' + uitg.nummer : 'Offerte';
    $('herbereken').disabled = S.loopt || S.bekijk != null;
    document.querySelectorAll('#menu [data-menu-actie]').forEach((b) => {
      const w = b.getAttribute('data-menu-actie');
      b.disabled = w === 'verwijder' ? !S.id || S.loopt : w === 'opslaan' ? op.disabled : !heeft;
      if (w === 'offerte') b.lastChild.textContent = uitg ? 'Offerte ' + uitg.nummer : 'Offerte';
    });
  }

  /* ---------- kenmerken en meting ---------- */
  let kenmerkenSleutel = '';
  const waardeTekst = (x) => (x.tekst ? String(x.waarde) : (x.waarde === '' || x.waarde == null || Number.isNaN(x.waarde) ? '' : getal(x.waarde)));
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
  /* Het meetbeeld (luchtfoto met contour, maten en hoogtemeting) komt uit meetbeeld.js; alleen als de meting een beeld draagt.
     Drie exemplaren: groot in de stappen (speelt de meetanimatie bij een verse meting), een miniatuur van 96 px in de ingeklapte
     stappenkop, en groot in de tab Kenmerken (animatie de eerste keer dat die tab na een meting opengaat). */
  const beeldKan = () => !!(S.gemeten && S.gemeten.beeld && Array.isArray(S.gemeten.beeld.bbox) && globalThis.Meetbeeld && typeof globalThis.Meetbeeld.teken === 'function');
  const beeldSleutel = () => (beeldKan() ? S.gemeten.adres + '|' + S.gemeten.beeld.bbox.join(',') : '');
  let meetbeeldSleutel = '';
  function tekenMeetbeeld(animatie) {
    const wrap = $('meetbeeld');
    const kan = beeldKan();
    const sleutel = beeldSleutel();
    if (sleutel === meetbeeldSleutel && !animatie) { wrap.hidden = !kan; return; }
    meetbeeldSleutel = sleutel;
    wrap.hidden = !kan;
    wrap.innerHTML = '';
    wrap.className = 'meetbeeld-wrap'; /* de staatklassen van een vorige tekening (is-klaar) weg, anders speelt de animatie niet */
    if (!kan) return;
    try { globalThis.Meetbeeld.teken(wrap, S.gemeten, { px: 800, animatie: !!animatie, compact: false }); } catch (e) { wrap.hidden = true; }
  }
  /* De tab Kenmerken is zichtbaar: op de pc als het paneel open staat, op de telefoon ook alleen in het segment Resultaat. */
  const kenmerkenZichtbaar = () => $('paneel').getAttribute('data-tab') === 'kenmerken' && body.classList.contains('paneel-open') && !body.classList.contains('instellingen-open') && !body.classList.contains('offerte-open') && (!telefoon.matches || body.classList.contains('seg-resultaat'));
  function beeldKenmerkenCheck() {
    if (!S.kenmerkenBeeldVers || !beeldKan() || !kenmerkenZichtbaar()) return;
    S.kenmerkenBeeldVers = false;
    tekenMeetbeeld(true);
  }
  let trailBeeld = { sleutel: '', groot: null, mini: null };
  function plaatsTrailBeeld() {
    const el = $('trail-beeld');
    if (!el) return;
    const sleutel = beeldSleutel();
    if (!sleutel) { el.hidden = true; el.innerHTML = ''; trailBeeld = { sleutel: '', groot: null, mini: null }; return; }
    if (trailBeeld.sleutel !== sleutel) {
      const groot = document.createElement('div'); groot.className = 'trail-beeld-groot';
      const mini = document.createElement('div'); mini.className = 'trail-mini';
      mini.setAttribute('aria-hidden', 'true');
      try {
        globalThis.Meetbeeld.teken(groot, S.gemeten, { px: 800, animatie: S.beeldAnimatie, compact: false });
        globalThis.Meetbeeld.teken(mini, S.gemeten, { px: 800, animatie: false, compact: true });
      } catch (e) { el.hidden = true; el.innerHTML = ''; trailBeeld = { sleutel: '', groot: null, mini: null }; return; }
      S.beeldAnimatie = false;
      trailBeeld = { sleutel, groot, mini };
      el.innerHTML = '';
      el.appendChild(groot);
    }
    el.hidden = S.trailDicht;
    const slot = document.querySelector('#trail .trail-mini-slot');
    if (slot && trailBeeld.mini && !slot.contains(trailBeeld.mini)) slot.appendChild(trailBeeld.mini);
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
    if (s.staat === 'actief') { const v = vorigeDuur()[i]; return secLoopt(s.t0) + (v > 0 ? ' · vorige keer ' + secTekst(v) : ''); }
    if (s.staat === 'wacht') return '';
    if (s.staat === 'over') return '—';
    return secTekst(s.duur);
  }
  function rij(i, staat, label, duur, detail) {
    const s = S.trail[i];
    s.staat = staat; s.label = label;
    if (staat === 'actief') { s.t0 = Date.now(); s.duur = 0; status('Stap ' + (i + 1) + ' van 3 · ' + label); } else if (duur != null) s.duur = duur;
    s.detail = detail || '';
    if (staat !== 'actief') s.posten = '';
    tekenTrail();
  }
  /* De stappen staan in drie vaste vakken (kop, meetbeeld, stappen) die elk alleen opnieuw getekend worden als hun inhoud verandert:
     zo blijft het meetbeeld in zijn vak staan en loopt zijn animatie door terwijl stap 2 begint. */
  let trailKopHtml = '', trailStappenHtml = '';
  function tekenTrail() {
    const el = $('trail');
    if (!S.trail.length) { el.hidden = true; el.innerHTML = ''; trailKopHtml = trailStappenHtml = ''; trailBeeld = { sleutel: '', groot: null, mini: null }; return; }
    el.hidden = false;
    el.classList.toggle('is-dicht', S.trailDicht);
    if (!el.firstChild) { el.innerHTML = '<div class="trail-kop-slot"></div><div class="trail-beeld" id="trail-beeld" hidden></div><div class="trail-stappen"></div>'; trailKopHtml = trailStappenHtml = ''; }
    const kop = S.trailKop
      ? '<button class="trail-kop" type="button" data-trail-toggle aria-expanded="' + !S.trailDicht + '" title="' + (S.trailDicht ? 'Stappen tonen' : 'Stappen inklappen') + '">' + ic(S.trailDicht ? 'omlaag' : 'omhoog') + '<span class="trail-mini-slot"' + (S.trailDicht && trailBeeld.mini ? '' : ' hidden') + '></span><span>' + esc(S.trailKop) + '</span></button>'
      : '<div class="trail-kop"><span>Stap ' + S.stapNr + ' van 3</span></div>';
    let h = '';
    S.trail.forEach((s, i) => {
      const st = s.staat === 'gestopt' ? 'over' : s.staat;
      h += '<div class="stap is-' + st + '" id="stap-' + i + '">' + ic(STAP_ICOON[s.staat], s.staat === 'actief' ? 'spinner' : '') + '<span class="label">' + esc(s.label) + '</span><span class="duur">' + esc(duurTekst(s, i)) + '</span>' +
        '<span class="detail"' + (s.detail ? '' : ' hidden') + '>' + (s.detail || '') + '</span><div class="posten"' + (s.posten ? '' : ' hidden') + '>' + (s.posten || '') + '</div></div>';
    });
    if (kop !== trailKopHtml) { el.querySelector('.trail-kop-slot').innerHTML = kop; trailKopHtml = kop; }
    if (h !== trailStappenHtml) { el.querySelector('.trail-stappen').innerHTML = h; trailStappenHtml = h; }
    plaatsTrailBeeld();
    const slot = el.querySelector('.trail-mini-slot');
    if (slot) slot.hidden = !(S.trailDicht && trailBeeld.mini);
  }
  /* De secondeteller loopt alleen in de stappenrij; #status (aria-live) krijgt één tekst per stap, anders leest een schermlezer elke tik voor. */
  function tikTrail() {
    S.trail.forEach((s, i) => { if (s.staat === 'actief') { const d = document.querySelector('#stap-' + i + ' .duur'); if (d) d.textContent = duurTekst(s, i); } });
    const b = S.gesprek[S.gesprek.length - 1];
    const d = document.querySelector('#gesprek .beurt-staat.is-actief .duur');
    if (b && b.t0 && d) d.textContent = secLoopt(b.t0);
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
    if (p) { p.innerHTML = s.posten; p.hidden = !s.posten; }
  }
  const gemetenLabel = (g) => 'Gemeten: ' + (g.dak ? 'dakvlak ' + getal(g.dak.dakvlak) + ' m², ' : 'grondoppervlak ' + getal(g.gebouw.oppervlakte) + ' m², ') + g.bebouwing.type + ' bebouwing' + (g.dak && g.dak.nokhoogte ? ', nok ' + getal(g.dak.nokhoogte) + ' m' : '');
  function trailStart(meten) {
    S.trail = [
      meten ? { staat: 'actief', label: 'Gebouw opmeten op ' + S.adres, t0: Date.now() }
        : S.gemeten ? { staat: 'klaar', label: gemetenLabel(S.gemeten), duur: S.meetDuur }
          : S.adres && S.meetFout ? { staat: 'waarschuwing', label: meetFoutLabel(), duur: S.meetDuur, detail: '<button class="link" type="button" data-adres-aanpassen>Adres aanpassen</button>' }
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
    /* Scrolt de lezer omhoog, dan springt niets en staat rechtsonder de knop "Naar het laatste". */
    $('naar-laatste').hidden = onder;
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
    const toon = !!m && S.fase !== 'leeg' && (S.uitleg.staat !== 'geen' || S.fase === 'klaar' || S.fase === 'gestopt' || S.fase === 'fout' || S.fase === 'vervolg');
    t.hidden = !toon;
    if (!toon) return;
    $('bronnen').innerHTML = (S.gemeten ? chip('Kaartmeting Digitaal Vlaanderen') : '') + chip('Datatabel ' + DATA.stand + (eigenCijfers() ? ' met eigen cijfers' : '')) + chip('Uw tarieven');
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
    if (S.bekijk != null) b.hidden = true;
    $('wijzig').hidden = !dicht || S.loopt || S.bekijk != null;
  }
  /* Het klusveld groeit mee met de tekst (3 tot 12 regels); ook na een programmatische waarde (chip, Wijzig, Nieuw). */
  function pasKlusHoogte() { const t = $('klus'); t.style.height = 'auto'; t.style.height = Math.min(288, Math.max(72, t.scrollHeight)) + 'px'; }
  function kaartDicht(aan) {
    const k = $('opdracht');
    k.classList.toggle('is-dicht', aan);
    if (!aan) pasKlusHoogte();
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
      if (antwoord.status === 429) tekst = 'Er lopen al 3 berekeningen. Wacht tot er één klaar is.';
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
        let o;
        try { o = JSON.parse(regel); } catch (e) { continue; } /* een kapotte regel van de server telt niet mee */
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
    tekenVervolg();
  }
  function bewaarStapDuur() { opslag.schrijf('richtprijs-stapduur', S.trail.map((s) => s.duur || 0)); }

  async function schrijfUitleg() {
    const a = laatsteA;
    S.uitleg = { tekst: '', staat: 'bezig', prijsBij: 0 };
    uitlegBuf = ''; live = null;
    $('uitleg').innerHTML = '';
    /* Tijdens het schrijven staat het live-gebied uit: een schermlezer leest anders elke tekstdelta opnieuw voor. */
    $('toelichting').setAttribute('aria-live', 'off');
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
      $('naar-laatste').hidden = true;
      $('toelichting').setAttribute('aria-live', 'polite');
    }
  }
  /* Het label van stap 1 als de meting niets opleverde: de reden uit S.meetFout. */
  const meetFoutLabel = () => (/antwoordt niet/.test(S.meetFout) ? 'De kaartdienst antwoordt niet · gerekend met de maten uit de klus' : S.meetFout === 'Meting gestopt.' ? 'Meting gestopt · gerekend met de maten uit de klus' : 'Geen gebouw gevonden op dit adres · gerekend met de maten uit de klus');

  /* De banner: lokaal "Start start.cmd opnieuw"; in de demo zonder server de uitleg dat alleen het voorbeeld werkt. */
  function toonBanner() {
    $('banner-tekst').textContent = zonderServer ? 'Zonder server toont deze demo alleen het voorbeeld. Een eigen klus berekenen, meten en bewaren gebeurt via de lokale server (start.cmd op de pc).' : 'Start start.cmd opnieuw.';
    $('banner-voorbeeld').hidden = !zonderServer;
    $('banner').hidden = false;
  }
  let startBezig = false;
  async function start(vast) {
    if (S.loopt || startBezig) return;
    /* Geladen zonder server (statische demo of start.cmd niet gestart): eerst kijken of de server er nu is; anders de banner. */
    if (zonderServer) {
      startBezig = true;
      let terug = false;
      try { terug = (await serverLeeft()) && (await serverTerug()); } finally { startBezig = false; }
      if (!terug) { toonBanner(); status('De lokale server antwoordt niet.', true); return; }
    }
    const klus = $('klus').value.trim();
    const adres = $('adres').value.trim();
    if (klus.length < 25) { $('klus-fout').hidden = false; $('klus').focus(); return; }
    $('klus-fout').hidden = true;
    $('banner').hidden = true;
    const herhaal = !!S.id;
    const adresNieuw = adres !== S.adres;
    /* v2 van dezelfde berekening: v1 blijft bewaard en is via de pijl bij de versiechip te bekijken en te herstellen. */
    if (herhaal && S.m && laatsteA) S.versies.push(snapshotNu());
    S.bekijk = null; S.bekijkTerug = null;
    $('naar-laatste').hidden = true;
    S.klus = klus.slice(0, 6000); S.adres = adres; S.asbest = leesAsbest();
    if (herhaal) S.versie++; else { S.versie = 1; S.datum = ''; S.titel = ''; S.versies = []; S.gesprek = []; }
    /* De meting blijft staan zolang het adres gelijk is (Wijzig, Herbereken); zonder adres is er geen meting; een mislukte meting wordt opnieuw gedaan. */
    const meten = !!adres && (adresNieuw || !S.gemeten);
    if (!adres) { S.gemeten = null; S.meetFout = ''; S.meetDuur = 0; }
    if (meten) { S.gemeten = null; S.meetFout = ''; }
    S.beeldAnimatie = false; S.kenmerkenBeeldVers = false;
    S.m = RP.leegMeetstaat(); S.ploeg = 0; S.btw = 0; S.onvolledig = false; S.foutTekst = ''; S.voorbeeld = false; S.gewijzigd = {}; S.origineel = {}; S.bewaard = false; S.open = new Set(); S.oudePrijs = 0; S.duur = 0;
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
        /* Een verse meting: het meetbeeld in de stappen speelt zijn animatie; de tab Kenmerken de eerste keer dat hij opengaat. */
        S.beeldAnimatie = !!S.gemeten; S.kenmerkenBeeldVers = !!S.gemeten;
        if (S.gemeten) rij(0, 'klaar', gemetenLabel(S.gemeten), S.meetDuur);
        else rij(0, 'waarschuwing', meetFoutLabel(), S.meetDuur, '<button class="link" type="button" data-adres-aanpassen>Adres aanpassen</button>');
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
      if (!r.regels.length) { const e = new Error('Geen bruikbare posten uit de klus.'); e.code = 'posten'; throw e; }
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
      status('Klaar in ' + secTekst(S.duur) + '.');
      S.trailKop = 'Klaar in ' + secTekst(S.duur) + ' · 3 stappen';
      tekenTrail();
      setTimeout(() => { if (!S.loopt && S.fase === 'klaar') { S.trailDicht = true; tekenTrail(); } }, 1000);
      opslaan(true);
    } catch (e) {
      bezig(false);
      const nr = Math.max(1, S.stapNr);
      const s = S.trail[nr - 1];
      const gestopt = !!(e && e.name === 'AbortError');
      const serverWeg = e instanceof TypeError;
      const nPosten = S.m.posten.length;
      if (nr === 3 && laatsteA) {
        /* De prijs staat vast en is al bewaard: alleen de uitleg ontbreekt. Geen volle her-run, wel "Opnieuw schrijven". */
        S.fase = 'klaar';
        if (s) rij(2, gestopt ? 'gestopt' : 'fout', gestopt ? 'Uitleg gestopt' : serverWeg ? 'De lokale server antwoordt niet' : 'Uitleg niet volledig aangekomen', s.t0 ? sec(s.t0) : 0);
        S.trailKop = (gestopt ? 'Gestopt zonder uitleg' : 'Klaar zonder uitleg') + ' · ' + secTekst(sec(t0));
        if (serverWeg) toonBanner();
        status(gestopt ? 'Gestopt. De prijs is klaar, zonder uitleg.' : 'Uitleg niet volledig aangekomen. ' + ((e && e.message) || ''), !gestopt);
        opslaan(true);
      } else if (gestopt) {
        S.fase = 'gestopt'; S.onvolledig = nPosten > 0;
        if (nr === 1) S.meetFout = 'Meting gestopt.';
        if (s) rij(nr - 1, 'gestopt', 'Gestopt in stap ' + nr + (nr === 2 ? ' · ' + nPosten + (nPosten === 1 ? ' post' : ' posten') + ' binnen' : ''), s.t0 ? sec(s.t0) : 0);
        S.trailKop = 'Gestopt na ' + secTekst(sec(t0));
        status('Gestopt.');
      } else if (serverWeg) {
        S.fase = 'fout'; S.onvolledig = nPosten > 0; S.foutTekst = 'De lokale server antwoordt niet.';
        toonBanner();
        if (s) rij(nr - 1, 'fout', 'De lokale server antwoordt niet', s.t0 ? sec(s.t0) : 0);
        S.trailKop = 'Afgebroken na ' + secTekst(sec(t0));
        status('De lokale server antwoordt niet. Start start.cmd opnieuw.', true);
      } else {
        S.fase = 'fout'; S.onvolledig = nPosten > 0; S.foutTekst = (e && e.message) || 'Geen bruikbare posten uit de klus.';
        if (s) rij(nr - 1, 'fout', S.foutTekst, s.t0 ? sec(s.t0) : 0);
        S.trailKop = 'Afgebroken na ' + secTekst(sec(t0));
        status(S.foutTekst, true);
      }
      tekenTrail();
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
    const faseVoor = S.fase;
    S.fase = 'uitleg'; /* geen skelet in het paneel terwijl alleen de uitleg opnieuw geschreven wordt */
    bezig(true);
    ctl = new AbortController();
    const tu = Date.now();
    try { await schrijfUitleg(); bezig(false); status('Uitleg bijgewerkt in ' + secTekst(sec(tu)) + '.'); }
    catch (e) { bezig(false); status(e && e.name === 'AbortError' ? 'Gestopt.' : 'Uitleg niet volledig aangekomen.', !(e && e.name === 'AbortError')); }
    S.fase = faseVoor === 'uitleg' ? 'klaar' : faseVoor;
    teken();
    tekenUitlegRest();
    if (S.uitleg.staat === 'klaar') opslaan(true);
  }

  /* ---------- verder vragen na de berekening ----------
     Een vraag krijgt een antwoord uit de cijfers van de berekening (RP.bouwVervolgPrompt). Een wijziging komt als regels per post;
     de motor past ze toe (RP.pasWijzigingToe) en rekent het verschil per post uit (RP.vergelijk). "Toepassen" maakt een nieuwe
     versie; de vorige blijft bewaard en is te bekijken en te herstellen zoals bij Wijzig. */
  const bevat = (b) => !!(b && b.wijziging && b.wijziging.vergelijk);
  /* Wat tijdens het schrijven al te tonen is: de volledige tekstregels, plus de lopende regel zolang die geen JSON wordt. */
  function vervolgLive(ruw) {
    const delen = String(ruw).split('\n');
    const laatste = delen.pop().trim();
    const j = laatste.indexOf('{"t"');
    const zicht = (j >= 0 ? laatste.slice(0, j) : laatste).trim();
    return { regels: RP.leesVervolg(delen.join('\n')).antwoord, bezig: zicht && zicht[0] !== '{' && zicht[0] !== '`' ? zicht.replace(/^(?:[-•*]|\d+[.)])\s+/, '') : '' };
  }
  /* Ronde euro's die exact optellen tot het afgeronde totaal (ook met min-bedragen). */
  function rondSom(waarden, totaal) {
    const uit = waarden.map((w) => Math.round(w));
    let rest = totaal - uit.reduce((s, x) => s + x, 0);
    const volgorde = waarden.map((w, i) => [w - Math.round(w), i]).sort((p, q) => (rest > 0 ? q[0] - p[0] : p[0] - q[0]));
    for (let j = 0; rest !== 0 && j < volgorde.length; j++) { const d = rest > 0 ? 1 : -1; uit[volgorde[j][1]] += d; rest -= d; }
    return uit;
  }
  const plusMin = (x) => (x > 0 ? '+ ' : x < 0 ? '− ' : '') + eur(Math.abs(x));
  const weken = (n) => n + (n === 1 ? ' week' : ' weken');
  function wijzigingHtml(b, i) {
    const w = b.wijziging, v = w.vergelijk;
    const dExcl = Math.round(v.naar.excl) - Math.round(v.van.excl);
    const dIncl = Math.round(v.naar.incl) - Math.round(v.van.incl);
    const rijen = v.rijen.slice();
    /* Materieel en afvoer per naam (lift, transport, container); een oudere bewaarde wijziging heeft alleen het totaal. */
    if (Array.isArray(v.materieelRijen)) rijen.push(...v.materieelRijen);
    else if (Math.abs(v.materieel) >= 0.005) rijen.push({ soort: 'materieel', naam: 'Materieel en afvoer', verschil: v.materieel });
    const afgerond = rondSom(rijen.map((x) => x.verschil), dExcl);
    const onder = (x) => {
      if (x.soort === 'zet') return getal(x.van) + ' → ' + getal(x.naar) + ' ' + x.eenheid;
      if (x.soort === 'nieuw') return 'nieuw · ' + getal(x.naar) + ' ' + x.eenheid;
      if (x.soort === 'weg') return 'vervalt · was ' + getal(x.van) + ' ' + x.eenheid;
      if (x.soort === 'duur') return v.van.weken !== v.naar.weken ? 'zelfde hoeveelheid, huur ' + weken(v.van.weken) + ' → ' + weken(v.naar.weken) : 'zelfde hoeveelheid';
      if (x.soort === 'materieel' && x.eenheid) return x.van && x.naar ? getal(x.van) + ' → ' + getal(x.naar) + ' ' + x.eenheid : x.naar ? 'nieuw · ' + getal(x.naar) + ' ' + x.eenheid : 'vervalt';
      return '';
    };
    const dagRij = rijen.some((x) => x.soort === 'materieel' && /^dag/.test(x.eenheid || ''));
    const info = [v.van.ploeg !== v.naar.ploeg ? 'Ploeg ' + v.van.ploeg + ' → ' + v.naar.ploeg + ' man' : '', v.van.werkdagen !== v.naar.werkdagen ? 'werkdagen ' + v.van.werkdagen + ' → ' + v.naar.werkdagen : '',
      v.van.btw !== v.naar.btw ? 'btw ' + v.van.btw + ' % → ' + v.naar.btw + ' %' : ''].filter(Boolean);
    if (dagRij && info.length === 1 && /^werkdagen/.test(info[0])) info.length = 0; /* de werkdagen staan al bij lift en transport */
    const infoTekst = info.join(' · ');
    const kop = w.toegepast ? chip('v' + w.vanVersie + ' → v' + w.naarVersie, 'merk') : chip(w.leeg ? 'Geen wijziging' : 'Voorstel bij v' + w.vanVersie);
    let h = '<div class="wijziging"><div class="wijziging-kop">' + kop + '<b>' + eur(v.naar.incl) + '</b><span class="klein">incl. ' + v.naar.btw + ' % btw</span><span class="verschil">' + (dIncl ? plusMin(dIncl) : 'zelfde prijs') + '</span></div>';
    if (rijen.length) {
      h += '<div class="wijziging-rijen">' + rijen.map((x, j) => { const o = onder(x); return '<div class="r"><span class="l">' + esc(x.naam) + (o ? '<small>' + esc(o) + '</small>' : '') + '</span><span class="v">' + plusMin(afgerond[j]) + '</span></div>'; }).join('') +
        '<div class="r som"><span class="l">Verschil excl. btw</span><span class="v">' + plusMin(dExcl) + '</span></div></div>';
    }
    if (infoTekst) h += '<p class="info">' + esc(infoTekst.charAt(0).toUpperCase() + infoTekst.slice(1)) + '.</p>';
    if (w.leeg) h += '<p class="info">De prijs en de posten blijven gelijk.</p>';
    if (w.fouten && w.fouten.length) h += '<p class="info fout">Niet toegepast: ' + esc(w.fouten.join(', ')) + '.</p>';
    if (!w.toegepast && !w.leeg) {
      const kan = w.vanVersie === S.versie && !S.loopt && S.bekijk == null;
      h += '<div class="knoppen">' + (kan ? '<button class="knop knop--36" type="button" data-toepassen-beurt="' + i + '">Toepassen als v' + (S.versie + 1) + '</button><span class="klein">v' + S.versie + ' blijft bewaard.</span>'
        : '<span class="klein">Gerekend op v' + w.vanVersie + '; vraag het opnieuw voor v' + S.versie + '.</span>') + '</div>';
    }
    return h + '</div>';
  }
  function beurtHtml(b, i) {
    let a = '';
    if (b.staat === 'bezig') a += '<div class="beurt-staat is-actief">' + ic('spinner', 'spinner') + '<span class="label">Antwoord schrijven</span><span class="duur">' + (b.t0 ? secLoopt(b.t0) : '') + '</span></div>';
    const regels = b.staat === 'bezig' && b.live ? b.live.regels : String(b.antwoord || '').split('\n').filter((s) => s.trim());
    const loopt = b.staat === 'bezig' && b.live && b.live.bezig ? '<p>' + esc(b.live.bezig) + '<span class="caret" aria-hidden="true"></span></p>' : '';
    a += '<div class="beurt-tekst">' + regels.map((s) => '<p>' + esc(s) + '</p>').join('') + loopt + '</div>';
    if (bevat(b)) a += wijzigingHtml(b, i);
    if (b.staat === 'fout' || b.staat === 'gestopt') a += '<div class="beurt-staat is-fout">' + ic(b.staat === 'gestopt' ? 'streep' : 'kruis') + '<span class="label">' + esc(b.staat === 'gestopt' ? 'Gestopt.' : (b.fout || 'Geen antwoord.')) + '</span></div>';
    return '<div class="beurt" data-beurt="' + i + '"><div class="beurt-vraag">' + esc(b.vraag) + '</div><div class="beurt-antwoord">' + a + '</div></div>';
  }
  function tekenGesprek() {
    const el = $('gesprek');
    const toon = S.gesprek.length > 0 && !!S.m && S.fase !== 'leeg' && !body.classList.contains('leeg');
    el.hidden = !toon;
    el.innerHTML = toon ? S.gesprek.map(beurtHtml).join('') : '';
  }
  let beurtWacht = false;
  function planBeurt() { if (beurtWacht) return; beurtWacht = true; requestAnimationFrame(() => { beurtWacht = false; tekenLaatsteBeurt(); }); }
  function tekenLaatsteBeurt() {
    const i = S.gesprek.length - 1;
    const el = document.querySelector('#gesprek [data-beurt="' + i + '"]');
    if (i < 0 || !el) { tekenGesprek(); return; }
    const onder = dichtbijOnder();
    el.outerHTML = beurtHtml(S.gesprek[i], i);
    if (onder) naarOnder();
    $('naar-laatste').hidden = onder;
  }
  /* Drie voorstellen uit deze berekening (alleen zolang er nog niets gevraagd is): een keuze weglaten, een man meer, de zwaarste aanname. */
  function vervolgVoorstellen() {
    const a = laatsteA;
    if (!a) return [];
    const uit = [];
    const zonder = a.watAls.find((w) => /^Zonder /.test(w.label));
    if (zonder) uit.push('Wat kost het ' + zonder.label.charAt(0).toLowerCase() + zonder.label.slice(1) + '?');
    if (a.r.ploeg < 6) uit.push('Reken met ' + (a.r.ploeg + 1) + ' man');
    if (S.m && S.m.aannames && S.m.aannames.length) uit.push('Welke aanname weegt het zwaarst in de prijs?');
    return uit;
  }
  function pasVraagHoogte() { const t = $('vraag'); t.style.height = 'auto'; t.style.height = Math.min(168, Math.max(36, t.scrollHeight)) + 'px'; }
  function tekenVervolg() {
    const f = $('vervolg');
    const kan = !!laatsteA && !body.classList.contains('leeg') && S.fase !== 'leeg' && S.bekijk == null && !(S.loopt && S.fase !== 'vervolg');
    f.hidden = !kan;
    body.classList.toggle('met-vervolg', kan);
    if (!kan) return;
    const loopt = S.loopt && S.fase === 'vervolg';
    const knop = $('vraag-stuur');
    knop.classList.toggle('is-stop', loopt);
    knop.innerHTML = loopt ? ic('stop', 'vol') : ic('pijl-op');
    knop.setAttribute('aria-label', loopt ? 'Stop het antwoord' : 'Versturen');
    knop.title = loopt ? 'Stop (Esc)' : 'Versturen (Enter)';
    knop.disabled = !loopt && !$('vraag').value.trim();
    const chips = S.gesprek.length || loopt ? [] : vervolgVoorstellen();
    const html = chips.map((t) => '<button type="button" data-vervolg="' + esc(t) + '">' + esc(t) + '</button>').join('');
    if ($('vervolg-chips').innerHTML !== html) $('vervolg-chips').innerHTML = html;
  }
  /* Past een wijziging toe als nieuwe versie: de huidige versie gaat naar S.versies (te bekijken en te herstellen). */
  function pasToe(w, wijz) {
    S.versies.push(snapshotNu());
    S.versie++;
    S.m = w.m;
    if (w.ploeg) S.ploeg = w.ploeg;
    if (w.btw) S.btw = w.btw === tarieven.btw ? 0 : w.btw;
    if (w.m.titel) S.titel = w.m.titel;
    /* Het voorbeeld wordt na een wijziging een eigen berekening: die wordt bewaard. */
    S.voorbeeld = false;
    S.gewijzigd = {}; S.origineel = kopie(S.m.kenmerken); S.bewaard = false; S.oudePrijs = 0;
    wijz.toegepast = true; wijz.naarVersie = S.versie;
  }
  function tarievenNa(w) { return Object.assign({}, huidig(), w.ploeg ? { ploeg: w.ploeg } : {}, w.btw ? { btw: w.btw } : {}); }
  function maakWijziging(uit) {
    const w = RP.pasWijzigingToe(S.m, uit.ops);
    const v = RP.vergelijk(S.m, huidig(), w.m, tarievenNa(w), w.herkomst);
    const anders = JSON.stringify(w.m) !== JSON.stringify(S.m) || v.van.ploeg !== v.naar.ploeg || v.van.btw !== v.naar.btw;
    const wijz = { soort: uit.actie, ops: uit.ops, fouten: w.fouten, vergelijk: v, vanVersie: S.versie, toegepast: false, leeg: !anders };
    if (uit.actie === 'toepassen' && anders) pasToe(w, wijz);
    return wijz;
  }
  function toepassenBeurt(i) {
    const b = S.gesprek[i];
    if (!bevat(b) || b.wijziging.toegepast || b.wijziging.leeg || S.loopt || S.bekijk != null || !S.m) return;
    if (b.wijziging.vanVersie !== S.versie) { toast('Gerekend op v' + b.wijziging.vanVersie); return; }
    const w = RP.pasWijzigingToe(S.m, b.wijziging.ops);
    /* Opnieuw gerekend met de tarieven van nu: tussen de vraag en de klik kan een tarief veranderd zijn. */
    b.wijziging.vergelijk = RP.vergelijk(S.m, huidig(), w.m, tarievenNa(w), w.herkomst);
    b.wijziging.fouten = w.fouten;
    pasToe(w, b.wijziging);
    teken(); tekenUitlegRest(); tekenRail();
    opslaan(true);
    status('Toegepast: v' + S.versie + '.');
  }
  async function vervolg(tekst) {
    tekst = String(tekst || '').trim().slice(0, 1000);
    if (!tekst || S.loopt || startBezig || !laatsteA || S.bekijk != null) return;
    if (zonderServer) {
      startBezig = true;
      let terug = false;
      try { terug = (await serverLeeft()) && (await serverTerug()); } finally { startBezig = false; }
      if (!terug) {
        S.gesprek.push({ vraag: tekst, antwoord: '', staat: 'fout', versie: S.versie, fout: 'Geen antwoord: deze demo draait zonder de lokale server. Op de pc (start.cmd) antwoordt de AI hier op elke vraag.' });
        $('vraag').value = ''; pasVraagHoogte();
        tekenGesprek(); tekenVervolg(); naarOnder();
        return;
      }
    }
    const eerder = S.gesprek.filter((b) => b.staat === 'klaar');
    const beurt = { vraag: tekst, antwoord: '', staat: 'bezig', versie: S.versie, t0: Date.now(), live: { regels: [], bezig: '' } };
    S.gesprek.push(beurt);
    $('vraag').value = ''; pasVraagHoogte();
    const faseVoor = S.fase;
    S.fase = 'vervolg';
    bezig(true);
    ctl = new AbortController();
    tekenGesprek();
    naarOnder();
    status('Antwoord schrijven.');
    let ruw = '';
    try {
      const prompt = RP.bouwVervolgPrompt(S.klus, S.gemeten, S.m, huidig(), standaarden, eerder, tekst, S.uitleg.staat === 'klaar' ? S.uitleg.tekst : '');
      await stroom(prompt, (d) => { ruw += d; beurt.live = vervolgLive(ruw); planBeurt(); }, ctl.signal);
      const uit = RP.leesVervolg(ruw);
      beurt.antwoord = uit.antwoord.join('\n');
      if (uit.ops.length) beurt.wijziging = maakWijziging(uit);
      if (!beurt.antwoord && !beurt.wijziging) throw new Error('Geen antwoord ontvangen.');
      beurt.staat = 'klaar';
      status(beurt.wijziging && beurt.wijziging.toegepast ? 'Wijziging toegepast: v' + S.versie + '.' : beurt.wijziging ? 'Voorstel doorgerekend.' : 'Antwoord geschreven.');
    } catch (e) {
      const gestopt = !!(e && e.name === 'AbortError');
      const serverWeg = e instanceof TypeError;
      beurt.staat = gestopt ? 'gestopt' : 'fout';
      beurt.antwoord = RP.leesVervolg(ruw).antwoord.join('\n');
      beurt.fout = gestopt ? '' : serverWeg ? 'De lokale server antwoordt niet.' : ((e && e.message) || 'Geen antwoord ontvangen.');
      if (serverWeg) toonBanner();
      status(gestopt ? 'Gestopt.' : beurt.fout, !gestopt);
    } finally {
      beurt.duur = sec(beurt.t0);
      delete beurt.t0; delete beurt.live;
      bezig(false);
      S.fase = faseVoor === 'vervolg' ? 'klaar' : faseVoor;
      teken(); tekenUitlegRest(); tekenRail();
      $('naar-laatste').hidden = true;
      naarOnder();
      opslaan(true);
      if (!telefoon.matches) $('vraag').focus();
    }
  }

  /* ---------- bewaren, laden, nieuw, voorbeeld ---------- */
  function opslaan(stil) {
    /* Opslagen lopen na elkaar: de tweede wacht tot de eerste zijn id heeft. */
    opslaanKeten = opslaanKeten.then(() => opslaanNu(stil), () => opslaanNu(stil));
    return opslaanKeten;
  }
  async function opslaanNu(stil) {
    if (!laatsteA || S.voorbeeld) return;
    const r = laatsteA.r;
    if (!S.datum) S.datum = new Date().toISOString();
    const o = { id: S.id || undefined, titel: S.titel || S.m.titel || 'Berekening', adres: S.adres, datum: S.datum, prijs: Math.round(r.kosten.incl), vak: r.vak, klus: S.klus, asbest: S.asbest, versie: S.versie,
      meetstaat: S.m, gemeten: S.gemeten, meetFout: S.meetFout, meetDuur: S.meetDuur, tarieven: huidig(), ploeg: S.ploeg, btw: S.btw, onvolledig: S.onvolledig,
      /* Een afgebroken uitleg wordt niet bewaard: na het openen zou hij als volledig gelden. */
      uitleg: S.uitleg.staat === 'klaar' ? S.uitleg.tekst : '', uitlegPrijs: S.uitleg.staat === 'klaar' ? S.uitleg.prijsBij : 0, duur: S.duur, stappen: S.trail.map((s) => s.duur || 0),
      offerte: S.offerte ? offOpslagVorm(S.offerte) : undefined, versies: S.versies.length ? S.versies : undefined,
      gesprek: S.gesprek.some((b) => b.staat !== 'bezig') ? S.gesprek.filter((b) => b.staat !== 'bezig').map((b) => { const c = Object.assign({}, b); delete c.live; delete c.t0; return c; }) : undefined };
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
    S.btw = Number(o.btw) === 21 || Number(o.btw) === 6 ? Number(o.btw) : 0; S.onvolledig = !!o.onvolledig; S.foutTekst = '';
    S.beeldAnimatie = false; S.kenmerkenBeeldVers = false;
    S.offerte = o.offerte && typeof o.offerte === 'object' ? offNormaliseer(o.offerte) : null;
    S.versies = Array.isArray(o.versies) ? o.versies : []; S.bekijk = null; S.bekijkTerug = null;
    S.gesprek = Array.isArray(o.gesprek) ? o.gesprek.filter((b) => b && typeof b === 'object' && b.vraag && b.staat !== 'bezig') : [];
    $('naar-laatste').hidden = true;
    openOfferte(false);
    S.gewijzigd = {}; S.origineel = kopie(S.m.kenmerken); S.open = new Set(); S.bewaard = !!o.id; S.oudePrijs = 0; S.duur = o.duur || 0;
    S.uitleg = { tekst: o.uitleg || '', staat: o.uitleg ? 'klaar' : 'geen', prijsBij: o.uitlegPrijs || 0 };
    uitlegBuf = ''; live = null;
    $('adres').value = S.adres; $('klus').value = S.klus; zetAsbest(S.asbest);
    S.fase = 'klaar';
    const st = o.stappen || [];
    S.trail = [
      S.gemeten ? { staat: 'klaar', label: gemetenLabel(S.gemeten), duur: st[0] || S.meetDuur } : S.adres && S.meetFout ? { staat: 'waarschuwing', label: meetFoutLabel(), duur: st[0] || 0 } : { staat: 'over', label: 'Meting overgeslagen: geen adres' },
      S.onvolledig ? { staat: 'gestopt', label: 'Posten onvolledig binnen', duur: st[1] || 0 } : { staat: 'klaar', label: 'Posten geschreven', duur: st[1] || 0 },
      S.uitleg.tekst ? { staat: 'klaar', label: 'Uitleg geschreven', duur: st[2] || 0 } : { staat: 'over', label: 'Geen uitleg' },
    ];
    S.trailDicht = true; S.stapNr = 3;
    S.trailKop = o.voorbeeld ? 'Voorbeeld · 3 stappen' : 'Berekend op ' + datumTekst(S.datum) + (S.duur > 0 ? ' · ' + secTekst(S.duur) : '');
    kaartDicht(true); zetLeeg(false); body.classList.add('paneel-open'); body.classList.remove('lade', 'rail-open'); zetTab('overzicht'); zetSeg(false);
    $('banner').hidden = true;
    teken();
    const r = laatsteA ? laatsteA.r : null;
    if (r && !S.onvolledig) S.trail[1].label = 'Posten geschreven: ' + r.regels.length + (r.regels.length === 1 ? ' post' : ' posten') + ' in ' + r.fases.length + (r.fases.length === 1 ? ' fase' : ' fases');
    /* Bewaard = de getoonde prijs is de bewaarde prijs. Rekent de pagina met andere tarieven dan toen, dan staat Opslaan aan. */
    S.bewaard = !!o.id && !!r && Math.round(r.kosten.incl) === Math.round(Number(o.prijs) || 0);
    tekenKnoppen();
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
    zetKlaar({ voorbeeld: true, titel: m.titel, klus: RP.VOORBEELD.klus, asbest: 'onbekend', meetstaat: m, uitleg: VOORBEELD_UITLEG, uitlegPrijs: VOORBEELD_PRIJS });
  }
  /* Het voorbeeld met een gesprek erbij (haakje #voorbeeld-gesprek, ook voor de demo zonder server): een vraag met een antwoord uit de
     cijfers van het voorbeeld (geschreven op 7 oktober 2026 uit RP.analyse) en een wijziging die de motor hier zelf doorrekent. */
  function laadVoorbeeldGesprek() {
    if (S.loopt) return;
    laadVoorbeeld();
    S.gesprek = [{ vraag: 'Waarom zit er een stelling in de prijs? De klant vroeg er niet om.', staat: 'klaar', versie: 1,
      antwoord: ['De dakrand ligt op 6 m hoogte, dus de ploeg werkt van op een stelling aan de voor- en achtergevel: 2 × 8 m × 6 m = 96 m².',
        'Die stelling kost € 1.623 in de prijs; daarin zit 2 weken huur, inkoop € 768.',
        'De vrije zijgevel krijgt geen stelling: volgens de aanname is die bereikbaar vanaf het dak.'].join('\n') }];
    const b = { vraag: 'Zet er 2 dakramen bij, dus 4 in totaal.', antwoord: 'Ik zet 4 dakramen in plaats van 2.', staat: 'klaar', versie: 1 };
    const nr = S.m.posten.findIndex((p) => p.code === 'dak.dakraam');
    b.wijziging = maakWijziging({ actie: 'toepassen', ops: [{ t: 'zet', id: 'p' + (nr + 1), hoeveelheid: 4, toelichting: '4 dakramen' }, { t: 'kenmerk', k: 'dakramen_st', label: 'Dakramen', waarde: 4, eenheid: 'st' }] });
    S.gesprek.push(b);
    S.voorbeeld = true; /* blijft het voorbeeld: niet bewaren */
    teken(); tekenUitlegRest();
    status('Voorbeeld met gesprek geopend.');
  }
  function nieuw() {
    if (S.loopt) return;
    Object.assign(S, { id: null, versie: 1, titel: '', adres: '', klus: '', asbest: 'onbekend', datum: '', m: null, gemeten: null, meetFout: '', meetDuur: 0, ploeg: 0, btw: 0, onvolledig: false, foutTekst: '', voorbeeld: false, beeldAnimatie: false, kenmerkenBeeldVers: false, offerte: null, versies: [], bekijk: null, bekijkTerug: null, gesprek: [], trail: [], trailDicht: false, trailKop: '', duur: 0, origineel: {}, gewijzigd: {}, open: new Set(), bewaard: false, oudePrijs: 0, fase: 'leeg', stapNr: 0 });
    $('vraag').value = ''; pasVraagHoogte();
    S.uitleg = { tekst: '', staat: 'geen', prijsBij: 0 }; uitlegBuf = ''; live = null;
    $('naar-laatste').hidden = true;
    $('adres').value = ''; $('klus').value = ''; zetAsbest('onbekend'); $('klus-fout').hidden = true; $('banner').hidden = true;
    openOfferte(false);
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
      regels.push('Richtprijs: ' + eur(k.incl) + ' incl. ' + r.t.btw + ' % btw (' + eur(k.excl) + ' excl. btw' + (r.perM2 && !S.onvolledig ? ', ' + eur(r.perM2) + ' per m² ' + r.vlakNaam : '') + ')');
      if (S.onvolledig) regels.push('ONVOLLEDIG: de posten kwamen niet volledig binnen (' + r.regels.length + ' posten).');
      regels.push('Ploeg ' + r.ploeg + ' man · ' + r.werkdagen + ' werkdagen · ' + n1.format(r.uren) + ' manuren · ' + gewicht(r.matKg) + ' naar boven · ' + gewicht(r.afvalKg) + ' afval', '');
      regels.push('POSTEN');
      for (const f of r.fases) { regels.push(f.naam + ' (' + n1.format(f.uren) + ' manuren)'); for (const x of f.regels) regels.push('- ' + x.naam + ' · ' + getal(x.hoeveelheid) + ' ' + x.eenheid + ' · ' + n1.format(x.uren) + ' manuren · materiaal ' + eur(x.matKost + x.huurKost) + ' · ' + (x.bron === 'data' ? 'datatabel' : 'AI-schatting') + (x.gevraagd ? '' : ' · niet gevraagd, wel nodig: ' + x.waarom)); }
      const ka = kostenAfgerond(k);
      regels.push('', 'KOSTENOPBOUW', 'Arbeid: ' + n1.format(r.uren) + ' manuren × ' + eur2(r.t.uurtarief) + ' = ' + eur(ka.arbeid), 'Materiaal: inkoop ' + eur(k.materiaalInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge = ' + eur(ka.materiaal), 'Materieel en afvoer: inkoop ' + eur(k.materieelInkoop) + ' + ' + getal(r.t.materiaalmarge) + ' % marge = ' + eur(ka.materieel), 'Subtotaal: ' + eur(ka.subtotaal), 'Onvoorzien ' + getal(r.t.onvoorzien) + ' %: ' + eur(ka.onvoorzien), 'Prijs excl. btw: ' + eur(ka.excl), 'Btw ' + r.t.btw + ' %: ' + eur(ka.btw), 'Prijs incl. btw: ' + eur(ka.incl), '');
    }
    if (uitleg.length) regels.push('TOELICHTING', ...uitleg.map((s) => '- ' + s), '');
    if (S.m && S.m.aannames.length) regels.push('AANNAMES', ...S.m.aannames.map((s) => '- ' + s), '');
    if (S.m && S.m.plaatsbezoek.length) regels.push('TE CONTROLEREN BIJ HET PLAATSBEZOEK', ...S.m.plaatsbezoek.map((s) => '- ' + s), '');
    if (!alleenUitleg) regels.push('Richtprijs uit ' + (S.gemeten ? 'de kaartmeting' : 'de maten in de klus') + ', uw tarieven en de datatabel van ' + DATA.stand + '. Norvo Richtprijs.');
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
    { k: 'ploeg', label: 'Ploeg van de open berekening', eenheid: 'man', toon: getal, min: 1 },
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
      /* De ploeg hoort bij de open berekening; zonder open berekening staat het veld uit en wijst het naar de standaardploeg. */
      const uit = t.k === 'ploeg' && !laatsteA;
      return '<div class="veld"><label for="t-' + t.k + '"><span>' + t.label + '</span></label><div class="in"><input id="t-' + t.k + '" data-tarief="' + t.k + '" type="text" inputmode="decimal" autocomplete="off" value="' + esc(t.toon(v)) + '"' + (uit ? ' disabled' : '') + '><span class="eenheid">' + t.eenheid + '</span></div>' +
        (uit ? '<p class="klein veld-hint">Geen open berekening: de standaardploeg staat onder Standaarden.</p>' : '') +
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
  /* De toetsenbordfocus terugzetten op hetzelfde veld na het hertekenen van de postenlijst (Tab-navigatie door de prijzen blijft werken). */
  function focusInPosten() {
    const a = document.activeElement;
    if (!a || !$('posten').contains(a)) return null;
    return { norm: a.getAttribute('data-norm'), prijs: a.getAttribute('data-prijs'), mat: a.getAttribute('data-mat'), toggle: a.getAttribute('data-post-toggle') };
  }
  function zetFocusInPosten(f) {
    if (!f) return;
    const sel = f.norm ? '[data-norm="' + CSS.escape(f.norm) + '"]' : f.prijs ? '[data-prijs="' + CSS.escape(f.prijs) + '"][data-mat="' + CSS.escape(f.mat || '') + '"]' : f.toggle ? '[data-post-toggle="' + CSS.escape(f.toggle) + '"]' : '';
    const e = sel ? $('posten').querySelector(sel) : null;
    if (!e) return;
    e.focus();
    if (e.setSelectionRange) { try { e.setSelectionRange(e.value.length, e.value.length); } catch (x) { /* geen tekstveld */ } }
  }
  function tekenPosten() {
    const upd = tarieven.urenPerDag;
    const q = zoekTekst.trim().toLowerCase();
    const focus = focusInPosten();
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
      let h = '<div class="post" data-code="' + esc(code) + '"><button class="kop" type="button" data-post-toggle="' + esc(code) + '" aria-expanded="' + open + '"><span><b>' + esc(p.naam) + '</b><small>' + nNorm.format(p.uur) + ' manuur per ' + esc(p.eenheid) + ' · 1 man doet ' + getal(p.uur > 0 ? Math.round(upd / p.uur * 10) / 10 : 0) + ' ' + esc(p.eenheid) + ' per werkdag · ' + esc(code) + '</small></span>' + ic(open ? 'omhoog' : 'omlaag') + '</button>';
      if (open) {
        const normEigen = over.uur != null && Number(over.uur) !== start.uur;
        h += '<div class="open"><div class="norm"><span class="klein">Norm</span><span class="in"><input type="text" inputmode="decimal" aria-label="Norm in manuur per ' + esc(p.eenheid) + '" data-norm="' + esc(code) + '" value="' + esc(nNorm.format(p.uur)) + '"></span><span class="klein">manuur per ' + esc(p.eenheid) + '</span>' + (normEigen ? chip('Eigen cijfer') + '<button class="link" type="button" data-norm-terug="' + esc(code) + '">Terug naar startwaarde (' + nNorm.format(start.uur) + ')</button>' : chip('Startwaarde')) + '</div>';
        if (p.mat.length) {
          h += '<div class="tabel kol-data"><div class="tabel-kop"><span>Materiaal</span><span class="g">Per</span><span class="g">Eenheid</span><span class="g">Prijs €</span><span class="g">Kg</span><span class="g">Label</span></div>';
          p.mat.forEach((x, i) => {
            const sx = start.mat[i] || x;
            const eigen = over.mat && over.mat[x.naam] && over.mat[x.naam].prijs != null && Number(over.mat[x.naam].prijs) !== sx.prijs;
            const label = eigen ? chip('Eigen cijfer') + '<button class="link" type="button" data-prijs-terug="' + esc(code) + '" data-mat="' + esc(x.naam) + '">Terug naar startwaarde (' + n2.format(sx.prijs) + ')</button>'
              : (x.bron && x.bron.url ? '<a class="chip" href="' + esc(x.bron.url) + '" target="_blank" rel="noopener" title="' + esc(x.bron.wat || 'Bron') + '">' + ic('link') + 'Bron</a>' : chip('Startwaarde'));
            h += '<div class="rij"><div class="n">' + esc(x.naam) + (x.huur ? ' ' + chip(x.perWeek ? 'Huur per week' : 'Huur') : '') + '</div><div class="g" data-l="Per">' + getal(x.per, 4) + '</div><div class="g" data-l="Eenheid">' + esc(x.eenheid) + '</div><div class="g" data-l="Prijs €"><span class="in"><input type="text" inputmode="decimal" aria-label="Prijs van ' + esc(x.naam) + '" data-prijs="' + esc(code) + '" data-mat="' + esc(x.naam) + '" value="' + esc(n2.format(x.prijs)) + '"></span></div><div class="g" data-l="Kg">' + (x.kg ? getal(x.kg, 4) : '—') + '</div><div class="g" data-l="Label">' + label + '</div></div>';
          });
          h += '</div>';
        }
        const afval = (p.afval || (p.afvalKg ? [{ soort: 'rest', kg: p.afvalKg }] : [])).filter((a) => a.kg > 0);
        if (afval.length) h += '<p class="klein">Afval per ' + esc(p.eenheid) + ': ' + afval.map((a) => getal(a.kg, 4) + ' kg ' + esc(a.soort)).join(' · ') + '</p>';
        h += '</div>';
      }
      return h + '</div>';
    }).join('');
    zetFocusInPosten(focus);
  }
  const leesGetal = (s) => { const v = parseFloat(String(s).replace(',', '.')); return Number.isFinite(v) ? v : NaN; };
  function tekenInstellingen() { tekenTarieven(); tekenStandaarden(); tekenVakken(); tekenPosten(); }
  function openInstellingen(aan) {
    body.classList.toggle('instellingen-open', aan);
    body.classList.remove('lade');
    if (aan) { zetSeg(false); tekenInstellingen(); $('instellingen').scrollTop = 0; window.scrollTo(0, 0); }
  }

  /* ---------- offerte: formulier links, document rechts (ontwerp/OFFERTE-spec.txt) ---------- */
  const OFF = RP.OFFERTE;
  let laatsteO = null;
  const offLeeg = () => ({ status: 'concept', klant: { type: 'particulier', naam: '', straat: '', gemeente: '', email: '', telefoon: '' }, werf: { adres: '', gelijk: false }, woning: { jaar: '', prive: true, eindverbruiker: true },
    offerte: { nummer: '', datum: '', geldigTot: '', titel: '', omschrijving: '', aard: 'gepland', thuis: false, opgemeten: false, opgemetenOp: '', architect: false, aannemers: 1, premiewerk: false, alleenHoofdstukken: false },
    regels: {}, uitvoering: { start: '', werkdagen: '' }, betaling: {}, teksten: { opmerking: '' }, uitgegeven: null, versies: [] });
  function offMaak() {
    const k = offLeeg();
    k.werf.adres = (S.gemeten && S.gemeten.adres) || S.adres || '';
    k.offerte.datum = OFF.isoDag(new Date());
    return k;
  }
  function offNormaliseer(k) {
    const n = offLeeg();
    for (const s of ['klant', 'werf', 'woning', 'offerte', 'uitvoering', 'teksten']) n[s] = Object.assign(n[s], k && k[s] && typeof k[s] === 'object' ? k[s] : {});
    n.regels = k && k.regels && typeof k.regels === 'object' ? k.regels : {};
    n.betaling = k && k.betaling && typeof k.betaling === 'object' ? k.betaling : {};
    n.status = k && k.status === 'uitgegeven' && k.uitgegeven ? 'uitgegeven' : 'concept';
    n.uitgegeven = k && k.uitgegeven && typeof k.uitgegeven === 'object' ? k.uitgegeven : null;
    n.versies = k && Array.isArray(k.versies) ? k.versies : [];
    return n;
  }
  /* Nummer "{jaar}-{volgnummer}" pas bij de uitgifte (spec 4.5): een concept dat nooit wordt uitgegeven verbruikt geen nummer.
     De teller staat in instellingen.offerte en loopt per jaar; hij wordt eerst opnieuw van de server gelezen (een andere tab kan
     intussen een nummer uitgegeven hebben) en meteen bewaard. Een berekening die al een nummer heeft, houdt het. */
  async function offNieuwNummer() {
    const jaar = new Date().getFullYear();
    const io = inst.offerte;
    let n = Number(io.volgnummerJaar) === jaar ? Number(io.volgnummer) || 0 : 0;
    try {
      const g = await fetch('/api/instellingen', { headers: KOP });
      const so = g.ok ? ((await g.json()) || {}).offerte : null;
      if (so && Number(so.volgnummerJaar) === jaar) n = Math.max(n, Number(so.volgnummer) || 0);
    } catch (e) { /* de lokale teller geldt */ }
    io.volgnummer = n + 1; io.volgnummerJaar = jaar;
    const ok = await schrijfInstellingen();
    if (!ok) { io.volgnummer = n; return ''; }
    return jaar + '-' + String(n + 1).padStart(4, '0');
  }
  /* GET /api/berekeningen leest nummer, uitgegeven en geldigTot bovenaan het bewaarde offerte-object (server.mjs): die velden
     spiegelen hier de stand, zodat de rail "Offerte {nummer}" en "vervallen" kan tonen zonder elke berekening te openen. */
  function offOpslagVorm(k) {
    const u = k.status === 'uitgegeven' && k.uitgegeven ? k.uitgegeven : null;
    const ko = k.offerte || {};
    const dagen = Number(OFF.vulInstellingen(inst.offerte, tarieven.uurtarief).geldigheidDagen) || 30;
    const geldigTot = u ? (u.geldigTot || ko.geldigTot || (u.datum ? OFF.plusDagen(u.datum, dagen) : '')) : (ko.geldigTot || (ko.datum ? OFF.plusDagen(ko.datum, dagen) : ''));
    return Object.assign({}, k, { nummer: u ? u.nummer : (ko.nummer || ''), geldigTot });
  }
  /* Het nummer dat dit concept bij de uitgifte krijgt, als het al vastligt (een eerder uitgegeven versie of een oudere berekening). */
  function offNummerStraks(k) {
    if (!k || !k.offerte.nummer) return '';
    const versie = k.versies.length + 1;
    return k.offerte.nummer + (versie > 1 ? '-v' + versie : '');
  }
  /* De demo zonder server heeft geen instellingen.json: het voorbeeld toont dan de offerte van de eerste gebruiker (AB Bouw), met de
     gegevens uit instellingen.json van 7 oktober 2026 en het logo via het relatieve pad assets/ab-bouw-logo.png. Wat de bezoeker in het
     formulier wijzigt, gaat erboven; bewaard wordt er niets. Met server gelden altijd de eigen instellingen van de aannemer. */
  const AANNEMER_DEMO = { naam: 'AB Bouw Groep', adres: 'August Van Landeghemstraat 63, 2830 Willebroek', ondernemingsnummer: '1010.850.361', btw: 'BE 1010.850.361', telefoon: '0460 20 77 88', email: 'info@abgroep.be', website: 'abgroep.be', logo: 'assets/ab-bouw-logo.png' };
  const instOfferte = () => (zonderServer ? Object.assign({}, inst.offerte, { aannemer: Object.assign({}, AANNEMER_DEMO, inst.offerte.aannemer || {}) }) : inst.offerte);
  function offerteModel() {
    if (!S.m || !S.offerte) return null;
    try { return RP.offerteVan(S.m, huidig(), instOfferte(), Object.assign({}, S.offerte, { asbest: S.asbest })); } catch (e) { return null; }
  }
  const cssTekst = (s) => String(s).replace(/[\\"]/g, '\\$&').replace(/\n/g, ' ');
  function zetPageCss(A) {
    $('off-page-css').textContent = A ? '@page{size:A4;margin:15mm 15mm 16mm;@bottom-center{content:"' + cssTekst((A.naam || '') + (A.btw ? ' · BTW ' + A.btw : '') + ' · pagina ') + '" counter(page) " van " counter(pages);font:8pt Arial,Helvetica,sans-serif;color:#444}}' : '';
  }
  function offZoom() {
    const wrap = $('off-doc-wrap'), zoom = $('off-doc-zoom'), doc = $('off-doc');
    if (!wrap || !zoom || !doc || !wrap.clientWidth || !doc.offsetWidth) return;
    const breed = wrap.clientWidth - (telefoon.matches ? 32 : 48);
    const z = Math.min(1, breed / doc.offsetWidth);
    zoom.style.transform = 'scale(' + z.toFixed(4) + ')';
    zoom.style.width = doc.offsetWidth + 'px';
    zoom.style.height = Math.ceil(doc.offsetHeight * z) + 'px';
    /* Bevroren weergave zonder formulier: het document in het midden van de volle breedte. */
    zoom.style.marginLeft = body.classList.contains('off-bevroren') ? Math.max(0, Math.round((breed - doc.offsetWidth * z) / 2)) + 'px' : '0';
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => { if (body.classList.contains('offerte-open')) offZoom(); }).observe($('off-doc-wrap'));
  function openOfferte(aan) {
    if (aan && (!laatsteA || S.loopt)) return;
    body.classList.toggle('offerte-open', aan);
    body.classList.remove('lade', 'instellingen-open', 'offseg-document');
    if (!aan) { zetPageCss(null); tekenKnoppen(); return; }
    zetSeg(false);
    if (!S.offerte) S.offerte = offMaak();
    tekenOfferte(true);
    /* De weergave opent bovenaan, met de kop (Terug naar de berekening) in beeld; de lijst "Nog in te vullen" staat als eerste
       blok van het formulier al direct onder de kop, dus geen sprong ernaartoe (op de telefoon schoof de kop zo uit beeld). */
    $('off-form').scrollTop = 0; $('off-doc-wrap').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  /* --- het document (A4) --- */
  function offerteDocHtml(o, nummer) {
    const A = o.aannemer, k = o.klant, t = o.totalen, T = o.teksten, v = o.vlaggen;
    const E = OFF.eur, H = OFF.hoev, D = OFF.datumVoluit;
    const li = (s) => '<li>' + esc(s) + '</li>';
    /* Elke rij heeft zeven cellen zonder colspan: met samengevoegde cellen herhaalt Chrome de tabelkop niet op een volgende pagina. */
    const regelRij = (l, optie) => '<tr' + (optie ? ' class="optie"' : '') + '><td class="nr">' + esc(l.nr || '') + '</td><td>' + esc(l.omschrijving) + '</td>' +
      (l.forfait ? '<td class="g">forfait</td><td></td>' : '<td class="g">' + H(l.hoeveelheid) + '</td><td>' + esc(l.eenheid) + '</td>') +
      '<td>' + esc(l.aard) + '</td><td class="g">' + (l.forfait || v.alleenHoofdstukken ? '' : E(l.eenheidsprijs)) + '</td><td class="g">' + (v.alleenHoofdstukken && !optie ? '' : E(l.totaal)) + '</td></tr>';
    /* Kolombreedtes (spec 3.3) op 180 mm tekstbreedte (A4 met 15 mm marge); de omschrijving krijgt de rest (90 mm). */
    const KOP = '<colgroup><col style="width:8mm"><col><col style="width:17mm"><col style="width:14mm"><col style="width:9mm"><col style="width:20mm"><col style="width:22mm"></colgroup><thead><tr><th>Nr</th><th>Omschrijving</th><th class="g">Hoeveelheid</th><th>Eenheid</th><th>Aard</th><th class="g">Eenheidsprijs excl.&nbsp;btw</th><th class="g">Totaal excl.&nbsp;btw</th></tr></thead>';
    const LEEG5 = '<td></td><td></td><td></td><td></td><td></td>';
    /* Kop: logo links, rechts de verplichte vermeldingen van de aannemer in vijf regels. */
    const regel = (...delen) => delen.filter(Boolean).map(esc).join(' · ');
    let h = '<div class="kop">' + (A.logo ? '<img class="logo" src="' + esc(A.logo) + '" alt="">' : '<div class="naamgroot">' + esc(A.naam) + '</div>') +
      '<div class="bedrijf"><b>' + esc(o.naamVol) + '</b><br>' + esc(A.adres) + '<br>' + regel('Ondernemingsnummer ' + (A.ondernemingsnummer || ''), A.btw ? 'BTW ' + A.btw : '') + (A.rpr || A.iban ? '<br>' + regel(A.rpr, A.iban ? 'IBAN ' + A.iban : '') : '') + '<br>' + regel(A.telefoon, A.email, A.website) + '</div></div>';
    h += '<div class="partijen"><div class="klant"><div class="label">Klant</div><b>' + esc(k.naam || '') + '</b><br>' + esc(k.straat || '') + '<br>' + esc(k.gemeente || '') + (k.email || k.telefoon ? '<br>' + regel(k.email, k.telefoon) : '') + '</div>' +
      '<table class="meta"><tr><td>Offertenummer</td><td>' + esc(nummer || 'Concept') + '</td></tr><tr><td>Datum</td><td>' + esc(D(o.kop.datum)) + '</td></tr><tr><td>Geldig tot</td><td>' + esc(D(o.kop.geldigTot)) + '</td></tr><tr><td>Werfadres</td><td>' + esc(o.werf.adres || '') + '</td></tr></table></div>';
    h += '<h1>Offerte</h1><p class="titel">' + esc(o.kop.titel) + '</p><p class="omschrijving">' + esc(o.kop.omschrijving) + '</p>';
    h += '<table class="posttabel">' + KOP + '<tbody>';
    for (const hs of o.hoofdstukken) {
      h += '<tr class="hoofdstuk"><td class="nr">' + hs.nr + '</td><td>' + esc(hs.naam) + '</td>' + LEEG5 + '</tr>';
      for (const l of hs.regels) h += regelRij(l, false);
      h += '<tr class="sub"><td></td><td>Subtotaal ' + esc(hs.naam) + '</td><td></td><td></td><td></td><td></td><td class="g">' + E(hs.subtotaal) + '</td></tr>';
    }
    h += '</tbody></table>';
    h += '<table class="totalen"><tr><td>Totaal excl. btw</td><td class="g">' + E(t.excl) + '</td></tr><tr><td>' + (t.btwTarief === 6 ? 'Btw 6 % (renovatie van een woning ouder dan 10 jaar)' : 'Btw ' + t.btwTarief + ' %') + '</td><td class="g">' + E(t.btw) + '</td></tr><tr class="eind"><td>Totaal te betalen incl. btw</td><td class="g">' + E(t.incl) + '</td></tr></table>';
    const onder = [];
    if (o.heeftVH) onder.push('<p class="klein">' + esc(T.vhZin) + '</p>');
    if (T.btw6) onder.push('<p class="klein">' + esc(T.btw6) + (o.woning.jaar ? ' Woning in gebruik sinds ' + esc(o.woning.jaar) + '.' : '') + '</p>');
    if (onder.length) h += '<div class="onder-tabel">' + onder.join('') + '</div>';
    if (o.opties.length) {
      h += '<div class="blok"><h2>Opties (niet inbegrepen in het totaal)</h2><p>' + esc(T.optiesZin) + '</p><table class="posttabel"><thead><tr><th>Gewenst</th><th>Omschrijving</th><th class="g">Hoeveelheid</th><th>Eenheid</th><th>Aard</th><th class="g">Eenheidsprijs excl. btw</th><th class="g">Prijs excl. btw</th><th class="g">Prijs incl. btw</th></tr></thead><tbody>';
      for (const l of o.opties) h += '<tr class="optie"><td>☐</td><td>' + esc(l.omschrijving) + '</td><td class="g">' + H(l.hoeveelheid) + '</td><td>' + esc(l.eenheid) + '</td><td>FH</td><td class="g">' + E(l.eenheidsprijs) + '</td><td class="g">' + E(l.totaal) + '</td><td class="g">' + E(l.incl) + '</td></tr>';
      h += '</tbody></table></div>';
    }
    h += '<div class="blok"><h2>Inbegrepen</h2><ul>' + T.inbegrepen.map(li).join('') + '</ul></div>';
    /* Opmerkingen en uitsluitingen als doorlopende opsomming: genummerd, achter elkaar in één alinea. */
    if (T.uitsluitingen.length) h += '<div class="blok blok--lang"><h2>Opmerkingen en uitsluitingen</h2><p class="doorlopend">' + T.uitsluitingen.map((s, i) => '<b>' + (i + 1) + '.</b>&nbsp;' + esc(s)).join(' ') + '</p></div>';
    const start = o.uitvoering.start ? (/^\d{4}-\d{2}-\d{2}$/.test(o.uitvoering.start) ? D(o.uitvoering.start) : o.uitvoering.start) : '…';
    h += '<div class="blok"><h2>Uitvoering</h2><p>Aanvang: in overleg, ten vroegste ' + esc(start) + '. Uitvoeringstermijn: ' + H(o.uitvoering.werkdagen) + ' werkdagen na de aanvang.</p><p class="klein">' + esc(T.termijn) + '</p></div>';
    h += '<div class="blok"><h2>Betaling</h2><table class="schijven">' + t.schijven.map((s) => '<tr><td>' + H(s.p) + ' % ' + esc(s.label) + ':</td><td class="g">' + E(s.bedrag) + '</td></tr>').join('') + '</table>' +
      '<p>Elke schijf wordt gefactureerd en is betaalbaar binnen ' + T.betaaltermijn + ' dagen na de factuurdatum op IBAN ' + (A.iban ? esc(A.iban) + '.' : '…') + ' ' + esc(T.bestelbon) + (o.heeftVH ? ' De eindafrekening verrekent de VH-posten aan de opgemeten hoeveelheden.' : '') + '</p></div>';
    h += '<div class="blok"><h2>Meerwerken</h2><p>' + esc(T.meerwerken) + '</p></div>';
    h += '<div class="blok"><h2>Voorwaarden</h2><div class="kolommen">' + T.voorwaardenKort.map((z) => '<p>' + esc(z) + '</p>').join('') + '</div></div>';
    if (v.herroeping) h += '<div class="blok"><h2>Herroepingsrecht</h2><p>' + esc(T.herroeping) + '</p></div>';
    h += '<div class="blok"><h2>Voor akkoord</h2><p>' + esc(T.akkoord) + '</p>' +
      (v.herroeping && !v.dringend ? '<p class="vak">☐ Ik verzoek uitdrukkelijk dat de werken starten vóór het einde van de herroepingstermijn. Herroep ik daarna, dan betaal ik het al uitgevoerde deel aan de prijzen van deze offerte, en ik erken dat mijn herroepingsrecht vervalt zodra de werken volledig zijn uitgevoerd.</p>' : '') +
      (o.opties.length ? '<p class="vak">☐ Gewenste opties: zie het blok Opties.</p>' : '') +
      '<div class="hand"><div><b>Voor akkoord — de klant</b><p>Naam:</p><p>Plaats en datum:</p><p>Handtekening, voorafgegaan door “gelezen en goedgekeurd”:</p></div><div><b>Voor ' + esc(A.naam) + '</b><p>Naam en functie:</p><p>Datum:</p><p>Handtekening:</p></div></div></div>';
    h += '<div class="av"><h2>Algemene voorwaarden</h2><div class="kolommen">' + o.artikelen.map((a) => '<p>' + (a.nr ? '<b>' + a.nr + '. ' + esc(a.titel) + '.</b> ' : '') + esc(a.tekst) + '</p>').join('') + '</div><p class="paraaf">Paraaf van de klant: ____________</p></div>';
    /* De bijlage herroeping alleen als de offerte bij de klant thuis of op de werf ondertekend wordt (vinkje onder Uitvoering en betaling). */
    if (v.herroeping && !v.dringend) {
      h += '<div class="bijlage"><h2>Bijlage: modelformulier voor herroeping</h2><p class="klein">Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen.</p>' +
        '<p>Aan: ' + esc(o.naamVol) + ', ' + esc(A.adres) + ', ' + esc(A.email) + '</p>' +
        '<p>Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende de verlening van de volgende dienst herroep/herroepen (*): de werken volgens ' + (nummer ? 'offerte nr. ' + esc(nummer) : 'deze offerte') + '.</p>' +
        '<p class="lijn">Besteld op (*)/Ontvangen op (*):</p><p class="lijn">Naam consument(en):</p><p class="lijn">Adres consument(en):</p><p class="lijn">Handtekening van consument(en) (alleen wanneer dit formulier op papier wordt ingediend):</p><p class="lijn">Datum:</p><p class="klein">(*) Doorhalen wat niet van toepassing is.</p></div>';
    }
    return h;
  }

  /* --- het formulier --- */
  const offV = (o) => {
    const id = 'off-' + o.id;
    const lab = '<label for="' + id + '"><span>' + esc(o.label) + (o.vast ? '<span class="off-vast">vaste instelling</span>' : '') + '</span>' + (o.hint ? '<span class="klein">' + esc(o.hint) + '</span>' : '') + '</label>';
    let inv;
    if (o.type === 'select') inv = '<div class="in"><select id="' + id + '" data-pad="' + esc(o.pad) + '">' + o.keuzes.map((c) => '<option value="' + esc(c[0]) + '"' + (String(o.waarde == null ? '' : o.waarde) === String(c[0]) ? ' selected' : '') + (c[2] ? ' disabled' : '') + '>' + esc(c[1]) + '</option>').join('') + '</select></div>';
    else if (o.type === 'tekstvak') inv = '<textarea id="' + id + '" data-pad="' + esc(o.pad) + '"' + (o.lang ? ' class="lang"' : '') + ' rows="' + (o.rows || 3) + '" spellcheck="false">' + esc(o.waarde == null ? '' : o.waarde) + '</textarea>';
    else inv = '<div class="in"><input id="' + id + '" data-pad="' + esc(o.pad) + '" type="' + (o.type || 'text') + '" value="' + esc(o.waarde == null ? '' : o.waarde) + '"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + (o.min != null ? ' min="' + o.min + '"' : '') + ' autocomplete="off" spellcheck="false"' + (o.readonly ? ' readonly' : '') + '>' + (o.eenheid ? '<span class="eenheid">' + esc(o.eenheid) + '</span>' : '') + '</div>';
    return '<div class="veld' + (o.breed ? ' veld--breed' : '') + '">' + lab + inv + '</div>';
  };
  const offVink = (o) => '<label class="off-vink"><input type="checkbox" id="off-' + o.id + '" data-pad="' + esc(o.pad) + '"' + (o.waarde ? ' checked' : '') + (o.disabled ? ' disabled' : '') + '><span>' + esc(o.label) + (o.vast ? '<span class="off-vast">vaste instelling</span>' : '') + (o.hint ? '<small>' + esc(o.hint) + '</small>' : '') + '</span></label>';
  const offLijst = (naam, lijst) => '<div class="off-lijst" data-lijst="' + naam + '">' + lijst.map((z, i) => '<div class="r"><span class="in"><input type="text" data-pad="off/teksten/' + naam + '/' + i + '" value="' + esc(z) + '" aria-label="Zin ' + (i + 1) + '"></span><button class="ikoonknop" type="button" data-off-lijst-weg="' + naam + ':' + i + '" title="Zin schrappen" aria-label="Zin schrappen">' + ic('x') + '</button></div>').join('') + '<button class="link" type="button" data-off-lijst-plus="' + naam + '">+ Zin toevoegen</button></div>';
  function offRegelHtml(l, optie) {
    return '<div class="off-regel' + (optie ? ' is-optie' : '') + '"><span class="nr">' + esc(l.nr || 'optie') + '</span>' +
      '<div class="in"><input id="off-r-' + esc(l.sleutel) + '" data-pad="off/regels/' + esc(l.sleutel) + '/omschrijving" type="text" value="' + esc(l.omschrijving) + '" aria-label="Omschrijving van post ' + esc(l.nr || l.naamStart) + '">' + (l.ai ? '<span class="ai-punt" title="AI-schatting: beoordeel deze prijs"></span>' : '') + '</div>' +
      '<span class="tot">' + OFF.eur(l.totaal) + '</span>' +
      '<div class="onder"><span>' + (l.forfait ? 'forfait' : OFF.hoev(l.hoeveelheid) + ' ' + esc(l.eenheid) + ' × ' + OFF.eur(l.eenheidsprijs)) + '</span>' +
      '<select data-pad="off/regels/' + esc(l.sleutel) + '/aard" aria-label="Aard van de hoeveelheid"' + (l.forfait || l.optie ? ' disabled' : '') + '><option value="VH"' + (l.aard === 'VH' ? ' selected' : '') + '>VH</option><option value="FH"' + (l.aard === 'FH' ? ' selected' : '') + '>FH</option></select>' +
      (l.keuzeNaam && !l.forfait ? '<label class="off-vink"><input type="checkbox" data-pad="off/regels/' + esc(l.sleutel) + '/optie"' + (l.optie ? ' checked' : '') + '><span>In optie: ' + esc(l.keuzeNaam) + '</span></label>' : '') +
      (l.optie ? '<span>Controleer de posten die van deze keuze afhangen.</span>' : '') + (l.ai ? '<span>AI-schatting: beoordeel de prijs vóór de uitgifte.</span>' : '') + (l.sluitpost ? '<span>sluitpost</span>' : '') + '</div></div>';
  }
  function tekenOfferteForm(o) {
    const k = S.offerte, A = o.aannemer, kl = o.klant, ko = k.offerte, w = o.woning, io = o.inst;
    const btw6 = o.totalen.btwTarief === 6;
    const jaarNu = new Date().getFullYear();
    let h = '';
    h += '<section class="inst-sectie" id="off-aannemer"><div class="sectie-kop"><h3>Aannemer</h3><span class="rechts">vaste instelling, geldt voor elke offerte</span></div><div class="velden">' +
      offV({ id: 'a-naam', label: 'Handelsnaam', pad: 'inst/aannemer/naam', waarde: A.naam }) +
      offV({ id: 'a-rechtsvorm', label: 'Rechtsvorm', pad: 'inst/aannemer/rechtsvorm', type: 'select', waarde: A.rechtsvorm, keuzes: [['', 'Kies…']].concat(OFF.RECHTSVORMEN.map((x) => [x, x])) }) +
      offV({ id: 'a-adres', label: 'Adres (straat, nummer, postcode, gemeente)', pad: 'inst/aannemer/adres', waarde: A.adres, breed: true }) +
      offV({ id: 'a-ondernemingsnummer', label: 'Ondernemingsnummer', pad: 'inst/aannemer/ondernemingsnummer', waarde: A.ondernemingsnummer, placeholder: '0xxx.xxx.xxx' }) +
      offV({ id: 'a-btw', label: 'Btw-nummer', pad: 'inst/aannemer/btw', waarde: A.btw, placeholder: 'BE 0xxx.xxx.xxx' }) +
      offV({ id: 'a-rpr', label: 'RPR (rechtbank van de zetel)', pad: 'inst/aannemer/rpr', waarde: A.rpr, placeholder: 'RPR Antwerpen, afdeling Mechelen' }) +
      offV({ id: 'a-iban', label: 'IBAN', pad: 'inst/aannemer/iban', waarde: A.iban, placeholder: 'BE68 5390 0754 7034' }) +
      offV({ id: 'a-telefoon', label: 'Telefoon', pad: 'inst/aannemer/telefoon', waarde: A.telefoon, type: 'tel' }) +
      offV({ id: 'a-email', label: 'E-mail', pad: 'inst/aannemer/email', waarde: A.email, type: 'email' }) +
      offV({ id: 'a-website', label: 'Website', pad: 'inst/aannemer/website', waarde: A.website }) +
      offV({ id: 'a-logo', label: 'Logo (pad onder assets/)', pad: 'inst/aannemer/logo', waarde: A.logo, placeholder: 'assets/logo.png' }) +
      '</div><div class="off-groep"><h4>Verzekeringen</h4><div class="velden">' +
      offV({ id: 'a-baVerzekeraar', label: 'Verzekeraar BA uitbating', pad: 'inst/aannemer/baVerzekeraar', waarde: A.baVerzekeraar }) +
      offV({ id: 'a-baPolis', label: 'Polisnummer BA uitbating', pad: 'inst/aannemer/baPolis', waarde: A.baPolis }) +
      offV({ id: 'a-tienjarigeVerzekeraar', label: 'Verzekeraar tienjarige aansprakelijkheid', pad: 'inst/aannemer/tienjarigeVerzekeraar', waarde: A.tienjarigeVerzekeraar, hint: 'alleen bij architect' }) +
      offV({ id: 'a-tienjarigeOndernemingsnummer', label: 'Ondernemingsnummer verzekeraar tienjarige', pad: 'inst/aannemer/tienjarigeOndernemingsnummer', waarde: A.tienjarigeOndernemingsnummer }) +
      offV({ id: 'a-tienjarigePolis', label: 'Polisnummer tienjarige', pad: 'inst/aannemer/tienjarigePolis', waarde: A.tienjarigePolis }) +
      '</div></div></section>';
    h += '<section class="inst-sectie" id="off-klant"><div class="sectie-kop"><h3>Klant en werf</h3><span class="rechts">bewaard bij deze berekening</span></div><div class="velden">' +
      offV({ id: 'k-type', label: 'Klanttype', pad: 'off/klant/type', type: 'select', waarde: kl.type, keuzes: [['particulier', 'Particulier'], ['onderneming', 'Onderneming: volgende versie', true]] }) +
      offV({ id: 'k-naam', label: 'Naam klant', pad: 'off/klant/naam', waarde: kl.naam, placeholder: 'Voornaam en naam, of Mevrouw en Mijnheer …' }) +
      offV({ id: 'k-straat', label: 'Straat en nummer', pad: 'off/klant/straat', waarde: kl.straat }) +
      offV({ id: 'k-gemeente', label: 'Postcode en gemeente', pad: 'off/klant/gemeente', waarde: kl.gemeente }) +
      offV({ id: 'k-email', label: 'E-mail klant', pad: 'off/klant/email', waarde: kl.email, type: 'email', hint: 'nodig voor de herroeping' }) +
      offV({ id: 'k-telefoon', label: 'Telefoon klant', pad: 'off/klant/telefoon', waarde: kl.telefoon, type: 'tel' }) +
      offV({ id: 'w-adres', label: 'Werfadres', pad: 'off/werf/adres', waarde: o.werf.adres, breed: true }) +
      '<div class="veld veld--breed off-vinken">' + offVink({ id: 'w-gelijk', label: 'Werfadres = klantadres', pad: 'off/werf/gelijk', waarde: !!k.werf.gelijk }) + '</div>' +
      (btw6 ? offV({ id: 'w-jaar', label: 'Jaar eerste ingebruikname van de woning', pad: 'off/woning/jaar', waarde: w.jaar, inputmode: 'numeric', placeholder: String(jaarNu - 30), hint: 'btw 6 %: ten minste 10 jaar' }) +
        '<div class="veld off-vinken">' + offVink({ id: 'w-prive', label: 'Woning voor meer dan 50 % privé bewoond', pad: 'off/woning/prive', waarde: !!w.prive }) + offVink({ id: 'w-eindverbruiker', label: 'Gefactureerd aan de bewoner (eigenaar, huurder of vruchtgebruiker)', pad: 'off/woning/eindverbruiker', waarde: !!w.eindverbruiker }) + '</div>' : '') +
      '</div><div class="off-groep"><h4>Offerte</h4><div class="velden">' +
      offV({ id: 'o-nummer', label: 'Nummer', pad: 'off/offerte/nummer', waarde: offNummerStraks(k), readonly: true, placeholder: S.voorbeeld ? 'Voorbeeld: geen nummer' : 'Volgt bij de uitgifte' }) +
      offV({ id: 'o-datum', label: 'Datum', pad: 'off/offerte/datum', waarde: o.kop.datum, type: 'date' }) +
      offV({ id: 'o-geldigTot', label: 'Geldig tot', pad: 'off/offerte/geldigTot', waarde: o.kop.geldigTot, type: 'date' }) +
      offV({ id: 'o-aard', label: 'Aard van de opdracht', pad: 'off/offerte/aard', type: 'select', waarde: ko.aard || 'gepland', keuzes: [['gepland', 'Geplande werken'], ['dringend', 'Dringende herstelling op uitdrukkelijk verzoek van de klant']] }) +
      offV({ id: 'o-titel', label: 'Titel', pad: 'off/offerte/titel', waarde: o.kop.titel, breed: true }) +
      offV({ id: 'o-omschrijving', label: 'Omschrijving van de werken', pad: 'off/offerte/omschrijving', waarde: o.kop.omschrijving, type: 'tekstvak', breed: true, rows: 3 }) +
      offV({ id: 'o-aannemers', label: 'Aantal aannemers op de werf (ook onderaannemers en aannemers van de klant)', pad: 'off/offerte/aannemers', waarde: o.vlaggen.aannemers, type: 'number', min: 1, inputmode: 'numeric' }) +
      '<div class="veld off-vinken">' + offVink({ id: 'o-architect', label: 'Architect wettelijk verplicht voor deze werken', pad: 'off/offerte/architect', waarde: o.vlaggen.architect }) +
      offVink({ id: 'o-premiewerk', label: 'Premiewerk (Mijn VerbouwPremie)', pad: 'off/offerte/premiewerk', waarde: o.vlaggen.premiewerk }) + '</div>' +
      '</div></div></section>';
    h += '<section class="inst-sectie" id="off-posten"><div class="sectie-kop"><h3>Posten</h3><span class="rechts">' + o.lijnen.length + ' regels · ' + OFF.eur(o.totalen.excl) + ' excl. btw</span></div>' +
      '<p class="klein">De berekening blijft de bron van hoeveelheid en prijs. Pas de omschrijving aan, kies VH of FH, zet een keuzepost in optie.</p>' +
      '<div class="off-vinken" style="margin-top:8px">' + offVink({ id: 'o-opgemeten', label: 'Hoeveelheden opgemeten ter plaatse', pad: 'off/offerte/opgemeten', waarde: o.vlaggen.opgemeten, hint: o.vlaggen.opgemeten ? 'elke regel staat op FH (vaste prijs)' : 'uit: de m²-, lm- en st-regels staan op VH (verrekening na opmeting)' }) +
      (o.vlaggen.opgemeten ? '<div class="velden" style="margin:4px 0 8px 24px">' + offV({ id: 'o-opgemetenOp', label: 'Opgemeten op', pad: 'off/offerte/opgemetenOp', waarde: ko.opgemetenOp, type: 'date' }) + '</div>' : '') +
      offVink({ id: 'o-alleenHoofdstukken', label: 'Toon alleen hoofdstuktotalen', pad: 'off/offerte/alleenHoofdstukken', waarde: o.vlaggen.alleenHoofdstukken, hint: 'de regels zonder prijs, per hoofdstuk één subtotaal' }) + '</div>';
    h += '<div class="off-regels">';
    for (const hs of o.hoofdstukken) { h += '<div class="hs"><span class="inkt">' + hs.nr + ' ' + esc(hs.naam) + '</span><span>' + OFF.eur(hs.subtotaal) + '</span></div>'; for (const l of hs.regels) h += offRegelHtml(l, false); }
    if (o.opties.length) { h += '<div class="hs"><span class="inkt">Opties (buiten het totaal)</span></div>'; for (const l of o.opties) h += offRegelHtml(l, true); }
    h += '</div>';
    if (o.afronding && Math.abs(o.afronding.bedrag) >= 0.005) h += '<p class="klein off-afronding">Afrondingsverschil opgevangen in post ' + esc(o.afronding.nr) + ': ' + (o.afronding.bedrag >= 0 ? '+ ' : '− ') + OFF.eur(Math.abs(o.afronding.bedrag)) + (o.afronding.rest ? ' · restverschil ' + OFF.eur(Math.abs(o.afronding.rest)) + ' blijft intern' : '') + '. Staat niet op de offerte.</p>';
    h += '</section>';
    const s = o.totalen.schijven;
    h += '<section class="inst-sectie" id="off-uitvoering"><div class="sectie-kop"><h3>Uitvoering en betaling</h3></div><div class="velden">' +
      offV({ id: 'u-start', label: 'Aanvang (week/jaar of datum)', pad: 'off/uitvoering/start', waarde: o.uitvoering.start, placeholder: 'week 46/' + jaarNu + ' of ' + jaarNu + '-11-09' }) +
      offV({ id: 'u-werkdagen', label: 'Uitvoeringstermijn', pad: 'off/uitvoering/werkdagen', waarde: o.uitvoering.werkdagen, type: 'number', min: 1, eenheid: 'werkdagen', hint: 'startwaarde ' + o.kop.werkdagenStart + ' = werkdagen + reserve' }) +
      '<div class="veld veld--breed off-vinken">' + offVink({ id: 'o-thuis', label: 'Ondertekend bij de klant thuis', pad: 'off/offerte/thuis', waarde: o.vlaggen.thuis, hint: 'ook op de werf: dan geldt het herroepingsrecht van 14 dagen; de offerte krijgt het blok Herroepingsrecht en het herroepingsformulier als bijlage' }) + '</div>' +
      '</div><div class="off-groep"><h4>Betalingsschema voor deze offerte</h4><div class="velden">' +
      offV({ id: 'b-p1', label: 'Bij ondertekening', pad: 'off/betaling/p1', waarde: s[0].p, type: 'number', min: 0, eenheid: '%', hint: OFF.eur(s[0].bedrag) + (s[0].p > 30 ? ' · Embuild: 25 tot 30 % is de norm; hoger alleen als u het materiaal vooraf betaalt.' : '') }) +
      offV({ id: 'b-p2', label: 'Bij de aanvang van de werken', pad: 'off/betaling/p2', waarde: s[1].p, type: 'number', min: 0, eenheid: '%', hint: OFF.eur(s[1].bedrag) }) +
      offV({ id: 'b-p3', label: 'Na de oplevering', pad: 'off/betaling/p3', waarde: s[2].p, type: 'number', min: 0, eenheid: '%', hint: OFF.eur(s[2].bedrag) }) +
      '</div><button class="link" type="button" data-off-standaard style="margin-top:8px">Dit schema als vaste instelling bewaren</button></div>' +
      '<div class="off-groep"><h4>Vaste instellingen</h4><div class="velden">' +
      offV({ id: 'i-geldigheidDagen', label: 'Geldigheid van een offerte', pad: 'inst/geldigheidDagen', waarde: io.geldigheidDagen, type: 'number', min: 1, eenheid: 'dagen', vast: true }) +
      offV({ id: 'i-regietarief', label: 'Regietarief meerwerken', pad: 'inst/regietarief', waarde: io.regietarief, type: 'number', min: 1, eenheid: '€/u excl. btw', vast: true }) +
      offV({ id: 'i-betaaltermijn', label: 'Betaaltermijn facturen', pad: 'inst/betaaltermijn', waarde: io.betaaltermijn, type: 'number', min: 1, eenheid: 'dagen', vast: true }) +
      offV({ id: 'i-verbreking', label: 'Verbrekingsvergoeding (hoogstens ' + (io.verbrekingMax || 15) + ' %)', pad: 'inst/verbreking', waarde: io.verbreking, type: 'number', min: 0, eenheid: '%', vast: true }) +
      offV({ id: 'i-volgnummer', label: 'Laatst gebruikte volgnummer (' + (io.volgnummerJaar || jaarNu) + ')', pad: 'inst/volgnummer', waarde: io.volgnummer || 0, readonly: true, vast: true }) +
      '</div></div></section>';
    h += '<section class="inst-sectie" id="off-tekst"><div class="sectie-kop"><h3>Tekst</h3></div>' +
      '<div class="off-groep" style="margin-top:0"><h4>Inbegrepen</h4>' + offLijst('inbegrepen', o.teksten.inbegrepen) + '</div>' +
      '<div class="off-groep"><h4>Opmerkingen en uitsluitingen</h4>' + offLijst('uitsluitingen', o.teksten.uitsluitingenLijst) + '</div>' +
      '<div class="off-groep"><h4>Eigen opmerking</h4>' + offV({ id: 't-opmerking', label: 'Komt als laatste punt onder Opmerkingen en uitsluitingen', pad: 'off/teksten/opmerking', waarde: k.teksten.opmerking, type: 'tekstvak', rows: 2 }) + '</div>' +
      '<div class="off-groep"><h4>Vaste uitsluitingen <span class="off-vast">vaste instelling · aan voor het vak ' + esc(o.r.vak) + '</span></h4><div class="off-vinken">' + io.uitsluitingen.map((u, i) => offVink({ id: 'i-uit-' + i, label: u.tekst, pad: 'inst/uitsluitingen/' + i + '/aan', waarde: u.aan !== false, hint: u.vakken && u.vakken.includes('*') ? 'alle vakken' : (u.vakken || []).join(', ') })).join('') + '</div></div>' +
      '<div class="off-groep"><h4>Algemene voorwaarden <span class="off-vast">vaste instelling · {Aannemer}, {verbreking}, {e-mail} en {meerwerken} worden ingevuld</span></h4>' + offV({ id: 'v-voorwaarden', label: '14 artikelen, elke zin hoogstens 25 woorden', pad: 'inst/voorwaarden', waarde: io.voorwaarden, type: 'tekstvak', lang: true, rows: 18 }) +
      (o.toetsing.length ? '<div class="foutregel" style="margin-top:8px">' + o.toetsing.map((f) => '<p>' + esc(f) + '</p>').join('') + '</div>' : '<p class="klein" style="margin-top:8px">Toetsing: in orde.</p>') +
      '<button class="link" type="button" data-off-voorwaarden-terug style="margin-top:8px">Terug naar de startversie</button></div></section>';
    $('off-velden').innerHTML = h;
  }
  function tekenOfferte(volledig) {
    if (!body.classList.contains('offerte-open')) return;
    const k = S.offerte;
    const uit = k && k.status === 'uitgegeven' && k.uitgegeven;
    $('off-nieuw').hidden = !uit;
    $('off-form').hidden = !!uit;
    body.classList.toggle('off-bevroren', !!uit);
    if (uit) {
      $('off-titel').textContent = 'Offerte ' + k.uitgegeven.nummer;
      $('off-staat').textContent = 'Uitgegeven op ' + OFF.datumVoluit(k.uitgegeven.uitgegevenOp) + ' · ' + OFF.eur(k.uitgegeven.totaalIncl) + ' incl. btw · bevroren';
      $('off-nog').textContent = ''; $('off-nog-lijst').hidden = true;
      $('off-print').disabled = false; $('off-print').innerHTML = ic('print') + 'Afdrukken';
      $('off-doc').innerHTML = k.uitgegeven.html;
      body.classList.add('offseg-document');
      zetPageCss(k.uitgegeven.aannemer);
      offZoom();
      return;
    }
    const o = offerteModel();
    laatsteO = o;
    if (!o) { $('off-doc').innerHTML = '<p class="doc-leeg">Geen berekening.</p>'; $('off-velden').innerHTML = ''; $('off-print').disabled = true; return; }
    const nog = OFF.nogInTeVullen(o, { loopt: S.loopt });
    const straks = offNummerStraks(k);
    $('off-titel').textContent = 'Offerte' + (straks ? ' ' + straks : '');
    $('off-staat').textContent = 'Concept' + (k.versies.length ? ' · wordt versie ' + (k.versies.length + 1) : straks ? '' : ' · nummer bij de uitgifte') + (S.voorbeeld ? ' · voorbeeld, wordt niet bewaard' : '');
    $('off-nog').textContent = nog.length ? 'Nog in te vullen: ' + nog.length : 'Alles ingevuld';
    $('off-nog').classList.toggle('is-klaar', !nog.length);
    $('off-nog-lijst').hidden = !nog.length;
    $('off-nog-lijst').innerHTML = '<b>Nog in te vullen</b>' + nog.map((x) => '<button type="button" data-off-naar="' + esc(x.veld) + '">' + esc(x.tekst) + '</button>').join('');
    $('off-print').disabled = !!nog.length; $('off-print').innerHTML = ic('print') + 'Offerte afdrukken';
    if (volledig) tekenOfferteForm(o);
    /* Vóór de uitgifte draagt het document geen nummer maar "Concept". */
    $('off-doc').innerHTML = offerteDocHtml(o, '');
    zetPageCss(o.aannemer);
    offZoom();
  }
  /* Eén waarde zetten op een pad "inst/aannemer/naam" of "off/klant/naam"; geeft de wortel terug. */
  function offZet(pad, waarde) {
    const delen = pad.split('/');
    const wortel = delen.shift();
    let obj = wortel === 'inst' ? inst.offerte : S.offerte;
    if (!obj) return '';
    if (wortel === 'inst' && delen[0] === 'uitsluitingen' && !Array.isArray(inst.offerte.uitsluitingen)) inst.offerte.uitsluitingen = OFF.vulInstellingen(inst.offerte, tarieven.uurtarief).uitsluitingen;
    if (wortel === 'off' && delen[0] === 'teksten' && (delen[1] === 'inbegrepen' || delen[1] === 'uitsluitingen') && !Array.isArray(S.offerte.teksten[delen[1]]) && laatsteO) S.offerte.teksten[delen[1]] = (delen[1] === 'inbegrepen' ? laatsteO.teksten.inbegrepen : laatsteO.teksten.uitsluitingenLijst).slice();
    while (delen.length > 1) { const k = delen.shift(); if (obj[k] == null || typeof obj[k] !== 'object') obj[k] = /^\d+$/.test(delen[0]) ? [] : {}; obj = obj[k]; }
    obj[delen[0]] = waarde;
    return wortel;
  }
  let offOpslaanTimer = null;
  function offBewaar(wortel) {
    if (wortel === 'inst') bewaarInstellingen();
    else { S.bewaard = false; clearTimeout(offOpslaanTimer); offOpslaanTimer = setTimeout(() => opslaan(true), 800); }
  }
  function offWaarde(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'number') return el.value === '' ? '' : leesGetal(el.value);
    return el.value;
  }
  let offUitgifteBezig = false;
  async function offerteUitgeven() {
    const k = S.offerte;
    if (!k || offUitgifteBezig) return;
    if (k.status === 'uitgegeven' && k.uitgegeven) { offPrint(k.uitgegeven.nummer, k.uitgegeven.klant && k.uitgegeven.klant.naam); return; }
    const o = offerteModel();
    if (!o) return;
    const nog = OFF.nogInTeVullen(o, { loopt: S.loopt });
    if (nog.length) { tekenOfferte(true); return; }
    offUitgifteBezig = true;
    $('off-print').disabled = true;
    try {
      /* Het nummer pas nu: het voorbeeld verbruikt er geen (het wordt niet bewaard) en draagt "Voorbeeld". */
      if (!k.offerte.nummer && !S.voorbeeld) {
        const nr = await offNieuwNummer();
        if (!nr) { toast('Niet uitgegeven: geen server'); return; }
        k.offerte.nummer = nr;
      }
      const versie = k.versies.length + 1;
      const nummer = (S.voorbeeld && !k.offerte.nummer ? 'Voorbeeld' : k.offerte.nummer) + (versie > 1 ? '-v' + versie : '');
      k.uitgegeven = { datum: o.kop.datum, geldigTot: o.kop.geldigTot, nummer, versie, totaalExcl: o.totalen.excl, btwTarief: o.totalen.btwTarief, btw: o.totalen.btw, totaalIncl: o.totalen.incl, klant: kopie(o.klant), aannemer: kopie(o.aannemer), uitgegevenOp: new Date().toISOString(), html: offerteDocHtml(o, nummer) };
      k.status = 'uitgegeven';
      if (!S.voorbeeld) await opslaan(true);
      tekenOfferte(true);
      tekenKnoppen();
      offPrint(nummer, o.klant.naam);
    } finally {
      offUitgifteBezig = false;
      if (!(k.status === 'uitgegeven' && k.uitgegeven)) tekenOfferte(false);
    }
  }
  function offPrint(nummer, klant) {
    const oud = document.title;
    document.title = 'Offerte ' + nummer + (klant ? ' ' + klant : '');
    const terug = () => { document.title = oud; window.removeEventListener('afterprint', terug); };
    window.addEventListener('afterprint', terug);
    setTimeout(terug, 3000);
    window.print();
  }
  function offNieuweVersie() {
    const k = S.offerte;
    if (!k || !k.uitgegeven) return;
    k.versies.push(k.uitgegeven);
    k.uitgegeven = null; k.status = 'concept';
    k.offerte.datum = OFF.isoDag(new Date()); k.offerte.geldigTot = '';
    body.classList.remove('offseg-document');
    tekenOfferte(true); tekenKnoppen();
    if (!S.voorbeeld) opslaan(true);
  }
  $('off-velden').addEventListener('input', (e) => {
    const el = e.target, pad = el.getAttribute('data-pad');
    if (!pad) return;
    const wortel = offZet(pad, offWaarde(el));
    if (pad === 'inst/aannemer/ondernemingsnummer') { const b = $('off-a-btw'); if (b && !b.value.trim()) { b.value = 'BE ' + el.value.trim(); offZet('inst/aannemer/btw', b.value); } }
    if (pad === 'off/offerte/datum') { const g = $('off-o-geldigTot'); const nieuw = OFF.plusDagen(el.value, Number(OFF.vulInstellingen(inst.offerte, tarieven.uurtarief).geldigheidDagen) || 30); if (g && nieuw) { g.value = nieuw; offZet('off/offerte/geldigTot', nieuw); } }
    if ((pad === 'off/klant/straat' || pad === 'off/klant/gemeente') && S.offerte.werf.gelijk) { const w = $('off-w-adres'); const adres = [S.offerte.klant.straat, S.offerte.klant.gemeente].filter(Boolean).join(', '); if (w) w.value = adres; offZet('off/werf/adres', adres); }
    const volledig = el.type === 'checkbox' || el.tagName === 'SELECT';
    if (volledig && pad === 'off/werf/gelijk' && el.checked) offZet('off/werf/adres', [S.offerte.klant.straat, S.offerte.klant.gemeente].filter(Boolean).join(', '));
    tekenOfferte(volledig);
    offBewaar(wortel);
  });
  $('off-velden').addEventListener('click', (e) => {
    const k = e.target.closest('button');
    if (!k) return;
    const d = k.dataset;
    if (d.offLijstWeg != null) { const [naam, i] = d.offLijstWeg.split(':'); offZet('off/teksten/' + naam + '/' + i, ''); S.offerte.teksten[naam].splice(Number(i), 1); tekenOfferte(true); offBewaar('off'); return; }
    if (d.offLijstPlus != null) { const naam = d.offLijstPlus; offZet('off/teksten/' + naam + '/0', S.offerte.teksten[naam] && S.offerte.teksten[naam][0] != null ? S.offerte.teksten[naam][0] : ''); S.offerte.teksten[naam].push(''); tekenOfferte(true); const velden = document.querySelectorAll('[data-lijst=' + naam + '] input'); if (velden.length) velden[velden.length - 1].focus(); return; }
    if (k.hasAttribute('data-off-standaard')) { const s = laatsteO ? laatsteO.totalen.schijven : null; if (s) { offZet('inst/betaling/p1', s[0].p); offZet('inst/betaling/p2', s[1].p); offZet('inst/betaling/p3', s[2].p); bewaarInstellingen(); toast('Schema bewaard'); } return; }
    if (k.hasAttribute('data-off-voorwaarden-terug')) { offZet('inst/voorwaarden', ''); bewaarInstellingen(); tekenOfferte(true); return; }
  });
  $('off-stappen').addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    document.querySelectorAll('#off-stappen a').forEach((x) => x.classList.toggle('is-actief', x === a));
    const doel = document.querySelector(a.getAttribute('href'));
    if (doel) doel.scrollIntoView({ block: 'start' });
  });
  $('off-print').addEventListener('click', () => offerteUitgeven());
  $('off-nieuw').addEventListener('click', () => offNieuweVersie());
  $('off-nog-lijst').addEventListener('click', (e) => {
    const k = e.target.closest('[data-off-naar]'); if (!k) return;
    const el = $('off-' + k.getAttribute('data-off-naar'));
    if (!el) return;
    body.classList.remove('offseg-document');
    el.scrollIntoView({ block: 'center' }); el.focus();
  });
  $('offerte').addEventListener('click', () => openOfferte(true));

  /* ---------- events ---------- */
  $('bereken').addEventListener('click', () => { if (S.loopt) { if (ctl) ctl.abort(); } else start(null); });
  $('stop').addEventListener('click', () => { if (ctl && S.loopt) ctl.abort(); });
  $('wijzig').addEventListener('click', () => { kaartDicht(false); $('klus').focus(); });
  $('adres').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!S.loopt) start(null); } });
  /* Enter in het klusveld maakt een nieuwe regel (een klus per regel typen); Ctrl+Enter of Cmd+Enter berekent. */
  $('klus').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!S.loopt) start(null); } });
  $('klus').addEventListener('input', () => { $('klus-fout').hidden = true; pasKlusHoogte(); });
  /* Verder vragen: Enter verstuurt, Shift+Enter maakt een nieuwe regel; tijdens het antwoord is de knop Stop. */
  $('vervolg').addEventListener('submit', (e) => { e.preventDefault(); if (S.loopt && S.fase === 'vervolg') { if (ctl) ctl.abort(); return; } vervolg($('vraag').value); });
  $('vraag').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!S.loopt) vervolg($('vraag').value); } });
  $('vraag').addEventListener('input', () => { pasVraagHoogte(); $('vraag-stuur').disabled = !(S.loopt && S.fase === 'vervolg') && !$('vraag').value.trim(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (S.loopt && ctl) ctl.abort(); $('menu').hidden = true; } });
  $('herbereken').addEventListener('click', () => {
    if (S.loopt || !S.m || !S.m.kenmerken) return;
    /* Vast = wat de gebruiker aanpaste plus wat uit de klus, de meting, de standaarden of een vorige vaste waarde komt.
       Berekende kenmerken (dakvlak, goten, stelling …) worden opnieuw afgeleid; anders volgt de prijs een aangepaste maat niet. */
    const vast = {};
    for (const [k, x] of Object.entries(S.m.kenmerken)) {
      const geldig = x.waarde !== '' && x.waarde != null && !Number.isNaN(x.waarde);
      if (geldig && (k in S.gewijzigd || ['beschrijving', 'gemeten', 'standaard', 'vast'].includes(x.bron))) vast[k] = { label: x.label, eenheid: x.eenheid, waarde: x.waarde };
    }
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
    x.waarde = x.tekst ? e.target.value : (e.target.value.trim() === '' ? '' : leesGetal(e.target.value));
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
    const s = RP.STANDAARDEN.find((x) => x.k === k);
    const veld = e.target.closest('.veld'), c = veld.querySelector('.chip');
    /* Een getalveld neemt alleen een getal van 0 of meer aan (leeg = de startwaarde); letters worden niet bewaard en het veld kleurt rood. */
    const ok = s.tekst || e.target.value.trim() === '' || (Number.isFinite(leesGetal(e.target.value)) && leesGetal(e.target.value) >= 0);
    veld.querySelector('.in').classList.toggle('is-fout', !ok);
    if (!ok) return;
    inst.standaarden[k] = e.target.value.trim();
    standaarden = RP.standaardWaarden(inst.standaarden);
    bewaarInstellingen();
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
  /* Na de wissel (Tab) staat de focus al op het volgende veld; de lijst wordt daarna hertekend en de focus blijft daar. */
  $('posten').addEventListener('change', () => setTimeout(tekenPosten, 0));
  $('inst-lijst').addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    document.querySelectorAll('#inst-lijst a').forEach((x) => x.classList.toggle('is-actief', x === a));
    const doel = document.querySelector(a.getAttribute('href'));
    if (doel) doel.scrollIntoView({ block: 'start' });
  });
  $('opslaan').addEventListener('click', () => opslaan(false));
  $('rail-zoek-veld').addEventListener('input', (e) => { railZoek = e.target.value; tekenRail(); });
  $('naar-laatste').addEventListener('click', () => { naarOnder(); $('naar-laatste').hidden = true; });
  $('versie-terug').addEventListener('click', (e) => bekijkVersie(Number(e.currentTarget.getAttribute('data-bekijk'))));
  $('versie-herstel').addEventListener('click', () => herstelVersie());
  $('versie-weg').addEventListener('click', () => bekijkWeg());
  $('banner-opnieuw').addEventListener('click', async () => {
    if (await serverLeeft()) {
      /* Na een lading zonder server eerst de instellingen van de aannemer lezen, dan pas rekenen. */
      if (zonderServer && !(await serverTerug())) { toast('Server antwoordt nog niet'); return; }
      $('banner').hidden = true;
      if (S.fase === 'fout') start(null);
      return;
    }
    toast('Server antwoordt nog niet');
  });

  /* Eén luisteraar voor alle knoppen met een data-attribuut. */
  document.addEventListener('click', async (e) => {
    const k = e.target.closest('button, a, [data-chip-weg]');
    if (!k) { if (!e.target.closest('#menu')) $('menu').hidden = true; return; }
    const d = k.dataset;
    if (d.vervolg != null) { vervolg(d.vervolg); return; }
    if (d.toepassenBeurt != null) { toepassenBeurt(Number(d.toepassenBeurt)); return; }
    if (k.hasAttribute('data-rail')) { body.classList.toggle(smal.matches ? 'lade' : 'rail-open'); return; }
    if (k.hasAttribute('data-nieuw')) { nieuw(); return; }
    if (k.hasAttribute('data-voorbeeld') && !k.hasAttribute('data-voorbeeld-chip')) { laadVoorbeeld(); return; }
    if (d.instellingen) { openOfferte(false); openInstellingen(d.instellingen === 'open'); if (d.instDoel && $(d.instDoel)) $(d.instDoel).scrollIntoView(); return; }
    if (d.offerte) { openOfferte(d.offerte === 'open'); return; }
    if (d.offseg) { body.classList.toggle('offseg-document', d.offseg === 'document'); if (d.offseg === 'document') { window.scrollTo(0, 0); offZoom(); } return; }
    if (d.tabKnop) { zetTab(d.tabKnop); return; }
    if (d.tabNaar) { zetTab(d.tabNaar); zetSeg(true); return; }
    if (d.seg) { zetSeg(d.seg === 'resultaat'); if (d.seg === 'resultaat') window.scrollTo(0, 0); return; }
    if (k.hasAttribute('data-menu')) { const m = $('menu'); m.hidden = !m.hidden; tekenKnoppen(); return; }
    if (d.menuActie) {
      $('menu').hidden = true;
      if (d.menuActie === 'opslaan') opslaan(false); else if (d.menuActie === 'kopieer') kopieer('alles'); else if (d.menuActie === 'print') window.print(); else if (d.menuActie === 'offerte') openOfferte(true); else if (d.menuActie === 'verwijder' && S.id) verwijder(S.id);
      return;
    }
    if (d.laad) { laden(d.laad); body.classList.remove('lade'); return; }
    if (d.verwijder) { verwijder(d.verwijder); return; }
    if (d.chipWeg != null) { e.stopPropagation(); e.preventDefault(); const weg = opslag.lees('richtprijs-chips-weg', []); weg.push(Number(d.chipWeg)); opslag.schrijf('richtprijs-chips-weg', weg); tekenVoorbeelden(); return; }
    if (d.voorbeeldChip != null) { const v = VOORBEELDEN[Number(d.voorbeeldChip)]; $('adres').value = ''; $('klus').value = v.klus; pasKlusHoogte(); $('klus-fout').hidden = true; $('klus').focus(); $('klus').setSelectionRange(v.klus.length, v.klus.length); return; }
    if (k.hasAttribute('data-trail-toggle')) { S.trailDicht = !S.trailDicht; tekenTrail(); return; }
    if (k.hasAttribute('data-adres-aanpassen')) { kaartDicht(false); zetSeg(false); $('adres').focus(); return; }
    if (k.hasAttribute('data-uitleg-opnieuw')) { uitlegOpnieuw(); return; }
    if (d.kopieer) { kopieer(d.kopieer); return; }
    if (k.hasAttribute('data-print')) { window.print(); return; }
    if (d.naar) { e.preventDefault(); zetSeg(false); const doel = $(d.naar); if (doel) { doel.hidden = false; doel.scrollIntoView({ block: 'start', behavior: reduceer.matches ? 'auto' : 'smooth' }); } return; }
    if (d.toepassen) {
      const [wat, v] = d.toepassen.split(':');
      if (wat === 'btw') zetBtwBerekening(Number(v)); else zetTarief('ploeg', Number(v));
      return;
    }
    if (d.tariefTerug) {
      if (d.tariefTerug === 'ploeg') { S.ploeg = 0; tariefGewijzigd(); }
      else if (d.tariefTerug === 'btw') { S.btw = 0; if (tarieven.btw !== RP.DATA_START.tarieven.btw) zetTarief('btw', RP.DATA_START.tarieven.btw); else tariefGewijzigd(); }
      else zetTarief(d.tariefTerug, RP.DATA_START.tarieven[d.tariefTerug]);
      tekenTarieven(); /* het veld in de instellingen toont de teruggezette waarde */
      return;
    }
    if (d.rekenpad) { if (S.open.has(d.rekenpad)) S.open.delete(d.rekenpad); else S.open.add(d.rekenpad); tekenWerkblad(laatsteA, skeletLoopt()); return; }
    if (d.fase) { const s = 'fase|' + d.fase; if (S.open.has(s)) S.open.delete(s); else S.open.add(s); k.classList.toggle('is-dicht', S.open.has(s)); k.setAttribute('aria-expanded', !S.open.has(s)); return; }
    if (d.terug) { const o = S.gewijzigd[d.terug]; if (o && S.m && S.m.kenmerken[d.terug]) { S.m.kenmerken[d.terug].waarde = o.waarde; S.m.kenmerken[d.terug].bron = o.bron; } delete S.gewijzigd[d.terug]; teken(); return; }
    if (d.standaardTerug) { delete inst.standaarden[d.standaardTerug]; standaarden = RP.standaardWaarden(inst.standaarden); bewaarInstellingen(); tekenStandaarden(); return; }
    if (d.vak != null) { vakFilter = d.vak; tekenVakken(); tekenPosten(); return; }
    if (k.hasAttribute('data-zoek-wis')) { zoekTekst = ''; $('data-zoek').value = ''; tekenPosten(); return; }
    if (k.hasAttribute('data-rail-zoek-wis')) { railZoek = ''; $('rail-zoek-veld').value = ''; tekenRail(); return; }
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
      else if (t === 'voorbeeld-gesprek') laadVoorbeeldGesprek();
      else if (t === 'offerte-voorbeeld') {
        /* Controlehaakje: het voorbeeld met de aannemergegevens uit de instellingen en een fictieve klant, meteen in de offerteweergave. */
        laadVoorbeeld();
        S.offerte = offMaak();
        Object.assign(S.offerte.klant, { naam: 'Voorbeeldklant', straat: 'Voorbeeldstraat 1', gemeente: '2800 Mechelen', email: 'klant@voorbeeld.be', telefoon: '0470 00 00 00' });
        S.offerte.werf.adres = 'Voorbeeldstraat 1, 2800 Mechelen';
        S.offerte.woning.jaar = '1985';
        S.offerte.uitvoering.start = 'week 46/' + new Date().getFullYear();
        openOfferte(true);
      }
      else if (t === 'offerte') openOfferte(true);
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
    /* Een verse lading begint leeg (de placeholder toont een voorbeeldklus; de chips eronder vullen het veld met één klik).
       Expliciet leegmaken: Chrome zet bij herladen anders de vorige tekst terug, terwijl de staat (S) leeg is. */
    $('adres').value = ''; $('klus').value = '';
    tekenVoorbeelden();
    kaartDicht(false);
    pasKlusHoogte();
    teken(); tekenTrail(); tekenUitleg();
    await laadInstellingen();
    tekenInstellingen();
    teken();
    laadLijst();
    hash();
  })();
})();
