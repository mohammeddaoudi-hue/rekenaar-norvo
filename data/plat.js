/* Datatabel: Plat dak. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs */
Object.assign(globalThis.RP_DATA.posten, {
  'plat.afbraak': { fase: 'Afbraak', naam: 'Oude dakbedekking en isolatie van het plat dak verwijderen', eenheid: 'm²', uur: 0.2,
    afval: [{ soort: 'rest', kg: 25 }], mat: [] },
  'plat.dampscherm': { fase: 'Dakopbouw', naam: 'Bitumineus dampscherm plaatsen', eenheid: 'm²', uur: 0.08,
    afval: [],
    mat: [
      { naam: 'Dampscherm', per: 1.1, eenheid: 'm²', prijs: 4.5, kg: 2 }
    ] },
  'plat.isolatie.pir': { fase: 'Dakopbouw', naam: 'PIR-isolatie 12 cm op het plat dak plaatsen', eenheid: 'm²', uur: 0.12, keuze: 'isolatie van het plat dak',
    afval: [],
    mat: [
      { naam: 'PIR-dakplaat 12 cm', per: 1.03, eenheid: 'm²', prijs: 30, kg: 3.9 },
      { naam: 'Bevestiging en lijm', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.3 }
    ] },
  'plat.epdm': { fase: 'Dakbedekking', naam: 'EPDM-dakbedekking volledig verkleefd', eenheid: 'm²', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'EPDM-folie', per: 1.1, eenheid: 'm²', prijs: 14, kg: 1.5 },
      { naam: 'Contactlijm', per: 0.4, eenheid: 'kg', prijs: 9, kg: 1 }
    ] },
  'plat.roofing': { fase: 'Dakbedekking', naam: 'Roofing in 2 lagen gebrand', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Roofing (2 lagen)', per: 2.2, eenheid: 'm²', prijs: 6.5, kg: 4.5 }
    ] },
  'plat.dakrand': { fase: 'Afwerking', naam: 'Aluminium dakrandprofiel plaatsen', eenheid: 'lm', uur: 0.3,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Dakrandprofiel', per: 1, eenheid: 'lm', prijs: 18, kg: 1 }
    ] },
  'plat.opstand': { fase: 'Afwerking', naam: 'Opstanden en aansluitingen tegen muren afwerken', eenheid: 'lm', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Opstandstrook en kit', per: 1, eenheid: 'lm', prijs: 12, kg: 1 }
    ] },
  'plat.afvoer': { fase: 'Afwatering', naam: 'Tapbuis en afvoer van het plat dak vervangen', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 2 }],
    mat: [
      { naam: 'Tapbuis met bladvanger', per: 1, eenheid: 'st', prijs: 45, kg: 2 }
    ] },
  'plat.koepel': { fase: 'Afwerking', naam: 'Lichtkoepel met opstand vervangen', eenheid: 'st', uur: 4, keuze: 'lichtkoepels',
    afval: [{ soort: 'rest', kg: 15 }],
    mat: [
      { naam: 'Lichtkoepel 100 × 100 cm met opstand', per: 1, eenheid: 'st', prijs: 650, kg: 30 }
    ] },
});
