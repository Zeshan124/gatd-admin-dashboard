"use client";

import Image from "next/image";

export default function OurStory() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/about/our-story-bg.jpg"
        alt="Our Story background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Red Overlay */}
      {/* <div className="absolute inset-0 bg-red-600/80" /> */}

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-14 sm:py-16 md:py-20 text-center">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Our Story
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-white/90 leading-relaxed sm:px-16">
          Global Association for Training & Development (GATD) is a dynamic and innovative training company dedicated to empowering individuals and organizations to unlock their full potential. With a focus on delivering high-quality, customized training programs, GATD aims to bridge the gap between skills and success. Our comprehensive training solutions cater to diverse industries, ensuring that professionals can enhance their knowledge, develop new skills, and achieve their goals.
        </p>
      </div>
    </section>
  );
}