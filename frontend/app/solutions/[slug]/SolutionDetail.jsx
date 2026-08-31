"use client";

// Client-rendered Program page (a child_solution). Reads the slug from the URL
// and fetches it live from the CMS, so new/edited Programs appear without a
// rebuild (mirrors the blog pattern). Served via the /solutions/__slug__
// template + a public/.htaccess fallback rewrite.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { publicSolutionsApi } from "@/lib/publicApi";
import SolutionHero from "@/components/Solutions/SolutionHero";
import CommitmentToExcellence from "@/components/Solutions/CommitmentToExcellence";
import SolutionProgrammes from "@/components/Solutions/SolutionProgrammes";
import WhatYoullGain from "@/components/Solutions/WhatYoullGain";
import ProgrammeSuiteFor from "@/components/Solutions/ProgrammeSuiteFor";
import WhyWorthInvestment from "@/components/Solutions/WhyWorthInvestment";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

function currentSlug() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean); // ["solutions", "<slug>"]
  return parts[parts.length - 1] || null;
}

export default function SolutionDetail() {
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [solution, setSolution] = useState(null);

  const load = useCallback(async () => {
    const slug = currentSlug();
    if (!slug || slug === "__slug__") {
      setStatus("notfound");
      return;
    }
    setStatus("loading");
    try {
      const res = await publicSolutionsApi.child(slug);
      const d = res.data || res;
      if (Array.isArray(d.programmes)) {
        d.programmes = d.programmes.map((p, i) => ({ id: p.slug || i, ...p }));
      }
      setSolution(d);
      setStatus("ready");
    } catch (e) {
      setStatus(e.status === 404 ? "notfound" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (solution?.title) document.title = `${solution.title} — GATD`;
  }, [solution]);

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
        <h1 className="text-2xl font-bold text-slate-800">Solution not found</h1>
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

  return (
    <main>
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
        <SolutionProgrammes programmes={solution.programmes} heading={solution.programmesHeading} />
      )}
      {solution.gains?.length > 0 && (
        <WhatYoullGain heading={solution.gainsHeading} gains={solution.gains} />
      )}
      {solution.audience?.length > 0 && (
        <ProgrammeSuiteFor
          badge={solution.audienceBadge}
          heading={solution.audienceHeading}
          audience={solution.audience}
          backgroundImage={solution.audienceImage}
        />
      )}
      {solution.whyImage && (
        <WhyWorthInvestment heading={solution.whyHeading} badge={solution.whyBadge} centerImage={solution.whyImage} />
      )}
      <CommitmentBanner />
    </main>
  );
}
