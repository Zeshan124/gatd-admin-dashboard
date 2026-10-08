"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { OPEN_SETTINGS_EVENT, saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";

// Cookie consent banner + "Manage preferences" panel (public site only).
// Nothing optional (Google Analytics, Google Maps) loads until the visitor agrees.
// "Accept all" and "Reject all" are equally prominent, and the site works fully
// either way. The choice can be changed any time via "Cookie settings" in the footer.

const CATEGORIES = [
  {
    key: "necessary",
    title: "Strictly necessary",
    text: "Needed for the website to work, such as remembering your cookie choice. These are always on.",
    locked: true,
  },
  {
    key: "analytics",
    title: "Analytics",
    text: "Google Analytics helps us understand how visitors use the website, such as pages visited and traffic sources, so we can improve it.",
  },
  {
    key: "media",
    title: "External media",
    text: "Loads embedded content from other websites, such as the Google Maps location map on our Contact page. These providers may set their own cookies.",
  },
];

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-[#D52029]" : "bg-slate-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[#D52029] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700";
const btnDark =
  "inline-flex items-center justify-center rounded-lg bg-[#414143] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2c2c2e]";
const btnOutline =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-[#414143] transition-colors hover:border-[#414143]";

export default function CookieConsent() {
  const consent = useConsent();
  const [panelOpen, setPanelOpen] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, media: false });

  // Footer "Cookie settings" link reopens the panel with the current choice.
  useEffect(() => {
    const open = () => setPanelOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  // Pre-fill the panel with the saved choice whenever it opens.
  useEffect(() => {
    if (panelOpen) setPrefs({ analytics: !!consent?.analytics, media: !!consent?.media });
  }, [panelOpen, consent]);

  // Close the panel with Escape.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => e.key === "Escape" && setPanelOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const decide = (choice) => {
    saveConsent(choice);
    setPanelOpen(false);
  };
  const acceptAll = () => decide({ analytics: true, media: true });
  const rejectAll = () => decide({ analytics: false, media: false });

  // undefined = not read from storage yet; render nothing to avoid a flash.
  if (consent === undefined) return null;

  const showBanner = consent === null && !panelOpen;

  return (
    <>
      {/* ── Bottom banner (first visit / no decision yet) ─────────────────── */}
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4"
        >
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex gap-4">
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D52029]/10 text-[#D52029] sm:inline-flex">
                  <Cookie className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-base font-bold text-[#414143]">We value your privacy</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    We use cookies that are needed for our website to work. With your permission,
                    we&apos;d also like to use Google Analytics to understand how the site is used,
                    and to load embedded maps. You can change your choice at any time via
                    &ldquo;Cookie settings&rdquo; in the footer. Read our{" "}
                    <Link href="/cookie-policy" className="font-semibold text-[#D52029] underline-offset-4 hover:underline">
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <button type="button" onClick={rejectAll} className={btnDark}>
                  Reject all
                </button>
                <button type="button" onClick={acceptAll} className={btnPrimary}>
                  Accept all
                </button>
                <button type="button" onClick={() => setPanelOpen(true)} className={btnOutline}>
                  Manage preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences panel ─────────────────────────────────────────────── */}
      {panelOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPanelOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h2 id="cookie-settings-title" className="text-lg font-bold text-[#414143]">
                  Cookie settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose which optional cookies you allow. See our{" "}
                  <Link
                    href="/cookie-policy"
                    onClick={() => setPanelOpen(false)}
                    className="font-semibold text-[#D52029] underline-offset-4 hover:underline"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto px-6">
              {CATEGORIES.map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#414143]">{c.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
                  </div>
                  {c.locked ? (
                    <span className="mt-0.5 shrink-0 text-xs font-semibold text-slate-500">Always on</span>
                  ) : (
                    <div className="mt-0.5">
                      <Toggle
                        label={c.title}
                        checked={prefs[c.key]}
                        onChange={(v) => setPrefs((p) => ({ ...p, [c.key]: v }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={rejectAll} className={btnOutline}>
                Reject all
              </button>
              <button type="button" onClick={() => decide(prefs)} className={btnDark}>
                Save choices
              </button>
              <button type="button" onClick={acceptAll} className={btnPrimary}>
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
