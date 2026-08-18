import { notFound } from "next/navigation";
import Link from "next/link";
import SolutionHero from "@/components/Solutions/SolutionHero";
import CommitmentToExcellence from "@/components/Solutions/CommitmentToExcellence";
import SolutionProgrammes from "@/components/Solutions/SolutionProgrammes";
import WhatYoullGain from "@/components/Solutions/WhatYoullGain";
import ProgrammeSuiteFor from "@/components/Solutions/ProgrammeSuiteFor";
import WhyWorthInvestment from "@/components/Solutions/WhyWorthInvestment";
import { solutionsData } from "@/lib/solutionsData";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export async function generateStaticParams() {
  return Object.keys(solutionsData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const solution = solutionsData[params.slug];
  if (!solution) return {};
  return {
    title: `${solution.title} — GATD`,
    description: solution.description,
  };
}

export default function SolutionPage({ params }) {
  const solution = solutionsData[params.slug];
  if (!solution) notFound();

  return (
    <main>
        {/* Breadcrumb — only shown for individual pages with a parent */}
        {solution.parentSlug && (
          <div className="bg-white border-b border-slate-100">
            <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-3">
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <Link href="/" className="hover:text-[#D52029] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/solutions" className="hover:text-[#D52029] transition-colors">Solutions</Link>
                <span>/</span>
                <span className="text-[#414143] font-medium truncate max-w-[120px] sm:max-w-[200px]">{solution.title}</span>
              </nav>
            </div>
          </div>
        )}
        <SolutionHero solution={solution} />
        <CommitmentToExcellence mapImage={solution.mapImage} />
        {solution.programmes?.length > 0 && (
          <SolutionProgrammes
            programmes={solution.programmes}
            heading={solution.programmesHeading}
          />
        )}
        {solution.gains && (
          <WhatYoullGain heading={solution.gainsHeading} gains={solution.gains} />
        )}
       
        {solution.audience && (
          <ProgrammeSuiteFor
            badge={solution.audienceBadge}
            heading={solution.audienceHeading}
            audience={solution.audience}
            backgroundImage={solution.audienceImage}
          />
        )}

         {solution.whyImage && (
          <WhyWorthInvestment
            heading={solution.whyHeading}
            badge={solution.whyBadge}
            centerImage={solution.whyImage}
          />
        )}

        <CommitmentBanner />
    </main>
  );
}
