"use client";

import { EnhancedShowCreation } from "@/components/super-admin/enhanced-show-creation";
import { useRouter } from "next/navigation";

export default function CreateShowPage() {
  const router = useRouter();

  const handleShowCreated = (show: any) => {
    // Redirect to shows tab in super-admin dashboard after successful creation
    router.push("/super-admin?tab=shows");
  };

  const handleCancel = () => {
    // Go back to shows tab in super-admin dashboard
    router.push("/super-admin?tab=shows");
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedShowCreation
        onShowCreated={handleShowCreated}
        onCancel={handleCancel}
      />
    </div>
  );
}
