"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";
import { UnauthorizedState } from "@/components/states";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMeQuery();

  React.useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  // Don't show a global blocking loading spinner to avoid "dikit dikit loading"
  // Just return null if we are waiting, so it's a seamless transition.
  if (isLoading) {
    return null;
  }

  if (data && data.role !== "admin") {
    return (
      <div className="p-6 md:p-10">
        <UnauthorizedState />
      </div>
    );
  }

  return <>{children}</>;
}
