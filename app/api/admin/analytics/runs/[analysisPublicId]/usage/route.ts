import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ analysisPublicId: string }> }
) {
  try {
    const { analysisPublicId } = await params;

    const res = await proxyRequest(`/admin/analytics/runs/${analysisPublicId}/usage`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Run Audit BFF error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
