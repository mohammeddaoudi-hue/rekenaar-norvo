/* Datatabel: Ramen en deuren. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met 'bron' is op 6 oktober 2026 op die pagina gelezen (consumentenprijs incl. btw gedeeld door 1,21); zonder bron is het een startwaarde.
   Ramen worden per m² raam gerekend (buitenmaat van het kader); deuren en poorten per stuk. */
Object.assign(globalThis.RP_DATA.posten, {
  /* ---- Afbraak ---- */
  'ramen.afbraak': { fase: 'Afbraak', naam: 'Oud raam uitbreken en afvoeren', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 35 }], mat: [] },
  'ramen.deur.afbraak': { fase: 'Afbraak', naam: 'Oude buitendeur met kozijn uitbreken en afvoeren', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 45 }], mat: [] },
  'ramen.poort.afbraak': { fase: 'Afbraak', naam: 'Oude garagepoort uitbreken en afvoeren', eenheid: 'st', uur: 3,
    afval: [{ soort: 'metaal', kg: 70 }, { soort: 'hout', kg: 20 }], mat: [] },
  'ramen.rolluik.afbraak': { fase: 'Afbraak', naam: 'Oud rolluik met kast verwijderen en afvoeren', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 25 }], mat: [] },

  /* ---- Ruwbouw ---- */
  'ramen.latei': { fase: 'Ruwbouw', naam: 'Nieuwe betonlatei plaatsen bij het vergroten van een raamopening', eenheid: 'lm', uur: 2,
    afval: [{ soort: 'puin', kg: 60 }],
    mat: [
      { naam: 'Prefab betonlatei 14 x 14 cm', per: 1.1, eenheid: 'lm', prijs: 28, kg: 47 },
      { naam: 'Metselmortel', per: 5, eenheid: 'kg', prijs: 0.22, kg: 1 }
    ] },

  /* ---- Schrijnwerk: ramen ---- */
  'ramen.pvc.dubbel': { fase: 'Schrijnwerk', naam: 'PVC-raam met dubbel glas plaatsen (per m² raam)', eenheid: 'm²', uur: 2,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'PVC-raam dubbel glas (Uw 1,4)', per: 1, eenheid: 'm²', prijs: 271.66, kg: 34.3,
        bron: { url: 'https://www.hornbach.nl/p/aron-basic-kunststof-raamkozijn-draai-kiep-links-creme-wit-b-x-h-90-x-120-cm/5878989/', datum: '2026-10-06', wat: 'draaikiepraam 90 x 120 cm (1,08 m²) € 355 incl. btw gedeeld door 1,21 en door 1,08; 37 kg; Ug 1,1' } },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 0.4, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 4, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.pvc.driedubbel': { fase: 'Schrijnwerk', naam: 'PVC-raam met driedubbel glas plaatsen (per m² raam)', eenheid: 'm²', uur: 2.2,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      /* startwaarde: raam met dubbel glas uit de bron plus de meerprijs van driedubbel glas en een zwaarder profiel */
      { naam: 'PVC-raam driedubbel glas (Uw 0,9)', per: 1, eenheid: 'm²', prijs: 300, kg: 45 },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 0.4, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 4, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.alu': { fase: 'Schrijnwerk', naam: 'Aluminium raam met dubbel glas plaatsen (per m² raam)', eenheid: 'm²', uur: 2.2,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Aluminium raam, thermisch onderbroken, dubbel glas', per: 1, eenheid: 'm²', prijs: 420, kg: 32 },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 0.4, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 4, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.hout': { fase: 'Schrijnwerk', naam: 'Houten raam (meranti, fabrieksmatig geschilderd) met dubbel glas plaatsen (per m² raam)', eenheid: 'm²', uur: 2.2,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Houten raam meranti, afgewerkt, dubbel glas', per: 1, eenheid: 'm²', prijs: 450, kg: 38 },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 0.4, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 4, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.schuifraam': { fase: 'Schrijnwerk', naam: 'Hefschuifraam in PVC of aluminium plaatsen (per m² raam)', eenheid: 'm²', uur: 2.5,
    afval: [{ soort: 'rest', kg: 0.8 }],
    mat: [
      { naam: 'Hefschuifraam met dubbel glas', per: 1, eenheid: 'm²', prijs: 520, kg: 45 },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 0.4, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 4, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.glas.vervangen': { fase: 'Schrijnwerk', naam: 'Glas vervangen door HR++ dubbel glas in een bestaand raam (per m² glas)', eenheid: 'm²', uur: 1,
    afval: [{ soort: 'rest', kg: 20 }],
    mat: [
      /* 6 okt (tweede controle): de pagina toont "€ 38,79 excl. BTW / € 46,94 incl. BTW"; 46,94 was als excl. geboekt */
      { naam: 'HR++ dubbel glas 4/16/4 (Ug 1,0)', per: 1.03, eenheid: 'm²', prijs: 38.79, kg: 20,
        bron: { url: 'https://www.glasdiscount.nl/dubbel-glas-hr-premium', datum: '2026-10-06', wat: 'vanaf-prijs per m² HR++ Premium: € 38,79 excl. btw (€ 46,94 incl. btw)' } },
      { naam: 'Beglazingskit, steunblokjes en glaslatten', per: 1, eenheid: 'm²', prijs: 6, kg: 0.3 }
    ] },
  'ramen.glas.driedubbel': { fase: 'Schrijnwerk', naam: 'Glas vervangen door HR+++ driedubbel glas in een bestaand raam (per m² glas)', eenheid: 'm²', uur: 1.1,
    afval: [{ soort: 'rest', kg: 20 }],
    mat: [
      /* 6 okt (tweede controle): de pagina toont "€ 55,30 excl. BTW / € 66,91 incl. BTW"; 66,91 was als excl. geboekt */
      { naam: 'HR+++ driedubbel glas 4/spouw/4/spouw/4', per: 1.03, eenheid: 'm²', prijs: 55.3, kg: 30,
        bron: { url: 'https://www.glasdiscount.nl/driedubbel-isolatieglas-hr', datum: '2026-10-06', wat: 'vanaf-prijs per m² HR+++: € 55,30 excl. btw (€ 66,91 incl. btw)' } },
      { naam: 'Beglazingskit, steunblokjes en glaslatten', per: 1, eenheid: 'm²', prijs: 6, kg: 0.3 }
    ] },
  'ramen.rooster': { fase: 'Schrijnwerk', naam: 'Zelfregelend ventilatierooster op het raam plaatsen', eenheid: 'st', uur: 0.6, keuze: 'ventilatieroosters',
    afval: [],
    mat: [
      { naam: 'Ventilatierooster zelfregelend 70 cm', per: 1, eenheid: 'st', prijs: 172.73, kg: 1.45,
        bron: { url: 'https://www.brico.be/nl/verwarmingen-airco-s/luchtbehandeling/ventilatieroosters-luchtrooster/muur-ventilatieroosters/renson-ventilatierooster-transivent-700mm/5344508', datum: '2026-10-06', wat: 'Renson Transivent 700 mm € 209 incl. btw gedeeld door 1,21; 1,45 kg' } }
    ] },
  'ramen.folie.kit': { fase: 'Schrijnwerk', naam: 'Raamaansluiting luchtdicht afwerken met folie binnen, dampopen folie buiten en kit (per lm omtrek)', eenheid: 'lm', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'Luchtdichte aansluitfolie binnen', per: 1.05, eenheid: 'lm', prijs: 2.4, kg: 0.05 },
      { naam: 'Dampopen aansluitfolie buiten', per: 1.05, eenheid: 'lm', prijs: 2.6, kg: 0.05 },
      { naam: 'Siliconenkit ramen en vensters (koker 290 ml)', per: 0.15, eenheid: 'st', prijs: 8.26, kg: 0.35,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-siliconenkit-ramen-en-vensters-wit-290-ml/p/B307267', datum: '2026-10-06', wat: 'koker 290 ml € 9,99 incl. btw gedeeld door 1,21' } },
      { naam: 'Hechtprimer voor aansluitfolie', per: 0.05, eenheid: 'l', prijs: 12, kg: 1 }
    ] },

  /* ---- Schrijnwerk: deuren en poorten ---- */
  'ramen.voordeur': { fase: 'Schrijnwerk', naam: 'Voordeur in PVC of aluminium met paneel en meerpuntssluiting plaatsen', eenheid: 'st', uur: 6,
    afval: [{ soort: 'rest', kg: 3 }],
    mat: [
      { naam: 'Voordeur met kozijn, paneel en meerpuntssluiting', per: 1, eenheid: 'st', prijs: 1650, kg: 90 },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 1, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 8, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.achterdeur': { fase: 'Schrijnwerk', naam: 'Achterdeur in PVC met halfglas plaatsen', eenheid: 'st', uur: 5,
    afval: [{ soort: 'rest', kg: 3 }],
    mat: [
      { naam: 'Buitendeur PVC halfglas 98 x 218 cm met kozijn', per: 1, eenheid: 'st', prijs: 469.42, kg: 58,
        bron: { url: 'https://www.gamma.be/nl/assortiment/buitendeur-esterno-pvc-e01-halfglas-wit-links-98x218-cm/p/B545406', datum: '2026-10-06', wat: '€ 568 incl. btw gedeeld door 1,21; 58 kg' } },
      { naam: 'PU-pistoolschuim (bus 750 ml)', per: 1, eenheid: 'st', prijs: 10.24, kg: 0.9,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-pu-pistoolschuim-750-ml/p/B602924', datum: '2026-10-06', wat: 'bus 750 ml € 12,39 incl. btw gedeeld door 1,21' } },
      { naam: 'Kozijnankers en schroeven', per: 8, eenheid: 'st', prijs: 0.35, kg: 0.03 }
    ] },
  'ramen.sectionaalpoort': { fase: 'Schrijnwerk', naam: 'Sectionaalpoort met motor plaatsen (tot 250 x 212 cm)', eenheid: 'st', uur: 10,
    afval: [{ soort: 'rest', kg: 10 }],
    mat: [
      { naam: 'Sectionaalpoort gemotoriseerd 250 x 212,5 cm', per: 1, eenheid: 'st', prijs: 825.62, kg: 120,
        bron: { url: 'https://www.brico.be/nl/tuin-terras-buitenleven/schuttingen-hekwerken-afrastering/toegangspoorten/schuifpoorten/gardengate-sectionaalpoort-utah-wit-250x212-5cm/10047138', datum: '2026-10-06', wat: '€ 999 incl. btw gedeeld door 1,21; gemotoriseerd; 120 kg' } },
      { naam: 'Bevestigingsset en afdichting poort', per: 1, eenheid: 'st', prijs: 25, kg: 2 }
    ] },

  /* ---- Schrijnwerk: zonwering ---- */
  'ramen.rolluik': { fase: 'Schrijnwerk', naam: 'Rolluik in aluminium met motor plaatsen (per m² rolluik)', eenheid: 'm²', uur: 1, keuze: 'rolluiken',
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Rolluik aluminium met motor', per: 1, eenheid: 'm²', prijs: 131.94, kg: 9,
        bron: { url: 'https://www.brico.be/nl/hout-ramen-trappen-deuren/luiken/rolluiken/elektrische-rolluiken/avosdim-aluminium-elektrisch-rolluik-met-radiobediening-antraciet-b-120-x-h-120-cm/10534943', datum: '2026-10-06', wat: 'rolluik 120 x 120 cm (1,44 m²) € 229,90 incl. btw gedeeld door 1,21 en door 1,44' } },
      { naam: 'Bevestiging en bekabeling rolluik', per: 1, eenheid: 'st', prijs: 6, kg: 0.3 }
    ] },
  'ramen.screen': { fase: 'Schrijnwerk', naam: 'Screen (buitenzonwering met doek) met motor plaatsen (per m² raam)', eenheid: 'm²', uur: 0.9, keuze: 'screens',
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'Screen met doek en motor', per: 1, eenheid: 'm²', prijs: 210, kg: 5 },
      { naam: 'Bevestiging en bekabeling screen', per: 1, eenheid: 'st', prijs: 6, kg: 0.3 }
    ] },

  /* ---- Pleisterwerk en afwerking binnen ---- */
  'ramen.dagkant.pleister': { fase: 'Pleisterwerk', naam: 'Dagkanten binnen rond het nieuwe raam pleisteren en afwerken', eenheid: 'lm', uur: 0.5,
    afval: [{ soort: 'puin', kg: 1 }],
    mat: [
      { naam: 'Hoekprofiel met net', per: 1.05, eenheid: 'lm', prijs: 1.2, kg: 0.15 },
      { naam: 'Pleistergips dagkanten', per: 2.5, eenheid: 'kg', prijs: 0.45, kg: 1 },
      { naam: 'Hechtprimer dagkanten', per: 0.05, eenheid: 'l', prijs: 6, kg: 1 }
    ] },
  'ramen.dagkant.mdf': { fase: 'Afwerking', naam: 'Dagkanten binnen afwerken met gegronde MDF-omkasting', eenheid: 'lm', uur: 0.6,
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'MDF-omkasting 18 mm, gegrond', per: 1.05, eenheid: 'lm', prijs: 9, kg: 3.4 },
      { naam: 'Montagelijm en acrylkit (koker)', per: 0.3, eenheid: 'st', prijs: 6, kg: 0.4 }
    ] },
  'ramen.vensterbank.binnen': { fase: 'Afwerking', naam: 'Vensterbank binnen in marmercomposiet (20 cm) plaatsen', eenheid: 'lm', uur: 0.6, keuze: 'vensterbanken binnen',
    afval: [],
    mat: [
      { naam: 'Vensterbank composiet 20 x 2 cm', per: 1.05, eenheid: 'lm', prijs: 35.19, kg: 9.6,
        bron: { url: 'https://www.hornbach.nl/p/vensterbank-151x20x2-cm-composiet-wit/5814941/', datum: '2026-10-06', wat: 'vensterbank 151 x 20 x 2 cm € 64,30 incl. btw gedeeld door 1,21 en door 1,51 m' } },
      { naam: 'Montagelijm en acrylkit (koker)', per: 0.3, eenheid: 'st', prijs: 6, kg: 0.4 },
      { naam: 'Siliconenkit ramen en vensters (koker 290 ml)', per: 0.2, eenheid: 'st', prijs: 8.26, kg: 0.35,
        bron: { url: 'https://www.gamma.be/nl/assortiment/soudal-siliconenkit-ramen-en-vensters-wit-290-ml/p/B307267', datum: '2026-10-06', wat: 'koker 290 ml € 9,99 incl. btw gedeeld door 1,21' } }
    ] },
});
