"use client";

import Image from "next/image";

export default function EnvisionedFutureVision() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Centered Header */}
        <div className="text-center mx-auto mb-10 sm:mb-14">
          {/* Badge */}
          <span className="inline-block px-5 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-5">
            Our Vision
          </span>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] mb-5 leading-tight">
            Envisioned Future
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            To be a global leader in executive education and corporate training, transforming lives and organisations through industry-relevant learning solutions. GATD empowers professionals and businesses with the skills and expertise to excel, driving growth, success, and a positive impact on the global workforce.
          </p>
        </div>

        {/* Image with decorative blobs */}
        <div className="relative flex items-center justify-center">
          {/* Blob — left */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full bg-slate-100 opacity-80 -z-0"
            style={{ filter: "blur(2px)" }}
          />

          {/* Blob — right (pink/rose tint matching screenshot) */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/4 w-32 h-32 sm:w-44 sm:h-44 md:w-60 md:h-60 rounded-full bg-red-100 opacity-60 -z-0"
            style={{ filter: "blur(2px)" }}
          />

          {/* Main Image */}
          <div className="relative z-10 w-full max-w-3xl mx-auto">
            <Image
              src="/images/about/envisioned-future-team.jpg"
              alt="Global team around conference table"
              width={900}
              height={700}
              className="object-contain w-full h-auto"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}