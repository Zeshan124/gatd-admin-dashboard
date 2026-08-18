"use client";

import Image from "next/image";
import Link from "next/link";

export default function WhoWeAre() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Image */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
            <Image
              src="/images/home/who-we-are.jpg"
              alt="GATD team collaborating"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right — Content */}
          <div>
            {/* Badge */}
            <span className="inline-block px-4 py-2 text-sm font-semibold text-slate-800 bg-[#E8E8E8] rounded-lg mb-5">
              About Us
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] mb-6 leading-tight">
              Who We Are
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-8">
              Global Association for Training & Development (GATD) is a dynamic and innovative training company dedicated to empowering individuals and organizations to unlock their full potential. With a focus on delivering high-quality, customized training programs, GATD aims to bridge the gap between skills and success. Our comprehensive training solutions cater to diverse industries, ensuring that professionals can enhance their knowledge, develop new skills, and achieve their goals.
            </p>

            {/* CTA */}
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore More
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}