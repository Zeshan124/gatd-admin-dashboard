"use client";

import Image from "next/image";

const defaultGains = [
  {
    id: 1,
    iconSrc: "/images/solutions/strategic-hr/1.svg",
    text: "Develop deep expertise in all key areas of human resources and management across modern business environments",
  },
  {
    id: 2,
    iconSrc: "/images/solutions/strategic-hr/2.svg",
    text: "Earn EIU-Paris and GATD accreditation, recognized worldwide, and connect with top-tier professional network",
  },
  {
    id: 3,
    iconSrc: "/images/solutions/strategic-hr/3.svg",
    text: "Learn practical frameworks & strategies to help you turn your team's talent into real business growth you can measure",
  },
  {
    id: 4,
    iconSrc: "/images/solutions/strategic-hr/4.svg",
    text: "Build the leadership skills you need to succeed confidently in the modern executive boardroom environment",
  },
  {
    id: 5,
    iconSrc: "/images/solutions/strategic-hr/5.svg",
    text: "Apply advanced tools to help your team work more efficiently and deliver consistently high-performance results",
  },
  {
    id: 6,
    iconSrc: "/images/solutions/strategic-hr/6.svg",
    text: "Master people-centric change management to drive sustainable organisational culture transformation",
  },
];


export default function WhatYouWillGain({ heading, gains }) {
  const items = gains || defaultGains;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-12 sm:mb-16">
          {heading || "What You'll Gain From This Certification"}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const col = idx % 3;
            const totalRows = Math.ceil(items.length / 3);
            const isLastRow = Math.floor(idx / 3) === totalRows - 1;
            const isLastCol = col === 2;
            return (
              <div
                key={item.id}
                className={[
                  "flex flex-col py-10",
                  col === 0 ? "lg:pr-10" : col === 2 ? "lg:pl-10" : "lg:px-10",
                  !isLastCol ? "lg:border-r border-slate-200" : "",
                  !isLastRow ? "border-b border-slate-200" : "",
                ].join(" ")}
              >
                {/* Icon */}
                <div className="mb-5 flex justify-center sm:justify-start">
                  {item.iconSrc ? (
                    <Image src={item.iconSrc} alt="" width={56} height={56} className="w-16 h-16 object-contain" />
                  ) : (
                    item.icon
                  )}
                </div>

                {/* Text */}
                <p className="text-sm sm:text-base font-bold text-[#414143] leading-snug text-center sm:text-left">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
