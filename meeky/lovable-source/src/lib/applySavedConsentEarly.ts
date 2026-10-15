// Runs on client startup (before React mounts) to re-apply a previously saved
// cookie consent choice. Without this, returning visitors whose banner never
// re-renders would sit forever on the `consent default = denied` state, and
// GA4/Meta Pixel tags would never load — breaking analytics for every repeat
// user. Mirrors the exact side-effects the "Accept" button triggers.

import { applyConsent, getConsent } from "./cookieConsent";

let applied = false;

export function applySavedConsentEarly() {
  if (applied) return;
  if (typeof window === "undefined") return;
  const existing = getConsent();
  if (!existing) return;
  applied = true;
  applyConsent(existing);
}
