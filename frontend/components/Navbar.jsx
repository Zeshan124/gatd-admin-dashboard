"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { publicSolutionsApi, publicCompanyProfileApi } from "@/lib/publicApi";
import CompanyProfileModal from "@/components/CompanyProfileModal";

// Simple (single-level) dropdown for the "Resources" menu. Only Blogs has a page
// today; the rest are placeholders (#) until their pages exist.
const resourcesMenu = [
  { label: "Blogs", href: "/blog" },
  { label: "Event", href: "#" },
  { label: "News", href: "#" },
  { label: "Gallery", href: "#" },
  { label: "Press Release", href: "#" },
  { label: "Media", href: "#" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Solutions", href: "/solutions", hasDropdown: true },
  { label: "Services", href: "/services" },
  { label: "Resources", href: "#", hasResources: true },
  { label: "Contact", href: "/contact" },
];

// Only same-site paths (/…) or http(s) URLs are treated as navigable; anything
// else (or a null href from a non-clickable Program/Subprogram) renders as text.
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;
const safeHref = (h) => (h && SAFE_LINK_RE.test(h) ? h : null);

// A dropdown row: a real <Link> when it has a navigable href, otherwise plain,
// non-clickable text (honours the admin "clickable" toggle for Programs/Subprograms).
function NavRow({ href, onClick, className, children }) {
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }
  return <span className={`${className} cursor-default`}>{children}</span>;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [mobileItemOpen, setMobileItemOpen] = useState(null);

  // Live Solutions → Programs → Subprograms tree from the CMS (fetched at runtime
  // so newly-created content appears without rebuilding the static site).
  const [solutionsTree, setSolutionsTree] = useState([]);
  useEffect(() => {
    let alive = true;
    publicSolutionsApi
      .menu()
      .then((res) => {
        if (alive) setSolutionsTree(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Company Profile popup (header button) + its CMS settings.
  const [cpOpen, setCpOpen] = useState(false);
  const [cp, setCp] = useState(null);
  useEffect(() => {
    let alive = true;
    publicCompanyProfileApi
      .get()
      .then((res) => {
        if (alive) setCp(res?.data || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const showCompanyProfile = cp?.isEnabled !== false;
  const cpLabel = cp?.buttonLabel || "Company Profile";

  // Normalize the API tree (slug/title/href) to the shape the dropdown markup
  // expects (category/label). Solution → Program → Subprogram.
  const solutionsMenu = solutionsTree.map((p) => ({
    category: p.title,
    items: (p.items || []).map((c) => ({
      label: c.title,
      href: safeHref(c.href),
      children: (c.children || []).map((s) => ({ label: s.title, href: safeHref(s.href) })),
    })),
  }));

  const closeAll = () => {
    setDropdownOpen(false);
    setHoveredCategory(null);
    setHoveredItem(null);
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/home/GATD-Logo 1.svg"
              alt="GATD Logo"
              width={120}
              height={50}
              className="object-contain h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={closeAll}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-800 hover:text-[#D52029] transition-colors duration-200 rounded-md hover:bg-red-50">
                    {link.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Level 1 — Category list */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 w-72 z-50 pt-1">
                      <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                        <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                          <Link
                            href="/solutions"
                            onClick={closeAll}
                            className="text-xs font-bold text-[#D52029] uppercase tracking-wider hover:underline"
                          >
                            View All Solutions →
                          </Link>
                        </div>

                        {solutionsMenu.length === 0 && (
                          <div className="px-4 py-2.5 text-sm text-slate-400">
                            Loading…
                          </div>
                        )}

                        {solutionsMenu.map((group) => (
                          <div
                            key={group.category}
                            className="relative"
                            onMouseEnter={() => {
                              setHoveredCategory(group.category);
                              setHoveredItem(null);
                            }}
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 transition-colors cursor-default group">
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] transition-colors shrink-0" />
                                {group.category}
                              </span>
                              {group.items.length > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-[#D52029]" />
                              )}
                            </div>

                            {/* Level 2 — Items flyout */}
                            {hoveredCategory === group.category && group.items.length > 0 && (
                              <div className="absolute left-full top-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                                {group.items.map((item) => (
                                  <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() =>
                                      setHoveredItem(item.label)
                                    }
                                    onMouseLeave={() => setHoveredItem(null)}
                                  >
                                    <NavRow
                                      href={item.href}
                                      onClick={closeAll}
                                      className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 transition-colors group"
                                    >
                                      <span className="flex items-center gap-2 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] shrink-0 transition-colors" />
                                        <span className="leading-snug truncate">
                                          {item.label}
                                        </span>
                                      </span>
                                      {item.children?.length > 0 && (
                                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-[#D52029]" />
                                      )}
                                    </NavRow>

                                    {/* Level 3 — Children flyout */}
                                    {item.children?.length > 0 &&
                                      hoveredItem === item.label && (
                                        <div className="absolute left-full top-0 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-[70vh] overflow-y-auto">
                                          {item.href && (
                                            <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                                              <Link
                                                href={item.href}
                                                onClick={closeAll}
                                                className="text-xs font-bold text-[#D52029] uppercase tracking-wider hover:underline"
                                              >
                                                View All →
                                              </Link>
                                            </div>
                                          )}
                                          {item.children.map((child, ci) => (
                                            <NavRow
                                              key={`${child.label}-${ci}`}
                                              href={child.href}
                                              onClick={closeAll}
                                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 transition-colors group"
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] shrink-0 transition-colors" />
                                              <span className="leading-snug">
                                                {child.label}
                                              </span>
                                            </NavRow>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : link.hasResources ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-800 hover:text-[#D52029] transition-colors duration-200 rounded-md hover:bg-red-50">
                    {link.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {resourcesOpen && (
                    <div className="absolute top-full left-0 w-56 z-50 pt-1">
                      <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                        {resourcesMenu.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setResourcesOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 transition-colors group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] shrink-0 transition-colors" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-800 hover:text-[#D52029] transition-colors duration-200 rounded-md hover:bg-red-50"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Desktop CTA */}
          {showCompanyProfile && (
            <div className="hidden xl:flex items-center">
              <button
                type="button"
                onClick={() => setCpOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D52029] hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                {cpLabel}
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`xl:hidden fixed inset-0 top-16 sm:top-20 z-40 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.hasDropdown ? (
                  <>
                    <button
                      onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-slate-800 hover:text-[#D52029] hover:bg-red-50 rounded-xl transition-colors"
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180 text-[#D52029]" : ""}`}
                      />
                    </button>

                    {mobileDropdownOpen && (
                      <div className="ml-4 mt-1 border-l-2 border-red-100 pl-3 space-y-0.5">
                        <Link
                          href="/solutions"
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-xs font-bold text-[#D52029] uppercase tracking-wider"
                        >
                          View All Solutions →
                        </Link>
                        {solutionsMenu.length === 0 && (
                          <p className="px-3 py-2 text-xs text-slate-400">Loading…</p>
                        )}
                        {solutionsMenu.map((group) => (
                          <div key={group.category}>
                            {/* Category */}
                            <button
                              onClick={() =>
                                setMobileCategoryOpen(
                                  mobileCategoryOpen === group.category
                                    ? null
                                    : group.category,
                                )
                              }
                              className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] transition-colors shrink-0" />
                                {group.category}
                              </span>
                              {group.items.length > 0 && (
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform ${mobileCategoryOpen === group.category ? "rotate-180 text-[#D52029]" : ""}`}
                                />
                              )}
                            </button>

                            {mobileCategoryOpen === group.category && (
                              <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-0.5 mb-1">
                                {group.items.map((item) => (
                                  <div key={item.label}>
                                    {item.children?.length > 0 ? (
                                      <>
                                        <div className="flex items-center">
                                          <NavRow
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex-1 px-3 py-2 text-xs text-slate-500 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors leading-snug"
                                          >
                                            {item.label}
                                          </NavRow>
                                          <button
                                            onClick={() =>
                                              setMobileItemOpen(
                                                mobileItemOpen === item.label
                                                  ? null
                                                  : item.label,
                                              )
                                            }
                                            aria-label="Toggle subprograms"
                                            className="p-2 text-slate-400 hover:text-[#D52029]"
                                          >
                                            <ChevronDown
                                              className={`w-3 h-3 transition-transform ${mobileItemOpen === item.label ? "rotate-180 text-[#D52029]" : ""}`}
                                            />
                                          </button>
                                        </div>
                                        {mobileItemOpen === item.label && (
                                          <div className="ml-4 pl-3 border-l-2 border-red-50 space-y-0.5 mb-1">
                                            {item.children.map((child, ci) => (
                                              <NavRow
                                                key={`${child.label}-${ci}`}
                                                href={child.href}
                                                onClick={() =>
                                                  setMobileOpen(false)
                                                }
                                                className="block px-3 py-2 text-xs text-slate-400 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors"
                                              >
                                                {child.label}
                                              </NavRow>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <NavRow
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-3 py-2 text-xs text-slate-500 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        {item.label}
                                      </NavRow>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : link.hasResources ? (
                  <>
                    <button
                      onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-slate-800 hover:text-[#D52029] hover:bg-red-50 rounded-xl transition-colors"
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${mobileResourcesOpen ? "rotate-180 text-[#D52029]" : ""}`}
                      />
                    </button>

                    {mobileResourcesOpen && (
                      <div className="ml-4 mt-1 border-l-2 border-red-100 pl-3 space-y-0.5">
                        {resourcesMenu.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm text-slate-600 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-semibold text-slate-800 hover:text-[#D52029] hover:bg-red-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {showCompanyProfile && (
            <div className="px-4 py-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCpOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                {cpLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      <CompanyProfileModal
        open={cpOpen}
        onClose={() => setCpOpen(false)}
        settings={cp}
      />
    </header>
  );
}
