"use client";

import { useState } from "react";
import Image from "next/image";

export default function SolutionsHero() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Header Row — Left: eyebrow + title | Right: description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-8 sm:mb-10">

          {/* Left */}
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
              What we provide
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
              Our Solutions
            </h2>
          </div>

          {/* Right */}
          <div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
             Global Association for Training & Development empowers leaders and
organizations through innovative training and sustainable growth solutions.
            </p>
          </div>

        </div>

        {/* Video Block */}
        <div
          className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
          style={{ height: "clamp(260px, 40vw, 500px)" }}
          onClick={() => setPlaying(true)}
        >
          {!playing ? (
            <>
              {/* Thumbnail */}
              <Image
                src="/images/solutions/banner.jpg"
                alt="Solutions video thumbnail"
                fill
                className="object-cover"
                priority
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

              {/* Red Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 group-hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            /* Video Player */
            <video
              className="w-full h-full object-cover"
              src="/videos/who-we-are.mp4"
              autoPlay
              controls
            />
          )}
        </div>

      </div>
    </section>
  );
}