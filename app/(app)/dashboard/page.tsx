import { ArrowRightIcon, FileChartColumnIncreasingIcon, ShieldCheckIcon, WorkflowIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const metrics = [
  {
    label: "App shell",
    value: "Ready",
    note: "Sidebar, top nav, dan route grouping aktif.",
    icon: <WorkflowIcon className="size-4" />,
  },
  {
    label: "Design state",
    value: "Prepared",
    note: "Loading, empty, error, unauthorized, dan not found tersedia.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    label: "Analysis flow",
    value: "Next",
    note: "Workspace siap menerima module form, result, dan history.",
    icon: <FileChartColumnIncreasingIcon className="size-4" />,
  },
];

const quickLinks = [
  { href: "/analysis/new", label: "Start analysis" },
  { href: "/analysis/history", label: "Open history" },
  { href: "/admin/prompts", label: "Prompt workspace" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational shell untuk Cubiconia Business Intelligence sudah siap. Area ini menjadi pintu masuk utama untuk workflow analysis dan admin."
        actions={
          <Button asChild>
            <Link href="/analysis/new">
              Start analysis
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-sm"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-sm">{item.label}</span>
                {item.icon}
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="text-sm leading-6 text-muted-foreground">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Next steps</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Shortcut cepat untuk area yang akan dipakai module analysis dan admin berikutnya.
            </p>
          </div>
          <div className="mt-5 space-y-2">
            {quickLinks.map((item) => (
              <Button key={item.href} asChild variant="outline" className="w-full justify-between">
                <Link href={item.href}>
                  {item.label}
                  <ArrowRightIcon />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
