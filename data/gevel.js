/* Datatabel: Gevel. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs */
Object.assign(globalThis.RP_DATA.posten, {
  'gevel.stelling': { fase: 'Werfinrichting', naam: 'Gevelstelling plaatsen en afbreken', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Huur gevelstelling', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true, perWeek: true }
    ] },
  'gevel.reinigen': { fase: 'Voorbereiding', naam: 'Gevel reinigen onder hoge druk', eenheid: 'm²', uur: 0.08,
    afval: [],
    mat: [
      { naam: 'Reinigingsmiddel', per: 1, eenheid: 'm²', prijs: 0.5, kg: 0.1 }
    ] },
  'gevel.voegen.uitslijpen': { fase: 'Voorbereiding', naam: 'Oude voegen uitslijpen', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'puin', kg: 8 }],
    mat: [
      { naam: 'Slijpschijven', per: 1, eenheid: 'm²', prijs: 0.4, kg: 0 }
    ] },
  'gevel.voegen.nieuw': { fase: 'Afwerking', naam: 'Gevel hervoegen', eenheid: 'm²', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Voegmortel', per: 5, eenheid: 'kg', prijs: 0.6, kg: 1 }
    ] },
  'gevel.afvoer.los': { fase: 'Voorbereiding', naam: 'Regenafvoer losmaken en na de isolatie herplaatsen', eenheid: 'st', uur: 2,
    afval: [],
    mat: [
      { naam: 'Beugels en verlengstukken', per: 1, eenheid: 'st', prijs: 25, kg: 1 }
    ] },
  'gevel.isolatie.eps': { fase: 'Isolatie', naam: 'Gevelisolatie EPS 14 cm lijmen en pluggen', eenheid: 'm²', uur: 0.45, keuze: 'gevelisolatie',
    afval: [],
    mat: [
      { naam: 'EPS-gevelplaat 14 cm', per: 1.05, eenheid: 'm²', prijs: 14, kg: 2.5 },
      { naam: 'Isolatielijm', per: 5, eenheid: 'kg', prijs: 0.55, kg: 1 },
      { naam: 'Isolatiepluggen', per: 6, eenheid: 'st', prijs: 0.35, kg: 0.02 }
    ] },
  'gevel.wapening': { fase: 'Afwerking', naam: 'Wapeningslaag met glasvezelnet', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Wapeningsmortel', per: 5, eenheid: 'kg', prijs: 0.6, kg: 1 },
      { naam: 'Glasvezelnet', per: 1.1, eenheid: 'm²', prijs: 1.3, kg: 0.16 }
    ] },
  'gevel.crepi': { fase: 'Afwerking', naam: 'Crepi (siliconenharspleister 1,5 mm) aanbrengen', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Voorstrijk', per: 0.25, eenheid: 'kg', prijs: 3, kg: 1 },
      { naam: 'Siliconenharspleister', per: 2.5, eenheid: 'kg', prijs: 2.2, kg: 1 }
    ] },
  'gevel.profielen': { fase: 'Isolatie', naam: 'Sokkel-, hoek- en dagkantprofielen plaatsen', eenheid: 'lm', uur: 0.15,
    afval: [],
    mat: [
      { naam: 'Profielen met net', per: 1, eenheid: 'lm', prijs: 3.5, kg: 0.3 }
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
  'gevel.plint': { fase: 'Afwerking', naam: 'Plint met XPS en plintpleister', eenheid: 'lm', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'XPS en plintpleister', per: 1, eenheid: 'lm', prijs: 12, kg: 2 }
    ] },
  'gevel.verf': { fase: 'Afwerking', naam: 'Gevel schilderen, 2 lagen', eenheid: 'm²', uur: 0.2, keuze: 'gevelverf',
    afval: [],
    mat: [
      { naam: 'Gevelverf', per: 0.35, eenheid: 'l', prijs: 12, kg: 1.4 }
    ] },
  'gevel.hydrofuge': { fase: 'Afwerking', naam: 'Gevel waterafstotend maken', eenheid: 'm²', uur: 0.08, keuze: 'hydrofuge',
    afval: [],
    mat: [
      { naam: 'Hydrofuge', per: 1, eenheid: 'm²', prijs: 3.5, kg: 0.3 }
    ] },
});
