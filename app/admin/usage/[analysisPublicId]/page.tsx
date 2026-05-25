import { Metadata } from "next";
import { AdminRunAuditClient } from "./admin-run-audit-client";

export const metadata: Metadata = {
  title: "Run Audit Trace | Cubiconia BI",
};

export default async function AdminRunAuditPage({
  params,
}: {
  params: Promise<{ analysisPublicId: string }>;
}) {
  const { analysisPublicId } = await params;

  return (
    <div className="mx-auto w-full px-4 py-8">
      <AdminRunAuditClient analysisPublicId={analysisPublicId} />
    </div>
  );
}
