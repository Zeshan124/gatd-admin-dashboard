"use client";

const defaultDays = [
  {
    label: "DAY 1",
    sessions: [
      { color: "red", title: "Participant Insights", bullets: ["Participant interests & challenges", "First live knowledge practice", "Review & discussion"] },
      { color: "dark", title: "Learning Design", bullets: ["Knowledge objectives and session design", "Second live knowledge practice, review and feedback", "Knowledge learning review – methods, approaches, personal learning"] },
      { color: "red", title: "Skills Development", bullets: ["Capability (skills) objectives and design (general)", "Individual design and preparation – skills development", "Review & discussion"] },
      { color: "dark", title: "Skills Practice", bullets: ["Capability (skills) practice session", "Review; trainer “hat”; best practices and takeaways", "Personal learning"] },
    ],
  },
  {
    label: "DAY 2",
    sessions: [
      { color: "red", title: "Attitude Shaping", bullets: ["Shaping attitude, engagement and willing commitment — the rationale", "Attitude objectives in learning", "Range of approaches and timeframes"] },
      { color: "dark", title: "Commitment Design", bullets: ["Design of a commitment-shaping session", "Practice session delivery", "Review, feedback & discussion"] },
      { color: "red", title: "Evaluation Review", bullets: ["Learning evaluation", "The easy, the hard, the practical, the implementable", "Review & discussion"] },
      { color: "dark", title: "Trainer Closure", bullets: ["Trainer development quiz", "Personal learning & takeaways", "Certification and thank you's"] },
    ],
  },
];

function SessionCard({ index, session }) {
  const isRed = session.color === "red";
  const headerBg = isRed ? "#D52029" : "#2c2c2c";
  const foldBg = isRed ? "#9b1c1c" : "#111";
  return (
    <div className="relative flex flex-col h-full">
      {/* Header bar */}
      <div className="relative px-5 py-3.5 z-10" style={{ background: headerBg }}>
        <span className="text-white font-bold text-sm tracking-wide uppercase">Session {index}</span>
        {/* Ribbon fold */}
        <div
          className="absolute left-4 top-full w-0 h-0"
          style={{ borderLeft: "9px solid transparent", borderTop: `9px solid ${foldBg}` }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 bg-white shadow-md shadow-slate-200/60 px-5 pt-4 pb-5 border border-slate-100 border-t-0">
        <h4 className={`text-base font-bold leading-snug mb-3 ${isRed ? "text-[#D52029]" : "text-[#414143]"}`}>
          {session.title}
        </h4>
        <ul className="space-y-1.5">
          {session.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D52029] shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function TrainerSessions({
  heading = "2 Days of Strategic L&D",
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

        {/* ── Desktop: unified grid so both days' rows align ── */}
        {dayList.length === 2 && (
          <div className="hidden lg:block">
            {/* Day headers */}
            <div className="grid mb-8" style={{ gridTemplateColumns: "1fr 1fr 3rem 1fr 1fr" }}>
              <h3 className="col-span-2 text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center tracking-wide">
                {dayList[0].label}
              </h3>
              <div aria-hidden />
              <h3 className="col-start-4 col-span-2 text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center tracking-wide">
                {dayList[1].label}
              </h3>
            </div>

            {/* Rows — each band is one grid row so all 4 cards match height */}
            {Array.from({ length: Math.ceil(Math.max(dayList[0].sessions.length, dayList[1].sessions.length) / 2) }).map((_, band) => (
              <div
                key={band}
                className="grid gap-x-5 gap-y-5 mb-5 items-stretch"
                style={{ gridTemplateColumns: "1fr 1fr 3rem 1fr 1fr" }}
              >
                {/* Day 1 pair */}
                {dayList[0].sessions[band * 2] ? <SessionCard index={band * 2 + 1} session={dayList[0].sessions[band * 2]} /> : <div />}
                {dayList[0].sessions[band * 2 + 1] ? <SessionCard index={band * 2 + 2} session={dayList[0].sessions[band * 2 + 1]} /> : <div />}
                {/* Gutter */}
                <div aria-hidden />
                {/* Day 2 pair */}
                {dayList[1].sessions[band * 2] ? <SessionCard index={band * 2 + 1} session={dayList[1].sessions[band * 2]} /> : <div />}
                {dayList[1].sessions[band * 2 + 1] ? <SessionCard index={band * 2 + 2} session={dayList[1].sessions[band * 2 + 1]} /> : <div />}
              </div>
            ))}
          </div>
        )}

        {/* ── Mobile / tablet: stacked per day ── */}
        <div className={dayList.length === 2 ? "lg:hidden grid grid-cols-1 gap-10" : "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14"}>
          {dayList.map((day, di) => (
            <div key={di} className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-8 tracking-wide">
                {day.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {day.sessions.map((session, si) => (
                  <SessionCard key={si} index={si + 1} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
