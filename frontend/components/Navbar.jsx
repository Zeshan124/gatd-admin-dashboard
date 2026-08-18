"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

const solutionsMenu = [
  {
    category: "Executive Educational Program",
    items: [
      {
        label: "Singapore Potential Leadership Development Program",
        href: "#",
        children: [],
      },
      {
        label: "Women in Leadership",
       href: "#",
        children: [],
      },
      {
        label: "Next-Gen Strategic Leadership for CxOs",
        href: "#",
        children: [],
      },
      {
        label: "Global CEO Executive Leadership Mastery Program",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Consulting Service",
    items: [
      {
        label: "Ministries Regional & International",
        href: "#",
        children: [],
      },
      {
        label: "Talent Development & Succession Planning",
        href: "#",
        children: [],
      },
      {
        label: "Strategic Workforce Planning and Development",
        href: "#",
        children: [],
      },
      {
        label: "Balanced Scorecard & Performance Management",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Customized Programs",
    items: [
      {
        label: "Risk & Crisis Management Leadership",
       href: "#",
        children: [],
      },
      {
        label: "Strategic Rightsizing",
        href: "#",
        children: [],
      },
      {
        label: "Transformation Leadership in M&A",
        href: "#",
        children: [],
      },
      {
        label: "Global Operations in Excellence (GOiE)",
       href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Certified Programs",
    items: [
      {
        label: "Strategic Human Resources, Business Leadership",
        href: "/solutions/strategic-hr",
        children: [
          {
            label: "Strategic HR Business Partnership & Beyond",
            href: "/solutions/strategic-hr/strategic-hr-business-partnership",
          },
          {
            label: "Impactful Business and People Leadership",
            href: "/solutions/strategic-hr/business-people-leadership",
          },
          {
            label: "Performance Development and Rewards Management",
            href: "/solutions/strategic-hr/performance-rewards",
          },
          {
            label: "Resourcing, Talent and Learning Management",
            href: "/solutions/strategic-hr/resourcing-talent-learning",
          },
          // { label: "HR Analytics and Digital Transformation", href: "/solutions/strategic-hr/hr-analytics" },
          // { label: "Employment Law and Compliance", href: "/solutions/strategic-hr/employment-law" },
          // { label: "Organisational Design and Change", href: "/solutions/strategic-hr/org-design-change" },
          // { label: "Executive Compensation and Benefits Strategy", href: "/solutions/strategic-hr/compensation-benefits" },
          {
            label: "Impactive HR for the Uninitiated",
            href: "/solutions/strategic-hr/impactive-hr",
          },
          {
            label: "Progressing Organization Development",
            href: "/solutions/strategic-hr/progressing-org-development",
          },
          {
            label: "Advancing Trainer Development (ToT)",
            href: "/solutions/strategic-hr/advancing-trainer-development",
          },
          {
            label: "Management: Best Practices for Best Results",
            href: "/solutions/strategic-hr/management-best-practices",
          },
        ],
      },
      {
        label: "Change Management",
        href: "#",
        children: [],
      },
      {
        label: "Public Private Partnerships",
        href: "#",
        children: [],
      },
      {
        label: "Key Performance Indicators (KPIs)",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Executive Retreats",
    items: [
      {
        label: "Strategic Reset Retreat",
        href: "#",
        children: [],
      },
      {
        label: "The Great Gatsby Gala",
        href: "#",
        children: [],
      },
      {
        label: "The All-Star Carnival",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Incubators — Regional & International",
    items: [
      {
        label: "Global HealthTech",
        href: "#",
        children: [],
      },
      {
        label: "Net Zero Innovation Lab",
        href: "#",
        children: [],
      },
      {
        label: "GovTech Catalyst Hub",
        href: "#",
        children: [],
      },
      {
        label: "EdTech Skills",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Event Management",
    items: [
      {
        label: "Program Management",
        href: "#",
        children: [],
      },
      {
        label: "CSR Events",
        href: "#",
        children: [],
      },
      {
        label: "Product Launches & Brand Activation",
        href: "#",
        children: [],
      },
      {
        label: "Trade Shows and Expo Management",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Global Conferences",
    items: [
      {
        label: "Global Marketing Forum",
        href: "#",
        children: [],
      },
      {
        label: "Energy Governance & Leadership Summit",
        href: "#",
        children: [],
      },
      {
        label: "The Zero Summit",
        href: "#",
        children: [],
      },
      {
        label: "PetroForesight 2030",
        href: "#",
        children: [],
      },
    ],
  },
  {
    category: "Industry Specific",
    items: [
      {
        label: "Advanced Program in Financial Strategy",
        href: "#",
        children: [],
      },
      {
        label: "Innovation Design into Action",
        href: "#",
        children: [],
      },
      {
        label: "Global Marketing & Sales Leadership",
        href: "#",
        children: [],
      },
      {
        label: "Strategic Leadership Across Healthcare",
        href: "#",
        children: [
          // { label: "Healthcare Strategy & System Leadership", href: "/solutions/healthcare-leadership" },
          // { label: "Clinical Excellence & Quality Improvement", href: "/solutions/healthcare-leadership" },
          // { label: "Healthcare Finance & Resource Management", href: "/solutions/healthcare-leadership" },
          // { label: "Digital Health & Innovation Leadership", href: "/solutions/healthcare-leadership" },
        ],
      },
    ],
  },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Solutions", href: "/solutions", hasDropdown: true },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [mobileItemOpen, setMobileItemOpen] = useState(null);

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
          <nav className="hidden lg:flex items-center gap-1">
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
                              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-[#D52029]" />
                            </div>

                            {/* Level 2 — Items flyout */}
                            {hoveredCategory === group.category && (
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
                                    <Link
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
                                    </Link>

                                    {/* Level 3 — Children flyout */}
                                    {item.children?.length > 0 &&
                                      hoveredItem === item.label && (
                                        <div className="absolute left-full top-0 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-80 overflow-y-auto">
                                          <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                                            <Link
                                              href={item.href}
                                              onClick={closeAll}
                                              className="text-xs font-bold text-[#D52029] uppercase tracking-wider hover:underline"
                                            >
                                              View All →
                                            </Link>
                                          </div>
                                          {item.children.map((child, ci) => (
                                            <Link
                                              key={`${child.href}-${ci}`}
                                              href={child.href}
                                              onClick={closeAll}
                                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:text-[#D52029] hover:bg-red-50 transition-colors group"
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#D52029] shrink-0 transition-colors" />
                                              <span className="leading-snug">
                                                {child.label}
                                              </span>
                                            </Link>
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
          <div className="hidden lg:flex items-center">
            <Link
              href="/brochures/GATD-Company-Profile.pdf"
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
              Company Profile
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
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
        className={`lg:hidden fixed inset-0 top-16 sm:top-20 z-40 transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
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
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${mobileCategoryOpen === group.category ? "rotate-180 text-[#D52029]" : ""}`}
                              />
                            </button>

                            {mobileCategoryOpen === group.category && (
                              <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-0.5 mb-1">
                                {group.items.map((item) => (
                                  <div key={item.label}>
                                    {item.children?.length > 0 ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            setMobileItemOpen(
                                              mobileItemOpen === item.label
                                                ? null
                                                : item.label,
                                            )
                                          }
                                          className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-500 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors group"
                                        >
                                          <span className="text-left leading-snug">
                                            {item.label}
                                          </span>
                                          <ChevronDown
                                            className={`w-3 h-3 shrink-0 ml-2 transition-transform ${mobileItemOpen === item.label ? "rotate-180 text-[#D52029]" : ""}`}
                                          />
                                        </button>
                                        {mobileItemOpen === item.label && (
                                          <div className="ml-4 pl-3 border-l-2 border-red-50 space-y-0.5 mb-1">
                                            {item.children.map((child, ci) => (
                                              <Link
                                                key={`${child.href}-${ci}`}
                                                href={child.href}
                                                onClick={() =>
                                                  setMobileOpen(false)
                                                }
                                                className="block px-3 py-2 text-xs text-slate-400 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors"
                                              >
                                                {child.label}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-3 py-2 text-xs text-slate-500 hover:text-[#D52029] hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        {item.label}
                                      </Link>
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

          <div className="px-4 py-6 border-t border-slate-100">
            <Link
              href="/brochures/GATD-Company-Profile.pdf"
              onClick={() => setMobileOpen(false)}
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
              Download Company Profile
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
