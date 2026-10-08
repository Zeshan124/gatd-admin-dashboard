import PrivacyPolicyContent from "@/components/Legal/PrivacyPolicyContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Privacy Policy | Global Association for Training and Development (GATD)",
  description:
    "How GATD Pte. Ltd. collects, uses, discloses, stores and protects personal data in accordance with the Singapore Personal Data Protection Act 2012 (PDPA).",
};

export default function PrivacyPolicy() {
  return (
    <main>
      <PrivacyPolicyContent />
      <CommitmentBanner />
    </main>
  );
}
