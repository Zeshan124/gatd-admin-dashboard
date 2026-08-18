import SolutionsHero from "@/components/Solutions/SolutionsHero";
import SolutionsIntro from "@/components/Solutions/SolutionsIntro";
import SolutionsCatalog from "@/components/Solutions/SolutionsCatalog";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export default function Solutions() {
  return (
    <main>
      <SolutionsHero />
      <SolutionsIntro />
      <SolutionsCatalog />
      <CommitmentBanner />
    </main>
  );
}
