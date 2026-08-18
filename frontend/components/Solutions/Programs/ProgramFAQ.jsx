"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const defaultFaqs = [
  {
    id: 1,
    question: "Who is this Programme for?",
    answer: "This programme is designed for senior HR leaders, HR business partners, and aspiring strategic advisors who want to operate at the executive level and drive real business impact through people strategy.",
  },
  {
    id: 2,
    question: "Is this Certification recognised?",
    answer: "Yes. This certification is accredited by EIU-Paris and recognised globally by leading organisations and HR professional bodies.",
  },
  {
    id: 3,
    question: "Can I claim this under corporate training budgets?",
    answer: "Yes. Many participants claim this programme under their organisation's Learning & Development or corporate training budget. We can provide documentation to support your application.",
  },
  {
    id: 4,
    question: "I have a different question. Who should I contact?",
    answer: "Please contact us via email at ceo@globalatd.com for assistance.",
  },
];

export default function ProgramFAQ({
  heading = "Frequently Asked Questions",
  faqs,
}) {
  const [openId, setOpenId] = useState(null);
  const items = faqs || defaultFaqs;

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] mb-10 leading-tight">
          {heading}
        </h2>

        <div className="divide-y divide-slate-200">
          {items.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                >
                  <span className={`text-sm sm:text-base font-bold leading-snug transition-colors ${isOpen ? "text-[#414143]" : "text-[#414143] group-hover:text-[#D52029]"}`}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-[#414143] transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
