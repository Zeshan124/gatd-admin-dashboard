export default function ProgramPricing({
  heading = "Why It's Worth",
  currency = "SGD.",
  price = "3850",
  period = "/Person",
  description = "By enrolling, you'll earn a respected EIU-Paris credential and learn practical frameworks to help you grow from an HR practitioner into a Strategic Business Partner. You'll develop the business skills to connect people strategy with company goals, turning human capital into a real driver of growth and success.",
}) {
  return (
    <section className="bg-[#F8F9FA] py-10 sm:py-14">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — heading + price */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-2">
              {heading}
            </h2>
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#D52029] leading-none">
              {currency} {price}
              <span className="text-2xl sm:text-3xl font-bold text-[#414143]">{period}</span>
            </p>
          </div>

          {/* Right — description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {description}
          </p>

        </div>
      </div>
    </section>
  );
}
