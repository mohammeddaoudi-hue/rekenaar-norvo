/* Datatabel: Hellend dak. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Prijzen met een bron-veld zijn op 6 oktober 2026 gelezen op de pagina in de url; consumentenprijzen incl. btw zijn gedeeld door 1,21.
   André Celis (andrecelis.be) toont per product een brutoprijs incl. btw en daarnaast de nettoprijs per stuk zonder btw: die netto staat hier.
   Normen (uur = manuren per eenheid): 1 man doet 8 / uur eenheden per werkdag; de ploeg deelt de werkdagen.
   Tweede controle 6 oktober 2026: 9 bron-urls opnieuw geopend, prijzen kloppen; wijzigingen staan per post in commentaar. */
Object.assign(globalThis.RP_DATA.posten, {
  /* ---------- Werfinrichting ---------- */
  'dak.stelling': { fase: 'Werfinrichting', naam: 'Gevelstelling met dakrandbeveiliging plaatsen en afbreken', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Huur gevelstelling', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true, perWeek: true }
    ] },
  'dak.zeil': { fase: 'Werfinrichting', naam: 'Open dakvlak elke avond afdekken met dakzeil', eenheid: 'm²', uur: 0.03,
    afval: [],
    mat: [
      { naam: 'Dakzeil en spanbanden (afschrijving per werf)', per: 1, eenheid: 'm²', prijs: 0.6, kg: 0.1 }
    ] },

  /* ---------- Afbraak ---------- */
  'dak.afbraak': { fase: 'Afbraak', naam: 'Oude pannen, latten en onderdak afbreken en naar de container brengen', eenheid: 'm²', uur: 0.22,
    afval: [{ soort: 'puin', kg: 45 }, { soort: 'hout', kg: 5 }], mat: [] },
  'dak.afbraak.leien': { fase: 'Afbraak', naam: 'Oude leien zonder asbest (natuurlei of vezelcement), latten en onderdak afbreken', eenheid: 'm²', uur: 0.25,
    afval: [{ soort: 'puin', kg: 25 }, { soort: 'hout', kg: 5 }, { soort: 'rest', kg: 8 }], mat: [] },
  /* Asbest: hechtgebonden leien of platen, eenvoudige handelingen: heel afnemen, niet breken, dubbel verpakken in PE-folie met asbestetiket; afvoer via de asbestcontainer of big bag in basis.js */
  'dak.asbest.leien': { fase: 'Afbraak', naam: 'Asbestleien verwijderen, dubbel verpakken in folie met etiket en afvoeren als asbest', eenheid: 'm²', uur: 0.45,
    afval: [{ soort: 'asbest', kg: 21 }, { soort: 'hout', kg: 4 }],
    mat: [
      { naam: 'Asbestfolie PE 200 µm (dubbel gewikkeld)', per: 2.4, eenheid: 'm²', prijs: 0.35, kg: 0.19 },
      { naam: 'Asbesttape, etiketten en wegwerpbeschermkledij (FFP3)', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.05 }
    ] },
  'dak.asbest.onderdak': { fase: 'Afbraak', naam: 'Asbesthoudend onderdak in platen verwijderen, verpakken en afvoeren als asbest', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'asbest', kg: 10 }],
    mat: [
      { naam: 'Asbestfolie PE 200 µm (dubbel gewikkeld)', per: 2.4, eenheid: 'm²', prijs: 0.35, kg: 0.19 },
      { naam: 'Asbesttape, etiketten en wegwerpbeschermkledij (FFP3)', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.05 }
    ] },
  'dak.schouw.afbraak': { fase: 'Afbraak', naam: 'Schouw boven het dak afbreken en de opening in het dakvlak dichten', eenheid: 'st', uur: 8,
    afval: [{ soort: 'puin', kg: 450 }],
    mat: [
      { naam: 'Pannen, latten en onderdak om de opening te dichten', per: 1, eenheid: 'st', prijs: 60, kg: 50 }
    ] },

  /* ---------- Voorbereiding ---------- */
  'dak.zonnepanelen': { fase: 'Voorbereiding', naam: 'Zonnepanelen demonteren en na de dakwerken hermonteren (per paneel)', eenheid: 'st', uur: 1,
    afval: [],
    mat: [
      { naam: 'Nieuwe dakhaken en bevestiging per paneel', per: 1, eenheid: 'st', prijs: 18, kg: 1.5 }
    ] },
  'dak.mos': { fase: 'Voorbereiding', naam: 'Mos verwijderen en dak behandelen tegen mos', eenheid: 'm²', uur: 0.08, keuze: 'mosbehandeling',
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Mosbestrijdingsmiddel', per: 0.1, eenheid: 'l', prijs: 12, kg: 1 }
    ] },
  /* Kleine interventie: de AI geeft het aantal uren; materiaal per uur werk */
  'dak.herstel.pannen': { fase: 'Voorbereiding', naam: 'Herstelling losse of gebroken pannen (kleine interventie, forfait in uren)', eenheid: 'u', uur: 1,
    afval: [{ soort: 'puin', kg: 5 }],
    mat: [
      { naam: 'Vervangpannen, panhaken en kit', per: 1, eenheid: 'u', prijs: 10, kg: 8 }
    ] },
  'dak.pannen.herleggen': { fase: 'Voorbereiding', naam: 'Bestaande pannen afnemen, stapelen en na het nieuwe onderdak herleggen', eenheid: 'm²', uur: 0.35,
    afval: [{ soort: 'puin', kg: 5 }],
    mat: [
      { naam: 'Vervangpannen voor breuk (10 %)', per: 2, eenheid: 'st', prijs: 1.5, kg: 3 }
    ] },

  /* ---------- Ruwbouw: houten structuur ---------- */
  'dak.kepers': { fase: 'Ruwbouw', naam: 'Kepers of gordingen vervangen (per lopende meter nieuw hout)', eenheid: 'lm', uur: 0.6,
    afval: [{ soort: 'hout', kg: 4 }],
    mat: [
      { naam: 'Vuren C24 63 × 175 mm', per: 1.05, eenheid: 'lm', prijs: 11.81, kg: 4.2,
        bron: { url: 'https://www.hubo.be/nl/p/vurenhout-ruw-63x175-mm-420cm/81177/', datum: '2026-10-06', wat: 'vurenhout ruw 63x175 mm: 14,29 per m incl. btw (60,02 per 4,2 m) gedeeld door 1,21; 17,63 kg per 4,2 m' } },
      { naam: 'Bouten, balkschoenen en nagels', per: 1, eenheid: 'lm', prijs: 2.5, kg: 0.3 }
    ] },
  'dak.structuur.nieuw': { fase: 'Ruwbouw', naam: 'Nieuwe houten dakstructuur (kepers op gordingen en muurplaat) plaatsen', eenheid: 'm²', uur: 0.9,
    afval: [{ soort: 'hout', kg: 2 }],
    mat: [
      { naam: 'Vuren C24 63 × 175 mm', per: 2.4, eenheid: 'lm', prijs: 11.81, kg: 4.2,
        bron: { url: 'https://www.hubo.be/nl/p/vurenhout-ruw-63x175-mm-420cm/81177/', datum: '2026-10-06', wat: 'vurenhout ruw 63x175 mm: 14,29 per m incl. btw gedeeld door 1,21; 17,63 kg per 4,2 m' } },
      { naam: 'Gordingen en muurplaat vuren C24 75 × 225 mm', per: 1, eenheid: 'lm', prijs: 18, kg: 7.6 },
      { naam: 'Bouten, balkschoenen, ankers en nagels', per: 1, eenheid: 'm²', prijs: 4, kg: 0.5 }
    ] },

  /* ---------- Isolatie tussen of onder de kepers (binnenzijde) ---------- */
  'dak.isolatie.kepers': { fase: 'Isolatie', naam: 'Isolatie tussen de kepers: minerale wol 18 cm (Rd 4,5)', eenheid: 'm²', uur: 0.22, keuze: 'isolatie tussen de kepers',
    afval: [],
    mat: [
      { naam: 'Glaswol 18 cm (Rd 4,5)', per: 1.1, eenheid: 'm²', prijs: 17.43, kg: 2.3,
        bron: { url: 'https://www.bouwmaat.nl/en/products/knauf-insulation-isolatie-tr312-glaswol-180mm-rd45-spijkerflens-5000x600mm-3m2-820888', datum: '2026-10-06', wat: 'Knauf TR312 glaswol 180 mm: 52,29 excl. btw per rol van 3 m² = 17,43 per m²; 6,9 kg per rol' } },
      { naam: 'Isolatieschroeven en klemdraad', per: 1, eenheid: 'm²', prijs: 0.5, kg: 0.05 }
    ] },
  'dak.dampscherm.binnen': { fase: 'Isolatie', naam: 'Dampscherm aan de binnenkant van de kepers, luchtdicht getapet', eenheid: 'm²', uur: 0.1,
    afval: [],
    mat: [
      { naam: 'Dampscherm', per: 1.15, eenheid: 'm²', prijs: 1.42, kg: 0.09,
        bron: { url: 'https://www.bouwmaat.nl/bouwmaterialen/isolatiefolies/dampremmend-folies', datum: '2026-10-06', wat: 'MG Miofol 90S dampremmend 1,5 × 25 m = 37,5 m² voor 53,21 excl. btw = 1,42 per m²' } },
      { naam: 'Tape, kit en manchetten voor de luchtdichting', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.05 }
    ] },
  'dak.afwerking.gyproc': { fase: 'Wanden en plafonds', naam: 'Dakvlak binnen afwerken met gyproc op regelwerk (plamuren apart)', eenheid: 'm²', uur: 0.5,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Gyprocplaat 12,5 mm', per: 1.1, eenheid: 'm²', prijs: 3.38, kg: 8.3,
        bron: { url: 'https://www.bouwmaat.nl/knauf-gipsplaat-a-ak-260x60cm-125mm/product/0000599706', datum: '2026-10-06', wat: 'Knauf gipsplaat A AK 12,5 mm 300 × 60 cm: 6,09 excl. btw per plaat = 3,38 per m²; 14,9 kg per plaat van 1,8 m²' } },
      { naam: 'Metalen regels of houten latten', per: 1, eenheid: 'm²', prijs: 3.5, kg: 1.5 },
      { naam: 'Schroeven en voegband', per: 1, eenheid: 'm²', prijs: 1, kg: 0.1 }
    ] },
  'dak.afwerking.hout': { fase: 'Wanden en plafonds', naam: 'Dakvlak binnen afwerken met houten planchetten', eenheid: 'm²', uur: 0.6,
    afval: [{ soort: 'rest', kg: 0.5 }],
    mat: [
      { naam: 'Planchetten vuren 12 mm', per: 1.1, eenheid: 'm²', prijs: 14, kg: 6.5 },
      { naam: 'Latten en nagels', per: 1, eenheid: 'm²', prijs: 2, kg: 0.8 }
    ] },

  /* ---------- Dakopbouw (buitenzijde) ---------- */
  'dak.onderdak': { fase: 'Dakopbouw', naam: 'Onderdakfolie plaatsen', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Onderdakfolie', per: 1.1, eenheid: 'm²', prijs: 1.9, kg: 0.15 }
    ] },
  /* Celit 4D 22 mm = 270 kg/m³ = 5,9 kg/m²; prijs is een startwaarde (webshops tonen de prijs alleen na inloggen) */
  'dak.onderdak.hard': { fase: 'Dakopbouw', naam: 'Hard onderdak in houtvezelplaten 22 mm (tand en groef) plaatsen', eenheid: 'm²', uur: 0.18,
    afval: [],
    mat: [
      { naam: 'Houtvezel onderdakplaat 22 mm (tand en groef)', per: 1.08, eenheid: 'm²', prijs: 13, kg: 5.9 },
      { naam: 'Nagels en kit voor het onderdak', per: 1, eenheid: 'm²', prijs: 0.5, kg: 0.05 }
    ] },
  'dak.dampscherm.sarking': { fase: 'Dakopbouw', naam: 'Dampscherm op het dakbeschot onder de sarking-isolatie plaatsen', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Dampscherm', per: 1.15, eenheid: 'm²', prijs: 1.42, kg: 0.09,
        bron: { url: 'https://www.bouwmaat.nl/bouwmaterialen/isolatiefolies/dampremmend-folies', datum: '2026-10-06', wat: 'MG Miofol 90S dampremmend 1,5 × 25 m = 37,5 m² voor 53,21 excl. btw = 1,42 per m²' } },
      { naam: 'Tape en kit voor het dampscherm', per: 1, eenheid: 'm²', prijs: 0.6, kg: 0.05 }
    ] },
  'dak.aanslagbalk': { fase: 'Dakopbouw', naam: 'Aanslagbalk aan de dakvoet en randbalk aan de gevels voor de dakvlakverhoging door sarking', eenheid: 'lm', uur: 0.35,
    afval: [],
    mat: [
      { naam: 'Vuren C24 balk op maat van de isolatiedikte', per: 1.05, eenheid: 'lm', prijs: 8, kg: 3 },
      { naam: 'Schroeven en ankers voor de aanslagbalk', per: 1, eenheid: 'lm', prijs: 1.5, kg: 0.1 }
    ] },
  /* 6 okt: prijs 38 vervangen door 33,16 = nettoprijs BauderPIR SF sarking 120 mm bij André Celis (bron op het materiaal) */
  'dak.sarking120': { fase: 'Dakopbouw', naam: 'Sarking-isolatie PIR 12 cm plaatsen', eenheid: 'm²', uur: 0.25, keuze: 'sarking-isolatie',
    afval: [],
    mat: [
      { naam: 'PIR-sarkingplaat 12 cm', per: 1.05, eenheid: 'm²', prijs: 33.16, kg: 3.9,
        bron: { url: 'https://andrecelis.be/andrecelis_nl/bauder-bauderpir-sf-120mm.html', datum: '2026-10-06', wat: 'BauderPIR SF sarking 120 mm: 278,68 netto zonder btw per pak van 8,4 m² = 33,16 per m² (bruto 337,20 incl. btw)' } },
      { naam: 'Sarkingschroeven en tape', per: 1, eenheid: 'm²', prijs: 4, kg: 0.3 }
    ] },
  'dak.sarking160': { fase: 'Dakopbouw', naam: 'Sarking-isolatie PIR 16 cm plaatsen', eenheid: 'm²', uur: 0.27, keuze: 'sarking-isolatie',
    afval: [],
    mat: [
      { naam: 'PIR-sarkingplaat 16 cm', per: 1.05, eenheid: 'm²', prijs: 44, kg: 5.2 },
      { naam: 'Sarkingschroeven en tape', per: 1, eenheid: 'm²', prijs: 4, kg: 0.3 }
    ] },
  /* 6 okt, tweede controle: bevestiging toegevoegd (ontbrak); bij sarking zitten de lange schroeven in de sarkingpost */
  'dak.tengellatten': { fase: 'Dakopbouw', naam: 'Tengellatten plaatsen', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Tengellat', per: 1.9, eenheid: 'lm', prijs: 0.75, kg: 0.45 },
      { naam: 'Nagels voor de tengellatten', per: 1, eenheid: 'm²', prijs: 0.15, kg: 0.03 }
    ] },
  'dak.panlatten': { fase: 'Dakopbouw', naam: 'Panlatten op maat plaatsen', eenheid: 'm²', uur: 0.1,
    afval: [],
    mat: [
      { naam: 'Panlat', per: 4.2, eenheid: 'lm', prijs: 0.85, kg: 0.55 },
      { naam: 'Nagels voor de panlatten', per: 1, eenheid: 'm²', prijs: 0.2, kg: 0.04 }
    ] },

  /* ---------- Dakbedekking ---------- */
  'dak.pannen.klei': { fase: 'Dakbedekking', naam: 'Kleipannen leggen (klein formaat, 20,7 per m²)', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Kleipan', per: 21.3, eenheid: 'st', prijs: 0.95, kg: 2.1 }
    ] },
  'dak.pannen.klei.groot': { fase: 'Dakbedekking', naam: 'Kleipannen leggen (groot formaat, 10 tot 12 per m²)', eenheid: 'm²', uur: 0.2,
    afval: [],
    mat: [
      { naam: 'Kleipan groot formaat', per: 11.5, eenheid: 'st', prijs: 1.75, kg: 4 }
    ] },
  /* 6 okt: prijs 1,1 vervangen door 1,69 en kg 4,4 door 4,2 = Monier Sneldek beton bij Bouwmaat (bron op het materiaal) */
  'dak.pannen.beton': { fase: 'Dakbedekking', naam: 'Betonpannen leggen (groot formaat, 10 per m²)', eenheid: 'm²', uur: 0.2,
    afval: [],
    mat: [
      { naam: 'Betonpan', per: 10.3, eenheid: 'st', prijs: 1.69, kg: 4.2,
        bron: { url: 'https://www.bouwmaat.nl/monier-dakpan-sneldek-beton-42-cm-antraciet/product/0000203100', datum: '2026-10-06', wat: 'Monier dakpan Sneldek beton 42 cm antraciet: 1,69 excl. btw per stuk; 4,2 kg per stuk' } }
    ] },
  /* 6 okt, tweede controle: keuze-vlag weg; boven 45° en aan windbelaste randen is verankering verplicht (TV 240), de klant kan dit niet weglaten */
  'dak.panhaken': { fase: 'Dakbedekking', naam: 'Pannen verankeren met RVS panhaken (helling boven 45° of windbelaste rand)', eenheid: 'm²', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Panhaak RVS', per: 11, eenheid: 'st', prijs: 0.49, kg: 0.01,
        bron: { url: 'https://www.bouwmaat.nl/bouwmaterialen/dak/dakbedekking/toebehoren-dakpannen', datum: '2026-10-06', wat: 'Monier Euro-panhaak OVH 206 RVS: 12,32 excl. btw per 25 stuks = 0,49 per stuk' } }
    ] },
  /* Natuurlei 40 × 25 in dubbele dekking met haken: 24 stuks per m² plus 4 % breuk; leilatten om de 16 cm zitten in de post */
  'dak.leien.natuur': { fase: 'Dakbedekking', naam: 'Natuurleien 40 × 25 cm leggen met RVS haken, inclusief leilatten', eenheid: 'm²', uur: 0.9,
    afval: [],
    mat: [
      { naam: 'Natuurlei 40 × 25 cm', per: 25, eenheid: 'st', prijs: 2.85, kg: 1.5,
        bron: { url: 'https://andrecelis.be/andrecelis_nl/dak-en-gevel/leien/natuurleien.html', datum: '2026-10-06', wat: 'Itasi Premier Tri natuurlei 40x25: 3,45 incl. btw = 2,85 per stuk netto zonder btw' } },
      { naam: 'Leihaak RVS 110 mm', per: 26, eenheid: 'st', prijs: 0.08, kg: 0.004 },
      { naam: 'Leilat 24 × 32 mm', per: 6.5, eenheid: 'lm', prijs: 0.6, kg: 0.35 },
      { naam: 'Nagels voor de leilatten', per: 1, eenheid: 'm²', prijs: 0.3, kg: 0.1 }
    ] },
  /* Vezelcementlei 60 × 32 (Alterna): 12,6 stuks per m² plus 5 % snijverlies; 1,75 kg per stuk */
  'dak.leien.vezelcement': { fase: 'Dakbedekking', naam: 'Vezelcementleien 60 × 32 cm leggen met RVS haken, inclusief leilatten', eenheid: 'm²', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Vezelcementlei 60 × 32 cm', per: 13.2, eenheid: 'st', prijs: 2.86, kg: 1.75,
        bron: { url: 'https://andrecelis.be/andrecelis_nl/dak-en-gevel/leien.html', datum: '2026-10-06', wat: 'Cedral Alterna 60x32 recht donkergrijs: 3,46 incl. btw = 2,86 per stuk netto zonder btw; 12,6 stuks per m²' } },
      { naam: 'Leihaak RVS 140 mm', per: 14, eenheid: 'st', prijs: 0.1, kg: 0.004 },
      { naam: 'Leilat 24 × 32 mm', per: 4, eenheid: 'lm', prijs: 0.6, kg: 0.35 },
      { naam: 'Nagels voor de leilatten', per: 1, eenheid: 'm²', prijs: 0.3, kg: 0.1 }
    ] },

  /* ---------- Afwerking van nok, randen en aansluitingen ---------- */
  /* 6 okt: nokpan 5,5 vervangen door 8,2 = Monier uni-vorst Sneldek beton bij Bouwmaat (bron op het materiaal).
     6 okt, tweede controle: de ondervorst IS de ventilerende nokrol (droge nok volgens TV 240); de aparte post dak.nokventilatie telde
     dezelfde rol een tweede keer en is weg. Ondervorst 6 (startwaarde) vervangen door 12,04 = Monier Optivent bij Bouwmaat (bron).
     Nokklemmen met RVS schroeven (1 per nokpan) ontbraken en zijn toegevoegd. */
  'dak.nok': { fase: 'Afwerking', naam: 'Nok afwerken met nokpannen en ondervorst', eenheid: 'lm', uur: 0.35,
    afval: [],
    mat: [
      { naam: 'Nokpan', per: 3, eenheid: 'st', prijs: 8.2, kg: 3.5,
        bron: { url: 'https://www.bouwmaat.nl/en/collections/dakpannen', datum: '2026-10-06', wat: 'Monier uni-vorst Sneldek Classic beton 27x42x12 cm: 8,20 excl. btw per stuk (keramische vorst halfrond 11,46)' } },
      { naam: 'Ventilerende ondervorst (ruiterrol)', per: 1.05, eenheid: 'lm', prijs: 12.04, kg: 0.4,
        bron: { url: 'https://www.bouwmaat.nl/bouwmaterialen/dak/dakbedekking/toebehoren-dakpannen', datum: '2026-10-06', wat: 'Monier universele ruiterrol Optivent kunststof 300-340 mm, rol van 5 m: 60,18 excl. btw = 12,04 per lm' } },
      { naam: 'Nokklemmen met RVS schroeven', per: 3, eenheid: 'st', prijs: 0.45, kg: 0.01 }
    ] },
  'dak.nok.leien': { fase: 'Afwerking', naam: 'Nok van een leien dak afwerken met halfronde vezelcementnok', eenheid: 'lm', uur: 0.4,
    afval: [],
    mat: [
      { naam: 'Halfronde nok vezelcement 40 cm', per: 2.6, eenheid: 'st', prijs: 7.61, kg: 2.2,
        bron: { url: 'https://andrecelis.be/andrecelis_nl/dak-en-gevel/leien.html', datum: '2026-10-06', wat: 'Cedral Alterna halfronde nok 400/160 donkergrijs: 9,21 incl. btw = 7,61 per stuk netto zonder btw' } },
      { naam: 'Nokschroeven en kit', per: 1, eenheid: 'lm', prijs: 1.5, kg: 0.1 }
    ] },
  'dak.hoekkeper': { fase: 'Afwerking', naam: 'Hoekkeper van een schilddak afwerken met nokpannen op hoekkeperrol', eenheid: 'lm', uur: 0.4,
    afval: [],
    mat: [
      { naam: 'Nokpan', per: 3, eenheid: 'st', prijs: 8.2, kg: 3.5,
        bron: { url: 'https://www.bouwmaat.nl/en/collections/dakpannen', datum: '2026-10-06', wat: 'Monier uni-vorst Sneldek Classic beton 27x42x12 cm: 8,20 excl. btw per stuk' } },
      { naam: 'Hoekkeperrol en nokbeugels', per: 1, eenheid: 'lm', prijs: 9, kg: 0.4 }
    ] },
  /* 6 okt: gevelpan 6,5 vervangen door 11,11 = Monier gevelpan Sneldek beton bij Bouwmaat (keramische gevelpan OVH 206: 18,35) */
  'dak.gevelpannen': { fase: 'Afwerking', naam: 'Vrije dakrand afwerken met gevelpannen', eenheid: 'lm', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'Gevelpan', per: 4.1, eenheid: 'st', prijs: 11.11, kg: 3,
        bron: { url: 'https://www.bouwmaat.nl/en/collections/dakpannen', datum: '2026-10-06', wat: 'Monier gevelpan links/rechts Sneldek Classic beton: 11,11 excl. btw per stuk; keramische gevelpan OVH 206: 18,35' } },
      /* 6 okt, tweede controle: elke gevelpan wordt vastgeschroefd; bevestiging ontbrak */
      { naam: 'RVS schroeven voor de gevelpannen', per: 4.1, eenheid: 'st', prijs: 0.12, kg: 0.005 }
    ] },
  'dak.kilgoot': { fase: 'Afwerking', naam: 'Kilgoot in zink plaatsen (dakvlakken die elkaar inwendig raken)', eenheid: 'lm', uur: 0.8,
    afval: [{ soort: 'rest', kg: 2 }],
    mat: [
      { naam: 'Zinken kilgoot 0,7 mm, 50 cm ontwikkeld', per: 1.05, eenheid: 'lm', prijs: 22, kg: 2.5 },
      { naam: 'Kilgootklangen, kilgootlatten en soldeer', per: 1, eenheid: 'lm', prijs: 4, kg: 0.6 }
    ] },
  'dak.aansluiting.buur': { fase: 'Afwerking', naam: 'Zinken aansluiting op het dak van de buur (gemene zijde)', eenheid: 'lm', uur: 0.5,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Zinken aansluitstrook met loodslab', per: 1, eenheid: 'lm', prijs: 28, kg: 3 }
    ] },
  'dak.muuraansluiting': { fase: 'Afwerking', naam: 'Aansluiting van het dak tegen een opgaande muur met loodslabben in de voeg', eenheid: 'lm', uur: 0.6,
    afval: [{ soort: 'rest', kg: 2 }],
    mat: [
      { naam: 'Loodslab 20 kg/m² (strook 25 cm) en voegklemmen', per: 1, eenheid: 'lm', prijs: 26, kg: 5 },
      { naam: 'Kit en voegmortel voor de loodslab', per: 1, eenheid: 'lm', prijs: 2, kg: 0.5 }
    ] },
  'dak.schouw': { fase: 'Afwerking', naam: 'Schouw aansluiten met loodslabben', eenheid: 'st', uur: 5,
    afval: [{ soort: 'rest', kg: 5 }],
    mat: [
      { naam: 'Lood en afdichting voor schouw', per: 1, eenheid: 'st', prijs: 180, kg: 18 }
    ] },
  'dak.schouw.kap': { fase: 'Afwerking', naam: 'Schouwkap in RVS op de schouw plaatsen', eenheid: 'st', uur: 1,
    afval: [],
    mat: [
      { naam: 'Schouwkap RVS', per: 1, eenheid: 'st', prijs: 65, kg: 2 }
    ] },
  'dak.doorvoer': { fase: 'Afwerking', naam: 'Dakdoorvoer (ventilatie of rioolontluchting) plaatsen met doorvoerpan', eenheid: 'st', uur: 1.5,
    afval: [],
    mat: [
      { naam: 'Doorvoerpan met aansluitstuk', per: 1, eenheid: 'st', prijs: 85, kg: 3 }
    ] },

  /* ---------- Dakramen en dakkapel ---------- */
  'dak.dakraam': { fase: 'Afwerking', naam: 'Dakraam plaatsen met gootstuk', eenheid: 'st', uur: 5, keuze: 'dakramen',
    afval: [],
    mat: [
      { naam: 'Dakraam 78 × 118 cm met gootstuk', per: 1, eenheid: 'st', prijs: 620, kg: 42 }
    ] },
  'dak.dakraam.herplaatsen': { fase: 'Afwerking', naam: 'Bestaand dakraam herplaatsen op de nieuwe dakopbouw (nieuw gootstuk en manchet)', eenheid: 'st', uur: 3,
    afval: [{ soort: 'rest', kg: 6 }],
    mat: [
      { naam: 'Gootstuk voor bestaand dakraam 78 × 118 cm', per: 1, eenheid: 'st', prijs: 150, kg: 6 },
      { naam: 'Waterkerende manchet BFX 78 × 118 cm', per: 1, eenheid: 'st', prijs: 31.56, kg: 1.73,
        bron: { url: 'https://bouwmaat.nl/velux-gootstuk-edw-mk06-0000-aluminium-78x118-cm-ombergrijs/product/0000582205', datum: '2026-10-06', wat: 'pagina toont VELUX waterkerende manchet BFX MK06 1000 78x118 cm: 31,56 excl. btw; 1,73 kg' } }
    ] },
  'dak.dakraam.vervangen': { fase: 'Afwerking', naam: 'Dakraam vervangen op een bestaande opening (zelfde maat, nieuw gootstuk en manchet)', eenheid: 'st', uur: 4,
    afval: [{ soort: 'rest', kg: 40 }],
    mat: [
      { naam: 'Dakraam 78 × 118 cm met gootstuk', per: 1, eenheid: 'st', prijs: 620, kg: 42 },
      { naam: 'Waterkerende manchet BFX 78 × 118 cm', per: 1, eenheid: 'st', prijs: 31.56, kg: 1.73,
        bron: { url: 'https://bouwmaat.nl/velux-gootstuk-edw-mk06-0000-aluminium-78x118-cm-ombergrijs/product/0000582205', datum: '2026-10-06', wat: 'pagina toont VELUX waterkerende manchet BFX MK06 1000 78x118 cm: 31,56 excl. btw; 1,73 kg' } },
      { naam: 'Binnenafwerking: dampschermmanchet en aansluitkader', per: 1, eenheid: 'st', prijs: 45, kg: 3 }
    ] },
  'dak.dakraam.groot': { fase: 'Afwerking', naam: 'Groot dakraam 114 × 118 cm plaatsen in een nieuwe opening (raveling, gootstuk en manchet)', eenheid: 'st', uur: 6, keuze: 'groot dakraam',
    afval: [],
    mat: [
      { naam: 'Dakraam 114 × 118 cm (GGL SK06)', per: 1, eenheid: 'st', prijs: 558.87, kg: 43,
        bron: { url: 'https://www.bouwmaat.nl/velux-dakraam-ggl-mk06-2070-grenen-gelakt-wit-78x118cm-fsc-mix-credit/product/0000706593', datum: '2026-10-06', wat: 'pagina toont VELUX dakraam GGL SK06 2070 grenen wit 114x118 cm: 558,87 excl. btw; 42,92 kg' } },
      { naam: 'Gootstuk en manchet voor 114 × 118 cm', per: 1, eenheid: 'st', prijs: 130, kg: 6 },
      { naam: 'Raveelconstructie in hout voor de nieuwe opening', per: 1, eenheid: 'st', prijs: 40, kg: 12 }
    ] },
  'dak.dakkapel.aansluiten': { fase: 'Afwerking', naam: 'Dakkapel aansluiten op het dakvlak (kilgoten, loodslabben, onderdak)', eenheid: 'st', uur: 10,
    afval: [{ soort: 'rest', kg: 10 }],
    mat: [
      { naam: 'Zink, lood, onderdakfolie en kit voor de aansluiting van de dakkapel', per: 1, eenheid: 'st', prijs: 260, kg: 25 }
    ] },
  'dak.dakkapel.zink': { fase: 'Afwerking', naam: 'Dakkapel bekleden met zink op nieuwe multiplex onderplaat (wangen en boeiboord)', eenheid: 'm²', uur: 1.6,
    afval: [{ soort: 'rest', kg: 8 }],
    mat: [
      { naam: 'Zink 0,7 mm in staande fels (inclusief verlies)', per: 1.3, eenheid: 'm²', prijs: 28, kg: 5 },
      { naam: 'Multiplex onderplaat 18 mm en structuurmat', per: 1.05, eenheid: 'm²', prijs: 26, kg: 11 },
      { naam: 'Klangen, soldeer en kit voor het zinkwerk', per: 1, eenheid: 'm²', prijs: 3, kg: 0.2 }
    ] },
  'dak.dakkapel.leien': { fase: 'Afwerking', naam: 'Dakkapel bekleden met vezelcementleien op nieuwe multiplex onderplaat (wangen)', eenheid: 'm²', uur: 1.2,
    afval: [{ soort: 'rest', kg: 8 }],
    mat: [
      { naam: 'Vezelcementlei 60 × 32 cm', per: 14, eenheid: 'st', prijs: 2.86, kg: 1.75,
        bron: { url: 'https://andrecelis.be/andrecelis_nl/dak-en-gevel/leien.html', datum: '2026-10-06', wat: 'Cedral Alterna 60x32 recht donkergrijs: 3,46 incl. btw = 2,86 per stuk netto zonder btw' } },
      { naam: 'Leihaak RVS 140 mm', per: 15, eenheid: 'st', prijs: 0.1, kg: 0.004 },
      { naam: 'Multiplex onderplaat 18 mm, folie en latten', per: 1.05, eenheid: 'm²', prijs: 28, kg: 11 }
    ] },

  /* ---------- Boeiboord, dakvoet ---------- */
  'dak.boeiboord.hout': { fase: 'Afwerking', naam: 'Houten boeiboord (multiplex 18 mm) vernieuwen', eenheid: 'lm', uur: 0.4,
    afval: [{ soort: 'hout', kg: 3 }],
    mat: [
      { naam: 'Multiplex 18 mm (boeiboord 25 cm hoog)', per: 0.27, eenheid: 'm²', prijs: 24, kg: 11 },
      { naam: 'Schroeven en grondlaag voor het boeiboord', per: 1, eenheid: 'lm', prijs: 1.5, kg: 0.1 }
    ] },
  /* 6 okt, tweede controle: de bron (Hornbach Precit windveer "zink" 0,5 mm, 29,90 incl. per 2 m) is verzinkt STAAL ("Materiaalspecificatie: Staal"),
     geen titaanzink; bron weg. Startwaarde: titaanzink 0,7 mm (5 kg/m²), ontwikkeld 45 cm, op maat geplooid bij de zinkhandel. */
  'dak.boeiboord.zink': { fase: 'Afwerking', naam: 'Boeiboord of windveer bekleden met zink', eenheid: 'lm', uur: 0.5,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Zinken boeiboordprofiel 0,7 mm, op maat geplooid (ontwikkeld 45 cm)', per: 1.05, eenheid: 'lm', prijs: 15, kg: 2.3 },
      { naam: 'Klangen, soldeer en kit voor het boeiboord', per: 1, eenheid: 'lm', prijs: 2, kg: 0.2 }
    ] },
  'dak.boeiboord.alu': { fase: 'Afwerking', naam: 'Boeiboord bekleden met gelakt aluminium (op maat geplooid)', eenheid: 'lm', uur: 0.45,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Aluminium boeiboordprofiel gelakt, op maat geplooid', per: 1.05, eenheid: 'lm', prijs: 16, kg: 0.9 },
      { naam: 'Bevestiging en kit voor het aluminium boeiboord', per: 1, eenheid: 'lm', prijs: 1.5, kg: 0.1 }
    ] },
  'dak.vogelschroot': { fase: 'Afwerking', naam: 'Vogelschroot aan de dakvoet plaatsen', eenheid: 'lm', uur: 0.05,
    afval: [],
    mat: [
      { naam: 'Vogelschroot kunststof', per: 1.05, eenheid: 'lm', prijs: 2.01, kg: 0.15,
        bron: { url: 'https://www.bouwmaat.nl/bouwmaterialen/dak/dakbedekking/toebehoren-dakpannen', datum: '2026-10-06', wat: 'Monier vogelschroot UVS kunststof antraciet 100 cm: 2,01 excl. btw per stuk' } }
    ] },
  'dak.dakvoetprofiel': { fase: 'Afwerking', naam: 'Dakvoetprofiel (gootaansluiting van het onderdak) plaatsen', eenheid: 'lm', uur: 0.08,
    afval: [],
    mat: [
      { naam: 'Dakvoetprofiel kunststof 13,5 cm', per: 1.05, eenheid: 'st', prijs: 6.32, kg: 0.34,
        bron: { url: 'https://www.bouwmaat.nl/monier-dakvoetprofiel-kombi-135-kunststof-zwart-135x100cm/product/0000565475', datum: '2026-10-06', wat: 'Monier dakvoetprofiel Kombi 135 kunststof zwart 13,5 × 100 cm: 6,32 excl. btw per stuk; 340 g' } }
    ] },

  /* ---------- Afwatering ---------- */
  /* 6 okt: prijs 32 vervangen door 28 = RheinZink mastgoot M30 17,35 per lm (bron) plus 2 beugels en soldeer per lm */
  'dak.goot.zink': { fase: 'Afwatering', naam: 'Zinken hanggoot vervangen', eenheid: 'lm', uur: 0.6, keuze: 'nieuwe goten',
    afval: [{ soort: 'metaal', kg: 3 }],
    mat: [
      { naam: 'Zinken goot met haken', per: 1, eenheid: 'lm', prijs: 28, kg: 2.5,
        bron: { url: 'https://www.bouwmaat.nl/en/collections/rheinzink', datum: '2026-10-06', wat: 'RheinZink mastgoot M30 zink 3 m: 52,06 excl. btw = 17,35 per lm; plus 2 gootbeugels en soldeer per lm = 28' } }
    ] },
  'dak.goot.bakgoot.zink': { fase: 'Afwatering', naam: 'Zinken bakgoot vervangen (0,8 mm, op bakgootbeugels)', eenheid: 'lm', uur: 0.8, keuze: 'nieuwe goten',
    afval: [{ soort: 'metaal', kg: 4 }],
    mat: [
      { naam: 'Zinken bakgoot B37 0,8 mm', per: 1.05, eenheid: 'lm', prijs: 18.91, kg: 3.4,
        bron: { url: 'https://www.bouwmaat.nl/rheinzink-bakgoot-b37-lengte-3-meter-dikte-080-mm/product/0000586859', datum: '2026-10-06', wat: 'RheinZink bakgoot B37 3 m 0,80 mm: 56,73 excl. btw = 18,91 per lm' } },
      { naam: 'Bakgootbeugels (2 per lm) en soldeer', per: 1, eenheid: 'lm', prijs: 11, kg: 0.8,
        bron: { url: 'https://www.bouwmaat.nl/en/collections/rheinzink', datum: '2026-10-06', wat: 'RheinZink bakgootbeugel lip/klang 45° B37 gegalvaniseerd: 4,81 excl. btw per stuk; 2 per lm plus soldeer' } }
    ] },
  'dak.goot.bodem': { fase: 'Afwatering', naam: 'Houten gootconstructie (gootbodem en gootplank) onder een bakgoot vernieuwen', eenheid: 'lm', uur: 0.8,
    afval: [{ soort: 'hout', kg: 4 }],
    mat: [
      { naam: 'Multiplex, latten en gootbeugels voor de gootbodem', per: 1, eenheid: 'lm', prijs: 18, kg: 6 }
    ] },
  'dak.goot.pvc': { fase: 'Afwatering', naam: 'PVC hanggoot vervangen', eenheid: 'lm', uur: 0.4, keuze: 'nieuwe goten',
    afval: [{ soort: 'rest', kg: 1.5 }],
    mat: [
      { naam: 'PVC mastgoot 100 mm', per: 1.05, eenheid: 'lm', prijs: 2.34, kg: 0.6,
        bron: { url: 'https://www.hornbach.nl/c/bouwstoffen-hout-ramen-deuren/bouwmateriaal/hemelwaterafvoer-rioolwaterafvoer/dakgoten/S4481/', datum: '2026-10-06', wat: 'Martens mastgoot PVC grijs 2000 × 100 mm: 5,65 incl. btw per 2 m gedeeld door 1,21 = 2,34 per lm' } },
      { naam: 'Gootbeugels, verbindingsstukken en eindstukken PVC', per: 1, eenheid: 'lm', prijs: 4, kg: 0.4 }
    ] },
  'dak.goot.alu': { fase: 'Afwatering', naam: 'Aluminium hanggoot vervangen (gelakt)', eenheid: 'lm', uur: 0.5, keuze: 'nieuwe goten',
    afval: [{ soort: 'rest', kg: 1.5 }],
    mat: [
      { naam: 'Aluminium mastgoot 125 mm gelakt', per: 1.05, eenheid: 'lm', prijs: 8.07, kg: 0.45,
        bron: { url: 'https://www.hornbach.nl/p/precit-mastgoot-aluminium-ral-7016-antracietgrijs-o-125-mm-4000mm/6369760/', datum: '2026-10-06', wat: 'Precit mastgoot aluminium RAL 7016 Ø 125 mm 4 m: 39,05 incl. btw gedeeld door 1,21 = 8,07 per lm; 1,8 kg per 4 m' } },
      { naam: 'Beugels en hulpstukken aluminium', per: 1, eenheid: 'lm', prijs: 6, kg: 0.4 }
    ] },
  'dak.goot.herstel': { fase: 'Afwatering', naam: 'Goot herstellen (lek dichten, beugel vervangen, stuk vernieuwen; forfait in uren)', eenheid: 'u', uur: 1,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Zink, soldeer, kit en beugels voor de herstelling', per: 1, eenheid: 'u', prijs: 15, kg: 1 }
    ] },
  'dak.goot.reinigen': { fase: 'Afwatering', naam: 'Goten reinigen en bladvangers in de afvoeren plaatsen', eenheid: 'lm', uur: 0.08, keuze: 'gootreiniging',
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Bladvanger (1 per 10 lm goot)', per: 0.1, eenheid: 'st', prijs: 6, kg: 0.1 }
    ] },
  'dak.afvoer.zink': { fase: 'Afwatering', naam: 'Zinken regenafvoer vervangen', eenheid: 'lm', uur: 0.4, keuze: 'nieuwe afvoeren',
    afval: [{ soort: 'metaal', kg: 1.5 }],
    mat: [
      { naam: 'Zinken afvoerbuis met beugels', per: 1, eenheid: 'lm', prijs: 24, kg: 1.6 }
    ] },
  'dak.afvoer.pvc': { fase: 'Afwatering', naam: 'PVC regenafvoer vervangen', eenheid: 'lm', uur: 0.3, keuze: 'nieuwe afvoeren',
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'PVC afvoerbuis 80 mm met beugels en bochten', per: 1, eenheid: 'lm', prijs: 7, kg: 0.9 }
    ] },
});
