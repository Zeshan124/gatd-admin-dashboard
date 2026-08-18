"use client";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { color: "red", title: "Values", bullets: ["Strategic intentions – the what?", "The values context – the how?", "Specific values for your firm", "Embedding and enhancement"] },
      { color: "dark", title: "Diversity", bullets: ["Original diversity emphasis", "Emergence of gender diversity", "The data – impact on success", "Diversity initiatives – on merit"] },
    ],
  },
  {
    label: "DAY 2",
    sessions: [
      { color: "red", title: "Engagement", bullets: ["Gaining willing commitment", "Engagement impact on results", "Engagement surveys", "Improvement initiatives"] },
      { color: "dark", title: "OD Metrics", bullets: ["Track and improve", "OD & business results – connections", "Internal/external data", "Takeaways – learning transfer"] },
    ],
  },
];

function Chevron() {
  return (
    <svg className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[#D52029]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function FrameworkCard({ index, session }) {
  const isRed = session.color === "red";
  return (
    <div className="group relative flex bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
      {/* Left gradient rail */}
      <div
        className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center gap-2 text-white"
        style={{
          background: isRed
            ? "linear-gradient(160deg, #ef4444 0%, #D52029 55%, #9b1c1c 100%)"
            : "linear-gradient(160deg, #3f3f3f 0%, #2c2c2c 55%, #1a1a1a 100%)",
        }}
      >
        <span className="text-2xl sm:text-3xl font-black leading-none">{String(index).padStart(2, "0")}</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-rl] rotate-180">Session</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6">
        <h4 className="text-lg font-bold text-[#414143] leading-snug mb-1.5">{session.title}</h4>
        <div className="w-10 h-0.5 bg-[#D52029] mb-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
          {session.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
              <Chevron />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function OrgDevelopmentFramework({
  heading = "2 Days of Organizational Mastery",
  badge = "2 Days",
  days,
}) {
  const dayList = days || defaultDays;

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(to bottom, #f7f7f8 0%, #ececed 100%)" }}>
      {/* Background decoration */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-[#D52029]/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-slate-200/50 blur-3xl" />
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
            <div className="h-px w-20 bg-linear-to-r from-[#D52029] to-transparent" />
          </div>
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {dayList.map((day, di) => (
            <div key={di} className="flex flex-col">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] tracking-wide">
                  {day.label}
                </h3>
                <div className="flex-1 h-px bg-linear-to-r from-[#D52029]/40 to-transparent" />
              </div>

              {/* Session cards */}
              <div className="flex flex-col gap-5">
                {day.sessions.map((session, si) => (
                  <FrameworkCard key={si} index={si + 1} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
