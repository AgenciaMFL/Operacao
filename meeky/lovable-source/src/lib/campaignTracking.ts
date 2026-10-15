import { supabase } from "@/integrations/supabase/client";
import { getConsent } from "@/lib/cookieConsent";


const SESSION_KEY = "meeky_session_id";
const ATTR_KEY = "meeky_attribution"; // localStorage, cross-session
const LEGACY_UTM_KEY = "meeky_utm_context"; // old sessionStorage key (migration)
const PAGE_VIEW_KEY = "meeky_pv_sent";
const QR_SCAN_KEY = "meeky_qr_sent";

const ATTR_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface UtmContext {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

interface AttributionTouch {
  utm: UtmContext;
  referrer: string | null;
  captured_at: number; // epoch ms
}

interface AttributionData {
  first: AttributionTouch;
  last: AttributionTouch;
  /** OpenAI Ads privacy-preserving click identifier (?oppref=), first-touch only. */
  oppref?: string | null;
  /** TikTok Ads click identifier (?ttclid=), first-touch only. */
  ttclid?: string | null;
}

/** Reads `?oppref=` from the current URL (OpenAI Ads click identifier). */
export function readOpprefFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = new URLSearchParams(window.location.search).get("oppref");
    return v ? v.slice(0, 200) : null;
  } catch {
    return null;
  }
}

/**
 * Reads `?ttclid=` from the current URL (TikTok Ads click identifier).
 * Gated by the advertising consent category — the same gate used to load the
 * TikTok Pixel. Without ads consent we never read or persist the click id.
 */
export function readTtclidFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  if (!getConsent()?.ads) return null;
  try {
    const v = new URLSearchParams(window.location.search).get("ttclid");
    return v ? v.slice(0, 300) : null;
  } catch {
    return null;
  }
}


/** Stored first-touch oppref (30-day TTL, never overwritten once set). */
export function getOppref(): string | null {
  return readAttribution()?.oppref ?? readOpprefFromUrl();
}

/** Stored first-touch ttclid (30-day TTL, never overwritten once set). */
export function getTtclid(): string | null {
  return readAttribution()?.ttclid ?? readTtclidFromUrl();
}


export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid: string | null = null;
  try { sid = sessionStorage.getItem(SESSION_KEY); } catch { /* ignore */ }
  if (!sid) {
    sid = (crypto?.randomUUID?.() ?? `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
    try { sessionStorage.setItem(SESSION_KEY, sid); } catch { /* ignore */ }
  }
  return sid;
}

export function readUtmFromUrl(): UtmContext {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const clean = (v: string | null) => (v ? v.slice(0, 100) : null);
  return {
    utm_source: clean(sp.get("utm_source")),
    utm_medium: clean(sp.get("utm_medium")),
    utm_campaign: clean(sp.get("utm_campaign")),
    utm_content: clean(sp.get("utm_content")),
    utm_term: clean(sp.get("utm_term")),
  };
}

function hasAnyUtm(u: UtmContext): boolean {
  return !!(u.utm_source || u.utm_medium || u.utm_campaign || u.utm_content || u.utm_term);
}

function readAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AttributionData;
    if (!parsed?.first?.captured_at) return null;
    // Expire the entire attribution if the first touch is older than TTL.
    if (Date.now() - parsed.first.captured_at > ATTR_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAttribution(data: AttributionData) {
  try { localStorage.setItem(ATTR_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

/**
 * Capture attribution on page load. Preserves the first touch (UTM + referrer)
 * for 30 days; also updates a separate "last touch" whenever a new UTM appears.
 * Safe to call on every route change.
 */
export function persistUtm(utm?: UtmContext) {
  if (typeof window === "undefined") return;
  const currentUtm = utm ?? readUtmFromUrl();
  const referrer = (typeof document !== "undefined" && document.referrer) ? document.referrer.slice(0, 500) : null;
  const now = Date.now();
  const existing = readAttribution();
  const urlOppref = readOpprefFromUrl();
  const urlTtclid = readTtclidFromUrl();

  if (!existing) {
    // First visit ever (or expired). Capture even without UTM so we keep referrer.
    const touch: AttributionTouch = { utm: currentUtm, referrer, captured_at: now };
    writeAttribution({ first: touch, last: touch, oppref: urlOppref, ttclid: urlTtclid });
    return;
  }

  let dirty = false;

  // First-touch oppref: only set if not already stored (never overwritten within TTL).
  if (urlOppref && !existing.oppref) {
    existing.oppref = urlOppref;
    dirty = true;
  }

  // First-touch ttclid (TikTok): same rule — never overwritten within the TTL.
  if (urlTtclid && !existing.ttclid) {
    existing.ttclid = urlTtclid;
    dirty = true;
  }


  // Preserve first touch. Only update "last" if a new UTM is present.
  if (hasAnyUtm(currentUtm)) {
    existing.last = { utm: currentUtm, referrer, captured_at: now };
    dirty = true;
  }

  if (dirty) writeAttribution(existing);
}

/** First-touch UTM merged with any UTM in the current URL as fallback. */
export function getStoredUtm(): UtmContext {
  if (typeof window === "undefined") return {};
  const attr = readAttribution();
  if (attr && hasAnyUtm(attr.first.utm)) return attr.first.utm;
  // Legacy sessionStorage fallback (older sessions before migration).
  try {
    const raw = sessionStorage.getItem(LEGACY_UTM_KEY);
    if (raw) return JSON.parse(raw) as UtmContext;
  } catch { /* ignore */ }
  return {};
}

export function getFirstTouch(): AttributionTouch | null {
  return readAttribution()?.first ?? null;
}

export function getLastTouch(): AttributionTouch | null {
  return readAttribution()?.last ?? null;
}

export function getLandingReferrer(): string | null {
  return readAttribution()?.first.referrer ?? null;
}

export async function trackPageView(page: string) {
  if (typeof window === "undefined") return;
  const key = `${PAGE_VIEW_KEY}_${page}`;
  try {
    if (sessionStorage.getItem(key)) return; // dedupe per session
    sessionStorage.setItem(key, "1");
  } catch { /* storage blocked — skip dedupe, still track */ }

  persistUtm();
  const utm = readUtmFromUrl();
  try {
    await supabase.from("page_views").insert({
      page,
      session_id: getSessionId(),
      referrer: document.referrer || null,
      ...utm,
    });
  } catch {
    /* silent */
  }
}

export async function trackEvent(
  event_name: string,
  page: string,
  metadata?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const utm = { ...getStoredUtm(), ...readUtmFromUrl() };
  try {
    await supabase.from("events").insert({
      event_name,
      page,
      session_id: getSessionId(),
      metadata: (metadata ?? null) as never,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
    } as never);
  } catch {
    /* silent */
  }
}

// ============ QR CODE MAP ============
export const QR_CODES = [
  { qr_id: "entrada", location: "Entrada principal", utm_medium: "flyer", utm_content: "entrada" },
  { qr_id: "palco", location: "Palco / Banner", utm_medium: "banner", utm_content: "palco" },
  { qr_id: "panfleto", location: "Panfleto A4", utm_medium: "flyer", utm_content: "panfleto" },
  { qr_id: "staff", location: "Staff / Abordagem", utm_medium: "staff", utm_content: "abordagem" },
] as const;

export async function trackQrScanFromUrl() {
  if (typeof window === "undefined") return;
  const utm = readUtmFromUrl();
  if (utm.utm_source !== "qrcode" || !utm.utm_content) return;

  const match = QR_CODES.find((q) => q.qr_id === utm.utm_content);
  if (!match) return;

  const key = `${QR_SCAN_KEY}_${match.qr_id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch { /* storage blocked — skip dedupe */ }

  try {
    await supabase.from("qr_scans").insert({
      qr_id: match.qr_id,
      location: match.location,
      session_id: getSessionId(),
    });
  } catch {
    /* silent */
  }
}
