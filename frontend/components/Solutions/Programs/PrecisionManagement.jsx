"use client";

const defaultDays = [
  {
    label: "DAY 1",
    nodes: [
      {
        circleTitle: "The Organisation & People Balance",
        color: "red",
        sideHeading: "Strategic Planning",
        bullets: ["Strategy and alignment", "AOPs and KPIs", "Measurable deliverables"],
      },
      {
        circleTitle: "Managers are important",
        color: "dark",
        sideHeading: "Leadership Insights",
        bullets: ["The lead from Google", "Key management capabilities", "Level based capabilities"],
      },
      {
        circleTitle: "The demands of the led",
        color: "red",
        sideHeading: "Employee Dynamics",
        bullets: ["Stay or go", "The key 5", "Peripherals on the rise"],
      },
      {
        circleTitle: "Employer of choice",
        color: "red",
        sideHeading: "Workplace Appeal",
        bullets: ["Where the world wants to work", "Key attractions for your business", "Tracking impact and initiative results"],
      },
    ],
  },
  {
    label: "DAY 2",
    nodes: [
      {
        circleTitle: "The Engaged Manager",
        color: "dark",
        sideHeading: "Survey Insights",
        bullets: ["The survey", "Interpreting results", "Actions for improvement"],
      },
      {
        circleTitle: "Strategic Context",
        color: "red",
        sideHeading: "Performance Planning",
        bullets: ["Creation", "Models and approaches", "AOPs, KPIs & deliverables (managing the details!!)"],
      },
      {
        circleTitle: "The Talent Challenge",
        color: "dark",
        sideHeading: "Talent Sourcing",
        bullets: ["Best sourcing channels", "Internal v external", "Improvement areas and progress"],
      },
      {
        circleTitle: "Learning from the Negative",
        color: "red",
        sideHeading: "Industry Lessons",
        bullets: ["Poor practices – financial", "Poor practices – car industry", "The Nissan turnaround"],
      },
    ],
  },
  {
    label: "DAY 3",
    nodes: [
      {
        circleTitle: "Learning from the Positive",
        color: "red",
        sideHeading: "Company Insights",
        bullets: ["Virgin (Branson)", "HSBC (sometimes)", "Johnson & Johnson"],
      },
      {
        circleTitle: "AI & Predictive Analytics Future Management Trends",
        color: "dark",
        sideHeading: "AI Perspectives",
        bullets: ["Exploring AI Predictions", "Consultants Views?", "Participant Views?"],
      },
      {
        circleTitle: "A Data Driven World",
        color: "red",
        sideHeading: "Knowledge Sources",
        bullets: ["Did you know?", "Glassdoor", "Information Channels"],
      },
      {
        circleTitle: "Final Thoughts",
        color: "dark",
        sideHeading: "Management Insights",
        bullets: ["Business & People", "The Successful Manager", "Takeaways for Implementation"],
      },
    ],
  },
];

const DASH_LINE = "repeating-linear-gradient(to bottom,#D52029 0,#D52029 4px,transparent 4px,transparent 9px)";

function Circle({ title, color }) {
  const isRed = color === "red";
  return (
    <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
      <div className={`absolute w-28 h-28 rounded-full blur-xl ${isRed ? "bg-[#D52029]/25" : "bg-slate-900/15"}`} />
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center text-center px-3 ring-4 ring-white shadow-xl"
        style={{
          background: isRed
            ? "linear-gradient(145deg, #ef4444 0%, #D52029 55%, #9b1c1c 100%)"
            : "linear-gradient(145deg, #4b4b4b 0%, #2c2c2c 60%, #1a1a1a 100%)",
          boxShadow: isRed ? "0 12px 28px -8px rgba(213,32,41,0.5)" : "0 12px 28px -8px rgba(0,0,0,0.4)",
        }}
      >
        <span className="text-white font-bold leading-tight text-[11px]">{title}</span>
      </div>
    </div>
  );
}

function SideContent({ heading, bullets }) {
  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-black text-[#D52029] leading-snug mb-1">{heading}</h4>
      <div className="w-8 h-0.5 bg-[#D52029]/30 mb-2" />
      <ul className="space-y-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D52029] shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PrecisionManagement({
  heading = "3 Days of Precision Management",
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

      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">

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

        {/* 3-day columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
          {dayList.map((day, di) => (
            <div key={di} className="flex flex-col">
              {/* Day header */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#D52029] text-center mb-8 tracking-wide">
                {day.label}
              </h3>

              {/* Node timeline */}
              <div className="flex flex-col">
                {day.nodes.map((node, ni) => (
                  <div key={ni}>
                    <div className="flex items-center gap-4">
                      <Circle title={node.circleTitle} color={node.color} />
                      <SideContent heading={node.sideHeading} bullets={node.bullets} />
                    </div>
                    {/* Connector */}
                    {ni < day.nodes.length - 1 && (
                      <div className="flex" style={{ width: "6rem" }}>
                        <div className="mx-auto h-8 w-px" style={{ backgroundImage: DASH_LINE }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
