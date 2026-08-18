import { Users } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export default function UsersPage() {
  return (
    <ComingSoon
      title="Users"
      description="Dashboard accounts and roles."
      icon={Users}
    />
  );
}
