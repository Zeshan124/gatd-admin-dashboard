"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, X, Star } from "lucide-react";

// Only allow same-site relative paths (/…) or http(s) absolute URLs as a card link
// — never javascript:/data: etc. (defence-in-depth; also validated server-side).
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;

// Deterministic fallback rating — keeps a stable, varied rating for any
// programme that doesn't set one explicitly, so every card shows a rating.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function getRating(prog) {
  // Admin can hide a subprogram's rating from the public site.
  if (prog.ratingEnabled === false) return { rating: null, reviews: null };
  if (prog.rating != null) {
    return { rating: prog.rating, reviews: prog.reviews };
  }
  const h = hashString(String(prog.href || prog.title || prog.id));
  return { rating: (46 + (h % 4)) / 10, reviews: 60 + (h % 340) };
}

export default function SolutionProgrammes({ programmes = [], heading }) {
  const scrollRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".prog-card");
    const width = (card?.offsetWidth || 280) + 16;
    scrollRef.current.scrollBy({ left: dir === "left" ? -width : width, behavior: "smooth" });
  };

  const categories = [...new Set(programmes.map((p) => p.category).filter(Boolean))];
  const displayed = activeFilter
    ? programmes.filter((p) => p.category === activeFilter)
    : programmes;

  return (
    <section className="bg-[#F8F9FA] py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:border-[#D52029] hover:text-[#D52029] transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#D52029] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {filterOpen && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveFilter(cat); setFilterOpen(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeFilter === cat
                    ? "bg-[#D52029] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-[#D52029] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Header row */}
        <div className="flex items-end justify-between gap-6 mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight">
            {heading || "Our Programmes"}
          </h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous"
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next"
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {displayed.map((prog) => {
            const isActive = hoveredId === prog.id;
            const { rating, reviews } = getRating(prog);
            const cardStyle = { width: "clamp(240px, 22vw, 300px)", scrollSnapAlign: "start" };
            const safeHref = prog.href && SAFE_LINK_RE.test(prog.href) ? prog.href : null;
            const cardClass = `prog-card flex-shrink-0 rounded-2xl overflow-hidden flex flex-col ${safeHref ? "cursor-pointer" : "cursor-default"}`;
            const hover = {
              onMouseEnter: () => setHoveredId(prog.id),
              onMouseLeave: () => setHoveredId(null),
            };
            const inner = (
              <>
                {/* Image */}
                <div className="relative w-full bg-slate-200" style={{ height: "260px" }}>
                  {prog.image && (
                    <Image
                      src={prog.image}
                      alt={prog.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}

                  {/* Rating badge */}
                  {rating != null && (
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-[#414143] leading-none">
                        {Number(rating).toFixed(1)}
                      </span>
                      {reviews != null && (
                        <span className="text-[11px] font-medium text-slate-400 leading-none">
                          ({reviews})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className={`px-5 pt-4 pb-4 flex flex-col transition-colors duration-300 ${isActive ? "bg-[#D52029]" : "bg-white"}`}>
                  <h3 className={`text-base sm:text-lg font-bold leading-snug transition-colors duration-300 ${isActive ? "text-white" : "text-[#414143]"}`}>
                    {prog.title}
                  </h3>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                    <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                      {prog.description || "GATD delivers world-class expertise in this area to help your organisation grow and succeed."}
                    </p>
                  </div>
                </div>
              </>
            );

            return safeHref ? (
              <Link key={prog.id} href={safeHref} className={cardClass} style={cardStyle} {...hover}>
                {inner}
              </Link>
            ) : (
              <div key={prog.id} className={cardClass} style={cardStyle} {...hover}>
                {inner}
              </div>
            );
          })}
        </div>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
