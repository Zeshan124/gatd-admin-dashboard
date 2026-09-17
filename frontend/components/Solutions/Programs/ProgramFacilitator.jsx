"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const defaultFacilitator = {
  name: "Prof. Dr. Joel Farnworth",
  role: "Dean of Business and Management Studies, EIU-Paris",
  image: "/images/solutions/strategic-hr/Dr_Joel.png",
  bg: "/images/solutions/strategic-hr/program_facilitator_BG.png",
  expertise: [
    "Human Resource Management",
    "Leadership Development",
    "Managerial Skills Development",
    "Corporate Strategy Creation and Implementation",
    "Performance Management",
    "Strategic HRM",
  ],
  biography: [
    "Coach and Consultant",
    "Strategic HR Management",
    "Impactive Leadership",
    "Creating and Implementing Corporate Strategy",
    "Senior Management Advisor",
  ],
};

export default function ProgramFacilitator({ facilitator }) {
  // Accept a single facilitator object, an array, or { facilitators: [...] }.
  const list = Array.isArray(facilitator)
    ? facilitator
    : Array.isArray(facilitator?.facilitators)
    ? facilitator.facilitators
    : facilitator
    ? [facilitator]
    : [defaultFacilitator];

  const [index, setIndex] = useState(0);
  const cur = Math.min(index, list.length - 1);
  const active = list[cur] || defaultFacilitator;
  const multiple = list.length > 1;
  const go = (dir) => setIndex((i) => (i + dir + list.length) % list.length);

  const {
    name,
    role,
    image = defaultFacilitator.image,
    bg = defaultFacilitator.bg,
    expertise = [],
    biography = [],
  } = active;

  return (
    <section className="relative overflow-hidden py-0">

      {/* Background image */}
      <Image
        src={bg}
        alt=""
        fill
        className="object-cover object-center"
        priority
      />

      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end [&>*]:order-none">

          {/* Left — Professor Image (order-2 on mobile so content shows first) */}
          <div className="relative flex items-center justify-center py-10 lg:py-16 order-2 lg:order-1">
            <div className="relative flex items-center justify-center">
              <Image
                key={image}
                src={image}
                alt={name || "Facilitator"}
                width={600}
                height={560}
                className="object-contain w-auto max-h-[460px] sm:max-h-[540px]"
                priority
              />
            </div>
          </div>

          {/* Right — Content (order-1 on mobile so it shows first) */}
          <div className="py-10 sm:py-14 lg:py-16 pl-0 lg:pl-8 order-1 lg:order-2">
            {/* Title + navigation (nav shown only when there's more than one) */}
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Program Facilitator{multiple ? "s" : ""}
              </h2>
              {multiple && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous facilitator"
                    className="w-10 h-10 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-[#D52029] transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next facilitator"
                    className="w-10 h-10 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-[#D52029] transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Name + role (shown when there are multiple so you know who's displayed) */}
            {multiple && (name || role) && (
              <div className="mb-8">
                {name && <p className="text-xl sm:text-2xl font-bold text-white">{name}</p>}
                {role && <p className="text-sm sm:text-base text-white/80 mt-1">{role}</p>}
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mt-2">
                  {cur + 1} / {list.length} Facilitators
                </p>
              </div>
            )}

            {/* Area of Expertise */}
            {expertise.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider mb-4">
                  Area of Expertise
                </h4>
                <ul className="space-y-2">
                  {expertise.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-white flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Biography */}
            {biography.length > 0 && (
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider mb-4">
                  Biography
                </h4>
                <ul className="space-y-2">
                  {biography.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-white flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
