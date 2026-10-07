/* Rekenmotor van Norvo Richtprijs: geen DOM, zodat hij los getest kan worden (test-motor.cjs).
   Laadvolgorde in index.html: data/basis.js, data/<vak>.js, motor.js, ui.js. */
(function (g) {
  /* De datatabel komt uit data/basis.js en data/<vak>.js (globalThis.RP_DATA), geladen vóór dit bestand. */
  const DATA = g.RP_DATA;
  if (!DATA || !DATA.posten) throw new Error('data/basis.js en de vakbestanden moeten vóór motor.js geladen zijn');
  /* Vak per code-voorvoegsel: zo weet de pagina welk m²-label en welke groep bij een post hoort. */
  const VAKKEN = { dak: 'Hellend dak', gevel: 'Gevel', plat: 'Plat dak', binnen: 'Binnen', ramen: 'Ramen en deuren', vloer: 'Vloeren en tegels', alg: 'Algemeen' };
  const vakVan = (code) => VAKKEN[String(code || '').split('.')[0]] || 'Overig';
  const FASES = ['Werfinrichting', 'Afbraak', 'Voorbereiding', 'Ruwbouw', 'Isolatie', 'Dakopbouw', 'Dakbedekking', 'Schrijnwerk', 'Wanden en plafonds', 'Pleisterwerk',
    'Vloeren', 'Tegelwerk', 'Sanitair', 'Elektriciteit', 'Afwerking', 'Schilderwerk', 'Afwatering', 'Buitenaanleg'];

  /* Startwaarden bewaren, zodat eigen cijfers van de aannemer (instellingen.json) teruggezet kunnen worden. */
  const DATA_START = JSON.parse(JSON.stringify(DATA));
  /* Eigen cijfers van de aannemer over de datatabel leggen: { tarieven: {...}, posten: { 'dak.pannen.klei': { uur: 0.28, mat: { 'Kleipan': { prijs: 1.1, per: 21 } } } } }.
     Elke overschreven post krijgt status 'eigen'; een post zonder overschrijving valt terug op de startwaarde. */
  function pasInstellingenToe(over) {
    for (const code of Object.keys(DATA.posten)) {
      const start = DATA_START.posten[code];
      if (!start) continue;
      DATA.posten[code] = JSON.parse(JSON.stringify(start));
    }
    Object.assign(DATA.tarieven, JSON.parse(JSON.stringify(DATA_START.tarieven)));
    if (!over || typeof over !== 'object') return DATA;
    if (over.tarieven && typeof over.tarieven === 'object') for (const [k, v] of Object.entries(over.tarieven)) if (Number.isFinite(Number(v)) && Number(v) >= 0 && k in DATA.tarieven) DATA.tarieven[k] = Number(v);
    for (const [code, o] of Object.entries(over.posten || {})) {
      const p = DATA.posten[code];
      if (!p || !o || typeof o !== 'object') continue;
      let eigen = false;
      if (Number.isFinite(Number(o.uur)) && Number(o.uur) >= 0) { p.uur = Number(o.uur); eigen = true; }
      for (const [naam, mo] of Object.entries(o.mat || {})) {
        const x = p.mat.find((y) => y.naam === naam);
        if (!x || !mo) continue;
        if (Number.isFinite(Number(mo.prijs)) && Number(mo.prijs) >= 0) { x.prijs = Number(mo.prijs); eigen = true; }
        if (Number.isFinite(Number(mo.per)) && Number(mo.per) > 0) { x.per = Number(mo.per); eigen = true; }
      }
      if (eigen) p.status = 'eigen';
    }
    return DATA;
  }

  /* Standaarden van de sector: wat de app aanneemt als de beschrijving en de meting niets zeggen.
     Startwaarden van 6 okt 2026; de gebruiker past ze aan in de pagina en ze blijven bewaard. */
  const STANDAARDEN = [
    { k: 'dakramen_gesloten', label: 'Dakramen bij gesloten bebouwing', eenheid: 'st', std: 1 },
    { k: 'dakramen_halfopen', label: 'Dakramen bij halfopen bebouwing', eenheid: 'st', std: 2 },
    { k: 'dakramen_open', label: 'Dakramen bij open bebouwing', eenheid: 'st', std: 2 },
    { k: 'schouwen', label: 'Schouwen door het dak', eenheid: 'st', std: 1 },
    { k: 'helling', label: 'Dakhelling', eenheid: '°', std: 40 },
    { k: 'kroonlijst', label: 'Kroonlijsthoogte', eenheid: 'm', std: 6 },
    { k: 'isolatie', label: 'Sarking-isolatie PIR', eenheid: 'cm', std: 12 },
    { k: 'afvoeren', label: 'Regenafvoeren', eenheid: 'st', std: 2 },
    { k: 'overstek_goot', label: 'Dakoverstek aan de goot', eenheid: 'm', std: 0.3 },
    { k: 'overstek_gevel', label: 'Dakoverstek aan een vrije gevel', eenheid: 'm', std: 0.2 },
    { k: 'bedekking', label: 'Dakbedekking hellend dak', eenheid: '', std: 'kleipan klein formaat', tekst: true },
    { k: 'gevel_isolatie', label: 'Gevelisolatie EPS', eenheid: 'cm', std: 14 },
    { k: 'gevel_openingen', label: 'Ramen en deuren per gevel', eenheid: 'st', std: 3 },
    { k: 'gevel_opening_omtrek', label: 'Dagkanten per raam of deur', eenheid: 'lm', std: 4.5 },
    { k: 'crepi', label: 'Crepi', eenheid: '', std: 'siliconenharspleister 1,5 mm', tekst: true },
    { k: 'plat_isolatie', label: 'Isolatie plat dak PIR', eenheid: 'cm', std: 12 },
    { k: 'plat_bedekking', label: 'Bedekking plat dak', eenheid: '', std: 'EPDM', tekst: true },
    { k: 'plafondhoogte', label: 'Plafondhoogte binnen', eenheid: 'm', std: 2.6 },
    { k: 'verf_lagen', label: 'Verflagen', eenheid: 'st', std: 2 },
    { k: 'ploeg', label: 'Ploeg', eenheid: 'man', std: 3 },
  ];
  const standaardWaarden = (over) => Object.fromEntries(STANDAARDEN.map((s) => {
    const v = over && over[s.k] != null && over[s.k] !== '' ? over[s.k] : s.std;
    return [s.k, s.tekst ? String(v) : (num(v) >= 0 ? num(v) : s.std)];
  }));
  function standaardRegels(st) {
    return [
      'Bestaande dakramen per woning als de beschrijving er niets over zegt: gesloten bebouwing ' + st.dakramen_gesloten + ', halfopen ' + st.dakramen_halfopen + ', open ' + st.dakramen_open + '. Bestaande dakramen worden op de nieuwe dakopbouw herplaatst (dak.dakraam.herplaatsen); een nieuw dakraam alleen als de beschrijving het vraagt.',
      'Schouwen door het dak: ' + st.schouwen + '.',
      'Dakhelling: ' + st.helling + ' graden. Kroonlijsthoogte: ' + st.kroonlijst + ' m.',
      'Dakoverstek: ' + st.overstek_goot + ' m aan de goot en ' + st.overstek_gevel + ' m aan elke vrije gevel. Dakvlak van een zadeldak = (noklengte + overstek aan elke vrije gevel) x ((overspanning + 2 x overstek aan de goot) / cos helling). Goten, nok en dakranden krijgen dezelfde toeslag. Een meting op het adres is zonder overstek: tel de overstek erbij.',
      'Isolatie bij een dakrenovatie: sarking PIR ' + st.isolatie + ' cm (0 = geen isolatie); kies de post met die dikte (dak.sarking120 = 12 cm, dak.sarking160 = 16 cm).',
      'Goten en regenafvoeren: ' + st.afvoeren + ' afvoeren, elk zo lang als de kroonlijsthoogte; goten voor en achter, elk zo lang als de gevelbreedte plus de overstek. Vervangen alleen als de beschrijving het vraagt; anders alleen losmaken en herbevestigen waar het werk dat nodig maakt.',
      'Dakbedekking hellend dak: ' + st.bedekking + '.',
      'Stelling bij dakwerk: voor- en achtergevel, gevelbreedte maal kroonlijsthoogte. Elke vrije dakrand krijgt randbeveiliging (valbeveiliging, per lm); een stelling aan een vrije zijgevel alleen als de beschrijving werk aan die gevel noemt.',
      'Nok en vrije dakrand worden altijd afgewerkt; elke gemene zijde krijgt een aansluiting op het dak van de buur.',
      'Asbest: een dak, onderdak of leien van vóór 2001 zonder informatie over asbest = aanname "geen asbest" plus een punt voor het plaatsbezoek. Bij asbest de asbestposten gebruiken (hechtgebonden, verpakt afgevoerd); niet-hechtgebonden asbest valt buiten de prijs (erkende verwijderaar) en wordt als aanname gemeld.',
      'Meerdere vakken in één klus (bv. dak en gevel): posten uit elk vak; één stelling per gevel, onder het vak dat eerst begint; de kopregel noemt alle vakken.',
      'Gevel: elke behandelde gevel krijgt een stelling van gevelbreedte maal gevelhoogte; per gevel ' + st.gevel_openingen + ' ramen of deuren met elk ' + st.gevel_opening_omtrek + ' lm dagkant; gevel-m² = bruto gevel min de openingen (1,8 m² per opening).',
      'Gevel bij crepi: isolatie EPS ' + st.gevel_isolatie + ' cm (0 = crepi zonder isolatie), afwerking ' + st.crepi + '; profielen = plint + hoeken + dagkanten; regenafvoeren worden losgemaakt en herplaatst; de plint loopt over de gevelbreedte.',
      'Plat dak: isolatie PIR ' + st.plat_isolatie + ' cm, bedekking ' + st.plat_bedekking + ', dakrandprofiel over de vrije randen, opstand tegen elke aangrenzende muur, 1 afvoer per 50 m².',
      'Binnen: plafondhoogte ' + st.plafondhoogte + ' m; wand-m² = omtrek van de ruimte maal plafondhoogte min deuren en ramen; schilderwerk ' + st.verf_lagen + ' lagen op een grondlaag; nieuwe gyproc wordt altijd geplamuurd vóór het schilderen.',
      'Ploeg: ' + st.ploeg + ' man.',
    ];
  }

  /* De kenmerken van één klus: de AI vult ze in met de bron erbij, de gebruiker past ze aan en rekent opnieuw.
     Per vak een vaste lijst die de AI minstens invult; andere kenmerken mag hij toevoegen. */
  const KENMERKEN = {
    'Hellend dak': 'bebouwing, dakvorm, gevelbreedte_m, diepte_m, helling_graden, kroonlijst_m, dakvlak_m2, noklengte_m, bedekking, isolatie_cm, dakramen_st, schouwen_st, goot_lm, afvoer_lm, gemene_zijde_lm, vrije_dakrand_lm, stelling_m2',
    'Gevel': 'bebouwing, gevels_st, gevelbreedte_m, gevelhoogte_m, gevel_bruto_m2, openingen_st, gevel_netto_m2, dagkanten_lm, profielen_lm, plint_lm, afvoeren_st, isolatie_cm, afwerking, stelling_m2',
    'Plat dak': 'dakvlak_m2, dakrand_lm, opstand_lm, afvoeren_st, koepels_st, isolatie_cm, bedekking, bereikbaarheid',
    'Binnen': 'ruimtes_st, vloer_m2, plafondhoogte_m, wand_m2, plafond_m2, deuren_st, ramen_st, ondergrond, verflagen_st',
    'Ramen en deuren': 'ramen_st, deuren_st, raam_m2_totaal, materiaal, glas, rolluiken_st, verdiepingen_st, bebouwing',
    'Vloeren en tegels': 'ruimtes_st, vloer_m2, ondergrond, chape_cm, tegelformaat, plinten_lm, afbraak_oude_vloer',
    'Algemeen': 'bebouwing, vloer_m2, verdiepingen_st',
  };
  const BRONNEN = ['beschrijving', 'gemeten', 'berekend', 'standaard', 'vast'];
  const kenmerkLabel = (k) => String(k).replace(/_(m2|m|lm|st|cm|graden)$/, '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const kenmerkEenheid = (k) => ({ m2: 'm²', m: 'm', lm: 'lm', st: 'st', cm: 'cm', graden: '°' }[(String(k).match(/_(m2|m|lm|st|cm|graden)$/) || [])[1]] || '');

  const num = (v) => {
    const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  /* Materiaal koop je per heel stuk; lopende meters en vierkante meters per tiende. */
  const omhoog = (x, eenheid) => (eenheid === 'st' ? Math.ceil(x - 1e-9) : Math.ceil(x * 10 - 1e-9) / 10);

  const leegMeetstaat = () => ({ titel: '', dakvlak_m2: 0, ploeg: 0, materieel_per_dag: [], kenmerken: {}, posten: [], aannames: [], plaatsbezoek: [] });

  /* De AI antwoordt met één JSON-object per regel; elke regel die binnenkomt gaat meteen de meetstaat in. */
  function pasRegelToe(m, o) {
    if (!o || typeof o !== 'object') return m;
    if (Array.isArray(o.posten)) {
      pasRegelToe(m, Object.assign({}, o, { t: 'kop', posten: undefined }));
      o.posten.forEach((p) => pasRegelToe(m, Object.assign({}, p, { t: 'post' })));
      (o.aannames || []).forEach((tekst) => pasRegelToe(m, { t: 'aanname', tekst }));
      (o.plaatsbezoek || []).forEach((tekst) => pasRegelToe(m, { t: 'plaatsbezoek', tekst }));
      return m;
    }
    if (o.t === 'kenmerken' && Array.isArray(o.lijst)) {
      if (!m.kenmerken) m.kenmerken = {};
      if (o.vak) m.vak = String(o.vak);
      for (const x of o.lijst) {
        if (!x || !x.k || x.waarde == null || x.waarde === '') continue;
        const k = String(x.k).slice(0, 40);
        const tekst = typeof x.waarde === 'string' && !/^-?\d+([.,]\d+)?$/.test(x.waarde.trim());
        m.kenmerken[k] = { label: String(x.label || kenmerkLabel(k)).slice(0, 60), eenheid: String(x.eenheid || kenmerkEenheid(k)).slice(0, 8),
          waarde: tekst ? String(x.waarde).slice(0, 80) : num(x.waarde), tekst, bron: BRONNEN.includes(x.bron) ? x.bron : 'standaard' };
      }
    } else if (o.t === 'kop') {
      if (o.titel) m.titel = String(o.titel);
      if (o.vak) m.vak = String(o.vak);
      if (Array.isArray(o.vakken)) m.vakken = o.vakken.map(String).slice(0, 7);
      if (num(o.oppervlakte_m2) > 0) m.dakvlak_m2 = num(o.oppervlakte_m2);
      if (o.oppervlakte_naam) m.vlakNaam = String(o.oppervlakte_naam).slice(0, 30);
      if (num(o.dakvlak_m2) > 0) m.dakvlak_m2 = num(o.dakvlak_m2);
      if (num(o.ploeg) > 0) m.ploeg = num(o.ploeg);
      if (Array.isArray(o.materieel_per_dag)) m.materieel_per_dag = o.materieel_per_dag.map(String);
    } else if (o.t === 'post') {
      m.posten.push(o);
    } else if (o.t === 'aanname' && o.tekst) {
      m.aannames.push(String(o.tekst));
    } else if (o.t === 'plaatsbezoek' && o.tekst) {
      m.plaatsbezoek.push(String(o.tekst));
    }
    return m;
  }

  function bereken(m, tar) {
    const t = Object.assign({}, DATA.tarieven, tar || {});
    /* Uurtarief = wat de klant per manuur betaalt (zonder btw); overhead en winst op arbeid zitten erin.
       Marge komt alleen op materiaal en materieel. Mohammed, 6 okt 2026: "arbeidsuren zijn aan 57,5". */
    t.uurtarief = num(t.uurtarief) > 0 ? num(t.uurtarief) : DATA.tarieven.uurtarief;
    const marge = Math.max(0, num(t.materiaalmarge)) / 100;
    const ploeg = Math.max(1, Math.round(num(t.ploeg) || num(m && m.ploeg) || 3));
    const regels = [];
    const overgeslagen = [];
    const lijst = m && Array.isArray(m.posten) ? m.posten : [];
    for (let nr = 0; nr < lijst.length; nr++) {
      const p = lijst[nr];
      if (!p || typeof p !== 'object') continue;
      const q = num(p.hoeveelheid);
      const def = p.code ? DATA.posten[p.code] : null;
      /* Een post zonder leesbare hoeveelheid verdwijnt niet stil: hij staat bij de overgeslagen posten met de reden. */
      if (!(q > 0)) { overgeslagen.push(String(def ? def.naam : (p.naam || p.code || 'post zonder naam')) + ' (hoeveelheid ' + (p.hoeveelheid == null || p.hoeveelheid === '' ? 'ontbreekt' : 'onleesbaar: ' + String(p.hoeveelheid).slice(0, 20)) + ')'); continue; }
      let r;
      if (def) {
        r = { bron: 'data', code: p.code, fase: def.fase, naam: def.naam, eenheid: def.eenheid, hoeveelheid: q,
          uren: q * def.uur,
          afval: (def.afval || (def.afvalKg ? [{ soort: 'rest', kg: def.afvalKg }] : [])).map((a) => ({ soort: DATA.containers[a.soort] ? a.soort : 'rest', kg: q * num(a.kg) })),
          mat: def.mat.map((x) => {
            const aantal = omhoog(q * x.per, x.eenheid);
            return { naam: x.naam, eenheid: x.eenheid, aantal, prijs: x.prijs, kost: aantal * x.prijs, kg: aantal * x.kg, huur: !!x.huur, perWeek: !!x.perWeek, bron: 'data' };
          }) };
      } else if (p.naam && p.uur_per_eenheid != null) {
        const prijs = Math.max(0, num(p.materiaal_eur_per_eenheid));
        const kg = Math.max(0, num(p.kg_per_eenheid));
        const afvalKg = Math.max(0, num(p.afval_kg_per_eenheid));
        const eenheid = String(p.eenheid || 'st');
        r = { bron: 'ai', code: '', fase: String(p.fase || 'Overig'), naam: String(p.naam), eenheid, hoeveelheid: q,
          uren: q * Math.max(0, num(p.uur_per_eenheid)),
          afval: afvalKg > 0 ? [{ soort: DATA.containers[p.afval_soort] ? String(p.afval_soort) : 'rest', kg: q * afvalKg }] : [],
          mat: prijs > 0 || kg > 0 ? [{ naam: 'Materiaal: ' + String(p.naam), eenheid, aantal: q, prijs, kost: q * prijs, kg: q * kg, huur: false, perWeek: false, bron: 'ai' }] : [] };
      } else {
        overgeslagen.push(String(p.code || p.naam || 'post zonder naam'));
        continue;
      }
      /* nr = de plaats van de post in m.posten: een wijziging uit het gesprek wijst er een post mee aan (id p1, p2, …). */
      r.nr = nr;
      r.toelichting = String(p.toelichting || '');
      r.gevraagd = p.gevraagd !== false;
      r.waarom = r.gevraagd ? '' : String(p.waarom || '');
      r.afvalKg = r.afval.reduce((a, x) => a + x.kg, 0);
      r.matKg = r.mat.reduce((a, x) => a + x.kg, 0);
      r.arbeidKost = r.uren * t.uurtarief;
      regels.push(r);
    }
    const som = (f) => regels.reduce((a, r) => a + f(r), 0);
    const uren = som((r) => r.uren);
    const mandagen = uren / t.urenPerDag;
    const werkdagen = regels.length ? Math.max(1, Math.ceil(mandagen / ploeg - 1e-9)) : 0;
    /* Huur per week (stelling): de huur loopt zolang de werf duurt, afgerond op hele weken van 5 werkdagen. */
    const weken = werkdagen ? Math.max(1, Math.ceil(werkdagen / 5 - 1e-9)) : 0;
    for (const r of regels) {
      for (const x of r.mat) if (x.huur && x.perWeek) { x.weken = weken; x.kost = x.aantal * x.prijs * weken; }
      r.matKost = r.mat.filter((x) => !x.huur).reduce((a, x) => a + x.kost, 0);
      r.huurKost = r.mat.filter((x) => x.huur).reduce((a, x) => a + x.kost, 0);
    }
    const matKg = som((r) => r.matKg);
    const afvalKg = som((r) => r.afvalKg);

    /* Afval per soort: elke soort met genoeg kilo's krijgt eigen containers (op gewicht én op volume); een kleine hoeveelheid gaat
       in big bags; heel weinig gaat mee in de werfwagen. Kleine fracties van andere soorten tellen bij 'rest'; asbest gaat altijd apart;
       metaal gaat naar de schroothandel zonder container. */
    const perSoort = {};
    for (const r of regels) for (const a of r.afval) perSoort[a.soort] = (perSoort[a.soort] || 0) + a.kg;
    for (const soort of Object.keys(perSoort)) {
      const c = DATA.containers[soort];
      if (soort !== 'rest' && soort !== 'asbest' && soort !== 'metaal' && perSoort[soort] > 0 && perSoort[soort] < c.los) { perSoort.rest = (perSoort.rest || 0) + perSoort[soort]; delete perSoort[soort]; }
    }
    const afvoer = [];
    let containers = 0;
    for (const soort of Object.keys(DATA.containers)) {
      const kg = perSoort[soort] || 0;
      if (kg <= 0) continue;
      const c = DATA.containers[soort];
      const m3 = c.dichtheid > 0 ? kg / c.dichtheid : 0;
      if (c.prijs === 0 && c.bigbag === 0) {
        afvoer.push({ soort, naam: c.naam, eenheid: 'st', prijs: 0, aantal: 1, kost: 0, kg, m3, bron: 'data', soort2: 'afvoer' });
      } else if (kg < (c.klein || 0)) {
        afvoer.push({ soort, naam: 'Klein restje ' + soort + ' mee in de werfwagen', eenheid: 'st', prijs: 0, aantal: 1, kost: 0, kg, m3, bron: 'data', soort2: 'werfwagen' });
      } else if (kg < c.los && c.bigbag > 0 && m3 <= 1) {
        const n = Math.max(1, Math.ceil(kg / Math.max(1, c.los) - 1e-9));
        afvoer.push({ soort, naam: 'Big bag ' + soort, eenheid: 'st', prijs: c.bigbag, aantal: n, kost: n * c.bigbag, kg, m3, bron: 'data', soort2: 'bigbag' });
      } else if (c.ton > 0) {
        const n = Math.max(Math.ceil(kg / 1000 / c.ton - 1e-9), c.m3 > 0 ? Math.ceil(m3 / c.m3 - 1e-9) : 0, 1);
        containers += n;
        afvoer.push({ soort, naam: c.naam, eenheid: 'st', prijs: c.prijs, aantal: n, kost: n * c.prijs, kg, m3, ton: c.ton, bron: 'data', soort2: 'container' });
      }
    }

    const materialen = [];
    const materieel = [];
    const index = new Map();
    for (const r of regels) for (const x of r.mat) {
      const doel = x.huur ? materieel : materialen;
      const sleutel = (x.huur ? 'h|' : 'm|') + x.naam + '|' + x.eenheid + '|' + x.prijs;
      let rij = index.get(sleutel);
      if (!rij) { rij = { naam: x.naam + (x.perWeek ? ' (' + weken + (weken === 1 ? ' week' : ' weken') + ')' : ''), eenheid: x.eenheid, prijs: x.prijs * (x.perWeek ? weken : 1), aantal: 0, kost: 0, kg: 0, bron: x.bron, soort: x.huur ? 'huur' : 'materiaal' }; index.set(sleutel, rij); doel.push(rij); }
      rij.aantal += x.aantal; rij.kost += x.kost; rij.kg += x.kg;
    }
    for (const code of (m && Array.isArray(m.materieel_per_dag) ? m.materieel_per_dag : [])) {
      const d = DATA.perDag[code];
      if (d && werkdagen && !materieel.some((x) => x.naam === d.naam)) materieel.push({ naam: d.naam, eenheid: werkdagen === 1 ? 'dag' : 'dagen', prijs: d.prijs, aantal: werkdagen, kost: werkdagen * d.prijs, kg: 0, bron: 'data', soort: 'dag' });
    }
    for (const x of afvoer) materieel.push({ naam: x.naam, eenheid: x.eenheid, prijs: x.prijs, aantal: x.aantal, kost: x.kost, kg: 0, bron: 'data', soort: x.soort2, afvalSoort: x.soort, afvalKg: x.kg });

    const arbeid = uren * t.uurtarief;
    const materiaalInkoop = som((r) => r.matKost);
    const materieelInkoop = materieel.reduce((a, x) => a + x.kost, 0);
    const materiaal = materiaalInkoop * (1 + marge);
    const materieelKost = materieelInkoop * (1 + marge);
    const subtotaal = arbeid + materiaal + materieelKost;
    const onvoorzien = subtotaal * Math.max(0, num(t.onvoorzien)) / 100;
    const excl = subtotaal + onvoorzien;
    const btw = excl * t.btw / 100;
    const aiKost = regels.filter((r) => r.bron === 'ai').reduce((a, r) => a + r.arbeidKost + r.matKost * (1 + marge), 0);

    const namen = FASES.concat(regels.map((r) => r.fase).filter((f, i, a) => !FASES.includes(f) && a.indexOf(f) === i));
    const fases = namen.map((naam) => {
      const rs = regels.filter((r) => r.fase === naam);
      const u = rs.reduce((a, r) => a + r.uren, 0);
      return { naam, regels: rs, uren: u, dagen: u / (t.urenPerDag * ploeg) };
    }).filter((f) => f.regels.length);

    const vlak = num(m && m.dakvlak_m2);
    const vakken = [...new Set(regels.filter((r) => r.code).map((r) => vakVan(r.code)))];
    const vak = (m && m.vak) || vakken[0] || 'Overig';
    const vlakNaam = (m && m.vlakNaam) || ({ 'Hellend dak': 'dakvlak', 'Plat dak': 'dakvlak', 'Gevel': 'gevel', 'Binnen': 'vloer', 'Ramen en deuren': 'raam', 'Vloeren en tegels': 'vloer' }[vak] || 'oppervlakte');
    return { t, ploeg, regels, fases, overgeslagen, uren, mandagen, werkdagen, weken, matKg, afvalKg, afvalPerSoort: perSoort, afvoer, containers, materialen, materieel, vak, vakken,
      marge,
      kosten: { arbeid, materiaalInkoop, materiaal, materieelInkoop, materieel: materieelKost, margeBedrag: (materiaal - materiaalInkoop) + (materieelKost - materieelInkoop),
        subtotaal, onvoorzien, excl, btw, incl: excl + btw },
      vlak, vlakNaam, perM2: vlak > 0 ? excl / vlak : 0, aandeelData: subtotaal > 0 ? 1 - aiKost / subtotaal : 1 };
  }

  /* Wat de prijs draagt en wat hem verschuift. Elk bedrag komt uit een herberekening, niet uit een vuistregel. */
  function analyse(m, tar) {
    const r = bereken(m, tar);
    /* Wat een post in de prijs excl. btw kost: arbeid aan het uurtarief, materiaal en materieel met marge, alles met onvoorzien. */
    const fOnv = 1 + Math.max(0, num(r.t.onvoorzien)) / 100;
    const fMat = (1 + r.marge) * fOnv;
    const factor = fMat;
    const inPrijs = (x) => x.arbeidKost * fOnv + (x.matKost + x.huurKost) * fMat;
    const excl = r.kosten.excl;
    const delen = r.regels.map((x) => ({ naam: x.naam, bedrag: inPrijs(x), bron: x.bron, gevraagd: x.gevraagd, waarom: x.waarom }));
    for (const x of r.materieel) if (x.soort !== 'huur') delen.push({ naam: x.naam + ' (' + x.aantal + ' ' + x.eenheid + ')', bedrag: x.kost * fMat, bron: 'data', gevraagd: false, waarom: '' });
    delen.forEach((d) => { d.aandeel = excl > 0 ? d.bedrag / excl : 0; });
    delen.sort((a, b) => b.bedrag - a.bedrag);
    const top = delen.slice(0, 5);
    const rest = delen.slice(5);

    const watAls = [];
    const prijs = (mm, tt) => bereken(mm, tt || tar).kosten.excl;
    if (r.vlak > 0) {
      const mm = kopie(m);
      let n = 0;
      for (const p of mm.posten) {
        const def = DATA.posten[p.code];
        if (def && def.eenheid === 'm²' && Math.abs(num(p.hoeveelheid) - r.vlak) < 0.5) { p.hoeveelheid = num(p.hoeveelheid) + 10; n++; }
      }
      if (n) watAls.push({ label: '10 m² ' + r.vlakNaam + ' meer', verschil: prijs(mm) - excl });
    }
    const keuzes = [];
    for (const naam of new Set(r.regels.filter((x) => x.code && DATA.posten[x.code].keuze).map((x) => x.code))) {
      const mm = kopie(m);
      mm.posten = mm.posten.filter((p) => p.code !== naam);
      keuzes.push({ label: 'Zonder ' + DATA.posten[naam].keuze, verschil: prijs(mm) - excl });
    }
    keuzes.sort((a, b) => a.verschil - b.verschil);
    watAls.push(...keuzes.slice(0, 3));
    for (const d of [-1, 1]) {
      const pl = r.ploeg + d;
      if (pl < 1) continue;
      const rr = bereken(m, Object.assign({}, tar, { ploeg: pl }));
      if (rr.werkdagen !== r.werkdagen) watAls.push({ label: 'Met ' + pl + ' man: ' + rr.werkdagen + ' werkdagen in plaats van ' + r.werkdagen, verschil: rr.kosten.excl - excl });
    }
    for (const x of r.afvoer) {
      if (x.soort2 !== 'container') continue;
      const ruimte = x.aantal * x.ton * 1000 - x.kg;
      if (ruimte / (x.aantal * x.ton * 1000) < 0.2) watAls.push({ label: Math.round(ruimte) + ' kg ' + x.soort + ' meer en er komt een container bij', verschil: x.prijs * factor });
    }
    if (r.t.btw === 6) watAls.push({ label: 'Aan 21% btw (woning jonger dan 10 jaar)', verschil: excl * 0.15, inclBtw: true });

    return { r, factor, fOnv, fMat, inPrijs, top, restAantal: rest.length, restBedrag: rest.reduce((a, d) => a + d.bedrag, 0), delen, watAls, extras: delen.filter((d) => d.gevraagd === false) };
  }

  /* Elk getal in de datatabel telt als één waarde die een aannemer moet bevestigen. */
  function telWaarden() {
    let n = Object.keys(DATA.tarieven).length + Object.keys(DATA.containers).length * 2 + Object.keys(DATA.perDag).length;
    for (const p of Object.values(DATA.posten)) n += 1 + (p.afval || []).length + p.mat.length * 3;
    return n;
  }

  function gemetenRegels(gm) {
    if (!gm) return [];
    const b = gm.bebouwing, d = gm.dak, a = gm.gebouw;
    const uit = [
      'Adres: ' + gm.adres,
      'Grondoppervlak hoofdgebouw: ' + a.oppervlakte + ' m2; omtrek ' + a.omtrek + ' m; omschreven rechthoek ' + a.lengte + ' x ' + a.breedte + ' m',
      'Bebouwing: ' + b.type + ' (' + b.buren + ' aangebouwde buren); gemene muur ' + b.gemeneMuur + ' m; vrije gevel ' + b.vrijeGevel + ' m',
    ];
    if (d) {
      uit.push('Dak: ' + d.vorm + (d.helling ? ', helling ' + d.helling + ' graden' : '') + ', ' + Math.round(d.platAandeel * 100) + '% van het dak is plat' +
        (d.platDeel ? ' (plat deel ' + d.platDeel.m2 + ' m2 op ' + d.platDeel.hoogte + ' m hoogte)' : ''));
      uit.push('Dakvlak (schuin gemeten, zonder overstek: tel de overstek uit de standaarden erbij): ' + d.dakvlak + ' m2; nokhoogte ' + d.nokhoogte + ' m; ' + (d.kroonlijst ? 'kroonlijst ' + d.kroonlijst + ' m boven het maaiveld' : 'kroonlijst niet af te leiden (samengesteld dak): neem de standaard of de beschrijving') +
        (d.noklengte ? '; noklengte ' + d.noklengte + ' m; overspanning ' + d.overspanning + ' m (afgeleid uit de rechthoekige contour)' : (d.vorm !== 'plat' ? '; noklengte en overspanning niet af te leiden (samengesteld gebouw): gebruik het gemeten dakvlak' : '')));
    }
    for (const w of (gm.waarschuwingen || [])) uit.push('Let op: ' + w);
    uit.push('Hoogtemeting uit de vlucht van 2013 tot 2015: is het dak nadien verbouwd, dan kloppen de dakmaten niet; neem dat op als punt voor het plaatsbezoek.');
    return uit;
  }

  function bouwPrompt(klus, gm, standaarden, vast) {
    const posten = Object.values(VAKKEN).map((vak) => '[' + vak + ']\n' + Object.entries(DATA.posten).filter(([code]) => vakVan(code) === vak).map(([code, p]) => code + ' | ' + p.naam + ' | ' + p.eenheid).join('\n')).join('\n');
    const perDag = Object.entries(DATA.perDag).map(([code, p]) => code + ' | ' + p.naam).join('\n');
    const meting = gemetenRegels(gm);
    const st = standaardWaarden(standaarden);
    const vastRegels = vast ? Object.entries(vast).filter(([, x]) => x && x.waarde != null && x.waarde !== '').map(([k, x]) => '- ' + k + ' (' + x.label + '): ' + x.waarde + (x.eenheid ? ' ' + x.eenheid : '')) : [];
    return [
      'Je bent werkvoorbereider bij een Vlaams bouwbedrijf (dakwerk, gevelwerk, plat dak, binnenafwerking). Je zet een klusbeschrijving om in een meetstaat.',
      'Je rekent GEEN prijzen en GEEN totalen uit: dat doet rekencode met een datatabel. Jij levert alleen de stappen en de hoeveelheden.',
      '',
      'DATATABEL per vak (code | werk | eenheid):',
      posten,
      '',
      'MATERIEEL PER WERKDAG (code | naam):',
      perDag,
      '',
    ].concat(meting.length ? [
      'GEMETEN OP HET ADRES (openbare kaartdata van Vlaanderen, hoogtemeting uit 2013-2015). Gebruik deze maten in plaats van eigen aannames. Geeft de beschrijving zelf een maat, volg dan de beschrijving en meld het verschil met de meting als aanname.',
    ].concat(meting.map((s) => '- ' + s), ['']) : []).concat([
      'STANDAARDEN VAN DE SECTOR (gebruik ze alleen voor wat de beschrijving en de meting niet geven):',
    ], standaardRegels(st).map((s) => '- ' + s), ['']).concat(vastRegels.length ? [
      'VASTE KENMERKEN (door de gebruiker bevestigd of aangepast; neem ze exact over met bron "vast" en leid de posten eruit af):',
    ].concat(vastRegels, ['']) : []).concat([
      'REGELS',
      '0. Kies het vak van de klus (Hellend dak, Gevel, Plat dak of Binnen) en begin met één regel "kenmerken" met minstens de kenmerken van dat vak, elk met label en eenheid:',
    ].concat(Object.entries(KENMERKEN).map(([vak, lijst]) => '   ' + vak + ': ' + lijst), [
      '   Bron per kenmerk: "beschrijving" (staat in de klus), "gemeten" (uit de meting), "berekend" (afgeleid uit andere kenmerken), "standaard" (uit de standaarden), "vast" (vaste kenmerken). Bebouwing is open, halfopen of gesloten. De posten volgen exact uit de kenmerken.',
      '1. Past een werk bij een code uit de datatabel, gebruik dan die code en geef alleen de hoeveelheid in de eenheid van die code.',
      '2. Werk dat niet in de datatabel staat (andere bedekking, timmerwerk, elektriciteit, sanitair): geef een post zonder code met je eigen schatting per eenheid: uur_per_eenheid (manuren), materiaal_eur_per_eenheid (inkoop in België, zonder btw), kg_per_eenheid (gewicht van het nieuwe materiaal), afval_kg_per_eenheid en afval_soort (' + Object.keys(DATA.containers).join(', ') + ').',
      '3. Reken de hoeveelheden uit de maten, met de dakoverstek uit de standaarden. Dakvlak van een zadeldak = (noklengte + overstek aan elke vrije gevel) x ((overspanning + 2 x overstek aan de goot) / cos(helling)). Gevel-m² = breedte x hoogte min de openingen. Zet de berekening met de getallen in "toelichting" (maximaal 1 zin). In de kopregel: oppervlakte_m2 = de hoofdoppervlakte van de klus, oppervlakte_naam = dakvlak, gevel, vloer of wand, en vakken = de lijst van vakken in de klus.',
      '4. Ontbreekt een maat in de beschrijving en in de meting, neem dan de standaard van de sector; staat ze daar ook niet, kies een gangbare waarde voor een Belgische woning en zet die keuze met het getal in een aanname.',
      '5. Neem alle stappen op die nodig zijn om het werk af te leveren, ook als de beschrijving ze niet noemt: stelling, afbraak of voorbereiding, profielen en dagkanten, afwerking van nok en dakrand, aansluitingen op buren en schouwen, plamuren vóór schilderwerk. Zet bij zo een stap "gevraagd":false en in "waarom" in maximaal 12 woorden waarom hij nodig is, met de maat.',
      '6. Geef maximaal 5 punten voor het plaatsbezoek: alleen wat ter plaatse te zien is en de prijs kan veranderen.',
      '7. Stel een ploeg voor: 2, 3 of 4 man. Kies het materieel per werkdag dat het vak nodig heeft (dak: lift en transport; gevel en binnen: transport; hoogwerker alleen als een stelling niet kan).',
      '8. Schrijf in het Nederlands. Geen prijzen of totalen in de teksten.',
      '',
      'ANTWOORD: alleen regels met elk één volledig JSON-object op één regel. Geen tekst ervoor of erna, geen codeblok. Eerst de kenmerken, dan de kopregel, dan de posten in volgorde van uitvoering, dan de aannames, dan de punten voor het plaatsbezoek. Voorbeeld van de vorm:',
      '{"t":"kenmerken","vak":"Hellend dak","lijst":[{"k":"bebouwing","label":"Bebouwing","waarde":"halfopen","eenheid":"","bron":"beschrijving"},{"k":"dakvlak_m2","label":"Dakvlak","waarde":94,"eenheid":"m²","bron":"berekend"},{"k":"dakramen_st","label":"Dakramen","waarde":2,"eenheid":"st","bron":"standaard"}]}',
      '{"t":"kop","titel":"korte naam van de klus","vak":"Hellend dak","vakken":["Hellend dak"],"oppervlakte_m2":94,"oppervlakte_naam":"dakvlak","ploeg":3,"materieel_per_dag":["lift","transport"]}',
      '{"t":"post","code":"dak.afbraak","hoeveelheid":94,"gevraagd":true,"toelichting":"2 x 8 m x 5,87 m"}',
      '{"t":"post","fase":"Afwerking","naam":"werk zonder code","eenheid":"lm","hoeveelheid":12,"uur_per_eenheid":0.5,"materiaal_eur_per_eenheid":28,"kg_per_eenheid":3,"afval_kg_per_eenheid":0,"gevraagd":false,"waarom":"gemene zijde van 12 m sluit aan op het dak van de buur","toelichting":"2 x 6 m"}',
      '{"t":"aanname","tekst":"..."}',
      '{"t":"plaatsbezoek","tekst":"..."}',
      '',
      'KLUS:',
      String(klus),
    ])).join('\n');
  }

  /* De uitleg komt na de berekening: de AI krijgt alle uitgerekende bedragen en mag geen eigen getallen maken. */
  function bouwUitlegPrompt(klus, gm, m, tar) {
    const a = analyse(m, tar);
    const r = a.r;
    const e = (x) => Math.round(x);
    const data = {
      klus: String(klus),
      gemeten_op_het_adres: gemetenRegels(gm),
      vak: r.vak,
      richtprijs: { incl_btw: e(r.kosten.incl), excl_btw: e(r.kosten.excl), btw_procent: r.t.btw, per_m2_excl_btw: e(r.perM2), oppervlakte: r.vlak + ' m² ' + r.vlakNaam },
      uitvoering: { ploeg_man: r.ploeg, werkdagen: r.werkdagen, weken_huur: r.weken, manuren: e(r.uren), materiaal_naar_boven_kg: e(r.matKg), afval_kg: e(r.afvalKg),
        afval_per_soort: r.afvoer.map((x) => ({ soort: x.soort, kg: e(x.kg), afvoer: x.aantal + ' x ' + x.naam })) },
      opbouw_excl_btw: { arbeid: e(r.kosten.arbeid), materiaal_inkoop: e(r.kosten.materiaalInkoop), materiaal_met_marge: e(r.kosten.materiaal), materieel_en_afvoer_met_marge: e(r.kosten.materieel), subtotaal: e(r.kosten.subtotaal), onvoorzien: e(r.kosten.onvoorzien), totaal_excl_btw: e(r.kosten.excl) },
      tarieven: { uurtarief_arbeid_excl_btw: r.t.uurtarief, uren_per_werkdag: r.t.urenPerDag, marge_op_materiaal_procent: r.t.materiaalmarge, onvoorzien_procent: r.t.onvoorzien },
      posten: r.regels.map((x) => ({
        werk: x.naam, hoeveelheid: x.hoeveelheid + ' ' + x.eenheid, manuren: Math.round(x.uren * 10) / 10, arbeid_eur: e(x.arbeidKost), materiaal_inkoop_eur: e(x.matKost + x.huurKost),
        in_de_prijs_excl_btw_eur: e(a.inPrijs(x)), aandeel_procent: Math.round(a.inPrijs(x) / r.kosten.excl * 1000) / 10,
        cijfers_uit: x.bron === 'data' ? 'datatabel' : 'AI-schatting', door_de_klant_gevraagd: x.gevraagd, waarom_nodig: x.waarom || undefined,
      })),
      /* De huur van de stelling zit al in de post van de stelling: hier alleen wat los van de posten komt. */
      materieel_en_afvoer_los_van_de_posten: r.materieel.filter((x) => x.soort !== 'huur').map((x) => ({ post: x.naam, aantal: x.aantal + ' ' + x.eenheid, in_de_prijs_excl_btw_eur: e(x.kost * a.fMat) })),
      wat_als: a.watAls.map((w) => ({ wijziging: w.label, verschil_eur: e(w.verschil), basis: w.inclBtw ? 'incl. btw' : 'excl. btw' })),
      kenmerken: Object.values(m.kenmerken || {}).map((x) => ({ kenmerk: x.label, waarde: x.waarde + (x.eenheid ? ' ' + x.eenheid : ''), bron: x.bron })),
      aannames_van_de_meetstaat: m.aannames || [],
      niet_meegerekend: r.overgeslagen,
      btw_voorwaarde: r.t.btw === 6 ? '6 % btw geldt alleen voor een privéwoning ouder dan 10 jaar die hoofdzakelijk bewoond wordt, met factuur aan de eigenaar of huurder; anders 21 %.' : '21 % btw.',
      datatabel: 'startwaarden van ' + DATA.stand + '; posten met een bron-veld dragen een geopende prijsbron',
    };
    return [
      'Je bent calculator met 20 jaar ervaring in ' + (r.vak === 'Overig' ? 'de bouw' : r.vak.toLowerCase()) + ' in Vlaanderen. Je legt een collega-aannemer uit hoe deze richtprijs tot stand komt.',
      'Hieronder staat de volledige berekening als JSON. Rekencode heeft alle bedragen uitgerekend.',
      '',
      'SCHRIJF maximaal 6 punten. Elk punt op een eigen regel, 1 of 2 zinnen, zonder opsommingsteken, zonder titel, zonder inleiding en zonder slot.',
      'Onderwerpen, in deze volgorde:',
      '1. Wat de prijs draagt: de grootste posten met bedrag en aandeel, en de reden als hoeveelheid maal norm of hoeveelheid maal materiaalprijs.',
      '2. Wat in de prijs zit zonder dat de klant erom vroeg, met het bedrag en waarom het werk niet zonder kan.',
      '3. Welke maat of keuze de prijs het meest verschuift (gebruik "wat_als").',
      '4. Waar de berekening zwak staat: kenmerken met bron "standaard" (de sector-standaard, niet deze woning), AI-schattingen of aannames die een groot bedrag dragen, en welke meting of vraag dat oplost.',
      '',
      'REGELS',
      '- Gebruik alleen getallen die in de JSON staan. Reken zelf geen nieuwe bedragen uit.',
      '- Elk punt bevat minstens één getal uit deze klus.',
      '- Geen zin die op elke klus past. Geen algemene raad. Geen beleefdheden.',
      '- Verboden woorden: mogelijk, waarschijnlijk, ongeveer, eventueel, belangrijk, uiteraard, kortom.',
      '- Heeft een onderwerp niets scherps, sla het over. 3 sterke punten zijn beter dan 6 zwakke.',
      '- Staat er iets onder "niet_meegerekend", zeg dan in één zin dat het buiten de prijs valt. De btw-voorwaarde noem je alleen als de klus eraan twijfelt.',
      '- Getallen zoals in Vlaanderen: decimalen met een komma (102,8 m²), duizendtallen met een punt (€ 1.234). Nederlands zoals een Vlaamse aannemer het zegt.',
      '',
      'BEREKENING:',
      JSON.stringify(data),
    ].join('\n');
  }

  /* ---------- verder vragen na de berekening ----------
     De aannemer stelt een vraag of vraagt een wijziging. De AI antwoordt in gewone tekst; een wijziging komt als regels met
     een id per post (p1 = de eerste post van m.posten). Rekencode past de wijziging toe en rekent het verschil uit: de AI noemt
     bij een wijziging geen bedrag. */
  const VERBODEN = ['mogelijk', 'waarschijnlijk', 'ongeveer', 'eventueel', 'belangrijk', 'uiteraard', 'kortom'];
  function vervolgData(klus, gm, m, tar, uitleg) {
    const a = analyse(m, tar);
    const r = a.r;
    const e = (x) => Math.round(x);
    const r4 = (x) => Math.round(x * 10000) / 10000;
    return {
      klus: String(klus),
      gemeten_op_het_adres: gemetenRegels(gm),
      vak: r.vak,
      richtprijs: { incl_btw: e(r.kosten.incl), excl_btw: e(r.kosten.excl), btw_procent: r.t.btw, per_m2_excl_btw: e(r.perM2), oppervlakte: r.vlak + ' m² ' + r.vlakNaam },
      uitvoering: { ploeg_man: r.ploeg, werkdagen: r.werkdagen, weken_huur: r.weken, manuren: Math.round(r.uren * 10) / 10, materiaal_naar_boven_kg: e(r.matKg), afval_kg: e(r.afvalKg),
        afval_per_soort: r.afvoer.map((x) => ({ soort: x.soort, kg: e(x.kg), afvoer: x.aantal + ' x ' + x.naam })) },
      opbouw_excl_btw: { arbeid: e(r.kosten.arbeid), materiaal_inkoop: e(r.kosten.materiaalInkoop), materiaal_met_marge: e(r.kosten.materiaal), materieel_en_afvoer_met_marge: e(r.kosten.materieel), subtotaal: e(r.kosten.subtotaal), onvoorzien: e(r.kosten.onvoorzien), totaal_excl_btw: e(r.kosten.excl) },
      tarieven: { uurtarief_arbeid_excl_btw: r.t.uurtarief, uren_per_werkdag: r.t.urenPerDag, marge_op_materiaal_procent: r.t.materiaalmarge, onvoorzien_procent: r.t.onvoorzien },
      posten: r.regels.map((x) => ({
        id: 'p' + (x.nr + 1), code: x.code || undefined, werk: x.naam, fase: x.fase, hoeveelheid: x.hoeveelheid, eenheid: x.eenheid, toelichting: x.toelichting || undefined,
        manuur_per_eenheid: r4(x.uren / x.hoeveelheid), manuren: Math.round(x.uren * 10) / 10, arbeid_eur: e(x.arbeidKost),
        materiaal: x.mat.map((y) => y.naam + ': ' + y.aantal + ' ' + y.eenheid + ' x € ' + y.prijs + (y.weken ? ' x ' + y.weken + (y.weken === 1 ? ' week' : ' weken') : '') + ' = € ' + e(y.kost)),
        in_de_prijs_excl_btw_eur: e(a.inPrijs(x)), aandeel_procent: Math.round(a.inPrijs(x) / r.kosten.excl * 1000) / 10,
        cijfers_uit: x.bron === 'data' ? 'datatabel' : 'AI-schatting', door_de_klant_gevraagd: x.gevraagd, waarom_nodig: x.waarom || undefined,
      })),
      materieel_en_afvoer_los_van_de_posten: r.materieel.filter((x) => x.soort !== 'huur').map((x) => ({ post: x.naam, aantal: x.aantal + ' ' + x.eenheid, in_de_prijs_excl_btw_eur: e(x.kost * a.fMat) })),
      wat_als: a.watAls.map((w) => ({ wijziging: w.label, verschil_eur: e(w.verschil), basis: w.inclBtw ? 'incl. btw' : 'excl. btw' })),
      kenmerken: Object.entries(m.kenmerken || {}).map(([k, x]) => ({ k, kenmerk: x.label, waarde: x.waarde, eenheid: x.eenheid || undefined, bron: x.bron })),
      aannames: m.aannames || [],
      plaatsbezoek: m.plaatsbezoek || [],
      niet_meegerekend: r.overgeslagen,
      btw_voorwaarde: r.t.btw === 6 ? '6 % btw geldt alleen voor een privéwoning ouder dan 10 jaar die hoofdzakelijk bewoond wordt, met factuur aan de eigenaar of huurder; anders 21 %.' : '21 % btw.',
      toelichting_bij_de_prijs: uitleg ? String(uitleg).split('\n').filter((s) => s.trim()) : undefined,
      datatabel: 'startwaarden van ' + DATA.stand + '; posten met een bron-veld dragen een geopende prijsbron',
    };
  }
  function bouwVervolgPrompt(klus, gm, m, tar, standaarden, gesprek, vraag, uitleg) {
    const data = vervolgData(klus, gm, m, tar, uitleg);
    const posten = Object.values(VAKKEN).map((vak) => '[' + vak + ']\n' + Object.entries(DATA.posten).filter(([code]) => vakVan(code) === vak).map(([code, p]) => code + ' | ' + p.naam + ' | ' + p.eenheid).join('\n')).join('\n');
    const st = standaardWaarden(standaarden);
    const kort = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };
    const eerder = (gesprek || []).filter((b) => b && b.vraag).slice(-6).map((b) => 'Aannemer: ' + kort(b.vraag, 400) + '\nJij: ' + (kort(b.antwoord, 600) || '(geen tekst)') +
      (b.wijziging && b.wijziging.toegepast ? ' [toegepast als v' + b.wijziging.naarVersie + ']' : b.wijziging && b.wijziging.soort === 'voorstel' ? ' [voorstel, niet toegepast]' : ''));
    return [
      'Je bent calculator met 20 jaar ervaring in ' + (data.vak === 'Overig' ? 'de bouw' : String(data.vak).toLowerCase()) + ' in Vlaanderen. Hieronder staat een berekening als JSON; rekencode rekende alle bedragen uit.',
      'De aannemer stelt een vraag over deze berekening of wil iets aan de klus veranderen.',
      '',
      'HOE JE ANTWOORDT',
      '- Een vraag: antwoord in gewone tekst, hoogstens 4 zinnen, elke zin op een eigen regel. Geen opsommingsteken, geen titel, geen aanhef, geen slotzin.',
      '- Wil de aannemer iets veranderen (werk erbij of eraf, een ander aantal, een andere maat, een ander materiaal, een andere ploeg, een ander btw-tarief): schrijf één zin die zegt wat je verandert, zonder bedrag. Daarna de regel {"t":"actie","waarde":"toepassen"} en dan de wijzigingsregels.',
      '- Vraagt hij wat iets zou kosten of wat er gebeurt als iets anders is, zonder te zeggen dat het zo moet: schrijf één zin die zegt wat je doorrekent, zonder bedrag. Daarna de regel {"t":"actie","waarde":"voorstel"} en dan de wijzigingsregels. De rekencode toont het nieuwe bedrag; de aannemer beslist zelf.',
      '- Bij een wijziging noem je nooit een bedrag: de rekencode rekent het uit.',
      '',
      'WIJZIGINGSREGELS: elk één volledig JSON-object op een eigen regel, zonder tekst ervoor of erna.',
      '{"t":"zet","id":"p3","hoeveelheid":4,"toelichting":"4 dakramen"}   andere hoeveelheid voor post p3',
      '{"t":"weg","id":"p7"}   post p7 vervalt',
      '{"t":"post","code":"dak.dakraam","hoeveelheid":2,"gevraagd":true,"toelichting":"2 extra dakramen"}   nieuwe post uit de datatabel',
      '{"t":"post","fase":"Afwerking","naam":"werk zonder code","eenheid":"st","hoeveelheid":1,"uur_per_eenheid":2,"materiaal_eur_per_eenheid":150,"kg_per_eenheid":10,"afval_kg_per_eenheid":0,"afval_soort":"rest","gevraagd":true,"toelichting":"..."}   werk dat niet in de datatabel staat: je eigen schatting per eenheid (manuren, inkoop in België zonder btw, kilo)',
      '{"t":"kenmerk","k":"dakramen_st","label":"Dakramen","waarde":4,"eenheid":"st"}   een kenmerk dat met de wijziging verandert',
      '{"t":"ploeg","waarde":4}',
      '{"t":"btw","waarde":21}',
      '{"t":"aannames","lijst":["...","..."]}   de volledige nieuwe lijst, alleen als een aanname door de wijziging niet meer klopt',
      '{"t":"titel","tekst":"..."}   alleen als de klus wezenlijk verandert',
      '',
      'REGELS',
      '- Verander alleen wat de aannemer vraagt, plus elke post die rechtstreeks van die wijziging afhangt (dezelfde maat of dezelfde formule als in de toelichting van de post). Laat al de rest staan.',
      '- Een ander materiaal = de oude post weg en een nieuwe post met de juiste code. Gebruik codes uit de datatabel; staat het werk er niet in, geef een post zonder code met je schatting per eenheid.',
      '- Hoeveelheden reken je zoals in de meetstaat: met de maten uit de kenmerken en de standaarden hieronder.',
      '- Gebruik in je tekst alleen getallen die in de JSON staan. Reken zelf geen nieuwe bedragen uit.',
      '- Kan je een vraag niet beantwoorden met de JSON, zeg dan in één zin welk gegeven ontbreekt.',
      '- Geen zin die op elke klus past, geen algemene raad, geen beleefdheden.',
      '- Verboden woorden: ' + VERBODEN.join(', ') + '.',
      '- Getallen zoals in Vlaanderen: decimalen met een komma (102,8 m²), duizendtallen met een punt (€ 1.234). Nederlands zoals een Vlaamse aannemer het zegt.',
      '',
      'DATATABEL (code | werk | eenheid):',
      posten,
      '',
      'STANDAARDEN VAN DE SECTOR:',
    ].concat(standaardRegels(st).map((s) => '- ' + s), ['']).concat(eerder.length ? ['EERDER IN DIT GESPREK (oudste eerst; de berekening hieronder is de stand van nu):'].concat(eerder, ['']) : []).concat([
      'BEREKENING:',
      JSON.stringify(data),
      '',
      'VRAAG VAN DE AANNEMER:',
      String(vraag),
    ]).join('\n');
  }
  /* Leest het antwoord: gewone regels = tekst voor de aannemer; regels die met { beginnen = actie of wijziging. */
  function leesVervolg(tekst) {
    const antwoord = [], ops = [];
    let actie = '';
    for (let regel of String(tekst || '').split('\n')) {
      regel = regel.trim();
      if (!regel || /^```/.test(regel)) continue;
      const j = regel.indexOf('{"t"');
      if (j > 0) { const voor = regel.slice(0, j).trim(); if (voor) antwoord.push(voor); regel = regel.slice(j); }
      if (regel[0] === '{') {
        let o;
        try { o = JSON.parse(regel); } catch (e) { continue; }
        if (!o || typeof o !== 'object' || Array.isArray(o)) continue;
        if (o.t === 'actie') { actie = o.waarde === 'toepassen' ? 'toepassen' : 'voorstel'; continue; }
        if (typeof o.t === 'string') ops.push(o);
        continue;
      }
      antwoord.push(regel.replace(/^(?:[-•*]|\d+[.)])\s+/, ''));
    }
    return { antwoord, actie: ops.length ? (actie || 'voorstel') : '', ops };
  }
  /* Past de wijzigingsregels toe op een kopie van de meetstaat. herkomst[i] = de plaats van post i in de oude meetstaat (-1 = nieuw). */
  function pasWijzigingToe(m, ops) {
    const uit = kopie(m);
    if (!Array.isArray(uit.posten)) uit.posten = [];
    const n = uit.posten.length;
    const herkomst = uit.posten.map((_, i) => i);
    const weg = new Set();
    const fouten = [];
    let ploeg = 0, btw = 0, gedaan = 0;
    const plaats = (id) => { const x = /^p(\d+)$/.exec(String(id == null ? '' : id).trim()); const i = x ? Number(x[1]) - 1 : -1; return i >= 0 && i < n ? i : -1; };
    for (const o of (Array.isArray(ops) ? ops : [])) {
      if (!o || typeof o !== 'object') continue;
      if (o.t === 'zet' || o.t === 'weg') {
        const i = plaats(o.id);
        if (i < 0) { fouten.push('onbekende post ' + String(o.id).slice(0, 12)); continue; }
        const q = num(o.hoeveelheid);
        if (o.t === 'weg' || !(q > 0)) { weg.add(i); gedaan++; continue; }
        uit.posten[i].hoeveelheid = q;
        if (o.toelichting) uit.posten[i].toelichting = String(o.toelichting).slice(0, 160);
        gedaan++;
      } else if (o.t === 'post') {
        const p = Object.assign({}, o);
        delete p.t;
        if (p.code && !DATA.posten[p.code]) { fouten.push('onbekende code ' + String(p.code).slice(0, 40)); continue; }
        if (!p.code && !(p.naam && p.uur_per_eenheid != null)) { fouten.push('nieuwe post zonder code en zonder schatting'); continue; }
        if (!(num(p.hoeveelheid) > 0)) { fouten.push('nieuwe post zonder hoeveelheid'); continue; }
        p.hoeveelheid = num(p.hoeveelheid);
        uit.posten.push(p);
        herkomst.push(-1);
        gedaan++;
      } else if (o.t === 'kenmerk' && o.k && o.waarde != null && o.waarde !== '') {
        const k = String(o.k).slice(0, 40);
        if (!uit.kenmerken || typeof uit.kenmerken !== 'object') uit.kenmerken = {};
        const oud = uit.kenmerken[k] || {};
        const tekst = typeof o.waarde === 'string' && !/^-?\d+([.,]\d+)?$/.test(o.waarde.trim());
        uit.kenmerken[k] = { label: String(o.label || oud.label || kenmerkLabel(k)).slice(0, 60), eenheid: String(o.eenheid != null ? o.eenheid : (oud.eenheid != null ? oud.eenheid : kenmerkEenheid(k))).slice(0, 8),
          waarde: tekst ? String(o.waarde).slice(0, 80) : num(o.waarde), tekst, bron: 'vast' };
      } else if (o.t === 'ploeg') {
        const v = Math.round(num(o.waarde));
        if (v >= 1 && v <= 12) { ploeg = v; gedaan++; } else fouten.push('ploeg ' + String(o.waarde).slice(0, 12));
      } else if (o.t === 'btw') {
        const v = num(o.waarde);
        if (v === 6 || v === 21) { btw = v; gedaan++; } else fouten.push('btw ' + String(o.waarde).slice(0, 12));
      } else if (o.t === 'aannames' && Array.isArray(o.lijst)) {
        uit.aannames = o.lijst.map((s) => String(s).trim()).filter(Boolean).slice(0, 12);
      } else if (o.t === 'plaatsbezoek' && Array.isArray(o.lijst)) {
        uit.plaatsbezoek = o.lijst.map((s) => String(s).trim()).filter(Boolean).slice(0, 5);
      } else if (o.t === 'titel' && o.tekst) {
        uit.titel = String(o.tekst).slice(0, 120);
      }
    }
    const posten = [], her = [];
    uit.posten.forEach((p, i) => { if (!(i < n && weg.has(i))) { posten.push(p); her.push(herkomst[i]); } });
    uit.posten = posten;
    return { m: uit, herkomst: her, ploeg, btw, gedaan, fouten };
  }
  /* Het verschil tussen twee versies, per post: arbeid aan het uurtarief, materiaal met marge, alles met onvoorzien (zoals "Waar het geld zit").
     De rijen plus materieel en afvoer tellen exact op tot het verschil excl. btw. */
  function vergelijk(mOud, tarOud, mNieuw, tarNieuw, herkomst) {
    const a1 = analyse(mOud, tarOud), a2 = analyse(mNieuw, tarNieuw);
    const r1 = a1.r, r2 = a2.r;
    const oud = new Map(r1.regels.map((x) => [x.nr, x]));
    const nieuwVan = new Map();
    const rijen = [];
    for (const x of r2.regels) {
      const oi = Array.isArray(herkomst) && herkomst[x.nr] != null ? herkomst[x.nr] : -1;
      if (oi >= 0 && oud.has(oi)) nieuwVan.set(oi, x);
      else rijen.push({ soort: 'nieuw', naam: x.naam, eenheid: x.eenheid, van: 0, naar: x.hoeveelheid, verschil: a2.inPrijs(x) });
    }
    for (const x of r1.regels) {
      const y = nieuwVan.get(x.nr);
      if (!y) { rijen.push({ soort: 'weg', naam: x.naam, eenheid: x.eenheid, van: x.hoeveelheid, naar: 0, verschil: -a1.inPrijs(x) }); continue; }
      const d = a2.inPrijs(y) - a1.inPrijs(x);
      if (Math.abs(y.hoeveelheid - x.hoeveelheid) > 1e-9) rijen.push({ soort: 'zet', naam: y.naam, eenheid: y.eenheid, van: x.hoeveelheid, naar: y.hoeveelheid, verschil: d });
      else if (Math.abs(d) >= 0.005) rijen.push({ soort: 'duur', naam: y.naam, eenheid: y.eenheid, van: x.hoeveelheid, naar: y.hoeveelheid, verschil: d });
    }
    /* Materieel en afvoer los van de posten (lift en transport per werkdag, containers, big bags), per naam: aantal en bedrag voor en na. */
    const los = (a) => {
      const uit = new Map();
      for (const x of a.r.materieel) {
        if (x.soort === 'huur') continue;
        const o = uit.get(x.naam) || { naam: x.naam, eenheid: x.eenheid, aantal: 0, bedrag: 0 };
        o.aantal += x.aantal; o.bedrag += x.kost * a.fMat; o.eenheid = x.eenheid;
        uit.set(x.naam, o);
      }
      return uit;
    };
    const l1 = los(a1), l2 = los(a2);
    const materieelRijen = [];
    let materieel = 0;
    for (const naam of new Set([...l1.keys(), ...l2.keys()])) {
      const x = l1.get(naam), y = l2.get(naam);
      const d = (y ? y.bedrag : 0) - (x ? x.bedrag : 0);
      materieel += d;
      if (Math.abs(d) >= 0.005) materieelRijen.push({ soort: 'materieel', naam, eenheid: (y || x).eenheid, van: x ? x.aantal : 0, naar: y ? y.aantal : 0, verschil: d });
    }
    const stand = (r) => ({ incl: r.kosten.incl, excl: r.kosten.excl, btw: r.t.btw, ploeg: r.ploeg, werkdagen: r.werkdagen, weken: r.weken, posten: r.regels.length });
    return { van: stand(r1), naar: stand(r2), rijen, materieelRijen, materieel, verschilExcl: r2.kosten.excl - r1.kosten.excl, verschilIncl: r2.kosten.incl - r1.kosten.incl };
  }

  const VOORBEELD = {
    klus: 'Halfopen woning. Zadeldak, voorgevel 8 m breed, woning 9 m diep, dakhelling 40 graden, kroonlijst op 6 m hoogte. Oude kleipannen, latten en onderdak eraf. Nieuw onderdak, sarking-isolatie van 12 cm en nieuwe kleipannen. 2 dakramen, 1 schouw, zinken goten en afvoeren voor en achter vervangen.',
    meetstaat: {
      titel: 'Zadeldak halfopen woning vernieuwen met sarking, 94 m²',
      dakvlak_m2: 94,
      ploeg: 3,
      materieel_per_dag: ['lift', 'transport'],
      posten: [
        { code: 'dak.stelling', hoeveelheid: 96, gevraagd: false, waarom: 'Dakrand op 6 m: stelling aan voor- en achtergevel.', toelichting: 'Voor- en achtergevel: 2 × 8 m × 6 m' },
        { code: 'dak.afbraak', hoeveelheid: 94, toelichting: 'Dakvlak: 2 × 8 m × (4,5 m ÷ cos 40°) = 2 × 8 × 5,87' },
        { code: 'dak.onderdak', hoeveelheid: 94, toelichting: 'Volledig dakvlak' },
        { code: 'dak.sarking120', hoeveelheid: 94, toelichting: 'Volledig dakvlak' },
        { code: 'dak.tengellatten', hoeveelheid: 94, toelichting: 'Volledig dakvlak' },
        { code: 'dak.panlatten', hoeveelheid: 94, toelichting: 'Volledig dakvlak' },
        { code: 'dak.pannen.klei', hoeveelheid: 94, toelichting: 'Volledig dakvlak' },
        { code: 'dak.nok', hoeveelheid: 8, gevraagd: false, waarom: 'Nok van 8 m sluit het dak af.', toelichting: 'Noklengte = gevelbreedte' },
        { code: 'dak.gevelpannen', hoeveelheid: 11.7, gevraagd: false, waarom: 'Vrije dakrand van 11,7 m aan de open zijde.', toelichting: 'Vrije zijde: 2 × 5,87 m' },
        { fase: 'Afwerking', naam: 'Zinken aansluiting op het dak van de buur', eenheid: 'lm', hoeveelheid: 11.7, uur_per_eenheid: 0.5, materiaal_eur_per_eenheid: 28, kg_per_eenheid: 3, afval_kg_per_eenheid: 0, gevraagd: false, waarom: 'Gemene zijde van 11,7 m sluit aan op het dak van de buur.', toelichting: 'Gemene zijde: 2 × 5,87 m' },
        { code: 'dak.schouw', hoeveelheid: 1, toelichting: '1 schouw' },
        { code: 'dak.dakraam', hoeveelheid: 2, toelichting: '2 dakramen' },
        { code: 'dak.goot.zink', hoeveelheid: 16, toelichting: 'Voor en achter: 2 × 8 m' },
        { code: 'dak.afvoer.zink', hoeveelheid: 12, toelichting: '2 afvoeren × 6 m' },
      ],
      aannames: [
        'Stelling aan de voor- en achtergevel; de vrije zijgevel is bereikbaar vanaf het dak.',
        'De nieuwe kleipan is een klein formaat van 20,7 stuks per m².',
        'Dakramen van 78 × 118 cm op de plaats van bestaande dakramen.',
        '1 regenafvoer voor en 1 achter, elk 6 m.',
      ],
      plaatsbezoek: [
        'Staat van het gebinte en de kepers: zichtbaar na de afbraak.',
        'Asbest in het oude onderdak of in leien op de schouw.',
        'Plaats voor stelling, container en pannenlift.',
      ],
    },
  };

  g.RP = { DATA, DATA_START, pasInstellingenToe, FASES, VAKKEN, vakVan, STANDAARDEN, KENMERKEN, BRONNEN, standaardWaarden, standaardRegels, bereken, analyse, telWaarden, bouwPrompt, bouwUitlegPrompt, gemetenRegels, pasRegelToe, leegMeetstaat,
    VERBODEN, vervolgData, bouwVervolgPrompt, leesVervolg, pasWijzigingToe, vergelijk, VOORBEELD };
})(globalThis);
