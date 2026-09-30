import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, tx } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';

const app = express();
app.disable('x-powered-by');

// ---------------------------------------------------------------------------
// Script de rastreamento: rrweb + nosso código, empacotados num único arquivo
// ---------------------------------------------------------------------------
let trackerCache = null;
function buildTracker() {
  const rrwebSrc = fs
    .readFileSync(path.join(ROOT, 'node_modules/rrweb/dist/rrweb.umd.min.cjs'), 'utf8')
    .replace(/\/\/# sourceMappingURL=.*$/m, '');
  const trackerSrc = fs.readFileSync(path.join(ROOT, 'tracker/tracker.js'), 'utf8');
  // O rrweb fica isolado dentro de uma função para não poluir o site do cliente
  return `(function(){
var rrweb = (function(){ var exports = {}; var module = { exports: exports };
${rrwebSrc}
; return module.exports; })();
${trackerSrc}
})();`;
}

app.get('/tracker.js', (req, res) => {
  if (!trackerCache || process.env.NODE_ENV !== 'production') trackerCache = buildTracker();
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300');
  res.set('Access-Control-Allow-Origin', '*');
  res.send(trackerCache);
});

// ---------------------------------------------------------------------------
// Coleta: recebe os lotes enviados pelo tracker (de qualquer domínio)
// ---------------------------------------------------------------------------
app.options('/api/collect', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.sendStatus(204);
});

// text/plain evita preflight de CORS e funciona com navigator.sendBeacon
app.post('/api/collect', express.text({ type: '*/*', limit: '10mb' }), (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  let p;
  try {
    p = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (!p || typeof p.site !== 'string' || typeof p.session !== 'string' || typeof p.pageview !== 'string') {
    return res.status(400).json({ error: 'payload incompleto' });
  }
  const site = db.prepare('SELECT id FROM sites WHERE id = ?').get(p.site);
  if (!site) return res.status(404).json({ error: 'site não encontrado' });

  try {
    ingest(p);
  } catch (err) {
    console.error('erro ao gravar lote', err);
    return res.status(500).json({ error: 'falha ao gravar' });
  }
  res.sendStatus(204);
});

const upsertSession = db.prepare(`
  INSERT INTO sessions (id, site_id, user_id, user_agent, device, started_at, last_seen)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    last_seen = MAX(last_seen, excluded.last_seen),
    user_id = COALESCE(excluded.user_id, sessions.user_id)
`);
const upsertPageview = db.prepare(`
  INSERT INTO pageviews (id, session_id, site_id, url, path, viewport_w, viewport_h, doc_h, max_scroll, started_at, last_seen)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    last_seen  = MAX(last_seen, excluded.last_seen),
    doc_h      = MAX(COALESCE(doc_h, 0), COALESCE(excluded.doc_h, 0)),
    max_scroll = MAX(max_scroll, excluded.max_scroll),
    viewport_w = excluded.viewport_w,
    viewport_h = excluded.viewport_h
`);
const insertChunk = db.prepare(`
  INSERT INTO event_chunks (session_id, pageview_id, first_ts, has_full, data) VALUES (?, ?, ?, ?, ?)
`);
const insertClick = db.prepare(`
  INSERT INTO clicks (site_id, session_id, pageview_id, path, x, y, doc_w, selector, rage, ts)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertCustom = db.prepare(`
  INSERT INTO custom_events (site_id, session_id, name, ts) VALUES (?, ?, ?, ?)
`);

function int(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : 0;
}

function detectDevice(ua = '', vw = 0) {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua) || (vw && vw < 768)) return 'mobile';
  return 'desktop';
}

function pathOf(url) {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return '/';
  }
}

function ingest(p) {
  const now = Date.now();
  const events = Array.isArray(p.events) ? p.events : [];
  const clicks = Array.isArray(p.clicks) ? p.clicks : [];
  const custom = Array.isArray(p.custom) ? p.custom : [];
  const url = String(p.url || '').slice(0, 2000);
  const pagePath = pathOf(url);
  const ua = String(p.ua || '').slice(0, 500);
  const firstTs = events.length ? int(events[0].timestamp) : now;
  const lastTs = events.length ? int(events[events.length - 1].timestamp) : now;

  tx(() => {
    upsertSession.run(
      p.session, p.site, p.userId ? String(p.userId).slice(0, 200) : null,
      ua, detectDevice(ua, int(p.vw)), firstTs, lastTs
    );
    upsertPageview.run(
      p.pageview, p.session, p.site, url, pagePath,
      int(p.vw), int(p.vh), int(p.dh), Math.min(100, Math.max(0, Number(p.scroll) || 0)),
      firstTs, lastTs
    );
    if (events.length) {
      const hasFull = events.some((e) => e && e.type === 2) ? 1 : 0;
      insertChunk.run(p.session, p.pageview, firstTs, hasFull, JSON.stringify(events));
    }
    for (const c of clicks.slice(0, 500)) {
      insertClick.run(
        p.site, p.session, p.pageview, pagePath,
        int(c.x), int(c.y), Math.max(1, int(c.w)),
        c.sel ? String(c.sel).slice(0, 300) : null, c.rage ? 1 : 0, int(c.ts) || now
      );
    }
    for (const e of custom.slice(0, 100)) {
      if (e && e.name) insertCustom.run(p.site, p.session, String(e.name).slice(0, 100), int(e.ts) || now);
    }
  });
}

// ---------------------------------------------------------------------------
// Proteção opcional do painel com senha (Basic Auth)
// ---------------------------------------------------------------------------
function auth(req, res, next) {
  if (!DASHBOARD_PASSWORD) return next();
  const header = req.headers.authorization || '';
  const [, encoded] = header.split(' ');
  const decoded = encoded ? Buffer.from(encoded, 'base64').toString() : '';
  const password = decoded.slice(decoded.indexOf(':') + 1);
  const a = Buffer.from(password);
  const b = Buffer.from(DASHBOARD_PASSWORD);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Painel"');
  res.status(401).send('Autenticação necessária');
}

// Página de demonstração (pública, já com o tracker instalado)
app.use('/demo', express.static(path.join(ROOT, 'public/demo')));

// ---------------------------------------------------------------------------
// API do painel
// ---------------------------------------------------------------------------
const api = express.Router();
api.use(auth);
api.use(express.json());

api.get('/sites', (req, res) => {
  res.json(db.prepare('SELECT * FROM sites ORDER BY created_at DESC').all());
});

api.post('/sites', (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'nome obrigatório' });
  const id = crypto.randomBytes(6).toString('hex');
  db.prepare('INSERT INTO sites (id, name, domain, created_at) VALUES (?, ?, ?, ?)')
    .run(id, name, String(req.body?.domain || '').trim() || null, Date.now());
  res.status(201).json(db.prepare('SELECT * FROM sites WHERE id = ?').get(id));
});

api.delete('/sites/:id', (req, res) => {
  tx(() => {
    db.prepare('DELETE FROM clicks WHERE site_id = ?').run(req.params.id);
    db.prepare('DELETE FROM custom_events WHERE site_id = ?').run(req.params.id);
    db.prepare('DELETE FROM pageviews WHERE site_id = ?').run(req.params.id);
    db.prepare('DELETE FROM sites WHERE id = ?').run(req.params.id);
  });
  res.sendStatus(204);
});

function since(req) {
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
  return Date.now() - days * 86400000;
}

api.get('/sites/:id/stats', (req, res) => {
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  if (!site) return res.status(404).json({ error: 'site não encontrado' });
  const from = since(req);
  const totals = db.prepare(`
    SELECT COUNT(*) AS sessions,
           COALESCE(AVG(last_seen - started_at), 0) AS avg_duration,
           COUNT(DISTINCT COALESCE(user_id, id)) AS users
    FROM sessions WHERE site_id = ? AND started_at >= ?
  `).get(site.id, from);
  const pv = db.prepare(`
    SELECT COUNT(*) AS pageviews, COALESCE(AVG(max_scroll), 0) AS avg_scroll
    FROM pageviews WHERE site_id = ? AND started_at >= ?
  `).get(site.id, from);
  const rage = db.prepare(`
    SELECT COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS clicks
    FROM clicks WHERE site_id = ? AND rage = 1 AND ts >= ?
  `).get(site.id, from);
  const devices = db.prepare(`
    SELECT device, COUNT(*) AS total FROM sessions
    WHERE site_id = ? AND started_at >= ? GROUP BY device ORDER BY total DESC
  `).all(site.id, from);
  const pages = db.prepare(`
    SELECT p.path, COUNT(*) AS views, AVG(p.max_scroll) AS avg_scroll,
           (SELECT COUNT(*) FROM clicks c WHERE c.site_id = p.site_id AND c.path = p.path AND c.ts >= ?) AS clicks,
           (SELECT COUNT(*) FROM clicks c WHERE c.site_id = p.site_id AND c.path = p.path AND c.rage = 1 AND c.ts >= ?) AS rage_clicks
    FROM pageviews p WHERE p.site_id = ? AND p.started_at >= ?
    GROUP BY p.path ORDER BY views DESC LIMIT 20
  `).all(from, from, site.id, from);
  const events = db.prepare(`
    SELECT name, COUNT(*) AS total FROM custom_events
    WHERE site_id = ? AND ts >= ? GROUP BY name ORDER BY total DESC LIMIT 20
  `).all(site.id, from);

  res.json({
    site,
    sessions: totals.sessions,
    users: totals.users,
    avgDuration: Math.round(totals.avg_duration),
    pageviews: pv.pageviews,
    avgScroll: Math.round(pv.avg_scroll),
    rageSessions: rage.sessions,
    rageClicks: rage.clicks,
    devices,
    pages,
    events,
  });
});

api.get('/sites/:id/sessions', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 50);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const rows = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM pageviews p WHERE p.session_id = s.id) AS pageviews,
      (SELECT path FROM pageviews p WHERE p.session_id = s.id ORDER BY started_at LIMIT 1) AS entry_path,
      (SELECT COUNT(*) FROM clicks c WHERE c.session_id = s.id) AS clicks,
      (SELECT COUNT(*) FROM clicks c WHERE c.session_id = s.id AND c.rage = 1) AS rage_clicks,
      (SELECT MAX(max_scroll) FROM pageviews p WHERE p.session_id = s.id) AS max_scroll
    FROM sessions s WHERE s.site_id = ? AND s.started_at >= ?
    ORDER BY s.started_at DESC LIMIT ? OFFSET ?
  `).all(req.params.id, since(req), limit, offset);
  res.json(rows);
});

api.get('/sessions/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'sessão não encontrada' });
  const pageviews = db.prepare('SELECT * FROM pageviews WHERE session_id = ? ORDER BY started_at').all(session.id);
  const chunks = db.prepare('SELECT data FROM event_chunks WHERE session_id = ? ORDER BY first_ts, id').all(session.id);
  const events = chunks.flatMap((c) => JSON.parse(c.data)).sort((a, b) => a.timestamp - b.timestamp);
  res.json({ session, pageviews, events });
});

api.get('/sites/:id/heatmap', (req, res) => {
  const pagePath = String(req.query.path || '/');
  const device = req.query.device === 'mobile' ? 'mobile' : 'desktop';
  // desktop = viewport >= 768px, mobile = viewport < 768px
  const cond = device === 'mobile' ? 'p.viewport_w < 768' : 'p.viewport_w >= 768';

  const clicks = db.prepare(`
    SELECT c.x, c.y, c.doc_w, c.rage, c.selector FROM clicks c
    JOIN pageviews p ON p.id = c.pageview_id
    WHERE c.site_id = ? AND c.path = ? AND c.ts >= ? AND ${cond}
  `).all(req.params.id, pagePath, since(req));

  const pvStats = db.prepare(`
    SELECT COUNT(*) AS views, MAX(p.doc_h) AS doc_h FROM pageviews p
    WHERE p.site_id = ? AND p.path = ? AND p.started_at >= ? AND ${cond}
  `).get(req.params.id, pagePath, since(req));

  // Distribuição de scroll: % de visitas que chegaram a cada profundidade
  const scrolls = db.prepare(`
    SELECT p.max_scroll FROM pageviews p
    WHERE p.site_id = ? AND p.path = ? AND p.started_at >= ? AND ${cond}
  `).all(req.params.id, pagePath, since(req)).map((r) => r.max_scroll);
  const scrollReach = [];
  for (let depth = 0; depth <= 100; depth += 10) {
    const reached = scrolls.filter((s) => s >= depth).length;
    scrollReach.push({ depth, pct: scrolls.length ? Math.round((reached / scrolls.length) * 100) : 0 });
  }

  // "Foto" da página: o primeiro snapshot completo da visita mais recente
  const chunk = db.prepare(`
    SELECT ec.data FROM event_chunks ec JOIN pageviews p ON p.id = ec.pageview_id
    WHERE p.site_id = ? AND p.path = ? AND ec.has_full = 1 AND ${cond}
    ORDER BY ec.first_ts DESC LIMIT 1
  `).get(req.params.id, pagePath);
  let snapshot = [];
  if (chunk) {
    const events = JSON.parse(chunk.data);
    const fullIdx = events.findIndex((e) => e.type === 2);
    const meta = events.slice(0, fullIdx).reverse().find((e) => e.type === 4);
    snapshot = [meta, events[fullIdx]].filter(Boolean);
  }

  res.json({
    path: pagePath,
    device,
    views: pvStats.views,
    docHeight: pvStats.doc_h || 0,
    clicks,
    scrollReach,
    snapshot,
  });
});

app.use('/api', api);

// ---------------------------------------------------------------------------
// Painel (arquivos estáticos) e bibliotecas do player
// ---------------------------------------------------------------------------
app.use('/vendor/rrweb', auth, express.static(path.join(ROOT, 'node_modules/rrweb/dist')));
app.use('/vendor/rrweb-player', auth, express.static(path.join(ROOT, 'node_modules/rrweb-player/dist')));
app.use('/', auth, express.static(path.join(ROOT, 'public/dashboard')));

// Garante que exista um site de demonstração
if (!db.prepare("SELECT 1 FROM sites WHERE id = 'demo'").get()) {
  db.prepare("INSERT INTO sites (id, name, domain, created_at) VALUES ('demo', 'Site de demonstração', 'localhost', ?)")
    .run(Date.now());
}

app.listen(PORT, () => {
  console.log(`Painel:         http://localhost:${PORT}`);
  console.log(`Página de demo: http://localhost:${PORT}/demo/`);
  if (!DASHBOARD_PASSWORD) console.log('Aviso: defina DASHBOARD_PASSWORD para proteger o painel.');
});
