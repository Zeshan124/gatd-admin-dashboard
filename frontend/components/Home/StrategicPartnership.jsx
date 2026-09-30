import { Fragment } from "react";

// Home "Strategic Partnership" band. Content is fixed (client-provided). The
// section uses a dark background so the white Nexen & GATD logos read cleanly;
// the navy Roya logo sits on a white card so it stays legible here too.
const PARTNERS = [
  { name: "Nexen Strategy", logo: "/images/home/nexen-logo-white-1-8capSp.png", card: false },
  { name: "GATD", logo: "/images/home/gatd.png", card: false },
  { name: "Roya Ventures", logo: "/images/home/roya-logo-CbrsReqI.png", card: true },
];

export default function StrategicPartnership() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#1b1c22] to-[#4b4e5b] py-16 sm:py-20 md:py-24">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 text-center">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-8 h-0.5 bg-[#D52029]" />
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#D52029] uppercase">
            Strategic Partnership
          </span>
          <span className="w-8 h-0.5 bg-[#D52029]" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          Building a Stronger Future, Together.
        </h2>

        {/* Body */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-white/70 leading-relaxed mb-12 sm:mb-14">
          Combining expertise across technology, digital innovation, leadership and
          engineering to create meaningful solutions and opportunities for
          organisations worldwide.
        </p>

        {/* Partner logos: Nexen Strategy × GATD × Roya Ventures */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
          {PARTNERS.map((p, i) => (
            <Fragment key={p.name}>
              {i > 0 && (
                <span className="text-2xl sm:text-3xl font-light text-white/40 select-none" aria-hidden="true">
                  ×
                </span>
              )}
              {p.card ? (
                <div className="bg-white rounded-xl px-5 py-3 flex items-center justify-center shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.logo} alt={p.name} className="h-9 sm:h-11 w-auto object-contain" />
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.logo} alt={p.name} className="h-10 sm:h-12 w-auto object-contain" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
