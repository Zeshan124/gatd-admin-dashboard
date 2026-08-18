"use client";

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { color: "dark", title: "Execution Alignment", description: "End-to-end performance management that links strategy to delivery by addressing challenges and strengthening performance connections" },
      { color: "red", title: "Growth Enablement", description: "Development management aligned with talent management to build an inclusive, opportunity-rich culture that strengthens employer-of-choice appeal" },
    ],
  },
  {
    label: "DAY 2",
    sessions: [
      { color: "dark", title: "Reward Strategy", description: "Market-aligned rewards using differentiated POT principles, supported by targeted initiatives to drive fairness, motivation, and performance" },
      { color: "red", title: "People Impact", description: "Measures how engagement and implementation influence employer-of-choice strength, stay-or-go decisions, and key personal and organisational takeaways" },
    ],
  },
];

function Hexagon({ color, number, numberPos }) {
  const isRed = color === "red";
  return (
    <div className="relative flex items-center justify-center w-36 h-40 sm:w-44 sm:h-48 shrink-0">
      {/* Hexagon body */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          clipPath: HEX_CLIP,
          background: isRed
            ? "linear-gradient(160deg, #e11f28 0%, #D52029 55%, #b01c23 100%)"
            : "linear-gradient(160deg, #3f3f3f 0%, #2c2c2c 55%, #1a1a1a 100%)",
        }}
      >
        <span className="text-white font-black text-lg sm:text-xl tracking-wide">SESSION</span>
      </div>

      {/* Number badge on the vertex */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${numberPos === "top" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"} w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base ring-4 ring-white shadow-lg`}
        style={{ background: isRed ? "#D52029" : "#2c2c2c" }}
      >
        {number}
      </div>
    </div>
  );
}

function Content({ title, description }) {
  return (
    <div className="text-center px-1">
      <h4 className="text-base sm:text-lg font-bold text-[#D52029] leading-snug mb-2">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function DayHex({ day }) {
  const [s1, s2] = day.sessions;
  return (
    <div className="flex flex-col">
      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-10 tracking-wide">
        {day.label}
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Left column — Session 1 hexagon on top, content below */}
        <div className="flex flex-col items-center gap-5">
          <Hexagon color={s1.color} number={1} numberPos="top" />
          <Content title={s1.title} description={s1.description} />
        </div>

        {/* Right column — content on top, Session 2 hexagon below */}
        <div className="flex flex-col items-center gap-5 pt-10">
          <Content title={s2.title} description={s2.description} />
          <Hexagon color={s2.color} number={2} numberPos="bottom" />
        </div>
      </div>
    </div>
  );
}

export default function PerformanceHexagons({
  heading = "2 Days of Performance Engineering",
  badge = "2 Days",
  days,
}) {
  const dayList = days || defaultDays;

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(to bottom, #f5f5f5 0%, #ececec 100%)" }}>
      {/* Background decoration */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#D52029]/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-bold text-[#D52029] bg-[#D52029]/10 border border-[#D52029]/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[#D52029] opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-[#D52029]" />
            </span>
            {badge}
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#414143] leading-tight mb-4">
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-px w-8 bg-linear-to-r from-transparent to-[#D52029]" />
            <div className="h-2 w-2 rounded-full bg-[#D52029]" />
            <div className="h-px w-8 bg-linear-to-r from-[#D52029] to-transparent" />
          </div>
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {dayList.map((day, di) => (
            <DayHex key={di} day={day} />
          ))}
        </div>

      </div>
    </section>
  );
}
