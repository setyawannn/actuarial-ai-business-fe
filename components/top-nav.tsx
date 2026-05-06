"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, CommandIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  analysis: "Analysis",
  new: "New Run",
  history: "History",
  report: "Report",
  sources: "Sources",
  admin: "Admin",
  prompts: "Prompts",
  providers: "Providers",
  login: "Login",
};

function formatSegment(segment: string) {
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }

  if (segment.startsWith("anl_")) {
    return "Analysis Detail";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TopNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: formatSegment(segment),
  }));

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 self-auto md:block" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Link href="/dashboard" className="font-medium text-foreground">
              Cubiconia BI
            </Link>
            {breadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                <span className="text-muted-foreground/50">/</span>
                {index === breadcrumbs.length - 1 ? (
                  <span className="truncate text-foreground">{item.label}</span>
                ) : (
                  <Link href={item.href} className="truncate hover:text-foreground">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            <SearchIcon />
            Search
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <BellIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Shortcuts">
            <CommandIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
