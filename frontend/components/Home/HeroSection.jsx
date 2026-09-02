"use client";

import { useState } from "react";
import Image from "next/image";

const partners = [
  {
    name: "Jaipuria Institute of Management",
    logo: "/images/home/partner-1.png",
  },
  { name: "JEET", logo: "/images/home/partner-2.png" },
  { name: "AACSB Accredited", logo: "/images/home/partner-3.png" },
];

export default function GATDHero() {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <section className="bg-white pt-10 sm:pt-14 md:pt-16 pb-0 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        {/* ── Top Row: Left content + Right text/buttons ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-10 sm:mb-12">
          {/* Left Column */}
          <div>
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Global Association for Training and Development
            </p>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[#414143] leading-[1.1] mb-8">
              Aspire Higher and be
              <br />
              Inspired to Achieve
            </h1>

            {/* Hero video — mobile/tablet only: directly below the heading */}
            <div
              className="lg:hidden relative w-full rounded-xl overflow-hidden shadow-xl mb-8"
              style={{ height: "clamp(200px, 56vw, 360px)" }}
            >
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/video/video-bg.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video Preview Button */}
            <button
              onClick={() => setVideoPlaying(true)}
              className="flex items-center gap-4 group"
            >
              {/* Circular Play Button */}
              <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-red-100 group-hover:border-red-300 transition-all duration-300 shadow-md">
                {/* Thumbnail */}
                <Image
                  src="/images/home/video-thumbnail.jpg"
                  alt="Singapore Video Thumbnail"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-300" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 group-hover:bg-red-700 transition-all duration-300 flex items-center justify-center shadow-lg group-hover:scale-110">
                    <svg
                      className="w-4 h-4 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Video Meta */}
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">
                  Global Association For Training &amp; Development
                </p>
                <p className="text-sm font-semibold text-red-600">
                  Leadership Development Company
                </p>
                <p className="text-xs text-slate-500 mt-0.5">2:39</p>
              </div>
            </button>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-center lg:pt-8">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 max-w-md">
              We are committed to empowering individuals and organizations to
              achieve sustainable growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/solutions"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-sm font-bold rounded-md transition-all duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* ── Hero Image ──
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ height: "clamp(220px, 38vw, 520px)" }}>
          <Image
            src="/video/video-bg.mp4"
            alt="Singapore Merlion - GATD Hero"
            fill
            className="object-cover"
            priority
          />
        </div> */}
        {/* ── Hero Video (large screens ≥ lg; on mobile it renders under the heading) ── */}
        <div
          className="hidden lg:block relative w-full rounded-2xl overflow-hidden shadow-xl"
          style={{ height: "clamp(220px, 38vw, 520px)" }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/video/video-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* ── Strategic Partners ── */}
        {/* <div className="py-10 sm:py-12 border-t border-slate-100 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-1">
            // Label
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#414143]">
              Our Strategic Partners
            </h2>

            // Partner Logos
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {partners.map((partner) => (
                <div key={partner.name} className="flex-shrink-0">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={140}
                    height={56}
                    className="object-contain h-10 sm:h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>

      {/* ── Video Modal ── */}
      {videoPlaying && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVideoPlaying(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoPlaying(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src="/video/play-video.mp4"
                title="GATD Introduction"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
