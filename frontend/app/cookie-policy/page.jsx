import CookiePolicyContent from "@/components/Legal/CookiePolicyContent";
import CommitmentBanner from "@/components/Home/CommitmentBanner";

export const metadata = {
  title: "Cookie Policy | Global Association for Training and Development (GATD)",
  description:
    "How GATD uses cookies and similar technologies on www.globalatd.com, the cookies currently in use, and how to manage them.",
};

export default function CookiePolicy() {
  return (
    <main>
      <CookiePolicyContent />
      <CommitmentBanner />
    </main>
  );
}
