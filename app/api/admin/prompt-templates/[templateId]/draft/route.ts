import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}/draft`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Draft PATCH error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
