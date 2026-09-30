"use client";

// Middle section of an individual Solution page: a left graphic + right content
// (a small badge/pill, a heading, and one or more body paragraphs). All fields
// are managed per Solution in Admin → Solutions; the section hides when empty.
export default function SolutionMiddle({ image, badge, heading, body }) {
  const paragraphs = String(body || "")
    .split(/\r?\n\s*\r?\n/) // blank line separates paragraphs
    .map((s) => s.trim())
    .filter(Boolean);

  if (!image && !badge && !heading && !paragraphs.length) return null;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — graphic */}
          {image && (
            <div className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={heading || "Solution"}
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          )}

          {/* Right — content */}
          <div className={image ? "" : "lg:col-span-2 max-w-3xl mx-auto text-center"}>
            {badge && (
              <span className="inline-block px-5 py-2 text-sm font-semibold text-slate-700 bg-[#E8E8E8] rounded-lg mb-5">
                {badge}
              </span>
            )}
            {heading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-5">
                {heading}
              </h2>
            )}
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
