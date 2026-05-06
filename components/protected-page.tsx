"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/hooks/use-auth";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isError, error } = useMeQuery();

  React.useEffect(() => {
    // If the token exists (middleware passed) but backend rejects it (e.g. expired)
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  // We DO NOT show a loading state here because it causes the "loading dikit dikit" issue.
  // SSR (middleware) already validated the presence of the token.
  // We render the children immediately.
  return <>{children}</>;
}
