import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ credId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/admin/provider-credentials/${resolvedParams.credId}/disable`, {
      method: "POST"
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Provider Credentials Disable POST error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
