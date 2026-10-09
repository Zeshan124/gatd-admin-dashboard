"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const countries = [
  { code: "AE", name: "UAE", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "JP", name: "Japan", dial: "+81" },
];

// Accepted national-number length range [min, max] per country, in digits and
// EXCLUDING the country code and any leading trunk "0" (the flag selector already
// carries the dial code, so e.g. Pakistan is 3462284571 — 10 digits — not
// 03462284571). `max` is also the hard input cap: the field refuses to accept
// more digits than this once a country is selected. Any country not listed falls
// back to the range below. Tweak a row here if the client reports a specific
// country being too strict/loose.
const PHONE_LEN = {
  AE: [8, 9],   // UAE
  SA: [8, 9],   // Saudi Arabia
  SG: [8, 8],   // Singapore
  GB: [9, 10],  // United Kingdom
  US: [10, 10], // United States
  IN: [10, 10], // India
  PK: [10, 10], // Pakistan (3XXXXXXXXX)
  MY: [9, 10],  // Malaysia
  AU: [9, 9],   // Australia
  CA: [10, 10], // Canada
  DE: [6, 11],  // Germany (highly variable)
  FR: [9, 9],   // France
  QA: [8, 8],   // Qatar
  KW: [8, 8],   // Kuwait
  BH: [8, 8],   // Bahrain
  OM: [8, 8],   // Oman
  JO: [9, 9],   // Jordan
  EG: [9, 10],  // Egypt
  NG: [10, 10], // Nigeria
  ZA: [9, 9],   // South Africa
  KE: [9, 9],   // Kenya
  PH: [10, 10], // Philippines
  ID: [9, 11],  // Indonesia
  TR: [10, 10], // Turkey
  CN: [10, 11], // China
  JP: [9, 10],  // Japan
};
const PHONE_LEN_FALLBACK = [7, 15]; // E.164: NSN is at most 15 digits.

// Normalize raw phone input to the national number for `country`: keep digits
// only, drop a pasted international/country-code prefix and any leading trunk 0,
// then hard-cap to the country's max length so the field can't exceed it.
function normalizePhone(raw, country) {
  const max = (PHONE_LEN[country] || PHONE_LEN_FALLBACK)[1];
  const cc = ((countries.find((c) => c.code === country) || {}).dial || "").replace(/\D/g, ""); // e.g. "92"
  let digits = String(raw).replace(/\D/g, "");
  if (cc && digits.startsWith("00" + cc)) digits = digits.slice(2 + cc.length);
  else if (cc && digits.startsWith(cc) && digits.length > max) digits = digits.slice(cc.length);
  digits = digits.replace(/^0+/, ""); // trunk 0 isn't part of the national number here
  return digits.slice(0, max);
}

// Backend endpoint — override per-environment via NEXT_PUBLIC_REGISTRATIONS_API.
const API_URL =
  process.env.NEXT_PUBLIC_REGISTRATIONS_API ||
  "http://localhost:5000/apis/registrations";

export default function ProgramRegistration({
  badge = "Register now",
  heading = "For Strategic HR Business Partner Training",
  backgroundImage = "/images/solutions/strategic-hr/contact_map.jpg",
  options = [], // [{ slug, label, price, currency }] — this Program's subprogrammes
  solutionTitle = "",
  programTitle = "",
}) {
  const pathname = usePathname();
  // Currency comes from the programme options (a Program's subprogrammes share one).
  const currency = options[0]?.currency || "SGD";

  const [form, setForm] = useState({
    firstName: "", email: "", phone: "",
    country: "", designation: "", organization: "",
    source: "",
  });
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [dialCode, setDialCode] = useState("AE");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [progDropOpen, setProgDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCountry = countries.find((c) => c.code === dialCode) || countries[0];
  const filtered = countries.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  // Per-country phone validation. `form.phone` is kept digits-only (see
  // handlePhoneChange), so its length is the national-number digit count.
  const [phoneMin, phoneMax] = PHONE_LEN[dialCode] || PHONE_LEN_FALLBACK;
  const phoneLenLabel = phoneMin === phoneMax ? `${phoneMin}` : `${phoneMin}–${phoneMax}`;
  const phoneValid =
    form.phone.length >= phoneMin && form.phone.length <= phoneMax;
  const phoneError = !form.phone
    ? "Phone number is required."
    : !phoneValid
    ? `Enter a valid ${selectedCountry.name} phone number (${phoneLenLabel} digits).`
    : "";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Phone: normalize to the national number (digits only, no trunk 0, capped).
  const handlePhoneChange = (e) =>
    setForm((prev) => ({ ...prev, phone: normalizePhone(e.target.value, dialCode) }));

  // Switching country re-caps the existing number to the new country's max.
  const selectCountry = (code) => {
    setDialCode(code);
    setForm((prev) => ({ ...prev, phone: normalizePhone(prev.phone, code) }));
  };

  const toggleProgram = (prog) => {
    setSelectedPrograms((prev) =>
      prev.find((p) => p.slug === prog.slug)
        ? prev.filter((p) => p.slug !== prog.slug)
        : [...prev, prog]
    );
  };

  const totalAmount = selectedPrograms.reduce((sum, p) => sum + p.price, 0);

  // Read utm_* params from the current URL (client-only).
  const getUtm = () => {
    if (typeof window === "undefined") return {};
    const q = new URLSearchParams(window.location.search);
    const utm = {};
    for (const key of ["source", "medium", "campaign"]) {
      const v = q.get(`utm_${key}`);
      if (v) utm[key] = v;
    }
    return utm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phoneValid) {
      setPhoneTouched(true);
      setStatus("error");
      setErrorMsg(phoneError);
      return;
    }

    if (selectedPrograms.length === 0) {
      setStatus("error");
      setErrorMsg("Please select at least one programme.");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      phoneCountry: dialCode,
      phoneNumber: form.phone.trim(),
      country: form.country.trim(),
      designation: form.designation.trim(),
      organization: form.organization.trim(),
      hearAboutUs: form.source.trim(),
      programSlugs: selectedPrograms.map((p) => p.slug),
      sourcePage: pathname || (typeof window !== "undefined" ? window.location.pathname : ""),
      utm: getUtm(),
      honeypot,
    };

    setStatus("loading");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldErr = json?.error?.fields
          ? Object.values(json.error.fields)[0]
          : null;
        setErrorMsg(
          json?.error?.message ||
            fieldErr ||
            "Something went wrong. Please check your details and try again."
        );
        setStatus("error");
        return;
      }

      setResult(json.data || null);
      setStatus("success");
      // Reset the form for a possible next submission.
      setForm({
        firstName: "", email: "", phone: "",
        country: "", designation: "", organization: "",
        source: "",
      });
      setSelectedPrograms([]);
      setHoneypot("");
      setPhoneTouched(false);
    } catch (err) {
      setErrorMsg("Unable to reach the server. Please try again later.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white border border-slate-300 focus:border-[#D52029] outline-none rounded-md px-5 py-4 text-sm text-[#414143] placeholder-[#414143] transition-colors duration-200";

  return (
    <section
     id="registration"
     className="relative py-14 sm:py-18 md:py-24 scroll-mt-32">

      {/* Background image — overflow-hidden scoped here so dropdowns aren't clipped */}
      <div className="absolute inset-0 overflow-hidden">
        <Image src={backgroundImage} alt="" fill className="object-cover object-center" />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Badge */}
        <span className="inline-block px-4 py-2 text-sm font-semibold text-[#414143] bg-[#E8E8E8] border border-slate-200 rounded-lg mb-6 shadow-sm">
          {badge}
        </span>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-4">
          {heading}
        </h2>

        {/* Hierarchy context — which Solution / Program this registration is for */}
        {(solutionTitle || programTitle) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 mb-10">
            {solutionTitle && (
              <span>
                <span className="font-semibold text-[#414143]">Solution:</span> {solutionTitle}
              </span>
            )}
            {solutionTitle && programTitle && <span className="text-slate-300">/</span>}
            {programTitle && (
              <span>
                <span className="font-semibold text-[#414143]">Program:</span> {programTitle}
              </span>
            )}
          </div>
        )}

        {status === "success" ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl max-w-2xl">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#414143] mb-2">
              Registration received!
            </h3>
            <p className="text-slate-600 mb-6">
              Thank you. We&apos;ve received your registration and our team will be in touch shortly.
            </p>

            {result && (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 text-sm">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-bold text-[#414143]">{result.referenceNo}</span>
                </div>
                {result.programs?.map((p) => (
                  <div key={p.slug} className="flex items-center justify-between gap-4 px-5 py-3 border-t border-slate-100 text-sm">
                    <span className="text-[#414143]">{p.title}</span>
                    <span className="text-slate-500 shrink-0">
                      {result.currency} {(p.unitPriceCents / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
                {result.totalAmountFormatted && (
                  <div className="flex items-center justify-between px-5 py-3 bg-[#D52029] text-white">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-base font-black">{result.totalAmountFormatted}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setStatus("idle"); setResult(null); }}
              className="mt-6 inline-flex items-center justify-center px-8 py-3 border-2 border-[#414143] text-[#414143] hover:bg-[#414143] hover:text-white text-sm font-bold rounded-lg transition-all duration-200"
            >
              Submit another registration
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">

          {/* Honeypot — hidden from humans; bots that fill it get flagged as spam */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* First Name */}
          <input name="firstName" value={form.firstName} onChange={handleChange} required
            placeholder="First Name" className={inputClass} />

          {/* Email */}
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            placeholder="Email Address" className={inputClass} />

          {/* Phone with country selector */}
          <div>
          <div className={`relative flex items-center bg-white border rounded-md transition-colors duration-200 ${
            phoneTouched && phoneError
              ? "border-[#D52029]"
              : "border-slate-300 focus-within:border-[#D52029]"
          }`}>
            <button
              type="button"
              onClick={() => { setDropdownOpen((p) => !p); setSearch(""); }}
              className="flex items-center gap-1.5 px-4 shrink-0 py-4"
            >
              <img src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`} alt={selectedCountry.name} className="w-6 h-4 object-cover rounded-sm" />
              <span className="text-xs text-slate-500">{selectedCountry.dial}</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-300 mr-3 shrink-0" />
            <input name="phone" type="tel" inputMode="numeric" maxLength={phoneMax}
              value={form.phone} onChange={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)} required
              placeholder="Phone Number"
              aria-invalid={phoneTouched && !!phoneError}
              className="flex-1 bg-transparent outline-none py-4 pr-5 text-sm text-[#414143] placeholder-[#414143]" />
            {dropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100">
                  <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..." className="w-full text-sm outline-none py-1 text-[#414143] placeholder-slate-400" />
                </div>
                <ul className="max-h-52 overflow-y-auto">
                  {filtered.map((c) => (
                    <li key={c.code}>
                      <button type="button" onClick={() => { selectCountry(c.code); setDropdownOpen(false); setSearch(""); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-[#D52029] transition-colors text-left">
                        <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt={c.name} className="w-6 h-4 object-cover rounded-sm shrink-0" />
                        <span className="flex-1">{c.name}</span>
                        <span className="text-slate-400 text-xs">{c.dial}</span>
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No results</li>}
                </ul>
              </div>
            )}
          </div>
          {phoneTouched && phoneError && (
            <p className="mt-1.5 text-xs font-medium text-[#D52029]">{phoneError}</p>
          )}
          </div>

          {/* Country */}
          <input name="country" value={form.country} onChange={handleChange}
            placeholder="Country" className={inputClass} />

          {/* Designation */}
          <input name="designation" value={form.designation} onChange={handleChange}
            placeholder="Designation" className={inputClass} />

          {/* Organization */}
          <input name="organization" value={form.organization} onChange={handleChange}
            placeholder="Organization" className={inputClass} />

          {/* Programmes — custom multi-select dropdown — full width */}
          <div className="sm:col-span-2 relative">
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setProgDropOpen((p) => !p)}
              className="w-full flex items-center justify-between bg-white border border-slate-300 focus:border-[#D52029] rounded-md px-5 py-4 text-sm text-[#414143] transition-colors duration-200"
            >
              <span className={selectedPrograms.length ? "text-[#414143]" : "text-[#414143]/60"}>
                {selectedPrograms.length === 0
                  ? "Select Programme(s)"
                  : selectedPrograms.length === 1
                  ? selectedPrograms[0].label
                  : `${selectedPrograms.length} programmes selected`}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${progDropOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown list */}
            {progDropOpen && (
              <div className="absolute top-full left-0 right-0 z-100 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto max-h-72">
                {options.length === 0 && (
                  <p className="px-5 py-4 text-sm text-slate-400">No programmes available for registration yet.</p>
                )}
                {options.map((prog) => {
                  const checked = !!selectedPrograms.find((p) => p.slug === prog.slug);
                  return (
                    <button
                      key={prog.slug}
                      type="button"
                      onClick={() => toggleProgram(prog)}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 text-sm text-left transition-colors duration-150 ${checked ? "bg-[#D52029]/5" : "hover:bg-slate-50"}`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${checked ? "bg-[#D52029] border-[#D52029]" : "border-slate-300"}`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </span>
                        <span className={`leading-snug ${checked ? "text-[#D52029] font-semibold" : "text-[#414143]"}`}>
                          {prog.label}
                        </span>
                      </span>
                      <span className={`text-xs font-bold shrink-0 ${checked ? "text-[#D52029]" : "text-slate-500"}`}>
                        {prog.currency || currency} {prog.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Price summary */}
            {selectedPrograms.length > 0 && (
              <div className="mt-3 flex items-center justify-between px-4 py-3 bg-[#D52029] rounded-lg">
                <span className="text-sm font-bold text-white">
                  {selectedPrograms.length === 1 ? selectedPrograms[0].label : `Total (${selectedPrograms.length} programmes)`}
                </span>
                <span className="text-base font-black text-white">
                  {currency} {totalAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Source — full width */}
          <input name="source" value={form.source} onChange={handleChange}
            placeholder="From where do you hear?"
            className={`${inputClass} sm:col-span-2`} />

          {/* Error message */}
          {status === "error" && errorMsg && (
            <div className="sm:col-span-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-[#D52029]">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <div className="sm:col-span-2 mt-2 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4">
            <button type="submit" disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#D52029] hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
              {status === "loading" && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
              )}
              {status === "loading" ? "Submitting..." : "Submit now"}
            </button>
            <div>
              <Link href="/cancellation-and-refund-policy" target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold text-[#414143] underline underline-offset-10 decoration-[#414143] hover:text-[#D52029] hover:decoration-[#D52029] transition-colors duration-200">
                Registration &amp; Cancellation
              </Link>
            </div>
          </div>

        </form>
        )}
      </div>

      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
      {progDropOpen && <div className="fixed inset-0 z-40" onClick={() => setProgDropOpen(false)} />}
    </section>
  );
}
