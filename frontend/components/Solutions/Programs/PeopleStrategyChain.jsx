"use client";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { title: "Strategic Partnership", bullets: ["HR administration to business partner", "Capabilities & structures", "Strategic advice and counsel — the people aspects", "Balancing business & people impact"] },
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

const DASH_LINE = "repeating-linear-gradient(to bottom,#D52029 0,#D52029 4px,transparent 4px,transparent 9px)";

function SessionCircle({ n, small }) {
  const size = small ? "w-16 h-16" : "w-32 h-32";
  const inner = small ? "w-12 h-12" : "w-24 h-24";
  return (
    <div className={`relative ${size} rounded-full flex items-center justify-center shrink-0 shadow-xl shadow-[#D52029]/30`} style={{ background: "#D52029" }}>
      <div className={`${inner} rounded-full bg-white flex items-center justify-center`}>
        <span className={`text-[#D52029] font-black text-center leading-tight ${small ? "text-[9px]" : "text-xs"}`}>
          SESSION<br />{n}
        </span>
      </div>
    </div>
  );
}

function Content({ title, bullets, align = "left" }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <h4 className="text-lg font-bold text-[#D52029] leading-snug mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className={`flex items-start gap-2 text-xs text-slate-600 leading-relaxed ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D52029] shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayChain({ day }) {
  const [s1, s2] = day.sessions;
  return (
    <div className="flex flex-col">
      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-6 tracking-wide">
        {day.label}
      </h3>

      {/* ── Desktop barbell ── */}
      <div className="hidden md:block relative h-[460px]">
        {/* Connector bar */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] h-14 rounded-full z-0"
          style={{ background: "#D52029", transform: "translate(-50%, -50%) rotate(-40deg)" }}
        />

        {/* Session 1 — upper right */}
        <div className="absolute top-6 right-8 z-10">
          <SessionCircle n={1} />
        </div>
        {/* Session 1 content — upper left */}
        <div className="absolute top-10 left-0 w-[45%] z-20">
          <Content title={s1.title} bullets={s1.bullets} />
        </div>

        {/* Session 2 — lower left */}
        <div className="absolute bottom-6 left-8 z-10">
          <SessionCircle n={2} />
        </div>
        {/* Session 2 content — lower right */}
        <div className="absolute bottom-10 right-0 w-[45%] z-20">
          <Content title={s2.title} bullets={s2.bullets} />
        </div>
      </div>

      {/* ── Mobile stacked ── */}
      <div className="md:hidden flex flex-col gap-3">
        {day.sessions.map((s, i) => (
          <div key={i}>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center shrink-0">
                <SessionCircle n={i + 1} small />
                {i < day.sessions.length - 1 && (
                  <div className="w-px flex-1 min-h-6 mt-2" style={{ backgroundImage: DASH_LINE }} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <Content title={s.title} bullets={s.bullets} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PeopleStrategyChain({
  heading = "2 Days of People Strategy Mastery",
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

        {/* Day columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {dayList.map((day, di) => (
            <DayChain key={di} day={day} />
          ))}
        </div>

      </div>
    </section>
  );
}
