"use client";

import Link from "next/link";

export default function CommitmentBanner() {
  return (
    <section className="bg-white py-10 sm:py-12 md:py-14 border-y border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">

          {/* Left — Eyebrow + Heading */}
          <div className="max-w-5xl">
            <p className="text-sm text-[#414143] font-medium mb-2">
              Global association for training and development
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#414143] leading-snug">
              We are Committed to Empowering Individuals and Organizations to Achieve Sustainable Growth.
            </h2>
          </div>

          {/* Right — CTA Button */}
          <div className="flex-shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-red-700 hover:bg-red-800 text-white text-sm sm:text-base font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
            >
              Get In Touch
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}