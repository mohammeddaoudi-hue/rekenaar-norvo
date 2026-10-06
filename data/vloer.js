/* Datatabel: Vloeren en tegels. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met bron: prijs op 6 okt 2026 gelezen op de pagina in bron.url (consumentenprijs incl. btw gedeeld door 1,21).
   Een materiaal zonder bron: startwaarde uit vakkennis. Gewichten: technische fiches en vakkennis.
   Chape en gespoten PUR staan per cm dikte: de hoeveelheid van die post is m² maal cm (80 m² x 7 cm = 560). */
Object.assign(globalThis.RP_DATA.posten, {
  'vloer.afbraak': { fase: 'Afbraak', naam: 'Oude vloertegels of vloerbekleding uitbreken en afvoeren', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'puin', kg: 30 }], mat: [] },
  'vloer.afbraak.chape': { fase: 'Afbraak', naam: 'Oude chape uitbreken en afvoeren', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'puin', kg: 140 }], mat: [] },
  'vloer.afbraak.hout': { fase: 'Afbraak', naam: 'Oude houten vloer, laminaat of parket verwijderen en afvoeren', eenheid: 'm²', uur: 0.15,
    afval: [{ soort: 'hout', kg: 8 }], mat: [] },
  'vloer.pur': { fase: 'Isolatie', naam: 'Gespoten PUR-vloerisolatie, per cm dikte (hoeveelheid = m² maal cm)', eenheid: 'm²', uur: 0.012, keuze: 'PUR-vloerisolatie',
    afval: [],
    mat: [
      { naam: 'PUR-schuim gespoten', per: 0.35, eenheid: 'kg', prijs: 6.3, kg: 1 }
    ] },
  'vloer.pur8': { fase: 'Isolatie', naam: 'Gespoten PUR-vloerisolatie 8 cm', eenheid: 'm²', uur: 0.1, keuze: 'PUR-vloerisolatie 8 cm',
    afval: [],
    mat: [
      { naam: 'PUR-schuim gespoten', per: 2.8, eenheid: 'kg', prijs: 6.3, kg: 1 }
    ] },
  'vloer.isolatie.pir': { fase: 'Isolatie', naam: 'PIR-vloerisolatie 10 cm onder de chape plaatsen', eenheid: 'm²', uur: 0.1, keuze: 'PIR-vloerisolatie',
    afval: [],
    mat: [
      { naam: 'PIR-vloerplaat 10 cm', per: 1.03, eenheid: 'm²', prijs: 21.4, kg: 3.6,
        bron: { url: 'https://www.hornbach.nl/p/iko-pir-isolatieplaat-enertherm-tong-groef-rd-4-50-1200x600x100-mm/10368512/', datum: '2026-10-06', wat: 'IKO Enertherm PIR 100 mm € 25,90 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Tape en randstrook voor vloerisolatie', per: 1, eenheid: 'm²', prijs: 0.8, kg: 0.1 }
    ] },
  'vloer.verwarming': { fase: 'Vloeren', naam: 'Vloerverwarming (nat systeem op noppenplaat) in de chape', eenheid: 'm²', uur: 0.3, keuze: 'vloerverwarming',
    afval: [],
    mat: [
      { naam: 'Noppenplaat met EPS-isolatie', per: 1.05, eenheid: 'm²', prijs: 9.92, kg: 0.9,
        bron: { url: 'https://www.hornbach.nl/p/magnum-noppenplaat-28-mm-geisoleerd-11-mm-eps-100-x-100-cm/12765976/', datum: '2026-10-06', wat: 'Magnum noppenplaat 28 mm met 11 mm EPS € 12,00 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Vloerverwarmingsbuis 16 mm', per: 10, eenheid: 'm', prijs: 0.48, kg: 0.1,
        bron: { url: 'https://www.hornbach.nl/p/magnum-vloerverwarmingsbuis-16-x-2-mm-120-m/12765978/', datum: '2026-10-06', wat: 'Magnum vloerverwarmingsbuis 16 × 2 mm € 69,00 per rol van 120 m incl. btw gedeeld door 1,21 en door 120 m' } },
      { naam: 'Verdeler met pomp en toebehoren (1 per 80 m²)', per: 0.0125, eenheid: 'st', prijs: 420, kg: 12 }
    ] },
  /* Norm 0,25 u/m²: een ploeg van 3 met chapepomp legt 90 tot 100 m² per dag.
     Tweede controle 6 okt 2026: chapezand is 0-4 mm en komt in bulk of big bag, niet in zakken van 25 kg: 0,09 -> 0,06 per kg (Hubo big bag 1.500 kg). */
  'vloer.chape': { fase: 'Vloeren', naam: 'Zandcementchape 7 cm leggen', eenheid: 'm²', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'Rivierzand 0-4 mm voor chape (big bag)', per: 126, eenheid: 'kg', prijs: 0.06, kg: 1,
        bron: { url: 'https://www.hubo.be/nl/p/big-bag-rivierzand-0-4-mm-1500kg/1095465/', datum: '2026-10-06', wat: 'big bag rivierzand 0-4 mm 1.500 kg € 110 incl. btw gedeeld door 1,21 en door 1.500 kg' } },
      { naam: 'Cement CEM II 32,5', per: 14, eenheid: 'kg', prijs: 0.26, kg: 1,
        bron: { url: 'https://www.hubo.be/nl/p/hubo-cement-kalksteen-20kg/1097209/', datum: '2026-10-06', wat: 'zak cement 20 kg € 6,29 incl. btw gedeeld door 1,21 en door 20 kg' } },
      { naam: 'PE-folie en randisolatie onder de chape', per: 1.1, eenheid: 'm²', prijs: 0.9, kg: 0.15 }
    ] },
  'vloer.chape.cm': { fase: 'Vloeren', naam: 'Zandcementchape, andere dikte: per cm (hoeveelheid = m² maal cm)', eenheid: 'm²', uur: 0.035,
    afval: [],
    mat: [
      { naam: 'Rivierzand 0-4 mm voor chape (big bag)', per: 18, eenheid: 'kg', prijs: 0.06, kg: 1,
        bron: { url: 'https://www.hubo.be/nl/p/big-bag-rivierzand-0-4-mm-1500kg/1095465/', datum: '2026-10-06', wat: 'big bag rivierzand 0-4 mm 1.500 kg € 110 incl. btw gedeeld door 1,21 en door 1.500 kg' } },
      { naam: 'Cement CEM II 32,5', per: 2, eenheid: 'kg', prijs: 0.26, kg: 1,
        bron: { url: 'https://www.hubo.be/nl/p/hubo-cement-kalksteen-20kg/1097209/', datum: '2026-10-06', wat: 'zak cement 20 kg € 6,29 incl. btw gedeeld door 1,21 en door 20 kg' } }
    ] },
  'vloer.egaliseren': { fase: 'Vloeren', naam: 'Vloer egaliseren met egalisatiemortel, 5 mm', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Egalisatiemortel', per: 8, eenheid: 'kg', prijs: 0.86, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-204-egalisatie-en-uitvlakmortel-ct-c12-f4-25-kg/6631394/', datum: '2026-10-06', wat: 'Akkit 204 egalisatiemortel € 25,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg; verbruik 1,6 kg per m² per mm' } },
      { naam: 'Primer voor egalisatie', per: 0.15, eenheid: 'kg', prijs: 6, kg: 1 }
    ] },
  'vloer.laminaat': { fase: 'Vloeren', naam: 'Laminaat 8 mm met ondervloer leggen', eenheid: 'm²', uur: 0.25,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Laminaat 8 mm', per: 1.08, eenheid: 'm²', prijs: 13.18, kg: 7.5,
        bron: { url: 'https://www.hornbach.nl/p/laminaat-8-0-oak-natural-water-resistant/10326558/', datum: '2026-10-06', wat: 'laminaat 8 mm klasse 32 € 15,95 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Ondervloer 2 mm met dampscherm', per: 1.05, eenheid: 'm²', prijs: 2.2, kg: 0.1 },
      { naam: 'Overgangs- en afsluitprofielen', per: 0.2, eenheid: 'lm', prijs: 8, kg: 0.1 }
    ] },
  'vloer.parket.klik': { fase: 'Vloeren', naam: 'Klikparket (meerlaags eik 15 mm) met ondervloer leggen', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'hout', kg: 0.5 }],
    mat: [
      { naam: 'Klikparket eik 15 mm', per: 1.08, eenheid: 'm²', prijs: 57.81, kg: 9,
        bron: { url: 'https://www.hornbach.nl/p/skandor-parket-15-0-earthly-oak/10580114/', datum: '2026-10-06', wat: 'Skandor parket 15 mm eik, toplaag 3,5 mm, € 69,95 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Ondervloer 2 mm met dampscherm', per: 1.05, eenheid: 'm²', prijs: 2.2, kg: 0.1 },
      { naam: 'Overgangs- en afsluitprofielen', per: 0.2, eenheid: 'lm', prijs: 8, kg: 0.1 }
    ] },
  'vloer.parket.lijm': { fase: 'Vloeren', naam: 'Meerlaags parket volledig verlijmd leggen', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'hout', kg: 0.5 }],
    mat: [
      { naam: 'Meerlaags parket eik 15 mm voor verlijming', per: 1.08, eenheid: 'm²', prijs: 60, kg: 9 },
      { naam: 'Parketlijm', per: 1.2, eenheid: 'kg', prijs: 6.5, kg: 1 }
    ] },
  'vloer.vinyl': { fase: 'Vloeren', naam: 'Vinyl- of pvc-klikvloer leggen', eenheid: 'm²', uur: 0.25,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'PVC-klikvloer 5 mm', per: 1.08, eenheid: 'm²', prijs: 17.31, kg: 10.2,
        bron: { url: 'https://www.hornbach.nl/p/pvc-klik-5-0-cuatro-1-76-m/12442058/', datum: '2026-10-06', wat: 'pvc klik 5 mm € 20,95 per m² incl. btw gedeeld door 1,21; 18 kg per pak van 1,76 m²' } },
      { naam: 'Ondervloer voor pvc-klikvloer', per: 1.05, eenheid: 'm²', prijs: 2.8, kg: 0.2 }
    ] },
  'vloer.gietvloer': { fase: 'Vloeren', naam: 'Gietvloer (epoxy of polyurethaan) aanbrengen', eenheid: 'm²', uur: 0.5, keuze: 'gietvloer',
    afval: [],
    mat: [
      { naam: 'Gietvloer 2-componenten', per: 3, eenheid: 'kg', prijs: 9, kg: 1 },
      { naam: 'Primer voor gietvloer', per: 0.3, eenheid: 'kg', prijs: 10, kg: 1 }
    ] },
  'vloer.tegels.30': { fase: 'Tegelwerk', naam: 'Keramische vloertegels 30 × 30 of 30 × 60 leggen', eenheid: 'm²', uur: 0.7,
    afval: [{ soort: 'puin', kg: 1.5 }],
    mat: [
      { naam: 'Keramische vloertegel 30 × 60', per: 1.08, eenheid: 'm²', prijs: 18, kg: 18 },
      { naam: 'Flexibele tegellijm', per: 4, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.8, eenheid: 'kg', prijs: 1.6, kg: 1 },
      { naam: 'Tegelkruisjes en levelingsclips', per: 1, eenheid: 'm²', prijs: 0.6, kg: 0.05 }
    ] },
  'vloer.tegels.60': { fase: 'Tegelwerk', naam: 'Keramische vloertegels 60 × 60 leggen', eenheid: 'm²', uur: 0.8,
    afval: [{ soort: 'puin', kg: 1.5 }],
    mat: [
      { naam: 'Keramische vloertegel 60 × 60', per: 1.08, eenheid: 'm²', prijs: 24.75, kg: 20,
        bron: { url: 'https://www.hornbach.nl/p/rako-wand-en-vloertegel-bologna-grey-60-x-60-cm-gerectificeerd/12381840/', datum: '2026-10-06', wat: 'Rako Bologna 60 × 60 cm gerectificeerd € 29,95 per m² incl. btw gedeeld door 1,21; 28,8 kg per pak van 1,44 m²' } },
      { naam: 'Flexibele tegellijm', per: 4, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.5, eenheid: 'kg', prijs: 1.6, kg: 1 },
      { naam: 'Tegelkruisjes en levelingsclips', per: 1, eenheid: 'm²', prijs: 0.6, kg: 0.05 }
    ] },
  'vloer.tegels.groot': { fase: 'Tegelwerk', naam: 'Grootformaat keramische vloertegels (60 × 120 of groter) leggen', eenheid: 'm²', uur: 1,
    afval: [{ soort: 'puin', kg: 2 }],
    mat: [
      { naam: 'Keramische tegel 60 × 120', per: 1.1, eenheid: 'm²', prijs: 33.02, kg: 21.2,
        bron: { url: 'https://www.hornbach.nl/p/wand-en-vloertegel-cortina-zand-60x120-cm-gerectificeerd/10531129/', datum: '2026-10-06', wat: 'Cortina 60 × 120 cm gerectificeerd € 39,95 per m² incl. btw gedeeld door 1,21; 30 kg per pak van 1,44 m²' } },
      { naam: 'Flexibele tegellijm', per: 5, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.3, eenheid: 'kg', prijs: 1.6, kg: 1 },
      { naam: 'Tegelkruisjes en levelingsclips', per: 2, eenheid: 'm²', prijs: 0.6, kg: 0.05 }
    ] },
  'vloer.natuursteen': { fase: 'Tegelwerk', naam: 'Natuursteen (Belgische blauwe steen) vloer leggen', eenheid: 'm²', uur: 1.1,
    afval: [{ soort: 'puin', kg: 3 }],
    mat: [
      { naam: 'Blauwe steen tegel 60 × 60 × 2 cm gezoet', per: 1.08, eenheid: 'm²', prijs: 75, kg: 54 },
      { naam: 'Witte natuursteenlijm', per: 5, eenheid: 'kg', prijs: 1.2, kg: 1 },
      { naam: 'Voegmortel voor natuursteen', per: 0.8, eenheid: 'kg', prijs: 2.2, kg: 1 },
      { naam: 'Impregneermiddel voor natuursteen', per: 0.1, eenheid: 'l', prijs: 25, kg: 1 }
    ] },
  'vloer.plint': { fase: 'Tegelwerk', naam: 'Tegelplinten plaatsen', eenheid: 'lm', uur: 0.3,
    afval: [{ soort: 'puin', kg: 0.2 }],
    mat: [
      { naam: 'Tegelplint 7 cm uit de vloertegel', per: 1.08, eenheid: 'lm', prijs: 4.5, kg: 1.4 },
      { naam: 'Flexibele tegellijm', per: 0.5, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.1, eenheid: 'kg', prijs: 1.6, kg: 1 }
    ] },
  'vloer.waterdichting': { fase: 'Tegelwerk', naam: 'Waterdichting van de natte cel (vloer en wanden) met kimband vóór het betegelen', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Waterdichtingscoating', per: 1.2, eenheid: 'kg', prijs: 11.35, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/omnicol-omnibind-waterdichtingsset/7421585/', datum: '2026-10-06', wat: 'Omnicol Omnibind set met 4 kg coating en 12 m band € 54,95 incl. btw gedeeld door 1,21 en door 4 kg' } },
      { naam: 'Kimband en hoekstukken', per: 0.8, eenheid: 'lm', prijs: 3, kg: 0.05 }
    ] },
  'vloer.wandtegels': { fase: 'Tegelwerk', naam: 'Wandtegels in badkamer of keuken plaatsen', eenheid: 'm²', uur: 1,
    afval: [{ soort: 'puin', kg: 1.5 }],
    mat: [
      { naam: 'Wandtegel 30 × 60', per: 1.1, eenheid: 'm²', prijs: 9.25, kg: 13,
        bron: { url: 'https://www.hornbach.nl/p/wandtegel-elegance-wit-mat-30-x-60-cm-gerectificeerd/10656129/', datum: '2026-10-06', wat: 'wandtegel Elegance wit mat 30 × 60 cm € 11,19 per m² incl. btw gedeeld door 1,21; 21 kg per pak van 1,62 m²' } },
      { naam: 'Flexibele tegellijm', per: 3, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.6, eenheid: 'kg', prijs: 1.6, kg: 1 },
      { naam: 'Tegelkruisjes en hoekprofielen', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.1 }
    ] },
  'vloer.wandtegels.groot': { fase: 'Tegelwerk', naam: 'Grootformaat wandtegels (60 × 120) plaatsen', eenheid: 'm²', uur: 1.2,
    afval: [{ soort: 'puin', kg: 2 }],
    mat: [
      { naam: 'Keramische tegel 60 × 120', per: 1.1, eenheid: 'm²', prijs: 33.02, kg: 21.2,
        bron: { url: 'https://www.hornbach.nl/p/wand-en-vloertegel-cortina-zand-60x120-cm-gerectificeerd/10531129/', datum: '2026-10-06', wat: 'Cortina 60 × 120 cm gerectificeerd € 39,95 per m² incl. btw gedeeld door 1,21; 30 kg per pak van 1,44 m²' } },
      { naam: 'Flexibele tegellijm', per: 4, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 0.3, eenheid: 'kg', prijs: 1.6, kg: 1 },
      { naam: 'Tegelkruisjes en hoekprofielen', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.1 }
    ] },
  'vloer.inloopdouche': { fase: 'Tegelwerk', naam: 'Inloopdouche: vloer in afschot betegelen met douchegoot', eenheid: 'st', uur: 10, keuze: 'inloopdouche',
    afval: [{ soort: 'puin', kg: 10 }],
    mat: [
      { naam: 'Douchegoot 80 cm met sifon', per: 1, eenheid: 'st', prijs: 180, kg: 4 },
      { naam: 'Mozaïek of kleine tegels voor de douchevloer', per: 1.5, eenheid: 'm²', prijs: 35, kg: 20 },
      { naam: 'Flexibele tegellijm', per: 6, eenheid: 'kg', prijs: 0.69, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/akkit-402-flexibele-tegellijm-c2-te-s1-25-kg/8582242/', datum: '2026-10-06', wat: 'Akkit 402 flexlijm C2 TE S1 € 20,95 per 25 kg incl. btw gedeeld door 1,21 en door 25 kg' } },
      { naam: 'Voegmortel', per: 1.5, eenheid: 'kg', prijs: 1.6, kg: 1 }
    ] },
  'vloer.kitvoegen': { fase: 'Afwerking', naam: 'Siliconenkitvoegen langs plinten, tegels en in hoeken zetten', eenheid: 'lm', uur: 0.1,
    afval: [],
    mat: [
      { naam: 'Sanitaire siliconenkit (koker 310 ml)', per: 0.12, eenheid: 'st', prijs: 6.5, kg: 0.4 }
    ] },
  'vloer.trap.bekleden': { fase: 'Afwerking', naam: 'Trap bekleden met laminaat of vinyl, per trede', eenheid: 'st', uur: 0.8, keuze: 'trapbekleding',
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'Traprenovatieset per trede (trede en stootbord)', per: 1, eenheid: 'st', prijs: 28, kg: 2.5 },
      { naam: 'Montagelijm voor traprenovatie', per: 0.3, eenheid: 'kg', prijs: 9, kg: 1 }
    ] },
});
