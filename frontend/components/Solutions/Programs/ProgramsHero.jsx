"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import BrochureModal from "./BrochureModal";
import VideoAccessModal from "./VideoAccessModal";

export default function ProgramsHero({ program }) {
  const {
    eyebrow = "Our Programs",
    title,
    description,
    banner,
    bannerAlt,
    brochure,
    videoUrl,
    rating,
    reviews,
    ratingEnabled,
    heroLogos,
    brochureButtonText,
    registerButtonText,
    videoButtonText,
  } = program;

  // Admin-editable CTA labels (Admin → Subprograms); fall back to defaults when blank.
  const brochureLabel = brochureButtonText?.trim() || "Download Brochure";
  const registerLabel = registerButtonText?.trim() || "Register Now";
  const videoLabel = videoButtonText?.trim() || "Watch Programme Video";

  const logos = Array.isArray(heroLogos) ? heroLogos.filter((l) => l && l.logo) : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-12 border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Eyebrow */}
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#414143] uppercase mb-4">
          {eyebrow}
        </p>

        {/* Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-10 sm:mb-12">
          {/* Left — Title + Rating */}
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-[#414143] leading-tight">
              {title}
            </h1>

            {/* Logos — managed per-program in Admin → Subprograms. Hidden when none. */}
            {logos.length > 0 && (
              <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                {logos.map((l, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={l.logo}
                    alt={l.name || ""}
                    className="object-contain h-10 sm:h-12 w-auto"
                  />
                ))}
              </div>
            )}

            {/* Rating */}
            {rating != null && ratingEnabled !== false && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-[#D52029] leading-none">
                  {Number(rating).toFixed(1)}
                </span>

                {/* Stars with fractional fill */}
                <div className="relative inline-flex">
                  <div className="flex gap-0.5 text-slate-300">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <div
                    className="absolute inset-0 flex gap-0.5 text-amber-400 overflow-hidden"
                    style={{ width: `${(Number(rating) / 5) * 100}%` }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current shrink-0" />
                    ))}
                  </div>
                </div>

                {reviews != null && (
                  <span className="text-sm font-medium text-slate-500">
                    ({reviews.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right — Description + CTA */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Download button — opens modal */}
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                  </svg>
                </span>
                {brochureLabel}
              </button>
              <a
                href="#registration"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#414143] text-[#414143] hover:bg-[#414143] hover:text-white text-sm font-bold rounded-lg transition-all duration-200"
              >
                {registerLabel}
              </a>

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
                    {videoLabel}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner Image */}
        {banner && (
          <div className="relative w-full rounded-2xl overflow-hidden mb-12 sm:mb-4" style={{ height: "clamp(240px, 38vw, 500px)" }}>
            <Image
              src={banner}
              alt={bannerAlt || title}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        )}

      </div>

      {/* Brochure Modal */}
      <BrochureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        brochure={brochure}
        itemSlug={program?.slug || null}
        itemTitle={title || null}
      />

      {/* Gated Video Modal */}
      <VideoAccessModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={videoUrl}
        itemSlug={program?.slug || null}
        itemTitle={title || null}
      />
    </section>
  );
}
