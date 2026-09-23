// Wrapper de chrome.storage.local com fallback para localStorage (útil fora da extensão).
const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export async function get(key, fallback) {
  try {
    if (hasChrome) {
      const r = await chrome.storage.local.get(key);
      return r[key] ?? fallback;
    }
    const raw = localStorage.getItem('atomik:' + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function set(key, value) {
  try {
    if (hasChrome) return await chrome.storage.local.set({ [key]: value });
    localStorage.setItem('atomik:' + key, JSON.stringify(value));
  } catch (e) {
    console.warn('[Atomik] falha ao salvar', key, e);
  }
}

export const DEFAULT_SETTINGS = {
  figmaToken: '',
  insertMode: 'end', // 'end' | 'inside'
  siteUrl: '',
  defaultBoxed: 1200,
  mobileStack: true,
};

export async function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(await get('settings', {})) };
}

export async function saveSettings(patch) {
  const cur = await getSettings();
  await set('settings', { ...cur, ...patch });
}
