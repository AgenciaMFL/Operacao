import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DB_PATH || path.resolve('data/analytics.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS sites (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    domain      TEXT,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    user_id     TEXT,
    user_agent  TEXT,
    device      TEXT,
    started_at  INTEGER NOT NULL,
    last_seen   INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_site ON sessions(site_id, started_at DESC);

  CREATE TABLE IF NOT EXISTS pageviews (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    site_id     TEXT NOT NULL,
    url         TEXT NOT NULL,
    path        TEXT NOT NULL,
    viewport_w  INTEGER,
    viewport_h  INTEGER,
    doc_h       INTEGER,
    max_scroll  REAL DEFAULT 0,
    started_at  INTEGER NOT NULL,
    last_seen   INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_pageviews_site_path ON pageviews(site_id, path);
  CREATE INDEX IF NOT EXISTS idx_pageviews_session ON pageviews(session_id);

  -- Eventos rrweb (gravação da sessão) em lotes JSON
  CREATE TABLE IF NOT EXISTS event_chunks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    pageview_id  TEXT NOT NULL,
    first_ts     INTEGER NOT NULL,
    has_full     INTEGER NOT NULL DEFAULT 0,
    data         TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chunks_session ON event_chunks(session_id, first_ts);
  CREATE INDEX IF NOT EXISTS idx_chunks_pageview ON event_chunks(pageview_id, first_ts);

  CREATE TABLE IF NOT EXISTS clicks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id      TEXT NOT NULL,
    session_id   TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    pageview_id  TEXT NOT NULL,
    path         TEXT NOT NULL,
    x            INTEGER NOT NULL,
    y            INTEGER NOT NULL,
    doc_w        INTEGER NOT NULL,
    selector     TEXT,
    rage         INTEGER NOT NULL DEFAULT 0,
    ts           INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_clicks_site_path ON clicks(site_id, path);

  CREATE TABLE IF NOT EXISTS custom_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id     TEXT NOT NULL,
    session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    ts          INTEGER NOT NULL
  );
`);

// Executa uma função dentro de uma transação
export function tx(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
