"use client";

import Image from "next/image";

export default function ServicesHero() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#414143] uppercase tracking-widest mb-3">
              What we do
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
              Our Services
            </h2>
          </div>
          <div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              At GATD, we deliver customised training and development solutions designed to
empower individuals and organisations to excel.
            </p>
          </div>
        </div>

        {/* Banner Image */}
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(260px, 40vw, 500px)" }}>
          <Image
            src="/images/services/hero-banner.jpg"
            alt="Contact Us"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  );
}
