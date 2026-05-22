import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string; versionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const res = await proxyRequest(
      `/prompt-templates/${resolvedParams.templateId}/versions/${resolvedParams.versionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Version PATCH error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ templateId: string; versionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(
      `/prompt-templates/${resolvedParams.templateId}/versions/${resolvedParams.versionId}`,
      { method: "DELETE" }
    );
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Version DELETE error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
