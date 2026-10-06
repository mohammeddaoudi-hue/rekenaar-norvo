/* Datatabel: Hellend dak. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs */
Object.assign(globalThis.RP_DATA.posten, {
  'dak.stelling': { fase: 'Werfinrichting', naam: 'Gevelstelling met dakrandbeveiliging plaatsen en afbreken', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Huur gevelstelling', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true, perWeek: true }
    ] },
  'dak.afbraak': { fase: 'Afbraak', naam: 'Oude pannen, latten en onderdak afbreken en naar de container brengen', eenheid: 'm²', uur: 0.22,
    afval: [{ soort: 'puin', kg: 45 }, { soort: 'hout', kg: 5 }], mat: [] },
  'dak.onderdak': { fase: 'Dakopbouw', naam: 'Onderdakfolie plaatsen', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Onderdakfolie', per: 1.1, eenheid: 'm²', prijs: 1.9, kg: 0.15 }
    ] },
  'dak.tengellatten': { fase: 'Dakopbouw', naam: 'Tengellatten plaatsen', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Tengellat', per: 1.9, eenheid: 'lm', prijs: 0.75, kg: 0.45 }
    ] },
  'dak.panlatten': { fase: 'Dakopbouw', naam: 'Panlatten op maat plaatsen', eenheid: 'm²', uur: 0.1,
    afval: [],
    mat: [
      { naam: 'Panlat', per: 4.2, eenheid: 'lm', prijs: 0.85, kg: 0.55 }
    ] },
  'dak.sarking120': { fase: 'Dakopbouw', naam: 'Sarking-isolatie PIR 12 cm plaatsen', eenheid: 'm²', uur: 0.25, keuze: 'sarking-isolatie',
    afval: [],
    mat: [
      { naam: 'PIR-sarkingplaat 12 cm', per: 1.05, eenheid: 'm²', prijs: 38, kg: 3.9 },
      { naam: 'Sarkingschroeven en tape', per: 1, eenheid: 'm²', prijs: 4, kg: 0.3 }
    ] },
  'dak.pannen.klei': { fase: 'Dakbedekking', naam: 'Kleipannen leggen (klein formaat, 20,7 per m²)', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Kleipan', per: 21.3, eenheid: 'st', prijs: 0.95, kg: 2.1 }
    ] },
  'dak.pannen.beton': { fase: 'Dakbedekking', naam: 'Betonpannen leggen (groot formaat, 10 per m²)', eenheid: 'm²', uur: 0.2,
    afval: [],
    mat: [
      { naam: 'Betonpan', per: 10.3, eenheid: 'st', prijs: 1.1, kg: 4.4 }
    ] },
  'dak.nok': { fase: 'Afwerking', naam: 'Nok afwerken met nokpannen en ondervorst', eenheid: 'lm', uur: 0.35,
    afval: [],
    mat: [
      { naam: 'Nokpan', per: 3, eenheid: 'st', prijs: 5.5, kg: 3.5 },
      { naam: 'Ondervorst', per: 1, eenheid: 'lm', prijs: 6, kg: 0.3 }
    ] },
  'dak.gevelpannen': { fase: 'Afwerking', naam: 'Vrije dakrand afwerken met gevelpannen', eenheid: 'lm', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'Gevelpan', per: 4.1, eenheid: 'st', prijs: 6.5, kg: 3 }
    ] },
  'dak.schouw': { fase: 'Afwerking', naam: 'Schouw aansluiten met loodslabben', eenheid: 'st', uur: 5,
    afval: [{ soort: 'rest', kg: 5 }],
    mat: [
      { naam: 'Lood en afdichting voor schouw', per: 1, eenheid: 'st', prijs: 180, kg: 18 }
    ] },
  'dak.dakraam': { fase: 'Afwerking', naam: 'Dakraam plaatsen met gootstuk', eenheid: 'st', uur: 5, keuze: 'dakramen',
    afval: [],
    mat: [
      { naam: 'Dakraam 78 × 118 cm met gootstuk', per: 1, eenheid: 'st', prijs: 620, kg: 42 }
    ] },
  'dak.goot.zink': { fase: 'Afwatering', naam: 'Zinken hanggoot vervangen', eenheid: 'lm', uur: 0.6, keuze: 'nieuwe goten',
    afval: [{ soort: 'rest', kg: 3 }],
    mat: [
      { naam: 'Zinken goot met haken', per: 1, eenheid: 'lm', prijs: 32, kg: 2.5 }
    ] },
  'dak.afvoer.zink': { fase: 'Afwatering', naam: 'Zinken regenafvoer vervangen', eenheid: 'lm', uur: 0.4, keuze: 'nieuwe afvoeren',
    afval: [{ soort: 'rest', kg: 1.5 }],
    mat: [
      { naam: 'Zinken afvoerbuis met beugels', per: 1, eenheid: 'lm', prijs: 24, kg: 1.6 }
    ] },
});
