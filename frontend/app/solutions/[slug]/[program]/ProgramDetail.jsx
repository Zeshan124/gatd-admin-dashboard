"use client";

// Client-rendered Subprogram page (a solution_program). Reads the program slug
// from the URL and fetches it live from the CMS, so new/edited Subprograms
// appear without a rebuild. Served via /solutions/__slug__/__program__ template
// + a public/.htaccess fallback rewrite.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { publicSolutionsApi } from "@/lib/publicApi";
import ProgramsHero from "@/components/Solutions/Programs/ProgramsHero";
import ProgramOverview from "@/components/Solutions/Programs/ProgramOverview";
import CertificationFocus from "@/components/Solutions/Programs/CertificationFocus";
import StrategicPillars from "@/components/Solutions/Programs/StrategicPillars";
import PrecisionManagement from "@/components/Solutions/Programs/PrecisionManagement";
import TrainerSessions from "@/components/Solutions/Programs/TrainerSessions";
import ExecutiveCurriculum from "@/components/Solutions/Programs/ExecutiveCurriculum";
import PerformanceHexagons from "@/components/Solutions/Programs/PerformanceHexagons";
import PeopleStrategyPanels from "@/components/Solutions/Programs/PeopleStrategyPanels";
import LearningJourney from "@/components/Solutions/Programs/LearningJourney";
import OrgDevelopmentFramework from "@/components/Solutions/Programs/OrgDevelopmentFramework";
import ProgramFacilitator from "@/components/Solutions/Programs/ProgramFacilitator";
import RecognizedSpeaker from "@/components/Solutions/Programs/RecognizedSpeaker";
import AccreditedBy from "@/components/Solutions/Programs/AccreditedBy";
import ProgramPricing from "@/components/Solutions/Programs/ProgramPricing";
import ProgramFAQ from "@/components/Solutions/Programs/ProgramFAQ";
import ProgramRegistration from "@/components/Solutions/Programs/ProgramRegistration";
import WhatYouWillGain from "@/components/Solutions/Programs/WhatYouWillGain";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

function currentSlug() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean); // ["solutions","<child>","<program>"]
  return parts[parts.length - 1] || null;
}

// The admin's `layoutType` picks which curriculum layout renders; `layoutData`
// ({ heading, badge, days, [modulesByDay] }) feeds it.
function LayoutSection({ program }) {
  const ld = program.layoutData;
  if (!ld || !ld.heading) return null;
  const props = { heading: ld.heading, badge: ld.badge, days: ld.days };
  switch (program.layoutType) {
    case "precision_pillars":
      return <PrecisionManagement {...props} />;
    case "people_strategy_panels":
      return <PeopleStrategyPanels {...props} />;
    case "learning_journey":
      return <LearningJourney {...props} />;
    case "org_framework":
      return <OrgDevelopmentFramework {...props} />;
    case "session_plan":
      return <TrainerSessions {...props} />;
    case "curriculum":
      return <ExecutiveCurriculum {...props} />;
    case "hexagons":
      return <PerformanceHexagons {...props} />;
    default: // strategic_pillars
      return <StrategicPillars heading={ld.heading} badge={ld.badge} days={ld.days} modulesByDay={ld.modulesByDay} />;
  }
}

export default function ProgramDetail() {
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [program, setProgram] = useState(null);

  const load = useCallback(async () => {
    const slug = currentSlug();
    if (!slug || slug === "__program__") {
      setStatus("notfound");
      return;
    }
    setStatus("loading");
    try {
      // Preview: a ?preview= / ?key= token loads a Draft/Hidden program by link.
      const qp = new URLSearchParams(window.location.search);
      const preview = qp.get("preview") || qp.get("key") || "";
      const res = await publicSolutionsApi.program(slug, preview);
      setProgram(res.data || res);
      setStatus("ready");
    } catch (e) {
      setStatus(e.status === 404 ? "notfound" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (program?.title) document.title = `${program.title} — GATD`;
  }, [program]);

  if (status === "loading") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center pt-28 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading…
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Programme not found</h1>
        <p className="text-slate-500">This page may have been moved or unpublished.</p>
        <Link href="/solutions/" className="mt-2 inline-flex items-center gap-1 font-semibold text-[#D52029]">
          <ArrowLeft className="h-4 w-4" /> All solutions
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="font-semibold text-slate-700">Couldn&apos;t load this page</p>
        <button onClick={load} className="mt-2 rounded-lg bg-[#D52029] px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </main>
    );
  }

  const priceStr = program.priceCents != null ? (program.priceCents / 100).toLocaleString() : null;

  return (
    // overflow-x-clip prevents a stray decorative/edge element in any section from
    // making the whole page scroll sideways on mobile (clip = no scroll-container side effects).
    <main className="overflow-x-clip">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-3">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Link href="/" className="hover:text-[#D52029] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/solutions" className="hover:text-[#D52029] transition-colors">Solutions</Link>
            {program.childSolutionSlug && (
              <>
                <span>/</span>
                <Link
                  href={`/solutions/${program.childSolutionSlug}`}
                  className="hover:text-[#D52029] transition-colors truncate max-w-[100px] sm:max-w-40"
                >
                  {program.childSolutionTitle || program.childSolutionSlug}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-[#414143] font-medium truncate max-w-[120px] sm:max-w-[200px]">{program.title}</span>
          </nav>
        </div>
      </div>

      <ProgramsHero program={program} />
      {program.overview && (
        <ProgramOverview
          title={program.overview.title}
          description={program.overview.description}
          image={program.overview.image}
        />
      )}
      <LayoutSection program={program} />
      {program.focusAreas?.length > 0 && (
        <CertificationFocus heading={program.focusHeading} focusAreas={program.focusAreas} leftImage={program.focusImage} />
      )}
      {program.gains?.length > 0 && (
        <WhatYouWillGain heading={program.gainsHeading} gains={program.gains} />
      )}
      {program.facilitator && <ProgramFacilitator facilitator={program.facilitator} />}
      {program.certification && <RecognizedSpeaker certification={program.certification} />}
      {program.showAccreditedBy !== false && (
        <AccreditedBy heading={program.accreditedHeading} logos={program.accreditedLogos} />
      )}
      {(program.pricingHeading || priceStr || program.pricingNote) && (
        <ProgramPricing
          heading={program.pricingHeading}
          currency={program.currency}
          price={priceStr}
          period={program.pricingPeriod}
          description={program.pricingDescription}
          note={program.pricingNote}
        />
      )}
      {program.faqs?.length > 0 && <ProgramFAQ faqs={program.faqs} />}
      {program.showRegistration !== false && (
        <ProgramRegistration
          heading={program.registrationHeading || `For ${program.title}`}
          options={(program.registrationOptions || []).map((o) => ({
            slug: o.slug,
            label: o.title,
            price: o.priceCents != null ? o.priceCents / 100 : 0,
            currency: o.currency,
          }))}
          solutionTitle={program.parentSolutionTitle}
          programTitle={program.childSolutionTitle}
        />
      )}
      <CommitmentBanner />
    </main>
  );
}
