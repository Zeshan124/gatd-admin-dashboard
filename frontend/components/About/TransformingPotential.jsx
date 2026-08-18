"use client";

const stats = [
  {
    number: "1932+",
    label: "Companies Analyzed",
    description: "Helping organizations identify growth opportunities and improve performance.",
  },
  {
    number: "21,921+",
    label: "Strategies Planned",
    description: "Delivering impactful business and leadership strategies worldwide.",
  },
  {
    number: "2501+",
    label: "Projects Released",
    description: "Successfully executing training and development initiatives across industries.",
  },
];

export default function TransformingPotential() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Top Row — Heading left | Description right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-end mb-12 sm:mb-16">
          {/* Left — Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold text-[#414143] leading-tight">
            Transforming Potential Into Performance
          </h2>

          {/* Right — Description */}
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Empowering professionals and organizations with impactful training, strategy, and development solutions.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-200 mb-12 sm:mb-16" />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              {/* Number */}
              <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#DB4149] mb-3 leading-none">
                {stat.number}
              </span>

              {/* Label */}
              <h3 className="text-lg sm:text-2xl font-bold text-[#414143] mb-3">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}