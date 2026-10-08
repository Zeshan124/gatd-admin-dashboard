"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Shared layout for legal pages (Privacy Policy, Terms & Conditions, ...):
// hero + banner, sticky numbered table of contents on the left, content on the right.

// Offset (px) that clears the sticky navbar when jumping to / tracking sections.
const NAV_OFFSET = 120;

// Renders an email address as a mailto link (text unchanged).
export function Mail({ address }) {
  return (
    <a
      href={`mailto:${address}`}
      className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline break-all"
    >
      {address}
    </a>
  );
}

export function SiteLink() {
  return (
    <a
      href="https://www.globalatd.com"
      className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
    >
      www.globalatd.com
    </a>
  );
}

// `single` keeps long, sentence-length items in one column.
export function Bullets({ items, single = false }) {
  return (
    // CSS columns (not a grid) so items flow evenly regardless of each one's length.
    <ul className={`${single ? "" : "md:columns-2 md:gap-x-10"} my-5`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 mb-2.5 break-inside-avoid">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D52029] flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Address({ children }) {
  return (
    <address className="not-italic relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200 pl-6 pr-5 py-5 text-[#414143] leading-relaxed">
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#D52029]" />
      {children}
    </address>
  );
}

// Splits "3. Personal Data We May Collect" into its number and label for the TOC.
function splitTitle(title) {
  const m = title.match(/^(\d+)\.\s*(.*)$/);
  return m ? { num: m[1].padStart(2, "0"), label: m[2] } : { num: "", label: title };
}

function TocList({ sections, activeId, onSelect }) {
  const activeIndex = sections.findIndex((s) => s.id === activeId);
  return (
    <ol className="relative">
      {/* Timeline rail */}
      <span className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-200" aria-hidden="true" />
      {sections.map((s, i) => {
        const active = i === activeIndex;
        const done = i < activeIndex;
        const { num, label } = splitTitle(s.title);
        return (
          <li key={s.id} className="relative">
            <a
              href={`#${s.id}`}
              onClick={(e) => onSelect(e, s.id)}
              aria-current={active ? "location" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl pl-3 pr-3 py-2 transition-all duration-300 ${
                active ? "bg-gradient-to-r from-[#D52029]/10 to-transparent" : "hover:bg-slate-50"
              }`}
            >
              {/* Active edge marker */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[#D52029] transition-all duration-300 ${
                  active ? "h-7 opacity-100" : "h-0 opacity-0"
                }`}
              />
              {/* Number node */}
              <span
                className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums transition-all duration-300 ${
                  active
                    ? "bg-[#D52029] text-white shadow-md shadow-red-600/30 ring-4 ring-[#D52029]/15"
                    : done
                    ? "bg-[#414143] text-white"
                    : "bg-white text-slate-500 border border-slate-200 group-hover:border-[#D52029] group-hover:text-[#D52029]"
                }`}
              >
                {num}
              </span>
              <span
                className={`text-[13px] leading-snug transition-colors duration-200 ${
                  active
                    ? "text-[#D52029] font-semibold"
                    : done
                    ? "text-[#414143]"
                    : "text-slate-500 group-hover:text-[#414143]"
                }`}
              >
                {label}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * @param {string}   eyebrow     Small uppercase line above the title
 * @param {string}   title       Page title (h1)
 * @param {string[]} meta        Lines under the company name (e.g. ["Singapore"])
 * @param {string}   company     Company line (e.g. "GATD Pte. Ltd.")
 * @param {string[]} dates       Date chips (e.g. ["Effective Date: [..]", "Last Updated: [..]"])
 * @param {string}   banner      Banner image path
 * @param {string}   tocLabel    Label above "Table of Contents" in the sidebar
 * @param {{label: string, email: string}} contact  Sidebar footer contact
 * @param {{id: string, title: string, body: React.ReactNode}[]} sections
 */
export default function LegalPage({
  eyebrow,
  title,
  company,
  meta = [],
  dates = [],
  banner,
  tocLabel,
  contact,
  sections,
}) {
  const [activeId, setActiveId] = useState(sections[0].id);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const tocNavRef = useRef(null);

  // Highlight the section currently at the top of the viewport.
  useEffect(() => {
    const onScroll = () => {
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - NAV_OFFSET - 10 <= 0) current = s.id;
      }
      // At the very bottom, the last section is the active one.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  // Keep the active TOC item visible inside the sidebar's own scroll area
  // (adjusts only the sidebar, never the page).
  useEffect(() => {
    const nav = tocNavRef.current;
    const item = nav?.querySelector('[aria-current="location"]');
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < navRect.top + 8 || itemRect.bottom > navRect.bottom - 8) {
      nav.scrollTo({
        top: nav.scrollTop + (itemRect.top - navRect.top) - nav.clientHeight / 2 + itemRect.height / 2,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  const handleSelect = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setMobileTocOpen(false);
  };

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const progress = Math.round(((activeIndex + 1) / sections.length) * 100);

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-12 sm:py-16 md:py-20 border-b border-slate-200">
        <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
            {eyebrow}
          </p>

          {/* Title — full width */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-[#414143] leading-tight text-balance">
            {title}
          </h1>

          {/* Company & dates — one row under the title */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 mb-8 sm:mb-10">
            {company && (
              <span className="text-sm sm:text-base font-semibold text-[#414143] mr-1">{company}</span>
            )}
            {meta.map((line) => (
              <span key={line} className="text-sm sm:text-base text-slate-600 mr-1">
                {line}
              </span>
            ))}
            {dates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm text-[#414143] whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D52029]" />
                {d}
              </span>
            ))}
          </div>

          {/* Banner Image */}
          {/* {banner && (
            // Same banner height as the rest of the site (Services / Contact heroes).
            // The image adapts instead: anchored toward the right, where the legal
            // artwork sits, so narrower screens crop the sky rather than the subject.
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-slate-100"
              style={{ height: "clamp(260px, 40vw, 500px)" }}
            >
              <Image
                src={banner}
                alt={`GATD ${tocLabel || ""}`.trim()}
                fill
                className="object-cover object-[75%_center]"
                priority
              />
            </div>
          )} */}
        </div>
      </section>

      {/* Body: TOC (left) + content (right) */}
      <section className="bg-slate-50/60 py-12 sm:py-16 md:py-20">
        <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
            {/* Mobile / tablet TOC */}
            <div className="lg:hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileTocOpen((o) => !o)}
                aria-expanded={mobileTocOpen}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-bold text-[#414143]">Table of Contents</span>
                <svg
                  className={`w-4 h-4 text-[#414143] transition-transform duration-200 ${mobileTocOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileTocOpen && (
                <div className="px-2 pb-3 border-t border-slate-100 pt-2 max-h-[60vh] overflow-y-auto">
                  <TocList sections={sections} activeId={activeId} onSelect={handleSelect} />
                </div>
              )}
            </div>

            {/* Desktop sticky TOC */}
            <aside className="hidden lg:block sticky top-28">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(65,65,67,0.25)] overflow-hidden">
                {/* Header */}
                <div className="relative overflow-hidden bg-[#414143] px-6 pt-6 pb-5">
                  <span className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#D52029]/25 blur-2xl" aria-hidden="true" />
                  <span className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-white/5" aria-hidden="true" />
                  <div className="relative">
                    {tocLabel && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-1.5">
                        {tocLabel}
                      </p>
                    )}
                    <h2 className="text-lg font-bold text-white mb-1">Table of Contents</h2>
                    <div className="w-8 h-0.5 bg-[#D52029] mb-5" />
                    <div className="flex items-center justify-between text-[11px] text-white/70 mb-2">
                      <span>
                        Section{" "}
                        <span className="font-bold text-white tabular-nums">{String(activeIndex + 1).padStart(2, "0")}</span>
                        {" "}of {sections.length}
                      </span>
                      <span className="font-semibold text-white tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#D52029] to-red-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <nav
                  ref={tocNavRef}
                  aria-label={`${tocLabel || "Page"} sections`}
                  className="toc-scroll px-2 py-3 max-h-[calc(100vh-24rem)] min-h-[200px] overflow-y-auto"
                >
                  <TocList sections={sections} activeId={activeId} onSelect={handleSelect} />
                </nav>

                {/* Footer — contact */}
                {contact && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 flex items-center gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-[#D52029]/10 text-[#D52029] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {contact.label}
                      </p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm font-semibold text-[#414143] hover:text-[#D52029] transition-colors break-all"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Content */}
            <article className="rounded-2xl bg-white border border-slate-200 shadow-sm px-5 sm:px-8 md:px-12 py-4 sm:py-6">
              {sections.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="py-8 sm:py-10 border-b border-slate-100 last:border-b-0"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-[#414143] mb-1">{s.title}</h2>
                  <div className="w-8 h-0.5 bg-[#D52029] mb-5" />
                  <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {s.body}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
