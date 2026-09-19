"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const defaultFacilitator = {
  name: "Prof. Dr. Joel Farnworth",
  role: "Dean of Business and Management Studies, EIU-Paris",
  image: "/images/solutions/strategic-hr/Dr_Joel.png",
  bg: "/images/solutions/strategic-hr/program_facilitator_BG.png",
  expertise: [
    "Human Resource Management",
    "Leadership Development",
    "Managerial Skills Development",
    "Corporate Strategy Creation and Implementation",
    "Performance Management",
    "Strategic HRM",
  ],
  biography: [
    "Coach and Consultant",
    "Strategic HR Management",
    "Impactive Leadership",
    "Creating and Implementing Corporate Strategy",
    "Senior Management Advisor",
  ],
};

function normalize(facilitator) {
  return Array.isArray(facilitator)
    ? facilitator
    : Array.isArray(facilitator?.facilitators)
    ? facilitator.facilitators
    : facilitator
    ? [facilitator]
    : [defaultFacilitator];
}

/* ── The shared full layout (single facilitator AND popup body) ─────────────── */
function FacilitatorLayout({ f, showName = false }) {
  const {
    name,
    role,
    image = defaultFacilitator.image,
    expertise = [],
    biography = [],
  } = f;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end [&>*]:order-none">
      {/* Left — portrait */}
      <div className="relative flex items-center justify-center py-10 lg:py-16 order-2 lg:order-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name || "Facilitator"}
          className="object-contain w-auto max-h-[360px] sm:max-h-[460px] lg:max-h-[540px]"
        />
      </div>

      {/* Right — heading + (optional name) + expertise + biography */}
      <div className="py-8 sm:py-12 lg:py-16 pl-0 lg:pl-8 order-1 lg:order-2">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
          Program Facilitator
        </h2>
        {showName && (name || role) && (
          <div className="mb-8">
            {name && <p className="text-xl sm:text-2xl font-bold text-white">{name}</p>}
            {role && <p className="text-sm sm:text-base text-white/80 mt-1">{role}</p>}
          </div>
        )}
        {!showName && <div className="mb-8" />}

        {expertise.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider mb-4">Area of Expertise</h4>
            <ul className="space-y-2">
              {expertise.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-white shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {biography.length > 0 && (
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider mb-4">Biography</h4>
            <ul className="space-y-2">
              {biography.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-white/90">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-white shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single facilitator: the original full-width layout (unchanged) ─────────── */
function SingleFacilitator({ f }) {
  const bg = f.bg || defaultFacilitator.bg;
  return (
    <section className="relative overflow-hidden py-0">
      <Image src={bg} alt="" fill className="object-cover object-center" priority />
      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <FacilitatorLayout f={f} />
      </div>
    </section>
  );
}

/* ── Popup: the exact same layout as the section, over the branded background ── */
function FacilitatorModal({ f, bg, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl">
        <Image src={bg} alt="" fill className="object-cover object-center" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative z-10 max-h-[92vh] overflow-y-auto px-5 sm:px-8 lg:px-12">
          <FacilitatorLayout f={f} showName />
        </div>
      </div>
    </div>
  );
}

/* ── Circular facilitator card (the slider items) ───────────────────────────── */
function FacilitatorCard({ f, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center text-center focus:outline-none">
      <div className="relative w-24 h-24 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden bg-white ring-4 ring-white/70 shadow-xl group-hover:ring-white transition-all duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={f.image || defaultFacilitator.image}
          alt={f.name || "Facilitator"}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <p className="mt-3 sm:mt-4 text-sm sm:text-lg font-bold text-white leading-snug">{f.name}</p>
      {f.role && <p className="hidden sm:block text-xs sm:text-sm text-white/80 mt-1 line-clamp-2 max-w-[15rem]">{f.role}</p>}
      <span className="mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#D52029] bg-white/90 rounded-full px-3 py-1 group-hover:bg-white transition-colors">
        View profile
      </span>
    </button>
  );
}

export default function ProgramFacilitator({ facilitator }) {
  const list = normalize(facilitator);
  const multiple = list.length > 1;
  const [selected, setSelected] = useState(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  const n = list.length;
  const auto = n > 3; // auto-slider only when there are more than 3
  const move = (dir) => setOffset((o) => (o + dir + n) % n);

  // Auto-advance the window of 3 (pauses on hover and while the popup is open).
  useEffect(() => {
    if (!auto || paused || selected) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % n), 4000);
    return () => clearInterval(t);
  }, [auto, paused, selected, n]);

  // Single facilitator → keep the original layout untouched.
  if (!multiple) return <SingleFacilitator f={list[0] || defaultFacilitator} />;

  const bg = list[0]?.bg || defaultFacilitator.bg;
  // Show up to 3; when >3, a rotating window of 3 starting at `offset`.
  const visible = auto ? [0, 1, 2].map((k) => list[(offset + k) % n]) : list.slice(0, 3);

  return (
    <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
      <Image src={bg} alt="" fill className="object-cover object-center" priority />
      <div className="absolute inset-0" />

      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        {/* Heading + manual nav (when auto slider is active) */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Program Facilitators</h2>
          {auto && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-[#D52029] transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next"
                className="w-10 h-10 rounded-full border-2 border-white/60 text-white flex items-center justify-center hover:bg-white hover:text-[#D52029] transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Slider window of up to 3 cards */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div key={offset} className="grid grid-cols-3 gap-3 sm:gap-6 justify-items-center animate-[facFade_0.5s_ease]">
            {visible.map((f, i) => (
              <FacilitatorCard key={`${offset}-${i}`} f={f} onClick={() => setSelected(f)} />
            ))}
          </div>
        </div>
      </div>

      {selected && <FacilitatorModal f={selected} bg={selected.bg || bg} onClose={() => setSelected(null)} />}

      <style jsx>{`
        @keyframes facFade {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
