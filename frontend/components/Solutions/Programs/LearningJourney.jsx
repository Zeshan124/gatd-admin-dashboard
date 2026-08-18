"use client";

const defaultDays = [
  {
    label: "DAY 1",
    pillars: [
      { title: "Leadership Execution", description: "Aligns leadership vision and people skills with managerial planning and control to turn strategy into measurable results", footer: "The People Balance" },
      { title: "Managerial Maturity", description: "Defines management capabilities across levels, showing how responsibilities and skills evolve as leaders grow within an organization", footer: "Managers are Important" },
      { title: "Decision Clarity", description: "Clarifies stay-or-exit decisions, concentrates on the vital few priorities, and recognizes peripherals rising in strategic importance", footer: "The demands of the LED" },
      { title: "Workplace Excellence", description: "Drives talent attraction and engagement through key initiatives while monitoring results for continuous improvement", footer: "Employers of the Choice" },
    ],
  },
  {
    label: "DAY 2",
    pillars: [
      { title: "Survey Insights", description: "Analyzes survey data to inform actionable steps that enhance performance and engagement", footer: "The Engaged Leader & Manager" },
      { title: "Strategy Blueprint", description: "Builds clear strategic intent using frameworks like BCG, Porter, and PESTEL, translating them into actionable plans, KPIs, and deliverables", footer: "The Strategic Leader" },
      { title: "Channel Strategy", description: "Identifies optimal internal and external channels while focusing on key factors driving progress", footer: "The Talent Challenge" },
      { title: "Case Insights", description: "Examines leadership approaches, strategic moves, rebranding efforts, and crisis responses across notable companies", footer: "Learning from the Negative" },
    ],
  },
  {
    label: "DAY 3",
    pillars: [
      { title: "Leadership Examples", description: "Showcases diverse leadership styles and philosophies from iconic global figures and organizations", footer: "Learning from the Positive" },
      { title: "Stakeholder Roles", description: "Highlights the involvement and impact of AI, consultants, participants, and trainers in driving initiatives", footer: "Predictive Analytics Future L & M Challengers" },
      { title: "Insight Sources", description: "Aggregates information from surveys, platforms like Glassdoor, and analysts or media to provide comprehensive overview", footer: "A Data Driven World" },
      { title: "Success Factors", description: "Highlights essential success elements, reviews business and people strategies, and provides actionable implementation takeaways", footer: "Final thoughts" },
    ],
  },
];

function Pillar({ number, pillar }) {
  return (
    <div className="flex flex-col items-center h-full">
      {/* Composite capsule */}
      <div className="relative w-full pt-7 flex-1 flex">
        {/* Number badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full bg-white ring-4 ring-[#D52029] flex items-center justify-center text-[#D52029] font-black text-lg shadow-md">
          {number}
        </div>

        {/* Capsule (white title + dark description) */}
        <div className="rounded-[2rem] overflow-hidden shadow-lg shadow-slate-300/40 flex flex-col w-full">
          {/* White title area */}
          <div className="bg-white px-4 pt-10 pb-4 text-center">
            <h4 className="text-[#D52029] font-bold text-base leading-snug">{pillar.title}</h4>
          </div>
          {/* Dark description area */}
          <div className="flex-1 px-4 py-5 text-center" style={{ background: "linear-gradient(160deg, #3a3a3a 0%, #2c2c2c 60%, #1e1e1e 100%)" }}>
            <p className="text-white/85 text-xs leading-relaxed">{pillar.description}</p>
          </div>
        </div>
      </div>

      {/* Down arrow */}
      <div className="mx-auto mt-0 w-0 h-0" style={{ borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "12px solid #D52029" }} />

      {/* Footer label */}
      <p className="text-[#D52029] font-bold text-sm text-center mt-3 leading-snug px-1">{pillar.footer}</p>
    </div>
  );
}

export default function LearningJourney({
  heading = "The 3-Day Learning Journey",
  badge = "3 Days",
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
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#414143] leading-tight mb-4">
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-px w-8 bg-linear-to-r from-transparent to-[#D52029]" />
            <div className="h-2 w-2 rounded-full bg-[#D52029]" />
            <div className="h-px w-20 bg-linear-to-r from-[#D52029] to-transparent" />
          </div>
        </div>

        {/* Day sections */}
        <div className="flex flex-col gap-14">
          {dayList.map((day, di) => (
            <div key={di}>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-10 tracking-wide">
                {day.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
                {day.pillars.map((pillar, pi) => (
                  <Pillar key={pi} number={pi + 1} pillar={pillar} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
