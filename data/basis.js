/* Basis van de datatabel: tarieven, containers, materieel per dag. De posten per vak staan in data/<vak>.js.
   Alles hier zijn STARTWAARDEN van 6 oktober 2026 (inkoop, zonder btw), nog door geen aannemer bevestigd.

   Een post in data/<vak>.js:
   'vak.naam': {                       code = vak-voorvoegsel (dak, gevel, plat, binnen, ...) + '.' + korte naam, uniek
     fase: 'Afbraak',                   zie RP.FASES in motor.js; een nieuwe fase mag, hij komt achteraan
     naam: 'Wat er gebeurt',            één werkstap zoals een aannemer hem noemt
     eenheid: 'm²' | 'lm' | 'st' | 'm³' | 'kg' | 'u',
     uur: 0.3,                          manuren per eenheid (1 man); 1 man doet urenPerDag / uur eenheden per werkdag
     keuze: 'sarking-isolatie',         optioneel: korte naam als de klant dit kan weglaten (voor "Zonder ..." in de wat-als)
     afval: [{ soort: 'puin' | 'hout' | 'rest' | 'asbest' | 'isolatie' | 'metaal', kg: 45 }],   per eenheid; [] als er geen afval is
     mat: [{ naam: 'Kleipan', per: 21.3, eenheid: 'st', prijs: 0.95, kg: 2.1 }],
                                        per = verbruik per eenheid van de post, inclusief snijverlies; prijs per eenheid van het materiaal;
                                        kg per eenheid van het materiaal (wat naar boven of naar binnen moet)
                                        huur: true (+ perWeek: true) = materieel dat gehuurd wordt, prijs per eenheid per week
     bron: { url: 'https://...', datum: '2026-10-06', wat: 'prijs kleipan' },   optioneel: waar een cijfer vandaan komt
   }
*/
globalThis.RP_DATA = {
  stand: '6 oktober 2026',
  /* uurtarief = wat de klant per manuur betaalt zonder btw (Mohammed, 6 okt 2026: "arbeidsuren zijn aan 57,5"); overhead en winst op
     arbeid zitten daarin. materiaalmarge = opslag op inkoop van materiaal en materieel (startwaarde). onvoorzien = reserve op het subtotaal (startwaarde). */
  tarieven: { uurtarief: 57.5, urenPerDag: 8, materiaalmarge: 15, onvoorzien: 5, btw: 6 },
  /* Afval per soort. Een container telt op gewicht (ton) én op volume (m3 van de container, met de dichtheid kg/m³ van de soort):
     het grootste aantal telt. Een soort met minder dan 'los' kg gaat in big bags (prijs per big bag); minder dan 'klein' kg gaat mee in de
     werfwagen zonder kost. Kleine fracties van andere soorten worden bij 'rest' geteld. Asbest gaat altijd apart. Metaal (oud zink, lood)
     gaat naar de schroothandel: prijs 0, geen container. */
  containers: {
    puin: { naam: 'Container 10 m³ steenpuin', prijs: 412, ton: 12, m3: 10, dichtheid: 1100, los: 300, bigbag: 45, klein: 25 },
    hout: { naam: 'Container 10 m³ hout', prijs: 300, ton: 4, m3: 10, dichtheid: 250, los: 300, bigbag: 45, klein: 25 },
    rest: { naam: 'Container 10 m³ gemengd bouwafval', prijs: 520, ton: 6, m3: 10, dichtheid: 300, los: 300, bigbag: 55, klein: 25 },
    isolatie: { naam: 'Container 10 m³ isolatie', prijs: 450, ton: 2, m3: 10, dichtheid: 30, los: 200, bigbag: 55, klein: 10 },
    metaal: { naam: 'Afvoer oud metaal naar de schroothandel', prijs: 0, ton: 5, m3: 10, dichtheid: 500, los: 0, bigbag: 0, klein: 0 },
    asbest: { naam: 'Asbestcontainer 10 m³ (hechtgebonden, verpakt)', prijs: 900, ton: 5, m3: 10, dichtheid: 800, los: 200, bigbag: 150, klein: 0 },
  },
  perDag: {
    lift: { naam: 'Pannenlift', prijs: 60 },
    transport: { naam: 'Werfwagen en verplaatsing', prijs: 45 },
    hoogwerker: { naam: 'Hoogwerker', prijs: 180 },
    stofafzuiging: { naam: 'Stofafzuiging en afdekking', prijs: 25 },
  },
  posten: {},
};
