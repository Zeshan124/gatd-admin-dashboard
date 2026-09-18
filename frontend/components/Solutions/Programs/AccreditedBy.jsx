"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicAccreditationApi } from "@/lib/publicApi";

const DEFAULT_HEADING = "Accredited By";
// Fallback used until the CMS settings load (or if the request fails).
const DEFAULT_LOGOS = [
  { name: "European Council for Business Education", logo: "/images/solutions/strategic-hr/1.png" },
  { name: "QS Stars Rating System - Online Learning", logo: "/images/solutions/strategic-hr/2.png" },
  { name: "ACBSP Global Business Accreditation", logo: "/images/solutions/strategic-hr/3.png" },
  { name: "ASIC Accreditation Service for International Colleges", logo: "/images/solutions/strategic-hr/4.png" },
  { name: "Business Graduates Association Member", logo: "/images/solutions/strategic-hr/5.png" },
  { name: "ATHEA", logo: "/images/solutions/strategic-hr/6.jpg" },
  { name: "Cambridge International Academics", logo: "/images/solutions/strategic-hr/7.jpg" },
];

export default function AccreditedBy({ heading: headingProp, logos: logosProp }) {
  const scrollRef = useRef(null);
  // A program can set its own heading + logos (managed in Admin → Subprograms).
  // If it doesn't, fall back to the global default (Admin → Accredited By).
  const hasOwnLogos = Array.isArray(logosProp) && logosProp.length > 0;
  const [heading, setHeading] = useState(headingProp || DEFAULT_HEADING);
  const [logos, setLogos] = useState(hasOwnLogos ? logosProp : DEFAULT_LOGOS);

  useEffect(() => {
    // This program has its own logos → use them; no global fetch needed.
    if (hasOwnLogos) {
      setHeading(headingProp || DEFAULT_HEADING);
      setLogos(logosProp);
      return;
    }
    // Otherwise use the global default (a program heading still overrides if set).
    let alive = true;
    publicAccreditationApi
      .get()
      .then((res) => {
        if (!alive) return;
        const d = res?.data || {};
        setHeading(headingProp || d.heading || DEFAULT_HEADING);
        if (Array.isArray(d.logos) && d.logos.length) setLogos(d.logos);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hasOwnLogos, headingProp, logosProp]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -250 : 250, behavior: "smooth" });
  };

  if (!logos.length) return null;

  return (
    <section className="bg-white py-12 sm:py-16 border-t border-slate-100">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143]">
            {heading}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logos Slider */}
        <div
          ref={scrollRef}
          className="flex items-center gap-10 sm:gap-14 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
          {logos.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center h-20 sm:h-24"
              style={{ minWidth: "190px" }}
            >
              {item.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo}
                  alt={item.name || ""}
                  className="object-contain max-h-16 sm:max-h-20 w-auto transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
