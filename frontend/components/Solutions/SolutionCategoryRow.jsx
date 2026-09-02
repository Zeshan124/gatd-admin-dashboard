"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Only allow same-site relative paths (/…) or http(s) absolute URLs as a card link
// — never javascript:/data: etc. (defence-in-depth; also validated server-side).
const SAFE_LINK_RE = /^(https?:\/\/|\/(?!\/))/i;

export default function SolutionCategoryRow({ title, items }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".sol-card");
    const width = (card?.offsetWidth || 280) + 16;
    scrollRef.current.scrollBy({ left: dir === "left" ? -width : width, behavior: "smooth" });
  };

  return (
    <div className="mb-12 sm:mb-16">
      {/* Row header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#414143] leading-tight">
          {title}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Cards strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => {
          const cardInner = (
            <>
              {/* Image */}
              <div className="relative w-full overflow-hidden bg-slate-200" style={{ height: "270px" }}>
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Rating badge */}
                {item.rating != null && (
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-[#414143] leading-none">
                      {Number(item.rating).toFixed(1)}
                    </span>
                    {item.reviews != null && (
                      <span className="text-[11px] font-medium text-slate-400 leading-none">
                        ({item.reviews})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Title label */}
              <div className="px-5 py-4 flex-1 bg-white border border-slate-100 group-hover:bg-[#D52029] transition-colors duration-300">
                <h3 className="text-base sm:text-lg font-bold leading-snug text-[#414143] group-hover:text-white transition-colors duration-300">
                  {item.title}
                </h3>
              </div>
            </>
          );

          const cardStyle = { width: "clamp(220px, calc(25vw - 28px), 300px)", scrollSnapAlign: "start" };
          const safeHref = item.href && SAFE_LINK_RE.test(item.href) ? item.href : null;

          // Admin-controlled: a card links out only when it has a safe href.
          return safeHref ? (
            <Link
              key={item.id}
              href={safeHref}
              className="sol-card shrink-0 rounded-2xl overflow-hidden flex flex-col group"
              style={cardStyle}
            >
              {cardInner}
            </Link>
          ) : (
            <div
              key={item.id}
              className="sol-card shrink-0 rounded-2xl overflow-hidden flex flex-col group cursor-default"
              style={cardStyle}
            >
              {cardInner}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
