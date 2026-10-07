"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, CalendarDays, MapPin, Coins, Users, ArrowRight } from "lucide-react";
import { publicSitePopupApi } from "@/lib/publicApi";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = MONTHS.map((m) => m.slice(0, 3));

// "2026-11-23" → { y, m, d } without timezone conversion.
function parseDate(s) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return match ? { y: +match[1], m: +match[2] - 1, d: +match[3] } : null;
}

/** Two display lines for the programme dates, e.g. ["23 – 27", "November 2026"]. */
export function formatDateRange(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a && !b) return null;
  if (!a || !b) {
    const one = a || b;
    return [String(one.d), `${MONTHS[one.m]} ${one.y}`];
  }
  if (a.y === b.y && a.m === b.m) {
    return [a.d === b.d ? String(a.d) : `${a.d} – ${b.d}`, `${MONTHS[a.m]} ${a.y}`];
  }
  if (a.y === b.y) return [`${a.d} ${SHORT[a.m]} – ${b.d} ${SHORT[b.m]}`, String(a.y)];
  return [`${a.d} ${SHORT[a.m]} ${a.y} –`, `${b.d} ${SHORT[b.m]} ${b.y}`];
}

function todayLocal() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

const SEEN_KEY = "gatd_site_popup_seen";

/** Has this visitor already seen this version of the popup (per the frequency setting)? */
function alreadySeen(popup) {
  try {
    const version = String(popup.updatedAt || "");
    if (popup.frequency === "always") return false;
    if (popup.frequency === "daily") return localStorage.getItem(SEEN_KEY) === `${version}|${todayLocal()}`;
    return sessionStorage.getItem(SEEN_KEY) === version;
  } catch {
    return false;
  }
}

function markSeen(popup) {
  try {
    const version = String(popup.updatedAt || "");
    if (popup.frequency === "daily") localStorage.setItem(SEEN_KEY, `${version}|${todayLocal()}`);
    else if (popup.frequency === "session") sessionStorage.setItem(SEEN_KEY, version);
  } catch {
    /* storage unavailable (private mode) — just show it */
  }
}

function inWindow(popup) {
  const today = todayLocal();
  if (popup.showFrom && today < popup.showFrom) return false;
  if (popup.showUntil && today > popup.showUntil) return false;
  return true;
}

function CtaButton({ href, onClick, preview, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D52029] hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5";
  const content = (
    <>
      {children}
      <ArrowRight className="w-4 h-4" />
    </>
  );
  // Dashboard preview: never navigate away from the (possibly unsaved) form.
  // Also refuse anything that isn't a site path or http(s) URL (backend validates too).
  const safe = /^(https?:\/\/|\/(?!\/))/i.test(href || "");
  if (preview || !safe) {
    return (
      <span className={cls} title={href}>
        {content}
      </span>
    );
  }
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {content}
    </Link>
  );
}

/** The popup card itself (also used as the live preview in the dashboard). */
export function SitePopupCard({ popup, onClose, preview = false }) {
  const dates = formatDateRange(popup.startDate, popup.endDate);
  const hasLocation = popup.locationCity || popup.locationCountry;
  const hasPrice = popup.price;
  const hasImage = !!popup.image;

  return (
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-[#414143] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Image — on top for mobile, diagonal right panel from md up */}
      {hasImage && (
        <>
          <div className="md:hidden h-36 sm:h-44 w-full">
            <img src={popup.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:block absolute inset-y-0 right-0 w-[48%]" aria-hidden="true">
            <img
              src={popup.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: "polygon(14% 0, 100% 0, 100% 100%, 42% 100%)" }}
            />
            {/* Red accents along the diagonal and the bottom-right corner */}
            <div className="absolute inset-0 bg-[#D52029]" style={{ clipPath: "polygon(1% 0, 14% 0, 21% 25%)" }} />
            <div className="absolute inset-0 bg-[#D52029]" style={{ clipPath: "polygon(100% 66%, 100% 100%, 80% 100%)" }} />
          </div>
        </>
      )}

      <div className={`relative z-10 px-5 py-5 sm:px-7 sm:py-6 ${hasImage ? "md:w-[60%] md:pr-4" : ""}`}>
        <img src="/images/home/GATD-Logo 1.svg" alt="GATD" className="h-8 sm:h-9 w-auto" />
        <span className="block w-8 h-[3px] bg-[#D52029] mt-3 mb-2" />

        {popup.eyebrow && (
          <p className="text-[11px] sm:text-xs font-medium tracking-[0.25em] uppercase text-[#414143]">{popup.eyebrow}</p>
        )}

        {(popup.titleHighlight || popup.title) && (
          <h2 className="mt-2 text-xl sm:text-2xl lg:text-[1.9rem] font-bold leading-[1.1] text-[#0f172a]">
            {popup.titleHighlight && <span className="text-[#D52029]">{popup.titleHighlight}</span>}
            {popup.titleHighlight && popup.title && <br />}
            {popup.title}
          </h2>
        )}

        {popup.description && (
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#414143] whitespace-pre-line">{popup.description}</p>
        )}

        {(dates || hasLocation) && (
          <div className="mt-4 flex flex-wrap items-center gap-y-3">
            {dates && (
              <div className="flex items-center gap-2.5 pr-5">
                <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8 text-[#D52029] shrink-0" strokeWidth={1.6} />
                <div className="leading-tight">
                  <p className="text-sm sm:text-base font-bold text-[#0f172a]">{dates[0]}</p>
                  <p className="text-xs sm:text-sm text-[#414143]">{dates[1]}</p>
                </div>
              </div>
            )}
            {hasLocation && (
              <div className={`flex items-center gap-3 ${dates ? "sm:pl-5 sm:border-l sm:border-slate-200" : ""}`}>
                <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-[#D52029] shrink-0" strokeWidth={1.6} />
                <div className="leading-tight">
                  {popup.locationCity && <p className="text-sm sm:text-base font-bold text-[#0f172a]">{popup.locationCity}</p>}
                  {popup.locationCountry && <p className="text-xs sm:text-sm text-[#414143]">{popup.locationCountry}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investment + offer badge stay on one row (wraps only on very small phones) */}
        {(hasPrice || popup.badgeText) && (
          <div className="mt-4 flex flex-wrap sm:flex-nowrap sm:w-max max-w-full items-center gap-y-2 rounded-xl bg-red-50/70 border border-red-100 px-3 py-2">
            {hasPrice && (
              <div className="flex items-center gap-2 pr-3 shrink-0 whitespace-nowrap">
                <Coins className="w-6 h-6 text-[#D52029] shrink-0" strokeWidth={1.6} />
                <div className="leading-tight">
                  {popup.priceLabel && <p className="text-[11px] sm:text-xs text-[#414143]">{popup.priceLabel}</p>}
                  <p className="text-sm sm:text-base font-bold text-[#0f172a]">
                    {popup.price}
                    {popup.priceUnit && <span className="text-xs font-medium">{popup.priceUnit}</span>}
                  </p>
                </div>
              </div>
            )}
            {popup.badgeText && (
              <div className={`flex items-center gap-2 shrink-0 ${hasPrice ? "sm:pl-3 sm:border-l sm:border-red-200" : ""}`}>
                <Users className="w-5 h-5 text-[#D52029] shrink-0" strokeWidth={1.8} />
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-[#D52029] whitespace-nowrap">
                  {popup.badgeText}
                </span>
              </div>
            )}
          </div>
        )}

        {popup.buttonText && popup.buttonUrl && (
          <div className="mt-5">
            <CtaButton href={popup.buttonUrl} onClick={onClose} preview={preview}>
              {popup.buttonText}
            </CtaButton>
          </div>
        )}
      </div>
    </div>
  );
}

/** Loads the dashboard-managed popup and opens it after the configured delay. */
export default function SitePopup() {
  const [popup, setPopup] = useState(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // drives the fade/scale-in

  useEffect(() => {
    let alive = true;
    let timer;
    publicSitePopupApi
      .get()
      .then((res) => {
        const p = res?.data;
        if (!alive || !p || !inWindow(p) || alreadySeen(p)) return;
        setPopup(p);
        timer = setTimeout(() => {
          if (!alive) return;
          markSeen(p);
          setOpen(true);
          requestAnimationFrame(() => setShown(true));
        }, Math.max(0, Number(p.delaySeconds ?? 1)) * 1000);
      })
      .catch(() => {});
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setShown(false);
    setTimeout(() => setOpen(false), 200);
  };

  if (!open || !popup) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex justify-center p-4 overflow-y-auto"
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />
      <div
        className={`relative w-full max-w-3xl my-auto flex justify-center transition-all duration-200 ${
          shown ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <SitePopupCard popup={popup} onClose={close} />
      </div>
    </div>
  );
}
