"use client";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { title: "Strategic Partnership", bullets: ["HR administration to business partner", "Capabilities & structures", "Strategic advice and counsel", "Balancing business & people impact"] },
      { title: "People Strategy", bullets: ["Business strategy delivery", "Performance & development management", "Rewards management", "Talent management"] },
    ],
  },
  {
    label: "DAY 2",
    sessions: [
      { title: "People Excellence", bullets: ["Organisational development", "Employer of choice — the stay/go equation", "HR metrics and business impact", "Initiatives for improvement"] },
      { title: "Data Insights", bullets: ["The power of data", "Internal (engagement)", "External (Glassdoor)", "Takeaways – learning transfer"] },
    ],
  },
];

function CheckIcon() {
  return (
    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#D52029]/10 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-[#D52029]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-6" />
      </svg>
    </span>
  );
}

function SessionPanel({ index, session }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Top gradient accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-[#D52029] via-[#D52029]/70 to-transparent" />

      {/* Ghost watermark number */}
      <span aria-hidden className="absolute -right-2 -top-4 text-[90px] font-black leading-none select-none text-slate-900/[0.03]">
        {String(index).padStart(2, "0")}
      </span>

      <div className="relative p-6 flex gap-4">
        {/* Number tile */}
        <div className="shrink-0">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#D52029]/30" style={{ background: "linear-gradient(145deg, #ef4444 0%, #D52029 60%, #9b1c1c 100%)" }}>
            {String(index).padStart(2, "0")}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#D52029] uppercase tracking-[0.18em] mb-1">Session {index}</p>
          <h4 className="text-lg font-bold text-[#414143] leading-snug mb-1">{session.title}</h4>
          <div className="w-10 h-0.5 bg-[#D52029] mb-4" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            {session.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <CheckIcon />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PeopleStrategyPanels({
  heading = "2 Days of People Strategy Mastery",
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

              {/* Session panels */}
              <div className="flex flex-col gap-5">
                {day.sessions.map((session, si) => (
                  <SessionPanel key={si} index={si + 1} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
