"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProgramOverview({
  title,
  description,
  image,
}) {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Content — first in DOM so it renders above image on mobile */}
          <div className="order-1 lg:order-0">
            {/* Badge */}
            <span className="inline-block px-4 py-2 text-sm font-semibold text-slate-800 bg-[#E8E8E8] rounded-lg mb-5">
             Programme Overview
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] mb-6 leading-tight whitespace-pre-line">
              {title}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-8">
              {description}
            </p>

            {/* CTA */}
            {/* <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore More
            </Link> */}
          </div>

          {/* Image — second in DOM, so it appears below content on mobile */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg aspect-4/3 order-2 lg:order-0">
            <Image
              src={image}
              alt="Programme Overview"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}