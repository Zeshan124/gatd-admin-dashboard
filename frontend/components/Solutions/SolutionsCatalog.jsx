"use client";

import { useState, useRef } from "react";
import { Filter, X } from "lucide-react";
import SolutionCategoryRow from "./SolutionCategoryRow";

const catalog = [
  {
    id: "executive-educational",
    title: "Executive Educational Program",
    items: [
      {
        id: 1,
        title: "Singapore Potential Leadership Development Program (SPLDP)",
        image:
          "/images/solutions/executive-educational/Singapore-Potential.jpg",
        href: "/solutions/spldp",
        rating: 4.9,
        reviews: 312,
      },
      {
        id: 2,
        title: "Women in Leadership",
        image:
          "/images/solutions/executive-educational/Women-in-Leadership.jpg",
        href: "/solutions/women-in-leadership",
        rating: 4.8,
        reviews: 256,
      },
      {
        id: 3,
        title: "Next-Gen Strategic Leadership for CxOs",
        image:
          "/images/solutions/executive-educational/Next-Gen-Strategic-Leadership.jpg",
        href: "/solutions/next-gen-cxo",
        rating: 4.9,
        reviews: 198,
      },
      {
        id: 4,
        title: "Global CEO Executive Leadership Mastery Program",
        image:
          "/images/solutions/executive-educational/Global-CEO-Executive-Leadership-Mastery.jpg",
        href: "/solutions/ceo-mastery",
        rating: 5.0,
        reviews: 174,
      },
      {
        id: 5,
        title: "MetroMinds – Leadership and City Marketing & Global",
        image: "/images/solutions/executive-educational/MetroMinds.jpg",
        href: "/solutions/metroMinds",
        rating: 4.7,
        reviews: 142,
      },
      {
        id: 6,
        title: "Executive Leadership in Strategy, Innovation & AI",
        image:
          "/images/solutions/executive-educational/Global-CEO-Executive.jpg",
        href: "/solutions/ceo-mastery",
        rating: 4.8,
        reviews: 188,
      },
      {
        id: 7,
        title: "Global Operations in Excellence (GOiE) Program",
        image:
          "/images/solutions/executive-educational/Global-Operations-in-Excellence.jpg",
        href: "/solutions/ceo-mastery",
        rating: 4.7,
        reviews: 121,
      },
    ],
  },
  {
    id: "consulting-service",
    title: "Consulting Service",
    items: [
      {
        id: 1,
        title: "Ministries Regional & International",
        image: "/images/solutions/consulting-services/consulting-1.jpg",
        href: "/solutions/ministries",
        rating: 4.8,
        reviews: 96,
      },
      {
        id: 2,
        title: "Talent Development & Succession Planning",
        image: "/images/solutions/consulting-services/consulting-2.jpg",
        href: "/solutions/talent-development",
        rating: 4.9,
        reviews: 210,
      },
      {
        id: 3,
        title: "Strategic Workforce Planning and Development",
        image: "/images/solutions/consulting-services/consulting-3.jpg",
        href: "/solutions/workforce-planning",
        rating: 4.7,
        reviews: 154,
      },
      {
        id: 4,
        title: "Balanced Scorecard & Performance Management",
        image: "/images/solutions/consulting-services/consulting-4.jpg",
        href: "/solutions/balanced-scorecard",
        rating: 4.8,
        reviews: 176,
      },
      {
        id: 5,
        title: "Initiation and Implementation of Professional Academies",
        image: "/images/solutions/consulting-services/consulting-5.jpg",
        href: "/solutions/professional-academies",
        rating: 4.6,
        reviews: 88,
      },
      {
        id: 6,
        title: "HR Portals",
        image: "/images/solutions/consulting-services/consulting-6.jpg",
        href: "/solutions/hr-portals",
        rating: 4.7,
        reviews: 112,
      },
      {
        id: 7,
        title: "Non-Profit Welfare Organizations",
        image: "/images/solutions/consulting-services/consulting-7.jpg",
        href: "/solutions/non-profit-welfare",
        rating: 4.6,
        reviews: 74,
      },
    ],
  },
  {
    id: "customized-programs",
    title: "Customized Programs",
    items: [
      {
        id: 1,
        title: "Risk & Crisis Management Leadership",
        image: "/images/solutions/Customized-Programs/custom-1.jpg",
        href: "/solutions/risk-crisis",
        rating: 4.9,
        reviews: 183,
      },
      {
        id: 2,
        title: "Strategic Rightsizing",
        image: "/images/solutions/Customized-Programs/custom-2.jpg",
        href: "/solutions/strategic-rightsizing",
        rating: 4.7,
        reviews: 109,
      },
      {
        id: 3,
        title: "Transformation Leadership in Mergers & Acquisitions",
        image: "/images/solutions/Customized-Programs/custom-3.jpg",
        href: "/solutions/mergers-acquisitions",
        rating: 4.8,
        reviews: 146,
      },
      {
        id: 4,
        title: "Global Operations in Excellence (GOiE)",
        image: "/images/solutions/Customized-Programs/custom-4.jpg",
        href: "/solutions/goie",
        rating: 4.7,
        reviews: 127,
      },
      {
        id: 5,
        title: "Corporate Governance",
        image: "/images/solutions/Customized-Programs/custom-5.jpg",
        href: "/solutions/corporate-governance",
        rating: 4.8,
        reviews: 165,
      },
      {
        id: 6,
        title: "Organizational Culture & Change Leadership",
        image: "/images/solutions/Customized-Programs/custom-6.jpg",
        href: "/solutions/organizational-culture",
        rating: 4.9,
        reviews: 192,
      },
      {
        id: 7,
        title: "Leading the Board",
        image: "/images/solutions/Customized-Programs/custom-7.jpg",
        href: "/solutions/leading-the-board",
        rating: 4.8,
        reviews: 138,
      },
    ],
  },
  {
    id: "certified-programs",
    title: "Certified Programs",
    items: [
      {
        id: 1,
        title: "Strategic Human Resources, Business Leadership and Management",
        image: "/images/solutions/Certified-Programs/certified-1.jpg",
        href: "/solutions/strategic-hr",
        rating: 4.9,
        reviews: 428,
      },
      {
        id: 2,
        title: "Change Management",
        image: "/images/solutions/Certified-Programs/certified-2.jpg",
        href: "#",
        rating: 4.8,
        reviews: 312,
      },
      {
        id: 3,
        title: "Public Private Partnerships",
        image: "/images/solutions/Certified-Programs/certified-3.jpg",
        href: "#",
        rating: 4.7,
        reviews: 176,
      },
      {
        id: 4,
        title: "Key Performance Indicators (KPIs)",
        image: "/images/solutions/Certified-Programs/certified-4.jpg",
        href: "#",
        rating: 4.8,
        reviews: 254,
      },
      {
        id: 5,
        title: "Performance Management",
        image: "/images/solutions/Certified-Programs/certified-5.jpg",
        href: "#",
        rating: 4.9,
        reviews: 298,
      },
      {
        id: 6,
        title: "Digital Marketing",
        image: "/images/solutions/Certified-Programs/certified-6.jpg",
        href: "#",
        rating: 4.8,
        reviews: 367,
      },
    ],
  },
  {
    id: "executive-retreats",
    title: "Executive Retreats",
    items: [
      {
        id: 1,
        title: "Strategic Reset Retreat",
        image: "/images/solutions/Executive-Retreats/retreat-1.jpg",
        href: "/solutions/strategic-reset",
        rating: 4.9,
        reviews: 86,
      },
      {
        id: 2,
        title: "The Great Gatsby Gala",
        image: "/images/solutions/Executive-Retreats/retreat-2.jpg",
        href: "/solutions/gatsby-gala",
        rating: 4.8,
        reviews: 72,
      },
      {
        id: 3,
        title: "The All-Star Carnival",
        image: "/images/solutions/Executive-Retreats/retreat-3.jpg",
        href: "/solutions/all-star-carnival",
        rating: 4.7,
        reviews: 64,
      },
    ],
  },
  {
    id: "incubators",
    title: "Incubators - Regional & International",
    items: [
      {
        id: 1,
        title: "Global HealthTech",
        image: "/images/solutions/Incubators/incubator-1.jpg",
        href: "/solutions/global-healthtech",
        rating: 4.8,
        reviews: 94,
      },
      {
        id: 2,
        title: "Net Zero Innovation lab",
        image: "/images/solutions/Incubators/incubator-2.jpg",
        href: "/solutions/net-zero",
        rating: 4.9,
        reviews: 118,
      },
      {
        id: 3,
        title: "GovTech Catalyst Hub",
        image: "/images/solutions/Incubators/incubator-3.jpg",
        href: "/solutions/govtech",
        rating: 4.7,
        reviews: 82,
      },
      {
        id: 4,
        title: "EdTech Skills",
        image: "/images/solutions/Incubators/incubator-4.jpg",
        href: "/solutions/edtech",
        rating: 4.8,
        reviews: 103,
      },
      {
        id: 5,
        title: "Diaspora Innovation Network",
        image: "/images/solutions/Incubators/incubator-5.jpg",
        href: "/solutions/diaspora-innovation-network",
        rating: 4.6,
        reviews: 57,
      },
    ],
  },
  {
    id: "event-management",
    title: "Event Management",
    items: [
      {
        id: 1,
        title: "Program Management",
        image: "/images/solutions/Event-Management/event-1.jpg",
        href: "/solutions/program-management",
        rating: 4.8,
        reviews: 132,
      },
      {
        id: 2,
        title: "Corporate Social Responsibility (CSR) Events",
        image: "/images/solutions/Event-Management/event-2.jpg",
        href: "/solutions/csr-events",
        rating: 4.7,
        reviews: 98,
      },
      {
        id: 3,
        title: "Product Launches & Brand Activation Events",
        image: "/images/solutions/Event-Management/event-3.jpg",
        href: "/solutions/product-launches",
        rating: 4.9,
        reviews: 145,
      },
      {
        id: 4,
        title: "Trade Shows and Expo Management",
        image: "/images/solutions/Event-Management/event-4.jpg",
        href: "/solutions/trade-shows",
        rating: 4.7,
        reviews: 87,
      },
      {
        id: 5,
        title: "Award Ceremonies & Gala Dinners",
        image: "/images/solutions/Event-Management/event-5.jpg",
        href: "/solutions/award-ceremonies",
        rating: 4.9,
        reviews: 121,
      },
    ],
  },
  {
    id: "global-conferences",
    title: "Global Conferences",
    items: [
      {
        id: 1,
        title: "Global Marketing Forum",
        image: "/images/solutions/Global-Conferences/conference-1.jpg",
        href: "/solutions/global-marketing-forum",
        rating: 4.8,
        reviews: 216,
      },
      {
        id: 2,
        title: "Energy Governance & Leadership Summit",
        image: "/images/solutions/Global-Conferences/conference-2.jpg",
        href: "/solutions/energy-governance",
        rating: 4.9,
        reviews: 178,
      },
      {
        id: 3,
        title: "The Zero Summit - Strategic Dialogues for a Net Zero World",
        image: "/images/solutions/Global-Conferences/conference-3.jpg",
        href: "/solutions/zero-summit",
        rating: 4.8,
        reviews: 154,
      },
      {
        id: 4,
        title:
          "PetroForesight 2030: The Leadership Blueprint for Energy Transition",
        image: "/images/solutions/Global-Conferences/conference-4.jpg",
        href: "/solutions/petroforesight",
        rating: 4.7,
        reviews: 132,
      },
    ],
  },
  {
    id: "industry-specific",
    title: "Industry Specific",
    items: [
      {
        id: 1,
        title: "Advanced Program in Financial Strategy for Executives",
        image: "/images/solutions/Industry-Specific/industry-1.jpg",
        href: "/solutions/financial-strategy",
        rating: 4.8,
        reviews: 167,
      },
      {
        id: 2,
        title: "Innovation Design into Action",
        image: "/images/solutions/Industry-Specific/industry-2.jpg",
        href: "/solutions/innovation-design",
        rating: 4.7,
        reviews: 124,
      },
      {
        id: 3,
        title: "Global Marketing & Sales Leadership",
        image: "/images/solutions/Industry-Specific/industry-3.jpg",
        href: "/solutions/marketing-sales",
        rating: 4.9,
        reviews: 198,
      },
      {
        id: 4,
        title: "Strategic Leadership Across Healthcare Ecosystems",
        image: "/images/solutions/Industry-Specific/industry-4.jpg",
        href: "/solutions/healthcare-leadership",
        rating: 4.8,
        reviews: 143,
      },
      {
        id: 5,
        title: "High Performance Governments",
        image: "/images/solutions/Industry-Specific/industry-5.jpg",
        href: "/solutions/high-performance-governments",
        rating: 4.7,
        reviews: 89,
      },
      {
        id: 6,
        title: "Family Business & Entrepreneurship",
        image: "/images/solutions/Industry-Specific/industry-6.jpg",
        href: "/solutions/family-business-leadership",
        rating: 4.9,
        reviews: 176,
      },
      {
        id: 7,
        title: "Real Estate – Smart Investing",
        image: "/images/solutions/Industry-Specific/industry-7.jpg",
        href: "/solutions/real-estate-smart-investing",
        rating: 4.8,
        reviews: 158,
      },
    ],
  },
];

const INITIAL_VISIBLE = 2;
const LOAD_MORE_COUNT = 2;

export default function SolutionsCatalog() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filtered = activeFilter
    ? catalog.filter((c) => c.id === activeFilter)
    : catalog;

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when filter changes
  const handleFilter = (id) => {
    setActiveFilter(id);
    setVisibleCount(INITIAL_VISIBLE);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <section className="bg-[#F8F8F8] py-10 sm:py-14 md:py-16">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:border-[#D52029] hover:text-[#D52029] transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {activeFilter && (
            <button
              onClick={handleClearFilter}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#D52029] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {filterOpen && (
          <div className="flex flex-wrap gap-2 mb-10 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            {catalog.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeFilter === cat.id
                    ? "bg-[#D52029] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-[#D52029] hover:text-white"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* Category rows */}
        {displayed.map((category) => (
          <SolutionCategoryRow
            key={category.id}
            title={category.title}
            items={category.items}
            clickable={category.id === "certified-programs"}
          />
        ))}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-4 mb-6">
            <button
              onClick={() => setVisibleCount((v) => v + LOAD_MORE_COUNT)}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#D52029] text-[#D52029] hover:bg-[#D52029] hover:text-white text-sm font-bold rounded-lg transition-all duration-200"
            >
              Load More
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
