/* Test van de pagina zelf in een onzichtbare Chrome: adres invullen, op Bereken klikken, kijken hoe de regels binnenlopen.
   Gebruik: node test-klik.mjs http://localhost:4791 "Straat 1 Gemeente" uit.png */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASIS = process.argv[2] || 'http://localhost:4791';
const ADRES = process.argv[3] ?? 'August van Landeghemstraat 63 Willebroek';
const UIT = process.argv[4] || path.join(os.tmpdir(), 'richtprijs-klik.png');
const CHROME = process.env.CHROME_EXE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const POORT = 9333;
const slaap = (ms) => new Promise((r) => setTimeout(r, ms));

const profiel = fs.mkdtempSync(path.join(os.tmpdir(), 'richtprijs-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + POORT, '--user-data-dir=' + profiel, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
let fouten = 0;
const toets = (naam, ok, detail) => { if (!ok) fouten++; console.log((ok ? 'OK   ' : 'FOUT ') + naam + (detail ? '  [' + detail + ']' : '')); };

try {
  let doel = null;
  for (let i = 0; i < 40 && !doel; i++) {
    await slaap(250);
    try { doel = (await (await fetch('http://127.0.0.1:' + POORT + '/json/list')).json()).find((t) => t.type === 'page'); } catch (e) { /* Chrome start nog */ }
  }
  if (!doel) throw new Error('Chrome start niet.');
  const ws = new WebSocket(doel.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('Geen verbinding met Chrome.')); });
  let id = 0;
  const open = new Map();
  const consoleFouten = [];
  ws.onmessage = (e) => {
    const b = JSON.parse(e.data);
    if (b.id && open.has(b.id)) { open.get(b.id)(b.result || {}); open.delete(b.id); }
    if (b.method === 'Runtime.exceptionThrown') consoleFouten.push(b.params.exceptionDetails.text + ' ' + ((b.params.exceptionDetails.exception || {}).description || ''));
  };
  const stuur = (method, params = {}) => new Promise((res) => { const i = ++id; open.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => ((await stuur('Runtime.evaluate', { expression: expr, returnByValue: true })).result || {}).value;

  await stuur('Runtime.enable');
  await stuur('Page.enable');
  await stuur('Page.navigate', { url: BASIS + '/' });
  await slaap(2000);
  toets('pagina geladen, nog geen berekening', (await ev("document.getElementById('uitkomst').textContent")).includes('Nog geen berekening'));
  toets('losse bestanden geladen (data, motor, ui)', (await ev("Object.keys(globalThis.RP_DATA.posten).length")) >= 40 && (await ev("typeof globalThis.RP.bereken")) === 'function');
  /* De test vult zelf het adres én de klus in (het klusveld is bij het laden leeg) en vuurt input-gebeurtenissen zodat de pagina ze ziet. */
  await ev("(() => { const zet = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }; zet('adres', " + JSON.stringify(ADRES) + "); zet('klus', globalThis.RP.VOORBEELD.klus); document.getElementById('bereken').click(); return 1; })()");

  const t0 = Date.now();
  const lijn = [];
  let eind = null;
  while (Date.now() - t0 < 240000) {
    await slaap(3000);
    const s = JSON.parse(await ev(`JSON.stringify({ status: document.getElementById('status').textContent, fout: document.getElementById('status').className === 'fout',
      rijen: document.querySelectorAll('#werkblad .rij:not(.rij--kop)').length, prijs: (document.querySelector('.prijs') || {}).textContent || '',
      punten: document.querySelectorAll('#uitleg li').length, gemeten: !document.getElementById('gemeten').hidden })`));
    lijn.push(Math.round((Date.now() - t0) / 1000) + ' s: ' + s.rijen + ' posten, ' + s.punten + ' uitlegpunten, ' + (s.prijs.split('incl')[0] || 'geen prijs') + ' | ' + s.status);
    if (s.fout || /^Klaar|^Gestopt/.test(s.status)) { eind = s; break; }
  }
  console.log(lijn.join('\n'));
  toets('klaar zonder foutmelding', !!eind && !eind.fout && /^Klaar/.test(eind.status), eind ? eind.status : 'geen einde binnen 240 s');
  if (ADRES) toets('meting op het adres staat op de pagina', !!eind && eind.gemeten, await ev("(document.querySelector('#gemeten .meting') || {}).innerText || document.getElementById('gemeten').innerText"));
  toets('werkblad gevuld', !!eind && eind.rijen >= 8, eind && String(eind.rijen));
  toets('uitleg geschreven', !!eind && eind.punten >= 1 && eind.punten <= 6, eind && String(eind.punten));
  const groei = lijn.map((l) => Number(l.match(/: (\d+) posten/)[1]));
  toets('posten liepen binnen terwijl de AI schreef', new Set(groei.filter((n) => n > 0)).size >= 2, groei.join(' '));
  toets('geen scriptfouten in de pagina', consoleFouten.length === 0, consoleFouten.join(' | ').slice(0, 300));
  console.log('\nUITLEG OP DE PAGINA:\n' + (await ev("[...document.querySelectorAll('#uitleg li')].map((li) => '- ' + li.textContent).join('\\n')")));

  const hoogte = Math.min(5600, await ev('document.documentElement.scrollHeight'));
  const foto = await stuur('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1280, height: hoogte, scale: 1 } });
  if (foto.data) { fs.writeFileSync(UIT, Buffer.from(foto.data, 'base64')); console.log('schermafbeelding: ' + UIT); }
  ws.close();
} catch (e) {
  fouten++;
  console.log('FOUT ' + e.message);
} finally {
  chrome.kill();
}
console.log(fouten ? '\n' + fouten + ' FOUT(EN)' : '\nALLES OK');
process.exitCode = fouten ? 1 : 0;
