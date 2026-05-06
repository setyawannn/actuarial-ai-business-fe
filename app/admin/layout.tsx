import * as React from "react";
import { AdminOnly } from "@/components/admin-only";
import { AppShell } from "@/components/app-shell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminOnly>
      <AppShell>{children}</AppShell>
    </AdminOnly>
  );
}
