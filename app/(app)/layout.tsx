import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedPage>
      <AppShell>{children}</AppShell>
    </ProtectedPage>
  );
}
