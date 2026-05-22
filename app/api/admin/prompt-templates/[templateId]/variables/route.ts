import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}/variables`, {
      method: "GET",
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Variables GET error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
