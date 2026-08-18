"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const accreditors = [
  {
    id: 1,
    name: "European Council for Business Education",
    logo: "/images/solutions/strategic-hr/1.png",
  },
  {
    id: 2,
    name: "QS Stars Rating System - Online Learning",
    logo: "/images/solutions/strategic-hr/2.png",
  },
  {
    id: 3,
    name: "ACBSP Global Business Accreditation",
    logo: "/images/solutions/strategic-hr/3.png",
  },
  {
    id: 4,
    name: "ASIC Accreditation Service for International Colleges",
    logo: "/images/solutions/strategic-hr/4.png",
  },
  {
    id: 5,
    name: "Business Graduates Association Member",
    logo: "/images/solutions/strategic-hr/5.png",
  },
  {
    id: 6,
    name: "ATHEA",
    logo: "/images/solutions/strategic-hr/6.jpg",
  },
  {
    id: 7,
    name: "Cambridge International Academics",
    logo: "/images/solutions/strategic-hr/7.jpg",
  },
];

export default function AccreditedBy() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;

    container.scrollBy({
      left: direction === "left" ? -250 : 250,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-12 sm:py-16 border-t border-slate-100">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143]">
            Accredited By
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
          {accreditors.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 flex items-center justify-center h-20 sm:h-24"
              style={{ minWidth: "190px" }}
            >
              <Image
                src={item.logo}
                alt={item.name}
                width={160}
                height={80}
                className="object-contain max-h-16 sm:max-h-20 w-auto transition-transform duration-300 hover:scale-105"
              />
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