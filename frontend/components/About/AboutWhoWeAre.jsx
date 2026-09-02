"use client";

import Image from "next/image";

// Clicking the "Who We Are" video opens the GATD YouTube channel.
const YOUTUBE_URL = "https://www.youtube.com/@globalatdsg";

export default function AboutWhoWeAre() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
              About Us
            </p>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
              Who We Are
            </h2>
          </div>

          <div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Global Association for Training &amp; Development empowers
              individuals and organizations through innovative, customized
              training solutions.
            </p>
          </div>
        </div>

        {/* Video thumbnail → opens the GATD YouTube channel in a new tab */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch on the GATD YouTube channel"
          className="relative block w-full rounded-2xl overflow-hidden cursor-pointer group"
          style={{ height: "clamp(260px,40vw,500px)" }}
        >
          <Image
            src="/images/about/who-we-are-video.jpeg"
            alt="Who We Are"
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:bg-red-700 group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
