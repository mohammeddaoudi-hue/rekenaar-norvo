/* Datatabel: Plat dak. Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw, nog door geen aannemer bevestigd.
   Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met bron: prijs op 6 okt 2026 gelezen op de pagina in bron.url (consumentenprijs incl. btw gedeeld door 1,21).
   Een materiaal zonder bron: startwaarde uit vakkennis. Gewichten: technische fiches en vakkennis. */
Object.assign(globalThis.RP_DATA.posten, {
  'plat.stelling': { fase: 'Werfinrichting', naam: 'Stelling en randbeveiliging rond het plat dak plaatsen en afbreken', eenheid: 'm²', uur: 0.12,
    afval: [],
    mat: [
      { naam: 'Huur gevelstelling', per: 1, eenheid: 'm²', prijs: 4, kg: 0, huur: true, perWeek: true }
    ] },
  'plat.afbraak': { fase: 'Afbraak', naam: 'Oude dakbedekking en isolatie van het plat dak verwijderen', eenheid: 'm²', uur: 0.2,
    afval: [{ soort: 'rest', kg: 25 }], mat: [] },
  'plat.grind.weg': { fase: 'Afbraak', naam: 'Grindballast van het plat dak afscheppen en afvoeren', eenheid: 'm²', uur: 0.15,
    afval: [{ soort: 'puin', kg: 80 }], mat: [] },
  'plat.reinigen': { fase: 'Voorbereiding', naam: 'Bestaande roofing reinigen en blazen opensnijden vóór een overlaging', eenheid: 'm²', uur: 0.05,
    afval: [{ soort: 'rest', kg: 0.5 }], mat: [] },
  'plat.roostering': { fase: 'Ruwbouw', naam: 'Houten dakstructuur (balken) van het plat dak vernieuwen', eenheid: 'm²', uur: 0.8,
    afval: [{ soort: 'hout', kg: 15 }],
    mat: [
      { naam: 'Balkhout 63 × 175 mm', per: 2.2, eenheid: 'lm', prijs: 8.5, kg: 5.5 },
      { naam: 'Balkdragers, verbinders en schroeven', per: 1, eenheid: 'm²', prijs: 2, kg: 0.3 }
    ] },
  'plat.beplating': { fase: 'Dakopbouw', naam: 'Dakbeplating OSB 18 mm van het plat dak vervangen', eenheid: 'm²', uur: 0.25,
    afval: [{ soort: 'hout', kg: 12 }],
    mat: [
      { naam: 'OSB-plaat 18 mm', per: 1.08, eenheid: 'm²', prijs: 7.5, kg: 11.2 },
      { naam: 'Schroeven voor dakbeplating', per: 1, eenheid: 'm²', prijs: 0.5, kg: 0.1 }
    ] },
  /* Tweede controle 6 okt 2026: een gebrand of op primer verkleefd dampscherm vraagt primer en gas; zelfde regel en prijs als bij de roofing zodat de materiaallijst ze optelt. */
  'plat.dampscherm': { fase: 'Dakopbouw', naam: 'Bitumineus dampscherm plaatsen', eenheid: 'm²', uur: 0.08,
    afval: [],
    mat: [
      { naam: 'Dampscherm', per: 1.1, eenheid: 'm²', prijs: 4.5, kg: 2 },
      { naam: 'Bitumenprimer en propaan', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.4 }
    ] },
  'plat.isolatie.pir10': { fase: 'Dakopbouw', naam: 'PIR-isolatie 10 cm op het plat dak plaatsen', eenheid: 'm²', uur: 0.11, keuze: 'PIR-isolatie 10 cm',
    afval: [],
    mat: [
      { naam: 'PIR-dakplaat 10 cm', per: 1.03, eenheid: 'm²', prijs: 21.4, kg: 3.6,
        bron: { url: 'https://www.hornbach.nl/p/iko-pir-isolatieplaat-enertherm-tong-groef-rd-4-50-1200x600x100-mm/10368512/', datum: '2026-10-06', wat: 'IKO Enertherm PIR 100 mm € 25,90 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Bevestiging en lijm', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.3 }
    ] },
  /* Prijs 30 -> 23,50 en kg 3,9 -> 4,3 op 6 okt 2026: Hornbach-prijs van de 120 mm-plaat, gewicht uit de fiche (32 kg/m³ + cacheerlagen). */
  'plat.isolatie.pir': { fase: 'Dakopbouw', naam: 'PIR-isolatie 12 cm op het plat dak plaatsen', eenheid: 'm²', uur: 0.12, keuze: 'PIR-isolatie 12 cm',
    afval: [],
    mat: [
      { naam: 'PIR-dakplaat 12 cm', per: 1.03, eenheid: 'm²', prijs: 23.5, kg: 4.3,
        bron: { url: 'https://www.hornbach.nl/p/iko-pir-isolatieplaat-enertherm-rechte-kant-rd-5-45-1200x600x120-mm/10732484/', datum: '2026-10-06', wat: 'IKO Enertherm PIR 120 mm € 28,44 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Bevestiging en lijm', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.3 }
    ] },
  'plat.isolatie.pir14': { fase: 'Dakopbouw', naam: 'PIR-isolatie 14 cm op het plat dak plaatsen', eenheid: 'm²', uur: 0.13, keuze: 'PIR-isolatie 14 cm',
    afval: [],
    mat: [
      { naam: 'PIR-dakplaat 14 cm', per: 1.03, eenheid: 'm²', prijs: 28.01, kg: 4.9,
        bron: { url: 'https://www.hornbach.nl/p/iko-pir-isolatieplaat-enertherm-tong-groef-rd-6-35-1200x600x140-mm/10368514/', datum: '2026-10-06', wat: 'IKO Enertherm PIR 140 mm € 33,89 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Bevestiging en lijm', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.3 }
    ] },
  'plat.afschot': { fase: 'Dakopbouw', naam: 'Afschotisolatie PIR (hellend gezaagd, gemiddeld 8 cm) op het plat dak plaatsen', eenheid: 'm²', uur: 0.18, keuze: 'afschotisolatie',
    afval: [],
    mat: [
      { naam: 'PIR-afschotplaat gemiddeld 8 cm', per: 1.05, eenheid: 'm²', prijs: 32, kg: 3.2 },
      { naam: 'Bevestiging en lijm', per: 1, eenheid: 'm²', prijs: 2.5, kg: 0.3 }
    ] },
  /* EPDM-folie 14 -> 11,12 op 6 okt 2026: Hornbach-prijs van 1,2 mm EPDM van de rol.
     Tweede controle 6 okt 2026: de folie komt van de rol van 3,5 m breed, dus elk dak breder dan 3,5 m heeft naden (naadtape) en elke rand kit; zelfde regel als bij de mechanische variant. */
  'plat.epdm': { fase: 'Dakbedekking', naam: 'EPDM-dakbedekking volledig verkleefd', eenheid: 'm²', uur: 0.25,
    afval: [],
    mat: [
      { naam: 'EPDM-folie 1,2 mm', per: 1.1, eenheid: 'm²', prijs: 11.12, kg: 1.5,
        bron: { url: 'https://www.hornbach.nl/c/bouwstoffen-hout-ramen-deuren/bouwmateriaal/dakbedekking/epdm-dakbedekking/epdm-folie/S37560/', datum: '2026-10-06', wat: 'Premiumfol EPDM 1,20 mm € 13,45 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Contactlijm', per: 0.4, eenheid: 'kg', prijs: 9, kg: 1 },
      { naam: 'Naadtape en randkit voor EPDM', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.1 }
    ] },
  'plat.epdm.mechanisch': { fase: 'Dakbedekking', naam: 'EPDM-dakbedekking mechanisch bevestigd', eenheid: 'm²', uur: 0.2,
    afval: [],
    mat: [
      { naam: 'EPDM-folie 1,2 mm', per: 1.1, eenheid: 'm²', prijs: 11.12, kg: 1.5,
        bron: { url: 'https://www.hornbach.nl/c/bouwstoffen-hout-ramen-deuren/bouwmateriaal/dakbedekking/epdm-dakbedekking/epdm-folie/S37560/', datum: '2026-10-06', wat: 'Premiumfol EPDM 1,20 mm € 13,45 per m² incl. btw gedeeld door 1,21' } },
      { naam: 'Bevestigers met drukverdeelplaatjes', per: 4, eenheid: 'st', prijs: 0.9, kg: 0.03 },
      { naam: 'Naadtape en randkit voor EPDM', per: 1, eenheid: 'm²', prijs: 1.5, kg: 0.1 }
    ] },
  /* 'Roofing (2 lagen)' op 6 okt 2026 gesplitst in onderlaag en toplaag, elk met Hornbach-prijs; het gas en de primer apart. */
  'plat.roofing': { fase: 'Dakbedekking', naam: 'Roofing in 2 lagen gebrand', eenheid: 'm²', uur: 0.3,
    afval: [],
    mat: [
      { naam: 'Roofing onderlaag APP 2 mm', per: 1.1, eenheid: 'm²', prijs: 4.57, kg: 1.7,
        bron: { url: 'https://www.hornbach.nl/p/royalbase-onderlaag-app-460p60-dakleer-15-x-1-m/12724186/', datum: '2026-10-06', wat: 'Royalbase APP onderlaag € 82,95 per rol van 15 m² incl. btw gedeeld door 1,21' } },
      { naam: 'Roofing toplaag APP 4 mm leislag', per: 1.1, eenheid: 'm²', prijs: 9.24, kg: 5.1,
        bron: { url: 'https://www.hornbach.nl/p/royalgum-app-470k24-mineral-dakleer-5-x-1-m/12724188/', datum: '2026-10-06', wat: 'Royalgum APP 470K24 mineral € 55,90 per rol van 5 m² incl. btw gedeeld door 1,21; 25,4 kg per rol' } },
      { naam: 'Bitumenprimer en propaan', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.4 }
    ] },
  'plat.roofing.overlaging': { fase: 'Dakbedekking', naam: 'Roofing overlagen met 1 nieuwe toplaag op de bestaande roofing', eenheid: 'm²', uur: 0.18,
    afval: [],
    mat: [
      { naam: 'Roofing toplaag APP 4 mm leislag', per: 1.1, eenheid: 'm²', prijs: 9.24, kg: 5.1,
        bron: { url: 'https://www.hornbach.nl/p/royalgum-app-470k24-mineral-dakleer-5-x-1-m/12724188/', datum: '2026-10-06', wat: 'Royalgum APP 470K24 mineral € 55,90 per rol van 5 m² incl. btw gedeeld door 1,21; 25,4 kg per rol' } },
      { naam: 'Bitumenprimer en propaan', per: 1, eenheid: 'm²', prijs: 1.2, kg: 0.4 }
    ] },
  'plat.omgekeerd': { fase: 'Dakbedekking', naam: 'Omgekeerd dak: XPS-isolatie 10 cm en grindballast op de dakbedekking', eenheid: 'm²', uur: 0.2, keuze: 'omgekeerd dak',
    afval: [],
    mat: [
      { naam: 'XPS-plaat 10 cm drukvast', per: 1.03, eenheid: 'm²', prijs: 22, kg: 3.5 },
      { naam: 'Filtervlies', per: 1.1, eenheid: 'm²', prijs: 1.2, kg: 0.15 },
      { naam: 'Grind 16/32 als ballast', per: 80, eenheid: 'kg', prijs: 0.15, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/excluton-grind-wit-grijs-8-16-mm-bigbag-1000-kg/10463386/', datum: '2026-10-06', wat: 'big bag grind 8-16 mm (inhoud 1.200 kg) € 219 incl. btw gedeeld door 1,21 en door 1.200 kg; prijs per kg als ijk voor 16/32' } }
    ] },
  'plat.groendak': { fase: 'Dakbedekking', naam: 'Extensief groendak met substraat en sedum aanleggen', eenheid: 'm²', uur: 0.35, keuze: 'groendak',
    afval: [],
    mat: [
      { naam: 'Wortelwerende folie', per: 1.15, eenheid: 'm²', prijs: 2.5, kg: 0.5 },
      { naam: 'Drainagemat met filtervlies', per: 1.05, eenheid: 'm²', prijs: 6.5, kg: 1.2 },
      { naam: 'Substraat voor groendak 6 cm', per: 65, eenheid: 'kg', prijs: 0.12, kg: 1 },
      { naam: 'Sedummat voorgekweekt', per: 1.03, eenheid: 'm²', prijs: 18, kg: 20 },
      { naam: 'Grind 16/32 als ballast', per: 10, eenheid: 'kg', prijs: 0.15, kg: 1,
        bron: { url: 'https://www.hornbach.nl/p/excluton-grind-wit-grijs-8-16-mm-bigbag-1000-kg/10463386/', datum: '2026-10-06', wat: 'big bag grind 8-16 mm (inhoud 1.200 kg) € 219 incl. btw gedeeld door 1,21 en door 1.200 kg; prijs per kg als ijk voor 16/32' } }
    ] },
  'plat.terras': { fase: 'Afwerking', naam: 'Dakterras met keramische tegels 60 × 60 op tegeldragers', eenheid: 'm²', uur: 0.6, keuze: 'dakterras',
    afval: [],
    mat: [
      { naam: 'Keramische terrastegel 60 × 60 × 2 cm', per: 2.92, eenheid: 'st', prijs: 9.05, kg: 17,
        bron: { url: 'https://www.hornbach.nl/p/flairstone-keramische-tuintegel-burlington-blue-60-x-60-x-2-cm/12309288/', datum: '2026-10-06', wat: 'Flairstone 60 × 60 × 2 cm € 10,95 per stuk incl. btw gedeeld door 1,21' } },
      { naam: 'Verstelbare tegeldrager', per: 3.5, eenheid: 'st', prijs: 3.43, kg: 0.15,
        bron: { url: 'https://www.hornbach.nl/p/verstelbare-terrasregeldrager-35-70-mm/6260944/', datum: '2026-10-06', wat: 'verstelbare tegeldrager 35-70 mm € 4,15 per stuk incl. btw gedeeld door 1,21' } },
      { naam: 'Beschermmat onder de tegeldragers', per: 0.3, eenheid: 'm²', prijs: 5, kg: 1 }
    ] },
  /* Dakrandprofiel 18 -> 4,92 op 6 okt 2026: Hornbach-prijs van een aluminium daktrim 60 × 45 mm; hoekstukken en kit apart. */
  'plat.dakrand': { fase: 'Afwerking', naam: 'Aluminium dakrandprofiel plaatsen', eenheid: 'lm', uur: 0.3,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Dakrandprofiel', per: 1, eenheid: 'lm', prijs: 4.92, kg: 0.5,
        bron: { url: 'https://www.hornbach.nl/p/daktrim-aluminium-60-x-45-mm-lengte-2500-mm/5578648/', datum: '2026-10-06', wat: 'daktrim aluminium 60 × 45 mm van 2,5 m € 14,89 incl. btw gedeeld door 1,21 en door 2,5 m' } },
      { naam: 'Hoekstukken, schroeven en kit voor het dakrandprofiel', per: 1, eenheid: 'lm', prijs: 2.5, kg: 0.2 }
    ] },
  'plat.dakrand.bitumen': { fase: 'Afwerking', naam: 'Dakrand afwerken met een bitumen strook over een houten dakrandboord', eenheid: 'lm', uur: 0.35,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Dakrandboord hout 22 mm', per: 1, eenheid: 'lm', prijs: 6, kg: 2.5 },
      { naam: 'Roofing toplaag APP 4 mm leislag', per: 0.5, eenheid: 'm²', prijs: 9.24, kg: 5.1,
        bron: { url: 'https://www.hornbach.nl/p/royalgum-app-470k24-mineral-dakleer-5-x-1-m/12724188/', datum: '2026-10-06', wat: 'Royalgum APP 470K24 mineral € 55,90 per rol van 5 m² incl. btw gedeeld door 1,21; 25,4 kg per rol' } },
      { naam: 'Kraalprofiel, nagels en kit', per: 1, eenheid: 'lm', prijs: 2, kg: 0.2 }
    ] },
  'plat.opstand': { fase: 'Afwerking', naam: 'Opstanden en aansluitingen tegen muren afwerken', eenheid: 'lm', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Opstandstrook en kit', per: 1, eenheid: 'lm', prijs: 12, kg: 1 }
    ] },
  'plat.kilgoot': { fase: 'Afwatering', naam: 'Kilgoot tussen twee dakvlakken in EPDM of zink vernieuwen', eenheid: 'lm', uur: 0.8,
    afval: [{ soort: 'rest', kg: 3 }],
    mat: [
      { naam: 'Kilgootbodem in hout met zinken of EPDM-bekleding', per: 1, eenheid: 'lm', prijs: 35, kg: 6 }
    ] },
  'plat.bakgoot': { fase: 'Afwatering', naam: 'Zinken bakgoot langs het plat dak vernieuwen', eenheid: 'lm', uur: 0.9, keuze: 'nieuwe bakgoot',
    afval: [{ soort: 'metaal', kg: 3 }],
    mat: [
      { naam: 'Zinken bakgoot met bodemplank', per: 1, eenheid: 'lm', prijs: 48, kg: 4 }
    ] },
  'plat.afvoer': { fase: 'Afwatering', naam: 'Tapbuis en afvoer van het plat dak vervangen', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 2 }],
    mat: [
      { naam: 'Tapbuis met bladvanger', per: 1, eenheid: 'st', prijs: 45, kg: 2 }
    ] },
  'plat.noodoverloop': { fase: 'Afwatering', naam: 'Noodoverloop (spuwer) door de dakrand plaatsen', eenheid: 'st', uur: 1.5,
    afval: [],
    mat: [
      { naam: 'Spuwer in zink of EPDM', per: 1, eenheid: 'st', prijs: 45, kg: 2 }
    ] },
  'plat.doorvoer': { fase: 'Afwerking', naam: 'Dakdoorvoer voor ventilatie of afvoer waterdicht aansluiten', eenheid: 'st', uur: 1.5,
    afval: [],
    mat: [
      { naam: 'Doorvoerstuk met slab', per: 1, eenheid: 'st', prijs: 55, kg: 2 }
    ] },
  /* Lichtkoepel 650 -> 647,21 op 6 okt 2026: Hornbach-prijs van een vaste koepel 100 × 100 cm met geïsoleerde opstand.
     Tweede controle 6 okt 2026: een nieuwe opstand moet opnieuw in de dakbedekking ingewerkt worden; zelfde regel als bij de nieuwe koepel. */
  'plat.koepel': { fase: 'Afwerking', naam: 'Lichtkoepel met opstand vervangen', eenheid: 'st', uur: 4, keuze: 'lichtkoepels',
    afval: [{ soort: 'rest', kg: 15 }],
    mat: [
      { naam: 'Lichtkoepel 100 × 100 cm met opstand', per: 1, eenheid: 'st', prijs: 647.21, kg: 30,
        bron: { url: 'https://www.hornbach.nl/p/aron-comfort-vaste-dakkoepel-bxh-100x100-cm-ral-7022/10567814/', datum: '2026-10-06', wat: 'Aron Comfort vaste dakkoepel 100 × 100 cm € 783,12 incl. btw gedeeld door 1,21' } },
      { naam: 'Aansluitstroken en kit rond de opstand', per: 1, eenheid: 'st', prijs: 35, kg: 3 }
    ] },
  'plat.koepel.nieuw': { fase: 'Afwerking', naam: 'Nieuwe lichtkoepel in een nieuw gemaakte dakopening plaatsen', eenheid: 'st', uur: 7, keuze: 'nieuwe lichtkoepel',
    afval: [{ soort: 'hout', kg: 10 }],
    mat: [
      { naam: 'Lichtkoepel 100 × 100 cm met opstand', per: 1, eenheid: 'st', prijs: 647.21, kg: 30,
        bron: { url: 'https://www.hornbach.nl/p/aron-comfort-vaste-dakkoepel-bxh-100x100-cm-ral-7022/10567814/', datum: '2026-10-06', wat: 'Aron Comfort vaste dakkoepel 100 × 100 cm € 783,12 incl. btw gedeeld door 1,21' } },
      { naam: 'Raveling en opstandhout voor de dakopening', per: 1, eenheid: 'st', prijs: 60, kg: 15 },
      { naam: 'Aansluitstroken en kit rond de opstand', per: 1, eenheid: 'st', prijs: 35, kg: 3 }
    ] },
  'plat.lichtstraat': { fase: 'Afwerking', naam: 'Lichtstraat in polycarbonaat met opstand plaatsen', eenheid: 'm²', uur: 3, keuze: 'lichtstraat',
    afval: [{ soort: 'hout', kg: 5 }],
    mat: [
      { naam: 'Lichtstraat polycarbonaat met aluminium opstand', per: 1, eenheid: 'm²', prijs: 104.8, kg: 12,
        bron: { url: 'https://www.hmg-benelux-shop.com/alumon-lichtstraat-type-15-dagmaat-160-m-opaal-wit-95al15o1600.html', datum: '2026-10-06', wat: 'Alumon lichtstraat type 1/5 met opstand, buitenmaat 1,74 m: € 220,74 per lm incl. btw gedeeld door 1,21 en door 1,74 m' } },
      { naam: 'Raveling en opstandhout rond de lichtstraat', per: 1, eenheid: 'm²', prijs: 25, kg: 6 },
      { naam: 'Aansluitstroken en kit rond de lichtstraat', per: 1, eenheid: 'm²', prijs: 15, kg: 1.5 }
    ] },
});
