import { notFound } from "next/navigation";
import Link from "next/link";
import { programsData } from "@/lib/programsData";
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
import CommitmentBanner from "@/components/Home/CommitmentBanner";
import WhatYouWillGain from "@/components/Solutions/Programs/WhatYouWillGain";

export async function generateStaticParams() {
  return Object.entries(programsData).map(([program, data]) => ({
    slug: data.parentSlug,
    program,
  }));
}

export async function generateMetadata({ params }) {
  const program = programsData[params.program];
  if (!program) return {};
  return {
    title: `${program.title} — GATD`,
    description: program.description,
  };
}

export default function ProgramPage({ params }) {
  const program = programsData[params.program];
  if (!program) notFound();

  return (
    <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-3">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <Link href="/" className="hover:text-[#D52029] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/solutions" className="hover:text-[#D52029] transition-colors">Solutions</Link>
              <span>/</span>
              <Link href={`/solutions/${program.parentSlug}`} className="hover:text-[#D52029] transition-colors truncate max-w-[100px] sm:max-w-40">
                {program.parentTitle}
              </Link>
              <span>/</span>
              <span className="text-[#414143] font-medium truncate max-w-[120px] sm:max-w-[200px]">{program.title}</span>
            </nav>
          </div>
        </div>

        {/* Components will be added here as you share them */}
          <ProgramsHero program={{ ...program, slug: params.program }} />
          {/* <ProgramOverview /> */}
          <ProgramOverview
            title={program.overview.title}
            description={program.overview.description}
            image={program.overview.image}
          />
          
          {program.precisionPillars ? (
            <PrecisionManagement
              heading={program.precisionPillars.heading}
              badge={program.precisionPillars.badge}
              days={program.precisionPillars.days}
            />
          ) : program.strategyPanels ? (
            <PeopleStrategyPanels
              heading={program.strategyPanels.heading}
              badge={program.strategyPanels.badge}
              days={program.strategyPanels.days}
            />
          ) : program.learningJourney ? (
            <LearningJourney
              heading={program.learningJourney.heading}
              badge={program.learningJourney.badge}
              days={program.learningJourney.days}
            />
          ) : program.orgFramework ? (
            <OrgDevelopmentFramework
              heading={program.orgFramework.heading}
              badge={program.orgFramework.badge}
              days={program.orgFramework.days}
            />
          ) : program.sessionPlan ? (
            <TrainerSessions
              heading={program.sessionPlan.heading}
              badge={program.sessionPlan.badge}
              days={program.sessionPlan.days}
            />
          ) : program.curriculum ? (
            <ExecutiveCurriculum
              heading={program.curriculum.heading}
              badge={program.curriculum.badge}
              days={program.curriculum.days}
            />
          ) : program.hexagons ? (
            <PerformanceHexagons
              heading={program.hexagons.heading}
              badge={program.hexagons.badge}
              days={program.hexagons.days}
            />
          ) : (
            <StrategicPillars
              heading={program.pillarHeading}
              badge={program.pillarBadge}
              days={program.pillarDays}
              modulesByDay={program.pillarModules}
            />
          )}
         
                    
                 
                  <CertificationFocus
            heading={program.focusHeading}
            focusAreas={program.focusAreas}
          />
          <WhatYouWillGain heading={program.gainsHeading} gains={program.gains} />
                  
                  <ProgramFacilitator facilitator={program.facilitator} />
                  <RecognizedSpeaker certification={program.certification} />
                  <AccreditedBy />
                  <ProgramPricing
                    heading={program.pricingHeading}
                    currency={program.pricingCurrency}
                    price={program.price}
                    period={program.pricingPeriod}
                    description={program.pricingDescription}
                  />
                  <ProgramFAQ faqs={program.faqs} />
                  <ProgramRegistration
                    badge={program.registrationBadge}
                    heading={program.registrationHeading || `For ${program.title}`}
                    backgroundImage={program.registrationBg}
                  />
                  <CommitmentBanner />
    </main>
  );
}
