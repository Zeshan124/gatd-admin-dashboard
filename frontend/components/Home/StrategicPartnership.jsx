import { Fragment } from "react";

// Home "Strategic Partnership" band.
// Layout: a brand-red intro block (eyebrow, heading, copy) with a white logo card
// overlapping its bottom edge. Logos sit side by side with a red "×" between them;
// the row stays horizontal on every screen size and just scales down on phones.
//
// `flip` = the asset is a white-on-transparent logo; it is inverted (hue preserved)
// so it reads on the white card. Replace with a dark Nexen file and drop `flip`
// when one is available.
const PARTNERS = [
  {
    name: "Nexen Strategy",
    logo: "/images/home/nexen-logo-white-1-8capSp.png",
    flip: true,
  },
  {
    name: "Roya Ventures",
    logo: "/images/home/roya-logo-CbrsReqI.png",
    size: "h-12 min-[400px]:h-14 sm:h-20 md:h-24",
  },
];

function Separator() {
  const line = "h-px w-2 min-[400px]:w-3 sm:w-6 md:w-10";
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      <span className={`${line} bg-linear-to-r from-transparent to-[#C0312E]`} />
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C0312E] text-base font-semibold leading-none text-white sm:h-10 sm:w-10 sm:text-lg">
        ×
      </span>
      <span className={`${line} bg-linear-to-r from-[#C0312E] to-transparent`} />
    </div>
  );
}

export default function StrategicPartnership() {
  return (
    <section className="overflow-hidden bg-white">
      {/* Red intro block */}
      <div
        className="bg-[#D5202A] bg-cover bg-center px-5 pt-12 pb-24 text-center sm:px-6 sm:pt-16 sm:pb-32 md:px-8"
        style={{ backgroundImage: "url(/images/solutions/program_facilitator_BG.png)" }}
      >
        <div className="mx-auto">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center justify-center gap-3 sm:mb-5 sm:gap-4">
            <span className="h-px w-6 shrink-0 bg-white/80 sm:w-16" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white min-[400px]:text-[11px] sm:text-xs sm:tracking-[0.3em]">
              Strategic Partnership
            </span>
            <span className="h-px w-6 shrink-0 bg-white/80 sm:w-16" />
          </div>

          {/* Heading */}
          <h2 className="mx-auto mb-4 max-w-md text-2xl font-bold leading-tight text-white sm:mb-5 sm:max-w-none sm:text-4xl md:text-5xl">
            Building a Stronger Future, Together.
          </h2>

          {/* Body */}
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            Combining expertise across technology, digital innovation, leadership and
            engineering to create meaningful solutions and opportunities for
            organisations worldwide.
          </p>
        </div>
      </div>

      {/* White logo card, overlapping the red block */}
      <div className="relative -mt-14 px-4 pb-10 sm:-mt-20 sm:px-6 sm:pb-16 md:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white px-4 py-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] ring-1 ring-black/5 sm:rounded-3xl sm:px-10 sm:py-10">
          <div className="flex items-center justify-between">
            {PARTNERS.map((p, i) => (
              <Fragment key={p.name}>
                {i > 0 && <Separator />}
                <div className="flex min-w-0 flex-1 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt={p.name}
                    className={`w-auto max-w-full object-contain ${
                      p.size ?? "h-8 min-[400px]:h-10 sm:h-12 md:h-14"
                    }`}
                    style={p.flip ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
