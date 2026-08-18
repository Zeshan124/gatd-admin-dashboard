"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Backend endpoint — override via NEXT_PUBLIC_BROCHURE_API.
const BROCHURE_API =
  process.env.NEXT_PUBLIC_BROCHURE_API || "http://localhost:5000/apis/brochure-leads";

const countries = [
  "UAE", "Saudi Arabia", "Singapore", "United Kingdom", "United States",
  "India", "Pakistan", "Malaysia", "Australia", "Canada", "Germany",
  "France", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan", "Egypt",
  "Nigeria", "South Africa", "Kenya", "Philippines", "Indonesia",
  "Turkey", "China", "Japan",
];

export default function BrochureModal({
  open,
  onClose,
  brochure = "/brochures/GATD-Company-Profile.pdf",
  itemSlug = null,
  itemTitle = null,
}) {
  const [form, setForm] = useState({ name: "", email: "", country: "", organization: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // reset on close
      setSubmitted(false);
      setErrorMsg("");
      setHoneypot("");
      setForm({ name: "", email: "", country: "", organization: "" });
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const payload = {
      sourceType: "program",
      itemSlug,
      itemTitle,
      brochure,
      name: form.name.trim(),
      email: form.email.trim(),
      country: form.country.trim(),
      organization: form.organization.trim(),
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "",
      honeypot,
    };

    try {
      const res = await fetch(BROCHURE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Only block on validation errors; otherwise reveal the brochure (best-effort capture).
      if (res.status === 422) {
        const json = await res.json().catch(() => ({}));
        const fieldErr = json?.error?.fields ? Object.values(json.error.fields)[0] : null;
        setErrorMsg(json?.error?.message || fieldErr || "Please check your details and try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      // Network/server issue shouldn't stop the download.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 focus:border-[#D52029] outline-none rounded-md px-4 py-3 text-sm text-[#414143] placeholder-slate-400 transition-colors duration-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Red header bar */}
        <div className="bg-[#D52029] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Programme Brochure</p>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              Download Your Free Brochure
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200 mt-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#414143]">Thank You!</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Your details have been received. Click below to open your brochure.
              </p>
              <a
                href={brochure}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors duration-200 shadow-md"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
                Open Brochure
              </a>
              <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Honeypot: hidden from users; bots that fill it are silently dropped */}
              <input
                type="text" name="company_website" tabIndex={-1} autoComplete="off"
                aria-hidden="true" value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)} className="hidden" />
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Full Name" required
                className={inputClass}
              />
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Email Address" required
                className={inputClass}
              />
              {/* Country select */}
              <div className="relative">
                <select
                  name="country" value={form.country} onChange={handleChange}
                  required className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                >
                  <option value="" disabled>Country</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                name="organization" value={form.organization} onChange={handleChange}
                placeholder="Organisation"
                className={inputClass}
              />
              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#D52029] hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-1"
              >
                {submitting ? "Submitting…" : "Download Brochure"}
              </button>
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                By submitting, you agree to receive programme information from GATD. We respect your privacy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
