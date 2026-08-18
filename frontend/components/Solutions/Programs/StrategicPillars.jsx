"use client";

import { useState } from "react";

const defaultDays = [
  { label: "DAY 1", id: "day1" },
  { label: "DAY 2", id: "day2" },
  { label: "DAY 3", id: "day3" },
];

const defaultModulesByDay = {
  day1: [
    {
      id: 1,
      arrowTitle: "Establishing & Delivering Strategic HR",
      labelPosition: "bottom",
      sideLabel: "HR Role Evolution",
      sideDescription: "Exploring the evolving role of HR Business Partnership and strategic HR services",
    },
    {
      id: 2,
      arrowTitle: "Next Generation HR",
      labelPosition: "top",
      sideLabel: "Future HR Models",
      sideDescription: "Discussing administrator, BP, and predictive contributor roles, and creating people strategy",
    },
    {
      id: 3,
      arrowTitle: "The HRPB Role",
      labelPosition: "bottom",
      sideLabel: "HRBP Capabilities",
      sideDescription: "Defining the HRBP role as a generalist and one-stop solution center, emphasizing influence and change facilitation",
    },
    {
      id: 4,
      arrowTitle: "Business Strategies to Performance Deliverables",
      labelPosition: "top",
      sideLabel: "Performance Alignment",
      sideDescription: "Linking business strategy to performance deliverables, KPIs, and commitment",
    },
  ],
  day2: [
    {
      id: 1,
      arrowTitle: "Talent Management & Succession",
      labelPosition: "bottom",
      sideLabel: "Organisational Readiness",
      sideDescription: "Identifying HIPOs, planning the workforce, and securing succession for critical roles ensures a strong talent pipeline",
    },
    {
      id: 2,
      arrowTitle: "People Management",
      labelPosition: "top",
      sideLabel: "Leadership Excellence",
      sideDescription: "Effective leadership combines impactful style, practical L & M examples, clear success indicators, and precise selection criteria",
    },
    {
      id: 3,
      arrowTitle: "Reward Offerings & Management",
      labelPosition: "bottom",
      sideLabel: "Compensation Strategy",
      sideDescription: "Balancing fixed and variable cash options, trending benefits, brand differentiation, and market positioning drives competitive advantage",
    },
    {
      id: 4,
      arrowTitle: "HR Technology and Data",
      labelPosition: "top",
      sideLabel: "HR Analytics",
      sideDescription: "Leveraging current and future tech, HR tools, data dashboards, and metrics aligns workforce insights with business impact",
    },
  ],
  day3: [
    {
      id: 1,
      arrowTitle: "Organisation Development & Change",
      labelPosition: "bottom",
      sideLabel: "Organisational Design",
      sideDescription: "Core OD elements—diversity, engagement, values, and the work experience—drive a truly engaged organisation",
    },
    {
      id: 2,
      arrowTitle: "Current People Challenges & Solutions?",
      labelPosition: "top",
      sideLabel: "People Strategy",
      sideDescription: "Addressing current challenges by focusing on top priorities, implementing targeted solutions, and taking clear first steps",
    },
    {
      id: 3,
      arrowTitle: "Predictive People Analytics",
      labelPosition: "bottom",
      sideLabel: "Future Insights",
      sideDescription: "Key predictions from AI, consultants, participants, and the trainer highlight emerging trends and future directions",
    },
    {
      id: 4,
      arrowTitle: "Human Capital Trends",
      labelPosition: "top",
      sideLabel: "Next Normal",
      sideDescription: "Anticipating likely needs and responses, focusing on flexible work, CSR, engagement, and inclusive HR advice for the upcoming strategic plan",
    },
  ],
};

const CLIP_FIRST = "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)";
const CLIP_REST  = "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)";

const DASH_LINE = "repeating-linear-gradient(to bottom,#D52029 0,#D52029 4px,transparent 4px,transparent 9px)";

function StepBadge({ number }) {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <div className="absolute w-16 h-16 rounded-full bg-[#D52029]/20 blur-xl" />
      <div className="relative w-12 h-12 rounded-full bg-linear-to-br from-[#D52029] to-[#575757] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-[#D52029]/30 ring-4 ring-white">
        {number}
      </div>
    </div>
  );
}

function InfoCard({ sideLabel, sideDescription }) {
  return (
    <div className="relative w-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md shadow-slate-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-linear-to-b from-[#D52029] to-[#D52029]/20 group-hover:to-[#D52029] transition-all duration-300" />
      <div className="pl-5 pr-4 py-4">
        <p className="text-xs font-black text-[#D52029] uppercase tracking-widest mb-1.5">{sideLabel}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{sideDescription}</p>
      </div>
    </div>
  );
}

export default function StrategicPillars({
  heading = "3 Strategic Pillars",
  badge = "3 Days",
  days,
  modulesByDay,
}) {
  const [activeDay, setActiveDay] = useState("day1");
  const dayList = days || defaultDays;
  const allModules = modulesByDay || defaultModulesByDay;
  const moduleList = allModules[activeDay] || allModules[dayList[0]?.id] || [];

  return (
    <section className="relative py-16 sm:py-20 md:py-20 overflow-hidden" style={{ background: "linear-gradient(to bottom, #f5f5f5 100%, #e0e0e0 50%, #c8c8c8 100%)" }}>

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

        {/* Day tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-slate-100/80 rounded-2xl p-1.5 shadow-inner shadow-slate-200">
            {dayList.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`px-7 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  activeDay === day.id
                    ? "bg-white text-[#D52029] shadow-md shadow-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop roadmap ── */}
        <div className="hidden md:block">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${moduleList.length}, 1fr)` }}>

            {/* Row 1 — top content */}
            {moduleList.map((mod) => (
              <div key={`top-${mod.id}`} className="flex flex-col items-center px-2 min-h-[150px] justify-end pb-2">
                {mod.labelPosition === "top"
                  ? <InfoCard sideLabel={mod.sideLabel} sideDescription={mod.sideDescription} />
                  : <StepBadge number={mod.id} />}
              </div>
            ))}

            {/* Row 2 — top dashed connectors */}
            {moduleList.map((mod) => (
              <div key={`vtop-${mod.id}`} className="flex justify-center">
                <div className="h-8 w-px" style={{ backgroundImage: DASH_LINE }} />
              </div>
            ))}

            {/* Row 3 — arrow shapes */}
            {moduleList.map((mod, idx) => {
              const clip = idx === 0 ? CLIP_FIRST : CLIP_REST;
              return (
                <div key={`arr-${mod.id}`} className="relative" style={{ marginLeft: idx === 0 ? 0 : "-1px" }}>
                  {/* Shadow layer */}
                  <div className="absolute inset-0" style={{
                    background: "#111",
                    clipPath: clip,
                    transform: "translate(4px, 5px)",
                    opacity: 0.2,
                    filter: "blur(3px)",
                  }} />
                  {/* Arrow body */}
                  <div className="relative flex items-center justify-center min-h-[120px]" style={{
                    background: "linear-gradient(145deg, #D52029 0%, #3a3a3a 55%, #272727 100%)",
                    clipPath: clip,
                    zIndex: 1,
                  }}>
                    {/* Ghost number */}
                    <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 text-[68px] font-black leading-none select-none" style={{ color: "rgba(255,255,255,0.05)" }}>
                      {String(mod.id).padStart(2, "0")}
                    </span>
                    <div className="relative z-10 text-center px-5 py-6">
                      <p className="text-[10px] font-bold text-[#D52029] uppercase tracking-[0.15em] mb-1">
                        Step {String(mod.id).padStart(2, "0")}
                      </p>
                      <div className="h-px w-8 bg-white/20 mx-auto mb-2.5" />
                      <p className="text-sm font-bold text-white leading-snug">{mod.arrowTitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Row 4 — bottom dashed connectors */}
            {moduleList.map((mod) => (
              <div key={`vbot-${mod.id}`} className="flex justify-center">
                <div className="h-8 w-px" style={{ backgroundImage: DASH_LINE }} />
              </div>
            ))}

            {/* Row 5 — bottom content */}
            {moduleList.map((mod) => (
              <div key={`bot-${mod.id}`} className="flex flex-col items-center px-2 min-h-[150px] pt-2">
                {mod.labelPosition === "bottom"
                  ? <InfoCard sideLabel={mod.sideLabel} sideDescription={mod.sideDescription} />
                  : <StepBadge number={mod.id} />}
              </div>
            ))}

          </div>
        </div>

        {/* ── Mobile timeline ── */}
        <div className="md:hidden flex flex-col gap-3">
          {moduleList.map((mod, idx) => (
            <div key={mod.id} className="flex gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full bg-[#D52029]/20 blur-md scale-150" />
                  <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-[#ef4444] to-[#9b1c1c] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#D52029]/30 ring-2 ring-white">
                    {mod.id}
                  </div>
                </div>
                {idx < moduleList.length - 1 && (
                  <div className="flex-1 w-px min-h-8 mt-2" style={{ backgroundImage: DASH_LINE }} />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md shadow-slate-200/50">
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-[#D52029] via-[#D52029]/60 to-transparent" />
                  <div className="px-5 py-3.5" style={{ background: "linear-gradient(135deg, #484848 0%, #2c2c2c 100%)" }}>
                    <p className="text-[10px] font-bold text-[#D52029] uppercase tracking-widest mb-0.5">
                      Step {String(mod.id).padStart(2, "0")}
                    </p>
                    <p className="text-white font-bold text-sm leading-snug">{mod.arrowTitle}</p>
                  </div>
                  <div className="px-5 py-3.5">
                    <p className="text-xs font-black text-[#D52029] uppercase tracking-widest mb-1">{mod.sideLabel}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{mod.sideDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
