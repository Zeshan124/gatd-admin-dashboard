export default function ProgramPricing({
  heading = "Why It's Worth",
  currency = "SGD",
  price,
  period,
  description,
  note,
}) {
  const hasPrice = price != null && String(price).trim() !== "";
  // Normalize the period to a leading-slash form, e.g. "Person" -> "/Person".
  const per = period ? "/" + String(period).replace(/^\/+/, "") : "";

  return (
    <section className="bg-[#F8F9FA] py-10 sm:py-14">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — heading + price (or the alternative note when price isn't set) */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-2">
              {heading || "Why It's Worth"}
            </h2>

            {hasPrice ? (
              <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#D52029] leading-none">
                {currency} {price}
                {per && (
                  <span className="text-2xl sm:text-3xl font-bold text-[#414143]">{per}</span>
                )}
              </p>
            ) : note ? (
              <p className="text-2xl sm:text-3xl font-bold text-[#D52029] leading-snug">
                {note}
              </p>
            ) : null}
          </div>

          {/* Right — description */}
          {description && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {description}
            </p>
          )}

        </div>
      </div>
    </section>
  );
}
