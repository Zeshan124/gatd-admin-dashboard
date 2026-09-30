"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, X, Loader2 } from "lucide-react";
import SolutionCategoryRow from "./SolutionCategoryRow";
import { publicSolutionsApi } from "@/lib/publicApi";

const INITIAL_VISIBLE = 2;
const LOAD_MORE_COUNT = 2;

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Fuzzy matching so a hardcoded deep-link slug (e.g. "executive-educational")
// still resolves to the right CMS category even when the wording differs slightly
// from the admin-entered title (e.g. "Executive Education Program").
const STOP = new Set(["and", "the", "for", "of", "a", "an", "our", "program", "programs", "programme", "programmes"]);
function tokenize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP.has(t));
}
// Two tokens match if equal or one is a ≥5-char prefix of the other
// (so "education" ~ "educational", "conference" ~ "conferences").
function tokenMatch(a, b) {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 5 && long.startsWith(short);
}
// Fraction of the query's tokens that have a match in the candidate's tokens.
function similarity(queryTokens, candTokens) {
  if (!queryTokens.length || !candTokens.length) return 0;
  let hits = 0;
  for (const q of queryTokens) if (candTokens.some((c) => tokenMatch(q, c))) hits++;
  return hits / queryTokens.length;
}

/** Resolve a ?category= value to a catalog entry: exact slug → title slug → fuzzy. */
function resolveCategory(catalog, raw) {
  const norm = slugify(raw);
  let match = catalog.find((c) => String(c.id) === raw || slugify(String(c.id)) === norm || slugify(c.title) === norm);
  if (match) return match;
  const q = tokenize(raw.replace(/-/g, " "));
  let best = null;
  let bestScore = 0;
  for (const c of catalog) {
    const score = similarity(q, tokenize(c.title));
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore >= 0.5 ? best : null;
}

export default function SolutionsCatalog() {
  const [catalog, setCatalog] = useState([]); // [{ id, title, items:[{id,title,image,href,rating,reviews}] }]
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const sectionRef = useRef(null);

  // Live catalog: Solution categories, each with its Programs, from the CMS.
  useEffect(() => {
    let alive = true;
    publicSolutionsApi
      .catalog()
      .then((res) => {
        if (!alive) return;
        const data = Array.isArray(res?.data) ? res.data : [];
        setCatalog(
          data.map((p) => ({
            id: p.slug,
            title: p.title,
            isClickable: p.isClickable !== false,
            items: (p.children || []).map((c, i) => ({
              id: c.slug || i,
              title: c.title,
              image: c.cardImage,
              // Admin-controlled: href is null when the program isn't clickable.
              href: c.href,
              rating: c.rating,
              reviews: c.reviews,
              ratingEnabled: c.ratingEnabled,
            })),
          }))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Deep-link support: /solutions?category=<slug> (e.g. from the Home "Explore More"
  // button) pre-selects that Solution's section and scrolls to it. Matches on the
  // category slug or its slugified title so hardcoded links stay resilient.
  useEffect(() => {
    if (!catalog.length || typeof window === "undefined") return;
    const cat = new URLSearchParams(window.location.search).get("category");
    if (!cat) return;
    const match = resolveCategory(catalog, cat);
    if (match) {
      setActiveFilter(match.id);
      setVisibleCount(INITIAL_VISIBLE);
      // Scroll after the filtered render settles; retry once for late image layout
      // (a single early scroll can miss on a fresh page load).
      const toSection = () => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(toSection, 150);
      setTimeout(toSection, 650);
    }
  }, [catalog]);

  const filtered = activeFilter ? catalog.filter((c) => c.id === activeFilter) : catalog;
  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFilter = (id) => {
    setActiveFilter(id);
    setVisibleCount(INITIAL_VISIBLE);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <section ref={sectionRef} className="scroll-mt-24 bg-[#F8F8F8] py-10 sm:py-14 md:py-16">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading solutions…
          </div>
        ) : catalog.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No solutions available yet.</div>
        ) : (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-10">
              <button
                onClick={() => setFilterOpen((p) => !p)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:border-[#D52029] hover:text-[#D52029] transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              {activeFilter && (
                <button
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#D52029] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filter
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            {filterOpen && (
              <div className="flex flex-wrap gap-2 mb-10 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                {catalog.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilter(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeFilter === cat.id
                        ? "bg-[#D52029] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-[#D52029] hover:text-white"
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            )}

            {/* Category rows */}
            {displayed.map((category) => (
              <SolutionCategoryRow
                key={category.id}
                title={category.title}
                items={category.items}
                href={category.isClickable ? `/solutions/${category.id}` : undefined}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-4 mb-6">
                <button
                  onClick={() => setVisibleCount((v) => v + LOAD_MORE_COUNT)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white text-sm font-bold rounded-lg transition-all duration-200"
                >
                  Load More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
