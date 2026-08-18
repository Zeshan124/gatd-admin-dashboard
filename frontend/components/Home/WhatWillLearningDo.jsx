"use client";

import Image from "next/image";
import Link from "next/link";

const images = [
  {
    src: "/images/home/trainer.jpg",
    alt: "Trainer presenting",
    aspect: "aspect-4/3",
  },
  {
    src: "/images/home/conference.jpg",
    alt: "Conference audience",
    aspect: "aspect-4/3",
  },
  { src: "/images/home/presenter.jpg", alt: "Presenter", aspect: "aspect-3/4" },
  { src: "/images/home/meeting.jpg", alt: "Meeting", aspect: "aspect-3/4" },
  {
    src: "/images/home/classroom.jpg",
    alt: "Team in classroom",
    aspect: "aspect-4/3",
  },
];

export default function WhatWillLearningDo() {
  return (
    <section className="bg-[#F8F9FA] py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* ── Mobile / Tablet layout (< lg) ── */}
      <div className="lg:hidden mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center gap-8">
        {/* Top image row */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {images.slice(0, 2).map((img) => (
            <div
              key={img.src}
              className={`relative w-full ${img.aspect} rounded-2xl overflow-hidden shadow-md`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Center text */}
        <div className="text-center px-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#414143] leading-tight mb-4">
            What Will Learning Do For Our Organization?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout.
          </p>
          <Link
            href="/request-demo"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Request a Demo
          </Link>
        </div>

        {/* Bottom image row */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
          {images.slice(2).map((img) => (
            <div
              key={img.src}
              className={`relative w-full aspect-square rounded-2xl overflow-hidden shadow-md`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop layout (>= lg) — scattered absolute images ── */}
      <div className="hidden lg:block">
        <div
          className="relative mx-auto px-12 xl:px-24"
          style={{ minHeight: "680px" }}
        >
          {/* TOP LEFT */}
          <div className="absolute top-0 left-16 xl:left-24 z-10">
            <div className="w-52 lg:w-60 aspect-4/3 rounded-2xl overflow-hidden shadow-lg relative">
              <Image
                src="/images/home/trainer.jpg"
                alt="Trainer presenting"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* TOP RIGHT */}
          <div className="absolute top-0 right-16 xl:right-24 z-10">
            <div className="w-52 lg:w-60 aspect-4/3 rounded-2xl overflow-hidden shadow-lg relative">
              <Image
                src="/images/home/conference.jpg"
                alt="Conference audience"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* LEFT BACK */}
          <div className="absolute top-1/2 -translate-y-1/4 left-8 xl:left-16 z-10">
            <div className="w-44 md:w-48 aspect-3/4 rounded-2xl overflow-hidden shadow-md relative">
              <Image
                src="/images/home/presenter.jpg"
                alt="Presenter"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* LEFT FRONT */}
          <div className="absolute top-1/2 translate-y-4 left-44 xl:left-52 z-20">
            <div className="w-44 md:w-48 aspect-3/4 rounded-2xl overflow-hidden shadow-xl relative">
              <Image
                src="/images/home/meeting.jpg"
                alt="Meeting"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="absolute top-1/2 -translate-y-1/4 right-6 xl:right-14 z-10">
            <div className="w-40 md:w-44 aspect-square rounded-2xl overflow-hidden shadow-md relative">
              <Image
                src="/images/home/puzzle.jpg"
                alt="Puzzle pieces collaboration"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* BOTTOM RIGHT */}
          <div className="absolute bottom-0 right-16 xl:right-24 z-20">
            <div className="w-56 lg:w-64 aspect-4/3 rounded-2xl overflow-hidden shadow-xl relative">
              <Image
                src="/images/home/classroom.jpg"
                alt="Team in classroom"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-30 flex flex-col items-center justify-center text-center px-4 pt-44 pb-44">
            <h2 className="text-5xl lg:text-6xl font-bold text-[#414143] leading-tight mb-5 max-w-2xl">
              What Will Learning Do For Our Organization?
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-md">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>
            <Link
              // href="/request-demo"
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#D52029] hover:bg-red-700 text-white text-sm sm:text-base font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
