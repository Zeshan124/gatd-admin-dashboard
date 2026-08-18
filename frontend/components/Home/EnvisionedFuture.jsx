"use client";

import Image from "next/image";
import Link from "next/link";

export default function EnvisionedFuture() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Outer Card — full background image */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200" style={{ minHeight: "340px" }}>

          {/* Background Image — fills entire card */}
          <Image
            src="/images/home/envisioned-future.png"
            alt="Team discussion - Envisioned Future"
            fill
            className="object-cover object-center"
            priority
          />

          {/* White Content Panel — overlaid on left using z-index */}
          <div className="relative z-10 w-full lg:w-1/2 bg-white m-4 sm:m-6 md:m-8 rounded-2xl px-7 sm:px-9 md:px-10 py-9 sm:py-11 md:py-12 flex flex-col justify-center shadow-sm">

            {/* Badge */}
            <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-5">
              Our Vision
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] mb-5 leading-tight">
              Envisioned Future
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              To be a global leader in executive education and corporate
              training, transforming lives and organisations through industry-
              relevant learning solutions. GATD empowers professionals and
              businesses with the skills and expertise to excel, driving growth,
              success, and a positive impact on the global workforce.
            </p>

            {/* CTA */}
            <Link
              href="/about"
              className="inline-flex items-center justify-center self-start px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore More
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}