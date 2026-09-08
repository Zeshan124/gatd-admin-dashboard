"use client";

import { useState } from "react";
import Image from "next/image";
import SolutionBrochureModal from "./SolutionBrochureModal";
import VideoAccessModal from "./Programs/VideoAccessModal";

export default function SolutionHero({ solution }) {
  const {
    eyebrow = "Our Solutions",
    title,
    description,
    banner,
    bannerAlt,
    subheading,
    subtext,
    videoUrl,
  } = solution;

  const [modalOpen, setModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-16 border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Eyebrow */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#414143] uppercase mb-4">
          {eyebrow}
        </p>

        {/* Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-10 sm:mb-12">
          {/* Left — Title */}
          <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-[#414143] leading-tight">
            {title}
          </h1>

          {/* Right — Description + CTA */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                  </svg>
                </span>
                Download Programme Brochure
              </button>

              {/* Gated programme video — opens the lead form, then plays the video */}
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="inline-flex items-center gap-3 group"
                  aria-label="Watch programme video"
                >
                  <span className="relative shrink-0 w-12 h-12 rounded-full bg-[#D52029] group-hover:bg-red-700 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold text-[#414143] group-hover:text-[#D52029] transition-colors">
                    Watch Programme Video
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner Image */}
        {banner && (
          <div className="relative w-full rounded-2xl overflow-hidden mb-12 sm:mb-16" style={{ height: "clamp(240px, 38vw, 500px)" }}>
            <Image
              src={banner}
              alt={bannerAlt || title}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        )}

        {/* Bottom Centered Text Block */}
        {(subheading || subtext) && (
          <div className="text-center mx-auto">
            {subheading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] mb-5 leading-tight">
                {subheading}
              </h2>
            )}
            {subtext && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {subtext}
              </p>
            )}
          </div>
        )}

      </div>

      {/* Brochure Modal — programmes from this solution's list */}
      <SolutionBrochureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        brochure={solution.brochure}
        itemSlug={solution?.slug || null}
        itemTitle={title || null}
      />

      {/* Gated Video Modal */}
      <VideoAccessModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={videoUrl}
        itemSlug={solution?.slug || null}
        itemTitle={title || null}
      />
    </section>
  );
}
