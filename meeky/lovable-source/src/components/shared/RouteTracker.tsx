import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, trackQrScanFromUrl, persistUtm } from "@/lib/campaignTracking";
import { oaiqTrack } from "@/lib/openaiPixel";
import { ttqPage } from "@/lib/tiktokPixel";
import { CONSENT_CHANGED } from "@/lib/cookieConsent";

/**
 * Fires an internal page_view insert on every client-side route change.
 * Mounted once in Layout so every route is covered without per-page wiring.
 * trackPageView dedupes per (page, session) via sessionStorage.
 *
 * Also fires the OpenAI Ads pixel `page_viewed` event on every route change
 * (no dedupe — SPA navigations are real page views for ad measurement).
 */
const RouteTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try { persistUtm(); } catch { /* ignore */ }
    void trackPageView(pathname || "/");
    void trackQrScanFromUrl();
    oaiqTrack("page_viewed", {
      page_path: pathname || "/",
      page_location: typeof window !== "undefined" ? window.location.href : undefined,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });
    ttqPage();
  }, [pathname]);

  // The TikTok click id (?ttclid=) is only read after advertising consent.
  // If the user accepts while still on the landing URL, re-run the capture so
  // the click id isn't lost.
  useEffect(() => {
    const onConsent = () => { try { persistUtm(); } catch { /* ignore */ } };
    window.addEventListener(CONSENT_CHANGED, onConsent);
    return () => window.removeEventListener(CONSENT_CHANGED, onConsent);
  }, []);

  return null;
};

export default RouteTracker;
