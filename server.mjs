/* Richtprijs-AI, lokale server. Start: node server.mjs --open
   Doet twee dingen die een pagina zelf niet kan:
   1. /api/adres  meet een gebouw op uit de kaartdata van Vlaanderen (geo.mjs);
   2. /api/ai     stelt een vraag aan Claude via de Claude Code-installatie op deze pc
                  (het account waarmee `claude` is aangemeld) en stuurt het antwoord door terwijl het geschreven wordt.
   Luistert alleen op 127.0.0.1. */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, readdir, mkdir, unlink } from 'node:fs/promises';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { meetAdres } from './geo.mjs';

const MAP = path.dirname(fileURLToPath(import.meta.url));
const MODEL = process.env.RICHTPRIJS_MODEL || 'fable';
/* Denkdiepte van Claude (low, medium, high). Gemeten op 6 okt 2026 met de voorbeeldklus: low geeft de eerste regel
   na 16 s, de standaard na 47 s, met dezelfde posten en hoeveelheden. */
const EFFORT = process.env.RICHTPRIJS_EFFORT || 'low';
const eigenClaude = path.join(os.homedir(), '.local', 'bin', 'claude.exe');
const CLAUDE = process.env.CLAUDE_EXE || (fs.existsSync(eigenClaude) ? eigenClaude : 'claude');
/* Lege werkmap + alleen projectinstellingen: de vraag gaat naar Claude zonder werkregels, hooks of geheugen van deze pc. */
const LEEG = fs.mkdtempSync(path.join(os.tmpdir(), 'richtprijs-'));
const SYSTEEM = 'Je bent een rekenhulp voor Vlaamse aannemers. Je volgt het gevraagde antwoordformaat exact en schrijft niets buiten dat formaat.';
const START = Date.now();
let poort = Number(process.env.PORT) || 4791;
let lopend = 0;

function vraagClaude(prompt, opDelta) {
  let kind;
  const klaar = new Promise((resolve, reject) => {
    kind = spawn(CLAUDE, ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--model', MODEL,
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
        reject(new Error((eind && typeof eind.result === 'string' && eind.result) || fout.trim().split('\n').pop() || 'Claude stopte met code ' + code));
      }
    });
    kind.stdin.on('error', () => {});
    kind.stdin.end(prompt, 'utf8');
  });
  return { klaar, stop: () => { try { kind.kill(); } catch (e) { /* al gestopt */ } } };
}

const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(o)); };
/* Alleen de eigen pagina: een eigen kop dwingt bij andere sites een voorafvraag af die hier nooit wordt toegestaan. */
function eigen(req) {
  const hosts = ['localhost:' + poort, '127.0.0.1:' + poort];
  const o = req.headers.origin;
  return req.headers['x-richtprijs'] === '1' && hosts.includes(req.headers.host) && (!o || hosts.some((h) => o === 'http://' + h));
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
    if (url.pathname === '/api/ping') return json(res, 200, { app: 'richtprijs-ai', model: MODEL, sinds: START });
    if (!url.pathname.startsWith('/api/')) return json(res, 404, { fout: 'Niet gevonden.' });
    if (!eigen(req)) return json(res, 403, { fout: 'Alleen de eigen pagina mag deze dienst gebruiken.' });

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
        try { const o = JSON.parse(await readFile(path.join(BEREKENINGEN, naam), 'utf8')); lijst.push({ id: naam.slice(0, -5), titel: o.titel || '', adres: o.adres || '', datum: o.datum || '', prijs: o.prijs || 0, vak: o.vak || '' }); } catch (e) { /* kapot bestand slaan we over */ }
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
      res.writeHead(200, { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' });
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

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && poort < 4811) { poort++; server.listen(poort, '127.0.0.1'); }
  else { console.error('Server start niet: ' + e.message); process.exitCode = 1; }
});
server.on('listening', () => {
  const adres = 'http://localhost:' + poort;
  console.log('RICHTPRIJS-AI draait op ' + adres + '  (model: ' + MODEL + ', Claude: ' + CLAUDE + ')');
  if (process.argv.includes('--open')) spawn('cmd', ['/c', 'start', '', adres], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
});
server.listen(poort, '127.0.0.1');
