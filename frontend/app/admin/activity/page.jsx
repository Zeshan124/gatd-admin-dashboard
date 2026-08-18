import { Activity } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function ActivityPage() {
  return (
    <ComingSoon
      title="Activity"
      description="Audit log of admin actions and status changes."
      icon={Activity}
    />
  );
}
