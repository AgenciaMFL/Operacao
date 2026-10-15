// Cookie consent + Google Consent Mode v2 helpers.
// Default state (denied) is set inline in index.html before this module loads.

export type ConsentCategories = {
  analytics: boolean;
  ads: boolean;
};

export type ConsentRecord = ConsentCategories & {
  timestamp: number;
  version: number;
};

const STORAGE_KEY = "cookie_consent";
const VERSION = 1;
export const CONSENT_EVENT = "cookie-consent-open";
export const CONSENT_CHANGED = "cookie-consent-changed";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
    __loadAnalyticsTags?: () => void;
    __loadAdsTags?: () => void;
  }
}

export function getConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(categories: ConsentCategories): ConsentRecord {
  const record: ConsentRecord = { ...categories, timestamp: Date.now(), version: VERSION };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch { /* ignore */ }
  applyConsent(record);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED, { detail: record }));
  return record;
}

export function applyConsent(record: ConsentCategories) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      analytics_storage: record.analytics ? "granted" : "denied",
      ad_storage: record.ads ? "granted" : "denied",
      ad_user_data: record.ads ? "granted" : "denied",
      ad_personalization: record.ads ? "granted" : "denied",
    });
  }
  if (record.analytics) window.__loadAnalyticsTags?.();
  if (record.ads) window.__loadAdsTags?.();
}

export function openConsentBanner() {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
