/* Datatabel: Binnen. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met bron: prijs op 6 okt 2026 gelezen op de pagina in bron.url (consumentenprijs incl. btw gedeeld door 1,21).
   Een materiaal zonder bron: startwaarde uit vakkennis. Gewichten: technische fiches en vakkennis. */
Object.assign(globalThis.RP_DATA.posten, {
  'binnen.afbraak.wand': { fase: 'Afbraak', naam: 'Niet-dragende wand slopen en afvoeren', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'puin', kg: 120 }], mat: [] },
  'binnen.afbraak.plafond': { fase: 'Afbraak', naam: 'Oud plafond (gyproc of pleister op latten) slopen en afvoeren', eenheid: 'm²', uur: 0.3,
    afval: [{ soort: 'rest', kg: 15 }], mat: [] },
  'binnen.afbraak.pleister': { fase: 'Afbraak', naam: 'Losse of oude pleister van de muren afkappen en afvoeren', eenheid: 'm²', uur: 0.4,
    afval: [{ soort: 'puin', kg: 20 }], mat: [] },
  'binnen.deur.opening': { fase: 'Ruwbouw', naam: 'Deuropening maken in een binnenmuur en latei plaatsen', eenheid: 'st', uur: 6,
    afval: [{ soort: 'puin', kg: 250 }],
    mat: [
      { naam: 'Latei in beton of staal', per: 1, eenheid: 'st', prijs: 60, kg: 40 },
      { naam: 'Mortel en stut', per: 1, eenheid: 'st', prijs: 15, kg: 25 }
    ] },
  'binnen.wand.snelbouw': { fase: 'Ruwbouw', naam: 'Binnenmuur in snelbouwsteen 14 cm metselen', eenheid: 'm²', uur: 1,
    afval: [{ soort: 'puin', kg: 3 }],
    mat: [
      { naam: 'Snelbouwsteen 29 × 14 × 19 cm', per: 17.5, eenheid: 'st', prijs: 1.1, kg: 7 },
      { naam: 'Metselmortel', per: 25, eenheid: 'kg', prijs: 0.25, kg: 1 }
    ] },
  'binnen.behang.weg': { fase: 'Voorbereiding', naam: 'Behang verwijderen', eenheid: 'm²', uur: 0.2,
    afval: [{ soort: 'rest', kg: 0.3 }], mat: [] },
  'binnen.schuren': { fase: 'Voorbereiding', naam: 'Muren schuren en herstellen vóór het schilderen', eenheid: 'm²', uur: 0.12,
    afval: [{ soort: 'rest', kg: 0.2 }],
    mat: [
      { naam: 'Vulmiddel en schuurpapier', per: 1, eenheid: 'm²', prijs: 0.6, kg: 0.2 }
    ] },
  'binnen.primer': { fase: 'Voorbereiding', naam: 'Wanden voorstrijken vóór behang of spuitpleister', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Fixeerprimer', per: 0.12, eenheid: 'l', prijs: 7, kg: 1 }
    ] },
  'binnen.zolder.isolatie': { fase: 'Isolatie', naam: 'Zoldervloer isoleren tussen de balken met glaswol en dampscherm', eenheid: 'm²', uur: 0.15,
    afval: [],
    mat: [
      { naam: 'Glaswol 16 cm', per: 1.05, eenheid: 'm²', prijs: 7.7, kg: 1.9,
        bron: { url: 'https://www.hornbach.nl/p/isover-zolderisolatie-glaswoldeken-rd-4-0-5000x600x160-mm/5995842/', datum: '2026-10-06', wat: 'Isover zolderisolatie 160 mm € 9,32 per m² incl. btw gedeeld door 1,21; 5,76 kg per rol van 3 m²' } },
      { naam: 'Dampscherm met tape', per: 1.1, eenheid: 'm²', prijs: 1.2, kg: 0.15 }
    ] },
  'binnen.dakisolatie': { fase: 'Isolatie', naam: 'Hellend dak van binnenuit isoleren tussen de kepers met glaswol en dampscherm', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Glaswol 16 cm', per: 1.05, eenheid: 'm²', prijs: 7.7, kg: 1.9,
        bron: { url: 'https://www.hornbach.nl/p/isover-zolderisolatie-glaswoldeken-rd-4-0-5000x600x160-mm/5995842/', datum: '2026-10-06', wat: 'Isover zolderisolatie 160 mm € 9,32 per m² incl. btw gedeeld door 1,21; 5,76 kg per rol van 3 m²' } },
      { naam: 'Dampscherm met tape', per: 1.1, eenheid: 'm²', prijs: 1.2, kg: 0.15 }
    ] },
  /* Gyprocplaat 4,5 -> 3,07 en kg 9,5 -> 8,7 op 6 okt 2026: Hornbach-prijs en gewicht van een Siniat-plaat 2600 × 600 × 12,5 mm.
     Tweede controle 6 okt 2026: dubbel beplaat = 2 platen per zijde, dus 4 lagen per m² wand: plaat 2,1 -> 4,2 m², schroeven en voegband 1,5 -> 2, uur 0,9 -> 1
     (2 man plaatsen 14 tot 16 m² dubbel beplaate wand per dag). */
  'binnen.gyproc.wand': { fase: 'Wanden en plafonds', naam: 'Gyprocwand op metal stud 75 mm, dubbel beplaat en geïsoleerd', eenheid: 'm²', uur: 1,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Metal stud profielen', per: 1, eenheid: 'm²', prijs: 3.5, kg: 2 },
      { naam: 'Gyprocplaat 12,5 mm', per: 4.2, eenheid: 'm²', prijs: 3.07, kg: 8.7,
        bron: { url: 'https://www.hornbach.nl/p/siniat-gipswandplaat-afgeschuinde-kant-2600-x-600-x-12-5-mm/8415059/', datum: '2026-10-06', wat: 'Siniat gipsplaat 12,5 mm € 5,80 per plaat van 1,56 m² incl. btw gedeeld door 1,21; 13,57 kg per plaat' } },
      { naam: 'Minerale wol 60 mm', per: 1.05, eenheid: 'm²', prijs: 5, kg: 1.5 },
      { naam: 'Schroeven en voegband', per: 1, eenheid: 'm²', prijs: 2, kg: 0.3 }
    ] },
  'binnen.gyproc.voorzet': { fase: 'Wanden en plafonds', naam: 'Voorzetwand gyproc op metal stud', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Profielen en gyprocplaat', per: 1, eenheid: 'm²', prijs: 9, kg: 12 }
    ] },
  'binnen.voorzet.akoestisch': { fase: 'Wanden en plafonds', naam: 'Akoestische voorzetwand: vrijstaand metal stud, glaswol en dubbele gyproc', eenheid: 'm²', uur: 0.8, keuze: 'akoestische voorzetwand',
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Metal stud profielen 50 mm', per: 1, eenheid: 'm²', prijs: 3.5, kg: 1.8 },
      { naam: 'Akoestische glaswol 45 mm', per: 1.05, eenheid: 'm²', prijs: 2.81, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/isover-sonepanel-glaswol-isolatieplaat-rd-1-20-1350x600x45-mm/10484206/', datum: '2026-10-06', wat: 'Isover Sonepanel 45 mm € 3,40 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Gyprocplaat 12,5 mm', per: 2.1, eenheid: 'm²', prijs: 3.07, kg: 8.7,
        bron: { url: 'https://www.hornbach.nl/p/siniat-gipswandplaat-afgeschuinde-kant-2600-x-600-x-12-5-mm/8415059/', datum: '2026-10-06', wat: 'Siniat gipsplaat 12,5 mm € 5,80 per plaat van 1,56 m² incl. btw gedeeld door 1,21; 13,57 kg per plaat' } },
      { naam: 'Trillingsdempende band, schroeven en voegband', per: 1, eenheid: 'm²', prijs: 2, kg: 0.3 }
    ] },
  'binnen.gyproc.plafond': { fase: 'Wanden en plafonds', naam: 'Verlaagd gyprocplafond op metalen structuur', eenheid: 'm²', uur: 0.8,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Plafondstructuur en gyprocplaat', per: 1, eenheid: 'm²', prijs: 13, kg: 12 }
    ] },
  'binnen.gyproc.schuin': { fase: 'Wanden en plafonds', naam: 'Gyproc tegen het schuine dak (onder de kepers) plaatsen', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Gyprocplaat 12,5 mm', per: 1.08, eenheid: 'm²', prijs: 3.07, kg: 8.7,
        bron: { url: 'https://www.hornbach.nl/p/siniat-gipswandplaat-afgeschuinde-kant-2600-x-600-x-12-5-mm/8415059/', datum: '2026-10-06', wat: 'Siniat gipsplaat 12,5 mm € 5,80 per plaat van 1,56 m² incl. btw gedeeld door 1,21; 13,57 kg per plaat' } },
      { naam: 'Latten, schroeven en voegband', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.8 }
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
  'binnen.pleister.plafond': { fase: 'Pleisterwerk', naam: 'Pleisterwerk gips op een plafond, 1 cm', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'puin', kg: 0.5 }],
    mat: [
      { naam: 'Pleistergips', per: 10, eenheid: 'kg', prijs: 0.45, kg: 1 }
    ] },
  'binnen.spuitpleister': { fase: 'Pleisterwerk', naam: 'Spuitpleister op wanden en plafonds, 2 lagen', eenheid: 'm²', uur: 0.12,
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'Spuitpleister (pasta)', per: 1.2, eenheid: 'kg', prijs: 1.1, kg: 1 },
      { naam: 'Afplaktape en afdekfolie', per: 1, eenheid: 'm²', prijs: 0.4, kg: 0.05 }
    ] },
  'binnen.behang.vlies': { fase: 'Afwerking', naam: 'Vliesbehang plaatsen', eenheid: 'm²', uur: 0.25,
    afval: [{ soort: 'rest', kg: 0.1 }],
    mat: [
      { naam: 'Vliesbehang (rol 10,05 × 0,53 m)', per: 0.22, eenheid: 'rol', prijs: 25.21, kg: 0.8,
        bron: { url: 'https://www.hornbach.nl/p/a-s-creation-vliesbehang-1440-10-effen-wit/8805814/', datum: '2026-10-06', wat: 'A.S. Création vliesbehang € 30,50 per rol van 5,33 m² incl. btw gedeeld door 1,21' } },
      { naam: 'Behanglijm voor vliesbehang', per: 0.15, eenheid: 'kg', prijs: 6, kg: 1 }
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
  /* Lakverf 20 -> 20,74 op 6 okt 2026: Hornbach-prijs van Flexa binnenlak zijdeglans 2,5 l; dezelfde prijs in elke lakpost zodat de materiaallijst ze optelt. */
  'binnen.schilder.hout': { fase: 'Schilderwerk', naam: 'Houtwerk schilderen (deuren, plinten, ramen), 2 lagen', eenheid: 'm²', uur: 0.6,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 0.3, eenheid: 'l', prijs: 20.74, kg: 1.3,
        bron: { url: 'https://www.hornbach.nl/p/flexa-strak-in-de-lak-binnenlak-zijdeglans-wit-2-5-l/4693481/', datum: '2026-10-06', wat: 'Flexa binnenlak zijdeglans € 62,75 per 2,5 l incl. btw gedeeld door 1,21 en door 2,5 l' } }
    ] },
  'binnen.schilder.deur': { fase: 'Schilderwerk', naam: 'Binnendeur met kozijn schilderen, 2 lagen', eenheid: 'st', uur: 3,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 0.6, eenheid: 'l', prijs: 20.74, kg: 1.3,
        bron: { url: 'https://www.hornbach.nl/p/flexa-strak-in-de-lak-binnenlak-zijdeglans-wit-2-5-l/4693481/', datum: '2026-10-06', wat: 'Flexa binnenlak zijdeglans € 62,75 per 2,5 l incl. btw gedeeld door 1,21 en door 2,5 l' } },
      { naam: 'Schuurpapier en afplaktape', per: 0.25, eenheid: 'st', prijs: 8, kg: 0.3 }
    ] },
  'binnen.schilder.raam': { fase: 'Schilderwerk', naam: 'Binnenzijde van een raam schilderen, 2 lagen', eenheid: 'st', uur: 2.5,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 0.4, eenheid: 'l', prijs: 20.74, kg: 1.3,
        bron: { url: 'https://www.hornbach.nl/p/flexa-strak-in-de-lak-binnenlak-zijdeglans-wit-2-5-l/4693481/', datum: '2026-10-06', wat: 'Flexa binnenlak zijdeglans € 62,75 per 2,5 l incl. btw gedeeld door 1,21 en door 2,5 l' } },
      { naam: 'Schuurpapier en afplaktape', per: 0.25, eenheid: 'st', prijs: 8, kg: 0.3 }
    ] },
  'binnen.schilder.plint': { fase: 'Schilderwerk', naam: 'Plinten schilderen, 2 lagen', eenheid: 'lm', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 0.04, eenheid: 'l', prijs: 20.74, kg: 1.3,
        bron: { url: 'https://www.hornbach.nl/p/flexa-strak-in-de-lak-binnenlak-zijdeglans-wit-2-5-l/4693481/', datum: '2026-10-06', wat: 'Flexa binnenlak zijdeglans € 62,75 per 2,5 l incl. btw gedeeld door 1,21 en door 2,5 l' } }
    ] },
  'binnen.schilder.trap': { fase: 'Schilderwerk', naam: 'Trap schilderen (treden, stootborden en leuning), 2 lagen', eenheid: 'st', uur: 12,
    afval: [],
    mat: [
      { naam: 'Lakverf', per: 3, eenheid: 'l', prijs: 20.74, kg: 1.3,
        bron: { url: 'https://www.hornbach.nl/p/flexa-strak-in-de-lak-binnenlak-zijdeglans-wit-2-5-l/4693481/', datum: '2026-10-06', wat: 'Flexa binnenlak zijdeglans € 62,75 per 2,5 l incl. btw gedeeld door 1,21 en door 2,5 l' } },
      { naam: 'Schuurpapier en afplaktape', per: 1, eenheid: 'st', prijs: 8, kg: 0.3 }
    ] },
  'binnen.schilder.radiator': { fase: 'Schilderwerk', naam: 'Radiator schilderen, 2 lagen', eenheid: 'st', uur: 2,
    afval: [],
    mat: [
      { naam: 'Radiatorlak', per: 0.5, eenheid: 'l', prijs: 22, kg: 1.2 },
      { naam: 'Schuurpapier en afplaktape', per: 0.25, eenheid: 'st', prijs: 8, kg: 0.3 }
    ] },
  'binnen.deur': { fase: 'Afwerking', naam: 'Binnendeur met kozijn plaatsen', eenheid: 'st', uur: 3, keuze: 'nieuwe binnendeuren',
    afval: [],
    mat: [
      { naam: 'Binnendeur met kozijn en beslag', per: 1, eenheid: 'st', prijs: 260, kg: 30 }
    ] },
  'binnen.plint.mdf': { fase: 'Afwerking', naam: 'MDF-plinten plaatsen', eenheid: 'lm', uur: 0.15,
    afval: [{ soort: 'hout', kg: 0.1 }],
    mat: [
      { naam: 'MDF-plint wit gegrond 70 × 12 mm', per: 1.08, eenheid: 'lm', prijs: 4.99, kg: 0.6,
        bron: { url: 'https://www.hubo.be/nl/p/plint-70x12-mm-240cm-wit-6-stuks/1078556/', datum: '2026-10-06', wat: 'pak van 6 plinten van 2,4 m € 86,99 incl. btw gedeeld door 1,21 en door 14,4 m' } },
      { naam: 'Montagelijm en kit voor plinten', per: 1, eenheid: 'lm', prijs: 0.6, kg: 0.05 }
    ] },
  'binnen.vensterbank': { fase: 'Afwerking', naam: 'Vensterbank binnen vervangen', eenheid: 'st', uur: 1.5, keuze: 'nieuwe vensterbanken binnen',
    afval: [{ soort: 'rest', kg: 5 }],
    mat: [
      { naam: 'Vensterbank binnen 1,2 m (MDF of steen)', per: 1, eenheid: 'st', prijs: 45, kg: 8 },
      { naam: 'Montagekit voor de vensterbank', per: 0.5, eenheid: 'st', prijs: 7, kg: 0.4 }
    ] },
});
