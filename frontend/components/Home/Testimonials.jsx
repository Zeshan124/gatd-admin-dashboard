"use client";

import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    quote:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    name: "Mr. John Smith",
    designation: "Designation here",
    personImage: "/images/home/person-1.svg",
  },
  {
    id: 2,
    quote:
      "GATD transformed our team's leadership capabilities completely. The customized training programs were exactly what we needed to bridge the gap between strategy and execution across our organisation.",
    name: "Ms. Sarah Johnson",
    designation: "CEO, TechCorp International",
    personImage: "/images/home/person-1.svg",
  },
  {
    id: 3,
    quote:
      "The quality of facilitation and the depth of industry knowledge demonstrated by GATD trainers is unmatched. Our professionals came back energised and equipped with actionable skills.",
    name: "Dr. Ahmed Al-Rashid",
    designation: "Director of Learning, Gulf Enterprises",
    personImage: "/images/home/person-1.svg",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] text-center mb-10 sm:mb-14">
          What People Say About Us
        </h2>

        {/* Testimonial Card */}
        <div className="max-w-3xl mx-auto">

          {/* Overlapping Avatars */}
          <div className="flex justify-center mb-8">
            <div className="relative flex items-center">
              {/* GATD Logo Circle — behind */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-800 z-0">
                <Image
                  src="/images/home/gatd.svg"
                  alt="GATD Logo"
                  fill
                  className="object-contain p-3"
                />
              </div>

              {/* Person Photo — overlaps to the right */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg -ml-6 z-10">
                <Image
                  src={t.personImage}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quote Block */}
          <div className="relative text-center px-4 sm:px-8 mb-8">
            {/* Opening quote mark */}
            <span className="absolute -top-2 left-0 sm:left-4 text-7xl sm:text-8xl text-slate-200 font-serif leading-none select-none">
              "
            </span>

            {/* Quote text */}
            <p className="relative z-10 text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed text-center px-6">
              {t.quote}
            </p>

            {/* Closing quote mark */}
            <span className="absolute -bottom-6 right-0 sm:right-4 text-7xl sm:text-8xl text-slate-200 font-serif leading-none select-none">
              "
            </span>
          </div>

          {/* Name & Designation */}
          <div className="text-center mt-10 mb-10">
            <p className="text-lg sm:text-xl font-bold text-[#414143]">{t.name}</p>
            <p className="text-sm sm:text-base text-slate-500 mt-1">{t.designation}</p>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? "w-6 h-2.5 bg-red-600"
                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="w-full h-px bg-slate-200 mt-4" />

      </div>
    </section>
  );
}