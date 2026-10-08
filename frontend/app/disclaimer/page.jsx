import DisclaimerContent from "@/components/Legal/DisclaimerContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Disclaimer | Global Association for Training and Development (GATD)",
  description:
    "Disclaimer for the GATD website, www.globalatd.com, covering general information, programme outcomes, accreditation references, third-party content and limitation of responsibility.",
};

export default function Disclaimer() {
  return (
    <main>
      <DisclaimerContent />
      <CommitmentBanner />
    </main>
  );
}
