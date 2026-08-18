"use client";

import Image from "next/image";
import Link from "next/link";

export default function MissionStatement() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">

      {/* Background image */}
      <Image
        src="/images/home/bg.jpg"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />

      {/* Red overlay */}
      <div className="absolute inset-0 bg-[#D52029]/85" />

      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          {/* Left — Image */}
          <div className="relative w-full  mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: "clamp(280px, 32vw, 440px)" }}>
            <Image
              src="/images/home/mission-vision.jpg"
              alt="Mission Statement"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* Right — Content */}
          <div>
            {/* Badge */}
            <span className="inline-block px-5 py-2 text-sm font-semibold text-[#414143] bg-white rounded-lg mb-6 shadow-sm">
              Commitment
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Mission Statement
            </h2>

            {/* Body paragraphs */}
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">
              At the Global Association for Training & Development (GATD), our mission is to empower individuals and organisations through transformative learning experiences.
            </p>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">
              We deliver customised executive education, leadership development programmes, and talent management solutions designed to foster continuous learning, measurable impact, and long-term success.
            </p>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-8">
              With our expert facilitators, flexible learning formats, and industry-focused approach, we partner with clients to build leadership capability, enhance performance, and prepare future-ready leaders.
            </p>

            {/* CTA */}
           <Link
  href="/about"
  className="inline-flex items-center justify-center px-6 py-3 hover:bg-slate-100 text-[#FFFFFF] hover:text-[#414143] text-sm font-bold rounded-md border border-[#FFFFFF] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
>
  Explore More
</Link>
          </div>

        </div>
      </div>
    </section>
  );
}
