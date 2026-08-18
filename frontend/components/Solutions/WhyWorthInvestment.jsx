"use client";

import Image from "next/image";

export default function WhyWorthInvestment({
  heading = "Why this Suite is Worth the Investment",
  badge = "Invest in building results that last",
  centerImage = "/images/solutions/strategic-hr/plan.jpg",
}) {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] text-center leading-tight mb-5">
          {heading}
        </h2>

        {/* Badge */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <span className="inline-block px-5 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg">
            {badge}
          </span>
        </div>

        {/* Static image */}
        <div className="w-full mx-auto">
          <Image
            src={centerImage}
            alt={heading}
            width={1000}
            height={560}
            className="object-contain w-full h-auto"
            priority
          />
        </div>

      </div>
    </section>
  );
}
