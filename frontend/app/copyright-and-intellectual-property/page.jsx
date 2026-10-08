import CopyrightContent from "@/components/Legal/CopyrightContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Copyright & Intellectual Property Notice | Global Association for Training and Development (GATD)",
  description:
    "GATD's Copyright & Intellectual Property Notice covering ownership, protected materials, permitted use, programme materials, trademarks and permission requests.",
};

export default function CopyrightNotice() {
  return (
    <main>
      <CopyrightContent />
      <CommitmentBanner />
    </main>
  );
}
