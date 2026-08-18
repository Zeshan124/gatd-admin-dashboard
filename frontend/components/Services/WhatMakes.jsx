"use client";

import Image from "next/image";

export default function WhatMakes() {
  return (
    <section className="bg-white py-8 sm:py-12 md:py-14">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Content */}
          <div>
            {/* Badge */}
            <span className="inline-block px-4 py-2 text-sm font-semibold text-slate-800 bg-[#E8E8E8] rounded-lg mb-5">
              What Makes
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] mb-6 leading-tight">
              GATD Different?
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
              The highly tailored and industry-leading training programs of GATD are aligned with the emerging trends, current market demands, and the switching needs of the businesses.
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
              Expert-led training combining in-person, virtual, and hands-on learning. Proven to boost skills, productivity, and business impact with continuous support and mentoring throughout the journey.
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Our mission is straightforward: to assist in keeping individuals and organizations ahead, making them stronger, and ensuring lasting success.
            </p>
          </div>

          {/* Right — Training Cycle Image */}
          <div className="relative w-full flex items-center justify-center">
            <Image
              src="/images/services/training-cycle.png"
              alt="GATD Training Cycle"
              width={600}
              height={560}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
