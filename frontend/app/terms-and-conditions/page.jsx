import TermsContent from "@/components/Legal/TermsContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Terms & Conditions | Global Association for Training and Development (GATD)",
  description:
    "The Terms & Conditions governing access to and use of the GATD website, www.globalatd.com, operated by GATD Pte. Ltd., Singapore.",
};

export default function TermsAndConditions() {
  return (
    <main>
      <TermsContent />
      <CommitmentBanner />
    </main>
  );
}
