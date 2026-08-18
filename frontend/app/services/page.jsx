import ServicesHero from "@/components/Services/ServicesHero";
import OurServices from "@/components/Services/OurServices";
import KeyFeatures from "@/components/Services/KeyFeatures";
import WhatMakes from "@/components/Services/WhatMakes";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export default function Services() {
  return (
    <main>
      <ServicesHero />
      <WhatMakes />
      <OurServices />
      <KeyFeatures />
      <CommitmentBanner />
    </main>
  );
}
