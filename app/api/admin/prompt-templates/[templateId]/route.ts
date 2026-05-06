import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}`, { method: "GET" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Template GET error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Template PATCH error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/prompt-templates/${resolvedParams.templateId}`, { method: "DELETE" });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Prompt Template DELETE error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
