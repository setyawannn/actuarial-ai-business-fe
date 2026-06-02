"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";
import { UnauthorizedState } from "@/components/states";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMeQuery();
  const isAdmin = data?.role === "admin" || data?.role === "super_admin";

  React.useEffect(() => {
    if (isError) {
      router.push("/login");
    } else if (data && !isAdmin) {
      // Silently bounce non-admins (stealth mode)
      if (window.history.length > 2) {
        router.back();
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isError, data, isAdmin, router]);

  // Don't show a global blocking loading spinner to avoid "dikit dikit loading"
  // Just return null if we are waiting or if we are about to bounce them.
  if (isLoading || (data && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
