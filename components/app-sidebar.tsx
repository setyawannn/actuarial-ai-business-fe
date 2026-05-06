"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookTemplateIcon,
  Building2Icon,
  Clock3Icon,
  FileChartColumnIncreasingIcon,
  LayoutDashboardIcon,
  SearchIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { useMeQuery } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Cubiconia Team",
    email: "workspace@cubiconia.ai",
    avatar: "",
  },
  teams: [
    {
      name: "Cubiconia BI",
      logo: <Building2Icon />,
      plan: "Business Intelligence",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      match: ["/dashboard"],
    },
    {
      title: "Analysis",
      url: "/analysis/new",
      icon: <FileChartColumnIncreasingIcon />,
      match: ["/analysis"],
      items: [
        { title: "New Run", url: "/analysis/new" },
        { title: "History", url: "/analysis/history" },
        { title: "Sample Detail", url: "/analysis/anl_demo" },
      ],
    },
    {
      title: "Admin",
      url: "/admin/prompts",
      icon: <ShieldCheckIcon />,
      match: ["/admin"],
      items: [
        { title: "Prompts", url: "/admin/prompts" },
        { title: "Providers", url: "/admin/providers" },
      ],
    },
  ],
  shortcuts: [
    {
      title: "Recent Runs",
      url: "/analysis/history",
      icon: <Clock3Icon />,
    },
    {
      title: "Prompt Library",
      url: "/admin/prompts",
      icon: <BookTemplateIcon />,
    },
    {
      title: "Workspace Settings",
      url: "/admin/providers",
      icon: <Settings2Icon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: meData } = useMeQuery();

  const user = meData
    ? {
        name: meData.name || meData.email,
        email: meData.email,
        avatar: "",
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <div className="px-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <SidebarInput placeholder="Search workspace" className="pl-9" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
        <SidebarSeparator />
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 p-4 text-sm">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <SparklesIcon className="size-4" />
              <span className="font-medium">Module 02 active</span>
            </div>
            <p className="mt-2 leading-6 text-sidebar-foreground/70">
              Shell, route groups, dan state UI dasar sudah dipasang untuk workflow berikutnya.
            </p>
          </div>
        </div>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
          <SidebarMenu>
            {data.shortcuts.map((item) => {
              const active = pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
