import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string; versionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(
      `/prompt-templates/${resolvedParams.templateId}/versions/${resolvedParams.versionId}/activate`,
      { method: "POST" }
    );
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Template Activate POST error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
