import { NextResponse } from "next/server";
import { proxyRequest, forwardResponse } from "@/lib/backend-proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const res = await proxyRequest(`/admin/provider-configs/${resolvedParams.configId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Provider Config PATCH error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await proxyRequest(`/admin/provider-configs/${resolvedParams.configId}`, {
      method: "DELETE",
    });
    return await forwardResponse(res);
  } catch (error) {
    console.error("Admin Provider Config DELETE error:", error);
    return NextResponse.json({ success: false, error: { message: "Internal server error" } }, { status: 500 });
  }
}
