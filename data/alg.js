/* Datatabel: Algemeen (werfkosten die bij elk vak kunnen horen). Startwaarden van 6 oktober 2026, inkoopprijzen zonder btw,
   nog door geen aannemer bevestigd. Velden en regels: zie data/basis.js. Controle: node check-data.cjs
   Een materiaal met bron: prijs op 6 okt 2026 gelezen op de pagina in bron.url (consumentenprijs incl. btw gedeeld door 1,21).
   Een materiaal zonder bron: startwaarde uit vakkennis. Huurprijzen van verhuurders (Boels) staan online alleen op aanvraag: startwaarden.
   Posten in 'u' (uren) en 'dag' (dagen): de hoeveelheid is het aantal uren of dagen. */
Object.assign(globalThis.RP_DATA.posten, {
  'alg.werfinrichting': { fase: 'Werfinrichting', naam: 'Werfinrichting: werfkeet, toilet en stroomaansluiting (forfait)', eenheid: 'st', uur: 4,
    afval: [],
    mat: [
      { naam: 'Huur werfkeet en mobiel toilet (per week)', per: 1, eenheid: 'st', prijs: 95, kg: 0, huur: true, perWeek: true },
      { naam: 'Levering en ophaling van werfkeet en toilet', per: 1, eenheid: 'st', prijs: 150, kg: 0, huur: true },
      { naam: 'Werfkast, verlengkabels en stroomverbruik', per: 1, eenheid: 'st', prijs: 60, kg: 0 }
    ] },
  'alg.afdekken': { fase: 'Werfinrichting', naam: 'Afdekken en beschermen van vloeren, trappen en meubels', eenheid: 'm²', uur: 0.05,
    afval: [{ soort: 'rest', kg: 0.3 }],
    mat: [
      { naam: 'Stucloper (afdekkarton)', per: 1.1, eenheid: 'm²', prijs: 0.45, kg: 0.3,
        bron: { url: 'https://www.hornbach.nl/p/stucloper-wit-bruin-ca-1-3x38-5-m/6073627/', datum: '2026-10-06', wat: 'stucloper 1,3 × 38,5 m (50 m²) € 26,95 per rol incl. btw gedeeld door 1,21 en door 50 m²' } },
      { naam: 'Afdekfolie en tape', per: 1, eenheid: 'm²', prijs: 0.3, kg: 0.05 }
    ] },
  'alg.stofscherm': { fase: 'Werfinrichting', naam: 'Stofscherm (foliewand met ritsdeur) plaatsen en verwijderen', eenheid: 'st', uur: 1.5,
    afval: [{ soort: 'rest', kg: 1 }],
    mat: [
      { naam: 'Stofwandfolie, ritsdeur en tape', per: 1, eenheid: 'st', prijs: 35, kg: 1 }
    ] },
  'alg.valbeveiliging': { fase: 'Werfinrichting', naam: 'Valbeveiliging en veiligheidsmateriaal voor de werf (forfait)', eenheid: 'st', uur: 1,
    afval: [],
    mat: [
      { naam: 'Huur harnassen, lijnen en randbeveiliging (per week)', per: 1, eenheid: 'st', prijs: 40, kg: 0, huur: true, perWeek: true }
    ] },
  'alg.parkeerverbod': { fase: 'Werfinrichting', naam: 'Parkeerverbod aanvragen bij de gemeente en borden plaatsen', eenheid: 'st', uur: 1.5,
    afval: [],
    mat: [
      { naam: 'Aanvraag parkeerverbod en huur signalisatieborden', per: 1, eenheid: 'st', prijs: 65, kg: 0, huur: true }
    ] },
  'alg.inname': { fase: 'Werfinrichting', naam: 'Inname openbaar domein voor container, stelling of kraan, per dag', eenheid: 'dag', uur: 0,
    afval: [],
    mat: [
      { naam: 'Retributie gemeente voor inname openbaar domein (per dag)', per: 1, eenheid: 'dag', prijs: 25, kg: 0, huur: true }
    ] },
  'alg.vergunning': { fase: 'Werfinrichting', naam: 'Omgevingsvergunning of melding bij de gemeente voorbereiden', eenheid: 'st', uur: 4,
    afval: [],
    mat: [
      { naam: 'Dossierkosten gemeente', per: 1, eenheid: 'st', prijs: 50, kg: 0, huur: true }
    ] },
  'alg.asbest.inventaris': { fase: 'Voorbereiding', naam: 'Asbestattest of asbestinventaris laten opmaken', eenheid: 'st', uur: 1,
    afval: [],
    mat: [
      { naam: 'Asbestdeskundige voor het attest', per: 1, eenheid: 'st', prijs: 450, kg: 0, huur: true }
    ] },
  'alg.kraan': { fase: 'Werfinrichting', naam: 'Kleine kraan of verreiker op de werf, per dag', eenheid: 'dag', uur: 0,
    afval: [],
    mat: [
      { naam: 'Huur verreiker of minikraan (per dag)', per: 1, eenheid: 'dag', prijs: 280, kg: 0, huur: true },
      { naam: 'Brandstof en transport van de machine (per dag)', per: 1, eenheid: 'dag', prijs: 60, kg: 0, huur: true }
    ] },
  'alg.levering': { fase: 'Werfinrichting', naam: 'Levering van materialen op de werf, per rit', eenheid: 'st', uur: 0.5,
    afval: [],
    mat: [
      { naam: 'Transportkost van de leverancier (per rit)', per: 1, eenheid: 'st', prijs: 85, kg: 0, huur: true }
    ] },
  'alg.puin': { fase: 'Afbraak', naam: 'Puin opruimen en afvoeren, per m³', eenheid: 'm³', uur: 1.2,
    afval: [{ soort: 'puin', kg: 1500 }], mat: [] },
  'alg.inboedel': { fase: 'Voorbereiding', naam: 'Inboedel verplaatsen en na de werken terugzetten', eenheid: 'u', uur: 1,
    afval: [], mat: [] },
  'alg.opkuis': { fase: 'Afwerking', naam: 'Opkuis van de werf en oplevering', eenheid: 'u', uur: 1,
    afval: [{ soort: 'rest', kg: 5 }],
    mat: [
      { naam: 'Vuilniszakken en poetsmateriaal', per: 0.1, eenheid: 'st', prijs: 15, kg: 0.5 }
    ] },
});
