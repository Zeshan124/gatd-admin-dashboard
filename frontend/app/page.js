import EnvisionedFuture from "@/components/Home/EnvisionedFuture";
import OurSolutions from "@/components/Home/OurSolutions";
import OurServices from "@/components/Home/OurServices";
import MissionStatement from "@/components/Home/MissionStatement";
import GATDHero from "@/components/Home/HeroSection";
import KeyFeatures from "@/components/Home/KeyFeatures";
import WhoWeAre from "@/components/Home/WhoWeAre";
import Testimonials from "@/components/Home/Testimonials";
import LatestUpdates from "@/components/Home/LatestUpdates";
import WhatWillLearningDo from "@/components/Home/WhatWillLearningDo";
import StrategicPartnership from "@/components/Home/StrategicPartnership";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export default function Home() {
  return (
    <main>
      <GATDHero />
      <WhoWeAre />
      <KeyFeatures />
      <EnvisionedFuture />
      <OurSolutions />
      <OurServices />
      <MissionStatement />
      <Testimonials />
      <LatestUpdates />
      <WhatWillLearningDo />
      <StrategicPartnership />
      <CommitmentBanner />
    </main>
  );
}
