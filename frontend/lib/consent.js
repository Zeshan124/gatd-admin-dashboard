// Cookie consent — the visitor's choice, stored in the browser only (no personal
// data, nothing sent to the server).
//
// Categories:
//   necessary — always on (site functions, remembering this choice)
//   analytics — Google Analytics 4
//   media     — third-party embeds that set their own cookies (Google Maps)
//
// Bump CONSENT_VERSION when the cookie policy changes in a way visitors should
// re-decide on (e.g. a new tracking tool) — everyone is asked again.

export const CONSENT_KEY = "gatd_cookie_consent";
export const CONSENT_VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // re-ask after 12 months

export const CONSENT_CHANGE_EVENT = "gatd:consent-change";
export const OPEN_SETTINGS_EVENT = "gatd:open-cookie-settings";

/** The saved choice, or null if the visitor hasn't decided (or it's outdated/expired). */
export function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || c.version !== CONSENT_VERSION) return null;
    if (!c.savedAt || Date.now() - new Date(c.savedAt).getTime() > MAX_AGE_MS) return null;
    return { analytics: !!c.analytics, media: !!c.media, savedAt: c.savedAt };
  } catch {
    return null;
  }
}

/** Save the choice and notify listeners (analytics loader, map, banner). */
export function saveConsent({ analytics, media }) {
  const value = {
    version: CONSENT_VERSION,
    analytics: !!analytics,
    media: !!media,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked — the choice still applies for this page view */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
  return value;
}

/** Reopen the cookie settings panel (used by the footer "Cookie settings" link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/** Remove Google Analytics cookies when analytics consent is withdrawn. */
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name === "_gat") {
      domains.forEach((d) => {
        document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
      });
    }
  });
}
