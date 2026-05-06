import * as React from "react";
import { UnauthorizedState } from "@/components/states";

export function ProtectedPage({
  children,
  authorized = true,
}: {
  children: React.ReactNode;
  authorized?: boolean;
}) {
  if (!authorized) {
    return <UnauthorizedState />;
  }

  return <>{children}</>;
}
