"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const features = [
  {
    id: 1,
    badge: "Key features",
    image: "/images/home/customized-training-programs.jpg",
    title: "Customized Training Programs",
    subtitle: null,
    description:
      "GATD delivers customized, industry-specific training programs designed to meet the unique needs, roles, and skill levels of organizations and individuals.",
    isHighlighted: true,
  },
  {
    id: 2,
    badge: "Key features",
    image: "/images/home/industry-relevant-curriculum.jpg",
    title: "Industry-Relevent Curriculum",
    subtitle: null,
    description: 
    "Our up-to-date training programs cover in-demand skills and industry trends, ensuring practical learning that meets current market needs.",
    isHighlighted: false,
  },
  {
    id: 3,
    badge: "Key features",
    image: "/images/home/expert-trainer.jpg",
    title: "Expert Trainers",
    subtitle: null,
    description: 
    "Our experienced industry experts deliver engaging, practical training that empowers individuals with valuable skills and real-world insights.",
    isHighlighted: false,
  },
  {
    id: 4,
    badge: "Key features",
    image: "/images/home/blended-learning.jpg",
    title: "Blended Learning Approach",
    subtitle: null,
    description: "Our blended learning approach combines classroom, online, and hands-on training to deliver an engaging and effective learning experience for every learner.",
    isHighlighted: false,
  },
  {
    id: 5,
    badge: "Key features",
    image: "/images/home/continuous-learning-support.jpg",
    title: "Continuous Learning Approach",
    subtitle: null,
    description: "We support continuous learning through ongoing resources, helping individuals apply their skills and stay ahead in their careers.",
    isHighlighted: false,
  },
  {
    id: 6,
    badge: "Key features",
    image: "/images/home/flexible-dilevery-options.jpg",
    title: "Flexible Delivery Options",
    subtitle: null,
    description: "We offer flexible on-site and virtual training solutions, making professional learning accessible anytime, anywhere.",
    isHighlighted: false,
  },
  {
    id: 7,
    badge: "Key features",
    image: "/images/home/future-management-consulting.jpg",
    title: "Future Management Consulting",
    subtitle: null,
    description: "Our proven training solutions help individuals and organizations achieve measurable results, improve performance, and drive lasting success.",
    isHighlighted: false,
  },
  // {
  //   id: 5,
  //   badge: "Key features",
  //    image: "/images/home/blended-learning.jpg",
  //   title: "Global Network Access",
  //   subtitle: null,
  //   description: null,
  //   isHighlighted: false,
  // },
  // {
  //   id: 6,
  //   badge: "Key features",
  //    image: "/images/home/blended-learning.jpg",
  //   title: "Certification Programs",
  //   subtitle: null,
  //   description: null,
  //   isHighlighted: false,
  // },
];

export default function KeyFeatures() {
  const scrollRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector(".feature-card")?.offsetWidth || 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardWidth - 16 : cardWidth + 16, behavior: "smooth" });
  };

  return (
    <section className="bg-[#F8F9FA] py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          {/* Title */}
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#414143] leading-tight">
              Key Features<br />Competitive Advantage
            </h2>
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => scroll("left")}
              className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards Scroll Strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {features.map((feature) => {
            const isActive = hoveredId === feature.id;

            return (
              <div
                key={feature.id}
                className="feature-card flex-shrink-0 rounded-2xl overflow-hidden relative cursor-pointer"
                style={{
                  width: "clamp(260px, 22vw, 310px)",
                  scrollSnapAlign: "start",
                }}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <div className="relative w-full" style={{ height: "300px" }}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* "Key features" badge — top left */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-block px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                      {feature.badge}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Content */}
                <div className={`px-5 pt-4 pb-4 flex flex-col transition-colors duration-300 ${isActive ? "bg-red-600" : "bg-white"}`}>
                  <h3 className={`text-lg sm:text-xl font-bold leading-snug transition-colors duration-300 ${isActive ? "text-white" : "text-slate-900"}`}>
                    {feature.title}
                  </h3>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                    {feature.subtitle && (
                      <p className="text-sm font-bold text-white mb-1">{feature.subtitle}</p>
                    )}
                    <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                      {feature.description || "GATD delivers world-class expertise in this area to help your organisation grow and succeed."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}