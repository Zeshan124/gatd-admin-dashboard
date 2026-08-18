"use client";

import { useState } from "react";
import Image from "next/image";

// Backend endpoint — override per-environment via NEXT_PUBLIC_CONTACT_API.
const CONTACT_API =
  process.env.NEXT_PUBLIC_CONTACT_API || "http://localhost:5000/apis/contact";

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

export default function FeelFree() {
  const [form, setForm] = useState({
    firstName: "", email: "", phone: "", subject: "", message: "",
  });
  const [dialCode, setDialCode] = useState("AE");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const selectedCountry = countries.find((c) => c.code === dialCode) || countries[0];
  const filtered = countries.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");

    const payload = {
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      phoneCountry: selectedCountry.code,
      phoneNumber: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "",
      honeypot,
    };

    try {
      const res = await fetch(CONTACT_API, {
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

      setStatus("success");
      setForm({ firstName: "", email: "", phone: "", subject: "", message: "" });
      setHoneypot("");
    } catch {
      setErrorMsg("Unable to reach the server. Please try again later.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-[#414143] placeholder-slate-400 focus:outline-none focus:border-[#D52029] transition-colors duration-200";

  return (
    <section className="relative bg-[#F2F2F2] py-14 sm:py-18 md:py-24 overflow-hidden">

      <Image
        src="/images/solutions/strategic-hr/contact_map.jpg"
        alt=""
        fill
        className="object-cover object-center opacity-20"
      />

      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        <span className="inline-block px-4 py-2 text-sm font-semibold text-[#414143] bg-[#E8E8E8] rounded-lg mb-6 shadow-sm">
          Submit Now
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] leading-tight mb-10">
          Get In Touch With Us
        </h2>

        {status === "success" ? (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#414143]">Message Sent!</h3>
            <p className="text-slate-500 max-w-sm">Thank you for reaching out. We'll get back to you as soon as possible.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-2 px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors duration-200"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Honeypot: hidden from real users; bots that fill it are silently dropped */}
            <input
              type="text" name="company_website" tabIndex={-1} autoComplete="off"
              aria-hidden="true" value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="firstName" value={form.firstName} onChange={handleChange}
                placeholder="First Name" required className={inputClass} />
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Email Address" required className={`${inputClass} border-[#D52029]`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-lg px-4 focus-within:border-[#D52029] transition-colors duration-200">
                <button
                  type="button"
                  onClick={() => { setDropdownOpen((p) => !p); setSearch(""); }}
                  className="flex items-center gap-1.5 pr-3 shrink-0 py-3"
                >
                  <img src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                    alt={selectedCountry.name} className="w-6 h-4 object-cover rounded-sm" />
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="w-px h-5 bg-slate-200 mr-3 shrink-0" />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="Phone Number"
                  className="flex-1 bg-transparent outline-none py-3 text-sm text-[#414143] placeholder-slate-400" />

                {dropdownOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search country..."
                        className="w-full text-sm outline-none py-1 text-[#414143] placeholder-slate-400" />
                    </div>
                    <ul className="max-h-52 overflow-y-auto">
                      {filtered.map((c) => (
                        <li key={c.code}>
                          <button type="button"
                            onClick={() => { setDialCode(c.code); setDropdownOpen(false); setSearch(""); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-[#D52029] transition-colors text-left">
                            <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt={c.name}
                              className="w-6 h-4 object-cover rounded-sm shrink-0" />
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

              <input name="subject" value={form.subject} onChange={handleChange}
                placeholder="Subject" className={inputClass} />
            </div>

            <textarea name="message" value={form.message} onChange={handleChange}
              placeholder="Write Your Message Here..." rows={5}
              required className={`${inputClass} resize-none`} />

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMsg || "Something went wrong. Please try again."}</p>
            )}

            <div>
              <button type="submit" disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#D52029] hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                {status === "loading" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </>
                ) : "Submit Now"}
              </button>
            </div>

          </form>
        )}
      </div>

      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </section>
  );
}
