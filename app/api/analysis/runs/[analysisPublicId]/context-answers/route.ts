import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ analysisPublicId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    
    const res = await proxyRequest(`/analysis-runs/${resolvedParams.analysisPublicId}/context-answers`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    
    return await forwardResponse(res);
  } catch (error) {
    console.error("Submit Context Answers BFF error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
