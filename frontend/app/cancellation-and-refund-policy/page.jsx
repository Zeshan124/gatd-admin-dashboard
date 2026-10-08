import CancellationRefundContent from "@/components/Legal/CancellationRefundContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Cancellation & Refund Policy | Global Association for Training and Development (GATD)",
  description:
    "GATD's Cancellation & Refund Policy for programmes, executive education, events, conferences, retreats and other paid services.",
};

export default function CancellationRefundPolicy() {
  return (
    <main>
      <CancellationRefundContent />
      <CommitmentBanner />
    </main>
  );
}
