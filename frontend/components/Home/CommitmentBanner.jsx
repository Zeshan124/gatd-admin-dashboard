"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicCompanyProfileApi } from "@/lib/publicApi";

export default function CommitmentBanner({
  settingsKey,
  showBanner = true,
  showCta = true,
  ctaText,
  ctaUrl,
  eyebrow,
  heading,
}) {
  const [homeSettings, setHomeSettings] = useState({
    homeCommitmentBannerEyebrow: "",
    homeCommitmentBannerHeading: "",
    homeCommitmentCtaText: "",
    homeCommitmentCtaUrl: "",
    homeShowCommitmentBanner: true,
    homeShowCommitmentCta: false,
  });

  useEffect(() => {
    if (settingsKey !== "home") return;
    let active = true;
    publicCompanyProfileApi
      .get()
      .then((res) => {
        if (active) setHomeSettings((current) => ({ ...current, ...(res?.data || {}) }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [settingsKey]);

  const isHomeManaged = settingsKey === "home";
  const shouldShowBanner = isHomeManaged ? homeSettings.homeShowCommitmentBanner : showBanner;
  const shouldShowCta = isHomeManaged ? homeSettings.homeShowCommitmentCta : showCta;
  const buttonText = (isHomeManaged ? homeSettings.homeCommitmentCtaText : ctaText)?.trim() || "Get In Touch";
  const buttonUrl = (isHomeManaged ? homeSettings.homeCommitmentCtaUrl : ctaUrl)?.trim() || "/contact";
  const bannerEyebrow = (isHomeManaged ? homeSettings.homeCommitmentBannerEyebrow : eyebrow)?.trim() || "Global association for training and development";
  const bannerHeading =
    (isHomeManaged ? homeSettings.homeCommitmentBannerHeading : heading)?.trim() ||
    "We are Committed to Empowering Individuals and Organizations to Achieve Sustainable Growth.";

  if (!shouldShowBanner) return null;

  return (
    <section className="bg-white py-10 sm:py-12 md:py-14 border-y border-slate-200">
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">

          {/* Left — Eyebrow + Heading */}
          <div className="max-w-5xl">
            <p className="text-sm text-[#414143] font-medium mb-2">
              {bannerEyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#414143] leading-snug">
              {bannerHeading}
            </h2>
          </div>

          {/* Right — CTA Button */}
          {shouldShowCta && (
            <div className="shrink-0">
              <Link
                href={buttonUrl}
                className="inline-flex items-center justify-center px-8 py-4 bg-red-700 hover:bg-red-800 text-white text-sm sm:text-base font-bold rounded-md transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              >
                {buttonText}
              </Link>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}