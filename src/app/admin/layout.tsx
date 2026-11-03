import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The shell reads the current URL (active sidebar link, auth redirect), so it must sit
  // inside Suspense for admin pages with dynamic params (e.g. /admin/products/[id]).
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#ff5500]" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
