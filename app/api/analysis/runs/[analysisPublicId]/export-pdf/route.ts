import { NextResponse } from "next/server";
import { proxyRequest } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ analysisPublicId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/analysis-runs/${resolvedParams.analysisPublicId}/export-pdf`, { method: "GET" });
    
    if (!res.ok) {
        return NextResponse.json({ success: false, error: { message: "Failed to export PDF" } }, { status: res.status });
    }

    return new NextResponse(res.body, {
        status: res.status,
        headers: {
            "Content-Type": res.headers.get("Content-Type") || "application/pdf",
            "Content-Disposition": res.headers.get("Content-Disposition") || `attachment; filename="Analysis_Report_${resolvedParams.analysisPublicId}.pdf"`,
        }
    });
  } catch (error) {
    console.error("PDF Export proxy error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
