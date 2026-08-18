"use client";

import Image from "next/image";

const defaultAudience = [
  "Senior HR Leaders & Directors",
  "Aspiring C-Suite & High-Potentials",
  "Business Unit Heads & GMs",
  "L&D Specialists",
  "Executive Consultants & Advisors",
];

export default function ProgrammeSuiteFor({
  badge = "Who is This",
  heading = "Programme Suite Designed For?",
  audience,
  backgroundImage = "/images/solutions/strategic-hr/programme-suits.jpg",
}) {
  const items = audience || defaultAudience;

  return (
    <section className="bg-[#F8F9FA] py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Outer card — relative so the bg image fills it */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200" style={{ minHeight: "380px" }}>

          {/* Background image — fills entire card */}
          <Image
            src={backgroundImage}
            alt="Programme suite background"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Content grid — image left (transparent), white panel right */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[380px]">

            {/* Left — transparent, bg image shows through */}
            <div className="min-h-[220px] lg:min-h-0" />

            {/* Right — white content panel */}
            <div className="bg-white m-4 sm:m-6 md:m-8 rounded-2xl px-7 sm:px-9 md:px-10 py-9 sm:py-10 flex flex-col justify-center shadow-sm">

              {/* Badge */}
              <span className="inline-block self-start px-4 py-2 text-sm font-bold text-[#414143] bg-[#E8E8E8] rounded-lg mb-5">
                {badge}
              </span>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl font-bold text-[#414143] leading-tight mb-7">
                {heading}
              </h2>

              {/* Bullet list */}
              <ul className="space-y-4">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#D52029]" />
                    <span className="text-sm sm:text-base text-[#414143] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
