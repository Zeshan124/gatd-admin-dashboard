"use client";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { color: "red", title: "Resourcing", bullets: ["Resourcing channels", "Recruitment funnel", "Technology advancements", "CB interviewing"] },
      { color: "dark", title: "HiPo Talent", bullets: ["Finding high-potential talent", "9-box tool", "Assessment/development centres", "Talent development progress and succession"] },
    ],
  },
  {
    label: "DAY 2",
    sessions: [
      { color: "red", title: "Learning Management", bullets: ["For performance enhancement", "For development enhancement", "Specific for HiPos", "Initiatives to improve"] },
      { color: "dark", title: "Metrics", bullets: ["External – Glassdoor", "Internal – engagement surveys", "Tracking, reporting and initiatives", "Takeaways – learning transfer"] },
    ],
  },
];

function CurriculumCard({ session }) {
  const isRed = session.color === "red";
  return (
    <div
      className="relative rounded-2xl p-6 shadow-xl flex flex-col"
      style={{
        background: isRed
          ? "linear-gradient(160deg, #e11f28 0%, #D52029 55%, #b01c23 100%)"
          : "linear-gradient(160deg, #3a3a3a 0%, #2c2c2c 55%, #1a1a1a 100%)",
        boxShadow: isRed ? "0 16px 32px -12px rgba(213,32,41,0.45)" : "0 16px 32px -12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Title */}
      <h4 className="text-lg font-bold text-white leading-snug mb-3">{session.title}</h4>

      {/* Bullets */}
      <ul className="space-y-1.5">
        {session.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/90 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExecutiveCurriculum({
  heading = "The 2-Day Executive Curriculum",
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-x-12">
          {dayList.map((day, di) => (
            <div key={di} className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-8 tracking-wide">
                {day.label}
              </h3>
              {/* One session → full-width card (no empty half); two+ → side by side. */}
              <div className={`grid grid-cols-1 gap-6 ${day.sessions.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {day.sessions.map((session, si) => (
                  <CurriculumCard key={si} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
