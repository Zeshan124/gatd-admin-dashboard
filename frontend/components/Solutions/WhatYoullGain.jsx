"use client";

import Image from "next/image";

const defaultGains = [
  {
    id: 1,
    icon: (
      <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="14" r="6" stroke="#D52029" strokeWidth="2" />
        <circle cx="12" cy="32" r="5" stroke="#D52029" strokeWidth="2" />
        <circle cx="44" cy="32" r="5" stroke="#D52029" strokeWidth="2" />
        <path d="M28 20v6M24 26l-10 6M32 26l10 6" stroke="#D52029" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 42c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#D52029" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M38 42c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#D52029" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    text: "Develop deep expertise in all key areas of human resources and management across modern business environments",
  },
  {
    id: 2,
    icon: (
      <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="24" r="14" stroke="#F59E0B" strokeWidth="2" />
        <path d="M14 20c2-8 14-12 20-6M38 28c-2 8-14 12-20 6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 10v28M12 24h28" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="42" cy="40" r="8" stroke="#F59E0B" strokeWidth="2" fill="white" />
        <path d="M39 40l2 2 4-4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: "Earn EIU-Paris and GATD accreditation, recognized worldwide, and connect with top-tier professional network",
  },
  {
    id: 3,
    icon: (
      <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 40l10-14 10 8 10-18 8-8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 10h8v8" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 44h36" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    text: "Learn practical frameworks & strategies to help you turn your team's talent into real business growth you can measure",
  },
  {
    id: 4,
    icon: (
      <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="26" r="10" stroke="#10B981" strokeWidth="2" />
        <path d="M28 16v20M20 24l4 4 8-8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 14l3-3M41 11l2-2M43 16l3-1M44 22l3 1" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 36v6M22 44h12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    text: "Build the leadership skills you need to succeed confidently in the modern executive boardroom environment",
  },
  {
    id: 5,
    icon: (
      <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="26" r="8" stroke="#3B82F6" strokeWidth="2" />
        <path d="M30 18v16M22 26h16" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 38c-2-2-4-6-2-10M16 28c-4 0-6 4-4 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <path d="M44 30c3 2 4 6 2 10M42 40c4 0 6-4 4-8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="42" r="3" stroke="#3B82F6" strokeWidth="2" />
        <path d="M22 40l4-6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    text: "Apply advanced tools to help your team work more efficiently and deliver consistently high-performance results",
  },
];

export default function WhatYoullGain({ heading, gains }) {
  const items = gains || defaultGains;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-18">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-12 sm:mb-16">
          {heading || "What You'll Gain From This Certification Suite"}
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
