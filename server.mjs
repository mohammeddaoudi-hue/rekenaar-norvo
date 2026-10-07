/* Rekenaar Norvo, lokale server. Start: node server.mjs --open
   Doet twee dingen die een pagina zelf niet kan:
   1. /api/adres  meet een gebouw op uit de kaartdata van Vlaanderen (geo.mjs);
   2. /api/ai     stelt een vraag aan Claude via de Claude Code-installatie op deze pc
                  (het account waarmee `claude` is aangemeld) en stuurt het antwoord door terwijl het geschreven wordt.
   Luistert alleen op 127.0.0.1. Een tunnel (cloudflared) maakt de server bereikbaar voor de demo-link op GitHub Pages,
   alleen met de sleutel uit koppeling.json: zo rekent de demo-link op elk toestel van de eigenaar met zijn Claude-account,
   zolang deze pc aanstaat. Anderen hebben de sleutel niet en zien het voorbeeld. */
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, writeFile, readdir, mkdir, unlink } from 'node:fs/promises';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { meetAdres } from './geo.mjs';

const MAP = path.dirname(fileURLToPath(import.meta.url));
/* De demo-link (GitHub Pages) en de sleutel waarmee een toestel van de eigenaar via de tunnel rekent. koppeling.json staat
   buiten git; de sleutel blijft dezelfde bij elke start, het tunneladres verandert bij elke start van de tunnel. */
const DEMO = 'https://mohammeddaoudi-hue.github.io';
const DEMO_LINK = DEMO + '/rekenaar-norvo/';
const KOPPELING = path.join(MAP, 'koppeling.json');
let SLEUTEL = '';
try { SLEUTEL = String(JSON.parse(fs.readFileSync(KOPPELING, 'utf8')).sleutel || ''); } catch (e) { /* nog geen koppeling */ }
if (!/^[a-f0-9]{32}$/.test(SLEUTEL)) { SLEUTEL = crypto.randomBytes(16).toString('hex'); fs.writeFileSync(KOPPELING, JSON.stringify({ sleutel: SLEUTEL }, null, 1), 'utf8'); }
const CLOUDFLARED = process.env.CLOUDFLARED || [path.join(os.homedir(), 'tools', 'cloudflared', 'cloudflared.exe')].find((p) => fs.existsSync(p)) || '';
let tunnel = { url: '', sinds: 0 };
const koppelLink = () => (tunnel.url ? DEMO_LINK + '#koppel=' + SLEUTEL + '@' + new URL(tunnel.url).host : '');
const MODEL = process.env.RICHTPRIJS_MODEL || 'fable';
/* Terugval: staat het eerste model op zijn gebruikslimiet (7 okt 2026: "You've reached your Fable limit", api_error_status 429)
   of is het niet beschikbaar, dan rekent de app verder met dit model. Na zo een fout probeert de server het eerste model
   pas na 30 minuten opnieuw, zodat niet elke vraag eerst een mislukte poging doet. */
const TERUGVAL = process.env.RICHTPRIJS_TERUGVAL || 'opus';
const TERUGVAL_MINUTEN = 30;
let eersteModelUitTot = 0;
/* Denkdiepte van Claude (low, medium, high). Gemeten op 6 okt 2026 met de voorbeeldklus: low geeft de eerste regel
   na 16 s, de standaard na 47 s, met dezelfde posten en hoeveelheden. */
const EFFORT = process.env.RICHTPRIJS_EFFORT || 'low';
const eigenClaude = path.join(os.homedir(), '.local', 'bin', 'claude.exe');
const CLAUDE = process.env.CLAUDE_EXE || (fs.existsSync(eigenClaude) ? eigenClaude : 'claude');
/* Lege werkmap + alleen projectinstellingen: de vraag gaat naar Claude zonder werkregels, hooks of geheugen van deze pc. */
const LEEG = fs.mkdtempSync(path.join(os.tmpdir(), 'richtprijs-'));
const SYSTEEM = 'Je bent een rekenhulp voor Vlaamse aannemers. Je volgt het gevraagde antwoordformaat exact en schrijft niets buiten dat formaat.';
const START = Date.now();
const FOTOS = new Map();
let poort = Number(process.env.PORT) || 4791;
let lopend = 0;

/* Eén vraag aan één model. Een fout draagt mee hoeveel tekst er al doorgestuurd was en of het een limiet- of modelfout is. */
function vraagModel(model, prompt, opDelta) {
  let kind;
  const klaar = new Promise((resolve, reject) => {
    kind = spawn(CLAUDE, ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--model', model,
      '--tools', '', '--setting-sources', 'project', '--strict-mcp-config', '--no-session-persistence', '--disable-slash-commands',
      '--system-prompt', SYSTEEM].concat(EFFORT ? ['--effort', EFFORT] : []), { cwd: LEEG, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let rest = '', fout = '', gestuurd = 0, eind = null;
    const regel = (r) => {
      let o;
      try { o = JSON.parse(r); } catch (e) { return; }
      if (o.type === 'stream_event' && o.event && o.event.type === 'content_block_delta' && o.event.delta && o.event.delta.type === 'text_delta') {
        gestuurd += o.event.delta.text.length;
        opDelta(o.event.delta.text);
      } else if (o.type === 'result') {
        eind = o;
      }
    };
    kind.stdout.setEncoding('utf8');
    kind.stdout.on('data', (d) => { rest += d; let i; while ((i = rest.indexOf('\n')) >= 0) { regel(rest.slice(0, i)); rest = rest.slice(i + 1); } });
    kind.stderr.setEncoding('utf8');
    kind.stderr.on('data', (d) => { fout += d; });
    kind.on('error', (e) => reject(new Error('Claude start niet: ' + e.message)));
    kind.on('close', (code) => {
      if (rest.trim()) regel(rest);
      if (eind && !eind.is_error) {
        if (!gestuurd && typeof eind.result === 'string') opDelta(eind.result);
        resolve();
      } else {
        const tekst = (eind && typeof eind.result === 'string' && eind.result) || fout.trim().split('\n').pop() || 'Claude stopte met code ' + code;
        const limiet = (eind && (eind.api_error_status === 429 || eind.api_error_status === 529)) || /limit|usage credits|overloaded|not available|does not exist|invalid model/i.test(tekst);
        reject(Object.assign(new Error(tekst), { gestuurd, limiet }));
      }
    });
    kind.stdin.on('error', () => {});
    kind.stdin.end(prompt, 'utf8');
  });
  return { klaar, stop: () => { try { kind.kill(); } catch (e) { /* al gestopt */ } } };
}

/* De vraag van de app: eerst het gekozen model, bij een limiet- of modelfout zonder doorgestuurde tekst het terugvalmodel. */
function vraagClaude(prompt, opDelta) {
  let huidig = null;
  let gestopt = false;
  const klaar = (async () => {
    const eerst = Date.now() < eersteModelUitTot ? TERUGVAL : MODEL;
    huidig = vraagModel(eerst, prompt, opDelta);
    try {
      await huidig.klaar;
      return eerst;
    } catch (e) {
      if (gestopt || eerst === TERUGVAL || !TERUGVAL || e.gestuurd > 0 || !e.limiet) throw e;
      eersteModelUitTot = Date.now() + TERUGVAL_MINUTEN * 60000;
      console.log('Model ' + eerst + ' niet beschikbaar (' + String(e.message).slice(0, 80) + '); verder met ' + TERUGVAL + ' voor ' + TERUGVAL_MINUTEN + ' minuten.');
      huidig = vraagModel(TERUGVAL, prompt, opDelta);
      await huidig.klaar;
      return TERUGVAL;
    }
  })();
  return { klaar, stop: () => { gestopt = true; if (huidig) huidig.stop(); } };
}
const actiefModel = () => (Date.now() < eersteModelUitTot ? TERUGVAL : MODEL);

const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(o)); };
/* Lokaal = de pagina op deze pc (localhost). Op afstand = via de tunnel (een andere host): alleen /api, alleen met de sleutel. */
const lokaal = (req) => ['localhost:' + poort, '127.0.0.1:' + poort].includes(req.headers.host);
function sleutelOk(s) {
  const a = Buffer.from(String(s || '')), b = Buffer.from(SLEUTEL);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
/* Alleen de eigen pagina: een eigen kop dwingt bij andere sites een voorafvraag af die hier nooit wordt toegestaan.
   Via de tunnel: de demo-link op GitHub Pages met de sleutel van de eigenaar. */
function eigen(req) {
  const hosts = ['localhost:' + poort, '127.0.0.1:' + poort];
  const o = req.headers.origin;
  if (req.headers['x-richtprijs'] !== '1') return false;
  if (lokaal(req)) return !o || hosts.some((h) => o === 'http://' + h);
  return sleutelOk(req.headers['x-sleutel']) && (!o || o === DEMO);
}
function lichaam(req, max) {
  return new Promise((resolve, reject) => {
    let t = '';
    req.setEncoding('utf8');
    req.on('data', (d) => { t += d; if (t.length > max) { reject(new Error('Te lang.')); req.destroy(); } });
    req.on('end', () => resolve(t));
    req.on('error', reject);
  });
}

/* Bestanden van de app zelf: alleen deze soorten, alleen binnen de map. */
const SOORTEN = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const INSTELLINGEN = path.join(MAP, 'instellingen.json');
const BEREKENINGEN = path.join(MAP, 'berekeningen');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    /* Via de tunnel (of elke andere host): alleen /api, CORS voor de demo-link, de voorafvraag zonder sleutel, daarna de sleutel.
       Een <img> van de luchtfoto stuurt geen eigen kop: die draagt de sleutel in ?k=. */
    if (!lokaal(req)) {
      if (!url.pathname.startsWith('/api/')) return json(res, 404, { fout: 'Niet gevonden.' });
      if (req.headers.origin === DEMO) { res.setHeader('access-control-allow-origin', DEMO); res.setHeader('vary', 'Origin'); }
      if (req.method === 'OPTIONS') {
        if (req.headers.origin !== DEMO) return json(res, 403, { fout: 'Alleen de demo-link.' });
        res.writeHead(204, { 'access-control-allow-methods': 'GET, POST, PUT, DELETE', 'access-control-allow-headers': 'content-type, x-richtprijs, x-sleutel', 'access-control-max-age': '600' });
        return res.end();
      }
      if (!sleutelOk(req.headers['x-sleutel'] || (url.pathname === '/api/luchtfoto' ? url.searchParams.get('k') : ''))) return json(res, 401, { fout: 'Sleutel ontbreekt of klopt niet.' });
    }
    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
      const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
      const bestand = path.resolve(MAP, rel);
      const ext = path.extname(bestand).toLowerCase();
      if (!bestand.startsWith(MAP + path.sep) || !SOORTEN[ext] || rel.includes('..') || /^(server\.mjs|geo\.mjs|test-.*|instellingen\.json)$/.test(rel) || rel.startsWith('berekeningen')) return json(res, 404, { fout: 'Niet gevonden.' });
      try {
        const inhoud = await readFile(bestand);
        res.writeHead(200, { 'content-type': SOORTEN[ext], 'cache-control': 'no-store' });
        return res.end(inhoud);
      } catch (e) { return json(res, 404, { fout: 'Niet gevonden.' }); }
    }
    if (url.pathname === '/api/ping') return json(res, 200, { app: 'richtprijs-ai', model: actiefModel(), eersteModel: MODEL, terugval: TERUGVAL, sinds: START });
    if (!url.pathname.startsWith('/api/')) return json(res, 404, { fout: 'Niet gevonden.' });
    /* Luchtfoto van Vlaanderen (open data, WMS OMWRGBMRVL) voor het meetbeeld: een <img> stuurt geen eigen kop mee, dus hier
       geen eigen-kopcontrole; een andere host dan deze pc is hierboven al op de sleutel gecontroleerd.
       Alleen een vierkant van 20 tot 400 m binnen Vlaanderen; de laatste 60 beelden in het geheugen. */
    if (req.method === 'GET' && url.pathname === '/api/luchtfoto') {
      const b =String(url.searchParams.get('bbox') || '').split(',').map(Number);
      const px = Math.min(1024, Math.max(128, Math.round(Number(url.searchParams.get('px')) || 640)));
      const zijde = b.length === 4 ? b[2] - b[0] : 0;
      if (b.length !== 4 || !b.every(Number.isFinite) || zijde < 20 || zijde > 400 || Math.abs((b[3] - b[1]) - zijde) > 0.5 || b[0] < 20000 || b[2] > 260000 || b[1] < 150000 || b[3] > 250000) return json(res, 400, { fout: 'Geen geldig kaartvierkant.' });
      const sleutel = b.map((n) => n.toFixed(1)).join(',') + '|' + px;
      let beeld = FOTOS.get(sleutel);
      if (!beeld) {
        try {
          const r = await fetch('https://geo.api.vlaanderen.be/OMWRGBMRVL/wms?service=WMS&version=1.3.0&request=GetMap&layers=Ortho&styles=&crs=EPSG:31370&format=image/png&width=' + px + '&height=' + px + '&bbox=' + b.join(','), { signal: AbortSignal.timeout(25000) });
          if (!r.ok || !String(r.headers.get('content-type')).startsWith('image/')) return json(res, 502, { fout: 'De luchtfotodienst van Vlaanderen antwoordt niet.' });
          beeld = Buffer.from(await r.arrayBuffer());
          FOTOS.set(sleutel, beeld);
          if (FOTOS.size > 60) FOTOS.delete(FOTOS.keys().next().value);
        } catch (e) { return json(res, 502, { fout: 'De luchtfotodienst van Vlaanderen antwoordt niet.' }); }
      }
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'private, max-age=86400' });
      return res.end(beeld);
    }
    if (!eigen(req)) return json(res, 403, { fout: 'Alleen de eigen pagina mag deze dienst gebruiken.' });

    /* De link met sleutel voor de andere toestellen van de eigenaar: alleen op deze pc te lezen (Instellingen). */
    if (url.pathname === '/api/koppeling' && req.method === 'GET') {
      if (!lokaal(req)) return json(res, 403, { fout: 'Alleen op deze pc.' });
      return json(res, 200, { link: koppelLink(), tunnel: tunnel.url, sinds: tunnel.sinds, cloudflared: !!CLOUDFLARED });
    }

    /* Instellingen van de aannemer (tarieven, standaarden, eigen cijfers in de datatabel): één JSON-bestand naast de app. */
    if (url.pathname === '/api/instellingen') {
      if (req.method === 'GET') {
        let inhoud = '{}';
        try { inhoud = await readFile(INSTELLINGEN, 'utf8'); } catch (e) { /* nog geen instellingen bewaard */ }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(inhoud);
      }
      if (req.method === 'POST' || req.method === 'PUT') {
        const tekst = await lichaam(req, 2000000);
        const o = JSON.parse(tekst);
        if (!o || typeof o !== 'object' || Array.isArray(o)) return json(res, 400, { fout: 'Instellingen moeten een object zijn.' });
        await writeFile(INSTELLINGEN, JSON.stringify(o, null, 1), 'utf8');
        return json(res, 200, { ok: true });
      }
    }
    /* Bewaarde berekeningen: één JSON per berekening in de map berekeningen/. */
    if (url.pathname === '/api/berekeningen' && req.method === 'GET') {
      await mkdir(BEREKENINGEN, { recursive: true });
      const lijst = [];
      for (const naam of (await readdir(BEREKENINGEN)).filter((n) => n.endsWith('.json')).sort().reverse().slice(0, 200)) {
        try {
          const o = JSON.parse(await readFile(path.join(BEREKENINGEN, naam), 'utf8'));
          const of = o.offerte && typeof o.offerte === 'object' ? o.offerte : null;
          lijst.push({ id: naam.slice(0, -5), titel: o.titel || '', adres: o.adres || '', datum: o.datum || '', prijs: o.prijs || 0, vak: o.vak || '', versie: o.versie || 1,
            offerte: of && (of.nummer || of.uitgegeven) ? { nummer: of.nummer || '', uitgegeven: !!of.uitgegeven, geldigTot: of.geldigTot || of.geldig_tot || '' } : null });
        } catch (e) { /* kapot bestand slaan we over */ }
      }
      return json(res, 200, lijst);
    }
    if (url.pathname === '/api/berekeningen' && req.method === 'POST') {
      const o = JSON.parse(await lichaam(req, 2000000));
      if (!o || typeof o !== 'object') return json(res, 400, { fout: 'Lege berekening.' });
      await mkdir(BEREKENINGEN, { recursive: true });
      const id = (typeof o.id === 'string' && /^[\w-]{1,60}$/.test(o.id)) ? o.id : new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '-' + Math.random().toString(36).slice(2, 6);
      o.id = id;
      await writeFile(path.join(BEREKENINGEN, id + '.json'), JSON.stringify(o, null, 1), 'utf8');
      return json(res, 200, { ok: true, id });
    }
    const een = url.pathname.match(/^\/api\/berekeningen\/([\w-]{1,60})$/);
    if (een && req.method === 'GET') {
      let inhoud;
      try { inhoud = await readFile(path.join(BEREKENINGEN, een[1] + '.json'), 'utf8'); } catch (e) { return json(res, 404, { fout: 'Berekening niet gevonden.' }); }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(inhoud);
    }
    if (een && req.method === 'DELETE') {
      try { await unlink(path.join(BEREKENINGEN, een[1] + '.json')); return json(res, 200, { ok: true }); }
      catch (e) { return json(res, 404, { fout: 'Berekening niet gevonden.' }); }
    }

    if (req.method === 'GET' && url.pathname === '/api/adres') {
      const q = (url.searchParams.get('q') || '').trim().slice(0, 200);
      if (q.length < 5) return json(res, 400, { fout: 'Geef straat, huisnummer en gemeente.' });
      try { return json(res, 200, await meetAdres(q)); }
      catch (e) { return json(res, e.code ? 404 : 502, { fout: e.code ? e.message : 'De kaartdienst van Vlaanderen antwoordt niet.' }); }
    }

    if (req.method === 'POST' && url.pathname === '/api/ai') {
      const { prompt } = JSON.parse(await lichaam(req, 200000));
      if (typeof prompt !== 'string' || prompt.length < 20) return json(res, 400, { fout: 'Lege vraag.' });
      if (lopend >= 3) return json(res, 429, { fout: 'Er lopen al 3 vragen. Wacht tot er één klaar is.' });
      lopend++;
      /* Regels JSON, één per stukje tekst. Het type event-stream laat de tunnel elk stukje meteen doorsturen in plaats van te bufferen. */
      res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store, no-transform', 'x-accel-buffering': 'no' });
      let af = false;
      const vraag = vraagClaude(prompt, (d) => { if (!af) res.write(JSON.stringify({ d }) + '\n'); });
      res.on('close', () => { if (!af) { af = true; vraag.stop(); } });
      try { await vraag.klaar; if (!af) res.write(JSON.stringify({ klaar: true }) + '\n'); }
      catch (e) { if (!af) res.write(JSON.stringify({ fout: String(e.message).slice(0, 300) }) + '\n'); }
      finally { lopend--; if (!af) { af = true; res.end(); } }
      return;
    }
    json(res, 404, { fout: 'Niet gevonden.' });
  } catch (e) {
    if (!res.headersSent) json(res, 500, { fout: 'Serverfout: ' + String(e.message).slice(0, 200) });
    else res.end();
  }
});

/* De tunnel: cloudflared geeft een https-adres op trycloudflare.com dat naar deze server wijst. Valt hij weg, dan start hij na 10 s
   opnieuw (met een nieuw adres, dus een nieuwe link). Het proces-id staat in koppeling.json, zodat een volgende start een
   achtergebleven tunnel van een vorige start opruimt (Windows stopt kindprocessen niet mee). */
let tunnelProces = null;
let stoppen = false;
function bewaarKoppeling(extra) {
  try { fs.writeFileSync(KOPPELING, JSON.stringify(Object.assign({ sleutel: SLEUTEL }, extra), null, 1), 'utf8'); } catch (e) { /* niet bewaard: de volgende start ruimt dan niets op */ }
}
function ruimOudeTunnelOp() {
  let pid = 0;
  try { pid = Number(JSON.parse(fs.readFileSync(KOPPELING, 'utf8')).tunnelPid) || 0; } catch (e) { return; }
  if (!pid) return;
  /* tasklist geeft de naam van het proces met dit id; zo stopt de server nooit een ander programma dat dit id kreeg. */
  try {
    const r = spawnSync('tasklist', ['/FI', 'PID eq ' + pid, '/FO', 'CSV', '/NH'], { encoding: 'utf8', windowsHide: true });
    if (/cloudflared\.exe/i.test(r.stdout || '')) process.kill(pid);
  } catch (e) { /* al gestopt */ }
}
function startTunnel() {
  if (!CLOUDFLARED || process.env.RICHTPRIJS_GEEN_TUNNEL || stoppen) return;
  const t = spawn(CLOUDFLARED, ['tunnel', '--no-autoupdate', '--url', 'http://127.0.0.1:' + poort], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  tunnelProces = t;
  bewaarKoppeling({ tunnelPid: t.pid });
  let gezien = false;
  const lees = (d) => {
    const m = String(d).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (m && !gezien) {
      gezien = true;
      tunnel = { url: m[0], sinds: Date.now() };
      console.log('\nDemo-link voor al je toestellen (rekent met jouw Claude-account zolang deze pc aanstaat; deel hem niet):\n  ' + koppelLink() + '\nDe link staat ook in de app: Instellingen, blok "Op je andere toestellen".\n');
    }
  };
  t.stdout.on('data', lees);
  t.stderr.on('data', lees);
  t.on('error', (e) => console.log('Tunnel start niet: ' + e.message));
  t.on('close', () => {
    tunnel = { url: '', sinds: 0 };
    tunnelProces = null;
    if (!stoppen) { console.log('Tunnel weggevallen; nieuwe tunnel over 10 s (nieuwe link).'); setTimeout(startTunnel, 10000); }
  });
}
function stop() {
  stoppen = true;
  if (tunnelProces) { try { tunnelProces.kill(); } catch (e) { /* al gestopt */ } }
  bewaarKoppeling({});
  process.exit(0);
}
for (const s of ['SIGINT', 'SIGHUP', 'SIGBREAK', 'SIGTERM']) process.on(s, stop);

server.on('error', async (e) => {
  if (e.code === 'EADDRINUSE' && poort < 4811) {
    /* Draait Rekenaar Norvo al op deze poort (start.cmd twee keer gestart), dan opent dit venster die en start het niets dubbel. */
    try {
      const r = await fetch('http://127.0.0.1:' + poort + '/api/ping', { signal: AbortSignal.timeout(2000) });
      const j = await r.json();
      if (j && j.app === 'richtprijs-ai') {
        const adres = 'http://localhost:' + poort;
        console.log('REKENAAR NORVO draait al op ' + adres + '. Dit venster mag dicht.');
        /* De link voor de andere toestellen van de draaiende server, zodat dit venster hem ook toont. */
        try {
          const k = await (await fetch('http://127.0.0.1:' + poort + '/api/koppeling', { headers: { 'x-richtprijs': '1' }, signal: AbortSignal.timeout(2000) })).json();
          if (k && k.link) console.log('\nDemo-link voor al je toestellen (rekent met jouw Claude-account zolang deze pc aanstaat; deel hem niet):\n  ' + k.link + '\n');
        } catch (x) { /* geen link: de tunnel start nog */ }
        if (process.argv.includes('--open')) spawn('cmd', ['/c', 'start', '', adres], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
        return;
      }
    } catch (x) { /* een ander programma op deze poort */ }
    poort++; server.listen(poort, '127.0.0.1');
  }
  else { console.error('Server start niet: ' + e.message); process.exitCode = 1; }
});
server.on('listening', () => {
  const adres = 'http://localhost:' + poort;
  console.log('REKENAAR NORVO draait op ' + adres + '  (model: ' + MODEL + ', terugval: ' + TERUGVAL + ', Claude: ' + CLAUDE + ')');
  if (process.argv.includes('--open')) spawn('cmd', ['/c', 'start', '', adres], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  ruimOudeTunnelOp();
  startTunnel();
});
server.listen(poort, '127.0.0.1');
