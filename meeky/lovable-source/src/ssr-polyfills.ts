// Side-effect-only module: guarantees `localStorage` and `sessionStorage` are
// always safely usable.
//
// Two failure modes we defend against:
// 1) SSR/prerender: no `window`, so no storage exists at all.
// 2) Browser (Android/Chrome mobile with 3rd-party cookies/site data blocked,
//    private mode variants, corporate MDM): `window.localStorage` throws
//    `SecurityError: Access is denied for this document` on ACCESS, and every
//    subsequent `getItem`/`setItem` throws too. Left unhandled this crashes
//    the app on load (Sentry-confirmed for real Google Ads traffic).
//
// Must be imported BEFORE any module that reads these globals (notably
// @supabase/supabase-js, which grabs `localStorage` at evaluation time).

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
} as unknown as Storage;

function isStorageUsable(getter: () => Storage | undefined): boolean {
  try {
    const s = getter();
    if (!s) return false;
    const probe = "__meeky_storage_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function forceReplace(target: typeof globalThis, key: "localStorage" | "sessionStorage") {
  try {
    Object.defineProperty(target, key, {
      configurable: true,
      value: noopStorage,
      writable: true,
    });
  } catch {
    try {
      (target as any)[key] = noopStorage;
    } catch {
      /* nothing more we can do */
    }
  }
}

if (typeof globalThis !== "undefined") {
  const g = globalThis as any;
  const isBrowser = typeof g.window !== "undefined";

  if (!isBrowser) {
    // SSR path: install stubs so imports that touch storage don't crash prerender.
    if (typeof g.localStorage === "undefined") g.localStorage = noopStorage;
    if (typeof g.sessionStorage === "undefined") g.sessionStorage = noopStorage;
  } else {
    // Browser path: probe real storage. If access throws (SecurityError) or
    // writes throw (quota / disabled), swap in the noop stub globally so all
    // downstream `localStorage.getItem(...)` calls degrade to null instead of
    // throwing and aborting hydration.
    if (!isStorageUsable(() => g.localStorage)) forceReplace(g, "localStorage");
    if (!isStorageUsable(() => g.sessionStorage)) forceReplace(g, "sessionStorage");
  }
}

export {};
