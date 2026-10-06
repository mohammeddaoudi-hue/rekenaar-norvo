/* Datatabel: Binnen. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs */
Object.assign(globalThis.RP_DATA.posten, {
  'binnen.afbraak.wand': { fase: 'Afbraak', naam: 'Niet-dragende wand slopen en afvoeren', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'puin', kg: 120 }], mat: [] },
  'binnen.behang.weg': { fase: 'Voorbereiding', naam: 'Behang verwijderen', eenheid: 'm²', uur: 0.2,
    afval: [{ soort: 'rest', kg: 0.3 }], mat: [] },
  'binnen.gyproc.wand': { fase: 'Wanden en plafonds', naam: 'Gyprocwand op metal stud 75 mm, dubbel beplaat en geïsoleerd', eenheid: 'm²', uur: 0.9,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Metal stud profielen', per: 1, eenheid: 'm²', prijs: 3.5, kg: 2 },
      { naam: 'Gyprocplaat 12,5 mm', per: 2.1, eenheid: 'm²', prijs: 4.5, kg: 9.5 },
      { naam: 'Minerale wol 60 mm', per: 1.05, eenheid: 'm²', prijs: 5, kg: 1.5 },
      { naam: 'Schroeven en voegband', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.2 }
    ] },
  'binnen.gyproc.voorzet': { fase: 'Wanden en plafonds', naam: 'Voorzetwand gyproc op metal stud', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Profielen en gyprocplaat', per: 1, eenheid: 'm²', prijs: 9, kg: 12 }
    ] },
  'binnen.gyproc.plafond': { fase: 'Wanden en plafonds', naam: 'Verlaagd gyprocplafond op metalen structuur', eenheid: 'm²', uur: 0.8,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Plafondstructuur en gyprocplaat', per: 1, eenheid: 'm²', prijs: 13, kg: 12 }
    ] },
  'binnen.plamuur': { fase: 'Wanden en plafonds', naam: 'Gyproc voegen en plamuren, schuurklaar', eenheid: 'm²', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'Voegvuller en plamuur', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.8 }
    ] },
  'binnen.pleister': { fase: 'Pleisterwerk', naam: 'Pleisterwerk gips op metselwerk, 1 cm', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'puin', kg: 0.5 }],
    mat: [
      { naam: 'Pleistergips', per: 10, eenheid: 'kg', prijs: 0.45, kg: 1 }
    ] },
  'binnen.schilder.wand': { fase: 'Schilderwerk', naam: 'Wand schilderen, grondlaag en 2 lagen', eenheid: 'm²', uur: 0.18,
    afval: [],
    mat: [
      { naam: 'Muurverf en grondlaag', per: 0.4, eenheid: 'l', prijs: 9, kg: 1.4 }
    ] },
  'binnen.schilder.plafond': { fase: 'Schilderwerk', naam: 'Plafond schilderen, 2 lagen', eenheid: 'm²', uur: 0.2,
    afval: [],
    mat: [
      { naam: 'Plafondverf', per: 0.35, eenheid: 'l', prijs: 9, kg: 1.4 }
    ] },
  'binnen.schilder.hout': { fase: 'Schilderwerk', naam: 'Houtwerk schilderen (deuren, plinten, ramen), 2 lagen', eenheid: 'm²', uur: 0.6,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 0.3, eenheid: 'l', prijs: 20, kg: 1.3 }
    ] },
  'binnen.deur': { fase: 'Afwerking', naam: 'Binnendeur met kozijn plaatsen', eenheid: 'st', uur: 3, keuze: 'nieuwe binnendeuren',
    afval: [],
    mat: [
      { naam: 'Binnendeur met kozijn en beslag', per: 1, eenheid: 'st', prijs: 260, kg: 30 }
    ] },
});
