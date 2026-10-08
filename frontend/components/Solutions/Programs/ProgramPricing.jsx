import { Calendar, MapPin, Coins } from "lucide-react";

// "Programme Details" section.
// - Heading + description on the left, a single joined details panel on the right.
// - Rows render only when they have content; the layout re-flows so no area is ever empty:
//     • no description  -> heading and details sit side by side
//     • no details      -> description spans the full width
//     • nothing at all  -> the section is not rendered
export default function ProgramPricing({
  description,
  dates,
  location,
  currency = "SGD",
  price,
  period,
  note,
}) {
  const hasPrice = price != null && String(price).trim() !== "";
  const per = period ? ` / ${String(period).replace(/^\/+\s*/, "")}` : "";
  const investment = hasPrice ? `${currency} ${price}${per}` : note || null;

  const details = [
    dates ? { label: "Dates", value: dates, Icon: Calendar } : null,
    location ? { label: "Location", value: location, Icon: MapPin } : null,
    // preserveSpaces: keep runs of spaces typed in the admin "Pricing period"
    // (browsers collapse them to one by default).
    investment ? { label: "Investment", value: investment, Icon: Coins, preserveSpaces: true } : null,
  ].filter(Boolean);

  if (!description && details.length === 0) return null;

  const hasBoth = Boolean(description) && details.length > 0;

  return (
    <section className="bg-white border-y border-slate-100 py-10 sm:py-12 md:py-14">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        <div
          className={
            hasBoth
              ? "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center"
              : "grid grid-cols-1 gap-6"
          }
        >
          {/* Heading + description */}
          <div
            className={`flex gap-5 ${
              hasBoth ? "lg:col-span-5" : ""
            } ${details.length === 0 ? "max-w-3xl" : ""}`}
          >
            <span
              aria-hidden
              className="w-1 shrink-0 self-stretch rounded-full bg-[#D52029]"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#414143]">
                Programme details
              </h2>
              {description && (
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Details panel: one container, divided rows */}
          {details.length > 0 && (
            <dl
              className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 divide-y divide-slate-200 ${
                hasBoth ? "lg:col-span-7" : "max-w-3xl"
              }`}
            >
              {details.map(({ label, value, Icon, preserveSpaces }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#D52029] ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-medium text-slate-500">{label}</dt>
                    <dd
                      className={`mt-0.5 text-base sm:text-lg font-semibold leading-snug text-[#414143] break-words ${
                        preserveSpaces ? "whitespace-pre-wrap" : ""
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}