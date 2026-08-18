"use client";

import Image from "next/image";

export default function SolutionsIntro() {
  return (
    <section className="bg-white py-4 sm:py-6 md:py-8">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 flex flex-col items-center">

        {/* Collage Image */}
        <div className="w-full max-w-3xl mx-auto mb-10 sm:mb-12">
          <Image
            src="/images/solutions/intro-collage.jpg"
            alt="Solutions collage — handshake, lightbulb, charts, global team"
            width={720}
            height={480}
            className="object-contain w-full h-auto"
            priority
          />
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-center">
          GATD offers a diverse range of leadership and organizational development solutions designed to drive measurable impact. Each initiative blends global expertise with practical application to further empower leaders to innovate, collaborate, and transform performance at every level. Whether developing individual capabilities or advancing organizational excellence, GATD's integrated solutions help out clients to achieve sustainable growth and global competitiveness.
        </p>

      </div>
    </section>
  );
}
