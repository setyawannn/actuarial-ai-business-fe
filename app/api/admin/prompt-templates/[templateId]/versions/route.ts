import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}/versions`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Template Versions POST error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
