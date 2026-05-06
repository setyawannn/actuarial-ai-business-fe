import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <div className="flex flex-1 flex-col px-4 py-5 lg:px-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
