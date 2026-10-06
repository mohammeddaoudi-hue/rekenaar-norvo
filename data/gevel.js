/* Datatabel: Gevel. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met 'bron' is op 6 oktober 2026 op die pagina gelezen (consumentenprijs incl. btw gedeeld door 1,21); zonder bron is het een startwaarde. */
Object.assign(globalThis.RP_DATA.posten, {
  /* ---- Werfinrichting en voorbereiding ---- */
  'gevel.stelling': { fase: 'Werfinrichting', naam: 'Gevelstelling plaatsen en afbreken', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Huur gevelstelling', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true, perWeek: true }
    ] },
  'gevel.afdekken': { fase: 'Werfinrichting', naam: 'Raam of deur afdekken met folie en tape tijdens gevelwerk', eenheid: 'st', uur: 0.3,
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'Afdekfolie en tape per opening', per: 1, eenheid: 'st', prijs: 2.5, kg: 0.3 }
    ] },
  'gevel.reinigen': { fase: 'Voorbereiding', naam: 'Gevel reinigen onder hoge druk', eenheid: 'm²', uur: 0.08,
    afval: [],
    mat: [
      { naam: 'Reinigingsmiddel', per: 1, eenheid: 'm²', prijs: 0.5, kg: 0.1 }
    ] },
  'gevel.reinigen.zacht': { fase: 'Voorbereiding', naam: 'Gevel zacht reinigen onder lage druk met reinigingsproduct', eenheid: 'm²', uur: 0.15,
    afval: [],
    mat: [
      { naam: 'Gevelreiniger (zuur of alkalisch)', per: 0.3, eenheid: 'l', prijs: 6, kg: 1.1 }
    ] },
  'gevel.zandstralen': { fase: 'Voorbereiding', naam: 'Gevel zandstralen (verf, vuil of cementsluier verwijderen)', eenheid: 'm²', uur: 0.3,
    afval: [{ soort: 'rest', kg: 9 }],
    mat: [
      { naam: 'Straalmiddel (garnet of glasgrit)', per: 8, eenheid: 'kg', prijs: 0.45, kg: 1 },
      { naam: 'Afdekfolie bij zandstralen', per: 1.1, eenheid: 'm²', prijs: 0.4, kg: 0.05 },
      { naam: 'Huur straalinstallatie met compressor', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true }
    ] },
  'gevel.voegen.uitslijpen': { fase: 'Voorbereiding', naam: 'Oude voegen uitslijpen', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'puin', kg: 8 }],
    mat: [
      { naam: 'Slijpschijven', per: 1, eenheid: 'm²', prijs: 0.4, kg: 0 }
    ] },
  'gevel.afvoer.los': { fase: 'Voorbereiding', naam: 'Regenafvoer losmaken en na de isolatie herplaatsen', eenheid: 'st', uur: 2,
    afval: [],
    mat: [
      { naam: 'Beugels en verlengstukken', per: 1, eenheid: 'st', prijs: 25, kg: 1 }
    ] },
  'gevel.herstel.metselwerk': { fase: 'Voorbereiding', naam: 'Kleine herstelling metselwerk (losse of kapotte stenen, plek tot 0,25 m²)', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'puin', kg: 15 }],
    mat: [
      { naam: 'Gevelsteen waalformaat', per: 20, eenheid: 'st', prijs: 0.87, kg: 1.8,
        bron: { url: 'https://www.bouwbestel.nl/gevelsteen-rood-vormbak-waalformaat-wvr-pallet-a-400-stuks.html', datum: '2026-10-06', wat: 'pallet 400 stuks € 421,56 incl. btw = € 348,40 excl. btw, gedeeld door 400' } },
      { naam: 'Metselmortel', per: 8, eenheid: 'kg', prijs: 0.22, kg: 1 }
    ] },
  'gevel.scheur.ankers': { fase: 'Voorbereiding', naam: 'Scheur in metselwerk herstellen met spiraalankers en ankermortel', eenheid: 'lm', uur: 1,
    afval: [{ soort: 'puin', kg: 2 }],
    mat: [
      { naam: 'Spiraalanker inox 1 m', per: 2, eenheid: 'st', prijs: 9, kg: 0.1 },
      { naam: 'Ankermortel', per: 1.5, eenheid: 'kg', prijs: 2.5, kg: 1 }
    ] },
  'gevel.vocht.injectie': { fase: 'Voorbereiding', naam: 'Injectie tegen opstijgend vocht in de buitenmuur (muur van 30 cm)', eenheid: 'lm', uur: 0.6, keuze: 'injectie tegen opstijgend vocht',
    afval: [{ soort: 'puin', kg: 1 }],
    mat: [
      { naam: 'Injectiegel tegen opstijgend vocht (koker 310 ml)', per: 0.8, eenheid: 'st', prijs: 35.94, kg: 0.4,
        bron: { url: 'https://www.gamma.be/nl/assortiment/aquaplan-vochtbarriere-injectiegel-koker-310-ml/p/B501879', datum: '2026-10-06', wat: 'koker 310 ml € 43,49 incl. btw gedeeld door 1,21' } },
      { naam: 'Mortel om de boorgaten te dichten', per: 0.5, eenheid: 'kg', prijs: 0.5, kg: 1 }
    ] },

  /* ---- Afbraak ---- */
  'gevel.afbraak.bekleding': { fase: 'Afbraak', naam: 'Oude gevelbekleding en regelwerk afbreken en afvoeren', eenheid: 'm²', uur: 0.3,
    afval: [{ soort: 'hout', kg: 8 }, { soort: 'rest', kg: 5 }], mat: [] },
  'gevel.afbraak.asbestleien': { fase: 'Afbraak', naam: 'Asbesthoudende gevelleien verwijderen (hechtgebonden, verpakt afgevoerd)', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'asbest', kg: 15 }, { soort: 'hout', kg: 3 }],
    mat: [
      { naam: 'Verpakkingsfolie en beschermingsmiddelen asbest', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.1 }
    ] },
  'gevel.afbraak.crepi': { fase: 'Afbraak', naam: 'Oude crepi of cementpleister van de gevel afkappen', eenheid: 'm²', uur: 0.4,
    afval: [{ soort: 'puin', kg: 30 }], mat: [] },
  'gevel.afbraak.metselwerk': { fase: 'Afbraak', naam: 'Oud gevelmetselwerk (parement) afbreken en afvoeren', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'puin', kg: 190 }], mat: [] },

  /* ---- Ruwbouw ---- */
  'gevel.metselwerk.nieuw': { fase: 'Ruwbouw', naam: 'Nieuw gevelmetselwerk in baksteen (parement, halfsteens)', eenheid: 'm²', uur: 1.3,
    afval: [{ soort: 'puin', kg: 3 }],
    mat: [
      /* 73 stenen per m² (waalformaat met voeg van 12 mm) plus 4 % breuk */
      { naam: 'Gevelsteen waalformaat', per: 76, eenheid: 'st', prijs: 0.87, kg: 1.8,
        bron: { url: 'https://www.bouwbestel.nl/gevelsteen-rood-vormbak-waalformaat-wvr-pallet-a-400-stuks.html', datum: '2026-10-06', wat: 'pallet 400 stuks € 421,56 incl. btw = € 348,40 excl. btw, gedeeld door 400' } },
      { naam: 'Metselmortel', per: 32, eenheid: 'kg', prijs: 0.22, kg: 1 },
      { naam: 'Spouwankers inox', per: 5, eenheid: 'st', prijs: 0.25, kg: 0.03 }
    ] },

  /* ---- Isolatie ---- */
  'gevel.isolatie.eps': { fase: 'Isolatie', naam: 'Gevelisolatie EPS 14 cm lijmen en pluggen', eenheid: 'm²', uur: 0.45, keuze: 'gevelisolatie',
    afval: [],
    mat: [
      /* 6 okt: plaat 14 -> 15,98 en lijm 0,55 -> 0,81 na het lezen van de bronnen hieronder */
      { naam: 'EPS-gevelplaat 14 cm', per: 1.05, eenheid: 'm²', prijs: 15.98, kg: 2.5,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-140mm.html', datum: '2026-10-06', wat: 'plaat 50 x 100 cm € 9,67 incl. btw = € 7,99 excl. btw, maal 2 per m²' } },
      { naam: 'Lijm- en wapeningsmortel EPS', per: 5, eenheid: 'kg', prijs: 0.81, kg: 1,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-buitenzijde.html', datum: '2026-10-06', wat: 'Mapetherm AR1 GG 25 kg € 24,50 incl. btw = € 20,25 excl. btw (gerelateerd product op die pagina), gedeeld door 25' } },
      { naam: 'Isolatiepluggen', per: 6, eenheid: 'st', prijs: 0.35, kg: 0.02 }
    ] },
  'gevel.isolatie.eps.grafiet': { fase: 'Isolatie', naam: 'Gevelisolatie grafiet-EPS 14 cm (lambda 0,031) lijmen en pluggen', eenheid: 'm²', uur: 0.45, keuze: 'gevelisolatie',
    afval: [],
    mat: [
      { naam: 'Grafiet-EPS gevelplaat 14 cm', per: 1.05, eenheid: 'm²', prijs: 16.66, kg: 2.3,
        bron: { url: 'https://www.isolatiemateriaal.nl/eps-isolatie/gevelisolatie/neopor-wdv-032-gevelisolatie-1000x500x140mm-3plpak-rd438-150-m2', datum: '2026-10-06', wat: 'pak van 1,5 m² € 30,24 incl. btw = € 20,16 per m², gedeeld door 1,21' } },
      { naam: 'Lijm- en wapeningsmortel EPS', per: 5, eenheid: 'kg', prijs: 0.81, kg: 1,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-buitenzijde.html', datum: '2026-10-06', wat: 'Mapetherm AR1 GG 25 kg € 24,50 incl. btw = € 20,25 excl. btw, gedeeld door 25' } },
      { naam: 'Isolatiepluggen', per: 6, eenheid: 'st', prijs: 0.35, kg: 0.02 }
    ] },
  'gevel.isolatie.wol': { fase: 'Isolatie', naam: 'Gevelisolatie minerale wol 14 cm (brandveilig) lijmen en pluggen', eenheid: 'm²', uur: 0.55, keuze: 'gevelisolatie',
    afval: [],
    mat: [
      /* gevelplaat met dubbele dichtheid, 90 kg/m³: 13 kg per m² bij 14 cm */
      { naam: 'Minerale wol gevelplaat 14 cm (dubbele dichtheid)', per: 1.05, eenheid: 'm²', prijs: 30, kg: 13 },
      { naam: 'Lijm- en wapeningsmortel EPS', per: 6, eenheid: 'kg', prijs: 0.81, kg: 1,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-buitenzijde.html', datum: '2026-10-06', wat: 'Mapetherm AR1 GG 25 kg € 24,50 incl. btw = € 20,25 excl. btw, gedeeld door 25' } },
      { naam: 'Isolatiepluggen met metalen nagel', per: 8, eenheid: 'st', prijs: 0.45, kg: 0.03 }
    ] },
  'gevel.spouw.injectie': { fase: 'Isolatie', naam: 'Spouwmuurisolatie door injectie met EPS-parels', eenheid: 'm²', uur: 0.12, keuze: 'spouwisolatie',
    afval: [],
    mat: [
      /* spouw van 6 cm: 0,06 m³ per m²; parels met bindmiddel 18 kg per m³ */
      { naam: 'EPS-parels met bindmiddel', per: 0.06, eenheid: 'm³', prijs: 95, kg: 18 },
      { naam: 'Mortel om de boorgaten te dichten', per: 0.3, eenheid: 'kg', prijs: 0.5, kg: 1 }
    ] },
  'gevel.profielen': { fase: 'Isolatie', naam: 'Sokkel-, hoek- en dagkantprofielen plaatsen', eenheid: 'lm', uur: 0.15,
    afval: [],
    mat: [
      { naam: 'Profielen met net', per: 1, eenheid: 'lm', prijs: 3.5, kg: 0.3 }
    ] },
  'gevel.bekleding.regelwerk': { fase: 'Isolatie', naam: 'Regelwerk met minerale wol 14 cm en dampopen folie voor gevelbekleding', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'hout', kg: 0.3 }],
    mat: [
      { naam: 'Houten regels 45 x 70 mm, geïmpregneerd', per: 2.5, eenheid: 'lm', prijs: 2.2, kg: 1.6 },
      { naam: 'Steenwolplaat 14 cm', per: 1.05, eenheid: 'm²', prijs: 18.59, kg: 6.3,
        bron: { url: 'https://www.isolatiemateriaal.nl/steenwol/steenwolplaten/rock4all-steenwolplaat-1200x600x140mm-rd400-3plpak-216-m2', datum: '2026-10-06', wat: 'Rock4All 140 mm € 22,49 per m² incl. btw gedeeld door 1,21; pak van 2,16 m² weegt 13,6 kg' } },
      { naam: 'Dampopen gevelfolie, uv-bestendig zwart', per: 1.15, eenheid: 'm²', prijs: 1.9, kg: 0.15 },
      { naam: 'Schroeven en pluggen regelwerk', per: 1, eenheid: 'm²', prijs: 1.8, kg: 0.2 }
    ] },

  /* ---- Afwerking ---- */
  'gevel.wapening': { fase: 'Afwerking', naam: 'Wapeningslaag met glasvezelnet', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      /* 6 okt: 0,60 -> 0,81 na het lezen van de bron */
      { naam: 'Lijm- en wapeningsmortel EPS', per: 5, eenheid: 'kg', prijs: 0.81, kg: 1,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-buitenzijde.html', datum: '2026-10-06', wat: 'Mapetherm AR1 GG 25 kg € 24,50 incl. btw = € 20,25 excl. btw, gedeeld door 25' } },
      { naam: 'Glasvezelnet', per: 1.1, eenheid: 'm²', prijs: 1.3, kg: 0.16 }
    ] },
  'gevel.crepi': { fase: 'Afwerking', naam: 'Crepi (siliconenharspleister 1,5 mm) op de wapeningslaag aanbrengen', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Voorstrijk', per: 0.25, eenheid: 'kg', prijs: 3, kg: 1 },
      /* 6 okt (tweede controle): de vorige bron (verfwebwinkel SPS Spachtelputz, € 2,48/kg) is een acrylaatpleister voor binnenmuren
         ("op basis van kunstharsdispersie", "voor het decoratief afwerken van binnenmuren"); vervangen door een siliconenharspleister
         voor gevels bij een Belgische vakhandel */
      { naam: 'Siliconenharspleister', per: 2.5, eenheid: 'kg', prijs: 2.9, kg: 1,
        bron: { url: 'https://adammateriaux.be/en/product-3145', datum: '2026-10-06', wat: 'Knauf Conni S siliconenharspleister 1,5 mm, emmer 25 kg € 72,60 excl. btw (€ 87,06 incl.) gedeeld door 25; verbruik volgens de pagina 2,5 tot 3 kg/m²' } }
    ] },
  'gevel.crepi.mineraal': { fase: 'Afwerking', naam: 'Minerale sierpleister (krabpleister 2 mm) op de wapeningslaag aanbrengen en egaliserend schilderen', eenheid: 'm²', uur: 0.4,
    afval: [],
    mat: [
      { naam: 'Voorstrijk', per: 0.25, eenheid: 'kg', prijs: 3, kg: 1 },
      { naam: 'Minerale sierpleister 2 mm', per: 3, eenheid: 'kg', prijs: 1.1, kg: 1 },
      { naam: 'Siliconenharsverf (egalisatielaag)', per: 0.2, eenheid: 'l', prijs: 7.64, kg: 1.4,
        bron: { url: 'https://www.hornbach.nl/p/hornbach-siliconen-gevelverf-wit-10-l/10006237/', datum: '2026-10-06', wat: 'siliconen gevelverf 10 l € 92,49 incl. btw gedeeld door 1,21 en door 10' } }
    ] },
  'gevel.crepi.metselwerk': { fase: 'Afwerking', naam: 'Crepi zonder isolatie op bestaand metselwerk (grondlaag, wapening en sierpleister)', eenheid: 'm²', uur: 0.95,
    afval: [{ soort: 'puin', kg: 1 }],
    mat: [
      { naam: 'Hechtprimer voor metselwerk', per: 0.2, eenheid: 'kg', prijs: 4, kg: 1 },
      /* grondlaag cementpleister van 1 cm: 15 kg per m² */
      { naam: 'Grondpleister cementgebonden', per: 15, eenheid: 'kg', prijs: 0.35, kg: 1 },
      { naam: 'Lijm- en wapeningsmortel EPS', per: 5, eenheid: 'kg', prijs: 0.81, kg: 1,
        bron: { url: 'https://www.bouwbestel.nl/eps-gevelisolatie-buitenzijde.html', datum: '2026-10-06', wat: 'Mapetherm AR1 GG 25 kg € 24,50 incl. btw = € 20,25 excl. btw, gedeeld door 25' } },
      { naam: 'Glasvezelnet', per: 1.1, eenheid: 'm²', prijs: 1.3, kg: 0.16 },
      { naam: 'Voorstrijk', per: 0.25, eenheid: 'kg', prijs: 3, kg: 1 },
      /* 6 okt (tweede controle): zelfde pleister en bron als in gevel.crepi */
      { naam: 'Siliconenharspleister', per: 2.5, eenheid: 'kg', prijs: 2.9, kg: 1,
        bron: { url: 'https://adammateriaux.be/en/product-3145', datum: '2026-10-06', wat: 'Knauf Conni S siliconenharspleister 1,5 mm, emmer 25 kg € 72,60 excl. btw (€ 87,06 incl.) gedeeld door 25; verbruik volgens de pagina 2,5 tot 3 kg/m²' } }
    ] },
  'gevel.steenstrips': { fase: 'Afwerking', naam: 'Steenstrips op de wapeningslaag lijmen en voegen', eenheid: 'm²', uur: 1.1,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Steenstrips baksteen waalformaat (76 per m²)', per: 1.05, eenheid: 'm²', prijs: 62.44, kg: 25.5,
        bron: { url: 'https://www.steenstrips.nl/boise-baksteenstrip-hvwf-21x5-cm.html', datum: '2026-10-06', wat: '€ 62,44 per m² excl. btw bij 30 m² (lijstprijs € 83,25); 76 stuks per m²; 25 tot 26 kg per m²' } },
      { naam: 'Flexibele steenstriplijm', per: 5, eenheid: 'kg', prijs: 0.9, kg: 1 },
      { naam: 'Voegmortel voor steenstrips', per: 5, eenheid: 'kg', prijs: 0.75, kg: 1 }
    ] },
  'gevel.steenstrips.hoek': { fase: 'Afwerking', naam: 'Hoekstrips aan buitenhoeken en dagkanten plaatsen', eenheid: 'lm', uur: 0.3,
    afval: [],
    mat: [
      /* 6 okt (tweede controle): zelfde steenformaat als gevel.steenstrips (laag van 5 cm + voeg 1,2 cm = 16 strips per lm, niet 14);
         prijs blijft € 1 per hoekstrip (startwaarde), gewicht 0,5 kg per hoekstrip (vlakke strip weegt 0,34 kg volgens de bron bij gevel.steenstrips) */
      { naam: 'Hoekstrips baksteen waalformaat (16 per lm)', per: 1.05, eenheid: 'lm', prijs: 16, kg: 8 },
      { naam: 'Flexibele steenstriplijm', per: 1, eenheid: 'kg', prijs: 0.9, kg: 1 }
    ] },
  'gevel.bekleding.planchetten': { fase: 'Afwerking', naam: 'Gevelbekleding met thermowood planchetten op regelwerk', eenheid: 'm²', uur: 0.7,
    afval: [{ soort: 'hout', kg: 0.6 }],
    mat: [
      /* werkende breedte 12,3 cm: 8,1 lm per m² plus 5 % zaagverlies */
      { naam: 'Thermowood planchet grenen 17 x 131 mm', per: 8.5, eenheid: 'lm', prijs: 4.11, kg: 1,
        bron: { url: 'https://www.houtshop.be/nl/gevelbekleding/thermowood-planchet-grenen-v-groef-d17xb131mm', datum: '2026-10-06', wat: '€ 4,97 per lopende meter incl. btw gedeeld door 1,21' } },
      { naam: 'Inox gevelschroeven', per: 24, eenheid: 'st', prijs: 0.09, kg: 0.004 }
    ] },
  'gevel.bekleding.sidings': { fase: 'Afwerking', naam: 'Gevelbekleding met vezelcementsidings (overlappend) op regelwerk', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'rest', kg: 0.8 }],
    mat: [
      { naam: 'Vezelcementsiding 20 cm (werkend 18,5 cm)', per: 1.1, eenheid: 'm²', prijs: 32.63, kg: 12.2,
        bron: { url: 'https://www.hornbach.nl/p/elephant-gevelbekleding-potdeksel-vezelcement-antraciet-7-5x185-200x2800-mm/12456856/', datum: '2026-10-06', wat: '5 planken € 102,24 incl. btw = € 84,50 excl. btw; 5 x 2,8 m x 0,185 m werkend = 2,59 m²' } },
      { naam: 'Inox nagels of schroeven voor sidings', per: 20, eenheid: 'st', prijs: 0.1, kg: 0.004 },
      { naam: 'EPDM-strook achter de verticale voegen', per: 1, eenheid: 'lm', prijs: 1.2, kg: 0.1 }
    ] },
  'gevel.dagkanten': { fase: 'Afwerking', naam: 'Dagkanten rond ramen en deuren isoleren en afwerken', eenheid: 'lm', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Dagkantisolatie en pleister', per: 1, eenheid: 'lm', prijs: 6, kg: 1 }
    ] },
  'gevel.vensterbank': { fase: 'Afwerking', naam: 'Vensterbank in aluminium vervangen', eenheid: 'lm', uur: 0.6, keuze: 'nieuwe vensterbanken',
    afval: [{ soort: 'rest', kg: 2 }],
    mat: [
      { naam: 'Aluminium vensterbank met eindstukken', per: 1, eenheid: 'lm', prijs: 38, kg: 2 }
    ] },
  'gevel.dorpel.hardsteen': { fase: 'Afwerking', naam: 'Raamdorpel in blauwe hardsteen vervangen', eenheid: 'lm', uur: 1.2, keuze: 'nieuwe raamdorpels',
    afval: [{ soort: 'puin', kg: 30 }],
    mat: [
      { naam: 'Raamdorpel Belgische blauwe hardsteen 18 x 5 cm', per: 1.05, eenheid: 'lm', prijs: 43.87, kg: 25.2,
        bron: { url: 'https://www.gamma.be/nl/assortiment/raamdorpel-belgische-blauwe-steen-100x18x5-cm/p/B631427', datum: '2026-10-06', wat: 'dorpel 100 cm € 53,09 incl. btw gedeeld door 1,21; gewicht 25,2 kg' } },
      { naam: 'Mortel en kit voor dorpels', per: 3, eenheid: 'kg', prijs: 0.6, kg: 1 }
    ] },
  'gevel.plint': { fase: 'Afwerking', naam: 'Plint met XPS en plintpleister', eenheid: 'lm', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'XPS en plintpleister', per: 1, eenheid: 'lm', prijs: 12, kg: 2 }
    ] },
  'gevel.plint.natuursteen': { fase: 'Afwerking', naam: 'Plint in blauwe hardsteen (20 cm hoog, 2 cm dik) plaatsen', eenheid: 'lm', uur: 0.6, keuze: 'natuurstenen plint',
    afval: [],
    mat: [
      { naam: 'Blauwe hardsteen plintstuk 20 x 2 cm', per: 1.05, eenheid: 'lm', prijs: 49.82, kg: 11,
        bron: { url: 'https://www.gamma.be/nl/assortiment/vensterbank-bluestone-101x20-cm-licht-verzoet/p/B599133', datum: '2026-10-06', wat: 'stuk 101 x 20 x 2 cm € 60,89 incl. btw gedeeld door 1,21 en door 1,01 m; gewicht 11,1 kg' } },
      { naam: 'Flexibele lijmmortel natuursteen', per: 2, eenheid: 'kg', prijs: 0.9, kg: 1 },
      { naam: 'Siliconenkit ramen en vensters (koker 290 ml)', per: 0.2, eenheid: 'st', prijs: 8.26, kg: 0.35,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-siliconenkit-ramen-en-vensters-wit-290-ml/p/B307267', datum: '2026-10-06', wat: 'koker 290 ml € 9,99 incl. btw gedeeld door 1,21' } }
    ] },
  'gevel.kroonlijst.aansluiting': { fase: 'Afwerking', naam: 'Aansluiting van de gevelafwerking aan kroonlijst en dakrand', eenheid: 'lm', uur: 0.4,
    afval: [],
    mat: [
      { naam: 'Aansluitprofiel met dichtingsband', per: 1.05, eenheid: 'lm', prijs: 5.5, kg: 0.3 },
      { naam: 'Siliconenkit ramen en vensters (koker 290 ml)', per: 0.3, eenheid: 'st', prijs: 8.26, kg: 0.35,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-siliconenkit-ramen-en-vensters-wit-290-ml/p/B307267', datum: '2026-10-06', wat: 'koker 290 ml € 9,99 incl. btw gedeeld door 1,21' } }
    ] },
  'gevel.voegen.nieuw': { fase: 'Afwerking', naam: 'Gevel hervoegen', eenheid: 'm²', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Voegmortel', per: 5, eenheid: 'kg', prijs: 0.6, kg: 1 }
    ] },
  'gevel.hydrofuge': { fase: 'Afwerking', naam: 'Gevel waterafstotend maken', eenheid: 'm²', uur: 0.08, keuze: 'hydrofuge',
    afval: [],
    mat: [
      /* 6 okt: 3,5 per m² -> 0,25 l x 18,18 per l na het lezen van de bron (rendement 4 m² per l) */
      { naam: 'Hydrofuge', per: 0.25, eenheid: 'l', prijs: 18.18, kg: 1,
        bron: { url: 'https://www.hubo.be/nl/p/levis-hydrofuge-gevel-5l-transparant/9959/', datum: '2026-10-06', wat: '5 l € 110 incl. btw gedeeld door 1,21 en door 5; rendement 4 m² per liter' } }
    ] },

  /* ---- Schilderwerk ---- */
  'gevel.verf': { fase: 'Schilderwerk', naam: 'Gevel schilderen, 2 lagen', eenheid: 'm²', uur: 0.2, keuze: 'gevelverf',
    afval: [],
    mat: [
      { naam: 'Gevelprimer', per: 0.12, eenheid: 'l', prijs: 6, kg: 1.2 },
      /* 6 okt: 12 -> 7,64 per l na het lezen van de bron (6 m² per l per laag) */
      { naam: 'Gevelverf', per: 0.35, eenheid: 'l', prijs: 7.64, kg: 1.4,
        bron: { url: 'https://www.hornbach.nl/p/hornbach-siliconen-gevelverf-wit-10-l/10006237/', datum: '2026-10-06', wat: 'siliconen gevelverf 10 l € 92,49 incl. btw gedeeld door 1,21 en door 10' } }
    ] },
  'gevel.kaleien': { fase: 'Schilderwerk', naam: 'Gevel kaleien (minerale kalei, 2 lagen)', eenheid: 'm²', uur: 0.3, keuze: 'kalei',
    afval: [],
    mat: [
      { naam: 'Fixeermiddel voor kalei', per: 0.15, eenheid: 'l', prijs: 8, kg: 1 },
      { naam: 'Kalei (mineraal, op kalk- en cementbasis)', per: 1.6, eenheid: 'kg', prijs: 2.8, kg: 1 }
    ] },
  'gevel.kalkverf': { fase: 'Schilderwerk', naam: 'Gevel schilderen met kalkverf, 2 lagen', eenheid: 'm²', uur: 0.25, keuze: 'kalkverf',
    afval: [],
    mat: [
      { naam: 'Kalkprimer', per: 0.12, eenheid: 'l', prijs: 9, kg: 1.2 },
      { naam: 'Kalkverf voor buiten', per: 0.3, eenheid: 'l', prijs: 14, kg: 1.3 }
    ] },
});
