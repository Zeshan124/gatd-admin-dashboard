"use client";

import { useState } from "react";
import Image from "next/image";

const services = [
  {
    id: 1,
    iconSrc: "/images/services/leadership.svg",
    title: "Leadership Excellence",
    subtitle: "Strong leadership drives success.",
    description: "Our expert-led programs help professionals enhance strategy, teamwork, and innovation through real-world practice and coaching, building the confidence to lead effectively.",
  },
  {
    id: 2,
    iconSrc: "/images/services/future.svg",
    title: "Future Skills for Digital Transformation",
    subtitle: "Technology drives transformation.",
    description: "Our training keeps professionals future-ready with AI, cybersecurity, and data analytics — enabling digital skills to stay competitive in the modern workplace.",
  },
  {
    id: 3,
    iconSrc: "/images/services/professional.svg",
    title: "Professional Skills Development",
    subtitle: "Technical skills alone aren't enough.",
    description: "Our training builds communication, critical thinking, and adaptability, empowering professionals to lead, collaborate, and excel in their careers.",
  },
  {
    id: 4,
    iconSrc: "/images/services/sales.svg",
    title: "Sales and Customer Service Training",
    subtitle: "Great customer experiences stem from knowledge and communication.",
    description: "Our targeted training enhances selling, engagement, and negotiation skills building stronger client relationships and driving business growth.",
  },
  {
    id: 5,
    iconSrc: "/images/services/training.svg",
    title: "Industry Specific Training",
    subtitle: "Every industry has unique needs.",
    description: "GATD offers specialized programs in healthcare, finance, manufacturing, and retail — focusing on real-world skills like compliance, innovation, and customer experience to solve industry-specific challenges.",
  },
  {
    id: 6,
    iconSrc: "/images/services/trainers.svg",
    title: "Train the Trainers Program",
    subtitle: "GATD empowers organizations to build internal training teams.",
    description: "Our Train-the-Trainer program enhances facilitation, customization, and learning culture — enabling scalable, high-quality employee development.",
  },
  {
    id: 7,
    iconSrc: "/images/services/management.svg",
    title: "Leadership and Management Development",
    subtitle: "GATD's leadership programs develop managers who drive success.",
    description: "We build skills in strategy, communication, teamwork, and decision-making, empowering leaders to inspire others and achieve business goals.",
  },
  {
    id: 8,
    iconSrc: "/images/services/future.svg",
    title: "Customized Training Solutions",
    subtitle: "GATD delivers customized training solutions.",
    description: "Tailored to each client's goals, challenges, and industry needs creating relevant programs and case studies aligned with their vision.",
  },
  {
    id: 9,
    iconSrc: "/images/services/capital.svg",
    title: "Human Capital Management",
    subtitle: "At Global ATD, people are the core of success.",
    description: "We align talent strategy with business goals through recruitment, performance, and development — building motivated, future-ready teams for sustainable growth.",
  },
];

export default function OurServices() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="bg-[#F8F9FA] py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24"n >

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
            Our Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
            At GATD, we deliver customised training and development solutions designed to empower individuals and organisations to excel. Our leadership development and corporate training programmes combine interactive workshops, e-learning, and virtual classrooms to create engaging, results-driven learning experiences.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const isActive = hoveredId === s.id;
            return (
              <div
                key={s.id}
                className={`rounded-2xl p-7 flex flex-col gap-4 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-[#D52029] shadow-xl shadow-[#D52029]/30 -translate-y-1"
                    : "bg-white shadow-sm hover:shadow-md"
                }`}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? "bg-white/15" : "bg-[#FFF4F4]"}`}>
                  <Image
                    src={s.iconSrc}
                    alt={s.title}
                    width={36}
                    height={36}
                    className={`w-9 h-9 object-contain transition-all duration-300 ${isActive ? "brightness-0 invert" : ""}`}
                  />
                </div>

                {/* Title */}
                <h3 className={`text-base sm:text-lg font-bold leading-snug transition-colors duration-300 ${isActive ? "text-white" : "text-[#414143]"}`}>
                  {s.title}
                </h3>

                {/* Subtitle */}
                <p className={`text-sm font-semibold leading-snug transition-colors duration-300 ${isActive ? "text-white/90" : "text-[#414143]"}`}>
                  {s.subtitle}
                </p>

                {/* Description */}
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${isActive ? "text-white/80" : "text-slate-500"}`}>
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
