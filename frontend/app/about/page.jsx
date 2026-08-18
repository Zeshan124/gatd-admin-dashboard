import AboutWhoWeAre from "@/components/About/AboutWhoWeAre";
import OurStory from "@/components/About/OurStory";
import AboutMissionStatement from "@/components/About/MissionStatement";
import TransformingPotential from "@/components/About/TransformingPotential";
import EnvisionedFutureVision from "@/components/About/EnvisionedFutureVision";
import FounderMessage from "@/components/About/FounderMessage";
import LatestUpdates from "@/components/Home/LatestUpdates";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export default function About() {
  return (
    <main>
      <AboutWhoWeAre />
      <OurStory />
      <TransformingPotential />
      <AboutMissionStatement />
      <EnvisionedFutureVision />
      <FounderMessage />
      <LatestUpdates />
      <CommitmentBanner />
    </main>
  );
}
