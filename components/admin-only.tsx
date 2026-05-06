import * as React from "react";
import { UnauthorizedState } from "@/components/states";

export function AdminOnly({
  children,
  allowed = true,
}: {
  children: React.ReactNode;
  allowed?: boolean;
}) {
  if (!allowed) {
    return <UnauthorizedState />;
  }

  return <>{children}</>;
}
