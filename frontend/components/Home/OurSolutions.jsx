"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const solutions = [
  {
    id: "executive-educational",
    label: "Executive Educational Program",
    badge: "Solutions",
    title: "Executive Educational Program",
    description:
      "Global ATD's Executive Education Programs are crafted to equip senior leaders and high-potential executives with the strategic insight and leadership capabilities needed to navigate today's fast-changing business environment. Grounded in real-world application and future-forward thinking, our programs support leaders in translating learning into measurable organizational impact.",
    image:
      "/images/solutions/executive-educational/executive-education-program.jpg",
    href: "/solutions/executive-educational-program",
  },
  {
    id: "consulting-service",
    label: "Consulting Service",
    badge: "Solutions",
    title: "Consulting Service",
    description:
      "At Global ATD, we partner with ministries, regional and international organizations, and non-profit institutions to drive transformative impact through customized consulting solutions. Our deep expertise spans across public, private, and social sectors, helping clients align strategy with execution and build sustainable capabilities for the future. We specialize in developing and implementing talent and workforce strategies that future-proof organizations and enhance institutional effectiveness.",
    image: "/images/solutions/consulting-services/2.jpg",
    href: "/solutions/consulting-service",
  },
  {
    id: "customized-programs",
    label: "Customized Programs",
    badge: "Solutions",
    title: "Customized Programs",
    description:
      "Global ATD offers highly tailored executive learning experiences designed to address today’s most complex leadership challenges. Our customized programs equip senior leaders, boards, and executive teams with strategic insights and practical tools to navigate uncertainty, drive transformation, and sustain long-term impact. Each program is co-created with clients to align with their unique context and objectives—whether leading through crisis, optimizing operations, or preparing boards for strategic governance.",
    image: "/images/solutions/Customized-Programs/3.jpg",
    href: "/solutions/customized-programs",
  },
  {
    id: "certified-programs",
    label: "Certified Programs",
    badge: "Solutions",
    title: "Certified Programs",
    description:
      "Global ATD’s Certified Programs empower professionals to advance their expertise and earn globally recognized credentials in critical, high-demand fields. Each certification integrates practical knowledge, global best practices, and real-world application—driving immediate workplace results and sustainable career growth. Led by certified facilitators and industry experts, these programs balance theory with hands-on learning to build confidence and capability.",
    image: "/images/solutions/Certified-Programs/4.webp",
    href: "/solutions/certified-programs",
  },
  {
    id: "executive-retreats",
    label: "Executive Retreats",
    badge: "Solutions",
    title: "Executive Retreats",
    description:
      "At Global ATD, our Executive Retreats are thoughtfully designed experiences that combine strategic reflection with inspiration, collaboration, and renewal. Tailored for senior leaders and changemakers, each retreat serves as a catalyst for innovation, alignment, and growth—offering a unique space to pause, reflect, and reimagine the future. More than just a gathering, these retreats are transformative leadership journeys where vision meets experience.",
    image: "/images/solutions/Executive-Retreats/5.webp",
    href: "/solutions/executive-retreats",
  },
  {
    id: "incubators",
    label: "Incubators - Regional and International",
    badge: "Solutions",
    title: "Incubators — Regional and International",
    description:
      "The GATD Incubator cultivates innovation, leadership, and entrepreneurial growth across regions and industries. It offers mentorship, training, and strategic guidance to emerging leaders, startups, and organizations aiming for scalable, sustainable success.",
    image: "/images/solutions/Incubators/6.jpg",
    href: "/solutions/incubators-regional-international",
  },
  {
    id: "event-management",
    label: "Event Management",
    badge: "Solutions",
    title: "Event Management",
    description:
      "At Global ATD, we transform ideas into impactful experiences through strategically designed and flawlessly executed events. Whether it’s engaging key stakeholders, celebrating milestones, or unveiling new initiatives, our expert event management team ensures every element aligns with your objectives and delivers measurable results.",
    image: "/images/solutions/Event-Management/7.jpg",
    href: "/solutions/event-management",
  },
   {
    id: "global-conferences",
    label: "Global Conferences",
    badge: "Solutions",
    title: "Global Conferences",
    description:
      "Global ATD curates and delivers world-class conferences that unite visionary leaders, innovators, policymakers, and change-makers to shape the future of business, leadership, and society. Designed as dynamic platforms for strategic dialogue and collaboration, our conferences foster global connections and generate actionable insights that drive progress and transformation. Each conference is meticulously crafted to address critical global challenges, spotlight emerging trends, and inspire forward-thinking leadership across industries. By bringing together diverse voices and perspectives, Global ATD’s conferences create opportunities for knowledge exchange, networking, and strategic partnerships—empowering participants to lead with vision, innovate with purpose, and contribute meaningfully to global growth and development.",
    image: "/images/solutions/Global-Conferences/Global_Confrences.jpeg",
    href: "/solutions/global-conferences",
  },
   {
    id: "industry-specific",
    label: "Industry Specific",
    badge: "Solutions",
    title: "Industry Specific",
    description:
      "GATD designs specialised training solutions for key industries such as finance, healthcare, education, technology, and public service. Each program is tailored to current market realities and future trends, equipping participants with relevant skills and insights to thrive in their sector.",
    image: "/images/solutions/Industry-Specific/Industry-Specific.jpeg",
    href: "/solutions/industry-specific",
  },
];

export default function OurSolutions() {
  const [activeId, setActiveId] = useState(solutions[0].id);
  const active = solutions.find((s) => s.id === activeId);

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-bold text-[#414143] mb-8">
          Our Solutions
        </h2>

        {/* Heading row with View All on mobile */}
        <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
          <Link
            href="/solutions"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap ml-auto"
          >
            View All
          </Link>
        </div>

        {/* Tab Bar */}
        <div className="flex items-end gap-3 lg:gap-4 border-b border-slate-200 mb-10">
          {/* Scrollable tabs — clip & scroll within their own box */}
          <div className="flex items-start gap-0 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {solutions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`relative shrink-0 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-left leading-snug transition-colors duration-200 w-28 sm:w-auto sm:max-w-[140px] ${
                  activeId === s.id
                    ? "font-bold text-[#414143]"
                    : "font-medium text-slate-500 hover:text-slate-800"
                }`}
              >
                {s.label}
                {activeId === s.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D52029] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* View All — desktop only, reserves its own space so tabs never slide under it */}
          <div className="hidden lg:block shrink-0 pb-2">
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left — Text card */}
          <div className="bg-[#F5F5F5] rounded-3xl px-8 sm:px-10 py-10 sm:py-12 flex flex-col justify-center">
            <span className="inline-block self-start px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg mb-6 shadow-sm">
              {active.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#414143] mb-6 leading-tight">
              {active.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
              {active.description}
            </p>
            <Link
              href={active.href}
              className="inline-flex items-center justify-center self-start px-6 py-3 bg-[#D52029] hover:bg-red-700 text-white text-sm font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Explore More
            </Link>
          </div>

          {/* Right — Image */}
          <div
            className="relative w-full rounded-xl overflow-hidden"
            style={{ height: "clamp(280px, 35vw, 520px)" }}
          >
            <Image
              key={active.id}
              src={active.image}
              alt={active.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
