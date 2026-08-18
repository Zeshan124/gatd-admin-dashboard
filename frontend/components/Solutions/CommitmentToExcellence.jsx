"use client";

import Image from "next/image";

export default function CommitmentToExcellence({ mapImage = "/images/solutions/strategic-hr/map.jpg" }) {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-16">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] text-center mb-10 sm:mb-14 leading-tight">
          Commitment to Excellence
        </h2>

        {/* Map image */}
        <div className="relative w-full mx-auto">
          <Image
            src={mapImage}
            alt="GATD global presence — Commitment to Excellence"
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
