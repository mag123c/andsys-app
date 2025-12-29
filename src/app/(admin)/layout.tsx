"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

const BYPASS_AUTH = false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAdmin, isLoading, isAuthenticated } = useAdmin();

  useEffect(() => {
    if (BYPASS_AUTH) return;
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    } else if (!isLoading && !isAdmin) {
      router.replace("/novels");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
