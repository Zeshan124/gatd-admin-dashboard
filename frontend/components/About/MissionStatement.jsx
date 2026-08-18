"use client";

import Image from "next/image";

export default function MissionStatement() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Outer Card */}
        <div
          className="relative flex items-center justify-end rounded-3xl overflow-hidden border-2 border-slate-200"
          style={{ minHeight: "420px" }}
        >
          {/* Background Image */}
          <Image
            src="/images/about/mission-statement-bg.jpg"
            alt="Singapore Merlion - Mission Statement"
            fill
            className="object-cover object-center"
            priority
          />

          {/* White Content Panel */}
          <div className="relative z-10 w-full lg:w-1/2 bg-white m-4 sm:m-6 md:m-8 rounded-2xl px-7 sm:px-9 md:px-10 py-9 sm:py-11 md:py-12 flex flex-col justify-center shadow-sm">
            {/* Badge */}
            <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg mb-5">
              Commitment
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] mb-6 leading-tight">
              Mission Statement
            </h2>

            {/* Paragraphs */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              At the Global Association for Training & Development (GATD), our
              mission is to empower individuals and organisations through
              transformative learning experiences.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              We deliver customised executive education, leadership development
              programmes, and talent management solutions designed to foster
              continuous learning, measurable impact, and long-term success.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              With our expert facilitators, flexible learning formats, and
              industry-focused approach, we partner with clients to build
              leadership capability, enhance performance, and prepare
              future-ready leaders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}