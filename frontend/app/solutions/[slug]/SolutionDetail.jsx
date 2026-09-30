"use client";

// Client-rendered Program page (a child_solution). Reads the slug from the URL
// and fetches it live from the CMS, so new/edited Programs appear without a
// rebuild (mirrors the blog pattern). Served via the /solutions/__slug__
// template + a public/.htaccess fallback rewrite.

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { publicSolutionsApi } from "@/lib/publicApi";
import SolutionHero from "@/components/Solutions/SolutionHero";
import SolutionMiddle from "@/components/Solutions/SolutionMiddle";
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
  const [kind, setKind] = useState("child"); // "child" (Program) | "parent" (Solution)

  const load = useCallback(async () => {
    const slug = currentSlug();
    if (!slug || slug === "__slug__") {
      setStatus("notfound");
      return;
    }
    setStatus("loading");
    // First try a Program (child solution). If the slug isn't one, fall back to a
    // Solution (parent) page — both live under /solutions/<slug>.
    try {
      // Preview: a ?preview= / ?key= token loads a Draft/Hidden program by link.
      const qp = new URLSearchParams(window.location.search);
      const preview = qp.get("preview") || qp.get("key") || "";
      const res = await publicSolutionsApi.child(slug, preview);
      const d = res.data || res;
      if (Array.isArray(d.programmes)) {
        d.programmes = d.programmes.map((p, i) => ({ id: p.slug || i, ...p }));
      }
      setKind("child");
      setSolution(d);
      setStatus("ready");
      return;
    } catch (e) {
      if (e.status !== 404) {
        setStatus("error");
        return;
      }
    }
    // Not a Program → try a main Solution (parent) page.
    try {
      const res = await publicSolutionsApi.parent(slug);
      const d = res.data || res;
      d.programmes = (Array.isArray(d.children) ? d.children : []).map((c, i) => ({
        id: c.slug || i,
        title: c.title,
        href: c.href,
        image: c.cardImage,
        rating: c.rating,
        reviews: c.reviews,
        ratingEnabled: c.ratingEnabled,
      }));
      setKind("parent");
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

  // ── Main Solution (parent) page: hero + middle section + its Programs grid ──
  if (kind === "parent") {
    return (
      <main className="overflow-x-clip">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-3">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <Link href="/" className="hover:text-[#D52029] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/solutions" className="hover:text-[#D52029] transition-colors">Solutions</Link>
              <span>/</span>
              <span className="text-[#414143] font-medium truncate max-w-40 sm:max-w-xs">{solution.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero: eyebrow + title + description + banner */}
        <section className="bg-white py-12 sm:py-16 md:py-16 border-b border-slate-200">
          <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
            <p className="text-xs sm:text-sm font-bold tracking-widest text-[#414143] uppercase mb-4">
              {solution.eyebrow || "Our Solutions"}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-10 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-[#414143] leading-tight">
                {solution.title}
              </h1>
              {solution.description && (
                <div className="flex flex-col justify-center">
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{solution.description}</p>
                </div>
              )}
            </div>
            {solution.banner && (
              <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(240px, 38vw, 500px)" }}>
                <Image src={solution.banner} alt={solution.title} fill className="object-cover object-center" priority />
              </div>
            )}
          </div>
        </section>

        {/* Middle section: left graphic + right content */}
        <SolutionMiddle
          image={solution.middleImage}
          badge={solution.middleBadge}
          heading={solution.middleHeading}
          body={solution.middleBody}
        />

        {/* Programs grid */}
        {solution.programmes?.length > 0 && (
          <SolutionProgrammes programmes={solution.programmes} />
        )}

        <CommitmentBanner />
      </main>
    );
  }

  return (
    // overflow-x-clip prevents a stray decorative/edge element in any section from
    // making the whole page scroll sideways on mobile (clip = no scroll-container side effects).
    <main className="overflow-x-clip">
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
