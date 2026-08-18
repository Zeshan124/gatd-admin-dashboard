"use client";

import Image from "next/image";

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
  const {
    name,
    role,
    image,
    bg,
    expertise,
    biography,
  } = facilitator || defaultFacilitator;

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
      {/* Dark overlay for text readability */}
      

      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end [&>*]:order-none">

          {/* Left — Professor Image (order-2 on mobile so content shows first) */}
          <div className="relative flex items-center justify-center py-10 lg:py-16 order-2 lg:order-1">
            {/* Professor Image — cut out, no background */}
            <div className="relative flex items-center justify-center">
              <Image
                src={image}
                alt={name}
                width={600}
                height={560}
                className="object-contain w-auto max-h-[460px] sm:max-h-[540px]"
                priority
              />
            </div>

            {/* Name Card — overlays bottom of image */}
            {/* <div className="absolute bottom-0 left-0 right-0 lg:right-auto lg:left-0 mx-4 sm:mx-6 lg:mx-0 mb-0">
              <div className="bg-white rounded-t-2xl px-6 py-5 shadow-xl w-full lg:max-w-sm">
                <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                  Prof. Dr. Joel Farnworth
                </h3>
                <p className="text-sm sm:text-base text-slate-700">
                  Dean of Business and Management Studies EIU-Paris
                </p>
              </div>
            </div> */}
          </div>

          {/* Right — Content (order-1 on mobile so it shows first) */}
          <div className="py-10 sm:py-14 lg:py-16 pl-0 lg:pl-8 order-1 lg:order-2">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 sm:mb-10">
              Program Facilitator
            </h2>

            {/* Area of Expertise */}
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

            {/* Biography */}
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
          </div>

        </div>
      </div>
    </section>
  );
}