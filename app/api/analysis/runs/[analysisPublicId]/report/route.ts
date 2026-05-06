import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ analysisPublicId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/analysis-runs/${resolvedParams.analysisPublicId}/report`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Analysis Run Report BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
