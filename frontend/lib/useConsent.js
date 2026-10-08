"use client";

import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, readConsent } from "./consent";

/**
 * Current cookie consent.
 *   undefined → not read yet (first render; avoids a hydration mismatch)
 *   null      → the visitor hasn't decided
 *   object    → { analytics, media, savedAt }
 */
export function useConsent() {
  const [consent, setConsent] = useState(undefined);

  useEffect(() => {
    setConsent(readConsent());
    // Fall back to the event payload when storage is blocked (e.g. some private modes).
    const onChange = (e) => {
      const d = e?.detail;
      setConsent(readConsent() || (d ? { analytics: d.analytics, media: d.media, savedAt: d.savedAt } : null));
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  return consent;
}
